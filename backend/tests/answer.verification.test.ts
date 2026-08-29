import { describe, it, expect, vi } from 'vitest'

import { testsService } from '../src/modules/tests/tests.service.js'
import { testsRepository } from '../src/modules/tests/tests.repository.js'
import { questionsRepository } from '../src/modules/questions/questions.repository.js'
import { toApiQuestion } from '../src/utils/mappers.js'
import type { QuestionWithRelations } from '../src/utils/mappers.js'

// Mock only the repositories; the real service logic (answer verification and
// the answer-leak prevention in the mapper) is exercised without a database.
vi.mock('../src/modules/tests/tests.repository.js', () => ({
  testsRepository: {
    findMany: vi.fn(),
    findBySlug: vi.fn(),
    findFeatured: vi.fn(),
    findRelated: vi.fn(),
  },
}))
vi.mock('../src/modules/questions/questions.repository.js', () => ({
  questionsRepository: {
    findByTestId: vi.fn(),
    findByTopicSlug: vi.fn(),
    findRawByTestId: vi.fn(),
  },
}))

const rawQuestion = (id: string, points: number, correctOptionIds: string[]) => ({
  id,
  question: `Question ${id}`,
  questionType: 'SINGLE_CHOICE' as const,
  explanation: 'Because.',
  difficulty: 'beginner' as const,
  topicId: 'tp1',
  points,
  options: [
    { id: 'o1', optionText: 'a', optionOrder: 0, isCorrect: correctOptionIds.includes('o1') },
    { id: 'o2', optionText: 'b', optionOrder: 1, isCorrect: correctOptionIds.includes('o2') },
  ],
  topic: { id: 'tp1', slug: 'numbers', name: 'Numbers' },
  questionTags: [],
  testQuestions: [{ testId: 't1' }],
})

describe('answer verification (real logic)', () => {
  it('never exposes correct answers in question delivery', () => {
    const delivered = toApiQuestion(
      rawQuestion('q1', 1, ['o1']) as unknown as QuestionWithRelations,
    )
    expect(delivered.options).toEqual([{ id: 'o1', text: 'a' }, { id: 'o2', text: 'b' }])
    for (const opt of delivered.options) {
      expect(opt).not.toHaveProperty('isCorrect')
      expect(opt).not.toHaveProperty('correctOptionId')
    }
  })

  it('computes per-question correctness and the overall score', async () => {
    vi.mocked(testsRepository.findBySlug).mockResolvedValue({
      id: 't1',
      slug: 'demo-quick-think',
    } as never)
    vi.mocked(questionsRepository.findRawByTestId).mockResolvedValue([
      rawQuestion('q1', 2, ['o1']) as never, // single correct option
      rawQuestion('q2', 1, ['o3', 'o4']) as never, // two correct options
    ] as never)

    const result = await testsService.verifyAnswers('demo-quick-think', {
      answers: [
        { questionId: 'q1', optionIds: ['o1'] }, // correct
        { questionId: 'q2', optionIds: ['o3'] }, // only one of two -> wrong
        { questionId: 'qX', optionIds: ['o9'] }, // not part of this test
      ],
    })

    expect(result.results[0]).toMatchObject({ questionId: 'q1', correct: true, earnedPoints: 2 })
    expect(result.results[1]).toMatchObject({ questionId: 'q2', correct: false, earnedPoints: 0 })
    expect(result.results[2].invalid).toBe(true)
    // total = 2 + 1 + 0 = 3, earned = 2 -> 67%
    expect(result.score).toEqual({ total: 3, earned: 2, percentage: 67 })
    // Stateless result aggregates: both questions are topic "Numbers"/beginner,
    // only q1 is correct -> 50% accuracy; nothing skipped -> unanswered 0.
    expect(result.unanswered).toBe(0)
    expect(result.topicPerformance).toEqual({
      Numbers: { total: 2, correct: 1, accuracy: 50 },
    })
    expect(result.difficultyPerformance).toEqual({
      beginner: { total: 2, correct: 1, accuracy: 50 },
    })
  })

  it('counts unanswered questions (skipped/timeout) in the aggregates', async () => {
    vi.mocked(testsRepository.findBySlug).mockResolvedValue({ id: 't1', slug: 'demo' } as never)
    vi.mocked(questionsRepository.findRawByTestId).mockResolvedValue([
      rawQuestion('q1', 2, ['o1']) as never,
      rawQuestion('q2', 1, ['o3', 'o4']) as never,
    ] as never)

    // Only q1 is submitted; q2 is skipped.
    const result = await testsService.verifyAnswers('demo', {
      answers: [{ questionId: 'q1', optionIds: ['o1'] }],
    })
    expect(result.answeredCount).toBe(1)
    expect(result.unanswered).toBe(1)
    expect(result.topicPerformance.Numbers).toEqual({ total: 2, correct: 1, accuracy: 50 })
  })

  it('returns the correct option ids only in the post-submission reveal', async () => {
    vi.mocked(testsRepository.findBySlug).mockResolvedValue({ id: 't1', slug: 'demo' } as never)
    vi.mocked(questionsRepository.findRawByTestId).mockResolvedValue([
      rawQuestion('q1', 1, ['o1']) as never,
    ] as never)

    const result = await testsService.verifyAnswers('demo', {
      answers: [{ questionId: 'q1', optionIds: ['o1'] }],
    })
    // The reveal path is allowed to include correctOptionIds; delivery never does.
    expect(result.results[0].correctOptionIds).toEqual(['o1'])
  })
})
