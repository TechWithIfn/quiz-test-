import type { PrismaClient } from '@prisma/client'

export interface IntegrityIssue {
  code: string
  message: string
}

export interface IntegrityReport {
  issues: IntegrityIssue[]
  counts: Record<string, number>
}

// Lightweight database integrity checks used by `content:check`. They verify
// that published content is internally consistent (no orphan options, no
// published test without questions, choice questions actually have options).
export async function checkDatabaseIntegrity(prisma: PrismaClient): Promise<IntegrityReport> {
  const issues: IntegrityIssue[] = []

  const [categories, tags, topics, questions, options, tests, testQuestions] = await Promise.all([
    prisma.category.count(),
    prisma.tag.count(),
    prisma.topic.count(),
    prisma.question.count(),
    prisma.option.count(),
    prisma.test.count(),
    prisma.testQuestion.count(),
  ])

  const choiceNoOptions = await prisma.question.findMany({
    where: { questionType: { in: ['SINGLE_CHOICE', 'MULTIPLE_CHOICE'] }, options: { none: {} } },
    select: { id: true },
  })
  for (const q of choiceNoOptions) {
    issues.push({ code: 'QUESTION_WITHOUT_OPTIONS', message: `Choice question ${q.id} has no options` })
  }

  const publishedNoQuestions = await prisma.test.findMany({
    where: { status: 'published', testQuestions: { none: {} } },
    select: { id: true },
  })
  for (const t of publishedNoQuestions) {
    issues.push({
      code: 'PUBLISHED_TEST_WITHOUT_QUESTIONS',
      message: `Published test ${t.id} has no questions`,
    })
  }

  return {
    issues,
    counts: { categories, tags, topics, questions, options, tests, testQuestions },
  }
}
