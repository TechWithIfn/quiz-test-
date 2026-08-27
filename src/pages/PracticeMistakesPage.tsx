import React, { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, CircleAlert, RotateCcw, Search, Trash2, ListRestart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MistakeRecord, Question } from '@/types'
import { mistakeRepository } from '@/services/mistake.service'
import { testRepository } from '@/services/test.service'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { formatRelativeDate } from '@/utils/time'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'

interface PracticeItem {
  mistake: MistakeRecord
  question: Question
}

export const PracticeMistakesPage: React.FC = () => {
  const [items, setItems] = useState<PracticeItem[]>([])

  useEffect(() => {
    let isMounted = true
    const mistakes = mistakeRepository.getAll()

    Promise.all(mistakes.map(async (mistake) => {
      const test = await testRepository.getTestBySlug(mistake.testSlug)
      if (!test) return null
      const questions = await testRepository.getQuestionsForTest(test.id)
      const question = questions.find((item) => item.id === mistake.questionId)
      return question ? { mistake, question } : null
    })).then((resolved) => {
      if (isMounted) setItems(resolved.filter((item): item is PracticeItem => item !== null))
    })

    return () => {
      isMounted = false
    }
  }, [])

  const clearMistakes = () => {
    mistakeRepository.clear()
    setItems([])
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-surface-200 pb-6 dark:border-surface-800 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400">
            <CircleAlert className="h-4 w-4" aria-hidden="true" />
            Local-only practice
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 dark:text-surface-50">Practice Mistakes</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-surface-500">
            Revisit questions you missed on this device. Your mistakes stay in this browser and are never sent anywhere.
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearMistakes} leftIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />}>
            Clear mistakes
          </Button>
        )}
      </header>

      {items.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-surface-300 bg-white p-10 text-center dark:border-surface-700 dark:bg-surface-900">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold text-surface-900 dark:text-surface-50">No mistakes to practice</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-surface-500">Complete a test and any incorrect answers will appear here automatically.</p>
          <Link to="/tests" className="mt-6 inline-flex">
            <Button variant="primary" size="md" rightIcon={<Search className="h-4 w-4" aria-hidden="true" />}>Find a Test</Button>
          </Link>
        </section>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between text-sm text-surface-500">
            <span>{items.length} question{items.length === 1 ? '' : 's'} to revisit</span>
            <span>Stored only on this device</span>
          </div>

          {items.map(({ mistake, question }) => {
            const selectedOption = question.options.find((option) => option.id === mistake.selectedOptionId)
            const correctOption = question.options.find((option) => option.id === mistake.correctOptionId)
            const improved = mistake.correctRetryCount > 0

            return (
              <article key={mistake.id} className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm dark:border-surface-800 dark:bg-surface-900 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-100 pb-3 dark:border-surface-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="brand" size="sm">{mistake.testTitle}</Badge>
                    {question.topic && <Badge variant="neutral" size="sm">{question.topic}</Badge>}
                    {improved && <Badge variant="success" size="sm"><CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Improved</Badge>}
                  </div>
                  <span className="text-xs text-surface-400">Missed {formatRelativeDate(mistake.recordedAt)}</span>
                </div>

                <MarkdownRenderer content={question.text} className="mt-4 text-base font-semibold text-surface-900 dark:text-surface-50" />
                {question.codeSnippet && <CodeBlock code={question.codeSnippet} language={question.codeLanguage || 'typescript'} className="my-4" />}

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-lg border border-rose-200 bg-rose-50/70 p-3 dark:border-rose-900/60 dark:bg-rose-950/30">
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-rose-700/70 dark:text-rose-300/70">Your answer</span>
                    <MarkdownRenderer content={selectedOption?.text || 'Unavailable'} className="mt-1 font-medium text-rose-950 dark:text-rose-100" />
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-emerald-700/70 dark:text-emerald-300/70">Correct answer</span>
                    <MarkdownRenderer content={correctOption?.text || 'Unavailable'} className="mt-1 font-medium text-emerald-950 dark:text-emerald-100" />
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50/60 p-4 dark:border-brand-900/50 dark:bg-brand-950/20">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">Why this is correct</p>
                  <MarkdownRenderer content={question.explanation} className="mt-1 text-sm text-surface-700 dark:text-surface-300" />
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-surface-100 pt-4 dark:border-surface-800 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs text-surface-500">
                    {improved ? `Answered correctly ${mistake.correctRetryCount} time${mistake.correctRetryCount === 1 ? '' : 's'} after this mistake.` : 'Ready to review and try again.'}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/practice/${mistake.testSlug}/${encodeURIComponent(mistake.questionId)}`}>
                      <Button variant="primary" size="sm" leftIcon={<RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />}>
                        Practice Question
                      </Button>
                    </Link>
                    <Link to={`/quiz/${mistake.testSlug}`}>
                      <Button variant="outline" size="sm" leftIcon={<ListRestart className="h-3.5 w-3.5" aria-hidden="true" />}>
                        Practice Full Test
                      </Button>
                    </Link>
                    <Link to={`/tests?q=${encodeURIComponent(question.topic || mistake.testTitle)}`}>
                      <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5 text-surface-400" aria-hidden="true" />}>
                        Similar
                      </Button>
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
