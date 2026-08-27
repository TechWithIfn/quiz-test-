import { describe, it, expect } from 'vitest'
import {
  computeMasteryScore,
  computeTopicMastery,
  computeQuestionMastery,
} from '@/engine/adaptive/masteryCalculator'
import { TopicProfile, QuestionProfile } from '@/engine/adaptive/adaptiveTypes'

// ---------------------------------------------------------------------------
// Helpers — Deterministic profile factories
// ---------------------------------------------------------------------------

function makeTopicProfile(overrides: Partial<TopicProfile> = {}): TopicProfile {
  return {
    topic: 'Test Topic',
    totalAttempts: 0,
    totalCorrect: 0,
    recentWindow: [],
    averageTimeSeconds: 0,
    repeatedMistakeCount: 0,
    lastAttemptedAt: null,
    ...overrides,
  }
}

function makeQuestionProfile(overrides: Partial<QuestionProfile> = {}): QuestionProfile {
  return {
    questionId: 'q1',
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

// ---------------------------------------------------------------------------
// computeMasteryScore
// ---------------------------------------------------------------------------

describe('computeMasteryScore', () => {
  it('returns 0 for zero attempts', () => {
    const profile = makeTopicProfile({ totalAttempts: 0 })
    expect(computeMasteryScore(profile)).toBe(0)
  })

  it('returns a low score for mostly incorrect answers', () => {
    const profile = makeTopicProfile({
      totalAttempts: 10,
      totalCorrect: 1,
      recentWindow: [false, false, false, false, false, false, false, false, false, true],
    })
    const score = computeMasteryScore(profile)
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThanOrEqual(30)
  })

  it('returns a high score for consistently correct answers with volume', () => {
    const profile = makeTopicProfile({
      totalAttempts: 15,
      totalCorrect: 14,
      recentWindow: [true, true, true, true, true, true, true, true, true, true],
      repeatedMistakeCount: 0,
    })
    const score = computeMasteryScore(profile)
    expect(score).toBeGreaterThanOrEqual(86)
  })

  it('penalizes repeated mistakes', () => {
    const baseProfile = makeTopicProfile({
      totalAttempts: 10,
      totalCorrect: 7,
      recentWindow: [true, true, true, false, true, true, false, true, true, true],
    })
    const withMistakes = makeTopicProfile({
      ...baseProfile,
      repeatedMistakeCount: 5,
    })

    const baseScore = computeMasteryScore(baseProfile)
    const penalizedScore = computeMasteryScore(withMistakes)
    expect(penalizedScore).toBeLessThan(baseScore)
  })

  it('gives partial credit for volume even with moderate accuracy', () => {
    const fewAttempts = makeTopicProfile({
      totalAttempts: 2,
      totalCorrect: 1,
      recentWindow: [true, false],
    })
    const manyAttempts = makeTopicProfile({
      totalAttempts: 10,
      totalCorrect: 5,
      recentWindow: [true, false, true, false, true, false, true, false, true, false],
    })

    const fewScore = computeMasteryScore(fewAttempts)
    const manyScore = computeMasteryScore(manyAttempts)
    // Both have 50% accuracy, but more attempts gives higher volume factor
    expect(manyScore).toBeGreaterThan(fewScore)
  })

  it('weighs recent accuracy heavily', () => {
    // Good overall but bad recently
    const decliningProfile = makeTopicProfile({
      totalAttempts: 20,
      totalCorrect: 15, // 75% overall
      recentWindow: [false, false, false, false, false, false, false, true, false, false],
    })
    // Bad overall but good recently
    const improvingProfile = makeTopicProfile({
      totalAttempts: 20,
      totalCorrect: 8, // 40% overall
      recentWindow: [true, true, true, true, true, true, true, true, true, true],
    })

    const decliningScore = computeMasteryScore(decliningProfile)
    const improvingScore = computeMasteryScore(improvingProfile)
    // The improving profile should score higher than you'd expect from overall alone
    // The declining profile should score lower than you'd expect from overall alone
    expect(improvingScore).toBeGreaterThan(decliningScore)
  })

  it('clamps score to [0, 100]', () => {
    const perfectProfile = makeTopicProfile({
      totalAttempts: 100,
      totalCorrect: 100,
      recentWindow: Array(10).fill(true),
      repeatedMistakeCount: 0,
    })
    const score = computeMasteryScore(perfectProfile)
    expect(score).toBeLessThanOrEqual(100)
    expect(score).toBeGreaterThanOrEqual(0)
  })
})

// ---------------------------------------------------------------------------
// computeTopicMastery
// ---------------------------------------------------------------------------

describe('computeTopicMastery', () => {
  it('returns "unknown" for zero attempts', () => {
    const profile = makeTopicProfile({ totalAttempts: 0 })
    expect(computeTopicMastery(profile)).toBe('unknown')
  })

  it('returns "learning" for few attempts with poor accuracy', () => {
    const profile = makeTopicProfile({
      totalAttempts: 3,
      totalCorrect: 0,
      recentWindow: [false, false, false],
    })
    expect(computeTopicMastery(profile)).toBe('learning')
  })

  it('returns "developing" for mixed results', () => {
    const profile = makeTopicProfile({
      totalAttempts: 10,
      totalCorrect: 5,
      recentWindow: [true, false, true, false, true, false, true, false, true, false],
    })
    const mastery = computeTopicMastery(profile)
    expect(mastery).toBe('developing')
  })

  it('returns "strong" for consistently correct answers', () => {
    const profile = makeTopicProfile({
      totalAttempts: 12,
      totalCorrect: 10,
      recentWindow: [true, true, true, true, true, true, false, true, true, true],
    })
    const mastery = computeTopicMastery(profile)
    expect(mastery).toBe('strong')
  })

  it('returns "mastered" for sustained high accuracy', () => {
    const profile = makeTopicProfile({
      totalAttempts: 20,
      totalCorrect: 19,
      recentWindow: [true, true, true, true, true, true, true, true, true, true],
      repeatedMistakeCount: 0,
    })
    expect(computeTopicMastery(profile)).toBe('mastered')
  })

  it('transitions from learning to developing with improving accuracy', () => {
    const learning = makeTopicProfile({
      totalAttempts: 5,
      totalCorrect: 1,
      recentWindow: [false, false, true, false, false],
    })
    const developing = makeTopicProfile({
      totalAttempts: 10,
      totalCorrect: 5,
      recentWindow: [true, true, false, true, false, true, false, true, true, false],
    })

    expect(computeTopicMastery(learning)).toBe('learning')
    expect(computeTopicMastery(developing)).toBe('developing')
  })
})

// ---------------------------------------------------------------------------
// computeQuestionMastery
// ---------------------------------------------------------------------------

describe('computeQuestionMastery', () => {
  it('returns "unknown" for never-attempted questions', () => {
    const profile = makeQuestionProfile({ totalAttempts: 0 })
    expect(computeQuestionMastery(profile)).toBe('unknown')
  })

  it('returns "learning" for a single incorrect attempt', () => {
    const profile = makeQuestionProfile({
      totalAttempts: 1,
      totalCorrect: 0,
      lastResult: false,
      consecutiveIncorrect: 1,
    })
    expect(computeQuestionMastery(profile)).toBe('learning')
  })

  it('returns "learning" for repeated mistakes with insufficient recovery', () => {
    const profile = makeQuestionProfile({
      totalAttempts: 4,
      totalCorrect: 2,
      lastResult: true,
      consecutiveCorrect: 1,
      isRepeatedMistake: true,
    })
    // isRepeatedMistake + consecutiveCorrect < 2 → capped at learning
    expect(computeQuestionMastery(profile)).toBe('learning')
  })

  it('returns "developing" for mixed results', () => {
    const profile = makeQuestionProfile({
      totalAttempts: 5,
      totalCorrect: 3,
      lastResult: true,
      consecutiveCorrect: 1,
    })
    expect(computeQuestionMastery(profile)).toBe('developing')
  })

  it('returns "strong" for high accuracy with streak', () => {
    const profile = makeQuestionProfile({
      totalAttempts: 5,
      totalCorrect: 4,
      lastResult: true,
      consecutiveCorrect: 2,
    })
    expect(computeQuestionMastery(profile)).toBe('strong')
  })

  it('returns "mastered" for sustained high accuracy with long streak', () => {
    const profile = makeQuestionProfile({
      totalAttempts: 7,
      totalCorrect: 6,
      lastResult: true,
      consecutiveCorrect: 4,
    })
    expect(computeQuestionMastery(profile)).toBe('mastered')
  })

  it('allows repeated mistakes to reach higher levels after recovery', () => {
    const profile = makeQuestionProfile({
      totalAttempts: 6,
      totalCorrect: 5,
      lastResult: true,
      consecutiveCorrect: 3,
      isRepeatedMistake: true,
    })
    // isRepeatedMistake but consecutiveCorrect >= 2, so not capped
    const mastery = computeQuestionMastery(profile)
    expect(mastery === 'strong' || mastery === 'mastered').toBe(true)
  })

  it('returns "learning" for all-wrong answers', () => {
    const profile = makeQuestionProfile({
      totalAttempts: 5,
      totalCorrect: 0,
      lastResult: false,
      consecutiveIncorrect: 5,
    })
    expect(computeQuestionMastery(profile)).toBe('learning')
  })
})
