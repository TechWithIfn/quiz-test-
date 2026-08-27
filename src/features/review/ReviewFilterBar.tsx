import React, { useRef } from 'react'
import { cn } from '@/utils/cn'

export type ReviewFilterType = 'all' | 'correct' | 'incorrect' | 'unanswered' | 'flagged'

export interface ReviewFilterBarProps {
  currentFilter: ReviewFilterType
  onSelectFilter: (filter: ReviewFilterType) => void
  counts: {
    all: number
    correct: number
    incorrect: number
    unanswered: number
    flagged: number
  }
  className?: string
}

export const ReviewFilterBar: React.FC<ReviewFilterBarProps> = ({
  currentFilter,
  onSelectFilter,
  counts,
  className,
}) => {
  const tabs: { id: ReviewFilterType; label: string; count: number }[] = [
    { id: 'all', label: 'All Questions', count: counts.all },
    { id: 'correct', label: 'Correct', count: counts.correct },
    { id: 'incorrect', label: 'Incorrect', count: counts.incorrect },
    { id: 'unanswered', label: 'Unanswered', count: counts.unanswered },
    { id: 'flagged', label: 'Flagged', count: counts.flagged },
  ]

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const nextIndex = (index + 1) % tabs.length
      onSelectFilter(tabs[nextIndex].id)
      tabRefs.current[nextIndex]?.focus()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prevIndex = (index - 1 + tabs.length) % tabs.length
      onSelectFilter(tabs[prevIndex].id)
      tabRefs.current[prevIndex]?.focus()
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Filter review questions"
      className={cn('flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-surface-200 dark:border-surface-800', className)}
    >
      {tabs.map((tab, idx) => {
        const isActive = currentFilter === tab.id
        return (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[idx] = el)}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            type="button"
            onClick={() => onSelectFilter(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={cn(
              'px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 select-none focus-ring min-h-[38px]',
              isActive
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                : 'text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800'
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                isActive
                  ? 'bg-brand-200 text-brand-800 dark:bg-brand-900 dark:text-brand-200'
                  : 'bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-300'
              )}
            >
              {tab.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
