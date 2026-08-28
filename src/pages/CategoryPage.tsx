import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, BookOpen, ChevronRight, Layers } from 'lucide-react'
import { testRepository } from '@/services/test.service'
import { Test, TestCategory } from '@/types'
import { TestCard } from '@/features/tests/TestCard'
import { applyCategorySeoMetadata, applyStaticPageSeoMetadata } from '@/utils/seo'

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<TestCategory[]>([])
  const [allTests, setAllTests] = useState<Test[]>([])
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let isMounted = true
    Promise.all([testRepository.getCategories(), testRepository.getAllTests()]).then(
      ([cats, tests]) => {
        if (!isMounted) return
        setCategories(cats)
        setAllTests(tests)
      }
    )
    return () => {
      isMounted = false
    }
  }, [])

  const category = slug ? categories.find((cat) => cat.slug === slug) : undefined

  useEffect(() => {
    if (!slug) {
      applyStaticPageSeoMetadata({
        title: 'Test Categories – Browse Practice Tests by Topic | QuizFlow',
        description:
          'Browse every practice test category on QuizFlow. Pick a topic to explore free quizzes with instant scoring and detailed explanations. No login required.',
        path: '/categories',
        keywords: ['test categories', 'practice test topics', 'free quizzes by topic'],
      })
      return
    }

    if (category) {
      const testsForCategory = allTests.filter((test) => test.category?.slug === category.slug)
      applyCategorySeoMetadata(category, testsForCategory.length)
    } else if (categories.length > 0) {
      setNotFound(true)
    }
  }, [slug, category, categories, allTests])

  if (slug && notFound) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
        <h1 className="mb-2 text-2xl font-bold text-surface-900 dark:text-surface-50">
          Category not found
        </h1>
        <p className="mb-6 text-surface-600 dark:text-surface-300">
          We couldn't find a category called “{slug}”. Browse all available categories instead.
        </p>
        <button
          type="button"
          onClick={() => navigate('/categories')}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Browse categories
        </button>
      </div>
    )
  }

  if (!slug) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-surface-900 dark:text-surface-50">
            Browse Tests by Category
          </h1>
          <p className="max-w-2xl text-surface-600 dark:text-surface-300">
            Pick a topic to explore free practice tests and quizzes. Every test includes instant
            scoring and detailed explanations, with no login required.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const count = allTests.filter((test) => test.category?.slug === cat.slug).length
            return (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="group rounded-2xl border border-surface-200 bg-white p-5 transition hover:border-brand-500 hover:shadow-lg dark:border-surface-700 dark:bg-surface-800"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <Layers className="h-5 w-5" />
                  </span>
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                    {cat.name}
                  </h2>
                </div>
                <p className="mb-4 text-sm text-surface-600 dark:text-surface-300">
                  {cat.description || `Practice ${cat.name.toLowerCase()} tests and quizzes.`}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-surface-500">
                    {count} {count === 1 ? 'test' : 'tests'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:gap-2 dark:text-brand-400">
                    Explore <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  const tests = allTests.filter((test) => test.category?.slug === slug)
  const indexableTests = tests.filter(
    (test) => (test.totalQuestions ?? test.questionCount ?? 0) >= 10
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="mb-4 flex items-center gap-1 text-sm text-surface-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-brand-600">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-surface-700 dark:text-surface-200">
          {category?.name} Tests
        </span>
      </nav>

      <header className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <BookOpen className="h-5 w-5" />
          </span>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-50">
            {category?.name} Tests &amp; Quizzes
          </h1>
        </div>
        <p className="max-w-3xl text-surface-600 dark:text-surface-300">
          {category?.description ||
            `Practice ${category?.name.toLowerCase()} tests with instant scoring and detailed explanations.`}{' '}
          Browse {tests.length} {tests.length === 1 ? 'assessment' : 'assessments'} below.
        </p>
      </header>

      {tests.length === 0 ? (
        <p className="text-surface-600 dark:text-surface-300">
          No tests are available in this category yet. Check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>
      )}

      {indexableTests.length > 0 && tests.length > indexableTests.length && (
        <p className="mt-8 text-sm text-surface-500">
          Additional practice sets are available while we expand question coverage.
        </p>
      )}
    </div>
  )
}
