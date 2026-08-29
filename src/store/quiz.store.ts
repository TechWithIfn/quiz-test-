import { create } from 'zustand'
import { Question, Test, TestAttempt, TestResult } from '@/types'
import { APP_CONFIG } from '@/config/constants'
import { StorageService } from '@/services/storage.service'
import { calculateTestResult } from '@/utils/scoring'
import { createAttempt, moveToQuestion, selectAnswer, tickAttempt } from '@/engine/quizEngine'
import { mistakeRepository } from '@/services/mistake.service'
import { testsApi, mapVerificationToTestResult, ApiClientError } from '@/lib/api'

interface QuizState {
  // Current active attempt state
  activeTest: Test | null
  questions: Question[]
  attempt: TestAttempt | null
  activeQuestionIndex: number
  isSubmitting: boolean
  submitError: string | null
  lastCompletedResult: TestResult | null

  // Actions
  startTest: (test: Test, questions: Question[], options?: { mode?: 'full-test' | 'single-question' | 'mistake-practice' | 'custom-test'; timeLimitMinutes?: number }) => void
  startSingleQuestionPractice: (test: Test, question: Question) => void
  resumeTest: (test: Test, questions: Question[]) => boolean
  selectOption: (questionId: string, optionId: string) => void
  clearOption: (questionId: string) => void
  toggleMarkForReview: (questionId: string) => void
  goToQuestion: (index: number) => void
  goToNextQuestion: () => void
  goToPreviousQuestion: () => void
  tickTimer: () => void
  submitTest: () => Promise<TestResult | null>
  resetQuizSession: () => void
}

