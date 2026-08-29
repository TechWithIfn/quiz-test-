import type {
  Answer,
  CategoryScoreSummary,
  DifficultyLevel,
  Question,
  Test,
  TestCategory,
  TestResult,
  TestTag,
  TopicScoreSummary,
} from '@/types'
import type {
  ApiAnswerVerification,
  ApiCategory,
  ApiQuestion,
  ApiTag,
  ApiTest,
} from './types'

export function mapCategory(category: ApiCategory): TestCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: category.icon,
    color: category.color,
  }
}

function mapTag(tag: ApiTag): TestTag {
  return { id: tag.id, name: tag.name, slug: tag.slug }
}

export function mapTest(test: ApiTest): Test {
  return {
    id: test.id,
    slug: test.slug,
    title: test.title,
    shortDescription: test.shortDescription,
    fullDescription: test.fullDescription,
    category: mapCategory(test.category),
    tags: (test.tags || []).map(mapTag),
    topics: test.topics ?? [],
    difficulty: test.difficulty as DifficultyLevel,
    timeLimitMinutes: test.estimatedMinutes,
    estimatedMinutes: test.estimatedMinutes,
    totalQuestions: test.totalQuestions,
    questionCount: test.totalQuestions,
    language: test.language,
    passingScorePercentage: test.passingScorePercentage,
    featured: test.featured,
    createdAt: test.createdAt,
    updatedAt: test.updatedAt,
  }
}

export function mapQuestion(q: ApiQuestion): Question {
  return {
    id: q.id,
    testId: q.testId ?? '',
    text: q.text,
    question: q.text,
    type: q.type ?? 'single-choice',
    codeSnippet: q.codeSnippet,
    codeLanguage: q.codeLanguage,
    options: q.options.map((o) => ({ id: o.id, text: o.text, codeSnippet: o.codeSnippet })),
    // Correct answers are NOT exposed by the public API; the server verifies them.
    correctOptionId: '',
    correctAnswer: '',
    explanation: q.explanation,
    hint: q.hint,
    points: q.points ?? 1,
    difficulty: q.difficulty ?? 'beginner',
    topic: q.topic ?? '',
    concept: q.concept,
    tags: q.tags ?? [],
    estimatedTime: q.estimatedTime,
    category: '',
  }
}

/**
 * Build a frontend `TestResult` from the backend's stateless verification reveal.
 * Server-side correctness is authoritative; the client only visualizes it.
 */
export function mapVerificationToTestResult(params: {
  verification: ApiAnswerVerification
  test: Test
  answers: Record<string, Answer>
  startedAt: string
  completedAt: string
  timeTakenSeconds: number
}): TestResult {
  const { verification, test, answers, startedAt, completedAt, timeTakenSeconds } = params

  const correctAnswers = verification.results.filter((r) => r.correct).length
  const answeredQuestions = verification.answeredCount
  const unansweredQuestions = verification.unanswered
  const incorrectAnswers = Math.max(0, answeredQuestions - correctAnswers)
  const flaggedQuestions = Object.values(answers).filter((a) => a?.isMarkedForReview).length
  const percentage = verification.score.percentage
  const total = verification.score.total || test.totalQuestions

  const topicBreakdown: Record<string, TopicScoreSummary> = {}
  for (const [topic, perf] of Object.entries(verification.topicPerformance)) {
    topicBreakdown[topic] = {
      topic,
      totalQuestions: perf.total,
      attemptedQuestions: perf.total,
      correctQuestions: perf.correct,
      incorrectQuestions: Math.max(0, perf.total - perf.correct),
      accuracyPercentage: perf.accuracy,
    }
  }

  const categoryBreakdown: Record<string, CategoryScoreSummary> = {
    [test.category.name]: {
      category: test.category.name,
      totalQuestions: total,
      correctQuestions: correctAnswers,
      accuracyPercentage: percentage,
    },
  }

  return {
    attemptId: `attempt-${test.slug}-${Date.now()}`,
    testId: test.id,
    testSlug: test.slug,
    testTitle: test.title,
    totalQuestions: total,
    answeredQuestions,
    unansweredQuestions,
    correctAnswers,
    incorrectAnswers,
    flaggedQuestions,
    scorePoints: verification.score.earned,
    maxPoints: total,
    scorePercentage: percentage,
    passed: percentage >= test.passingScorePercentage,
    passingScorePercentage: test.passingScorePercentage,
    totalTimeSeconds: timeTakenSeconds,
    timeTakenSeconds,
    categoryBreakdown,
    topicBreakdown,
    startedAt,
    completedAt,
    answers,
  }
}
