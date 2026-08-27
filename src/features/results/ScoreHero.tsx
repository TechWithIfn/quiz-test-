import React from 'react'
import { CheckCircle, XCircle, Trophy, Sparkles } from 'lucide-react'
import { TestResult } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

export interface ScoreHeroProps {
  result: TestResult
  className?: string
}

export const ScoreHero: React.FC<ScoreHeroProps> = ({ result, className }) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-6 sm:p-8 text-center transition-all',
        result.passed
          ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800'
          : 'bg-rose-50/70 border-rose-300 dark:bg-rose-950/30 dark:border-rose-800',
        className
      )}
    >
      {/* Status icon badge */}
      <div className="mx-auto mb-4 flex justify-center">
        {result.passed ? (
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
            <Trophy className="w-8 h-8" aria-hidden="true" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm">
            <XCircle className="w-8 h-8" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex justify-center mb-2">
        <Badge
          size="md"
          variant={result.passed ? 'success' : 'danger'}
          className="text-xs uppercase tracking-wider font-bold"
        >
          {result.passed ? (
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Passed Assessment
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" /> Assessment Completed
            </span>
          )}
        </Badge>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-50 tracking-tight">
        {result.testTitle}
      </h1>

      {/* Big Score Display */}
      <div className="mt-6 flex flex-col items-center justify-center">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-surface-900 dark:text-surface-50">
            {result.scorePercentage}%
          </span>
        </div>
        <p className="mt-2 text-sm text-surface-600 dark:text-surface-400 max-w-md">
          {result.passed
            ? `Outstanding performance! You exceeded the passing threshold of ${result.passingScorePercentage}%.`
            : `You scored ${result.scorePercentage}%. The passing threshold is ${result.passingScorePercentage}%. Review your weak areas below and retake to improve!`}
        </p>
      </div>
    </div>
  )
}
