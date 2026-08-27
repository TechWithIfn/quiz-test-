/**
 * Difficulty Manager — Pure Functions
 *
 * Determines the recommended difficulty level based on recent performance
 * and computes per-question difficulty alignment scores.
 *
 * Rules:
 *   - If recent accuracy > threshold over sufficient attempts → prefer harder
 *   - If recent accuracy < threshold over sufficient attempts → prefer easier
 *   - Otherwise → stay at current / intermediate level
 *   - Never completely exclude any difficulty (just weighted lower)
 */

import { Question } from '@/types'
import { PerformanceSnapshot, AdaptiveSelectionConfig, defaultAdaptiveConfig } from './adaptiveTypes'

export type RecommendedDifficulty = 'beginner' | 'intermediate' | 'advanced'

const DIFFICULTY_ORDER: RecommendedDifficulty[] = ['beginner', 'intermediate', 'advanced']

/**
 * Determines the recommended difficulty based on recent overall performance.
 *
 * @param snapshot — Current performance snapshot
 * @param config   — Adaptive config with difficulty thresholds
 * @returns The recommended difficulty level
 */
export function computeRecommendedDifficulty(
  snapshot: PerformanceSnapshot,
  config: Partial<AdaptiveSelectionConfig> = {}
): RecommendedDifficulty {
  const {
    difficultyUpThreshold,
    difficultyDownThreshold,
    minQuestionsForDifficultyShift,
  } = defaultAdaptiveConfig(config)

  const recent = snapshot.recentOverallWindow

  // Not enough data to shift — stay intermediate
  if (recent.length < minQuestionsForDifficultyShift) {
    return 'intermediate'
  }

  const recentCorrect = recent.filter(Boolean).length
  const recentAccuracy = recentCorrect / recent.length

  if (recentAccuracy >= difficultyUpThreshold) {
    return 'advanced'
  }

  if (recentAccuracy <= difficultyDownThreshold) {
    return 'beginner'
  }

  return 'intermediate'
}

/**
 * Computes a priority modifier for a question based on how well its
 * difficulty aligns with the recommended difficulty.
 *
 * - Exact match → +10
 * - One step away → +4
 * - Two steps away → +0
 *
 * This ensures no difficulty level is excluded, just deprioritized.
 */
export function computeDifficultyScore(
  question: Question,
  recommendedDifficulty: RecommendedDifficulty
): number {
  const questionDifficulty = question.difficulty
  if (!questionDifficulty) return 4

  const recommendedIndex = DIFFICULTY_ORDER.indexOf(recommendedDifficulty)
  const questionIndex = DIFFICULTY_ORDER.indexOf(questionDifficulty as RecommendedDifficulty)

  // Unknown difficulty values → treat as neutral match
  if (recommendedIndex < 0 || questionIndex < 0) return 4

  const distance = Math.abs(recommendedIndex - questionIndex)
  if (distance === 0) return 10
  if (distance === 1) return 4
  return 0
}
