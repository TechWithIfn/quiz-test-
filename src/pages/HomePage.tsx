import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Sparkles,
  Search,
  Zap,
  BookOpen,
  BrainCircuit,
  Lock,
  Code2,
  Braces,
  Database,
  Globe,
  Coffee,
  Paintbrush,
  Atom,
  Server,
  Hash,
  FileCode,
  Terminal,
  Layers,
  type LucideIcon,
} from 'lucide-react'
import { Test } from '@/types'
import { TEST_CATEGORIES } from '@/config/constants'
import { testRepository } from '@/services/test.service'
import { SearchBar } from '@/features/search/SearchBar'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'

type LangMeta = {
  label: string
  icon: LucideIcon
  color: string
  text: string
  blurb: string
  to: string
}

const LANGUAGE_META: Record<string, LangMeta> = {
  html: { label: 'HTML', icon: Code2, color: '#e34f26', text: '#ffffff', blurb: 'Structure pages with semantic, accessible markup.', to: '/tests?q=html' },
  css: { label: 'CSS', icon: Paintbrush, color: '#1572b6', text: '#ffffff', blurb: 'Style and lay out pages with modern CSS.', to: '/tests?q=css' },
  javascript: { label: 'JavaScript', icon: Braces, color: '#f7df1e', text: '#0f172a', blurb: 'Add interactivity with the language of the web.', to: '/tests?q=javascript' },
  react: { label: 'React', icon: Atom, color: '#61dafb', text: '#0f172a', blurb: 'Build component-driven user interfaces.', to: '/tests?q=react' },
  nodejs: { label: 'Node.js', icon: Server, color: '#339933', text: '#ffffff', blurb: 'Server-side JavaScript and APIs.', to: '/tests?q=nodejs' },
  python: { label: 'Python', icon: FileCode, color: '#3776ab', text: '#ffffff', blurb: 'Scripting, data, and automation made simple.', to: '/tests?q=python' },
  sql: { label: 'SQL', icon: Database, color: '#4479a1', text: '#ffffff', blurb: 'Query and model relational data.', to: '/tests?q=sql' },
  java: { label: 'Java', icon: Coffee, color: '#ed8b00', text: '#ffffff', blurb: 'Strongly typed, object-oriented fundamentals.', to: '/tests?q=java' },
  c: { label: 'C', icon: Hash, color: '#283593', text: '#ffffff', blurb: 'Pointers, memory, and low-level systems.', to: '/tests?q=c' },
  cpp: { label: 'C++', icon: FileCode, color: '#00599c', text: '#ffffff', blurb: 'Classes, references, and modern C++.', to: '/tests?q=cpp' },
  typescript: { label: 'TypeScript', icon: FileCode, color: '#3178c6', text: '#ffffff', blurb: 'Typed JavaScript at scale.', to: '/tests?q=typescript' },
  php: { label: 'PHP', icon: Terminal, color: '#777bb4', text: '#ffffff', blurb: 'Server-side web scripting.', to: '/tests?q=php' },
  excel: { label: 'Excel', icon: Layers, color: '#16a34a', text: '#ffffff', blurb: 'Spreadsheets, formulas, and analysis.', to: '/tests?q=excel' },
  mixed: { label: 'Web Development', icon: Globe, color: '#0284c7', text: '#ffffff', blurb: 'HTML, CSS, and browser basics together.', to: '/categories/web-development' },
}

const LANGUAGE_ORDER = [
  'html', 'css', 'javascript', 'react', 'nodejs', 'python',
  'sql', 'java', 'c', 'cpp', 'typescript', 'php', 'excel', 'mixed',
]

