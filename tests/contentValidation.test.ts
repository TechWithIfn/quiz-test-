import { describe, it, expect } from 'vitest'
import { ContentValidatorService } from '@/services/content-validator.service'
import { ALL_RAW_TESTS } from '@/data/tests'
import { RawTest } from '@/types/content'
import { buildTestSeoMetadata } from '@/utils/seo'

describe('Automated Content Schema & Integrity Validation', () => {
  it('validates that all repository tests pass schema validation with 0 errors', () => {
    const result = ContentValidatorService.validateAll(ALL_RAW_TESTS)

    if (result.errors.length > 0) {
      console.error('Validation errors found in test repository:', JSON.stringify(result.errors, null, 2))
    }

    expect(result.errors).toHaveLength(0)
    expect(result.valid).toBe(true)
    expect(result.totalTests).toBeGreaterThanOrEqual(5)
    expect(result.totalQuestions).toBeGreaterThanOrEqual(25)
  })

  // 1. Duplicate Test IDs and Duplicate Slugs
  it('detects duplicate test IDs and duplicate slugs', () => {
    const invalidTests: RawTest[] = [
      {
        ...ALL_RAW_TESTS[0],
        id: 'dup-id',
        slug: 'dup-slug',
      },
      {
        ...ALL_RAW_TESTS[1],
        id: 'dup-id', // Duplicate
        slug: 'dup-slug', // Duplicate
      },
    ]

    const result = ContentValidatorService.validateAll(invalidTests)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('Duplicate test ID'))).toBe(true)
    expect(result.errors.some((e) => e.message.includes('Duplicate test slug'))).toBe(true)
  })

  // 2. Duplicate Question IDs
  it('detects duplicate question IDs within a test and globally across tests', () => {
    const testWithInternalDup: RawTest = {
      ...ALL_RAW_TESTS[0],
      id: 'test-internal-dup',
      slug: 'test-internal-dup',
      questions: [
        {
          id: 'q-dup-internal',
          question: 'Question 1',
          type: 'single-choice',
          options: [{ id: 'opt-1', text: 'Option 1' }, { id: 'opt-2', text: 'Option 2' }],
          correctAnswer: 'opt-1',
          explanation: 'Valid explanation text.',
          difficulty: 'beginner',
          topic: 'Basics',
          tags: ['test'],
        },
        {
          id: 'q-dup-internal', // Duplicate within same test
          question: 'Question 2',
          type: 'single-choice',
          options: [{ id: 'opt-3', text: 'Option 3' }, { id: 'opt-4', text: 'Option 4' }],
          correctAnswer: 'opt-3',
          explanation: 'Valid explanation text.',
          difficulty: 'beginner',
          topic: 'Basics',
          tags: ['test'],
        },
      ],
    }

    const internalResult = ContentValidatorService.validateAll([testWithInternalDup])
    expect(internalResult.valid).toBe(false)
    expect(internalResult.errors.some((e) => e.message.includes('Duplicate question ID within test'))).toBe(true)

    const testA: RawTest = {
      ...ALL_RAW_TESTS[0],
      id: 'test-a',
      slug: 'test-a',
      questions: [
        {
          id: 'shared-q-id',
          question: 'Q1',
          type: 'single-choice',
          options: [{ id: 'opt-1', text: 'Option 1' }, { id: 'opt-2', text: 'Option 2' }],
          correctAnswer: 'opt-1',
          explanation: 'Explanation for Q1 with valid length.',
          difficulty: 'beginner',
          topic: 'Basics',
          tags: ['test'],
        },
      ],
    }

    const testB: RawTest = {
      ...ALL_RAW_TESTS[1],
      id: 'test-b',
      slug: 'test-b',
      questions: [
        {
          id: 'shared-q-id', // Global duplicate
          question: 'Q2',
          type: 'single-choice',
          options: [{ id: 'opt-3', text: 'Option 3' }, { id: 'opt-4', text: 'Option 4' }],
          correctAnswer: 'opt-3',
          explanation: 'Explanation for Q2 with valid length.',
          difficulty: 'beginner',
          topic: 'Basics',
          tags: ['test'],
        },
      ],
    }

    const globalResult = ContentValidatorService.validateAll([testA, testB])
    expect(globalResult.valid).toBe(false)
    expect(globalResult.errors.some((e) => e.message.includes('Duplicate global question ID'))).toBe(true)
  })

  // 3. Missing Explanations
  it('detects missing or too short explanations (< 10 chars)', () => {
    const shortExpTest: RawTest = {
      ...ALL_RAW_TESTS[0],
      id: 'test-short-exp',
      slug: 'test-short-exp',
      questions: [
        {
          id: 'q-short-exp',
          question: 'Sample question text',
          type: 'single-choice',
          options: [
            { id: 'opt-1', text: 'Choice 1' },
            { id: 'opt-2', text: 'Choice 2' },
          ],
          correctAnswer: 'opt-1',
          explanation: 'Short', // Too short (< 10 chars)
          difficulty: 'beginner',
          topic: 'Basics',
          tags: ['test'],
        },
      ],
    }

    const result = ContentValidatorService.validateAll([shortExpTest])
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('missing or too short'))).toBe(true)
  })

  // 4. Invalid Correct Answers
  it('detects invalid correct answers that do not match any option ID', () => {
    const invalidAnswerTest: RawTest = {
      ...ALL_RAW_TESTS[0],
      id: 'test-bad-answer',
      slug: 'test-bad-answer',
      questions: [
        {
          id: 'q-bad-ans',
          question: 'Sample question text',
          type: 'single-choice',
          options: [
            { id: 'opt-valid-1', text: 'Choice 1' },
            { id: 'opt-valid-2', text: 'Choice 2' },
          ],
          correctAnswer: 'opt-non-existent', // Invalid
          explanation: 'This explanation is detailed enough for the schema validator.',
          difficulty: 'beginner',
          topic: 'Basics',
          tags: ['test'],
        },
      ],
    }

    const result = ContentValidatorService.validateAll([invalidAnswerTest])
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('does not match any option ID'))).toBe(true)
  })

  // 5. Duplicate Options (both IDs and text values)
  it('detects questions with duplicate option IDs and duplicate option text values', () => {
    const duplicateOptionIdTest: RawTest = {
      ...ALL_RAW_TESTS[0],
      id: 'test-dup-option-id',
      slug: 'test-dup-option-id',
      questions: [
        {
          id: 'q-dup-opt-id',
          question: 'Sample question text',
          type: 'single-choice',
          options: [
            { id: 'opt-same', text: 'Choice 1' },
            { id: 'opt-same', text: 'Choice 2' }, // Duplicate ID
          ],
          correctAnswer: 'opt-same',
          explanation: 'This is a valid long explanation string for the schema.',
          difficulty: 'beginner',
          topic: 'Basics',
          tags: ['test'],
        },
      ],
    }

    const idResult = ContentValidatorService.validateAll([duplicateOptionIdTest])
    expect(idResult.valid).toBe(false)
    expect(idResult.errors.some((e) => e.message.includes('Duplicate option ID'))).toBe(true)

    const duplicateOptionTextTest: RawTest = {
      ...ALL_RAW_TESTS[0],
      id: 'test-dup-option-text',
      slug: 'test-dup-option-text',
      questions: [
        {
          id: 'q-dup-opt-text',
          question: 'Sample question text',
          type: 'single-choice',
          options: [
            { id: 'opt-1', text: 'Same Option Text' },
            { id: 'opt-2', text: 'Same Option Text' }, // Duplicate Text
          ],
          correctAnswer: 'opt-1',
          explanation: 'This is a valid long explanation string for the schema.',
          difficulty: 'beginner',
          topic: 'Basics',
          tags: ['test'],
        },
      ],
    }

    const textResult = ContentValidatorService.validateAll([duplicateOptionTextTest])
    expect(textResult.valid).toBe(false)
    expect(textResult.errors.some((e) => e.message.includes('Duplicate option text detected'))).toBe(true)
  })

  // 6. Missing Topics
  it('detects questions with missing or empty topics', () => {
    const missingTopicTest: RawTest = {
      ...ALL_RAW_TESTS[0],
      id: 'test-missing-topic',
      slug: 'test-missing-topic',
      questions: [
        {
          id: 'q-missing-topic',
          question: 'Sample question text',
          type: 'single-choice',
          options: [
            { id: 'opt-1', text: 'Choice 1' },
            { id: 'opt-2', text: 'Choice 2' },
          ],
          correctAnswer: 'opt-1',
          explanation: 'This is a valid long explanation string for the schema.',
          difficulty: 'beginner',
          topic: '', // Missing topic
          tags: ['test'],
        },
      ],
    }

    const result = ContentValidatorService.validateAll([missingTopicTest])
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('missing mandatory topic'))).toBe(true)
  })

  // 7. Invalid Difficulty
  it('detects invalid difficulty levels on tests and questions', () => {
    const invalidDiffTest: RawTest = {
      ...ALL_RAW_TESTS[0],
      id: 'test-bad-diff',
      slug: 'test-bad-diff',
      // @ts-expect-error test invalid difficulty
      difficulty: 'expert-level',
      questions: [
        {
          id: 'q-bad-diff',
          question: 'Sample question text',
          type: 'single-choice',
          options: [
            { id: 'opt-1', text: 'Choice 1' },
            { id: 'opt-2', text: 'Choice 2' },
          ],
          correctAnswer: 'opt-1',
          explanation: 'This is a valid long explanation string for the schema.',
          // @ts-expect-error test invalid difficulty
          difficulty: 'insane',
          topic: 'Basics',
          tags: ['test'],
        },
      ],
    }

    const result = ContentValidatorService.validateAll([invalidDiffTest])
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('Invalid difficulty: "expert-level"'))).toBe(true)
    expect(result.errors.some((e) => e.message.includes('Invalid question difficulty: "insane"'))).toBe(true)
  })

  // 8. Invalid Question Types
  it('detects invalid question types', () => {
    const invalidTypeTest: RawTest = {
      ...ALL_RAW_TESTS[0],
      id: 'test-bad-type',
      slug: 'test-bad-type',
      questions: [
        {
          id: 'q-bad-type',
          question: 'Sample question text',
          // @ts-expect-error test invalid question type
          type: 'free-text-essay',
          options: [
            { id: 'opt-1', text: 'Choice 1' },
            { id: 'opt-2', text: 'Choice 2' },
          ],
          correctAnswer: 'opt-1',
          explanation: 'This is a valid long explanation string for the schema.',
          difficulty: 'beginner',
          topic: 'Basics',
          tags: ['test'],
        },
      ],
    }

    const result = ContentValidatorService.validateAll([invalidTypeTest])
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('Invalid question type: "free-text-essay"'))).toBe(true)
  })

  it('detects invalid slug formatting (spaces, uppercase, non-kebab)', () => {
    const invalidSlugTest: RawTest = {
      ...ALL_RAW_TESTS[0],
      id: 'test-bad-slug',
      slug: 'Invalid Slug With Spaces!',
    }

    const result = ContentValidatorService.validateAll([invalidSlugTest])
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('Invalid slug format'))).toBe(true)
  })

  it('ensures every test has a unique slug and valid SEO metadata', () => {
    const slugs = ALL_RAW_TESTS.map((test) => test.slug)
    expect(new Set(slugs).size).toBe(slugs.length)

    for (const test of ALL_RAW_TESTS) {
      const seo = buildTestSeoMetadata(test)
      expect(seo.title).toContain(test.title)
      expect(seo.description.length).toBeGreaterThan(30)
      expect(seo.canonicalUrl).toContain(`/tests/${test.slug}`)
      expect(seo.keywords.length).toBeGreaterThan(0)
    }
  })

  it('detects nearly duplicate questions in a test', () => {
    const nearDupTest: RawTest = {
      ...ALL_RAW_TESTS[0],
      id: 'test-near-dup',
      slug: 'test-near-dup',
      questions: [
        {
          id: 'q-orig',
          question: 'What is the primary function of an index in a relational database table?',
          type: 'single-choice',
          options: [{ id: 'opt-1', text: 'Accelerate queries' }, { id: 'opt-2', text: 'Encrypt tables' }],
          correctAnswer: 'opt-1',
          explanation: 'Indexes speed up data retrieval by avoiding full table scans.',
          difficulty: 'beginner',
          topic: 'Indexing',
          tags: ['sql'],
        },
        {
          id: 'q-copy',
          question: 'What is the primary function of an index in relational database tables?', // Nearly identical
          type: 'single-choice',
          options: [{ id: 'opt-3', text: 'Faster lookup' }, { id: 'opt-4', text: 'Backups' }],
          correctAnswer: 'opt-3',
          explanation: 'Indexes improve lookup speed by indexing key columns.',
          difficulty: 'beginner',
          topic: 'Indexing',
          tags: ['sql'],
        },
      ],
    }

    const result = ContentValidatorService.validateAll([nearDupTest])
    expect(result.warnings.some((w) => w.message.includes('nearly identical'))).toBe(true)
  })

  it('detects weak placeholder explanations and flags them', () => {
    const weakExpTest: RawTest = {
      ...ALL_RAW_TESTS[0],
      id: 'test-weak-exp',
      slug: 'test-weak-exp',
      questions: [
        {
          id: 'q-weak-1',
          question: 'Why does Python use dynamic typing in variable assignments?',
          type: 'single-choice',
          options: [{ id: 'opt-1', text: 'Runtime checking' }, { id: 'opt-2', text: 'Compile checking' }],
          correctAnswer: 'opt-1',
          explanation: 'This is correct.', // Weak placeholder
          difficulty: 'beginner',
          topic: 'Types',
          tags: ['python'],
        },
      ],
    }

    const result = ContentValidatorService.validateAll([weakExpTest])
    expect(result.warnings.some((w) => w.message.includes('Weak/placeholder explanation detected'))).toBe(true)
  })

  it('covers every requested discovery category with at least one test', () => {
    const requestedCategories = [
      'programming', 'data-analytics', 'office-productivity', 'aptitude', 'reasoning',
      'english', 'interview-preparation', 'competitive-exams', 'general-knowledge',
      'science', 'mathematics', 'web-development', 'database', 'cybersecurity', 'cloud-devops',
    ]
    const availableCategories = new Set(ALL_RAW_TESTS.map((test) => test.category.slug))
    expect(requestedCategories.every((category) => availableCategories.has(category))).toBe(true)
  })
})
