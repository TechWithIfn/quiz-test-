import { describe, it, expect } from 'vitest'
import {
  computeRecommendedDifficulty,
  computeDifficultyScore,
} from '@/engine/adaptive/difficultyManager'
import { PerformanceSnapshot } from '@/engine/adaptive/adaptiveTypes'
import { Question } from '@/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSnapshot(overrides: Partial<PerformanceSnapshot> = {}): PerformanceSnapshot {
  return {
    topicProfiles: new Map(),
    questionProfiles: new Map(),
    overallAccuracy: 0,
    totalQuestionsAnswered: 0,
    recentOverallWindow: [],
    ...overrides,
  }
}

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'q1',
    testId: 'test1',
    text: 'Sample',
    options: [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' },
    ],
    correctOptionId: 'a',
    explanation: '',
    points: 1,
    difficulty: 'intermediate',
    topic: 'Topic',
    tags: [],
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// computeRecommendedDifficulty
// ---------------------------------------------------------------------------

describe('computeRecommendedDifficulty', () => {
  it('returns "intermediate" when insufficient data', () => {
    const snapshot = makeSnapshot({
      recentOverallWindow: [true, true, true], // only 3, below threshold of 10
    })
    expect(computeRecommendedDifficulty(snapshot)).toBe('intermediate')
  })

  it('returns "advanced" when recent accuracy is high', () => {
    // 9 correct out of 10 = 90% ≥ 80%
    const snapshot = makeSnapshot({
      recentOverallWindow: [true, true, true, true, true, true, true, true, true, false],
    })
    expect(computeRecommendedDifficulty(snapshot)).toBe('advanced')
  })

  it('returns "beginner" when recent accuracy is low', () => {
    // 3 correct out of 10 = 30% ≤ 40%
    const snapshot = makeSnapshot({
      recentOverallWindow: [false, false, true, false, false, false, true, false, false, true],
    })
    expect(computeRecommendedDifficulty(snapshot)).toBe('beginner')
  })

  it('returns "intermediate" for moderate accuracy', () => {
    // 6 correct out of 10 = 60% — between 40% and 80%
    const snapshot = makeSnapshot({
      recentOverallWindow: [true, false, true, true, false, true, false, true, false, true],
    })
    expect(computeRecommendedDifficulty(snapshot)).toBe('intermediate')
  })

  it('returns "advanced" at exact threshold (80%)', () => {
    // 8 correct out of 10 = exactly 80%
    const snapshot = makeSnapshot({
      recentOverallWindow: [true, true, true, true, true, true, true, true, false, false],
    })
    expect(computeRecommendedDifficulty(snapshot)).toBe('advanced')
  })

  it('returns "beginner" at exact threshold (40%)', () => {
    // 4 correct out of 10 = exactly 40%
    const snapshot = makeSnapshot({
      recentOverallWindow: [true, true, true, true, false, false, false, false, false, false],
    })
    expect(computeRecommendedDifficulty(snapshot)).toBe('beginner')
  })

  it('respects custom thresholds', () => {
    // 7 correct out of 10 = 70%
    const snapshot = makeSnapshot({
      recentOverallWindow: [true, true, true, true, true, true, true, false, false, false],
    })
    // With lower up threshold of 0.7, this should trigger advanced
    expect(computeRecommendedDifficulty(snapshot, {
      difficultyUpThreshold: 0.7,
      minQuestionsForDifficultyShift: 10,
    })).toBe('advanced')
  })

  it('respects custom minimum question count', () => {
    // 5 correct out of 5 = 100%, but need 15 minimum
    const snapshot = makeSnapshot({
      recentOverallWindow: [true, true, true, true, true],
    })
    expect(computeRecommendedDifficulty(snapshot, {
      minQuestionsForDifficultyShift: 15,
    })).toBe('intermediate')
  })

  it('returns "intermediate" with empty window', () => {
    const snapshot = makeSnapshot({ recentOverallWindow: [] })
    expect(computeRecommendedDifficulty(snapshot)).toBe('intermediate')
  })
})

// ---------------------------------------------------------------------------
// computeDifficultyScore
// ---------------------------------------------------------------------------

describe('computeDifficultyScore', () => {
  it('gives highest score for exact match', () => {
    expect(computeDifficultyScore(makeQuestion({ difficulty: 'intermediate' }), 'intermediate')).toBe(10)
    expect(computeDifficultyScore(makeQuestion({ difficulty: 'beginner' }), 'beginner')).toBe(10)
    expect(computeDifficultyScore(makeQuestion({ difficulty: 'advanced' }), 'advanced')).toBe(10)
  })

  it('gives moderate score for one step away', () => {
    expect(computeDifficultyScore(makeQuestion({ difficulty: 'beginner' }), 'intermediate')).toBe(4)
    expect(computeDifficultyScore(makeQuestion({ difficulty: 'intermediate' }), 'advanced')).toBe(4)
    expect(computeDifficultyScore(makeQuestion({ difficulty: 'advanced' }), 'intermediate')).toBe(4)
  })

  it('gives zero for two steps away', () => {
    expect(computeDifficultyScore(makeQuestion({ difficulty: 'beginner' }), 'advanced')).toBe(0)
    expect(computeDifficultyScore(makeQuestion({ difficulty: 'advanced' }), 'beginner')).toBe(0)
  })

  it('gives neutral score for undefined difficulty', () => {
    expect(computeDifficultyScore(makeQuestion({ difficulty: undefined }), 'intermediate')).toBe(4)
  })

  it('never returns a negative score', () => {
    const scores = [
      computeDifficultyScore(makeQuestion({ difficulty: 'beginner' }), 'advanced'),
      computeDifficultyScore(makeQuestion({ difficulty: 'advanced' }), 'beginner'),
      computeDifficultyScore(makeQuestion({ difficulty: undefined }), 'beginner'),
    ]
    for (const score of scores) {
      expect(score).toBeGreaterThanOrEqual(0)
    }
  })
})
