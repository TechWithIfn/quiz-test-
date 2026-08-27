import { describe, expect, it } from 'vitest'
import { Question, Test, TestResult } from '@/types'
import { getRecommendations } from '@/services/recommendation.service'

const makeTest = (slug: string, title: string, tags: string[], difficulty: Test['difficulty'] = 'beginner'): Test => ({
  id: slug,
  slug,
  title,
  shortDescription: title,
  fullDescription: title,
  category: { id: 'python', name: 'Python', slug: 'python' },
  tags: tags.map((name) => ({ id: name, name, slug: name.toLowerCase() })),
  topics: tags,
  difficulty,
  timeLimitMinutes: 10,
  totalQuestions: 2,
  passingScorePercentage: 70,
  createdAt: '2025-01-01',
})

const current = makeTest('python-interview', 'Python Interview Test', ['Decorators', 'Generators'], 'advanced')
const weakMatch = makeTest('python-functions', 'Python Functions Test', ['Decorators'], 'intermediate')
const related = makeTest('python-generators', 'Python Generators Test', ['Generators'], 'advanced')
const fallback = makeTest('sql-basics', 'SQL Basics Test', ['SQL'], 'beginner')
const question = (id: string, topic: string, correctOptionId: string): Question => ({
  id, testId: current.id, text: id, topic, options: [], correctOptionId, explanation: 'Explanation', points: 1, tags: [],
})
const questions = [question('q1', 'Decorators', 'correct'), question('q2', 'Decorators', 'correct')]
const result = (attemptId: string, selectedOptionId: string): TestResult => ({
  attemptId, testId: current.id, testSlug: current.slug, testTitle: current.title, totalQuestions: 2,
  answeredQuestions: 1, unansweredQuestions: 1, correctAnswers: 0, incorrectAnswers: 1, flaggedQuestions: 0,
  scorePoints: 0, maxPoints: 2, scorePercentage: 0, passed: false, passingScorePercentage: 70,
  totalTimeSeconds: 600, timeTakenSeconds: 100, categoryBreakdown: {}, startedAt: '2025-01-01', completedAt: '2025-01-01',
  answers: {
    q1: { questionId: 'q1', selectedOptionId, isMarkedForReview: false, timeSpentSeconds: 1 },
    q2: { questionId: 'q2', selectedOptionId: null, isMarkedForReview: false, timeSpentSeconds: 1 },
  },
})

describe('recommendation engine', () => {
  it('prioritizes a repeatedly weak topic over related skills', () => {
    const recommendations = getRecommendations({
      currentTest: current,
      allTests: [current, related, weakMatch, fallback],
      results: [result('attempt-1', 'wrong'), result('attempt-2', 'wrong')],
      questionsByTestId: { [current.id]: questions, [weakMatch.id]: [], [related.id]: [], [fallback.id]: [] },
    })

    expect(recommendations[0]).toMatchObject({ test: { id: weakMatch.id }, reason: 'weak-topic' })
  })

  it('falls back to related category and skill tests without progress data', () => {
    const recommendations = getRecommendations({ currentTest: current, allTests: [current, related, weakMatch, fallback] })
    expect(recommendations).toHaveLength(3)
    expect(recommendations[0].reason).toBe('related-skill')
    expect(recommendations.some(({ test }) => test.id === fallback.id)).toBe(true)
  })
})
