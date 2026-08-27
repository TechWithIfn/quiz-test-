import React, { useEffect, useRef } from 'react'
import { Bookmark, ChevronLeft, ChevronRight, RotateCcw, Send } from 'lucide-react'
import { Question, Answer } from '@/types'
import { OptionItem } from './OptionItem'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'

export interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  answer?: Answer
  onSelectOption: (optionId: string) => void
  onClearOption: () => void
  onToggleReview: () => void
  onNext: () => void
  onPrevious: () => void
  onSubmitQuiz: () => void
  isFirst: boolean
  isLast: boolean
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  answer,
  onSelectOption,
  onClearOption,
  onToggleReview,
  onNext,
  onPrevious,
  onSubmitQuiz,
  isFirst,
  isLast,
}) => {
  const selectedOptionId = answer?.selectedOptionId || null
  const isFlagged = answer?.isMarkedForReview || false
  const questionTitleRef = useRef<HTMLHeadingElement>(null)

  // Focus question heading when question changes
  useEffect(() => {
    questionTitleRef.current?.focus()
  }, [question.id])

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest('input:not([type="radio"]), textarea, select, a, [role="dialog"]')) {
        return
      }

      // 1-9 or A-D for options
      const key = e.key.toUpperCase()
      if (key === 'F') {
        e.preventDefault()
        onToggleReview()
        return
      }
      const optionIndex = ['1', '2', '3', '4', '5', '6'].indexOf(key)
      const letterIndex = ['A', 'B', 'C', 'D', 'E', 'F'].indexOf(key)

      const targetIdx = optionIndex !== -1 ? optionIndex : letterIndex
      if (targetIdx !== -1 && targetIdx < question.options.length) {
        onSelectOption(question.options[targetIdx].id)
      } else if (e.key === 'ArrowRight' && !isLast) {
        onNext()
      } else if (e.key === 'ArrowLeft' && !isFirst) {
        onPrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [question, isFirst, isLast, onSelectOption, onToggleReview, onNext, onPrevious])

  return (
    <div className="flex flex-col h-full">
      {/* Top Question Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-surface-200 dark:border-surface-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-surface-900 dark:text-surface-100">
            Question {questionNumber} of {totalQuestions}
          </span>
          {question.category && (
            <Badge size="sm" variant="brand">
              {question.category}
            </Badge>
          )}
          <Badge size="sm" variant="neutral">
            {question.points} {question.points === 1 ? 'pt' : 'pts'}
          </Badge>
        </div>

        <button
          type="button"
          onClick={onToggleReview}
          aria-pressed={isFlagged}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors select-none focus-ring min-h-[36px]',
            isFlagged
              ? 'bg-amber-500/10 border-amber-400 text-amber-600 dark:text-amber-400'
              : 'border-surface-300 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
          )}
          title="Press 'F' to flag/unflag question for review"
        >
          <Bookmark className={cn('w-3.5 h-3.5', isFlagged && 'fill-current')} aria-hidden="true" />
          <span>{isFlagged ? 'Flagged for Review' : 'Mark for Review'}</span>
          <kbd className="hidden sm:inline-block px-1 py-0.2 text-[10px] bg-surface-200/50 dark:bg-surface-700/50 rounded ml-1" aria-hidden="true">F</kbd>
        </button>
      </div>

      {/* Question Prompt */}
      <div className="py-6 flex-1">
        <h2
          ref={questionTitleRef}
          id={`question-heading-${question.id}`}
          tabIndex={-1}
          className="text-lg sm:text-xl font-semibold text-surface-900 dark:text-surface-50 leading-relaxed tracking-tight focus:outline-none"
        >
          <MarkdownRenderer content={question.text} />
        </h2>

        {question.codeSnippet && (
          <CodeBlock
            code={question.codeSnippet}
            language={question.codeLanguage || 'typescript'}
            className="my-4"
          />
        )}

        {/* Semantic Fieldset for Question Options */}
        <fieldset className="mt-6 border-0 p-0 m-0">
          <legend className="sr-only">Choose an answer for Question {questionNumber}</legend>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <OptionItem
                key={option.id}
                option={option}
                questionId={question.id}
                index={index}
                isSelected={selectedOptionId === option.id}
                onSelect={() => onSelectOption(option.id)}
              />
            ))}
          </div>
        </fieldset>
      </div>

      {/* Action Toolbar */}
      <div className="mt-6 pt-4 border-t border-surface-200 dark:border-surface-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={isFirst}
            leftIcon={<ChevronLeft className="w-4 h-4" aria-hidden="true" />}
          >
            Previous
          </Button>

          {selectedOptionId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearOption}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-surface-400" aria-hidden="true" />}
              className="text-xs text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
            >
              Clear Choice
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isLast ? (
            <Button
              variant="primary"
              size="md"
              onClick={onSubmitQuiz}
              leftIcon={<Send className="w-4 h-4" aria-hidden="true" />}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              Finish & View Result
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={onNext}
              rightIcon={<ChevronRight className="w-4 h-4" aria-hidden="true" />}
            >
              Next Question
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
