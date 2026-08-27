import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Test } from '@/types'
import { testRepository } from '@/services/test.service'
import { SearchBar } from '@/features/search/SearchBar'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [allTests, setAllTests] = useState<Test[]>([])
  const [popularTests, setPopularTests] = useState<Test[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadError, setHasLoadError] = useState(false)

  useEffect(() => {
    setHasLoadError(false)
    testRepository.getAllTests()
      .then((tests) => {
        setAllTests(tests)
        setPopularTests(tests.filter((test) => test.featured || test.totalQuestions >= 4).slice(0, 4))
      })
      .catch(() => setHasLoadError(true))
      .finally(() => setIsLoading(false))
  }, [])

  const quickSearchExamples = [
    'Python interview test',
    'SQL test for data analyst',
    'Excel MCQ test',
    'JavaScript test',
    'Aptitude test',
    'DBMS test',
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <section className="rounded-[28px] border border-surface-200 bg-white/80 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.05)] backdrop-blur-sm dark:border-surface-800 dark:bg-surface-900/80 sm:p-8 lg:p-12">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700 dark:border-brand-800 dark:bg-brand-950/60 dark:text-brand-300">
          <Sparkles className="h-3.5 w-3.5" />
          Zero friction learning
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-surface-900 dark:text-surface-50 sm:text-5xl lg:text-6xl">
              Find a test. <span className="text-brand-600 dark:text-brand-400">Start learning.</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm text-surface-600 dark:text-surface-300 sm:text-base">
              Search any assessment in seconds, start instantly, and jump into a focused practice session without picking a class, branch, or account.
            </p>

            <div className="mt-6 max-w-2xl">
              <SearchBar tests={allTests} placeholder="What do you want to test?" autoFocus />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {quickSearchExamples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => navigate(`/tests?q=${encodeURIComponent(example)}`)}
                  className="rounded-full border border-surface-200 bg-surface-50 px-3 py-1.5 text-xs text-surface-600 transition hover:border-brand-200 hover:text-brand-700 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:border-brand-700 dark:hover:text-brand-400"
                >
                  {example}
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-surface-500 dark:text-surface-400">Popular tests</p>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Quick start picks</h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/tests')}
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
          >
            Browse all <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {hasLoadError ? (
          <ErrorState message="The test catalog could not be loaded." onRetry={() => window.location.reload()} />
        ) : isLoading ? (
          <div className="rounded-2xl border border-dashed border-surface-300 p-8 text-center text-sm text-surface-500 dark:border-surface-700 dark:text-surface-400">
            Loading tests...
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {popularTests.map((test) => (
              <div key={test.id} className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm dark:border-surface-800 dark:bg-surface-900">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-brand-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                    {test.category.name}
                  </span>
                  <span className="text-[11px] font-medium capitalize text-surface-500 dark:text-surface-400">{test.difficulty}</span>
                </div>

                <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">{test.title}</h3>
                <p className="mt-2 text-sm text-surface-600 dark:text-surface-300">{test.shortDescription}</p>

                <div className="mt-4 flex items-center justify-between text-xs text-surface-500 dark:text-surface-400">
                  <span>{test.totalQuestions} questions</span>
                  <span>{test.timeLimitMinutes} min</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-1">
                  {(test.tags || []).slice(0, 3).map((tag) => (
                    <span key={tag.id} className="rounded-full bg-surface-100 px-2 py-1 text-[10px] text-surface-600 dark:bg-surface-800 dark:text-surface-300">
                      #{tag.name}
                    </span>
                  ))}
                </div>

                <Button className="mt-5 w-full" onClick={() => navigate(`/quiz/${test.slug}`)} rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Start Test
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
