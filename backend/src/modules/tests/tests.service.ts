import { testsRepository } from './tests.repository.js'
import { questionsRepository } from '../questions/questions.repository.js'
import type {
  ApiTest,
  ApiQuestion,
  Paginated,
  ApiAnswerVerification,
  ApiAnswerResult,
} from '../../types/domain.js'
import type { ListTestsQuery, GetTestParams, AnswerSubmission } from '../../validators/tests.validator.js'
import type { QuestionType } from '../../types/domain.js'
import { ApiError } from '../../utils/httpErrors.js'

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false
  for (const value of a) {
    if (!b.has(value)) return false
  }
  return true
}

export const testsService = {
  async list(query: ListTestsQuery): Promise<Paginated<ApiTest>> {
    return testsRepository.findMany({
      category: query.category,
      difficulty: query.difficulty,
      tag: query.tag,
      featured: query.featured,
      sort: query.sort,
      limit: query.limit,
      offset: query.offset,
    })
  },

  async getBySlug(params: GetTestParams): Promise<ApiTest> {
    const test = await testsRepository.findBySlug(params.slug)
    if (!test) throw ApiError.notFound('Test', 'TEST_NOT_FOUND')
    return test
  },

  async getFeatured(limit = 6): Promise<ApiTest[]> {
    return testsRepository.findFeatured(limit)
  },

  async getRelated(slug: string, limit = 3): Promise<ApiTest[]> {
    return testsRepository.findRelated(slug, limit)
  },

  async getQuestionsForTest(
    slug: string,
    type?: QuestionType,
  ): Promise<{ test: ApiTest; questions: ApiQuestion[] }> {
    const test = await testsRepository.findBySlug(slug)
    if (!test) throw ApiError.notFound('Test', 'TEST_NOT_FOUND')
    const questions = await questionsRepository.findByTestId(test.id, type)
    return { test, questions }
  },

  // Public, post-submission answer verification. Correct option ids are returned
  // here (the reveal) but are NEVER present in GET question-delivery payloads.
  // Stateless: nothing about the attempt is persisted, so there is no anonymous
  // user history and no account is required.
  async verifyAnswers(slug: string, submission: AnswerSubmission): Promise<ApiAnswerVerification> {
    const test = await testsRepository.findBySlug(slug)
    if (!test) throw ApiError.notFound('Test', 'TEST_NOT_FOUND')

    const raw = await questionsRepository.findRawByTestId(test.id)
    const byId = new Map(raw.map((q) => [q.id, q]))

    let total = 0
    let earned = 0
    const results: ApiAnswerResult[] = submission.answers.map((answer) => {
      const question = byId.get(answer.questionId)
      if (!question) {
        return {
          questionId: answer.questionId,
          correct: false,
          correctOptionIds: [],
          points: 0,
          earnedPoints: 0,
          invalid: true,
        }
      }
      const correctOptionIds = question.options.filter((o) => o.isCorrect).map((o) => o.id)
      const correct = setsEqual(new Set(answer.optionIds), new Set(correctOptionIds))
      const points = question.points
      const earnedPoints = correct ? points : 0
      total += points
      earned += earnedPoints
      return {
        questionId: answer.questionId,
        correct,
        correctOptionIds,
        points,
        earnedPoints,
      }
    })

    // Stateless aggregates by topic and difficulty, computed from the submitted
    // answers plus question metadata. Also counts unanswered questions so the
    // client can render correct/incorrect/unanswered without any identity.
    const topicAgg = new Map<string, { total: number; correct: number }>()
    const difficultyAgg = new Map<string, { total: number; correct: number }>()
    for (const q of raw) {
      const topic = q.topic?.name ?? 'Uncategorized'
      const difficulty = q.difficulty
      const t = topicAgg.get(topic) ?? { total: 0, correct: 0 }
      t.total += 1
      topicAgg.set(topic, t)
      const d = difficultyAgg.get(difficulty) ?? { total: 0, correct: 0 }
      d.total += 1
      difficultyAgg.set(difficulty, d)
    }
    for (const answer of submission.answers) {
      const q = byId.get(answer.questionId)
      if (!q) continue
      const correctOptionIds = q.options.filter((o) => o.isCorrect).map((o) => o.id)
      if (setsEqual(new Set(answer.optionIds), new Set(correctOptionIds))) {
        topicAgg.get(q.topic?.name ?? 'Uncategorized')!.correct += 1
        difficultyAgg.get(q.difficulty)!.correct += 1
      }
    }

    const buildPerf = (agg: Map<string, { total: number; correct: number }>) =>
      Object.fromEntries(
        [...agg].map(([key, v]) => [
          key,
          { total: v.total, correct: v.correct, accuracy: v.total ? Math.round((v.correct / v.total) * 100) : 0 },
        ]),
      )

    const percentage = total === 0 ? 0 : Math.round((earned / total) * 100)
    const validAnswered = submission.answers.filter((a) => byId.has(a.questionId)).length
    return {
      testId: test.id,
      slug: test.slug,
      results,
      score: { total, earned, percentage },
      answeredCount: submission.answers.length,
      unanswered: raw.length - validAnswered,
      topicPerformance: buildPerf(topicAgg),
      difficultyPerformance: buildPerf(difficultyAgg),
    }
  },
}
