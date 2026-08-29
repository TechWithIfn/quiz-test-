import { describe, it, expect } from 'vitest'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateLoaded, validateContentDir } from '../src/content/validate.js'
import type { LoadedRaw } from '../src/content/loader.js'
import type { CategoryFile, TopicFile, QuestionFile, TestFile } from '../src/content/schema.js'

const here = path.dirname(fileURLToPath(import.meta.url))

function cat(over: Partial<CategoryFile> = {}): CategoryFile {
  return { id: 'cat_algorithms', slug: 'algorithms', name: 'Algorithms', ...over } as CategoryFile
}
function topic(over: Partial<TopicFile> = {}): TopicFile {
  return { id: 'topic_sorting', slug: 'sorting', name: 'Sorting', categorySlug: 'algorithms', original: true, ...over } as TopicFile
}
function question(over: Partial<QuestionFile> = {}): QuestionFile {
  return {
    id: 'q1',
    type: 'single-choice',
    question: 'Sample question?',
    options: [
      { id: 'a', text: 'A', correct: true },
      { id: 'b', text: 'B', correct: false },
    ],
    explanation: 'Because.',
    difficulty: 'beginner',
    topicSlug: 'sorting',
    points: 1,
    tags: [],
    original: true,
    ...over,
  } as QuestionFile
}
function test(over: Partial<TestFile> = {}): TestFile {
  return {
    id: 't1',
    slug: 'sample-test',
    title: 'Sample Test',
    shortDescription: '',
    difficulty: 'beginner',
    categorySlug: 'algorithms',
    questionIds: ['q1'],
    tags: [],
    status: 'published',
    version: '1.0.0',
    estimatedMinutes: 10,
    featured: false,
    passingScorePercentage: 70,
    original: true,
    ...over,
  } as TestFile
}

const mk = (arr: unknown[]) => arr.map((data) => ({ data, path: 'memory' }))

function base(over: Partial<LoadedRaw> = {}): LoadedRaw {
  return {
    categories: mk([cat()]),
    topics: mk([topic()]),
    questions: mk([question()]),
    tests: mk([test()]),
    ...over,
  }
}

describe('content validation', () => {
  it('accepts the committed sample content/ directory', () => {
    const root = path.resolve(here, '..', '..', 'content')
    const result = validateContentDir(root)
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it('detects duplicate IDs', () => {
    const result = validateLoaded(
      base({ questions: mk([question({ id: 'q1' }), question({ id: 'q1', question: 'Other?' })]) }),
    )
    expect(result.valid).toBe(false)
    expect(result.issues.some((i) => i.code === 'DUPLICATE_ID')).toBe(true)
  })

  it('detects duplicate slugs', () => {
    const result = validateLoaded(
      base({ tests: mk([test({ slug: 'dup' }), test({ id: 't2', slug: 'dup' })]) }),
    )
    expect(result.issues.some((i) => i.code === 'DUPLICATE_SLUG')).toBe(true)
  })

  it('detects duplicate questions (same text)', () => {
    const result = validateLoaded(
      base({
        questions: mk([
          question({ id: 'q1', question: 'Same text?' }),
          question({ id: 'q2', question: 'Same text?' }),
        ]),
      }),
    )
    expect(result.issues.some((i) => i.code === 'DUPLICATE_QUESTION')).toBe(true)
  })

  it('detects invalid references (unknown question in a test)', () => {
    const result = validateLoaded(base({ tests: mk([test({ questionIds: ['missing'] })]) }))
    expect(result.issues.some((i) => i.code === 'INVALID_REFERENCE')).toBe(true)
  })

  it('detects invalid references (unknown topic on a question)', () => {
    const result = validateLoaded(base({ questions: mk([question({ topicSlug: 'missing' })]) }))
    expect(result.issues.some((i) => i.code === 'INVALID_REFERENCE')).toBe(true)
  })

  it('detects missing options on a choice question', () => {
    const result = validateLoaded(
      base({ questions: mk([question({ options: [{ id: 'a', text: 'A', correct: true }] })]) }),
    )
    expect(result.issues.some((i) => i.code === 'MISSING_OPTIONS')).toBe(true)
  })

  it('detects invalid answers (single-choice with two correct options)', () => {
    const result = validateLoaded(
      base({
        questions: mk([
          question({
            options: [
              { id: 'a', text: 'A', correct: true },
              { id: 'b', text: 'B', correct: true },
            ],
          }),
        ]),
      }),
    )
    expect(result.issues.some((i) => i.code === 'INVALID_ANSWER')).toBe(true)
  })

  it('detects missing explanation (schema error)', () => {
    const result = validateLoaded(base({ questions: mk([question({ explanation: '' })]) }))
    expect(result.issues.some((i) => i.code === 'SCHEMA_ERROR')).toBe(true)
  })

  it('detects invalid difficulty (schema error)', () => {
    const result = validateLoaded(base({ questions: mk([question({ difficulty: 'expert' as never })]) }))
    expect(result.issues.some((i) => i.code === 'SCHEMA_ERROR')).toBe(true)
  })

  it('detects non-original content (copyright rule)', () => {
    const result = validateLoaded(base({ questions: mk([question({ original: false } as never)]) }))
    expect(result.issues.some((i) => i.code === 'SCHEMA_ERROR')).toBe(true)
  })
})
