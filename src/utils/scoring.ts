import { Answer, Question, Test, TestResult, CategoryScoreSummary, TopicScoreSummary } from '@/types'

export interface CalculateResultParams {
  attemptId: string
  test: Test
  questions: Question[]
  answers: Record<string, Answer>
  startedAt: string
  completedAt: string
  timeTakenSeconds: number
}

/**
 * Pure scoring calculation engine. Agnostic of UI or platform.
 */
export function calculateTestResult({
  attemptId,
  test,
  questions,
  answers,
  startedAt,
  completedAt,
  timeTakenSeconds,
}: CalculateResultParams): TestResult {
  const totalQuestions = questions.length
  let answeredQuestions = 0
  let correctAnswers = 0
  let incorrectAnswers = 0
  let flaggedQuestions = 0
  let scorePoints = 0
  let maxPoints = 0

  const categoryMap: Record<string, { total: number; correct: number }> = {}
  const topicMap: Record<string, { total: number; attempted: number; correct: number; timeSeconds: number }> = {}

  for (const q of questions) {
    const qCategory = q.category || test.category.name
    const topic = q.topic.trim() || 'Uncategorized'
    if (!categoryMap[qCategory]) {
      categoryMap[qCategory] = { total: 0, correct: 0 }
    }
    categoryMap[qCategory].total += 1
    if (!topicMap[topic]) topicMap[topic] = { total: 0, attempted: 0, correct: 0, timeSeconds: 0 }
    topicMap[topic].total += 1
    maxPoints += q.points || 1

    const answer = answers[q.id]
    if (answer?.isMarkedForReview) {
      flaggedQuestions += 1
    }

    if (answer && answer.selectedOptionId !== null && answer.selectedOptionId !== undefined) {
      answeredQuestions += 1
      topicMap[topic].attempted += 1
      topicMap[topic].timeSeconds += answer.timeSpentSeconds || 0
      if (answer.selectedOptionId === q.correctOptionId) {
        correctAnswers += 1
        scorePoints += q.points || 1
        categoryMap[qCategory].correct += 1
        topicMap[topic].correct += 1
      } else {
        incorrectAnswers += 1
      }
    }
  }

  const unansweredQuestions = Math.max(0, totalQuestions - answeredQuestions)
  const scorePercentage = maxPoints > 0 ? Math.round((scorePoints / maxPoints) * 100) : 0
  const passed = scorePercentage >= test.passingScorePercentage

  const categoryBreakdown: Record<string, CategoryScoreSummary> = {}
  for (const [catName, data] of Object.entries(categoryMap)) {
    categoryBreakdown[catName] = {
      category: catName,
      totalQuestions: data.total,
      correctQuestions: data.correct,
      accuracyPercentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
    }
  }

  const topicBreakdown: Record<string, TopicScoreSummary> = {}
  for (const [topic, data] of Object.entries(topicMap)) {
    const incorrectQuestions = data.attempted - data.correct
    topicBreakdown[topic] = {
      topic,
      totalQuestions: data.total,
      attemptedQuestions: data.attempted,
      correctQuestions: data.correct,
      incorrectQuestions,
      accuracyPercentage: data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0,
      averageTimeSeconds: data.attempted > 0 ? Math.round(data.timeSeconds / data.attempted) : undefined,
    }
  }

  return {
    attemptId,
    testId: test.id,
    testSlug: test.slug,
    testTitle: test.title,
    totalQuestions,
    answeredQuestions,
    unansweredQuestions,
    correctAnswers,
    incorrectAnswers,
    flaggedQuestions,
    scorePoints,
    maxPoints,
    scorePercentage,
    passed,
    passingScorePercentage: test.passingScorePercentage,
    totalTimeSeconds: test.timeLimitMinutes * 60,
    timeTakenSeconds,
    categoryBreakdown,
    topicBreakdown,
    startedAt,
    completedAt,
    answers,
  }
}
