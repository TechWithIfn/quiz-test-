import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Clock,
  HelpCircle,
  Award,
  ArrowRight,
  Bookmark,
  ChevronRight,
  Home,
  Check,
  Zap,
  Target,
  BookOpen,
  RotateCcw,
  Sparkles
} from 'lucide-react'
import { Test } from '@/types'
import { testRepository } from '@/services/test.service'
import { useHistoryStore } from '@/store/history.store'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { NextTestRecommendations } from '@/features/recommendations/NextTestRecommendations'
import { formatFriendlyDuration } from '@/utils/time'
import { cn } from '@/utils/cn'
import { applyTestSeoMetadata } from '@/utils/seo'
import { ErrorState } from '@/components/ui/ErrorState'

export const TestDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [test, setTest] = useState<Test | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadError, setHasLoadError] = useState(false)

  const { isBookmarked, toggleBookmark, getLatestResultForTest } = useHistoryStore()
  const bookmarked = slug ? isBookmarked(slug) : false
  const previousResult = slug ? getLatestResultForTest(slug) : undefined

  useEffect(() => {
    if (!slug) return
    setIsLoading(true)
    setHasLoadError(false)
    setTest(null)
    testRepository.getTestBySlug(slug).then((found) => {
      if (found) {
        setTest(found)
        applyTestSeoMetadata(found)
      }
      setIsLoading(false)
    }).catch(() => {
      setHasLoadError(true)
      setIsLoading(false)
    })
  }, [slug])

  useEffect(() => {
    if (!test) {
      document.title = 'QuizFlow — Test Not Found'
    }
  }, [test])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-surface-400" role="status">
        <div className="inline-block animate-pulse text-sm">Loading test details...</div>
      </div>
    )
  }

  if (hasLoadError) {
    return <ErrorState message="This test could not be loaded." onRetry={() => window.location.reload()} />
  }

  if (!test) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50 mb-2">
          Test Not Found
        </h1>
        <p className="text-sm text-surface-500 mb-6">
          The test you requested does not exist or may have been updated.
        </p>
        <Link to="/tests">
          <Button variant="primary" size="md">
            Browse All Tests
          </Button>
        </Link>
      </div>
    )
  }

  // Derive topics and skills lists
  const displayTopics = (test.topics && test.topics.length > 0)
    ? test.topics
    : test.tags.map((t) => t.name)

  const displaySkills = (test.skills && test.skills.length > 0)
    ? test.skills
    : test.tags.slice(0, 4).map((t) => t.name)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6">
      {/* Semantic Breadcrumbs (Home → Category → Test Title) */}
      <nav aria-label="Breadcrumb" className="overflow-x-auto whitespace-nowrap pb-1">
        <ol className="flex items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400">
          <li className="inline-flex items-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors focus-ring rounded p-0.5"
            >
              <Home className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Home</span>
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="w-3.5 h-3.5 text-surface-400 shrink-0" />
          </li>
          <li className="inline-flex items-center">
            <Link
              to={`/categories/${test.category.slug}`}
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors focus-ring rounded p-0.5"
            >
              {test.category.name}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="w-3.5 h-3.5 text-surface-400 shrink-0" />
          </li>
          <li className="font-semibold text-surface-800 dark:text-surface-200 truncate max-w-[200px] sm:max-w-none" aria-current="page">
            {test.title}
          </li>
        </ol>
      </nav>

      {/* Main Test Landing Hero Card */}
      <div className="p-5 sm:p-8 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-sm relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="brand" size="md">
                {test.category.name}
              </Badge>
              <Badge
                variant={test.difficulty === 'advanced' ? 'warning' : test.difficulty === 'beginner' ? 'success' : 'neutral'}
                size="md"
                className="capitalize font-semibold"
              >
                {test.difficulty}
              </Badge>
              {previousResult && (
                <Badge
                  variant={previousResult.passed ? 'success' : 'neutral'}
                  size="md"
                  className="gap-1 font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-brand-500" />
                  <span>Previous Score: {previousResult.scorePercentage}%</span>
                </Badge>
              )}
            </div>

            {/* Clear Primary H1 */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-surface-900 dark:text-surface-50 tracking-tight leading-tight">
              {test.title}
            </h1>

            {/* Concise Description */}
            <p className="text-sm sm:text-base text-surface-600 dark:text-surface-300 leading-relaxed max-w-3xl">
              {test.shortDescription || test.fullDescription}
            </p>
          </div>

          <button
            type="button"
            onClick={() => slug && toggleBookmark(slug)}
            className={cn(
              'p-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors shrink-0',
              bookmarked && 'text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/40'
            )}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark test'}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark test'}
          >
            <Bookmark className={cn('w-5 h-5', bookmarked && 'fill-current')} />
          </button>
        </div>

        {/* Key Quick Stats (Mobile-first grid) */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-surface-50 dark:bg-surface-950/60 border border-surface-100 dark:border-surface-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-surface-500 font-medium uppercase tracking-wider">Questions</div>
              <div className="text-sm sm:text-base font-bold text-surface-900 dark:text-surface-100">{test.totalQuestions} Questions</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-surface-500 font-medium uppercase tracking-wider">Time Limit</div>
              <div className="text-sm sm:text-base font-bold text-surface-900 dark:text-surface-100">{formatFriendlyDuration(test.timeLimitMinutes)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-surface-500 font-medium uppercase tracking-wider">Passing Score</div>
              <div className="text-sm sm:text-base font-bold text-surface-900 dark:text-surface-100">{test.passingScorePercentage}%</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-surface-500 font-medium uppercase tracking-wider">Access</div>
              <div className="text-sm sm:text-base font-bold text-surface-900 dark:text-surface-100">Instant Free</div>
            </div>
          </div>
        </div>

        {/* Primary Instant CTA */}
        <div className="mt-6 pt-6 border-t border-surface-100 dark:border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>100% free, no login or profile setup required.</span>
          </div>

          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate(`/quiz/${test.slug}`)}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className="w-full sm:w-auto text-base font-bold px-8 py-3.5 shadow-md shadow-brand-500/10 hover:shadow-lg hover:shadow-brand-500/20 active:scale-[0.98] transition-all"
          >
            Start Test
          </Button>
        </div>
      </div>

      {/* Two Column Section: Topics/Skills & What You Will Practice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Topics & Skills Covered */}
        <div className="p-6 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100">
              Topics & Skills Tested
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Core Topics:</div>
              <div className="flex flex-wrap gap-2">
                {displayTopics.map((topic, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-900/50"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {displaySkills.length > 0 && (
              <div className="pt-2">
                <div className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Skills Measured:</div>
                <div className="flex flex-wrap gap-1.5">
                  {displaySkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* What you will learn & practice */}
        <div className="p-6 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100">
              What You Will Practice
            </h2>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm text-surface-600 dark:text-surface-300">
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>Real-world questions formatted for practical understanding and technical interviews.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>Instant evaluation with full explanations, hints, and concept references.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>Actionable topic breakdown to pinpoint strengths and specific weak spots.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>Timed test simulation with distraction-free, keyboard-friendly navigation.</span>
            </li>
          </ul>

          <div className="pt-2">
            <Button
              size="md"
              variant="outline"
              onClick={() => navigate(`/quiz/${test.slug}`)}
              rightIcon={<Sparkles className="w-4 h-4 text-brand-500" />}
              className="w-full justify-center font-medium"
            >
              Start Practicing Now
            </Button>
          </div>
        </div>
      </div>

      {/* Related / Recommended Tests */}
      <section aria-labelledby="related-tests-heading" className="pt-4">
        <h2 id="related-tests-heading" className="sr-only">Related Tests</h2>
        <NextTestRecommendations currentTestSlug={test.slug} />
      </section>
    </div>
  )
}
