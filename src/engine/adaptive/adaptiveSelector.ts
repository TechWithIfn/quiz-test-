/**
 * Adaptive Question Selector — Core Selection Algorithm
 *
 * Selects questions from a pool using performance data to prioritize
 * weak areas, avoid unnecessary repetition, include retention questions,
 * and adapt difficulty to the user's level.
 *
 * This is a pure function — deterministic given the same inputs and
 * RandomSource. No side effects, no storage access.
 *
 * See docs/adaptive-algorithm.md for the full algorithm documentation.
 */

import { Question } from '@/types'
import {
  PerformanceSnapshot,
  AdaptiveSelectionConfig,
  defaultAdaptiveConfig,
} from './adaptiveTypes'
import { computeTopicMastery, computeQuestionMastery } from './masteryCalculator'
import { computeRecommendedDifficulty, computeDifficultyScore } from './difficultyManager'

export type RandomSource = () => number

// ---------------------------------------------------------------------------
// Priority Scoring
// ---------------------------------------------------------------------------

interface ScoredQuestion {
  question: Question
  priority: number
  isRetention: boolean
}

/**
 * Scores a question for selection priority.
 *
 * Priority is a sum of weighted factors:
 *   1. Topic mastery factor (weaker topics → higher priority)
 *   2. Question mastery factor (unseen/missed → higher priority)
 *   3. Repeated mistake bonus
 *   4. Difficulty alignment score
 *   5. Recency penalty (recently-correct questions → lower priority)
 */
function scoreQuestion(
  question: Question,
  snapshot: PerformanceSnapshot,
  config: AdaptiveSelectionConfig,
  recommendedDifficulty: 'beginner' | 'intermediate' | 'advanced'
): ScoredQuestion {
  const topic = question.topic.trim() || 'Uncategorized'
  const topicProfile = snapshot.topicProfiles.get(topic)
  const questionProfile = snapshot.questionProfiles.get(question.id)

  let priority = 0
  let isRetention = false

  // --- 1. Topic mastery factor ---
  if (topicProfile) {
    const topicMastery = computeTopicMastery(topicProfile)
    switch (topicMastery) {
      case 'unknown':    priority += 25; break
      case 'learning':   priority += 30 * config.weakTopicWeight; break
      case 'developing': priority += 20; break
      case 'strong':     priority += 5; isRetention = true; break
      case 'mastered':   priority += 2; isRetention = true; break
    }
  } else {
    // No data for this topic — treat as unknown, medium-high priority
    priority += 25
  }

  // --- 2. Question mastery factor ---
  if (questionProfile) {
    const questionMastery = computeQuestionMastery(questionProfile)
    switch (questionMastery) {
      case 'unknown':    priority += 20; break
      case 'learning':   priority += 25; break
      case 'developing': priority += 15; break
      case 'strong':     priority += 3; break
      case 'mastered':   priority += 1; break
    }
  } else {
    // Never attempted — high priority
    priority += 20
  }

  // --- 3. Repeated mistake bonus ---
  if (questionProfile?.isRepeatedMistake) {
    priority += config.repeatedMistakeBonus
  }

  // --- 4. Difficulty alignment ---
  priority += computeDifficultyScore(question, recommendedDifficulty)

  // --- 5. Recency penalty ---
  if (questionProfile && questionProfile.consecutiveCorrect >= config.recencyDecayThreshold) {
    // Already answered correctly several times in a row — reduce priority
    priority -= questionProfile.consecutiveCorrect * 3
  }

  return { question, priority: Math.max(0, priority), isRetention }
}

// ---------------------------------------------------------------------------
// Selection Algorithm
// ---------------------------------------------------------------------------

/**
 * Selects an adaptive set of questions from the pool.
 *
 * Algorithm steps:
 *   1. Score all questions by priority
 *   2. Separate into "weak/developing" and "retention" buckets
 *   3. Ensure at least one question from each weak topic
 *   4. Fill retention slots (configurable ratio)
 *   5. Fill remaining slots from highest-priority questions
 *   6. Guarantee no duplicates
 *   7. Shuffle final selection for presentation order
 *
 * @param pool     — All available questions to select from
 * @param snapshot — User's current performance data
 * @param config   — Tuning parameters (partial; defaults applied)
 * @param count    — Number of questions to select
 * @param random   — Deterministic random source for tie-breaking and shuffling
 * @returns Selected questions in shuffled presentation order
 */
export function selectAdaptiveQuestions(
  pool: Question[],
  snapshot: PerformanceSnapshot,
  config: Partial<AdaptiveSelectionConfig>,
  count: number,
  random: RandomSource
): Question[] {
  if (pool.length === 0 || count <= 0) return []

  const fullConfig = defaultAdaptiveConfig(config)
  const effectiveCount = Math.min(count, pool.length)

  // If no performance data, just shuffle and take the first N
  if (snapshot.totalQuestionsAnswered === 0) {
    return shuffleArray([...pool], random).slice(0, effectiveCount)
  }

  const recommendedDifficulty = computeRecommendedDifficulty(snapshot, fullConfig)

  // Score all questions
  const scored = pool.map(q => scoreQuestion(q, snapshot, fullConfig, recommendedDifficulty))

  // Separate into buckets
  const weakQuestions = scored.filter(s => !s.isRetention)
  const retentionQuestions = scored.filter(s => s.isRetention)

  // Sort each bucket by priority (descending), with deterministic tie-breaking
  const sortByPriority = (a: ScoredQuestion, b: ScoredQuestion) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    // Deterministic tie-break: use question ID
    return a.question.id.localeCompare(b.question.id)
  }
  weakQuestions.sort(sortByPriority)
  retentionQuestions.sort(sortByPriority)

  // --- Step 1: Ensure topic coverage for weak topics ---
  const selected = new Set<string>() // question IDs
  const selectedList: Question[] = []
  const coveredTopics = new Set<string>()

  // Identify weak topics (topics with mastery < developing)
  const weakTopics = new Set<string>()
  for (const [topic, profile] of snapshot.topicProfiles) {
    const mastery = computeTopicMastery(profile)
    if (mastery === 'learning' || mastery === 'unknown') {
      weakTopics.add(topic)
    }
  }

  // Add one question per weak topic (highest priority for that topic)
  for (const topic of weakTopics) {
    if (selectedList.length >= effectiveCount) break
    const topicQuestion = weakQuestions.find(
      s => (s.question.topic.trim() || 'Uncategorized') === topic && !selected.has(s.question.id)
    )
    if (topicQuestion) {
      selected.add(topicQuestion.question.id)
      selectedList.push(topicQuestion.question)
      coveredTopics.add(topic)
    }
  }

  // --- Step 2: Fill retention slots ---
  const retentionSlots = Math.max(1, Math.floor(effectiveCount * fullConfig.retentionRatio))
  let retentionFilled = 0
  for (const scored of retentionQuestions) {
    if (retentionFilled >= retentionSlots) break
    if (selectedList.length >= effectiveCount) break
    if (selected.has(scored.question.id)) continue
    selected.add(scored.question.id)
    selectedList.push(scored.question)
    retentionFilled++
  }

  // --- Step 3: Fill remaining slots from all scored questions by priority ---
  const allSorted = [...scored].sort(sortByPriority)
  for (const s of allSorted) {
    if (selectedList.length >= effectiveCount) break
    if (selected.has(s.question.id)) continue
    selected.add(s.question.id)
    selectedList.push(s.question)
  }

  // --- Step 4: Shuffle for presentation (avoid predictable ordering) ---
  return shuffleArray(selectedList, random)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shuffleArray<T>(items: T[], random: RandomSource): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
