import { describe, expect, it } from 'vitest'
import { Question, TestResult } from '@/types'
import { getPerformanceInsights } from '@/utils/performance'

const questions: Question[] = [
  { id: 'q1', testId: 'test', text: 'A', topic: 'Functions', options: [], correctOptionId: 'a', explanation: 'Because.', points: 1, tags: [] },
  { id: 'q2', testId: 'test', text: 'B', topic: 'Functions', options: [], correctOptionId: 'b', explanation: 'Because.', points: 1, tags: [] },
  { id: 'q3', testId: 'test', text: 'C', topic: 'Data Types', options: [], correctOptionId: 'c', explanation: 'Because.', points: 1, tags: [] },
]

const result = {
  answers: {
    q1: { questionId: 'q1', selectedOptionId: 'a', isMarkedForReview: false, timeSpentSeconds: 1 },
    q2: { questionId: 'q2', selectedOptionId: 'b', isMarkedForReview: false, timeSpentSeconds: 1 },
    q3: { questionId: 'q3', selectedOptionId: null, isMarkedForReview: false, timeSpentSeconds: 1 },
  },
} as Pick<TestResult, 'answers'>

describe('performance insights', () => {
  it('groups results by topic and separates strong and weak areas', () => {
    const insights = getPerformanceInsights(questions, result)
    expect(insights.strongAreas).toEqual([{ topic: 'Functions', total: 2, attempted: 2, correct: 2, incorrect: 0, accuracyPercentage: 100, averageTimeSeconds: 1 }])
    expect(insights.weakAreas).toEqual([])
  })

  it('uses result topic summaries and excludes insufficient evidence', () => {
    const insights = getPerformanceInsights(questions, {
      answers: result.answers,
      topicBreakdown: {
        Functions: { topic: 'Functions', totalQuestions: 5, attemptedQuestions: 5, correctQuestions: 2, incorrectQuestions: 3, accuracyPercentage: 40, averageTimeSeconds: 12 },
        'One question': { topic: 'One question', totalQuestions: 1, attemptedQuestions: 1, correctQuestions: 0, incorrectQuestions: 1, accuracyPercentage: 0 },
      },
    })

    expect(insights.weakAreas).toEqual([expect.objectContaining({ topic: 'Functions', attempted: 5, accuracyPercentage: 40 })])
    expect(insights.weakAreas.some((area) => area.topic === 'One question')).toBe(false)
  })
})
