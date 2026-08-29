import { prisma } from '../../db/client.js'
import type { ApiQuestion } from '../../types/domain.js'
import { toApiQuestion, questionInclude, toDbQuestionType } from '../../utils/mappers.js'
import type { QuestionWithRelations } from '../../utils/mappers.js'
import type { QuestionType } from '../../types/domain.js'
import type { Prisma } from '@prisma/client'

export const questionsRepository = {
  // Public question delivery — `isCorrect` is intentionally excluded by the mapper.
  async findByTestId(testId: string, type?: QuestionType): Promise<ApiQuestion[]> {
    const where: Prisma.TestQuestionWhereInput = {
      testId,
      test: { status: 'published' },
      question: { status: 'published', ...(type ? { questionType: toDbQuestionType(type) } : {}) },
    }
    const links = await prisma.testQuestion.findMany({
      where,
      orderBy: { questionOrder: 'asc' },
      include: { question: { include: questionInclude } },
    })
    return links.map((link) => toApiQuestion(link.question))
  },

  async findByTopicSlug(topicSlug: string, limit = 50): Promise<ApiQuestion[]> {
    const rows = await prisma.question.findMany({
      where: {
        status: 'published',
        topic: { slug: topicSlug },
        testQuestions: { some: { test: { status: 'published' } } },
      },
      orderBy: { id: 'asc' },
      take: limit,
      include: questionInclude,
    })
    return rows.map(toApiQuestion)
  },

  // Raw questions (with the correct-answer flag) for post-submission verification.
  // Not used by any GET delivery endpoint.
  async findRawByTestId(testId: string): Promise<QuestionWithRelations[]> {
    const links = await prisma.testQuestion.findMany({
      where: { testId, test: { status: 'published' }, question: { status: 'published' } },
      include: { question: { include: questionInclude } },
    })
    return links.map((link) => link.question)
  },
}
