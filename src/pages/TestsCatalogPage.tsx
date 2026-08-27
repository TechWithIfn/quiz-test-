import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RotateCcw, Compass, FilePlus2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Test, TestCategory, DifficultyLevel } from '@/types'
import { testRepository } from '@/services/test.service'
import { SearchService } from '@/features/search/search.service'
import { SearchBar } from '@/features/search/SearchBar'
import { CategoryPills } from '@/features/search/CategoryPills'
import { TestFilters } from '@/features/tests/TestFilters'
import { TestList } from '@/features/tests/TestList'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'

export const TestsCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [allTests, setAllTests] = useState<Test[]>([])
  const [categories, setCategories] = useState<TestCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadError, setHasLoadError] = useState(false)

  const queryParam = searchParams.get('q') || ''
  const categoryParam = searchParams.get('cat') || 'all'
  const difficultyParam = (searchParams.get('diff') as DifficultyLevel) || 'all-levels'
  const sortParam = (searchParams.get('sort') as 'popular' | 'newest' | 'questions-asc' | 'time-asc') || 'popular'

  useEffect(() => {
    Promise.all([
      testRepository.getAllTests(),
      testRepository.getCategories(),
    ]).then(([tests, cats]) => {
      setAllTests(tests)
      setCategories(cats)
      setIsLoading(false)
    }).catch(() => {
      setHasLoadError(true)
      setIsLoading(false)
    })
  }, [])

  const searchService = useMemo(() => new SearchService(allTests), [allTests])

  const filteredTests = useMemo(() => {
    return searchService.search(allTests, {
      query: queryParam,
      categorySlug: categoryParam,
      difficulty: difficultyParam,
      sortBy: sortParam,
    })
  }, [searchService, allTests, queryParam, categoryParam, difficultyParam, sortParam])

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'all' || value === 'all-levels' || (key === 'sort' && value === 'popular')) {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    setSearchParams(next)
  }

  const resetAllFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  const hasActiveFilters = queryParam !== '' || categoryParam !== 'all' || difficultyParam !== 'all-levels' || sortParam !== 'popular'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-surface-200 dark:border-surface-800">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-surface-50 tracking-tight">
              Test Catalog
            </h1>
          </div>
          <p className="text-sm text-surface-500 mt-1">
            Browse and start any test with zero configuration
          </p>
        </div>

        {/* Live Search Bar */}
        <div className="flex w-full flex-col gap-2 md:w-96">
          <SearchBar
            tests={allTests}
            placeholder="Search catalog..."
            initialQuery={queryParam}
            showQuickDropdown={false}
            onSearchSubmit={(q) => updateParam('q', q)}
          />
          <Link to="/tests/create" className="self-end">
            <Button variant="ghost" size="sm" leftIcon={<FilePlus2 className="h-3.5 w-3.5" />}>Create Custom Test</Button>
          </Link>
        </div>
      </div>

      {/* Category Horizontal Pills */}
      <div className="my-6">
        <CategoryPills
          categories={categories}
          selectedCategorySlug={categoryParam}
          onSelectCategory={(slug) => updateParam('cat', slug)}
        />
      </div>

      {/* Additional Filters & Sort Controls */}
      <div className="mb-6">
        <TestFilters
          categories={categories}
          selectedCategorySlug={categoryParam}
          onSelectCategory={(slug) => updateParam('cat', slug)}
          selectedDifficulty={difficultyParam}
          onSelectDifficulty={(diff) => updateParam('diff', diff)}
          sortBy={sortParam}
          onSelectSortBy={(sort) => updateParam('sort', sort)}
        />
      </div>

      {/* Result Count and Active Filter Indicators */}
      <div className="flex items-center justify-between mb-6 text-xs text-surface-500">
        <span>
          Showing <strong className="text-surface-800 dark:text-surface-200">{filteredTests.length}</strong> {filteredTests.length === 1 ? 'test' : 'tests'}
        </span>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAllFilters}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs text-brand-600 dark:text-brand-400"
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Test Grid */}
      {hasLoadError ? (
        <ErrorState message="The test catalog could not be loaded." onRetry={() => window.location.reload()} />
      ) : isLoading ? (
        <div className="py-20 text-center text-surface-400">Loading catalog...</div>
      ) : (
        <TestList
          tests={filteredTests}
          emptyMessage="No tests match your filter criteria. Try clearing some filters or searching for different keywords."
        />
      )}
    </div>
  )
}
