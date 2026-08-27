import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Clock, HelpCircle, ArrowRight, Bookmark, Sparkles, CheckCircle2 } from 'lucide-react'
import { Test } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useHistoryStore } from '@/store/history.store'
import { formatFriendlyDuration } from '@/utils/time'
import { cn } from '@/utils/cn'

export interface TestCardProps {
  test: Test
  className?: string
}

export const TestCard: React.FC<TestCardProps> = ({ test, className }) => {
  const navigate = useNavigate()
  const { isBookmarked, toggleBookmark, getLatestResultForTest } = useHistoryStore()
  const bookmarked = isBookmarked(test.slug)
  const previousResult = getLatestResultForTest(test.slug)

  const difficultyVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'brand'> = {
    beginner: 'success',
    intermediate: 'brand',
    advanced: 'warning',
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-surface-300 hover:shadow-md dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700',
        className
      )}
    >
      <div>
        {/* Top Header info */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="brand" size="sm">
              {test.category.name}
            </Badge>
            <Badge
              variant={difficultyVariantMap[test.difficulty] || 'neutral'}
              size="sm"
              className="capitalize"
            >
              {test.difficulty}
            </Badge>
            {test.featured && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                <Sparkles className="w-3 h-3 fill-current" aria-hidden="true" />
                Featured
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleBookmark(test.slug)
            }}
            className={cn(
              'p-2 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors focus-ring min-w-[36px] min-h-[36px] flex items-center justify-center',
              bookmarked && 'text-brand-600 dark:text-brand-400'
            )}
            title={bookmarked ? `Remove bookmark for ${test.title}` : `Bookmark ${test.title}`}
            aria-label={bookmarked ? `Remove bookmark for ${test.title}` : `Bookmark ${test.title}`}
          >
            <Bookmark className={cn('w-4 h-4', bookmarked && 'fill-current')} aria-hidden="true" />
          </button>
        </div>

        {/* Title and Short Description */}
        <Link to={`/tests/${test.slug}`} className="block group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors focus-ring rounded">
          <h3 className="font-semibold text-base text-surface-900 dark:text-surface-100 leading-snug line-clamp-1">
            {test.title}
          </h3>
        </Link>

        <p className="mt-2 text-xs text-surface-600 dark:text-surface-400 line-clamp-2 leading-relaxed">
          {test.shortDescription}
        </p>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1" aria-label="Test tags">
          {test.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="text-[11px] px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* Footer metadata & Action CTA */}
      <div className="mt-5 pt-3.5 border-t border-surface-100 dark:border-surface-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-surface-500 dark:text-surface-400">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-surface-400" aria-hidden="true" />
            {test.totalQuestions} Qs
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-surface-400" aria-hidden="true" />
            {formatFriendlyDuration(test.timeLimitMinutes)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {previousResult && (
            <span
              className={cn(
                'text-[11px] font-medium px-2 py-0.5 rounded flex items-center gap-1',
                previousResult.passed
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400'
              )}
              title={`Previous score: ${previousResult.scorePercentage}%`}
            >
              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
              {previousResult.scorePercentage}%
            </span>
          )}

          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate(`/quiz/${test.slug}`)}
            aria-label={`Start test ${test.title}`}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />}
          >
            Start
          </Button>
        </div>
      </div>
    </div>
  )
}
