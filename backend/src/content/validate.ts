import { z } from 'zod'
import { loadContentDir, type LoadedRaw, type RawFile } from './loader.js'
import {
  categoryFileSchema,
  topicFileSchema,
  questionFileSchema,
  testFileSchema,
  type CategoryFile,
  type TopicFile,
  type QuestionFile,
  type TestFile,
} from './schema.js'

export interface ValidationIssue {
  code: string
  message: string
  file?: string
  entityId?: string
}

export interface ParsedEntities {
  categories: CategoryFile[]
  topics: TopicFile[]
  questions: QuestionFile[]
  tests: TestFile[]
}

export interface ValidationResult {
  valid: boolean
  issues: ValidationIssue[]
  entities?: ParsedEntities
}

function parseFiles(
  files: RawFile[],
  schema: z.ZodType<unknown>,
  label: string,
): { ok: unknown[]; issues: ValidationIssue[] } {
  const ok: unknown[] = []
  const issues: ValidationIssue[] = []
  for (const f of files) {
    const res = schema.safeParse(f.data)
    if (!res.success) {
      const first = res.error.issues[0]
      issues.push({
        code: 'SCHEMA_ERROR',
        message: `${label} invalid: ${first.path.join('.') || '(root)'} ${first.message}`,
        file: f.path,
      })
    } else {
      ok.push(res.data)
    }
  }
  return { ok, issues }
}

// Cross-file safety checks. These run only on schema-valid entities and detect
// problems that a single file cannot (duplicates, broken references, bad answers).
export function crossValidate(entities: ParsedEntities): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // 1. Duplicate IDs (globally unique across all content).
  const idCount = new Map<string, number>()
  const bump = (id: string) => idCount.set(id, (idCount.get(id) ?? 0) + 1)
  for (const c of entities.categories) bump(c.id)
  for (const t of entities.topics) bump(t.id)
  for (const q of entities.questions) bump(q.id)
  for (const t of entities.tests) bump(t.id)
  for (const [id, count] of idCount) {
    if (count > 1) issues.push({ code: 'DUPLICATE_ID', message: `Duplicate id "${id}"`, entityId: id })
  }

  // 2. Duplicate slugs (unique within each type).
  const slugCheck = (items: Array<{ slug: string; id: string }>, label: string) => {
    const seen = new Map<string, string>()
    for (const item of items) {
      const prev = seen.get(item.slug)
      if (prev) {
        issues.push({
          code: 'DUPLICATE_SLUG',
          message: `Duplicate ${label} slug "${item.slug}" (${prev}, ${item.id})`,
          entityId: item.id,
        })
      } else {
        seen.set(item.slug, item.id)
      }
    }
  }
  slugCheck(entities.categories, 'category')
  slugCheck(entities.topics, 'topic')
  slugCheck(entities.tests, 'test')

  // 3. Duplicate questions (identical question text).
  const qText = new Map<string, string[]>()
  for (const q of entities.questions) {
    const key = q.question.trim().toLowerCase()
    const list = qText.get(key) ?? []
    list.push(q.id)
    qText.set(key, list)
  }
  for (const [text, ids] of qText) {
    if (ids.length > 1) {
      issues.push({
        code: 'DUPLICATE_QUESTION',
        message: `Duplicate question text: "${text.slice(0, 40)}..." (${ids.join(', ')})`,
        entityId: ids[0],
      })
    }
  }

  const categorySlugs = new Set(entities.categories.map((c) => c.slug))
  const topicSlugs = new Set(entities.topics.map((t) => t.slug))
  const questionIds = new Set(entities.questions.map((q) => q.id))

  // 4. Invalid references.
  for (const t of entities.tests) {
    if (!categorySlugs.has(t.categorySlug)) {
      issues.push({
        code: 'INVALID_REFERENCE',
        message: `Test "${t.id}" references unknown category "${t.categorySlug}"`,
        entityId: t.id,
      })
    }
    const seenQ = new Set<string>()
    for (const qid of t.questionIds) {
      if (!questionIds.has(qid)) {
        issues.push({
          code: 'INVALID_REFERENCE',
          message: `Test "${t.id}" references unknown question "${qid}"`,
          entityId: t.id,
        })
      }
      if (seenQ.has(qid)) {
        issues.push({
          code: 'INVALID_REFERENCE',
          message: `Test "${t.id}" lists question "${qid}" more than once`,
          entityId: t.id,
        })
      }
      seenQ.add(qid)
    }
  }
  for (const q of entities.questions) {
    if (!topicSlugs.has(q.topicSlug)) {
      issues.push({
        code: 'INVALID_REFERENCE',
        message: `Question "${q.id}" references unknown topic "${q.topicSlug}"`,
        entityId: q.id,
      })
    }
  }
  for (const t of entities.topics) {
    if (!categorySlugs.has(t.categorySlug)) {
      issues.push({
        code: 'INVALID_REFERENCE',
        message: `Topic "${t.id}" references unknown category "${t.categorySlug}"`,
        entityId: t.id,
      })
    }
  }

  // 5. Missing options & 6. invalid answers.
  for (const q of entities.questions) {
    if (q.type !== 'code-snippet' && q.options.length < 2) {
      issues.push({
        code: 'MISSING_OPTIONS',
        message: `Question "${q.id}" (${q.type}) needs at least 2 options`,
        entityId: q.id,
      })
    }
    const optIds = new Set<string>()
    let correct = 0
    for (const o of q.options) {
      if (optIds.has(o.id)) {
        issues.push({
          code: 'INVALID_ANSWER',
          message: `Question "${q.id}" has duplicate option id "${o.id}"`,
          entityId: q.id,
        })
      }
      optIds.add(o.id)
      if (o.correct) correct += 1
    }
    if (q.type === 'single-choice' && correct !== 1) {
      issues.push({
        code: 'INVALID_ANSWER',
        message: `Single-choice question "${q.id}" must have exactly 1 correct option (found ${correct})`,
        entityId: q.id,
      })
    }
    if (q.type === 'multiple-choice' && correct < 1) {
      issues.push({
        code: 'INVALID_ANSWER',
        message: `Multiple-choice question "${q.id}" must have at least 1 correct option`,
        entityId: q.id,
      })
    }
  }

  return issues
}

export function validateLoaded(raw: LoadedRaw): ValidationResult {
  const cat = parseFiles(raw.categories, categoryFileSchema, 'category')
  const top = parseFiles(raw.topics, topicFileSchema, 'topic')
  const que = parseFiles(raw.questions, questionFileSchema, 'question')
  const tst = parseFiles(raw.tests, testFileSchema, 'test')

  const entities: ParsedEntities = {
    categories: cat.ok as CategoryFile[],
    topics: top.ok as TopicFile[],
    questions: que.ok as QuestionFile[],
    tests: tst.ok as TestFile[],
  }

  const issues = [...cat.issues, ...top.issues, ...que.issues, ...tst.issues, ...crossValidate(entities)]
  return { valid: issues.length === 0, issues, entities }
}

export function validateContentDir(rootDir: string): ValidationResult {
  return validateLoaded(loadContentDir(rootDir))
}
