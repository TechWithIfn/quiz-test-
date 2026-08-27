import React, { useEffect, useRef } from 'react'
import { Clock, AlertTriangle, ArrowLeft } from 'lucide-react'
import { Test, TestAttempt } from '@/types'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { formatDuration } from '@/utils/time'
import { cn } from '@/utils/cn'

export interface QuizHeaderProps {
  test: Test
  attempt: TestAttempt
  totalQuestions: number
  currentIndex: number
  onExit: () => void
  onRequestSubmit: () => void
}

export const QuizHeader: React.FC<QuizHeaderProps> = ({
  test,
  attempt,
  totalQuestions,
  currentIndex,
  onExit,
  onRequestSubmit,
}) => {
  const timeRemaining = attempt.timeRemainingSeconds
  const isUrgent = timeRemaining < 120 && timeRemaining > 0
  const isCritical = timeRemaining < 60 && timeRemaining > 0

  const answeredCount = Object.values(attempt.answers).filter(
    (a) => a.selectedOptionId !== null
  ).length

  // Accessible periodic timer announcement
  const [timeAnnouncement, setTimeAnnouncement] = React.useState('')
  const announcedRef = useRef<Record<number, boolean>>({})

  useEffect(() => {
    if (timeRemaining === 300 && !announcedRef.current[300]) {
      announcedRef.current[300] = true
      setTimeAnnouncement('5 minutes remaining in test.')
    } else if (timeRemaining === 120 && !announcedRef.current[120]) {
      announcedRef.current[120] = true
      setTimeAnnouncement('2 minutes remaining in test.')
    } else if (timeRemaining === 60 && !announcedRef.current[60]) {
      announcedRef.current[60] = true
      setTimeAnnouncement('1 minute remaining. Please finalize your answers.')
    } else if (timeRemaining === 0 && !announcedRef.current[0]) {
      announcedRef.current[0] = true
      setTimeAnnouncement('Time has expired.')
    }
  }, [timeRemaining])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-200 dark:border-surface-800 bg-white/90 dark:bg-surface-900/90 backdrop-blur-md">
      {/* Screen Reader Milestone Announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {timeAnnouncement}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Exit & Test Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExit}
              leftIcon={<ArrowLeft className="w-4 h-4" aria-hidden="true" />}
              className="text-surface-600 dark:text-surface-400 shrink-0"
              title="Exit test"
              aria-label="Exit test"
            >
              <span className="hidden sm:inline">Exit</span>
            </Button>

            <div className="min-w-0 hidden md:block">
              <h1 className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">
                {test.title}
              </h1>
              <p className="text-xs text-surface-500 truncate">
                {answeredCount} of {totalQuestions} answered
              </p>
            </div>
          </div>

          {/* Center: Timer */}
          <div
            role="timer"
            aria-live="off"
            aria-atomic="true"
            aria-label={`Time remaining: ${formatDuration(timeRemaining)}`}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-medium text-sm transition-colors select-none',
              isCritical
                ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300 animate-pulse'
                : isUrgent
                ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300'
                : 'bg-surface-100 border-surface-200 text-surface-700 dark:bg-surface-800 dark:border-surface-700 dark:text-surface-200'
            )}
          >
            {isCritical ? (
              <AlertTriangle className="w-4 h-4 text-rose-500" aria-hidden="true" />
            ) : (
              <Clock className="w-4 h-4 text-surface-500" aria-hidden="true" />
            )}
            <span>{formatDuration(timeRemaining)}</span>
          </div>

          {/* Right: Submit Button */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRequestSubmit}
              className="text-xs border-brand-300 dark:border-brand-800 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50"
            >
              Submit Test
            </Button>
          </div>
        </div>

        {/* Progress line */}
        <div
          className="pb-1"
          aria-label={`Question progress: question ${currentIndex + 1} of ${totalQuestions}`}
        >
          <ProgressBar
            value={currentIndex + 1}
            max={totalQuestions}
            size="sm"
            variant="brand"
          />
        </div>
      </div>
    </header>
  )
}
