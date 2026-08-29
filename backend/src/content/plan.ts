import { toDbQuestionType } from './schema.js'
import type { ParsedEntities } from './validate.js'
import type { CategoryFile, TopicFile, QuestionFile, TestFile } from './schema.js'

export interface PlanCategory {
  id: string
  slug: string
  name: string
  description?: string
  icon?: string
  color?: string
}

export interface PlanTag {
  id: string
  slug: string
  name: string
}

export interface PlanTopic {
  id: string
  slug: string
  name: string
  description?: string
  categoryId: string
}

export interface PlanOption {
  id: string
  text: string
  isCorrect: boolean
  codeSnippet?: string
}

export interface PlanQuestion {
  id: string
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'CODE_SNIPPET'
  question: string
  explanation: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  topicId: string
  points: number
  version: string
  status: 'draft' | 'review' | 'published' | 'archived'
  concept?: string
  codeSnippet?: string
  codeLanguage?: string
  options: PlanOption[]
  tags: string[]
}

export interface PlanTestQuestionLink {
  questionId: string
  order: number
}

export interface PlanTest {
  id: string
  slug: string
  title: string
  shortDescription: string
  description?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  status: 'draft' | 'review' | 'published' | 'archived'
  version: string
  estimatedTime: number
  featured: boolean
  language: string
  passingScorePercentage: number
  seoTitle?: string
  seoDescription?: string
  canonicalPath?: string
  indexable: boolean
  categoryId: string
  publishedAt: Date | null
  questionIds: PlanTestQuestionLink[]
  tags: string[]
}

export interface ImportPlan {
  categories: PlanCategory[]
  tags: PlanTag[]
  topics: PlanTopic[]
  questions: PlanQuestion[]
  tests: PlanTest[]
}

function humanize(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

// Translate validated content entities into a DB-ready, idempotent import plan.
// Ids from content files become primary keys; option ids are namespaced to keep
// them globally unique; tag ids are derived from their slug.
export function buildImportPlan(entities: ParsedEntities): ImportPlan {
  const categorySlugToId = new Map<string, string>()
  for (const c of entities.categories) categorySlugToId.set(c.slug, c.id)

  const topicSlugToId = new Map<string, string>()
  for (const t of entities.topics) topicSlugToId.set(t.slug, t.id)

  const tagSlugs = new Set<string>()
  for (const t of entities.tests) for (const tag of t.tags) tagSlugs.add(tag)
  for (const q of entities.questions) for (const tag of q.tags) tagSlugs.add(tag)

  const categories: PlanCategory[] = entities.categories.map((c: CategoryFile) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    ...(c.description ? { description: c.description } : {}),
    ...(c.icon ? { icon: c.icon } : {}),
    ...(c.color ? { color: c.color } : {}),
  }))

  const tags: PlanTag[] = [...tagSlugs].map((slug) => ({
    id: `tag_${slug}`,
    slug,
    name: humanize(slug),
  }))

  const topics: PlanTopic[] = entities.topics.map((t: TopicFile) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    ...(t.description ? { description: t.description } : {}),
    categoryId: categorySlugToId.get(t.categorySlug) ?? t.categorySlug,
  }))

  const questions: PlanQuestion[] = entities.questions.map((q: QuestionFile) => ({
    id: q.id,
    questionType: toDbQuestionType(q.type),
    question: q.question,
    explanation: q.explanation,
    difficulty: q.difficulty,
    topicId: topicSlugToId.get(q.topicSlug) ?? q.topicSlug,
    points: q.points,
    version: '1.0.0',
    status: 'published',
    ...(q.concept ? { concept: q.concept } : {}),
    ...(q.codeSnippet ? { codeSnippet: q.codeSnippet } : {}),
    ...(q.codeLanguage ? { codeLanguage: q.codeLanguage } : {}),
    options: q.options.map((o) => ({
      id: `${q.id}__${o.id}`,
      text: o.text,
      isCorrect: o.correct,
      ...(o.codeSnippet ? { codeSnippet: o.codeSnippet } : {}),
    })),
    tags: q.tags,
  }))

  const tests: PlanTest[] = entities.tests.map((t: TestFile) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    shortDescription: t.shortDescription,
    ...(t.description ? { description: t.description } : {}),
    difficulty: t.difficulty,
    status: t.status,
    version: t.version,
    estimatedTime: t.estimatedMinutes,
    featured: t.featured,
    language: t.language,
    passingScorePercentage: t.passingScorePercentage,
    ...(t.seoTitle ? { seoTitle: t.seoTitle } : {}),
    ...(t.seoDescription ? { seoDescription: t.seoDescription } : {}),
    ...(t.canonicalPath ? { canonicalPath: t.canonicalPath } : {}),
    indexable: true,
    categoryId: categorySlugToId.get(t.categorySlug) ?? t.categorySlug,
    publishedAt: t.status === 'published' ? new Date() : null,
    questionIds: t.questionIds.map((qid, i) => ({ questionId: qid, order: i })),
    tags: t.tags,
  }))

  return { categories, tags, topics, questions, tests }
}
