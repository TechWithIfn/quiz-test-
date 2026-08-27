/**
 * Adaptive Learning Engine — Barrel Export
 */

export type { MasteryLevel, TopicProfile, QuestionProfile, PerformanceSnapshot, AdaptiveSelectionConfig } from './adaptiveTypes'
export { defaultAdaptiveConfig } from './adaptiveTypes'
export { computeMasteryScore, computeTopicMastery, computeQuestionMastery } from './masteryCalculator'
export { buildTopicProfiles, buildQuestionProfiles, buildPerformanceSnapshot, enrichTopicProfilesWithMistakes } from './performanceTracker'
export { computeRecommendedDifficulty, computeDifficultyScore } from './difficultyManager'
export type { RecommendedDifficulty } from './difficultyManager'
export { selectAdaptiveQuestions } from './adaptiveSelector'
export type { RandomSource } from './adaptiveSelector'
