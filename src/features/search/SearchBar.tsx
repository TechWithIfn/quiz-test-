import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight, Sparkles, Clock, HelpCircle, FileSearch } from 'lucide-react'
import { Test } from '@/types'
import { searchApi, mapTest } from '@/lib/api'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

export interface SearchBarProps {
  tests?: Test[]
  placeholder?: string
  autoFocus?: boolean
  initialQuery?: string
  className?: string
  onSearchSubmit?: (query: string) => void
  showQuickDropdown?: boolean
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'What do you want to test today?',
  autoFocus = false,
  initialQuery = '',
  className,
  onSearchSubmit,
  showQuickDropdown = true,
}) => {
  const [query, setQuery] = useState(initialQuery)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [searchResults, setSearchResults] = useState<Test[]>([])
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  // Instant dropdown is backed by the backend search API (online-only).
  const trimmedQuery = query.trim()
  useEffect(() => {
    if (trimmedQuery.length < 2) {
      setSearchResults([])
      return
    }
    let cancelled = false
    const handle = setTimeout(async () => {
      try {
        const res = await searchApi.query({ query: trimmedQuery })
        if (!cancelled) setSearchResults(res.tests.map(mapTest).slice(0, 5))
      } catch {
        if (!cancelled) setSearchResults([])
      }
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [trimmedQuery])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleGlobalShortcuts = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      if ((event.key === '/' && !isTyping) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
        setIsOpen(true)
      }
      if (event.key === 'Escape') {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleGlobalShortcuts)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleGlobalShortcuts)
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showQuickDropdown || !isOpen || searchResults.length === 0) {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1))
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        e.preventDefault()
        navigate(`/tests/${searchResults[selectedIndex].slug}`)
        setIsOpen(false)
      } else {
        handleSubmit(e)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSelectedIndex(-1)
    }
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const nextQuery = query.trim()
    if (onSearchSubmit) {
      onSearchSubmit(nextQuery)
    } else {
      navigate(`/tests?q=${encodeURIComponent(nextQuery)}`)
    }
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit} className="relative" role="search" aria-label="Test search">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-surface-400 dark:text-surface-500 pointer-events-none" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={showQuickDropdown && isOpen && searchResults.length > 0}
            aria-autocomplete="list"
            aria-controls="search-dropdown-results"
            aria-activedescendant={selectedIndex >= 0 && searchResults[selectedIndex] ? `search-result-${searchResults[selectedIndex].id}` : undefined}
            value={query}
            onChange={(e) => {
              const nextValue = e.target.value
              setQuery(nextValue)
              setIsOpen(nextValue.trim().length > 0)
              setSelectedIndex(-1)
            }}
            onFocus={() => {
              if (query.trim().length > 0) setIsOpen(true)
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            aria-label="Search tests by title, topic, or skill"
            className="w-full pl-12 pr-12 py-4 text-base rounded-2xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-500 shadow-[0_12px_30px_rgba(15,23,42,0.08)] hover:border-brand-300 dark:hover:border-brand-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/50 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setIsOpen(false)
                setSelectedIndex(-1)
                inputRef.current?.focus()
              }}
              className="absolute right-3.5 p-2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 rounded-md focus-ring min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>

      {/* Screen Reader Result Count Announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {isOpen && trimmedQuery.length >= 2 && (
          searchResults.length > 0
            ? `${searchResults.length} suggestion${searchResults.length === 1 ? '' : 's'} available.`
            : `No tests found for ${trimmedQuery}.`
        )}
      </div>

      {showQuickDropdown && isOpen && (
        <div
          id="search-dropdown-results"
          role="listbox"
          aria-label="Search results"
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-[0_20px_45px_rgba(15,23,42,0.12)] overflow-hidden z-30"
        >
          {trimmedQuery.length === 0 && (
            <div className="p-5 text-sm text-surface-500 dark:text-surface-400">Type at least 2 characters to search.</div>
          )}

          {trimmedQuery.length > 0 && trimmedQuery.length < 2 && (
            <div className="p-5 text-sm text-surface-500 dark:text-surface-400">Search too short — try a broader keyword like “python” or “sql”.</div>
          )}

          {trimmedQuery.length >= 2 && searchResults.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-surface-400 dark:text-surface-500 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" aria-hidden="true" />
                <span>Instant matches</span>
              </div>

              {searchResults.map((test, idx) => (
                <div
                  key={test.id}
                  id={`search-result-${test.id}`}
                  role="option"
                  aria-selected={selectedIndex === idx}
                  onClick={() => {
                    navigate(`/tests/${test.slug}`)
                    setIsOpen(false)
                    setSelectedIndex(-1)
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'px-4 py-3 cursor-pointer transition-colors border-b border-surface-100 dark:border-surface-800 last:border-b-0 focus:outline-none',
                    selectedIndex === idx ? 'bg-brand-50 dark:bg-brand-950/60' : 'hover:bg-surface-50 dark:hover:bg-surface-800/60'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-surface-900 dark:text-surface-100 truncate">{test.title}</span>
                        <Badge size="sm" variant="brand">{test.category.name}</Badge>
                        <Badge size="sm" variant={test.difficulty === 'advanced' ? 'warning' : test.difficulty === 'beginner' ? 'success' : 'neutral'} className="capitalize">{test.difficulty}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-surface-600 dark:text-surface-300 leading-relaxed">{test.shortDescription}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-surface-500 dark:text-surface-400">
                        <span className="inline-flex items-center gap-1"><HelpCircle className="w-3 h-3" aria-hidden="true" /> {test.totalQuestions} Qs</span>
                        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" aria-hidden="true" /> {test.timeLimitMinutes} min</span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {(test.tags || []).slice(0, 3).map((tag) => (
                          <span key={tag.id} className="rounded-full bg-surface-100 dark:bg-surface-800 px-2 py-0.5 text-[10px] text-surface-600 dark:text-surface-300">
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label={`Start test ${test.title}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        navigate(`/quiz/${test.slug}`)
                        setIsOpen(false)
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-brand-500 focus-ring min-h-[36px]"
                    >
                      Start <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between gap-3 px-4 py-3 bg-surface-50 dark:bg-surface-950/50 text-[11px] text-surface-500 dark:text-surface-400">
                <span>Press Enter to select</span>
                <button type="button" className="font-medium text-brand-600 dark:text-brand-400 focus-ring rounded p-1" onClick={() => handleSubmit()}>
                  View full catalog →
                </button>
              </div>
            </div>
          )}

          {trimmedQuery.length >= 2 && searchResults.length === 0 && (
            <div className="p-6 text-center" role="status" aria-live="polite">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800 text-surface-500">
                <FileSearch className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-surface-700 dark:text-surface-200">No tests found for “{trimmedQuery}”</p>
              <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">Try Python, SQL, Excel, JavaScript, Aptitude, or DBMS.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
