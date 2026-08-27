import React from 'react'
import { CheckCircle2, XCircle, Clock, Award, CircleSlash2, ListChecks } from 'lucide-react'
import { TestResult } from '@/types'
import { formatDuration } from '@/utils/time'
import { cn } from '@/utils/cn'

export interface MetricCardsProps {
  result: TestResult
  className?: string
}

export const MetricCards: React.FC<MetricCardsProps> = ({ result, className }) => {
  const metrics = [
    {
      label: 'Correct Answers',
      value: `${result.correctAnswers} / ${result.totalQuestions}`,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    {
      label: 'Incorrect Answers',
      value: `${result.incorrectAnswers}`,
      icon: XCircle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/50',
      border: 'border-rose-200 dark:border-rose-800',
    },
    {
      label: 'Skipped Answers',
      value: `${result.unansweredQuestions}`,
      icon: CircleSlash2,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      border: 'border-amber-200 dark:border-amber-800',
    },
    {
      label: 'Total Questions',
      value: `${result.totalQuestions}`,
      icon: ListChecks,
      color: 'text-surface-600 dark:text-surface-300',
      bg: 'bg-surface-100 dark:bg-surface-800',
      border: 'border-surface-200 dark:border-surface-700',
    },
    {
      label: 'Time Taken',
      value: formatDuration(result.timeTakenSeconds),
      icon: Clock,
      color: 'text-brand-600 dark:text-brand-400',
      bg: 'bg-brand-50 dark:bg-brand-950/50',
      border: 'border-brand-200 dark:border-brand-800',
    },
    {
      label: 'Average Time / Question',
      value: formatDuration(result.totalQuestions > 0 ? Math.round(result.timeTakenSeconds / result.totalQuestions) : 0),
      icon: Award,
      color: 'text-brand-600 dark:text-brand-400',
      bg: 'bg-brand-50 dark:bg-brand-950/50',
      border: 'border-brand-200 dark:border-brand-800',
    },
  ]

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4', className)}>
      {metrics.map((m, i) => {
        const Icon = m.icon
        return (
          <div
            key={i}
            className={cn(
              'p-4 rounded-xl border flex flex-col justify-between bg-white dark:bg-surface-900 shadow-sm transition-all',
              m.border
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-surface-500">{m.label}</span>
              <div className={cn('p-1.5 rounded-lg', m.bg)}>
                <Icon className={cn('w-4 h-4', m.color)} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-bold font-mono text-surface-900 dark:text-surface-50">
                {m.value}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
