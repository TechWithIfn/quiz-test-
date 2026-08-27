import { Answer, Question, TestResult } from '@/types'

export interface TopicPerformance {
  topic: string
  total: number
  attempted: number
  correct: number
  incorrect: number
  accuracyPercentage: number
  averageTimeSeconds?: number
}

export interface PerformanceInsights {
  strongAreas: TopicPerformance[]
  weakAreas: TopicPerformance[]
}

export function getPerformanceInsights(
  questions: Question[],
  result: Pick<TestResult, 'answers' | 'topicBreakdown'>
): PerformanceInsights {
  if (result.topicBreakdown) {
    const areas = Object.values(result.topicBreakdown).map((topic) => ({
      topic: topic.topic,
      total: topic.totalQuestions,
      attempted: topic.attemptedQuestions,
      correct: topic.correctQuestions,
      incorrect: topic.incorrectQuestions,
      accuracyPercentage: topic.accuracyPercentage,
      averageTimeSeconds: topic.averageTimeSeconds,
    }))
    const supportedAreas = areas.filter((area) => area.attempted >= 2)
    return {
      strongAreas: supportedAreas.filter((area) => area.accuracyPercentage >= 70).sort((a, b) => b.accuracyPercentage - a.accuracyPercentage),
      weakAreas: supportedAreas.filter((area) => area.accuracyPercentage < 70).sort((a, b) => a.accuracyPercentage - b.accuracyPercentage),
    }
  }

  const topicMap = new Map<string, { total: number; attempted: number; correct: number; timeSeconds: number }>()

  for (const question of questions) {
    const topic = question.topic.trim() || 'Uncategorized'
    const current = topicMap.get(topic) || { total: 0, attempted: 0, correct: 0, timeSeconds: 0 }
    const answer: Answer | undefined = result.answers[question.id]
    current.total += 1
    if (answer?.selectedOptionId !== null && answer?.selectedOptionId !== undefined) {
      current.attempted += 1
      current.timeSeconds += answer.timeSpentSeconds || 0
      if (answer.selectedOptionId === question.correctOptionId) current.correct += 1
    }
    topicMap.set(topic, current)
  }

  const areas = Array.from(topicMap.entries()).map(([topic, data]) => ({
    topic,
    total: data.total,
    attempted: data.attempted,
    correct: data.correct,
    incorrect: data.attempted - data.correct,
    accuracyPercentage: data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0,
    averageTimeSeconds: data.attempted > 0 ? Math.round(data.timeSeconds / data.attempted) : undefined,
  }))

  const supportedAreas = areas.filter((area) => area.attempted >= 2)

  return {
    strongAreas: supportedAreas.filter((area) => area.accuracyPercentage >= 70).sort((a, b) => b.accuracyPercentage - a.accuracyPercentage),
    weakAreas: supportedAreas.filter((area) => area.accuracyPercentage < 70).sort((a, b) => a.accuracyPercentage - b.accuracyPercentage),
  }
}
