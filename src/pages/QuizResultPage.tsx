import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { RotateCcw, ArrowRight, CheckSquare, Search } from 'lucide-react'
import { Question, TestResult } from '@/types'
import { testRepository } from '@/services/test.service'
import { useQuizStore } from '@/store/quiz.store'
import { useHistoryStore } from '@/store/history.store'
import { ScoreHero } from '@/features/results/ScoreHero'
import { MetricCards } from '@/features/results/MetricCards'
import { PerformanceInsights } from '@/features/results/PerformanceInsights'
import { CategoryBreakdown } from '@/features/results/CategoryBreakdown'
import { NextTestRecommendations } from '@/features/recommendations/NextTestRecommendations'
import { Button } from '@/components/ui/Button'

export const QuizResultPage: React.FC = () => {
  const { testSlug } = useParams<{ testSlug: string }>()
  const navigate = useNavigate()

  const { lastCompletedResult, resetQuizSession } = useQuizStore()
  const { getLatestResultForTest } = useHistoryStore()

  const [result, setResult] = useState<TestResult | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    if (lastCompletedResult && lastCompletedResult.testSlug === testSlug) {
      setResult(lastCompletedResult)
    } else if (testSlug) {
      const historical = getLatestResultForTest(testSlug)
      if (historical) {
        setResult(historical)
      } else {
        navigate(`/tests/${testSlug}`)
      }
    }

    if (testSlug) {
      testRepository.getTestBySlug(testSlug).then(async (test) => {
        if (test) setQuestions(await testRepository.getQuestionsForTest(test.id))
      })
    }
  }, [testSlug, lastCompletedResult, getLatestResultForTest, navigate])

  if (!result || !testSlug) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-surface-400" role="status">
        Loading test assessment summary...
      </div>
    )
  }

  const handleRetake = () => {
    resetQuizSession()
    navigate(`/quiz/${testSlug}`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Screen Reader Result Announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {`Test completed. You ${result.passed ? 'passed' : 'did not pass'}. Score: ${result.scorePercentage}%. ${result.correctAnswers} out of ${result.totalQuestions} questions correct.`}
      </div>

      {/* Hero Score Banner */}
      <ScoreHero result={result} />

      {/* Metrics Row */}
      <section aria-label="Performance Metrics">
        <MetricCards result={result} />
      </section>

      <section aria-label="Topic Breakdown">
        <CategoryBreakdown result={result} />
      </section>

      {/* Action Bar */}
      <div className="p-6 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(`/quiz/${testSlug}/review`)}
            leftIcon={<CheckSquare className="w-4 h-4" aria-hidden="true" />}
            className="w-full sm:w-auto"
          >
            Review Answers
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleRetake}
            leftIcon={<RotateCcw className="w-4 h-4" aria-hidden="true" />}
            className="w-full sm:w-auto"
          >
            Try Again
          </Button>
        </div>

        <Link to={`/tests?q=${encodeURIComponent(result.testTitle)}`} className="w-full sm:w-auto">
          <Button
            variant="ghost"
            size="md"
            rightIcon={<ArrowRight className="w-4 h-4" aria-hidden="true" />}
            className="w-full sm:w-auto text-brand-600 dark:text-brand-400"
          >
            Find Similar Tests
          </Button>
        </Link>
      </div>

      {questions.length > 0 && <PerformanceInsights questions={questions} result={result} />}

      {/* Next Recommendations */}
      <NextTestRecommendations currentTestSlug={testSlug} className="pt-4" />

      <div className="flex justify-center border-t border-surface-200 pt-6 dark:border-surface-800">
        <Link to="/tests">
          <Button variant="ghost" size="md" leftIcon={<Search className="w-4 h-4" aria-hidden="true" />}>
            Back to Test Search
          </Button>
        </Link>
      </div>
    </div>
  )
}
