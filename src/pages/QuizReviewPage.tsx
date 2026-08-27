import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, RotateCcw, ArrowRight } from 'lucide-react'
import { Question, Test, TestResult } from '@/types'
import { testRepository } from '@/services/test.service'
import { useQuizStore } from '@/store/quiz.store'
import { useHistoryStore } from '@/store/history.store'
import { ReviewFilterBar, ReviewFilterType } from '@/features/review/ReviewFilterBar'
import { QuestionReviewItem } from '@/features/review/QuestionReviewItem'
import { NextTestRecommendations } from '@/features/recommendations/NextTestRecommendations'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ErrorState } from '@/components/ui/ErrorState'

export const QuizReviewPage: React.FC = () => {
  const { testSlug } = useParams<{ testSlug: string }>()
  const navigate = useNavigate()

  const { lastCompletedResult, resetQuizSession } = useQuizStore()
  const { getLatestResultForTest } = useHistoryStore()

  const [test, setTest] = useState<Test | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [result, setResult] = useState<TestResult | null>(null)
  const [filter, setFilter] = useState<ReviewFilterType>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadError, setHasLoadError] = useState(false)

  useEffect(() => {
    if (!testSlug) return

    const currentResult = lastCompletedResult && lastCompletedResult.testSlug === testSlug
      ? lastCompletedResult
      : getLatestResultForTest(testSlug)

    if (!currentResult) {
      navigate(`/tests/${testSlug}`)
      return
    }

    setResult(currentResult)

    testRepository.getTestBySlug(testSlug).then(async (t) => {
      if (t) {
        setTest(t)
        const qList = await testRepository.getQuestionsForTest(t.id)
        setQuestions(qList)
      }
      setIsLoading(false)
    }).catch(() => {
      setHasLoadError(true)
      setIsLoading(false)
    })
  }, [testSlug, lastCompletedResult, getLatestResultForTest, navigate])

  const counts = useMemo(() => {
    if (!result) return { all: 0, correct: 0, incorrect: 0, unanswered: 0, flagged: 0 }
    return {
      all: questions.length,
      correct: result.correctAnswers,
      incorrect: result.incorrectAnswers,
      unanswered: result.unansweredQuestions,
      flagged: result.flaggedQuestions,
    }
  }, [questions, result])

  const filteredQuestions = useMemo(() => {
    if (!result) return []

    return questions.filter((q) => {
      const ans = result.answers[q.id]
      const isAnswered = ans && ans.selectedOptionId !== null
      const isCorrect = isAnswered && ans.selectedOptionId === q.correctOptionId
      const isFlagged = ans?.isMarkedForReview || false

      if (filter === 'correct') return isCorrect
      if (filter === 'incorrect') return isAnswered && !isCorrect
      if (filter === 'unanswered') return !isAnswered
      if (filter === 'flagged') return isFlagged
      return true
    })
  }, [questions, result, filter])

  if (hasLoadError) {
    return <ErrorState message="The answer review could not be loaded." onRetry={() => window.location.reload()} />
  }

  if (isLoading || !result || !test) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-surface-400" role="status">
        Loading test review and rationales...
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Dynamic Filter Announcement for Screen Readers */}
      <div className="sr-only" role="status" aria-live="polite">
        {`Showing ${filteredQuestions.length} ${filter} questions for review.`}
      </div>

      {/* Top Breadcrumb navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to={`/quiz/${testSlug}/result`}
          className="inline-flex items-center gap-1 text-xs text-surface-500 hover:text-surface-900 dark:hover:text-surface-200 transition-colors focus-ring rounded p-1"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Result Summary</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant={result.passed ? 'success' : 'neutral'} size="sm">
            Score: {result.scorePercentage}%
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              resetQuizSession()
              navigate(`/quiz/${testSlug}`)
            }}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />}
          >
            Retake
          </Button>
        </div>
      </div>

      {/* Header Info */}
      <div className="border-b border-surface-200 dark:border-surface-800 pb-4">
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-surface-50 tracking-tight">
          Review Answers & Explanations
        </h1>
        <p className="text-xs text-surface-500 mt-1">
          {test.title} • {questions.length} Questions Total
        </p>
      </div>

      {/* Filter Tabs */}
      <ReviewFilterBar
        currentFilter={filter}
        onSelectFilter={setFilter}
        counts={counts}
      />

      {/* Questions Review List */}
      {filteredQuestions.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-surface-300 dark:border-surface-700 text-surface-500" role="status">
          No questions match the "{filter}" filter.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredQuestions.map((q) => {
            const originalIndex = questions.findIndex((orig) => orig.id === q.id)
            return (
              <QuestionReviewItem
                key={q.id}
                question={q}
                questionNumber={originalIndex + 1}
                answer={result.answers[q.id]}
              />
            )
          })}
        </div>
      )}

      {/* Bottom CTA and recommendations */}
      <div className="pt-8 border-t border-surface-200 dark:border-surface-800 flex items-center justify-between">
        <Link to={`/quiz/${testSlug}/result`}>
          <Button variant="outline" size="md" leftIcon={<ChevronLeft className="w-4 h-4" aria-hidden="true" />}>
            View Score Summary
          </Button>
        </Link>

        <Link to="/tests">
          <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" aria-hidden="true" />}>
            Take Another Test
          </Button>
        </Link>
      </div>

      {/* Next Recommended Tests */}
      <div className="pt-8">
        <NextTestRecommendations currentTestSlug={test.slug} />
      </div>
    </div>
  )
}
