import { describe, it, expect } from 'vitest'
import {
  buildTopicProfiles,
  buildQuestionProfiles,
  buildPerformanceSnapshot,
  enrichTopicProfilesWithMistakes,
} from '@/engine/adaptive/performanceTracker'
import { TestResult, Question, MistakeRecord, Answer } from '@/types'

// ---------------------------------------------------------------------------
// Test Data Factories
// ---------------------------------------------------------------------------

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: overrides.id || 'q1',
    testId: 'test1',
    text: 'Sample question',
    options: [
      { id: 'a', text: 'Option A' },
      { id: 'b', text: 'Option B' },
      { id: 'c', text: 'Option C' },
      { id: 'd', text: 'Option D' },
    ],
    correctOptionId: 'a',
    explanation: 'A is correct.',
    points: 1,
    difficulty: 'intermediate',
    topic: 'Variables',
    tags: [],
    ...overrides,
  }
}

function makeAnswer(questionId: string, selectedOptionId: string | null, overrides: Partial<Answer> = {}): Answer {
  return {
    questionId,
    selectedOptionId,
    isMarkedForReview: false,
    timeSpentSeconds: 30,
    answeredAt: '2026-01-15T10:00:00Z',
    ...overrides,
  }
}

function makeResult(overrides: Partial<TestResult> = {}): TestResult {
  return {
    attemptId: 'attempt1',
    testId: 'test1',
    testSlug: 'test-1',
    testTitle: 'Test 1',
    totalQuestions: 3,
    answeredQuestions: 3,
    unansweredQuestions: 0,
    correctAnswers: 2,
    incorrectAnswers: 1,
    flaggedQuestions: 0,
    scorePoints: 2,
    maxPoints: 3,
    scorePercentage: 67,
    passed: false,
    passingScorePercentage: 70,
    totalTimeSeconds: 600,
    timeTakenSeconds: 300,
    categoryBreakdown: {},
    startedAt: '2026-01-15T09:50:00Z',
    completedAt: '2026-01-15T10:00:00Z',
    answers: {},
    ...overrides,
  }
}

