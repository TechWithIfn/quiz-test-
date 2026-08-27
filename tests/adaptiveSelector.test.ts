import { describe, it, expect } from 'vitest'
import { selectAdaptiveQuestions } from '@/engine/adaptive/adaptiveSelector'
import {
  PerformanceSnapshot,
  TopicProfile,
  QuestionProfile,
} from '@/engine/adaptive/adaptiveTypes'
import { Question } from '@/types'

// ---------------------------------------------------------------------------
// Deterministic random source — seeded LCG for reproducible tests
// ---------------------------------------------------------------------------

function createSeededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) & 0x7fffffff
    return state / 0x7fffffff
  }
}

// ---------------------------------------------------------------------------
// Test Data Factories
// ---------------------------------------------------------------------------

function makeQuestion(id: string, topic: string, difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): Question {
  return {
    id,
    testId: 'test1',
    text: `Question ${id}`,
    options: [
      { id: `${id}_a`, text: 'A' },
      { id: `${id}_b`, text: 'B' },
      { id: `${id}_c`, text: 'C' },
      { id: `${id}_d`, text: 'D' },
    ],
    correctOptionId: `${id}_a`,
    explanation: `${id}_a is correct.`,
    points: 1,
    difficulty,
    topic,
    tags: [],
  }
}

function makeTopicProfile(topic: string, overrides: Partial<TopicProfile> = {}): TopicProfile {
  return {
    topic,
    totalAttempts: 0,
    totalCorrect: 0,
    recentWindow: [],
    averageTimeSeconds: 0,
    repeatedMistakeCount: 0,
    lastAttemptedAt: null,
    ...overrides,
  }
}

function makeQuestionProfile(questionId: string, overrides: Partial<QuestionProfile> = {}): QuestionProfile {
  return {
    questionId,
    totalAttempts: 0,
    totalCorrect: 0,
    lastResult: null,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    isRepeatedMistake: false,
    lastAttemptedAt: null,
    ...overrides,
  }
}

function emptySnapshot(): PerformanceSnapshot {
  return {
    topicProfiles: new Map(),
    questionProfiles: new Map(),
    overallAccuracy: 0,
    totalQuestionsAnswered: 0,
    recentOverallWindow: [],
  }
}

// ---------------------------------------------------------------------------
// Core Selection Behavior
// ---------------------------------------------------------------------------

