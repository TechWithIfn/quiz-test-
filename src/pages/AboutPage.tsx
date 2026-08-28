import React from 'react'
import { Link } from 'react-router-dom'
import {
  Zap,
  Code2,
  Lock,
  GitBranch,
  Layers,
  ArrowRight,
  Database
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { useEffect } from 'react'
import { applyStaticPageSeoMetadata } from '@/utils/seo'

export const AboutPage: React.FC = () => {
  useEffect(() => {
    applyStaticPageSeoMetadata({
      title: 'About QuizFlow – Free, Open-Source Practice Tests',
      description:
        'QuizFlow is a free, open-source platform for practice tests and quizzes. No login, no tracking, fully client-side, and community-driven. Learn more about our approach.',
      path: '/about',
      keywords: ['about QuizFlow', 'open source quiz', 'free practice tests'],
    })
  }, [])
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
      {/* Top Banner */}
      <div className="text-center space-y-4">
        <Badge variant="brand" size="md">
          Open-Source Manifesto
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-surface-50 tracking-tight">
          Learning Should Have Zero Friction
        </h1>
        <p className="text-base text-surface-600 dark:text-surface-300 max-w-2xl mx-auto leading-relaxed">
          QuizFlow is built on a single uncompromising principle: users should be able to search for any test and start it immediately.
        </p>
      </div>

      {/* Core Philosophies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
            No Login • No Personal Data
          </h3>
          <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
            We will never ask you for your name, email, phone number, class, semester, branch, college, or grade. Testing tools should empower mastery, not build user dossiers.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
            Instant Start & Offline Ready
          </h3>
          <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
            The core test engine runs entirely client-side. Tests load instantly, evaluate in real-time, and preserve your attempt history directly in your browser.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
            Plug & Play Architecture
          </h3>
          <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
            Storage and data access are decoupled using the Repository Pattern (<code className="text-xs font-mono">ITestRepository</code>). A cloud sync or backend API layer can be attached anytime without touching the quiz runner.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
            Community & Open Standards
          </h3>
          <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
            Built with modern React 18, TypeScript, Tailwind CSS, Fuse.js, and Vitest. Question banks are standard JSON schema structures that anyone can fork and contribute to.
          </p>
        </div>
      </div>

      {/* Schema Structure Documentation */}
      <div className="p-6 sm:p-8 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">
            Clean Domain Models
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400">
          All data structures are typed strictly in TypeScript to ensure effortless maintainability:
        </p>

        <CodeBlock
          language="typescript"
          code={`export interface Test {
  id: string
  slug: string
  title: string
  shortDescription: string
  category: TestCategory
  tags: TestTag[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  timeLimitMinutes: number
  totalQuestions: number
  passingScorePercentage: number
}

export interface Question {
  id: string
  testId: string
  text: string
  codeSnippet?: string
  options: QuestionOption[]
  correctOptionId: string
  explanation: string
  points: number
}`}
        />
      </div>

      {/* Contribution Section */}
      <div id="contributing" className="p-6 sm:p-8 rounded-2xl bg-surface-100 dark:bg-surface-900/60 border border-surface-200 dark:border-surface-800 space-y-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">
            How to Add New Tests
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
          Adding a new assessment is as simple as creating an entry in <code className="text-xs font-mono">src/data/tests/</code> and registering it in <code className="text-xs font-mono">src/data/tests/index.ts</code>. Refer to <code className="text-xs font-mono">docs/CONTRIBUTING_TESTS.md</code> for full schema guidelines and test suites. Pull requests with high-quality explanations are always welcomed.
        </p>

        <div className="pt-2 flex items-center gap-3">
          <Link to="/tests">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore Current Tests
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
