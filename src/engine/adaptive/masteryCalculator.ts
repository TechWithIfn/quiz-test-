/**
 * Mastery Calculator — Pure Functions
 *
 * Computes mastery levels and scores from TopicProfile / QuestionProfile data.
 *
 * IMPORTANT: These scores are heuristic approximations.
 * They are NOT scientifically calibrated, NOT based on Item Response Theory,
 * and NOT comparable across users. They exist solely to inform internal
 * question-selection priority within a single user's adaptive session.
 */

import { MasteryLevel, TopicProfile, QuestionProfile } from './adaptiveTypes'

// ---------------------------------------------------------------------------
// Topic Mastery
// ---------------------------------------------------------------------------

/**
 * Computes a 0–100 mastery score for a topic based on its profile.
 *
 * The score is a weighted combination of:
 *   - Overall accuracy (40% weight)
 *   - Recent accuracy from the sliding window (35% weight)
 *   - Volume / confidence factor (15% weight)
 *   - Penalty for repeated mistakes (10% weight, subtractive)
 *
 * This is intentionally a rough heuristic — not a psychometric measure.
 */
export function computeMasteryScore(profile: TopicProfile): number {
  if (profile.totalAttempts === 0) return 0

  // Overall accuracy: 0–1
  const overallAccuracy = profile.totalCorrect / profile.totalAttempts

  // Recent accuracy: 0–1 (from sliding window, or fall back to overall)
  let recentAccuracy = overallAccuracy
  if (profile.recentWindow.length > 0) {
    const recentCorrect = profile.recentWindow.filter(Boolean).length
    recentAccuracy = recentCorrect / profile.recentWindow.length
  }

  // Volume factor: ramps from 0 to 1 as attempts go from 1 to 10+
  // Gives partial credit for having attempted more questions
  const volumeFactor = Math.min(1, profile.totalAttempts / 10)

  // Mistake penalty: 0–1, higher when many repeated mistakes exist
  // Capped at the total number of attempts to stay proportional
  const mistakePenalty = profile.totalAttempts > 0
    ? Math.min(1, profile.repeatedMistakeCount / Math.max(1, profile.totalAttempts))
    : 0

  const rawScore =
    overallAccuracy * 40 +
    recentAccuracy * 35 +
    volumeFactor * 15 -
    mistakePenalty * 10

  return Math.max(0, Math.min(100, Math.round(rawScore)))
}

/**
 * Maps a TopicProfile to a conceptual mastery level.
 *
 * Thresholds (tunable heuristics, not scientific boundaries):
 *   Unknown:    no attempts
 *   Learning:   score 1–30
 *   Developing: score 31–60
 *   Strong:     score 61–85
 *   Mastered:   score 86–100
 */
export function computeTopicMastery(profile: TopicProfile): MasteryLevel {
  const score = computeMasteryScore(profile)
  return scoreToMasteryLevel(score, profile.totalAttempts)
}

// ---------------------------------------------------------------------------
// Question Mastery
// ---------------------------------------------------------------------------

/**
 * Derives a mastery level for a single question based on its answer history.
 *
 * Rules:
 *   - Never attempted → unknown
 *   - Attempted but mostly wrong or recent streak of incorrect → learning
 *   - Mixed results → developing
 *   - Mostly correct with recent correct streak → strong
 *   - High accuracy + 3+ consecutive correct → mastered
 */
export function computeQuestionMastery(profile: QuestionProfile): MasteryLevel {
  if (profile.totalAttempts === 0) return 'unknown'

  const accuracy = profile.totalCorrect / profile.totalAttempts

  // Repeated mistake that hasn't been recovered → learning at best
  if (profile.isRepeatedMistake && profile.consecutiveCorrect < 2) {
    return 'learning'
  }

  if (accuracy < 0.3) return 'learning'
  if (accuracy < 0.6) return 'developing'

  // Need at least 3 consecutive correct to reach mastered
  if (accuracy >= 0.85 && profile.consecutiveCorrect >= 3) return 'mastered'
  if (accuracy >= 0.7 && profile.consecutiveCorrect >= 2) return 'strong'
  if (accuracy >= 0.6) return 'developing'

  return 'learning'
}

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

function scoreToMasteryLevel(score: number, totalAttempts: number): MasteryLevel {
  if (totalAttempts === 0) return 'unknown'
  if (score >= 86) return 'mastered'
  if (score >= 61) return 'strong'
  if (score >= 31) return 'developing'
  return 'learning'
}
