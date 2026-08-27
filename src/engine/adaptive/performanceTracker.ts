/**
 * Performance Tracker — Pure Functions
 *
 * Builds TopicProfile, QuestionProfile, and PerformanceSnapshot from
 * existing locally-available data (TestResult[], MistakeRecord[], Question[]).
 *
 * No side effects, no localStorage access, no imports from stores or services.
 */

import { TestResult, Question, MistakeRecord, Answer } from '@/types'
import {
  TopicProfile,
  QuestionProfile,
  PerformanceSnapshot,
  AdaptiveSelectionConfig,
  defaultAdaptiveConfig,
} from './adaptiveTypes'

// ---------------------------------------------------------------------------
// Build Topic Profiles
// ---------------------------------------------------------------------------

/**
 * Aggregates topic-level performance from completed test results.
 *
 * For each question answered in each result:
 *   - Increments total attempts and correct count for the question's topic
 *   - Appends to the recent window (newest-first, capped at windowSize)
 *   - Accumulates time-per-question for average calculation
 *
 * @param results  — Completed test results, ordered newest-first
 * @param questions — All questions in the pool (used for topic mapping)
 * @param config   — Adaptive config (for recentWindowSize)
 */
export function buildTopicProfiles(
  results: TestResult[],
  questions: Question[],
  config: Partial<AdaptiveSelectionConfig> = {}
): Map<string, TopicProfile> {
  const { recentWindowSize } = defaultAdaptiveConfig(config)
  const questionById = new Map(questions.map(q => [q.id, q]))
  const profiles = new Map<string, TopicProfile>()

  // Process results newest-first so recent window fills correctly
  for (const result of results) {
    for (const [questionId, answer] of Object.entries(result.answers)) {
      if (answer.selectedOptionId === null || answer.selectedOptionId === undefined) continue

      const question = questionById.get(questionId)
      if (!question) continue

      const topic = question.topic.trim() || 'Uncategorized'
      const isCorrect = answer.selectedOptionId === question.correctOptionId

      let profile = profiles.get(topic)
      if (!profile) {
        profile = {
          topic,
          totalAttempts: 0,
          totalCorrect: 0,
          recentWindow: [],
          averageTimeSeconds: 0,
          repeatedMistakeCount: 0,
          lastAttemptedAt: null,
        }
        profiles.set(topic, profile)
      }

      profile.totalAttempts += 1
      if (isCorrect) profile.totalCorrect += 1

      // Append to recent window (cap at windowSize)
      if (profile.recentWindow.length < recentWindowSize) {
        profile.recentWindow.push(isCorrect)
      }

      // Track time (accumulate, will average later)
      if (answer.timeSpentSeconds > 0) {
        profile.averageTimeSeconds += answer.timeSpentSeconds
      }

      // Track most recent attempt timestamp
      const attemptTime = answer.answeredAt || result.completedAt
      if (!profile.lastAttemptedAt || attemptTime > profile.lastAttemptedAt) {
        profile.lastAttemptedAt = attemptTime
      }
    }
  }

  // Finalize averages
  for (const profile of profiles.values()) {
    if (profile.totalAttempts > 0) {
      profile.averageTimeSeconds = profile.averageTimeSeconds / profile.totalAttempts
    }
  }

  return profiles
}

// ---------------------------------------------------------------------------
// Enrich Topic Profiles with Mistake Data
// ---------------------------------------------------------------------------

/**
 * Counts repeated mistakes per topic and adds them to profiles.
 * A "repeated mistake" is a question that appears in mistakes[] more than once
 * (i.e., was answered incorrectly in multiple attempts).
 */
export function enrichTopicProfilesWithMistakes(
  profiles: Map<string, TopicProfile>,
  mistakes: MistakeRecord[],
  questions: Question[]
): void {
  const questionById = new Map(questions.map(q => [q.id, q]))

  // Count how many distinct mistake records exist per question
  const mistakeCountByQuestion = new Map<string, number>()
  for (const mistake of mistakes) {
    const count = mistakeCountByQuestion.get(mistake.questionId) || 0
    mistakeCountByQuestion.set(mistake.questionId, count + 1)
  }

  // Tally repeated mistakes per topic
  const repeatedByTopic = new Map<string, number>()
  for (const [questionId, count] of mistakeCountByQuestion) {
    if (count < 2) continue // Only count as "repeated" if wrong 2+ times
    const question = questionById.get(questionId)
    if (!question) continue
    const topic = question.topic.trim() || 'Uncategorized'
    repeatedByTopic.set(topic, (repeatedByTopic.get(topic) || 0) + 1)
  }

  for (const [topic, count] of repeatedByTopic) {
    const profile = profiles.get(topic)
    if (profile) {
      profile.repeatedMistakeCount = count
    }
  }
}

// ---------------------------------------------------------------------------
// Build Question Profiles
// ---------------------------------------------------------------------------

