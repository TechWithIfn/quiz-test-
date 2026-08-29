import React from 'react'

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-200/70 dark:bg-surface-800/70 ${className}`} aria-hidden="true" />
}

export const TestCardSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-5 shadow-sm">
    <div className="flex items-center gap-2 mb-3">
      <SkeletonBlock className="h-5 w-20" />
      <SkeletonBlock className="h-5 w-16" />
    </div>
    <SkeletonBlock className="h-5 w-3/4 mb-2" />
    <SkeletonBlock className="h-3 w-full mb-1.5" />
    <SkeletonBlock className="h-3 w-5/6 mb-4" />
    <div className="grid grid-cols-3 gap-2 mb-4">
      <SkeletonBlock className="h-10" />
      <SkeletonBlock className="h-10" />
      <SkeletonBlock className="h-10" />
    </div>
    <SkeletonBlock className="h-10 w-32" />
  </div>
)

export const TestGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
    role="status"
    aria-label="Loading tests"
  >
    {Array.from({ length: count }).map((_, i) => (
      <TestCardSkeleton key={i} />
    ))}
  </div>
)

export const TestDetailSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6" role="status" aria-label="Loading test">
    <SkeletonBlock className="h-4 w-48" />
    <div className="p-6 sm:p-8 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 space-y-4">
      <div className="flex items-center gap-2">
        <SkeletonBlock className="h-6 w-24" />
        <SkeletonBlock className="h-6 w-20" />
      </div>
      <SkeletonBlock className="h-8 w-2/3" />
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-5/6" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-14" />
        ))}
      </div>
    </div>
    <SkeletonBlock className="h-40 w-full rounded-2xl" />
  </div>
)

export const QuestionSkeleton: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950" role="status" aria-label="Loading question">
    <div className="h-16 border-b border-surface-200 dark:border-surface-800 bg-white/80 dark:bg-surface-950/80" />
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 sm:p-8 shadow-sm space-y-4">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-6 w-3/4" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-11/12" />
          <div className="space-y-3 pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-14 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <SkeletonBlock className="h-48 w-full rounded-2xl" />
          <SkeletonBlock className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  </div>
)
