import { RawTest, RawQuestion, QuestionType, ContentDifficulty, ValidationIssue, ValidationResult } from '@/types/content'

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const VALID_QUESTION_TYPES: QuestionType[] = ['single-choice', 'multiple-choice', 'code-snippet']
const VALID_DIFFICULTIES: ContentDifficulty[] = ['beginner', 'intermediate', 'advanced']

/** Generic placeholder / low-effort phrases that indicate weak explanations */
const WEAK_EXPLANATION_PATTERNS = [
  /^(this is correct|because it is correct|correct answer is|option [a-d] is correct|self-explanatory|obvious|none|n\/a|as shown above|see above|it is what it is)\.?$/i,
  /^(correct|right|true|answer)\.?$/i,
]

function normalizeForComparison(str: string): string {
  return str
    .toLowerCase()
    .replace(/[`*_~$#\\]/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Calculate word-level Jaccard similarity and character bigram similarity between two texts */
function calculateSimilarity(textA: string, textB: string): number {
  const normA = normalizeForComparison(textA)
  const normB = normalizeForComparison(textB)
  if (normA === normB) return 1

  const wordsA = normA.split(' ').filter(Boolean)
  const wordsB = normB.split(' ').filter(Boolean)

  if (wordsA.length === 0 || wordsB.length === 0) return 0

  const setA = new Set(wordsA)
  const setB = new Set(wordsB)

  let intersection = 0
  for (const word of setA) {
    if (setB.has(word)) intersection++
  }

  const union = setA.size + setB.size - intersection
  return union > 0 ? intersection / union : 0
}

export class ContentValidatorService {
  static validateSerialized(serialized: string): ValidationResult {
    try {
      const parsed: unknown = JSON.parse(serialized)
      const tests = Array.isArray(parsed) ? parsed : [parsed]
      if (!tests.every((test) => typeof test === 'object' && test !== null && !Array.isArray(test))) {
        return this.parseError('Submission must contain a test object or an array of test objects.')
      }
      return this.validateAll(tests as RawTest[])
    } catch {
      return this.parseError('Submission is not valid JSON.')
    }
  }

  private static parseError(message: string): ValidationResult {
    return {
      valid: false,
      errors: [{ type: 'error', field: 'submission', message }],
      warnings: [],
      totalTests: 0,
      totalQuestions: 0,
    }
  }

  /**
   * Run full schema, semantic, and content-quality validation across all tests.
   */
  static validateAll(tests: RawTest[]): ValidationResult {
    const errors: ValidationIssue[] = []
    const warnings: ValidationIssue[] = []

    const seenTestIds = new Set<string>()
    const seenTestSlugs = new Set<string>()
    const globalQuestionIds = new Set<string>()
    const globalQuestions: { testSlug: string; question: RawQuestion }[] = []
    const testSlugToId = new Map<string, string>()

    let totalQuestions = 0

    for (const test of tests) {
      if (!test || typeof test !== 'object' || Array.isArray(test)) {
        errors.push({ type: 'error', field: 'test', message: 'Test must be an object.' })
        continue
      }

      // 1. Validate Test Level
      testSlugToId.set(test.slug, test.id)
      this.validateTestMetadata(test, seenTestIds, seenTestSlugs, errors, warnings)

      // 2. Validate Questions Level
      const testQuestionIds = new Set<string>()
      const testQuestionTexts = new Map<string, string>()

      for (const question of Array.isArray(test.questions) ? test.questions : []) {
        totalQuestions++
        this.validateQuestion(
          test,
          question,
          testQuestionIds,
          globalQuestionIds,
          testQuestionTexts,
          globalQuestions,
          errors,
          warnings
        )
      }

      // Check questionCount matches actual array length
      if (test.questions && test.questionCount !== test.questions.length) {
        warnings.push({
          type: 'warning',
          testId: test.id,
          testSlug: test.slug,
          field: 'questionCount',
          message: `Test metadata questionCount (${test.questionCount}) does not match actual questions array length (${test.questions.length}).`,
        })
      }

      // Check test duration reasonableness
      if (test.questions && test.estimatedMinutes) {
        const avgSecondsPerQ = (test.estimatedMinutes * 60) / Math.max(1, test.questions.length)
        if (avgSecondsPerQ < 15) {
          warnings.push({
            type: 'warning',
            testId: test.id,
            testSlug: test.slug,
            field: 'estimatedMinutes',
            message: `Estimated duration (${test.estimatedMinutes} min for ${test.questions.length} Qs) is unusually rushed (< 15s per question).`,
          })
        } else if (avgSecondsPerQ > 300) {
          warnings.push({
            type: 'warning',
            testId: test.id,
            testSlug: test.slug,
            field: 'estimatedMinutes',
            message: `Estimated duration (${test.estimatedMinutes} min for ${test.questions.length} Qs) is unusually long (> 5 min per question).`,
          })
        }
      }
    }

    // ===== Cross-test (global) duplicate detection =====
    // Report only; never auto-delete. These are warnings so validation still passes.
    this.detectGlobalNearDuplicateQuestions(globalQuestions, testSlugToId, warnings)
    this.detectDuplicateOptionSets(globalQuestions, testSlugToId, warnings)

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      totalTests: tests.length,
      totalQuestions,
    }
  }

  private static validateTestMetadata(
    test: RawTest,
    seenTestIds: Set<string>,
    seenTestSlugs: Set<string>,
    errors: ValidationIssue[],
    warnings: ValidationIssue[]
  ) {
    if (typeof test.id !== 'string' || test.id.trim() === '') {
      errors.push({ type: 'error', field: 'id', message: 'Test is missing mandatory "id" field.' })
    } else if (seenTestIds.has(test.id)) {
      errors.push({ type: 'error', testId: test.id, field: 'id', message: `Duplicate test ID detected: "${test.id}".` })
    } else {
      seenTestIds.add(test.id)
    }

    if (typeof test.slug !== 'string' || test.slug.trim() === '') {
      errors.push({ type: 'error', testId: test.id, field: 'slug', message: 'Test is missing mandatory "slug" field.' })
    } else if (!SLUG_REGEX.test(test.slug)) {
      errors.push({
        type: 'error',
        testId: test.id,
        testSlug: test.slug,
        field: 'slug',
        message: `Invalid slug format: "${test.slug}". Slugs must be lowercase alphanumeric kebab-case (e.g. "python-basics-test").`,
      })
    } else if (seenTestSlugs.has(test.slug)) {
      errors.push({ type: 'error', testId: test.id, testSlug: test.slug, field: 'slug', message: `Duplicate test slug detected: "${test.slug}".` })
    } else {
      seenTestSlugs.add(test.slug)
    }

    if (typeof test.title !== 'string' || test.title.trim() === '') {
      errors.push({ type: 'error', testId: test.id, field: 'title', message: 'Test is missing "title".' })
    } else if (test.title.trim().length < 5) {
      warnings.push({ type: 'warning', testId: test.id, field: 'title', message: `Test title "${test.title}" is very short (< 5 chars).` })
    }

    if (typeof test.shortDescription !== 'string' || test.shortDescription.trim() === '') {
      errors.push({ type: 'error', testId: test.id, field: 'shortDescription', message: 'Test is missing "shortDescription".' })
    } else if (test.shortDescription.trim().length < 20) {
      warnings.push({ type: 'warning', testId: test.id, field: 'shortDescription', message: 'Test shortDescription is too brief to be helpful (< 20 chars).' })
    }

    if (!test.category || !test.category.id || !test.category.slug) {
      errors.push({ type: 'error', testId: test.id, field: 'category', message: 'Test category is incomplete or missing.' })
    }

    if (!test.difficulty || !VALID_DIFFICULTIES.includes(test.difficulty)) {
      errors.push({
        type: 'error',
        testId: test.id,
        field: 'difficulty',
        message: `Invalid difficulty: "${test.difficulty}". Must be 'beginner', 'intermediate', or 'advanced'.`,
      })
    }

    if (!test.estimatedMinutes || test.estimatedMinutes <= 0) {
      errors.push({ type: 'error', testId: test.id, field: 'estimatedMinutes', message: 'Test estimatedMinutes must be greater than 0.' })
    }

    if (!Array.isArray(test.questions) || test.questions.length === 0) {
      errors.push({ type: 'error', testId: test.id, field: 'questions', message: 'Test contains no questions array.' })
    }
  }

  private static validateQuestion(
    test: RawTest,
    q: RawQuestion,
    testQuestionIds: Set<string>,
    globalQuestionIds: Set<string>,
    testQuestionTexts: Map<string, string>,
    globalQuestions: { testSlug: string; question: RawQuestion }[],
    errors: ValidationIssue[],
    warnings: ValidationIssue[]
  ) {
    if (!q || typeof q !== 'object' || Array.isArray(q)) {
      errors.push({ type: 'error', testId: test.id, field: 'question', message: 'Question must be an object.' })
      return
    }

    if (typeof q.id !== 'string' || q.id.trim() === '') {
      errors.push({ type: 'error', testId: test.id, field: 'question.id', message: 'Question missing mandatory "id".' })
      return
    }

    if (testQuestionIds.has(q.id)) {
      errors.push({ type: 'error', testId: test.id, questionId: q.id, field: 'question.id', message: `Duplicate question ID within test: "${q.id}".` })
    } else {
      testQuestionIds.add(q.id)
    }

    if (globalQuestionIds.has(q.id)) {
      errors.push({ type: 'error', testId: test.id, questionId: q.id, field: 'question.id', message: `Duplicate global question ID across repository: "${q.id}".` })
    } else {
      globalQuestionIds.add(q.id)
    }

    if (typeof q.question !== 'string' || q.question.trim() === '') {
      errors.push({ type: 'error', testId: test.id, questionId: q.id, field: 'question', message: 'Question text cannot be empty.' })
      return
    }

    const normalizedPrompt = normalizeForComparison(q.question)
    if (normalizedPrompt.length < 10) {
      warnings.push({
        type: 'warning',
        testId: test.id,
        questionId: q.id,
        field: 'question',
        message: `Question prompt is unusually brief: "${q.question}".`,
      })
    }

    // Duplicate & Near-duplicate question prompt checks
    for (const [otherId, otherText] of testQuestionTexts.entries()) {
      const similarity = calculateSimilarity(q.question, otherText)
      if (similarity >= 0.75) {
        warnings.push({
          type: 'warning',
          testId: test.id,
          questionId: q.id,
          field: 'question',
          message: `Question "${q.id}" is nearly identical (${Math.round(similarity * 100)}% match) to question "${otherId}".`,
        })
      }
    }
    testQuestionTexts.set(q.id, q.question)
    globalQuestions.push({ testSlug: test.slug, question: q })

    // Validate Question Type
    if (!q.type || !VALID_QUESTION_TYPES.includes(q.type)) {
      errors.push({
        type: 'error',
        testId: test.id,
        questionId: q.id,
        field: 'type',
        message: `Invalid question type: "${q.type}". Must be 'single-choice', 'multiple-choice', or 'code-snippet'.`,
      })
    }

    // Validate Question Difficulty if provided
    if (q.difficulty && !VALID_DIFFICULTIES.includes(q.difficulty)) {
      errors.push({
        type: 'error',
        testId: test.id,
        questionId: q.id,
        field: 'difficulty',
        message: `Invalid question difficulty: "${q.difficulty}". Must be 'beginner', 'intermediate', or 'advanced'.`,
      })
    }

    // Validate Estimated Solving Time
    if (q.estimatedTime !== undefined) {
      if (typeof q.estimatedTime !== 'number' || q.estimatedTime < 5) {
        warnings.push({
          type: 'warning',
          testId: test.id,
          questionId: q.id,
          field: 'estimatedTime',
          message: `Question estimatedTime (${q.estimatedTime}s) is suspiciously low (< 5s).`,
        })
      } else if (q.estimatedTime > 600) {
        warnings.push({
          type: 'warning',
          testId: test.id,
          questionId: q.id,
          field: 'estimatedTime',
          message: `Question estimatedTime (${q.estimatedTime}s) is unusually high (> 10m).`,
        })
      }
    }

    // Validate Question Options & Distractors
    if (!Array.isArray(q.options) || q.options.length < 2) {
      errors.push({ type: 'error', testId: test.id, questionId: q.id, field: 'options', message: 'Question must have at least 2 options.' })
    } else {
      const optionIds = new Set<string>()
      const optionTexts = new Set<string>()

      for (const opt of q.options) {
        if (!opt || typeof opt !== 'object' || Array.isArray(opt)) {
          errors.push({ type: 'error', testId: test.id, questionId: q.id, field: 'options', message: 'Option must be an object.' })
          continue
        }
        if (typeof opt.id !== 'string' || opt.id.trim() === '') {
          errors.push({ type: 'error', testId: test.id, questionId: q.id, field: 'options.id', message: 'Option missing ID.' })
        } else if (optionIds.has(opt.id)) {
          errors.push({ type: 'error', testId: test.id, questionId: q.id, field: 'options.id', message: `Duplicate option ID "${opt.id}" in question "${q.id}".` })
        } else {
          optionIds.add(opt.id)
        }

        const normalizedText = typeof opt.text === 'string' ? opt.text.trim().toLowerCase() : ''
        if (normalizedText === '') {
          errors.push({ type: 'error', testId: test.id, questionId: q.id, field: 'options.text', message: 'Option text cannot be empty.' })
        } else if (optionTexts.has(normalizedText)) {
          errors.push({
            type: 'error',
            testId: test.id,
            questionId: q.id,
            field: 'options.text',
            message: `Duplicate option text detected: "${opt.text}" in question "${q.id}".`,
          })
        } else {
          optionTexts.add(normalizedText)
        }
      }

      // Check correctAnswer matches an option
      if (!q.correctAnswer || !optionIds.has(q.correctAnswer)) {
        errors.push({
          type: 'error',
          testId: test.id,
          questionId: q.id,
          field: 'correctAnswer',
          message: `correctAnswer "${q.correctAnswer}" does not match any option ID in question "${q.id}".`,
        })
      }
    }

    // Validate Explanation (mandatory, >= 15 chars, not low-effort placeholder)
    if (!q.explanation || typeof q.explanation !== 'string' || q.explanation.trim().length < 15) {
      errors.push({
        type: 'error',
        testId: test.id,
        questionId: q.id,
        field: 'explanation',
        message: `Explanation for question "${q.id}" is missing or too short (< 15 chars). High-quality rationales are required.`,
      })
    } else {
      const trimmedExp = q.explanation.trim()
      const isWeak = WEAK_EXPLANATION_PATTERNS.some((pattern) => pattern.test(trimmedExp))
      if (isWeak) {
        warnings.push({
          type: 'warning',
          testId: test.id,
          questionId: q.id,
          field: 'explanation',
          message: `Weak/placeholder explanation detected: "${trimmedExp}". Provide a concrete conceptual rationale.`,
        })
      }
    }

    // Validate Topic (mandatory)
    if (!q.topic || typeof q.topic !== 'string' || q.topic.trim() === '') {
      errors.push({
        type: 'error',
        testId: test.id,
        questionId: q.id,
        field: 'topic',
        message: `Question "${q.id}" is missing mandatory topic.`,
      })
    } else if (q.topic.trim().length < 2) {
      warnings.push({
        type: 'warning',
        testId: test.id,
        questionId: q.id,
        field: 'topic',
        message: `Topic "${q.topic}" is too short (< 2 chars). Use descriptive domain topics (e.g. "Indexing", "Memory Management").`,
      })
    }
  }

  /**
   * Detect near-duplicate question prompts across DIFFERENT tests.
   * Uses a higher similarity threshold than within-test checks to avoid false positives
   * on legitimately related-but-distinct questions. Reports only.
   */
  private static detectGlobalNearDuplicateQuestions(
    globalQuestions: { testSlug: string; question: RawQuestion }[],
    testSlugToId: Map<string, string>,
    warnings: ValidationIssue[]
  ) {
    const threshold = 0.85
    for (let i = 0; i < globalQuestions.length; i++) {
      for (let j = i + 1; j < globalQuestions.length; j++) {
        const a = globalQuestions[i]
        const b = globalQuestions[j]
        if (a.testSlug === b.testSlug) continue
        const similarity = calculateSimilarity(a.question.question, b.question.question)
        if (similarity >= threshold) {
          const aId = testSlugToId.get(a.testSlug) || a.testSlug
          const bId = testSlugToId.get(b.testSlug) || b.testSlug
          warnings.push({
            type: 'warning',
            testId: aId,
            testSlug: a.testSlug,
            questionId: a.question.id,
            field: 'question',
            message: `Question "${a.question.id}" is ${Math.round(similarity * 100)}% similar to "${b.question.id}" in test "${bId}". Possible cross-test duplicate (minor wording change).`,
          })
        }
      }
    }
  }

  /**
   * Detect questions that share an identical set of answer option texts
   * (ignoring option IDs). A shared option set with different prompts often
   * indicates a copied/reused stem-distractor block and adds no new concept.
   */
  private static detectDuplicateOptionSets(
    globalQuestions: { testSlug: string; question: RawQuestion }[],
    testSlugToId: Map<string, string>,
    warnings: ValidationIssue[]
  ) {
    const bySignature = new Map<string, { testSlug: string; questionId: string }[]>()
    for (const { testSlug, question } of globalQuestions) {
      const signature = question.options
        .map((opt) => normalizeForComparison(opt.text || ''))
        .filter(Boolean)
        .sort()
        .join(' || ')
      if (!signature) continue
      const entry = bySignature.get(signature) || []
      entry.push({ testSlug, questionId: question.id })
      bySignature.set(signature, entry)
    }

    for (const [, items] of bySignature) {
      if (items.length < 2) continue
      for (const item of items) {
        const others = items.filter((o) => o !== item)
        const ref = others.map((o) => `${testSlugToId.get(o.testSlug) || o.testSlug}/${o.questionId}`).join(', ')
        warnings.push({
          type: 'warning',
          testId: testSlugToId.get(item.testSlug),
          testSlug: item.testSlug,
          questionId: item.questionId,
          field: 'options',
          message: `Option set is identical to question(s): ${ref}. Consider unique distractors or a distinct concept.`,
        })
      }
    }
  }
}
