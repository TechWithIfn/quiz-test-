import { describe, expect, it } from 'vitest'
import { Question, Test, TestAttempt } from '@/types'
import { calculateTestResult } from '@/utils/scoring'
import { createAttempt, isComplete, tickAttempt } from '@/engine/quizEngine'
import { randomizeOptions, randomizeQuestions } from '@/engine/questionRandomizer'

const testItem: Test = {
  id: 'test-engine', slug: 'engine-test', title: 'Engine Test', shortDescription: 'Test', fullDescription: 'Test',
  category: { id: 'cat', name: 'Testing', slug: 'testing' }, tags: [], difficulty: 'beginner',
  timeLimitMinutes: 1, totalQuestions: 2, passingScorePercentage: 50, createdAt: '2025-01-01',
}

const questions: Question[] = [
  { id: 'q1', testId: testItem.id, text: 'One', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctOptionId: 'a', explanation: 'Because.', points: 1, tags: [], category: 'Testing', topic: 'Basics' },
  { id: 'q2', testId: testItem.id, text: 'Two', options: [{ id: 'c', text: 'C' }, { id: 'd', text: 'D' }], correctOptionId: 'd', explanation: 'Because.', points: 1, tags: [], category: 'Testing', topic: 'Basics' },
]

const baseAttempt: TestAttempt = {
  id: 'attempt', testId: testItem.id, testSlug: testItem.slug, testTitle: testItem.title,
  startedAt: '2025-01-01T00:00:00.000Z', status: 'in_progress', currentQuestionIndex: 0,
  timeRemainingSeconds: 1, answers: {
    q1: { questionId: 'q1', selectedOptionId: null, isMarkedForReview: false, timeSpentSeconds: 0 },
    q2: { questionId: 'q2', selectedOptionId: null, isMarkedForReview: false, timeSpentSeconds: 0 },
  },
}

describe('quiz engine', () => {
  it('randomizes question order without changing question identity', () => {
    const result = randomizeQuestions(questions, () => 0)
    expect(result.map((question) => question.id)).toEqual(['q2', 'q1'])
    expect(result.map((question) => question.correctOptionId)).toEqual(['d', 'a'])
  })

  it('randomizes options while retaining the correct option ID', () => {
    const result = randomizeOptions(questions[0], () => 0)
    expect(result.options.map((option) => option.id)).toEqual(['b', 'a'])
    expect(result.correctOptionId).toBe('a')
  })

  it('creates an in-progress attempt with unanswered questions', () => {
    const result = createAttempt(testItem, questions, () => 0.5)
    expect(result.attempt.status).toBe('in_progress')
    expect(Object.values(result.attempt.answers).every((answer) => answer.selectedOptionId === null)).toBe(true)
    expect(result.attempt.timeRemainingSeconds).toBe(60)
  })

  it('ticks to zero once and signals auto-submit', () => {
    const result = tickAttempt(baseAttempt)
    expect(result.attempt.timeRemainingSeconds).toBe(0)
    expect(result.shouldSubmit).toBe(true)
    expect(tickAttempt(result.attempt).shouldSubmit).toBe(false)
  })

  it('derives remaining time from the absolute deadline after tab throttling', () => {
    const expiresAt = new Date(10_000).toISOString()
    const attempt = { ...baseAttempt, timeRemainingSeconds: 9, expiresAt }
    const result = tickAttempt(attempt, 9_001)
    expect(result.attempt.timeRemainingSeconds).toBe(1)
    expect(result.shouldSubmit).toBe(false)
    expect(tickAttempt(result.attempt, 10_001).shouldSubmit).toBe(true)
  })

  it('does not tick completed attempts', () => {
    const completed = { ...baseAttempt, status: 'completed' as const }
    expect(tickAttempt(completed)).toEqual({ attempt: completed, shouldSubmit: false })
  })

  it('scores unanswered questions as unanswered, not incorrect', () => {
    const result = calculateTestResult({
      attemptId: 'attempt', test: testItem, questions, answers: baseAttempt.answers,
      startedAt: baseAttempt.startedAt, completedAt: baseAttempt.startedAt, timeTakenSeconds: 10,
    })
    expect(result.answeredQuestions).toBe(0)
    expect(result.unansweredQuestions).toBe(2)
    expect(result.incorrectAnswers).toBe(0)
    expect(result.scorePercentage).toBe(0)
    expect(result.passed).toBe(false)
  })

  it('calculates completion with correct and incorrect answers', () => {
    const result = calculateTestResult({
      attemptId: 'attempt', test: testItem, questions,
      answers: {
        ...baseAttempt.answers,
        q1: { ...baseAttempt.answers.q1, selectedOptionId: 'a' },
        q2: { ...baseAttempt.answers.q2, selectedOptionId: 'c' },
      }, startedAt: baseAttempt.startedAt, completedAt: baseAttempt.startedAt, timeTakenSeconds: 10,
    })
    expect(result.answeredQuestions).toBe(2)
    expect(result.correctAnswers).toBe(1)
    expect(result.incorrectAnswers).toBe(1)
    expect(result.unansweredQuestions).toBe(0)
    expect(result.scorePercentage).toBe(50)
    expect(isComplete({ ...baseAttempt, status: 'completed' })).toBe(true)
  })
})
