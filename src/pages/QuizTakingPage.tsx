import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { testRepository } from '@/services/test.service'
import { useQuizStore } from '@/store/quiz.store'
import { useHistoryStore } from '@/store/history.store'
import { QuizHeader } from '@/features/quiz/QuizHeader'
import { QuestionCard } from '@/features/quiz/QuestionCard'
import { QuestionNavigator } from '@/features/quiz/QuestionNavigator'
import { QuizSubmitModal } from '@/features/quiz/QuizSubmitModal'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { AlertCircle } from 'lucide-react'
import { ErrorState } from '@/components/ui/ErrorState'
import { useQuizTimer } from '@/hooks/useQuizTimer'
import { SkipToContent } from '@/components/ui/SkipToContent'
import { QuestionSkeleton } from '@/components/ui/Skeletons'

export const QuizTakingPage: React.FC = () => {
  const { testSlug } = useParams<{ testSlug: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const {
    activeTest,
    questions,
    attempt,
    lastCompletedResult,
    activeQuestionIndex,
    startTest,
    resumeTest,
    selectOption,
    clearOption,
    toggleMarkForReview,
    goToQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    tickTimer,
    submitTest,
    resetQuizSession,
    isSubmitting,
    submitError,
  } = useQuizStore()

  const { saveResult } = useHistoryStore()

  useQuizTimer({
    isRunning: attempt?.status === 'in_progress',
    onTick: tickTimer,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)
  const [hasLoadError, setHasLoadError] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Initialize test session
  useEffect(() => {
    if (!testSlug) return

    // If already active on the same test, don't restart
    if (activeTest && activeTest.slug === testSlug && attempt && attempt.status !== 'abandoned') {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setHasLoadError(false)
    testRepository.getTestBySlug(testSlug).then(async (foundTest) => {
      if (!foundTest) {
        navigate('/tests')
        return
      }
      const qList = await testRepository.getQuestionsForTest(foundTest.id)
      if (!resumeTest(foundTest, qList)) {
        startTest(foundTest, qList)
      }
      const focusQuestionId = searchParams.get('question')
      if (focusQuestionId) {
        const focusedIndex = useQuizStore.getState().questions.findIndex((question) => question.id === focusQuestionId)
        if (focusedIndex >= 0) goToQuestion(focusedIndex)
      }
      setIsLoading(false)
    }).catch(() => {
      setHasLoadError(true)
      setIsLoading(false)
    })
  }, [testSlug, searchParams, activeTest, attempt, startTest, resumeTest, goToQuestion, navigate])

  useEffect(() => {
    if (attempt?.status !== 'in_progress') return

    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeLeaving)
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving)
  }, [attempt?.status])

  useEffect(() => {
    if (attempt?.status === 'completed' && lastCompletedResult && testSlug) {
      saveResult(lastCompletedResult)
      navigate(`/quiz/${testSlug}/result`, { replace: true })
    }
  }, [attempt?.status, lastCompletedResult, navigate, saveResult, testSlug])

  const handleFinalSubmit = async () => {
    setShowSubmitModal(false)
    await submitTest()
  }

  const handleConfirmExit = () => {
    setShowExitModal(false)
    resetQuizSession()
    navigate(`/tests/${testSlug}`)
  }

  if (hasLoadError) {
    return <ErrorState message="The quiz could not be started." onRetry={() => window.location.reload()} />
  }

  if (submitError) {
    return (
      <ErrorState
        message={submitError}
        onRetry={() => {
          void submitTest()
        }}
      />
    )
  }

  if (isSubmitting) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-surface-400" role="status" aria-live="polite">
        <div className="inline-block animate-pulse text-sm">Submitting your answers…</div>
      </div>
    )
  }

  if (isLoading || !activeTest || !attempt || questions.length === 0) {
    return <QuestionSkeleton />
  }

  const currentQuestion = questions[activeQuestionIndex]
  const currentAnswer = attempt.answers[currentQuestion.id]

  return (
    <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950 transition-colors">
      <SkipToContent targetId={`question-heading-${currentQuestion.id}`} label="Skip to question content" />
      {/* Quiz Top Runner Header */}
      <QuizHeader
        test={activeTest}
        attempt={attempt}
        totalQuestions={questions.length}
        currentIndex={activeQuestionIndex}
        onExit={() => setShowExitModal(true)}
        onRequestSubmit={() => setShowSubmitModal(true)}
      />

      {/* Main Runner Body */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Question Stem & Choice Canvas (3 cols) */}
          <div className="lg:col-span-3 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 sm:p-8 shadow-sm">
            <QuestionCard
              question={currentQuestion}
              questionNumber={activeQuestionIndex + 1}
              totalQuestions={questions.length}
              answer={currentAnswer}
              onSelectOption={(optId) => selectOption(currentQuestion.id, optId)}
              onClearOption={() => clearOption(currentQuestion.id)}
              onToggleReview={() => toggleMarkForReview(currentQuestion.id)}
              onNext={goToNextQuestion}
              onPrevious={goToPreviousQuestion}
              onSubmitQuiz={() => setShowSubmitModal(true)}
              isFirst={activeQuestionIndex === 0}
              isLast={activeQuestionIndex === questions.length - 1}
            />
          </div>

          {/* Question Palette Sidebar (1 col) */}
          <div className="lg:col-span-1 space-y-4">
            {/* Mobile collapsible toggle — keeps the palette from pushing the
                question/actions down the page. Always visible on desktop. */}
            <button
              type="button"
              onClick={() => setPaletteOpen((v) => !v)}
              className="lg:hidden w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-sm font-medium text-surface-700 dark:text-surface-300 focus-ring min-h-[44px]"
              aria-expanded={paletteOpen}
              aria-controls="question-palette-panel"
            >
              <span>Question Palette ({activeQuestionIndex + 1}/{questions.length})</span>
              <span className="text-surface-400">{paletteOpen ? 'Hide' : 'Show'}</span>
            </button>

            <div
              id="question-palette-panel"
              className={`space-y-4 ${paletteOpen ? 'block' : 'hidden'} lg:block`}
            >
              <QuestionNavigator
                questions={questions}
                answers={attempt.answers}
                activeIndex={activeQuestionIndex}
                onSelectQuestion={(idx) => {
                  goToQuestion(idx)
                  setPaletteOpen(false)
                }}
              />

              <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-xs text-surface-500 space-y-2">
                <div className="font-semibold text-surface-700 dark:text-surface-300">
                  Shortcuts
                </div>
                <div className="flex justify-between">
                  <span>Select option</span>
                  <span className="font-mono text-surface-700 dark:text-surface-300">1 - 4 or A - D</span>
                </div>
                <div className="flex justify-between">
                  <span>Mark for review</span>
                  <span className="font-mono text-surface-700 dark:text-surface-300">F</span>
                </div>
                <div className="flex justify-between">
                  <span>Next question</span>
                  <span className="font-mono text-surface-700 dark:text-surface-300">→</span>
                </div>
                <div className="flex justify-between">
                  <span>Previous question</span>
                  <span className="font-mono text-surface-700 dark:text-surface-300">←</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <QuizSubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirmSubmit={handleFinalSubmit}
        questions={questions}
        answers={attempt.answers}
      />

      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Leave Test Session?"
        description="Your current progress will be lost if you leave without submitting."
        maxWidth="sm"
      >
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>You can always take the test again at any time.</span>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowExitModal(false)}>
            Continue Test
          </Button>
          <Button variant="danger" size="sm" onClick={handleConfirmExit}>
            Exit Test
          </Button>
        </div>
      </Modal>
    </div>
  )
}
