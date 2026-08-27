import React from 'react'
import { Test } from '@/types'
import { TestCard } from './TestCard'
import { BookOpen } from 'lucide-react'

export interface TestListProps {
  tests: Test[]
  emptyMessage?: string
  className?: string
}

export const TestList: React.FC<TestListProps> = ({
  tests,
  emptyMessage = 'No tests found matching your criteria.',
  className,
}) => {
  if (tests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-surface-300 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-900/30">
        <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400 mb-3">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">
          No Tests Found
        </h3>
        <p className="mt-1 text-sm text-surface-500 max-w-sm">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 ${className || ''}`}>
      {tests.map((test) => (
        <TestCard key={test.id} test={test} />
      ))}
    </div>
  )
}
