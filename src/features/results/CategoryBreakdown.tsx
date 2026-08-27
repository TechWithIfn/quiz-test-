import React from 'react'
import { TestResult } from '@/types'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/utils/cn'

export interface CategoryBreakdownProps {
  result: TestResult
  className?: string
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  result,
  className,
}) => {
  const topics = Object.values(result.topicBreakdown || {})

  if (topics.length === 0) return null

  return (
    <div className={cn('p-5 sm:p-6 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-sm', className)}>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-500 mb-4">
        Topic Performance
      </h3>

      <div className="space-y-4">
        {topics.map((topic) => {
          const variant =
            topic.accuracyPercentage >= 75
              ? 'success'
              : topic.accuracyPercentage >= 50
              ? 'warning'
              : 'danger'

          return (
            <div key={topic.topic} className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-surface-800 dark:text-surface-200">{topic.topic}</span>
                <span className="font-mono text-surface-600 dark:text-surface-400">
                  {topic.correctQuestions} / {topic.totalQuestions} ({topic.accuracyPercentage}%)
                </span>
              </div>
              <ProgressBar
                value={topic.accuracyPercentage}
                max={100}
                size="sm"
                variant={variant}
              />
              <div className="text-[11px] text-surface-500">
                {topic.attemptedQuestions} attempted · {topic.incorrectQuestions} incorrect
                {topic.averageTimeSeconds !== undefined && ` · ${topic.averageTimeSeconds}s average`}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
