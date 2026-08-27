/**
 * Adaptive Learning Engine — Type Definitions
 *
 * These types describe the data structures used by the adaptive engine
 * to track performance and select questions. All types are pure data —
 * no class instances, no side effects, no storage coupling.
 */

// ---------------------------------------------------------------------------
// Mastery Levels
// ---------------------------------------------------------------------------

/**
 * Conceptual mastery states. These are rough buckets, NOT scientifically
 * calibrated proficiency measures. They exist only to drive internal
 * question-selection heuristics.
 */
export type MasteryLevel = 'unknown' | 'learning' | 'developing' | 'strong' | 'mastered'

// ---------------------------------------------------------------------------
// Per-Topic Tracking
// ---------------------------------------------------------------------------

export interface TopicProfile {
  /** Canonical topic name (trimmed, case-preserved). */
  topic: string

  /** Total questions attempted for this topic across all results. */
  totalAttempts: number

  /** Total correct answers for this topic. */
  totalCorrect: number

  /**
   * Results from the most recent N attempts (sliding window).
   * Each entry is `true` for correct and `false` for incorrect.
   * Ordered newest-first.
   */
  recentWindow: boolean[]

  /** Average time spent per question in seconds (0 if unavailable). */
  averageTimeSeconds: number

  /**
   * Count of distinct questions that have been answered incorrectly
   * more than once for this topic.
   */
  repeatedMistakeCount: number

  /** Timestamp of the most recent attempt (ISO string), or null. */
  lastAttemptedAt: string | null
}

// ---------------------------------------------------------------------------
// Per-Question Tracking
// ---------------------------------------------------------------------------

export interface QuestionProfile {
  questionId: string

  /** How many times this exact question has been attempted. */
  totalAttempts: number

  /** How many times answered correctly. */
  totalCorrect: number

  /** Result of the most recent attempt: true = correct, false = incorrect, null = never attempted. */
  lastResult: boolean | null

  /** Consecutive correct answers in a row (resets on incorrect). */
  consecutiveCorrect: number

  /** Consecutive incorrect answers in a row (resets on correct). */
  consecutiveIncorrect: number

  /** Whether this question appears in the mistake repository. */
  isRepeatedMistake: boolean

  /** Timestamp of the most recent attempt (ISO string), or null. */
  lastAttemptedAt: string | null
}

// ---------------------------------------------------------------------------
// Aggregated Performance Snapshot
// ---------------------------------------------------------------------------

/**
 * A read-only, point-in-time view of the user's performance data.
 * Built from existing localStorage data (TestResult[], MistakeRecord[]).
 * Passed into selection functions as the sole context input.
 */
export interface PerformanceSnapshot {
  topicProfiles: Map<string, TopicProfile>
  questionProfiles: Map<string, QuestionProfile>

  /** Overall accuracy across all recorded attempts (0–1). */
  overallAccuracy: number

  /** Total number of questions answered across all attempts. */
  totalQuestionsAnswered: number

  /**
   * Results from the most recent N questions answered across all topics.
   * Each entry is `true` for correct, `false` for incorrect.
   * Ordered newest-first.
   */
  recentOverallWindow: boolean[]
}

// ---------------------------------------------------------------------------
// Selection Configuration
// ---------------------------------------------------------------------------

/**
 * Tunable knobs for the adaptive selection algorithm.
 * All fields have sensible defaults so callers can pass a partial config.
 */
export interface AdaptiveSelectionConfig {
  /**
   * Fraction of selected questions reserved for retention
   * (from "strong" or "mastered" topics). Range: 0–1.
   * @default 0.2
   */
  retentionRatio: number

  /**
   * Number of recent results to consider in the sliding window
   * for topic-level and overall recency tracking.
   * @default 10
   */
  recentWindowSize: number

  /**
   * Accuracy threshold (0–1) above which difficulty ramps up.
   * Requires at least `minQuestionsForDifficultyShift` recent answers.
   * @default 0.8
   */
  difficultyUpThreshold: number

  /**
   * Accuracy threshold (0–1) below which difficulty ramps down.
   * Requires at least `minQuestionsForDifficultyShift` recent answers.
   * @default 0.4
   */
  difficultyDownThreshold: number

  /**
   * Minimum number of recent answers required before the engine
   * considers shifting difficulty up or down.
   * @default 10
   */
  minQuestionsForDifficultyShift: number

  /**
   * Priority weight multiplier for questions from weak topics.
   * Higher = more aggressive weak-topic targeting.
   * @default 3.0
   */
  weakTopicWeight: number

  /**
   * Priority bonus for questions that are repeated mistakes.
   * @default 15
   */
  repeatedMistakeBonus: number

  /**
   * How many recent correct answers on a question before its priority
   * decays (to avoid re-drilling already-recovered questions).
   * @default 2
   */
  recencyDecayThreshold: number
}

/**
 * Returns a full config with defaults applied for any missing fields.
 */
export function defaultAdaptiveConfig(overrides: Partial<AdaptiveSelectionConfig> = {}): AdaptiveSelectionConfig {
  return {
    retentionRatio: 0.2,
    recentWindowSize: 10,
    difficultyUpThreshold: 0.8,
    difficultyDownThreshold: 0.4,
    minQuestionsForDifficultyShift: 10,
    weakTopicWeight: 3.0,
    repeatedMistakeBonus: 15,
    recencyDecayThreshold: 2,
    ...overrides,
  }
}
