import { prisma } from '../../db/client.js'
import type { ApiTest, ApiTopic, ApiQuestion } from '../../types/domain.js'
import { toApiTopic, toApiTest, toApiQuestion, testInclude, questionInclude } from '../../utils/mappers.js'

export const topicsRepository = {
  async listAll(): Promise<ApiTopic[]> {
    const links = await prisma.testQuestion.findMany({
      where: { test: { status: 'published' }, question: { topicId: { not: null } } },
      select: { testId: true, question: { select: { topicId: true } } },
    })

    const agg = new Map<string, { testIds: Set<string>; questionCount: number }>()
    for (const link of links) {
      const topicId = link.question.topicId
      if (!topicId) continue
      const entry = agg.get(topicId) ?? { testIds: new Set<string>(), questionCount: 0 }
      entry.testIds.add(link.testId)
      entry.questionCount += 1
      agg.set(topicId, entry)
    }

    const topicRows = await prisma.topic.findMany({
      where: { id: { in: Array.from(agg.keys()) }, status: 'published' },
      include: { category: true },
      orderBy: { name: 'asc' },
    })

    return topicRows.map((topicRow) => {
      const a = agg.get(topicRow.id)!
      return toApiTopic(
        topicRow,
        { questionCount: a.questionCount, testCount: a.testIds.size },
        topicRow.category ?? undefined,
      )
    })
  },

  async getBySlug(slug: string, limit = 50): Promise<{
    topic: ApiTopic | null
    tests: ApiTest[]
    questions: ApiQuestion[]
  }> {
    const topicRow = await prisma.topic.findUnique({
      where: { slug, status: 'published' },
      include: { category: true },
    })
    if (!topicRow) return { topic: null, tests: [], questions: [] }

    const questions = await prisma.question.findMany({
      where: {
        status: 'published',
        topicId: topicRow.id,
        testQuestions: { some: { test: { status: 'published' } } },
      },
      include: questionInclude,
      take: limit,
      orderBy: { id: 'asc' },
    })

    const testLinks = await prisma.testQuestion.findMany({
      where: { test: { status: 'published' }, question: { topicId: topicRow.id } },
      select: { testId: true },
      distinct: ['testId'],
    })
    const testIds = testLinks.map((link) => link.testId)
    const testRows =
      testIds.length > 0
        ? await prisma.test.findMany({
            where: { id: { in: testIds } },
            include: testInclude,
          })
        : []

    const topic: ApiTopic = toApiTopic(
      topicRow,
      { questionCount: questions.length, testCount: testIds.length },
      topicRow.category ?? undefined,
    )

    return {
      topic,
      tests: testRows.map(toApiTest),
      questions: questions.map(toApiQuestion),
    }
  },
}
