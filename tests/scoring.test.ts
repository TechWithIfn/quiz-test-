import { describe, it, expect } from 'vitest'
import { calculateTestResult } from '@/utils/scoring'
import { Test, Question } from '@/types'

const mockTest: Test = {
  id: 'test-1',
  slug: 'test-demo',
  title: 'Demo Test',
  shortDescription: 'Demo',
  fullDescription: 'Demo full',
  category: { id: 'cat-1', name: 'Frontend', slug: 'frontend' },
  tags: [],
  difficulty: 'intermediate',
  timeLimitMinutes: 10,
  totalQuestions: 2,
  passingScorePercentage: 70,
  createdAt: '2026-01-01T00:00:00.000Z',
}

const mockQuestions: Question[] = [
  {
    id: 'q1',
    testId: 'test-1',
    text: 'Question 1',
    options: [
      { id: 'opt-a', text: 'Option A' },
      { id: 'opt-b', text: 'Option B' },
    ],
    correctOptionId: 'opt-a',
    explanation: 'A is correct',
    points: 1,
    tags: ['React'],
    category: 'Frontend',
    topic: 'Components',
  },
  {
    id: 'q2',
    testId: 'test-1',
    text: 'Question 2',
    options: [
      { id: 'opt-c', text: 'Option C' },
      { id: 'opt-d', text: 'Option D' },
    ],
    correctOptionId: 'opt-d',
    explanation: 'D is correct',
    points: 1,
    tags: ['CSS'],
    category: 'Frontend',
    topic: 'Styling',
  },
]

describe('Scoring Engine (calculateTestResult)', () => {
  it('aggregates topic performance independently of category, difficulty, and skipped questions', () => {
    const analyticsQuestions = [
      { ...mockQuestions[0], topic: 'JOIN', difficulty: 'beginner' as const, category: 'Data Analytics' },
      { ...mockQuestions[1], topic: 'JOIN', difficulty: 'advanced' as const, category: 'Data Analytics' },
      { ...mockQuestions[0], id: 'q3', topic: 'GROUP BY', difficulty: 'intermediate' as const, category: 'Reporting' },
      { ...mockQuestions[1], id: 'q4', topic: '', difficulty: 'advanced' as const, category: 'Reporting' },
    ]
    const result = calculateTestResult({
      attemptId: 'att-topics', test: mockTest, questions: analyticsQuestions,
      answers: {
        q1: { questionId: 'q1', selectedOptionId: 'opt-a', isMarkedForReview: false, timeSpentSeconds: 10 },
        q2: { questionId: 'q2', selectedOptionId: 'opt-c', isMarkedForReview: false, timeSpentSeconds: 20 },
        q3: { questionId: 'q3', selectedOptionId: null, isMarkedForReview: false, timeSpentSeconds: 0 },
        q4: { questionId: 'q4', selectedOptionId: 'opt-d', isMarkedForReview: false, timeSpentSeconds: 30 },
      },
      startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:01:00.000Z', timeTakenSeconds: 60,
    })

    expect(result.topicBreakdown).toMatchObject({
      JOIN: { totalQuestions: 2, attemptedQuestions: 2, correctQuestions: 1, incorrectQuestions: 1, accuracyPercentage: 50, averageTimeSeconds: 15 },
      'GROUP BY': { totalQuestions: 1, attemptedQuestions: 0, correctQuestions: 0, incorrectQuestions: 0, accuracyPercentage: 0 },
      Uncategorized: { totalQuestions: 1, attemptedQuestions: 1, correctQuestions: 1, accuracyPercentage: 100, averageTimeSeconds: 30 },
    })
  })

  it('correctly calculates 100% score when all questions are correct', () => {
    const result = calculateTestResult({
      attemptId: 'att-1',
      test: mockTest,
      questions: mockQuestions,
      answers: {
        q1: { questionId: 'q1', selectedOptionId: 'opt-a', isMarkedForReview: false, timeSpentSeconds: 10 },
        q2: { questionId: 'q2', selectedOptionId: 'opt-d', isMarkedForReview: false, timeSpentSeconds: 15 },
      },
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:01:00.000Z',
      timeTakenSeconds: 60,
    })

    expect(result.totalQuestions).toBe(2)
    expect(result.correctAnswers).toBe(2)
    expect(result.incorrectAnswers).toBe(0)
    expect(result.unansweredQuestions).toBe(0)
    expect(result.scorePercentage).toBe(100)
    expect(result.passed).toBe(true)
  })

  it('correctly calculates 50% score and marks as failed when passing score is 70%', () => {
    const result = calculateTestResult({
      attemptId: 'att-2',
      test: mockTest,
      questions: mockQuestions,
      answers: {
        q1: { questionId: 'q1', selectedOptionId: 'opt-a', isMarkedForReview: false, timeSpentSeconds: 10 },
        q2: { questionId: 'q2', selectedOptionId: 'opt-c', isMarkedForReview: false, timeSpentSeconds: 15 }, // Incorrect
      },
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:01:00.000Z',
      timeTakenSeconds: 60,
    })

    expect(result.correctAnswers).toBe(1)
    expect(result.incorrectAnswers).toBe(1)
    expect(result.scorePercentage).toBe(50)
    expect(result.passed).toBe(false)
  })

  it('handles unanswered questions and flagged questions properly', () => {
    const result = calculateTestResult({
      attemptId: 'att-3',
      test: mockTest,
      questions: mockQuestions,
      answers: {
        q1: { questionId: 'q1', selectedOptionId: null, isMarkedForReview: true, timeSpentSeconds: 5 },
        q2: { questionId: 'q2', selectedOptionId: null, isMarkedForReview: false, timeSpentSeconds: 0 },
      },
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:01:00.000Z',
      timeTakenSeconds: 60,
    })

    expect(result.answeredQuestions).toBe(0)
    expect(result.unansweredQuestions).toBe(2)
    expect(result.flaggedQuestions).toBe(1)
    expect(result.scorePercentage).toBe(0)
    expect(result.passed).toBe(false)
  })

  it('uses question points consistently for weighted scores', () => {
    const weightedQuestions = mockQuestions.map((question, index) => ({
      ...question,
      points: index === 0 ? 3 : 1,
    }))
    const result = calculateTestResult({
      attemptId: 'att-weighted',
      test: mockTest,
      questions: weightedQuestions,
      answers: {
        q1: { questionId: 'q1', selectedOptionId: 'opt-a', isMarkedForReview: false, timeSpentSeconds: 10 },
        q2: { questionId: 'q2', selectedOptionId: 'opt-c', isMarkedForReview: false, timeSpentSeconds: 10 },
      },
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:01:00.000Z',
      timeTakenSeconds: 60,
    })

    expect(result.scorePoints).toBe(3)
    expect(result.maxPoints).toBe(4)
    expect(result.scorePercentage).toBe(75)
    expect(result.passed).toBe(true)
  })
})
