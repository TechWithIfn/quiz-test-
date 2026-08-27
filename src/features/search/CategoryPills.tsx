import React from 'react'
import { TestCategory } from '@/types'
import { cn } from '@/utils/cn'

export interface CategoryPillsProps {
  categories: TestCategory[]
  selectedCategorySlug?: string
  onSelectCategory: (slug: string) => void
  className?: string
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategorySlug = 'all',
  onSelectCategory,
  className,
}) => {
  return (
    <nav aria-label="Category quick filter" className={cn('flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar', className)}>
      <button
        type="button"
        aria-pressed={selectedCategorySlug === 'all'}
        onClick={() => onSelectCategory('all')}
        className={cn(
          'px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border select-none focus-ring min-h-[36px]',
          selectedCategorySlug === 'all'
            ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
            : 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 text-surface-700 dark:text-surface-300 hover:border-surface-300 dark:hover:border-surface-700'
        )}
      >
        All Categories
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategorySlug === cat.slug
        return (
          <button
            key={cat.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelectCategory(cat.slug)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border select-none focus-ring min-h-[36px]',
              isSelected
                ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 text-surface-700 dark:text-surface-300 hover:border-surface-300 dark:hover:border-surface-700'
            )}
          >
            {cat.name}
          </button>
        )
      })}
    </nav>
  )
}
