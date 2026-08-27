import React from 'react'
import { BookOpenCheck, Target } from 'lucide-react'
import { Question, TestResult } from '@/types'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { getPerformanceInsights, TopicPerformance } from '@/utils/performance'
import { cn } from '@/utils/cn'

interface AreaListProps {
  areas: TopicPerformance[]
  emptyMessage: string
  variant: 'success' | 'warning'
}

const AreaList: React.FC<AreaListProps> = ({ areas, emptyMessage, variant }) => {
  if (areas.length === 0) {
    return <p className="text-sm text-surface-500">{emptyMessage}</p>
  }

  return (
    <div className="space-y-4">
      {areas.slice(0, 4).map((area) => (
        <div key={area.topic}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-medium text-surface-800 dark:text-surface-200">{area.topic}</span>
            <span className="shrink-0 font-mono text-xs text-surface-500">{area.correct}/{area.total} · {area.accuracyPercentage}%</span>
          </div>
          <ProgressBar value={area.accuracyPercentage} variant={variant} size="sm" aria-label={`${area.topic}: ${area.accuracyPercentage}%`} />
        </div>
      ))}
    </div>
  )
}

export interface PerformanceInsightsProps {
  questions: Question[]
  result: TestResult
  className?: string
}

export const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({ questions, result, className }) => {
  const { strongAreas, weakAreas } = getPerformanceInsights(questions, result)

  return (
    <section className={cn('space-y-4', className)} aria-labelledby="performance-summary-heading">
      <div>
        <h2 id="performance-summary-heading" className="text-xl font-bold text-surface-900 dark:text-surface-50">Performance Summary</h2>
        <p className="mt-1 text-sm text-surface-500">See what you learned, what needs another pass, and where to focus next.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-900/60 dark:bg-surface-900">
          <div className="mb-4 flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-surface-900 dark:text-surface-50">Strong Areas</h3>
          </div>
          <AreaList areas={strongAreas} variant="success" emptyMessage="Keep practicing to build your first strong area." />
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm dark:border-amber-900/60 dark:bg-surface-900">
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-semibold text-surface-900 dark:text-surface-50">Weak Areas</h3>
          </div>
          <AreaList areas={weakAreas} variant="warning" emptyMessage="No weak areas this time. Try a harder test next." />
        </div>
      </div>
    </section>
  )
}