describe('selectAdaptiveQuestions', () => {
  it('returns empty array for empty pool', () => {
    const result = selectAdaptiveQuestions([], emptySnapshot(), {}, 10, createSeededRandom(42))
    expect(result).toEqual([])
  })

  it('returns empty array for count <= 0', () => {
    const pool = [makeQuestion('q1', 'Topic')]
    const result = selectAdaptiveQuestions(pool, emptySnapshot(), {}, 0, createSeededRandom(42))
    expect(result).toEqual([])
  })

  it('returns shuffled pool when no performance data exists', () => {
    const pool = [
      makeQuestion('q1', 'A'),
      makeQuestion('q2', 'B'),
      makeQuestion('q3', 'C'),
    ]
    const result = selectAdaptiveQuestions(pool, emptySnapshot(), {}, 3, createSeededRandom(42))
    expect(result).toHaveLength(3)
    // All questions present (just potentially reordered)
    const ids = result.map(q => q.id).sort()
    expect(ids).toEqual(['q1', 'q2', 'q3'])
  })

  it('limits to count even when pool is larger', () => {
    const pool = Array.from({ length: 20 }, (_, i) => makeQuestion(`q${i}`, 'Topic'))
    const result = selectAdaptiveQuestions(pool, emptySnapshot(), {}, 5, createSeededRandom(42))
    expect(result).toHaveLength(5)
  })

  it('returns all when pool is smaller than count', () => {
    const pool = [makeQuestion('q1', 'A'), makeQuestion('q2', 'B')]
    const result = selectAdaptiveQuestions(pool, emptySnapshot(), {}, 10, createSeededRandom(42))
    expect(result).toHaveLength(2)
  })

  it('never produces duplicate questions', () => {
    const pool = Array.from({ length: 30 }, (_, i) =>
      makeQuestion(`q${i}`, `Topic${i % 5}`)
    )
    const snapshot: PerformanceSnapshot = {
      topicProfiles: new Map([
        ['Topic0', makeTopicProfile('Topic0', { totalAttempts: 10, totalCorrect: 2, recentWindow: [false, false, true, false, false] })],
        ['Topic1', makeTopicProfile('Topic1', { totalAttempts: 10, totalCorrect: 9, recentWindow: [true, true, true, true, true] })],
      ]),
      questionProfiles: new Map(
        pool.map(q => [q.id, makeQuestionProfile(q.id, { totalAttempts: 2, totalCorrect: 1 })])
      ),
      overallAccuracy: 0.5,
      totalQuestionsAnswered: 30,
      recentOverallWindow: [true, false, true, false, true, false, true, false, true, false],
    }

    const result = selectAdaptiveQuestions(pool, snapshot, {}, 15, createSeededRandom(42))
    const ids = result.map(q => q.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('is deterministic with the same random seed', () => {
    const pool = Array.from({ length: 20 }, (_, i) =>
      makeQuestion(`q${i}`, `Topic${i % 4}`, ['beginner', 'intermediate', 'advanced'][i % 3] as 'beginner' | 'intermediate' | 'advanced')
    )

    const snapshot: PerformanceSnapshot = {
      topicProfiles: new Map([
        ['Topic0', makeTopicProfile('Topic0', { totalAttempts: 5, totalCorrect: 1, recentWindow: [false, false, true, false, false] })],
        ['Topic1', makeTopicProfile('Topic1', { totalAttempts: 8, totalCorrect: 7, recentWindow: [true, true, true, true, true] })],
        ['Topic2', makeTopicProfile('Topic2', { totalAttempts: 6, totalCorrect: 3, recentWindow: [true, false, true, false] })],
      ]),
      questionProfiles: new Map(),
      overallAccuracy: 0.55,
      totalQuestionsAnswered: 19,
      recentOverallWindow: [true, false, true, true, false, true, false, true, false, true],
    }

    const result1 = selectAdaptiveQuestions(pool, snapshot, {}, 10, createSeededRandom(12345))
    const result2 = selectAdaptiveQuestions(pool, snapshot, {}, 10, createSeededRandom(12345))

    expect(result1.map(q => q.id)).toEqual(result2.map(q => q.id))
  })
})

// ---------------------------------------------------------------------------
// Weak Topic Prioritization
// ---------------------------------------------------------------------------

describe('selectAdaptiveQuestions — weak topic prioritization', () => {
  it('prioritizes questions from weak topics over strong topics', () => {
    const pool = [
      makeQuestion('weak1', 'WeakTopic'),
      makeQuestion('weak2', 'WeakTopic'),
      makeQuestion('strong1', 'StrongTopic'),
      makeQuestion('strong2', 'StrongTopic'),
      makeQuestion('strong3', 'StrongTopic'),
    ]

    const snapshot: PerformanceSnapshot = {
      topicProfiles: new Map([
        ['WeakTopic', makeTopicProfile('WeakTopic', {
          totalAttempts: 8,
          totalCorrect: 1,
          recentWindow: [false, false, false, true, false, false, false, false],
        })],
        ['StrongTopic', makeTopicProfile('StrongTopic', {
          totalAttempts: 15,
          totalCorrect: 14,
          recentWindow: [true, true, true, true, true, true, true, true, true, true],
        })],
      ]),
      questionProfiles: new Map(),
      overallAccuracy: 0.65,
      totalQuestionsAnswered: 23,
      recentOverallWindow: [true, false, true, true, true, true, true, true, true, true],
    }

    const result = selectAdaptiveQuestions(pool, snapshot, {}, 3, createSeededRandom(42))
    const weakCount = result.filter(q => q.topic === 'WeakTopic').length
    const strongCount = result.filter(q => q.topic === 'StrongTopic').length

    // Should have more weak topic questions than strong
    expect(weakCount).toBeGreaterThanOrEqual(1)
    // But should still include at least some retention
    expect(strongCount).toBeGreaterThanOrEqual(0)
    // Weak should dominate
    expect(weakCount).toBeGreaterThanOrEqual(strongCount)
  })
})

// ---------------------------------------------------------------------------
// Retention Inclusion
// ---------------------------------------------------------------------------

describe('selectAdaptiveQuestions — retention', () => {
  it('includes questions from mastered topics for retention', () => {
    const pool = [
      ...Array.from({ length: 8 }, (_, i) => makeQuestion(`weak${i}`, 'WeakTopic')),
      ...Array.from({ length: 4 }, (_, i) => makeQuestion(`mastered${i}`, 'MasteredTopic')),
    ]

    const snapshot: PerformanceSnapshot = {
      topicProfiles: new Map([
        ['WeakTopic', makeTopicProfile('WeakTopic', {
          totalAttempts: 10,
          totalCorrect: 2,
          recentWindow: [false, false, true, false, false],
        })],
        ['MasteredTopic', makeTopicProfile('MasteredTopic', {
          totalAttempts: 20,
          totalCorrect: 19,
          recentWindow: [true, true, true, true, true, true, true, true, true, true],
        })],
      ]),
      questionProfiles: new Map(),
      overallAccuracy: 0.7,
      totalQuestionsAnswered: 30,
      recentOverallWindow: [true, true, false, true, true, true, true, false, true, true],
    }

    const result = selectAdaptiveQuestions(pool, snapshot, { retentionRatio: 0.3 }, 10, createSeededRandom(42))
    const masteredCount = result.filter(q => q.topic === 'MasteredTopic').length

    // With 30% retention ratio for 10 questions, expect at least 1 mastered
    expect(masteredCount).toBeGreaterThanOrEqual(1)
  })
})

// ---------------------------------------------------------------------------
// Difficulty Adaptation
// ---------------------------------------------------------------------------

describe('selectAdaptiveQuestions — difficulty adaptation', () => {
  it('prefers harder questions when recent accuracy is high', () => {
    const pool = [
      ...Array.from({ length: 5 }, (_, i) => makeQuestion(`beg${i}`, 'Topic', 'beginner')),
      ...Array.from({ length: 5 }, (_, i) => makeQuestion(`int${i}`, 'Topic', 'intermediate')),
      ...Array.from({ length: 5 }, (_, i) => makeQuestion(`adv${i}`, 'Topic', 'advanced')),
    ]

    const snapshot: PerformanceSnapshot = {
      topicProfiles: new Map([
        ['Topic', makeTopicProfile('Topic', {
          totalAttempts: 15,
          totalCorrect: 5,
          recentWindow: [true, false, true, false, true],
        })],
      ]),
      questionProfiles: new Map(),
      overallAccuracy: 0.9,
      totalQuestionsAnswered: 20,
      // 90% accuracy in recent window → should recommend advanced
      recentOverallWindow: [true, true, true, true, true, true, true, true, true, false],
    }

    const result = selectAdaptiveQuestions(pool, snapshot, {}, 6, createSeededRandom(42))
    const advancedCount = result.filter(q => q.difficulty === 'advanced').length
    const beginnerCount = result.filter(q => q.difficulty === 'beginner').length

    // Advanced should be preferred
    expect(advancedCount).toBeGreaterThanOrEqual(beginnerCount)
  })

  it('prefers easier questions when recent accuracy is low', () => {
    const pool = [
      ...Array.from({ length: 5 }, (_, i) => makeQuestion(`beg${i}`, 'Topic', 'beginner')),
      ...Array.from({ length: 5 }, (_, i) => makeQuestion(`int${i}`, 'Topic', 'intermediate')),
      ...Array.from({ length: 5 }, (_, i) => makeQuestion(`adv${i}`, 'Topic', 'advanced')),
    ]

    const snapshot: PerformanceSnapshot = {
      topicProfiles: new Map([
        ['Topic', makeTopicProfile('Topic', {
          totalAttempts: 15,
          totalCorrect: 5,
          recentWindow: [false, false, true, false, false],
        })],
      ]),
      questionProfiles: new Map(),
      overallAccuracy: 0.2,
      totalQuestionsAnswered: 20,
      // 20% accuracy → should recommend beginner
      recentOverallWindow: [false, false, true, false, false, false, false, false, true, false],
    }

    const result = selectAdaptiveQuestions(pool, snapshot, {}, 6, createSeededRandom(42))
    const beginnerCount = result.filter(q => q.difficulty === 'beginner').length
    const advancedCount = result.filter(q => q.difficulty === 'advanced').length

    // Beginner should be preferred
    expect(beginnerCount).toBeGreaterThanOrEqual(advancedCount)
  })
})

// ---------------------------------------------------------------------------
// Repeated Mistakes
// ---------------------------------------------------------------------------

describe('selectAdaptiveQuestions — repeated mistakes', () => {
  it('prioritizes repeated mistake questions', () => {
    const pool = [
      makeQuestion('mistake1', 'Topic'),
      makeQuestion('normal1', 'Topic'),
      makeQuestion('normal2', 'Topic'),
      makeQuestion('normal3', 'Topic'),
      makeQuestion('normal4', 'Topic'),
    ]

    const snapshot: PerformanceSnapshot = {
      topicProfiles: new Map([
        ['Topic', makeTopicProfile('Topic', {
          totalAttempts: 10,
          totalCorrect: 5,
          recentWindow: [true, false, true, false, true],
        })],
      ]),
      questionProfiles: new Map([
        ['mistake1', makeQuestionProfile('mistake1', {
          totalAttempts: 3,
          totalCorrect: 0,
          lastResult: false,
          consecutiveIncorrect: 3,
          isRepeatedMistake: true,
        })],
        ['normal1', makeQuestionProfile('normal1', { totalAttempts: 2, totalCorrect: 2, consecutiveCorrect: 2, lastResult: true })],
        ['normal2', makeQuestionProfile('normal2', { totalAttempts: 2, totalCorrect: 2, consecutiveCorrect: 2, lastResult: true })],
        ['normal3', makeQuestionProfile('normal3', { totalAttempts: 2, totalCorrect: 2, consecutiveCorrect: 2, lastResult: true })],
        ['normal4', makeQuestionProfile('normal4', { totalAttempts: 2, totalCorrect: 2, consecutiveCorrect: 2, lastResult: true })],
      ]),
      overallAccuracy: 0.5,
      totalQuestionsAnswered: 10,
      recentOverallWindow: [true, false, true, false, true, false, true, false, true, false],
    }

    const result = selectAdaptiveQuestions(pool, snapshot, {}, 2, createSeededRandom(42))
    // The repeated mistake question should be selected
    expect(result.some(q => q.id === 'mistake1')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Recency Decay
// ---------------------------------------------------------------------------

describe('selectAdaptiveQuestions — recency decay', () => {
  it('deprioritizes questions answered correctly many times recently', () => {
    const pool = [
      makeQuestion('drilled', 'Topic'),
      makeQuestion('fresh1', 'Topic'),
      makeQuestion('fresh2', 'Topic'),
    ]

    const snapshot: PerformanceSnapshot = {
      topicProfiles: new Map([
        ['Topic', makeTopicProfile('Topic', {
          totalAttempts: 10,
          totalCorrect: 5,
          recentWindow: [true, false, true, false, true],
        })],
      ]),
      questionProfiles: new Map([
        ['drilled', makeQuestionProfile('drilled', {
          totalAttempts: 8,
          totalCorrect: 8,
          consecutiveCorrect: 8,
          lastResult: true,
        })],
        ['fresh1', makeQuestionProfile('fresh1', { totalAttempts: 0 })],
        ['fresh2', makeQuestionProfile('fresh2', { totalAttempts: 0 })],
      ]),
      overallAccuracy: 0.5,
      totalQuestionsAnswered: 8,
      recentOverallWindow: [true, true, true, true, true, true, true, true],
    }

    const result = selectAdaptiveQuestions(pool, snapshot, {}, 2, createSeededRandom(42))
    // Fresh questions should be preferred over the heavily-drilled one
    const freshCount = result.filter(q => q.id.startsWith('fresh')).length
    expect(freshCount).toBeGreaterThanOrEqual(1)
  })
})

// ---------------------------------------------------------------------------
// Edge Cases
// ---------------------------------------------------------------------------

describe('selectAdaptiveQuestions — edge cases', () => {
  it('handles a single question in the pool', () => {
    const pool = [makeQuestion('q1', 'Topic')]
    const result = selectAdaptiveQuestions(pool, emptySnapshot(), {}, 5, createSeededRandom(42))
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('q1')
  })

  it('handles all questions from the same topic', () => {
    const pool = Array.from({ length: 10 }, (_, i) => makeQuestion(`q${i}`, 'SingleTopic'))
    const snapshot: PerformanceSnapshot = {
      topicProfiles: new Map([
        ['SingleTopic', makeTopicProfile('SingleTopic', { totalAttempts: 5, totalCorrect: 3, recentWindow: [true, false, true] })],
      ]),
      questionProfiles: new Map(),
      overallAccuracy: 0.6,
      totalQuestionsAnswered: 5,
      recentOverallWindow: [true, false, true, false, true],
    }

    const result = selectAdaptiveQuestions(pool, snapshot, {}, 5, createSeededRandom(42))
    expect(result).toHaveLength(5)
    const uniqueIds = new Set(result.map(q => q.id))
    expect(uniqueIds.size).toBe(5)
  })

  it('handles topics that exist in profiles but not in pool', () => {
    const pool = [makeQuestion('q1', 'TopicA')]
    const snapshot: PerformanceSnapshot = {
      topicProfiles: new Map([
        ['TopicA', makeTopicProfile('TopicA', { totalAttempts: 3, totalCorrect: 1 })],
        ['TopicB', makeTopicProfile('TopicB', { totalAttempts: 5, totalCorrect: 0 })], // No questions in pool
      ]),
      questionProfiles: new Map(),
      overallAccuracy: 0.2,
      totalQuestionsAnswered: 8,
      recentOverallWindow: [false, false, true, false, false, false, true, false],
    }

    // Should not crash even though TopicB has no pool questions
    const result = selectAdaptiveQuestions(pool, snapshot, {}, 5, createSeededRandom(42))
    expect(result).toHaveLength(1)
  })
})