/**
 * Builds per-question performance profiles from result history and mistake records.
 *
 * For each question:
 *   - Tallies attempts and correct count across all results
 *   - Tracks consecutive correct/incorrect streaks
 *   - Flags repeated mistakes from the mistake repository
 */
export function buildQuestionProfiles(
  results: TestResult[],
  questions: Question[],
  mistakes: MistakeRecord[]
): Map<string, QuestionProfile> {
  const profiles = new Map<string, QuestionProfile>()

  // Identify repeated-mistake question IDs
  const mistakeCountByQuestion = new Map<string, number>()
  for (const mistake of mistakes) {
    mistakeCountByQuestion.set(
      mistake.questionId,
      (mistakeCountByQuestion.get(mistake.questionId) || 0) + 1
    )
  }

  // Initialize profiles for all pool questions
  for (const question of questions) {
    profiles.set(question.id, {
      questionId: question.id,
      totalAttempts: 0,
      totalCorrect: 0,
      lastResult: null,
      consecutiveCorrect: 0,
      consecutiveIncorrect: 0,
      isRepeatedMistake: (mistakeCountByQuestion.get(question.id) || 0) >= 2,
      lastAttemptedAt: null,
    })
  }

  // Build timeline of answers per question (oldest-first for streak calc)
  const answerTimeline = new Map<string, { isCorrect: boolean; timestamp: string }[]>()

  // Process results oldest-first to build chronological timeline
  const sortedResults = [...results].sort((a, b) =>
    a.completedAt.localeCompare(b.completedAt)
  )

  for (const result of sortedResults) {
    for (const [questionId, answer] of Object.entries(result.answers)) {
      if (answer.selectedOptionId === null || answer.selectedOptionId === undefined) continue

      const profile = profiles.get(questionId)
      if (!profile) continue

      const question = questions.find(q => q.id === questionId)
      if (!question) continue

      const isCorrect = answer.selectedOptionId === question.correctOptionId
      const timestamp = answer.answeredAt || result.completedAt

      if (!answerTimeline.has(questionId)) {
        answerTimeline.set(questionId, [])
      }
      answerTimeline.get(questionId)!.push({ isCorrect, timestamp })

      profile.totalAttempts += 1
      if (isCorrect) profile.totalCorrect += 1
    }
  }

  // Compute streaks and last result from timelines
  for (const [questionId, timeline] of answerTimeline) {
    const profile = profiles.get(questionId)
    if (!profile || timeline.length === 0) continue

    const last = timeline[timeline.length - 1]
    profile.lastResult = last.isCorrect
    profile.lastAttemptedAt = last.timestamp

    // Count consecutive streak from the end
    let consecutiveCorrect = 0
    let consecutiveIncorrect = 0
    for (let i = timeline.length - 1; i >= 0; i--) {
      if (timeline[i].isCorrect) {
        if (consecutiveIncorrect > 0) break
        consecutiveCorrect++
      } else {
        if (consecutiveCorrect > 0) break
        consecutiveIncorrect++
      }
    }
    profile.consecutiveCorrect = consecutiveCorrect
    profile.consecutiveIncorrect = consecutiveIncorrect
  }

  return profiles
}

// ---------------------------------------------------------------------------
// Build Aggregated Snapshot
// ---------------------------------------------------------------------------

/**
 * Combines topic profiles, question profiles, and overall stats into
 * a single PerformanceSnapshot ready for the selection algorithm.
 */
export function buildPerformanceSnapshot(
  results: TestResult[],
  questions: Question[],
  mistakes: MistakeRecord[],
  config: Partial<AdaptiveSelectionConfig> = {}
): PerformanceSnapshot {
  const { recentWindowSize } = defaultAdaptiveConfig(config)

  // Build profiles
  const topicProfiles = buildTopicProfiles(results, questions, config)
  enrichTopicProfilesWithMistakes(topicProfiles, mistakes, questions)
  const questionProfiles = buildQuestionProfiles(results, questions, mistakes)

  // Compute overall stats
  let totalAnswered = 0
  let totalCorrect = 0
  const recentOverallWindow: boolean[] = []

  // Process results newest-first for recent window
  for (const result of results) {
    const answeredEntries: { answer: Answer; question: Question | undefined }[] = []
    for (const [questionId, answer] of Object.entries(result.answers)) {
      if (answer.selectedOptionId === null || answer.selectedOptionId === undefined) continue
      answeredEntries.push({ answer, question: questions.find(q => q.id === questionId) })
    }

    for (const { answer, question } of answeredEntries) {
      if (!question) continue
      totalAnswered += 1
      const isCorrect = answer.selectedOptionId === question.correctOptionId
      if (isCorrect) totalCorrect += 1

      if (recentOverallWindow.length < recentWindowSize) {
        recentOverallWindow.push(isCorrect)
      }
    }
  }

  return {
    topicProfiles,
    questionProfiles,
    overallAccuracy: totalAnswered > 0 ? totalCorrect / totalAnswered : 0,
    totalQuestionsAnswered: totalAnswered,
    recentOverallWindow,
  }
}