const QUICK_EXAMPLES = [
  'Python interview test',
  'SQL test for data analyst',
  'Excel MCQ test',
  'JavaScript test',
  'Aptitude test',
  'DBMS test',
]

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Zap, title: 'Start instantly', description: 'No account, no setup. Pick a test and begin in one click.' },
  { icon: BookOpen, title: 'Learn from explanations', description: 'Every answer ships with a clear, in-depth explanation.' },
  { icon: BrainCircuit, title: 'Practice your mistakes', description: 'Revisit the questions you got wrong until they stick.' },
  { icon: Lock, title: 'Fully private', description: 'Everything runs locally in your browser. We keep none of your data.' },
]

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [allTests, setAllTests] = useState<Test[]>([])
  const [popularTests, setPopularTests] = useState<Test[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadError, setHasLoadError] = useState(false)

  const loadHome = useCallback(() => {
    setHasLoadError(false)
    setIsLoading(true)
    testRepository.getAllTests()
      .then((tests) => {
        setAllTests(tests)
        setPopularTests(tests.filter((test) => test.featured || test.totalQuestions >= 4).slice(0, 4))
      })
      .catch(() => setHasLoadError(true))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    loadHome()
  }, [loadHome])

  const languageGroups = useMemo(() => {
    const map = new Map<string, Test[]>()
    for (const test of allTests) {
      const key = test.language || 'other'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(test)
    }
    const ordered = LANGUAGE_ORDER.filter((lang) => map.has(lang)).map((lang) => ({
      key: lang,
      meta: LANGUAGE_META[lang],
      tests: map.get(lang)!,
    }))
    for (const [key, tests] of map) {
      if (!LANGUAGE_ORDER.includes(key)) {
        ordered.push({
          key,
          meta: {
            label: key.replace(/^\w/, (c) => c.toUpperCase()),
            icon: Code2,
            color: '#334155',
            text: '#ffffff',
            blurb: 'Practice and assess your skills.',
            to: `/tests?q=${encodeURIComponent(key)}`,
          },
          tests,
        })
      }
    }
    return ordered
  }, [allTests])

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden rounded-[28px] border border-surface-200 bg-gradient-to-br from-brand-50 via-white to-surface-50 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] dark:border-surface-800 dark:from-surface-900 dark:via-surface-900 dark:to-surface-800 sm:p-10 lg:p-14">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-800/30" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-cyan-200/40 blur-3xl dark:bg-cyan-800/20" />

        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700 shadow-sm dark:border-brand-800 dark:bg-surface-900 dark:text-brand-300">
            <Sparkles className="h-3.5 w-3.5" />
            Zero friction learning
          </div>

          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-surface-900 dark:text-surface-50 sm:text-5xl lg:text-6xl">
            Find a test. <span className="text-brand-600 dark:text-brand-400">Start learning.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm text-surface-600 dark:text-surface-300 sm:text-base">
            Search any assessment in seconds, start instantly, and jump into a focused practice session
            without picking a class, branch, or account.
          </p>

          <div className="mt-7 max-w-2xl">
            <SearchBar tests={allTests} placeholder="What do you want to test?" autoFocus />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_EXAMPLES.map((example) => (
              <Link
                key={example}
                to={`/tests?q=${encodeURIComponent(example)}`}
                className="rounded-full border border-surface-200 bg-white px-3 py-1.5 text-xs text-surface-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:hover:border-brand-700 dark:hover:text-brand-400"
              >
                {example}
              </Link>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:max-w-xl sm:grid-cols-4">
            <Stat value={`${allTests.length}+`} label="Tests" />
            <Stat value={`${languageGroups.length}`} label="Languages" />
            <Stat value="0" label="Accounts" />
            <Stat value="Instant" label="Feedback" />
          </div>
        </div>
      </section>

      {/* ===== FEATURE OVERVIEW ===== */}
      <section className="mt-12">
        <SectionHeading
          eyebrow="What you get"
          title="A complete practice toolkit"
          subtitle="Everything you need to learn, test, and improve — right in the browser."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-surface-800 dark:bg-surface-900"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-surface-600 dark:text-surface-300">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ===== LANGUAGES (section by section) ===== */}
      <section className="mt-14">
        <SectionHeading
          eyebrow="Programming & web"
          title="Practice the languages you love"
          subtitle="Pick a language to dive into focused tests — from the basics to interview-level questions."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {languageGroups.map(({ key, meta, tests }) => {
            const Icon = meta.icon
            return (
              <Link
                key={key}
                to={meta.to}
                className="group relative overflow-hidden rounded-2xl p-5 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                style={{ backgroundColor: meta.color, color: meta.text }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
                  >
                    {tests.length} {tests.length === 1 ? 'test' : 'tests'}
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-bold tracking-tight">{meta.label}</h3>
                <p className="mt-1 text-sm opacity-90">{meta.blurb}</p>

                <span
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: meta.text }}
                >
                  Start {meta.label} test
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="mt-14">
        <SectionHeading
          eyebrow="Browse wider"
          title="Or explore by topic"
          subtitle="From aptitude to cybersecurity — find the right track for your goal."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {TEST_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.slug}`}
              className="flex items-center gap-3 rounded-2xl border border-surface-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-surface-800 dark:bg-surface-900"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                style={{ backgroundColor: category.color || '#334155' }}
              >
                {category.name.charAt(0)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-surface-900 dark:text-surface-100">
                  {category.name}
                </span>
                <span className="block truncate text-xs text-surface-500 dark:text-surface-400">
                  {category.description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== POPULAR TESTS ===== */}
      <section className="mt-14">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-surface-500 dark:text-surface-400">Popular tests</p>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Quick start picks</h2>
          </div>
          <Link
            to="/tests"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
          >
            Browse all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {hasLoadError ? (
          <ErrorState message="The test catalog could not be loaded." onRetry={loadHome} />
        ) : isLoading ? (
          <div className="rounded-2xl border border-dashed border-surface-300 p-8 text-center text-sm text-surface-500 dark:border-surface-700 dark:text-surface-400">
            Loading tests...
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {popularTests.map((test) => (
              <div key={test.id} className="flex flex-col rounded-2xl border border-surface-200 bg-white p-4 shadow-sm dark:border-surface-800 dark:bg-surface-900">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-brand-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                    {test.category.name}
                  </span>
                  <span className="text-[11px] font-medium capitalize text-surface-500 dark:text-surface-400">{test.difficulty}</span>
                </div>

                <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">{test.title}</h3>
                <p className="mt-2 flex-1 text-sm text-surface-600 dark:text-surface-300">{test.shortDescription}</p>

                <div className="mt-4 flex items-center justify-between text-xs text-surface-500 dark:text-surface-400">
                  <span>{test.totalQuestions} questions</span>
                  <span>{test.timeLimitMinutes} min</span>
                </div>

                <Button className="mt-5 w-full" onClick={() => navigate(`/quiz/${test.slug}`)} rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Start Test
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="mt-14 overflow-hidden rounded-[28px] bg-surface-900 p-8 text-center text-white dark:bg-surface-800 sm:p-12">
        <Search className="mx-auto h-8 w-8 text-brand-400" />
        <h2 className="mt-4 text-2xl font-bold sm:text-3xl">Ready to test what you know?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-surface-300">
          Search a topic above or jump straight into the full catalog. It takes less than a second to begin.
        </p>
        <Link to="/tests" className="mt-6 inline-flex">
          <Button variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Explore all tests
          </Button>
        </Link>
      </section>
    </div>
  )
}

const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="rounded-xl border border-surface-200 bg-white/70 px-3 py-3 text-center backdrop-blur-sm dark:border-surface-700 dark:bg-surface-900/60">
    <div className="text-xl font-extrabold text-surface-900 dark:text-surface-50">{value}</div>
    <div className="text-[11px] font-medium uppercase tracking-wide text-surface-500 dark:text-surface-400">{label}</div>
  </div>
)

const SectionHeading: React.FC<{ eyebrow: string; title: string; subtitle: string }> = ({ eyebrow, title, subtitle }) => (
  <div className="mb-6">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">{eyebrow}</p>
    <h2 className="mt-1 text-2xl font-bold text-surface-900 dark:text-surface-50 sm:text-3xl">{title}</h2>
    <p className="mt-1 max-w-2xl text-sm text-surface-500 dark:text-surface-400">{subtitle}</p>
  </div>
)
