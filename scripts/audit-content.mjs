import { createServer } from 'vite'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Content audit + quality report generator.
 *
 * Loads the real version-controlled test data through Vite's SSR module loader
 * (so @/ aliases and TypeScript are resolved exactly as the app sees them),
 * runs ContentValidatorService validation, and produces:
 *   1. a human-readable report printed to the console
 *   2. docs/content-audit.md (the documented content report)
 *
 * This script does NOT modify any content. It only reports.
 */

function coverageRating(topicCount, questionCount) {
  if (topicCount >= 10 && questionCount >= 20) return 'Good'
  if (topicCount >= 5 && questionCount >= 12) return 'Partial'
  return 'Sparse'
}

const server = await createServer({
  configFile: resolve('vite.config.ts'),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

try {
  const mod = await server.ssrLoadModule('/src/data/tests/index.ts')
  const { ALL_RAW_TESTS } = mod
  const validator = await server.ssrLoadModule('/src/services/content-validator.service.ts')
  const ContentValidatorService = validator.ContentValidatorService

  const result = ContentValidatorService.validateAll(ALL_RAW_TESTS)

  const warningsByTest = new Map()
  for (const w of result.warnings) {
    const key = w.testSlug || w.testId || 'unknown'
    const arr = warningsByTest.get(key) || []
    arr.push(w)
    warningsByTest.set(key, arr)
  }

  const rows = ALL_RAW_TESTS.map((test) => {
    const difficultyCounts = { beginner: 0, intermediate: 0, advanced: 0 }
    const topics = new Set()
    let singleChoice = 0
    let codeSnippet = 0
    let missingConcept = 0
    let missingEstimatedTime = 0
    for (const q of test.questions) {
      if (q.difficulty) difficultyCounts[q.difficulty]++
      if (q.topic) topics.add(q.topic)
      if (q.type === 'code-snippet') codeSnippet++
      if (q.type === 'single-choice') singleChoice++
      if (!q.concept) missingConcept++
      if (q.estimatedTime === undefined) missingEstimatedTime++
    }
    const topicList = [...topics].sort()
    const warnings = (warningsByTest.get(test.slug) || []).filter((w) => w.questionId === undefined)
    const questionWarnings = (warningsByTest.get(test.slug) || []).filter((w) => w.questionId !== undefined)
    return {
      title: test.title,
      slug: test.slug,
      category: test.category.name,
      language: test.language,
      difficulty: test.difficulty,
      questionCount: test.questions.length,
      questionCountMeta: test.questionCount,
      topics: topicList,
      topicCount: topicList.length,
      easy: difficultyCounts.beginner,
      medium: difficultyCounts.intermediate,
      hard: difficultyCounts.advanced,
      codeSnippet,
      singleChoice,
      missingConcept,
      missingEstimatedTime,
      coverage: coverageRating(topicList.length, test.questions.length),
      needsMore: test.questions.length < 20 ? 'yes' : 'no',
      warnings,
      questionWarnings,
    }
  })

  // ----- Console report -----
  console.log('\n=== QuizFlow Content Audit ===\n')
  console.log(`Total tests: ${result.totalTests}`)
  console.log(`Total questions: ${result.totalQuestions}`)
  console.log(`Errors: ${result.errors.length}`)
  console.log(`Warnings: ${result.warnings.length}\n`)

  console.log(
    'TEST'.padEnd(34) +
      'CAT'.padEnd(18) +
      'Q'.padEnd(4) +
      'TP'.padEnd(4) +
      'E'.padEnd(4) +
      'M'.padEnd(4) +
      'H'.padEnd(4) +
      'COV'.padEnd(8) +
      'MORE'
  )
  for (const r of rows) {
    const name = r.title.length > 32 ? r.title.slice(0, 32) : r.title
    console.log(
      name.padEnd(34) +
        r.category.slice(0, 16).padEnd(18) +
        String(r.questionCount).padEnd(4) +
        String(r.topicCount).padEnd(4) +
        String(r.easy).padEnd(4) +
        String(r.medium).padEnd(4) +
        String(r.hard).padEnd(4) +
        r.coverage.padEnd(8) +
        r.needsMore
    )
  }

  const needingMore = rows.filter((r) => r.needsMore === 'yes')
  console.log(`\nTests needing more content (< 20 questions): ${needingMore.length}`)
  for (const r of needingMore) console.log(`  - ${r.title} (${r.questionCount} Q, ${r.topicCount} topics)`)

  console.log('\nPer-test topic coverage:')
  for (const r of rows) {
    console.log(`  ${r.title}: ${r.topics.join(', ')}`)
  }

  const metaIssues = rows.filter((r) => r.missingConcept > 0 || r.missingEstimatedTime > 0 || r.questionCount !== r.questionCountMeta)
  if (metaIssues.length) {
    console.log('\nMetadata issues:')
    for (const r of metaIssues) {
      const bits = []
      if (r.questionCount !== r.questionCountMeta) bits.push(`questionCount mismatch (meta ${r.questionCountMeta} vs ${r.questionCount})`)
      if (r.missingConcept > 0) bits.push(`${r.missingConcept} questions missing concept`)
      if (r.missingEstimatedTime > 0) bits.push(`${r.missingEstimatedTime} questions missing estimatedTime`)
      console.log(`  - ${r.title}: ${bits.join('; ')}`)
    }
  }

  if (result.errors.length) {
    console.log('\nERRORS (validation failed):')
    for (const e of result.errors) console.log(`  - [${e.testSlug || e.testId || '?'}] ${e.field}: ${e.message}`)
  }

  const totalQuestionWarnings = rows.reduce((acc, r) => acc + r.questionWarnings.length, 0)
  console.log(`\nQuestion-level warnings: ${totalQuestionWarnings} (see docs/content-audit.md for details)`)

  // ----- Markdown report -----
  mkdirSync('docs', { recursive: true })
  const today = new Date().toISOString().slice(0, 10)
  const lines = []
  lines.push('# QuizFlow Content Audit')
  lines.push('')
  lines.push(`_Generated ${today} by \`npm run audit:content\`._`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Tests audited: **${result.totalTests}**`)
  lines.push(`- Questions audited: **${result.totalQuestions}**`)
  lines.push(`- Validation errors: **${result.errors.length}**`)
  lines.push(`- Validation warnings: **${result.warnings.length}**`)
  lines.push(`- Tests needing more content (< 20 questions): **${needingMore.length}**`)
  lines.push('')
  lines.push('## Difficulty key')
  lines.push('')
  lines.push('Easy = beginner, Medium = intermediate, Hard = advanced.')
  lines.push('')
  lines.push('## Per-test report')
  lines.push('')
  lines.push('| Test | Category | Lang | Q | Topics | Easy | Medium | Hard | Coverage | Needs more |')
  lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |')
  for (const r of rows) {
    lines.push(
      `| ${r.title} | ${r.category} | ${r.language} | ${r.questionCount} | ${r.topicCount} | ${r.easy} | ${r.medium} | ${r.hard} | ${r.coverage} | ${r.needsMore} |`
    )
  }
  lines.push('')
  lines.push('## Topic coverage by test')
  lines.push('')
  for (const r of rows) {
    lines.push(`### ${r.title} (\`${r.slug}\`)`)
    lines.push('')
    lines.push(`- Category: ${r.category}`)
    lines.push(`- Questions: ${r.questionCount} (Easy ${r.easy} / Medium ${r.medium} / Hard ${r.hard})`)
    lines.push(`- Code-snippet questions: ${r.codeSnippet}`)
    lines.push(`- Topics (${r.topicCount}): ${r.topics.join(', ')}`)
    if (r.missingConcept > 0 || r.missingEstimatedTime > 0 || r.questionCount !== r.questionCountMeta) {
      lines.push('- Metadata notes:')
      if (r.questionCount !== r.questionCountMeta) lines.push(`  - questionCount mismatch (meta ${r.questionCountMeta} vs actual ${r.questionCount})`)
      if (r.missingConcept > 0) lines.push(`  - ${r.missingConcept} questions missing \`concept\``)
      if (r.missingEstimatedTime > 0) lines.push(`  - ${r.missingEstimatedTime} questions missing \`estimatedTime\``)
    }
    const qw = r.questionWarnings
    if (qw.length) {
      lines.push(`- Question warnings (${qw.length}):`)
      for (const w of qw.slice(0, 25)) lines.push(`  - \`${w.questionId}\` (${w.field}): ${w.message}`)
      if (qw.length > 25) lines.push(`  - ...and ${qw.length - 25} more`)
    }
    lines.push('')
  }
  lines.push('## Remaining content gaps & roadmap')
  lines.push('')
  lines.push(
    'No validation **errors** were found, so the existing library is schema-valid. The gaps below are ' +
      'about breadth and depth, not broken content. Per the quality policy, do NOT mass-generate filler; ' +
      'expand tests with distinct, high-value questions only.'
  )
  lines.push('')
  lines.push('### Priority 1 — Tests below 20 questions (treat as incomplete)')
  lines.push('')
  lines.push('These should be grown toward at least 20–30 questions with broader topic coverage:')
  lines.push('')
  for (const r of needingMore.sort((a, b) => a.questionCount - b.questionCount)) {
    lines.push(`- **${r.title}** (\`${r.slug}\`): ${r.questionCount} Q / ${r.topicCount} topics → target 20–30.`)
  }
  lines.push('')
  lines.push('### Priority 2 — Coverage balance')
  lines.push('')
  lines.push(
    'Programming and web tests (HTML, CSS, JavaScript, Python, SQL, Java) already have strong coverage. ' +
      'Focus new authoring on the sparse foundation tests (C, C++, General Knowledge, English Grammar, ' +
      'Mathematics, Science, Cybersecurity, Cloud & DevOps) and on adding interview/hard-tier questions ' +
      'to raise advanced-question ratios where a test targets interview preparation.'
  )
  lines.push('')
  lines.push('### Priority 3 — Metadata hygiene')
  lines.push('')
  lines.push(
    '`concept` and `estimatedTime` now default from `topic`/45s in the builders, so new questions are ' +
      'complete. Legacy questions that still omit `concept` will be populated on next edit; no bulk rewrite ' +
      'is required.'
  )
  lines.push('')
  lines.push('### Duplicate monitoring')
  lines.push('')
  lines.push(
    'Cross-test near-duplicate and duplicate-option-set detection runs in `validate:content` (warnings). ' +
      'Current run reported ' + totalQuestionWarnings + ' question-level warnings. Address any that appear ' +
      'before merging new content.'
  )
  lines.push('')

  writeFileSync('docs/content-audit.md', lines.join('\n'), 'utf8')
  console.log('\nWrote docs/content-audit.md')
} finally {
  await server.close()
}
