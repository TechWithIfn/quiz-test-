import React from 'react'
import { Bookmark, Check } from 'lucide-react'
import { Question, Answer } from '@/types'
import { cn } from '@/utils/cn'

export interface QuestionNavigatorProps {
  questions: Question[]
  answers: Record<string, Answer>
  activeIndex: number
  onSelectQuestion: (index: number) => void
  className?: string
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questions,
  answers,
  activeIndex,
  onSelectQuestion,
  className,
}) => {
  return (
    <div className={cn('p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900', className)}>
      <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
        Question Overview
      </h3>

      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, idx) => {
          const ans = answers[q.id]
          const isAnswered = ans && ans.selectedOptionId !== null
          const isFlagged = ans?.isMarkedForReview
          const isActive = activeIndex === idx

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectQuestion(idx)}
              aria-label={`Question ${idx + 1}${isAnswered ? ', answered' : ', unanswered'}${isFlagged ? ', marked for review' : ''}`}
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                'relative h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-all focus-ring select-none border',
                isActive
                  ? 'border-brand-600 bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/30'
                  : isAnswered
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : 'border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700'
              )}
            >
              <span>{idx + 1}</span>

              {/* Status indicator icons */}
              {isFlagged && (
                <Bookmark className="absolute -top-1 -right-1 w-3 h-3 text-amber-500 fill-amber-500" />
              )}
              {isAnswered && !isActive && (
                <Check className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-surface-100 dark:border-surface-800/80 space-y-1.5 text-[11px] text-surface-500 dark:text-surface-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
          <span>Current Question</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-surface-300 dark:bg-surface-700" />
          <span>Unanswered</span>
        </div>
        <div className="flex items-center gap-2">
          <Bookmark className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
          <span>Flagged for Review</span>
        </div>
      </div>
    </div>
  )
}