export const useQuizStore = create<QuizState>((set, get) => ({
  activeTest: null,
  questions: [],
  attempt: StorageService.getItem<TestAttempt | null>(APP_CONFIG.storageKeys.activeAttempt, null),
  activeQuestionIndex: 0,
  isSubmitting: false,
  submitError: null,
  lastCompletedResult: null,

  startTest: (test: Test, questions: Question[], options = {}) => {
    const mode = options.mode || 'full-test'
    const created = createAttempt(test, questions, {
      mode,
      timeLimitMinutes: options.timeLimitMinutes ?? test.timeLimitMinutes,
    })
    const newAttempt = created.attempt

    StorageService.setItem(APP_CONFIG.storageKeys.activeAttempt, newAttempt)
    StorageService.setItem(APP_CONFIG.storageKeys.activeQuestions, created.questions)

    set({
      activeTest: test,
      questions: created.questions,
      attempt: newAttempt,
      activeQuestionIndex: 0,
      isSubmitting: false,
      lastCompletedResult: null,
    })
  },

  startSingleQuestionPractice: (test: Test, question: Question) => {
    const singleTestWrapper: Test = {
      ...test,
      title: `Practice: ${question.topic || test.title}`,
      shortDescription: `Focused single-question practice on ${question.topic || test.title}.`,
      totalQuestions: 1,
      timeLimitMinutes: Math.max(2, Math.ceil((question.estimatedTime || 60) / 60) * 2),
    }

    get().startTest(singleTestWrapper, [question], {
      mode: 'single-question',
      timeLimitMinutes: singleTestWrapper.timeLimitMinutes,
    })
  },

  resumeTest: (test: Test, questions: Question[]) => {
    const { attempt } = get()
    if (!attempt || attempt.status !== 'in_progress') return false

    if (attempt.testSlug !== test.slug || attempt.testId !== test.id) {
      StorageService.removeItem(APP_CONFIG.storageKeys.activeAttempt)
      StorageService.removeItem(APP_CONFIG.storageKeys.activeQuestions)
      set({ attempt: null })
      return false
    }

    const expiresAt = attempt.expiresAt ? new Date(attempt.expiresAt).getTime() : NaN
    const answerIds = Object.keys(attempt.answers || {})
    const questionIds = new Set(questions.map((question) => question.id))
    const hasCompatibleAnswers = answerIds.length === questions.length && answerIds.every((id) => questionIds.has(id))
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now() || !hasCompatibleAnswers) {
      StorageService.removeItem(APP_CONFIG.storageKeys.activeAttempt)
      StorageService.removeItem(APP_CONFIG.storageKeys.activeQuestions)
      set({ attempt: null })
      return false
    }

    const savedQuestions = StorageService.getItem<Question[]>(APP_CONFIG.storageKeys.activeQuestions, questions)
    if (!Array.isArray(savedQuestions)) {
      StorageService.removeItem(APP_CONFIG.storageKeys.activeAttempt)
      StorageService.removeItem(APP_CONFIG.storageKeys.activeQuestions)
      set({ attempt: null })
      return false
    }
    const savedById = new Map(savedQuestions.map((question) => [question.id, question]))
    const hasSameQuestions = savedQuestions.length === questions.length && questions.every((question) => {
      const saved = savedById.get(question.id)
      const savedOptionIds = Array.isArray(saved?.options) ? saved.options.map((option) => option.id).sort().join('|') : ''
      const currentOptionIds = question.options.map((option) => option.id).sort().join('|')
      return saved && saved.correctOptionId === question.correctOptionId && savedOptionIds === currentOptionIds
    })
    if (!hasSameQuestions) {
      StorageService.removeItem(APP_CONFIG.storageKeys.activeAttempt)
      StorageService.removeItem(APP_CONFIG.storageKeys.activeQuestions)
      set({ attempt: null })
      return false
    }
    const restoredQuestions = savedQuestions

    set({
      activeTest: test,
      questions: restoredQuestions,
      attempt,
      activeQuestionIndex: Math.min(attempt.currentQuestionIndex, Math.max(0, restoredQuestions.length - 1)),
      isSubmitting: false,
      lastCompletedResult: null,
    })
    return true
  },

  selectOption: (questionId: string, optionId: string) => {
    const { attempt } = get()
    if (!attempt || attempt.status !== 'in_progress') return

    const updatedAttempt = selectAnswer(attempt, questionId, optionId)

    StorageService.setItem(APP_CONFIG.storageKeys.activeAttempt, updatedAttempt)
    set({ attempt: updatedAttempt })
  },

  clearOption: (questionId: string) => {
    const { attempt } = get()
    if (!attempt || attempt.status !== 'in_progress') return

    const currentAnswer = attempt.answers[questionId]
    if (!currentAnswer) return

    const updatedAnswers = {
      ...attempt.answers,
      [questionId]: {
        ...currentAnswer,
        selectedOptionId: null,
      }
    }

    const updatedAttempt: TestAttempt = {
      ...attempt,
      answers: updatedAnswers
    }

    StorageService.setItem(APP_CONFIG.storageKeys.activeAttempt, updatedAttempt)
    set({ attempt: updatedAttempt })
  },

  toggleMarkForReview: (questionId: string) => {
    const { attempt } = get()
    if (!attempt || attempt.status !== 'in_progress') return

    const currentAnswer = attempt.answers[questionId] || {
      questionId,
      selectedOptionId: null,
      isMarkedForReview: false,
      timeSpentSeconds: 0
    }

    const updatedAnswers = {
      ...attempt.answers,
      [questionId]: {
        ...currentAnswer,
        isMarkedForReview: !currentAnswer.isMarkedForReview
      }
    }

    const updatedAttempt: TestAttempt = {
      ...attempt,
      answers: updatedAnswers
    }

    StorageService.setItem(APP_CONFIG.storageKeys.activeAttempt, updatedAttempt)
    set({ attempt: updatedAttempt })
  },

  goToQuestion: (index: number) => {
    const { questions, attempt } = get()
    if (index >= 0 && index < questions.length) {
      const nextIndex = Math.floor(index)
      set({ activeQuestionIndex: nextIndex })
      if (attempt) {
        const updated = moveToQuestion(attempt, nextIndex, questions.length)
        StorageService.setItem(APP_CONFIG.storageKeys.activeAttempt, updated)
        set({ attempt: updated })
      }
    }
  },

  goToNextQuestion: () => {
    const { activeQuestionIndex, questions, goToQuestion } = get()
    if (activeQuestionIndex < questions.length - 1) {
      goToQuestion(activeQuestionIndex + 1)
    }
  },

  goToPreviousQuestion: () => {
    const { activeQuestionIndex, goToQuestion } = get()
    if (activeQuestionIndex > 0) {
      goToQuestion(activeQuestionIndex - 1)
    }
  },

  tickTimer: () => {
    const { attempt } = get()
    if (!attempt || attempt.status !== 'in_progress') return

    const ticked = tickAttempt(attempt)
    const updatedAttempt = ticked.attempt

    StorageService.setItem(APP_CONFIG.storageKeys.activeAttempt, updatedAttempt)
    set({ attempt: updatedAttempt })

    if (ticked.shouldSubmit) {
      get().submitTest()
    }
  },

  submitTest: async () => {
    const { activeTest, questions, attempt } = get()
    if (!activeTest || !attempt || attempt.status === 'completed') return null

    const completedAt = new Date().toISOString()
    const totalAllocated = activeTest.timeLimitMinutes * 60
    const timeTakenSeconds = Math.max(1, totalAllocated - attempt.timeRemainingSeconds)

    // API-sourced tests expose no correct answers (verified server-side). Route
    // them through POST /api/tests/:slug/answers and visualize the reveal.
    const usesServerVerification = questions.some((q) => !q.correctOptionId)

    set({ isSubmitting: true, submitError: null })
    try {
      let result: TestResult

      if (usesServerVerification) {
        const submission = {
          answers: questions
            .filter((q) => attempt.answers[q.id]?.selectedOptionId)
            .map((q) => ({ questionId: q.id, optionIds: [attempt.answers[q.id].selectedOptionId as string] })),
        }
        const verification = await testsApi.verifyAnswers(activeTest.slug, submission)
        result = mapVerificationToTestResult({
          verification,
          test: activeTest,
          answers: attempt.answers,
          startedAt: attempt.startedAt,
          completedAt,
          timeTakenSeconds,
        })

        // Record mistakes from the authoritative reveal.
        const indexById = new Map(questions.map((q, i) => [q.id, i + 1]))
        for (const r of verification.results) {
          const selected = attempt.answers[r.questionId]?.selectedOptionId
          if (r.correct) {
            mistakeRepository.recordCorrect(activeTest.id, r.questionId)
            continue
          }
          if (!selected) continue
          mistakeRepository.recordIncorrect({
            questionId: r.questionId,
            testId: activeTest.id,
            testSlug: activeTest.slug,
            testTitle: activeTest.title,
            selectedOptionId: selected,
            correctOptionId: r.correctOptionIds[0] ?? '',
            attemptId: attempt.id,
            questionNumber: indexById.get(r.questionId) ?? 0,
            topic: questions.find((q) => q.id === r.questionId)?.topic,
            difficulty: questions.find((q) => q.id === r.questionId)?.difficulty,
          })
        }
      } else {
        // Custom / local tests still carry correctOptionId — score locally.
        result = calculateTestResult({
          attemptId: attempt.id,
          test: activeTest,
          questions,
          answers: attempt.answers,
          startedAt: attempt.startedAt,
          completedAt,
          timeTakenSeconds,
        })

        questions.forEach((question, index) => {
          const answer = attempt.answers[question.id]
          if (!answer?.selectedOptionId) return
          if (answer.selectedOptionId === question.correctOptionId) {
            mistakeRepository.recordCorrect(activeTest.id, question.id)
            return
          }
          mistakeRepository.recordIncorrect({
            questionId: question.id,
            testId: activeTest.id,
            testSlug: activeTest.slug,
            testTitle: activeTest.title,
            selectedOptionId: answer.selectedOptionId,
            correctOptionId: question.correctOptionId,
            attemptId: attempt.id,
            questionNumber: index + 1,
            topic: question.topic,
            difficulty: question.difficulty,
          })
        })
      }

      const completedAttempt: TestAttempt = {
        ...attempt,
        status: 'completed',
        completedAt,
      }

      StorageService.removeItem(APP_CONFIG.storageKeys.activeAttempt)
      StorageService.removeItem(APP_CONFIG.storageKeys.activeQuestions)

      set({
        attempt: completedAttempt,
        lastCompletedResult: result,
        isSubmitting: false,
      })

      return result
    } catch (err) {
      // Online-only: surface a connection error rather than a fake offline result.
      const message =
        err instanceof ApiClientError && err.status === 0
          ? 'Connection error — could not verify your answers. Please check your network and retry.'
          : 'Could not submit your answers. Please retry.'
      set({ isSubmitting: false, submitError: message })
      return null
    }
  },

  resetQuizSession: () => {
    StorageService.removeItem(APP_CONFIG.storageKeys.activeAttempt)
    set({
      activeTest: null,
      questions: [],
      attempt: null,
      activeQuestionIndex: 0,
      isSubmitting: false,
    })
  }
}))
