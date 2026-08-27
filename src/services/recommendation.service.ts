import { Question, Test, TestResult } from '@/types'

export type RecommendationReason = 'weak-topic' | 'related-skill' | 'difficulty' | 'similar-test' | 'new-test'

export interface Recommendation {
  test: Test
  reason: RecommendationReason
}

export interface RecommendationContext {
  currentTest: Test
  allTests: Test[]
  currentQuestions?: Question[]
  results?: TestResult[]
  questionsByTestId?: Record<string, Question[]>
  limit?: number
}

interface WeakTopic {
  topic: string
  misses: number
  attempts: number
}

const normalize = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

function getWeakTopics(results: TestResult[], questionsByTestId: Record<string, Question[]>): WeakTopic[] {
  const topics = new Map<string, WeakTopic>()

  for (const result of results) {
    const questions = questionsByTestId[result.testId] || []
    for (const question of questions) {
      const answer = result.answers[question.id]
      if (!answer || answer.selectedOptionId === null || answer.selectedOptionId === undefined) continue
      const topic = question.topic.trim()
      if (!topic) continue
      const current = topics.get(topic) || { topic, misses: 0, attempts: 0 }
      current.attempts += 1
      if (answer.selectedOptionId !== question.correctOptionId) current.misses += 1
      topics.set(topic, current)
    }
  }

  return Array.from(topics.values())
    .filter((topic) => topic.attempts >= 2 && topic.misses / topic.attempts >= 0.5)
    .sort((a, b) => b.misses / b.attempts - a.misses / a.attempts || b.misses - a.misses)
}

function hasSharedValue(left: string[], right: string[]): boolean {
  const rightValues = new Set(right.map(normalize))
  return left.some((value) => rightValues.has(normalize(value)))
}

function difficultyDistance(current: Test['difficulty'], candidate: Test['difficulty']): number {
  const levels = ['beginner', 'intermediate', 'advanced']
  const currentIndex = levels.indexOf(current)
  const candidateIndex = levels.indexOf(candidate)
  if (currentIndex < 0 || candidateIndex < 0) return 0
  return Math.abs(currentIndex - candidateIndex)
}

export function getRecommendations({
  currentTest,
  allTests,
  currentQuestions = [],
  results = [],
  questionsByTestId = {},
  limit = 3,
}: RecommendationContext): Recommendation[] {
  const weakTopics = getWeakTopics(results, questionsByTestId)
  const currentTags = currentTest.tags.map((tag) => tag.name)
  const currentTopicNames = [...(currentTest.topics || []), ...currentTags]
  const currentCategory = normalize(currentTest.category.slug)
  const hasProgressEvidence = results.length > 0 && Object.keys(questionsByTestId).length > 0

  const ranked = allTests
    .filter((test) => test.slug !== currentTest.slug)
    .map((test) => {
      const candidateTopics = [...(test.topics || []), ...test.tags.map((tag) => tag.name)]
      const candidateQuestions = questionsByTestId[test.id] || []
      const candidateQuestionTopics = candidateQuestions.map((question) => question.topic).filter(Boolean) as string[]
      const weakTopic = weakTopics.find((weak) => hasSharedValue([weak.topic], [...candidateTopics, ...candidateQuestionTopics]))
      const sharesSkill = hasSharedValue(currentTopicNames, candidateTopics)
      const sameCategory = normalize(test.category.slug) === currentCategory
      const distance = difficultyDistance(currentTest.difficulty, test.difficulty)

      let score = 0
      let reason: RecommendationReason = 'new-test'
      if (weakTopic) {
        score += 100 + weakTopic.misses * 5
        reason = 'weak-topic'
      } else if (sharesSkill) {
        score += 70
        reason = 'related-skill'
      } else if (sameCategory) {
        score += 45
        reason = distance === 1 ? 'difficulty' : 'similar-test'
      } else if (distance === 1) {
        score += 20
        reason = 'difficulty'
      } else {
        score += 5
      }

      if (sameCategory) score += 15
      if (distance === 1) score += 8
      if (test.featured) score += 2
      if (hasProgressEvidence && weakTopics.length === 0) score -= 1
      if (currentQuestions.length > 0 && candidateTopics.length === 0) score -= 2

      return { test, reason, score }
    })
    .sort((a, b) => b.score - a.score || a.test.title.localeCompare(b.test.title))
    .slice(0, limit)

  return ranked.map(({ test, reason }) => ({ test, reason }))
}

export function recommendationReasonLabel(reason: RecommendationReason): string {
  switch (reason) {
    case 'weak-topic': return 'Practice a weak topic'
    case 'related-skill': return 'Build a related skill'
    case 'difficulty': return 'Adjust the difficulty'
    case 'similar-test': return 'Similar to this test'
    default: return 'A new test to explore'
  }
}
