import React, { useState } from 'react'
import { AlertCircle, CheckCircle2, FileCheck2, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ContentValidatorService } from '@/services/content-validator.service'
import { ValidationResult } from '@/types/content'
import { Button } from '@/components/ui/Button'

const starter = `{
  "id": "test-example",
  "slug": "example-test",
  "title": "Example Test",
  "shortDescription": "A short test description.",
  "category": { "id": "cat-example", "name": "Example", "slug": "example" },
  "tags": [],
  "difficulty": "beginner",
  "estimatedMinutes": 5,
  "questionCount": 1,
  "language": "general",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "questions": [
    {
      "id": "q-example-1",
      "question": "Which option is correct?",
      "type": "single-choice",
      "options": [{ "id": "a", "text": "Correct" }, { "id": "b", "text": "Other" }],
      "correctAnswer": "a",
      "explanation": "This option is correct because it matches the question.",
      "difficulty": "beginner",
      "topic": "Basics",
      "tags": []
    }
  ]
}`

export const ValidateTestPage: React.FC = () => {
  const [serialized, setSerialized] = useState('')
  const [result, setResult] = useState<ValidationResult | null>(null)

  const validate = () => setResult(ContentValidatorService.validateSerialized(serialized))

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="border-b border-surface-200 pb-6 dark:border-surface-800">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400">
          <FileCheck2 className="h-4 w-4" />
          Contributor tool
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 dark:text-surface-50">Validate a Test</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-surface-500">Check a JSON test definition against the QuizFlow content schema before adding it to the repository. Nothing is uploaded.</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div>
          <label htmlFor="test-json" className="mb-2 block text-sm font-semibold text-surface-900 dark:text-surface-100">Test JSON</label>
          <textarea
            id="test-json"
            value={serialized}
            onChange={(event) => setSerialized(event.target.value)}
            placeholder={starter}
            spellCheck={false}
            className="min-h-[30rem] w-full resize-y rounded-xl border border-surface-300 bg-surface-950 p-4 font-mono text-xs leading-relaxed text-surface-100 placeholder:text-surface-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-surface-700"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="primary" size="md" onClick={validate} leftIcon={<FileCheck2 className="h-4 w-4" />}>Validate JSON</Button>
            <Button variant="outline" size="md" onClick={() => setSerialized(starter)}>Load Example</Button>
            <Button variant="ghost" size="md" onClick={() => { setSerialized(''); setResult(null) }}>Clear</Button>
          </div>
        </div>

        <aside className="rounded-xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
          <h2 className="font-semibold text-surface-900 dark:text-surface-50">Checks included</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-surface-600 dark:text-surface-300">
            <li>Unique IDs and URL-safe slugs</li>
            <li>Required test metadata and categories</li>
            <li>At least two options per question</li>
            <li>Correct answer references</li>
            <li>Explanations and topic coverage</li>
          </ul>
          <Link to="/tests" className="mt-6 inline-flex">
            <Button variant="ghost" size="sm" leftIcon={<Search className="h-4 w-4" />}>Browse Tests</Button>
          </Link>
        </aside>
      </section>

      {result && (
        <section aria-live="polite" className="space-y-4">
          <div className={result.valid ? 'rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30' : 'rounded-xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900/60 dark:bg-rose-950/30'}>
            <div className="flex items-center gap-2 font-semibold text-surface-900 dark:text-surface-50">
              {result.valid ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-rose-600" />}
              {result.valid ? 'Submission is valid' : 'Submission needs changes'}
            </div>
            <p className="mt-1 text-sm text-surface-600 dark:text-surface-300">{result.totalTests} test(s), {result.totalQuestions} question(s), {result.errors.length} error(s), {result.warnings.length} warning(s).</p>
          </div>

          {[...result.errors, ...result.warnings].map((issue, index) => (
            <div key={`${issue.field}-${index}`} className="rounded-lg border border-surface-200 bg-white p-4 text-sm dark:border-surface-800 dark:bg-surface-900">
              <div className="font-semibold text-surface-900 dark:text-surface-100">{issue.type === 'error' ? 'Error' : 'Warning'} · {issue.field}</div>
              <p className="mt-1 text-surface-600 dark:text-surface-300">{issue.message}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
