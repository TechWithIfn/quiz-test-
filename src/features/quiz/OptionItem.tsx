import React from 'react'
import { QuestionOption } from '@/types'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { cn } from '@/utils/cn'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'

export interface OptionItemProps {
  option: QuestionOption
  questionId: string
  index: number
  isSelected: boolean
  onSelect: () => void
  disabled?: boolean
}

export const OptionItem: React.FC<OptionItemProps> = ({
  option,
  questionId,
  index,
  isSelected,
  onSelect,
  disabled = false,
}) => {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F']
  const letter = letters[index] || `${index + 1}`

  return (
    <label
      className={cn(
        'group relative flex items-start gap-3.5 min-h-16 p-4 rounded-xl border transition-all duration-150 cursor-pointer select-none focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-surface-950 focus-within:outline-none',
        isSelected
          ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 ring-1 ring-brand-500/50 shadow-sm'
          : 'border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:border-surface-300 dark:hover:border-surface-700 hover:bg-surface-50/80 dark:hover:bg-surface-800/40',
        disabled && 'opacity-60 pointer-events-none'
      )}
    >
      <input
        type="radio"
        name={`question-${questionId}`}
        value={option.id}
        checked={isSelected}
        onChange={onSelect}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            if (!disabled) onSelect()
          }
        }}
        disabled={disabled}
        className="sr-only"
        aria-label={`Option ${letter}: ${option.text}`}
      />
      {/* Option Key Badge */}
      <div
        aria-hidden="true"
        className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 transition-colors',
          isSelected
            ? 'bg-brand-600 text-white dark:bg-brand-500'
            : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 group-hover:bg-surface-200 dark:group-hover:bg-surface-700'
        )}
      >
        {letter}
      </div>

      {/* Option Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <MarkdownRenderer content={option.text} className="text-sm font-medium text-surface-800 dark:text-surface-200" />
        {option.codeSnippet && (
          <CodeBlock code={option.codeSnippet} className="mt-2 text-xs" />
        )}
      </div>

      {/* Radio Indicator */}
      <div className="pt-1" aria-hidden="true">
        <div
          className={cn(
            'w-4 h-4 rounded-full border flex items-center justify-center transition-colors',
            isSelected
              ? 'border-brand-600 bg-brand-600 dark:border-brand-500 dark:bg-brand-500'
              : 'border-surface-300 dark:border-surface-600'
          )}
        >
          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
      </div>
    </label>
  )
}