function makeMistake(overrides: Partial<MistakeRecord> = {}): MistakeRecord {
  return {
    id: 'mistake1',
    questionId: 'q1',
    testId: 'test1',
    testSlug: 'test-1',
    testTitle: 'Test 1',
    selectedOptionId: 'b',
    correctOptionId: 'a',
    attemptId: 'attempt1',
    questionNumber: 1,
    topic: 'Variables',
    difficulty: 'intermediate',
    recordedAt: '2026-01-15T10:00:00Z',
    correctRetryCount: 0,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// buildTopicProfiles
// ---------------------------------------------------------------------------

describe('buildTopicProfiles', () => {
  it('builds profiles from result history', () => {
    const questions = [
      makeQuestion({ id: 'q1', topic: 'Variables', correctOptionId: 'a' }),
      makeQuestion({ id: 'q2', topic: 'Functions', correctOptionId: 'a' }),
      makeQuestion({ id: 'q3', topic: 'Variables', correctOptionId: 'a' }),
    ]

    const results: TestResult[] = [
      makeResult({
        answers: {
          'q1': makeAnswer('q1', 'a'), // correct
          'q2': makeAnswer('q2', 'b'), // incorrect
          'q3': makeAnswer('q3', 'a'), // correct
        },
      }),
    ]

    const profiles = buildTopicProfiles(results, questions)

    expect(profiles.has('Variables')).toBe(true)
    expect(profiles.has('Functions')).toBe(true)

    const variables = profiles.get('Variables')!
    expect(variables.totalAttempts).toBe(2)
    expect(variables.totalCorrect).toBe(2)
    expect(variables.recentWindow).toEqual([true, true])

    const functions = profiles.get('Functions')!
    expect(functions.totalAttempts).toBe(1)
    expect(functions.totalCorrect).toBe(0)
    expect(functions.recentWindow).toEqual([false])
  })

  it('skips unanswered questions', () => {
    const questions = [
      makeQuestion({ id: 'q1', topic: 'Variables' }),
    ]
    const results: TestResult[] = [
      makeResult({
        answers: {
          'q1': makeAnswer('q1', null), // unanswered
        },
      }),
    ]

    const profiles = buildTopicProfiles(results, questions)
    expect(profiles.size).toBe(0)
  })

  it('caps the recent window to configured size', () => {
    const questions = [
      makeQuestion({ id: 'q1', topic: 'Variables', correctOptionId: 'a' }),
    ]

    // Create many results that re-answer the same question
    const results: TestResult[] = Array.from({ length: 20 }, (_, i) =>
      makeResult({
        attemptId: `attempt${i}`,
        completedAt: `2026-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
        answers: {
          'q1': makeAnswer('q1', i % 3 === 0 ? 'b' : 'a'),
        },
      })
    )

    const profiles = buildTopicProfiles(results, questions, { recentWindowSize: 5 })
    const variables = profiles.get('Variables')!
    expect(variables.recentWindow.length).toBe(5)
  })

  it('computes average time per question', () => {
    const questions = [
      makeQuestion({ id: 'q1', topic: 'Variables', correctOptionId: 'a' }),
      makeQuestion({ id: 'q2', topic: 'Variables', correctOptionId: 'a' }),
    ]
    const results: TestResult[] = [
      makeResult({
        answers: {
          'q1': makeAnswer('q1', 'a', { timeSpentSeconds: 20 }),
          'q2': makeAnswer('q2', 'a', { timeSpentSeconds: 40 }),
        },
      }),
    ]

    const profiles = buildTopicProfiles(results, questions)
    const variables = profiles.get('Variables')!
    expect(variables.averageTimeSeconds).toBe(30) // (20 + 40) / 2
  })

  it('handles empty results gracefully', () => {
    const questions = [makeQuestion({ id: 'q1' })]
    const profiles = buildTopicProfiles([], questions)
    expect(profiles.size).toBe(0)
  })

  it('handles empty questions gracefully', () => {
    const results = [makeResult({ answers: { 'q1': makeAnswer('q1', 'a') } })]
    const profiles = buildTopicProfiles(results, [])
    expect(profiles.size).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// enrichTopicProfilesWithMistakes
// ---------------------------------------------------------------------------

describe('enrichTopicProfilesWithMistakes', () => {
  it('counts questions with 2+ mistake records as repeated', () => {
    const questions = [
      makeQuestion({ id: 'q1', topic: 'Variables' }),
      makeQuestion({ id: 'q2', topic: 'Variables' }),
    ]
    const profiles = new Map([
      ['Variables', {
        topic: 'Variables',
        totalAttempts: 5,
        totalCorrect: 2,
        recentWindow: [],
        averageTimeSeconds: 0,
        repeatedMistakeCount: 0,
        lastAttemptedAt: null,
      }],
    ])

    const mistakes: MistakeRecord[] = [
      makeMistake({ id: 'm1', questionId: 'q1', attemptId: 'a1' }),
      makeMistake({ id: 'm2', questionId: 'q1', attemptId: 'a2' }),
      makeMistake({ id: 'm3', questionId: 'q2', attemptId: 'a1' }), // only once
    ]

    enrichTopicProfilesWithMistakes(profiles, mistakes, questions)
    // q1 has 2 mistakes → repeated, q2 has 1 → not repeated
    expect(profiles.get('Variables')!.repeatedMistakeCount).toBe(1)
  })

  it('does not count single mistakes as repeated', () => {
    const questions = [makeQuestion({ id: 'q1', topic: 'Variables' })]
    const profiles = new Map([
      ['Variables', {
        topic: 'Variables',
        totalAttempts: 3,
        totalCorrect: 1,
        recentWindow: [],
        averageTimeSeconds: 0,
        repeatedMistakeCount: 0,
        lastAttemptedAt: null,
      }],
    ])

    const mistakes: MistakeRecord[] = [
      makeMistake({ id: 'm1', questionId: 'q1', attemptId: 'a1' }),
    ]

    enrichTopicProfilesWithMistakes(profiles, mistakes, questions)
    expect(profiles.get('Variables')!.repeatedMistakeCount).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// buildQuestionProfiles
// ---------------------------------------------------------------------------

describe('buildQuestionProfiles', () => {
  it('tracks attempt counts and accuracy per question', () => {
    const questions = [
      makeQuestion({ id: 'q1', correctOptionId: 'a' }),
      makeQuestion({ id: 'q2', correctOptionId: 'a' }),
    ]
    const results: TestResult[] = [
      makeResult({
        attemptId: 'a1',
        completedAt: '2026-01-01T10:00:00Z',
        answers: {
          'q1': makeAnswer('q1', 'a'), // correct
          'q2': makeAnswer('q2', 'b'), // incorrect
        },
      }),
      makeResult({
        attemptId: 'a2',
        completedAt: '2026-01-02T10:00:00Z',
        answers: {
          'q1': makeAnswer('q1', 'a'), // correct again
          'q2': makeAnswer('q2', 'a'), // correct this time
        },
      }),
    ]

    const profiles = buildQuestionProfiles(results, questions, [])

    const q1 = profiles.get('q1')!
    expect(q1.totalAttempts).toBe(2)
    expect(q1.totalCorrect).toBe(2)
    expect(q1.consecutiveCorrect).toBe(2)
    expect(q1.consecutiveIncorrect).toBe(0)
    expect(q1.lastResult).toBe(true)

    const q2 = profiles.get('q2')!
    expect(q2.totalAttempts).toBe(2)
    expect(q2.totalCorrect).toBe(1)
    expect(q2.consecutiveCorrect).toBe(1) // last was correct
    expect(q2.lastResult).toBe(true)
  })

  it('computes consecutive incorrect streaks', () => {
    const questions = [makeQuestion({ id: 'q1', correctOptionId: 'a' })]
    const results: TestResult[] = [
      makeResult({
        attemptId: 'a1',
        completedAt: '2026-01-01T10:00:00Z',
        answers: { 'q1': makeAnswer('q1', 'b') }, // wrong
      }),
      makeResult({
        attemptId: 'a2',
        completedAt: '2026-01-02T10:00:00Z',
        answers: { 'q1': makeAnswer('q1', 'c') }, // wrong again
      }),
    ]

    const profiles = buildQuestionProfiles(results, questions, [])
    const q1 = profiles.get('q1')!
    expect(q1.consecutiveIncorrect).toBe(2)
    expect(q1.consecutiveCorrect).toBe(0)
    expect(q1.lastResult).toBe(false)
  })

  it('flags repeated mistakes from mistake records', () => {
    const questions = [makeQuestion({ id: 'q1' })]
    const mistakes: MistakeRecord[] = [
      makeMistake({ id: 'm1', questionId: 'q1', attemptId: 'a1' }),
      makeMistake({ id: 'm2', questionId: 'q1', attemptId: 'a2' }),
    ]

    const profiles = buildQuestionProfiles([], questions, mistakes)
    expect(profiles.get('q1')!.isRepeatedMistake).toBe(true)
  })

  it('does not flag single mistakes as repeated', () => {
    const questions = [makeQuestion({ id: 'q1' })]
    const mistakes: MistakeRecord[] = [
      makeMistake({ id: 'm1', questionId: 'q1', attemptId: 'a1' }),
    ]

    const profiles = buildQuestionProfiles([], questions, mistakes)
    expect(profiles.get('q1')!.isRepeatedMistake).toBe(false)
  })

  it('initializes profiles for all pool questions even with no history', () => {
    const questions = [
      makeQuestion({ id: 'q1' }),
      makeQuestion({ id: 'q2' }),
      makeQuestion({ id: 'q3' }),
    ]

    const profiles = buildQuestionProfiles([], questions, [])
    expect(profiles.size).toBe(3)
    expect(profiles.get('q1')!.totalAttempts).toBe(0)
    expect(profiles.get('q1')!.lastResult).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// buildPerformanceSnapshot
// ---------------------------------------------------------------------------

describe('buildPerformanceSnapshot', () => {
  it('computes overall accuracy from all results', () => {
    const questions = [
      makeQuestion({ id: 'q1', correctOptionId: 'a' }),
      makeQuestion({ id: 'q2', correctOptionId: 'a' }),
    ]
    const results: TestResult[] = [
      makeResult({
        answers: {
          'q1': makeAnswer('q1', 'a'), // correct
          'q2': makeAnswer('q2', 'b'), // incorrect
        },
      }),
    ]

    const snapshot = buildPerformanceSnapshot(results, questions, [])
    expect(snapshot.overallAccuracy).toBe(0.5) // 1/2
    expect(snapshot.totalQuestionsAnswered).toBe(2)
  })

  it('builds recent overall window newest-first', () => {
    const questions = [
      makeQuestion({ id: 'q1', correctOptionId: 'a' }),
    ]
    const results: TestResult[] = [
      makeResult({
        completedAt: '2026-01-02T10:00:00Z',
        answers: { 'q1': makeAnswer('q1', 'a') }, // correct (newer)
      }),
      makeResult({
        completedAt: '2026-01-01T10:00:00Z',
        answers: { 'q1': makeAnswer('q1', 'b') }, // incorrect (older)
      }),
    ]

    const snapshot = buildPerformanceSnapshot(results, questions, [])
    expect(snapshot.recentOverallWindow.length).toBe(2)
  })

  it('handles empty data gracefully', () => {
    const snapshot = buildPerformanceSnapshot([], [], [])
    expect(snapshot.overallAccuracy).toBe(0)
    expect(snapshot.totalQuestionsAnswered).toBe(0)
    expect(snapshot.topicProfiles.size).toBe(0)
    expect(snapshot.questionProfiles.size).toBe(0)
    expect(snapshot.recentOverallWindow).toEqual([])
  })

  it('includes mistake enrichment in topic profiles', () => {
    const questions = [
      makeQuestion({ id: 'q1', topic: 'Variables', correctOptionId: 'a' }),
    ]
    const results: TestResult[] = [
      makeResult({
        answers: { 'q1': makeAnswer('q1', 'b') },
      }),
    ]
    const mistakes: MistakeRecord[] = [
      makeMistake({ id: 'm1', questionId: 'q1', attemptId: 'a1' }),
      makeMistake({ id: 'm2', questionId: 'q1', attemptId: 'a2' }),
    ]

    const snapshot = buildPerformanceSnapshot(results, questions, mistakes)
    const varProfile = snapshot.topicProfiles.get('Variables')!
    expect(varProfile.repeatedMistakeCount).toBe(1)
  })
})
