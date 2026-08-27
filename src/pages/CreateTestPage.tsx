import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, FilePlus2, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { RawQuestion, RawTest } from '@/types/content'
import { customTestRepository } from '@/services/custom-test.service'
import { ContentValidatorService } from '@/services/content-validator.service'
import { testRepository } from '@/services/test.service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

const createQuestion = (index: number): RawQuestion => ({
  id: `q-custom-${Date.now()}-${index}`,
  question: '',
  type: 'single-choice',
  options: [{ id: `option-${index}-a`, text: '' }, { id: `option-${index}-b`, text: '' }],
  correctAnswer: `option-${index}-a`,
  explanation: '',
  difficulty: 'beginner',
  topic: '',
  tags: [],
})

const createDraft = (): RawTest => ({
  id: `custom-test-${Date.now()}`,
  slug: '',
  title: '',
  shortDescription: '',
  category: { id: 'cat-custom', name: 'Custom', slug: 'custom' },
  tags: [],
  difficulty: 'beginner',
  estimatedMinutes: 10,
  questionCount: 1,
  language: 'general',
  createdAt: new Date().toISOString(),
  questions: [createQuestion(1)],
})

export const CreateTestPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [draft, setDraft] = useState<RawTest>(createDraft)
  const [customTests, setCustomTests] = useState<RawTest[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [saved, setSaved] = useState(false)

  const refreshTests = () => setCustomTests(customTestRepository.getAll())

  useEffect(() => {
    refreshTests()
    const editId = searchParams.get('edit')
    if (editId) {
      const existing = customTestRepository.getAll().find((test) => test.id === editId)
      if (existing) setDraft(existing)
    }
  }, [searchParams])

  const updateQuestion = (questionIndex: number, update: Partial<RawQuestion>) => {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((question, index) => index === questionIndex ? { ...question, ...update } : question),
      questionCount: current.questions.length,
    }))
  }

  const updateOption = (questionIndex: number, optionIndex: number, text: string) => {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((question, index) => index !== questionIndex ? question : {
        ...question,
        options: question.options.map((option, index) => index === optionIndex ? { ...option, text } : option),
      }),
    }))
  }

  const addQuestion = () => setDraft((current) => ({
    ...current,
    questions: [...current.questions, createQuestion(current.questions.length + 1)],
    questionCount: current.questions.length + 1,
  }))

  const removeQuestion = (questionIndex: number) => {
    if (draft.questions.length <= 1) return
    setDraft((current) => ({ ...current, questions: current.questions.filter((_, index) => index !== questionIndex), questionCount: current.questions.length - 1 }))
  }

  const save = async () => {
    const existing = await testRepository.getTestBySlug(draft.slug)
    const duplicateSlug = existing && existing.id !== draft.id
    const validation = ContentValidatorService.validateAll([
      ...customTestRepository.getAll().filter((test) => test.id !== draft.id),
      draft,
    ])
    const nextErrors = validation.errors.map((issue) => issue.message)
    if (duplicateSlug) nextErrors.push(`The slug "${draft.slug}" is already in use.`)
    if (nextErrors.length > 0) {
      setErrors(nextErrors)
      setSaved(false)
      return
    }

    customTestRepository.save({ ...draft, questionCount: draft.questions.length, updatedAt: new Date().toISOString() })
    refreshTests()
    setErrors([])
    setSaved(true)
    navigate(`/tests/${draft.slug}`)
  }

  const edit = (test: RawTest) => {
    setDraft(test)
    setSaved(false)
    setErrors([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = (id: string) => {
    customTestRepository.delete(id)
    refreshTests()
    if (draft.id === id) setDraft(createDraft())
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="border-b border-surface-200 pb-6 dark:border-surface-800">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400"><FilePlus2 className="h-4 w-4" /> Local authoring</div>
        <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 dark:text-surface-50">Create a Custom Test</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-surface-500">Build a private single-choice test that runs in the same client-side quiz engine. It stays on this device and requires no account.</p>
      </header>

      <section className="space-y-6">
        <div className="grid gap-4 rounded-xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900 sm:grid-cols-2">
          <Input aria-label="Test title" placeholder="Test title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
          <Input aria-label="URL slug" placeholder="url-slug" value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} />
          <Input aria-label="Short description" placeholder="Short description" value={draft.shortDescription} onChange={(event) => setDraft({ ...draft, shortDescription: event.target.value })} className="sm:col-span-2" />
          <Input aria-label="Category" placeholder="Category" value={draft.category.name} onChange={(event) => setDraft({ ...draft, category: { ...draft.category, name: event.target.value, slug: event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') } })} />
          <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">Difficulty
            <select value={draft.difficulty} onChange={(event) => setDraft({ ...draft, difficulty: event.target.value as RawTest['difficulty'] })} className="rounded-lg border border-surface-300 bg-white px-3 py-2 dark:border-surface-700 dark:bg-surface-900">
              <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
            </select>
          </label>
        </div>

        {draft.questions.map((question, questionIndex) => (
          <article key={question.id} className="rounded-xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-surface-900 dark:text-surface-50">Question {questionIndex + 1}</h2>
              <Button variant="ghost" size="sm" onClick={() => removeQuestion(questionIndex)} disabled={draft.questions.length <= 1} aria-label={`Remove question ${questionIndex + 1}`}><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4">
              <textarea aria-label={`Question ${questionIndex + 1} text`} placeholder="Question text. Markdown and math are supported." value={question.question} onChange={(event) => updateQuestion(questionIndex, { question: event.target.value })} className="min-h-24 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm text-surface-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" />
              <div className="grid gap-3 sm:grid-cols-2">
                {question.options.map((option, optionIndex) => (
                  <Input key={option.id} aria-label={`Question ${questionIndex + 1} option ${optionIndex + 1}`} placeholder={`Option ${optionIndex + 1}`} value={option.text} onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)} />
                ))}
              </div>
              <label className="block text-sm text-surface-600 dark:text-surface-300">Correct option
                <select value={question.correctAnswer} onChange={(event) => updateQuestion(questionIndex, { correctAnswer: event.target.value })} className="ml-2 rounded-lg border border-surface-300 bg-white px-3 py-2 dark:border-surface-700 dark:bg-surface-900">
                  {question.options.map((option, index) => <option key={option.id} value={option.id}>Option {index + 1}</option>)}
                </select>
              </label>
              <Input aria-label={`Question ${questionIndex + 1} topic`} placeholder="Topic" value={question.topic} onChange={(event) => updateQuestion(questionIndex, { topic: event.target.value })} />
              <textarea aria-label={`Question ${questionIndex + 1} explanation`} placeholder="Explanation shown after completion" value={question.explanation} onChange={(event) => updateQuestion(questionIndex, { explanation: event.target.value })} className="min-h-24 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm text-surface-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" />
            </div>
          </article>
        ))}

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="md" onClick={addQuestion} leftIcon={<Plus className="h-4 w-4" />}>Add Question</Button>
          <Button variant="primary" size="md" onClick={save} leftIcon={<CheckCircle2 className="h-4 w-4" />}>{searchParams.get('edit') ? 'Save Changes' : 'Save Custom Test'}</Button>
        </div>
      </section>

      {saved && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">Saved locally. Your custom test is ready to start.</div>}
      {errors.length > 0 && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200"><ul className="list-disc space-y-1 pl-5">{errors.map((error, index) => <li key={`${error}-${index}`}>{error}</li>)}</ul></div>}

      <section className="border-t border-surface-200 pt-6 dark:border-surface-800">
        <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Your Custom Tests</h2>
        <div className="mt-4 space-y-3">
          {customTests.length === 0 ? <p className="text-sm text-surface-500">Your saved tests will appear here.</p> : customTests.map((test) => (
            <div key={test.id} className="flex flex-col gap-3 rounded-lg border border-surface-200 bg-white p-4 dark:border-surface-800 dark:bg-surface-900 sm:flex-row sm:items-center sm:justify-between">
              <div><div className="font-semibold text-surface-900 dark:text-surface-100">{test.title || 'Untitled test'}</div><div className="mt-1 flex gap-2"><Badge variant="neutral" size="sm">{test.questions.length} questions</Badge><span className="text-xs text-surface-500">/{test.slug}</span></div></div>
              <div className="flex gap-2"><Link to={`/tests/${test.slug}`}><Button variant="outline" size="sm" leftIcon={<Search className="h-3.5 w-3.5" />}>Open</Button></Link><Button variant="ghost" size="sm" onClick={() => edit(test)} leftIcon={<Pencil className="h-3.5 w-3.5" />}>Edit</Button><Button variant="ghost" size="sm" onClick={() => remove(test.id)} aria-label={`Delete ${test.title}`}><Trash2 className="h-4 w-4" /></Button></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
