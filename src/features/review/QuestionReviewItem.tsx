import React from 'react'
import { CheckCircle2, XCircle, HelpCircle, Bookmark, Sparkles } from 'lucide-react'
import { Question, Answer } from '@/types'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'

export interface QuestionReviewItemProps {
  question: Question
  questionNumber: number
  answer?: Answer
  className?: string
}

export const QuestionReviewItem: React.FC<QuestionReviewItemProps> = ({
  question,
  questionNumber,
  answer,
  className,
}) => {
  const selectedOptionId = answer?.selectedOptionId || null
  const isAnswered = selectedOptionId !== null
  const isCorrect = isAnswered && selectedOptionId === question.correctOptionId
  const isFlagged = answer?.isMarkedForReview || false
  const userOption = question.options.find((option) => option.id === selectedOptionId)
  const correctOption = question.options.find((option) => option.id === question.correctOptionId)

  return (
    <div
      className={cn(
        'rounded-xl border p-5 sm:p-6 bg-white dark:bg-surface-900 shadow-sm transition-all',
        !isAnswered
          ? 'border-surface-200 dark:border-surface-800'
          : isCorrect
          ? 'border-emerald-200 dark:border-emerald-900/60'
          : 'border-rose-200 dark:border-rose-900/60',
        className
      )}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-surface-100 dark:border-surface-800/80 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-surface-900 dark:text-surface-100">
            Question {questionNumber}
          </span>

          {!isAnswered ? (
            <Badge variant="neutral" size="sm">
              <HelpCircle className="w-3 h-3 text-surface-400" />
              <span>Unanswered</span>
            </Badge>
          ) : isCorrect ? (
            <Badge variant="success" size="sm">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Correct</span>
            </Badge>
          ) : (
            <Badge variant="danger" size="sm">
              <XCircle className="w-3 h-3 text-rose-500" />
              <span>Incorrect</span>
            </Badge>
          )}

          {isFlagged && (
            <Badge variant="warning" size="sm">
              <Bookmark className="w-3 h-3 fill-current" />
              <span>Flagged</span>
            </Badge>
          )}
        </div>

        <div className="text-xs text-surface-500 font-mono">
          {isCorrect ? `+${question.points} pts` : `0 / ${question.points} pts`}
        </div>
      </div>

      {/* Question Stem */}
      <div className="mt-4">
        <p className="text-base font-medium text-surface-900 dark:text-surface-100 leading-relaxed">
          {question.text}
        </p>

        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2" aria-label="Answer summary">
          <div className={cn(
            'rounded-lg border px-3 py-2',
            !isAnswered
              ? 'border-surface-200 bg-surface-50 text-surface-700 dark:border-surface-700 dark:bg-surface-800/50 dark:text-surface-200'
              : isCorrect
              ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100'
              : 'border-rose-200 bg-rose-50/70 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-100'
          )}>
            <span className="block text-[11px] font-semibold uppercase tracking-wide opacity-70">Your answer</span>
            <MarkdownRenderer content={userOption?.text || 'Not answered'} className="mt-0.5 font-medium" />
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
            <span className="block text-[11px] font-semibold uppercase tracking-wide opacity-70">Correct answer</span>
            <MarkdownRenderer content={correctOption?.text || 'Unavailable'} className="mt-0.5 font-medium" />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-surface-500">
          {question.topic && <Badge variant="neutral" size="sm">Topic: {question.topic}</Badge>}
          {question.difficulty && <Badge variant="neutral" size="sm" className="capitalize">{question.difficulty}</Badge>}
        </div>

        {question.codeSnippet && (
          <CodeBlock
            code={question.codeSnippet}
            language={question.codeLanguage || 'typescript'}
            className="my-3"
          />
        )}
      </div>

      {/* Options List with status styles */}
      <div className="mt-4 space-y-2.5">
        {question.options.map((opt, idx) => {
          const isUserChoice = opt.id === selectedOptionId
          const isCorrectOption = opt.id === question.correctOptionId
          const letters = ['A', 'B', 'C', 'D', 'E', 'F']
          const letter = letters[idx] || `${idx + 1}`

          return (
            <div
              key={opt.id}
              className={cn(
                'flex items-start gap-3 p-3.5 rounded-lg border text-sm transition-all',
                isCorrectOption
                  ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500/20'
                  : isUserChoice && !isCorrect
                  ? 'border-rose-400 bg-rose-50/80 dark:bg-rose-950/40 dark:border-rose-700 text-rose-950 dark:text-rose-100'
                  : 'border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50 text-surface-700 dark:text-surface-300 opacity-75'
              )}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0',
                  isCorrectOption
                    ? 'bg-emerald-600 text-white'
                    : isUserChoice && !isCorrect
                    ? 'bg-rose-600 text-white'
                    : 'bg-surface-200 dark:bg-surface-800 text-surface-600 dark:text-surface-400'
                )}
              >
                {letter}
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <MarkdownRenderer content={opt.text} className="font-medium" />
                {opt.codeSnippet && <CodeBlock code={opt.codeSnippet} className="mt-2 text-xs" />}
              </div>

              <div className="shrink-0 pt-0.5 text-xs font-semibold">
                {isCorrectOption && (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Correct Answer
                  </span>
                )}
                {isUserChoice && !isCorrect && (
                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Your Choice
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Explanation Box */}
      <div className="mt-5 p-4 rounded-lg bg-surface-100/70 dark:bg-surface-800/40 border border-surface-200 dark:border-surface-700/60">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>In-Depth Explanation</span>
        </div>
        <MarkdownRenderer content={question.explanation} className="text-xs sm:text-sm text-surface-700 dark:text-surface-300" />

        {question.tags.length > 0 && (
          <div className="mt-3 pt-2 border-t border-surface-200/60 dark:border-surface-700/40 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-surface-400 font-medium">Concepts:</span>
            {question.tags.map((tag, tIdx) => (
              <span
                key={tIdx}
                className="text-[11px] px-2 py-0.5 rounded bg-surface-200/60 dark:bg-surface-700/60 text-surface-600 dark:text-surface-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
