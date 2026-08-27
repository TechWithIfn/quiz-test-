import React from 'react'
import { TestCategory, DifficultyLevel } from '@/types'
import { cn } from '@/utils/cn'

export interface TestFiltersProps {
  categories: TestCategory[]
  selectedCategorySlug?: string
  onSelectCategory: (slug: string) => void
  selectedDifficulty?: DifficultyLevel
  onSelectDifficulty: (diff: DifficultyLevel) => void
  sortBy?: 'popular' | 'newest' | 'questions-asc' | 'time-asc'
  onSelectSortBy: (sort: 'popular' | 'newest' | 'questions-asc' | 'time-asc') => void
  className?: string
}

export const TestFilters: React.FC<TestFiltersProps> = ({
  categories,
  selectedCategorySlug = 'all',
  onSelectCategory,
  selectedDifficulty = 'all-levels',
  onSelectDifficulty,
  sortBy = 'popular',
  onSelectSortBy,
  className,
}) => {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-sm', className)}>
      <div className="flex flex-wrap items-center gap-3">
        {/* Category select */}
        <div className="flex items-center gap-2">
          <label htmlFor="cat-filter" className="text-xs font-medium text-surface-500">
            Category:
          </label>
          <select
            id="cat-filter"
            value={selectedCategorySlug}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="text-xs rounded-lg border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 px-2.5 py-1.5 text-surface-800 dark:text-surface-200 focus-ring"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty select */}
        <div className="flex items-center gap-2">
          <label htmlFor="diff-filter" className="text-xs font-medium text-surface-500">
            Level:
          </label>
          <select
            id="diff-filter"
            value={selectedDifficulty}
            onChange={(e) => onSelectDifficulty(e.target.value as DifficultyLevel)}
            className="text-xs rounded-lg border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 px-2.5 py-1.5 text-surface-800 dark:text-surface-200 focus-ring capitalize"
          >
            <option value="all-levels">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Sort Select */}
      <div className="flex items-center gap-2">
        <label htmlFor="sort-filter" className="text-xs font-medium text-surface-500">
          Sort by:
        </label>
        <select
          id="sort-filter"
          value={sortBy}
          onChange={(e) =>
            onSelectSortBy(e.target.value as 'popular' | 'newest' | 'questions-asc' | 'time-asc')
          }
          className="text-xs rounded-lg border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 px-2.5 py-1.5 text-surface-800 dark:text-surface-200 focus-ring"
        >
          <option value="popular">Featured / Popular</option>
          <option value="newest">Newest First</option>
          <option value="questions-asc">Shortest (Questions)</option>
          <option value="time-asc">Shortest (Time)</option>
        </select>
      </div>
    </div>
  )
}
