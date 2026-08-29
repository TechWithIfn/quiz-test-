import type { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { prisma as defaultPrisma } from '../db/client.js'
import { buildImportPlan } from './plan.js'
import type { ImportPlan } from './plan.js'
import { validateContentDir, type ValidationResult } from './validate.js'

type Tx = PrismaClient

// Apply a validated plan inside a single transaction. Every write is idempotent
// (upsert + replace child rows), so re-running the import converges to the same
// state and never partially corrupts the database. Atomicity guarantees that a
// failure at any step rolls back the whole batch.
export async function applyImportPlan(prisma: Tx, plan: ImportPlan): Promise<void> {
  const ops: Prisma.PrismaPromise<unknown>[] = []

  for (const c of plan.categories) {
    ops.push(
      prisma.category.upsert({
        where: { id: c.id },
        create: c,
        update: {
          slug: c.slug,
          name: c.name,
          description: c.description,
          icon: c.icon,
          color: c.color,
        },
      }),
    )
  }

  for (const t of plan.tags) {
    ops.push(
      prisma.tag.upsert({
        where: { id: t.id },
        create: t,
        update: { slug: t.slug, name: t.name },
      }),
    )
  }

  for (const t of plan.topics) {
    ops.push(
      prisma.topic.upsert({
        where: { id: t.id },
        create: t,
        update: { slug: t.slug, name: t.name, description: t.description, categoryId: t.categoryId },
      }),
    )
  }

  for (const q of plan.questions) {
    ops.push(
      prisma.question.upsert({
        where: { id: q.id },
        create: {
          id: q.id,
          question: q.question,
          questionType: q.questionType,
          explanation: q.explanation,
          difficulty: q.difficulty,
          topicId: q.topicId,
          points: q.points,
          version: q.version,
          status: q.status,
          concept: q.concept,
          codeSnippet: q.codeSnippet,
          codeLanguage: q.codeLanguage,
        },
        update: {
          question: q.question,
          questionType: q.questionType,
          explanation: q.explanation,
          difficulty: q.difficulty,
          topicId: q.topicId,
          points: q.points,
          version: q.version,
          status: q.status,
          concept: q.concept,
          codeSnippet: q.codeSnippet,
          codeLanguage: q.codeLanguage,
        },
      }),
    )
    ops.push(prisma.option.deleteMany({ where: { questionId: q.id } }))
    ops.push(
      prisma.option.createMany({
        data: q.options.map((o) => ({
          id: o.id,
          questionId: q.id,
          optionText: o.text,
          optionOrder: 0,
          isCorrect: o.isCorrect,
          codeSnippet: o.codeSnippet,
        })),
      }),
    )
    ops.push(prisma.questionTag.deleteMany({ where: { questionId: q.id } }))
    if (q.tags.length > 0) {
      ops.push(
        prisma.questionTag.createMany({
          data: q.tags.map((slug) => ({ questionId: q.id, tagId: `tag_${slug}` })),
        }),
      )
    }
  }

  for (const t of plan.tests) {
    ops.push(
      prisma.test.upsert({
        where: { id: t.id },
        create: {
          id: t.id,
          slug: t.slug,
          title: t.title,
          shortDescription: t.shortDescription,
          description: t.description,
          difficulty: t.difficulty,
          status: t.status,
          version: t.version,
          estimatedTime: t.estimatedTime,
          featured: t.featured,
          language: t.language,
          passingScorePercentage: t.passingScorePercentage,
          seoTitle: t.seoTitle,
          seoDescription: t.seoDescription,
          canonicalPath: t.canonicalPath,
          indexable: t.indexable,
          publishedAt: t.publishedAt,
          categoryId: t.categoryId,
        },
        update: {
          slug: t.slug,
          title: t.title,
          shortDescription: t.shortDescription,
          description: t.description,
          difficulty: t.difficulty,
          status: t.status,
          version: t.version,
          estimatedTime: t.estimatedTime,
          featured: t.featured,
          language: t.language,
          passingScorePercentage: t.passingScorePercentage,
          seoTitle: t.seoTitle,
          seoDescription: t.seoDescription,
          canonicalPath: t.canonicalPath,
          indexable: t.indexable,
          publishedAt: t.publishedAt,
          categoryId: t.categoryId,
        },
      }),
    )
    ops.push(prisma.testQuestion.deleteMany({ where: { testId: t.id } }))
    ops.push(
      prisma.testQuestion.createMany({
        data: t.questionIds.map((link) => ({
          testId: t.id,
          questionId: link.questionId,
          questionOrder: link.order,
        })),
      }),
    )
    ops.push(prisma.testTag.deleteMany({ where: { testId: t.id } }))
    if (t.tags.length > 0) {
      ops.push(
        prisma.testTag.createMany({
          data: t.tags.map((slug) => ({ testId: t.id, tagId: `tag_${slug}` })),
        }),
      )
    }
  }

  await prisma.$transaction(ops)
}

export interface ImportOutcome extends ValidationResult {
  imported?: { categories: number; tags: number; topics: number; questions: number; tests: number }
}

// Orchestrate: validate (fail-safe, no DB) -> build plan -> transactional import.
export async function importContentFromDir(
  rootDir: string,
  prisma: Tx = defaultPrisma,
): Promise<ImportOutcome> {
  const result = validateContentDir(rootDir)
  if (!result.valid || !result.entities) {
    return { valid: false, issues: result.issues }
  }

  const plan = buildImportPlan(result.entities)
  await applyImportPlan(prisma, plan)

  return {
    valid: true,
    issues: [],
    imported: {
      categories: plan.categories.length,
      tags: plan.tags.length,
      topics: plan.topics.length,
      questions: plan.questions.length,
      tests: plan.tests.length,
    },
  }
}
