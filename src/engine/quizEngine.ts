import { Answer, Question, Test, TestAttempt, QuizMode } from '@/types'
import { randomizeQuiz, RandomSource } from './questionRandomizer'

export interface CreateAttemptOptions {
  mode?: QuizMode
  timeLimitMinutes?: number
  random?: RandomSource
}

export function createAttempt(
  test: Test,
  questions: Question[],
  optionsOrRandom: CreateAttemptOptions | RandomSource = Math.random
): {
  attempt: TestAttempt
  questions: Question[]
} {
  const options: CreateAttemptOptions = typeof optionsOrRandom === 'function'
    ? { random: optionsOrRandom }
    : optionsOrRandom

  const random = options.random || Math.random
  const mode = options.mode || 'full-test'
  const timeLimitMinutes = options.timeLimitMinutes ?? test.timeLimitMinutes ?? 10

  const randomized = mode === 'single-question' ? { questions: [...questions] } : randomizeQuiz(questions, random)
  const answers: Record<string, Answer> = {}

  for (const question of randomized.questions) {
    answers[question.id] = {
      questionId: question.id,
      selectedOptionId: null,
      isMarkedForReview: false,
      timeSpentSeconds: 0,
    }
  }

  return {
    questions: randomized.questions,
    attempt: {
      id: `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      testId: test.id,
      testSlug: test.slug,
      testTitle: test.title,
      startedAt: new Date().toISOString(),
      status: 'in_progress',
      mode,
      answers,
      currentQuestionIndex: 0,
      timeRemainingSeconds: timeLimitMinutes * 60,
      expiresAt: new Date(Date.now() + timeLimitMinutes * 60 * 1000).toISOString(),
    },
  }
}

export function selectAnswer(attempt: TestAttempt, questionId: string, optionId: string): TestAttempt {
  if (attempt.status !== 'in_progress') return attempt
  const current = attempt.answers[questionId]
  if (!current) return attempt
  return {
    ...attempt,
    answers: {
      ...attempt.answers,
      [questionId]: { ...current, selectedOptionId: optionId, answeredAt: new Date().toISOString() },
    },
  }
}

export function moveToQuestion(attempt: TestAttempt, index: number, questionCount: number): TestAttempt {
  if (index < 0 || index >= questionCount) return attempt
  return { ...attempt, currentQuestionIndex: index }
}

export function tickAttempt(attempt: TestAttempt, now = Date.now()): { attempt: TestAttempt; shouldSubmit: boolean } {
  if (attempt.status !== 'in_progress') return { attempt, shouldSubmit: false }
  if (attempt.expiresAt) {
    const timeRemainingSeconds = Math.max(0, Math.ceil((new Date(attempt.expiresAt).getTime() - now) / 1000))
    if (timeRemainingSeconds === attempt.timeRemainingSeconds && timeRemainingSeconds > 0) {
      return { attempt, shouldSubmit: false }
    }
    return {
      attempt: { ...attempt, timeRemainingSeconds },
      shouldSubmit: timeRemainingSeconds === 0,
    }
  }
  if (attempt.timeRemainingSeconds <= 0) return { attempt, shouldSubmit: false }
  const timeRemainingSeconds = Math.max(0, attempt.timeRemainingSeconds - 1)
  return {
    attempt: { ...attempt, timeRemainingSeconds },
    shouldSubmit: timeRemainingSeconds === 0,
  }
}

export function isComplete(attempt: TestAttempt | null): boolean {
  return attempt?.status === 'completed'
}
