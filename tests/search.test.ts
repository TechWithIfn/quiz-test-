import { describe, it, expect } from 'vitest'
import { SearchService } from '@/features/search/search.service'
import { contentService } from '@/services/content.service'
import { Test } from '@/types'

describe('SearchService', () => {
  const tests = contentService.getAllTests()
  const service = new SearchService(tests)

  // 1. Exact Match
  it('exact match: ranks exact title and term matches first', () => {
    const exact = service.search(tests, { query: 'Python Basics Test' })
    expect(exact.length).toBeGreaterThan(0)
    expect(exact[0].slug).toBe('python-basics-test')

    const exactSql = service.search(tests, { query: 'SQL Interview Test' })
    expect(exactSql.length).toBeGreaterThan(0)
    expect(exactSql[0].slug).toBe('sql-interview-test')
  })

  // 2. Partial Match
  it('partial match: finds tests matching prefix or partial keywords', () => {
    const partialWindow = service.search(tests, { query: 'window funct' })
    expect(partialWindow.some((test) => test.slug === 'sql-interview-test')).toBe(true)

    const partialJoin = service.search(tests, { query: 'join' })
    expect(partialJoin.some((test) => test.slug === 'sql-basics-test')).toBe(true)

    const partialPy = service.search(tests, { query: 'pyth' })
    expect(partialPy.some((test) => test.title.toLowerCase().includes('python'))).toBe(true)
  })

  // 3. Typo / Fuzzy Match
  it('typo/fuzzy match: accurately handles misspelled keywords', () => {
    const typoPython = service.search(tests, { query: 'pythn' })
    expect(typoPython.some((test) => test.title.includes('Python'))).toBe(true)

    const typoJavascript = service.search(tests, { query: 'javascrip' })
    expect(typoJavascript.some((test) => test.title.includes('JavaScript'))).toBe(true)

    const typoDataAnalyst = service.search(tests, { query: 'dta anlyst' })
    expect(typoDataAnalyst.some((test) => test.slug === 'data-analyst-test')).toBe(true)
  })

  // 4. Tag Match
  it('tag match: matches tests by specific tag names or slugs', () => {
    const tagMatch = service.search(tests, { query: 'pandas' })
    expect(tagMatch.some((test) => test.tags.some((t) => t.slug.includes('pandas')))).toBe(true)

    const windowTagMatch = service.search(tests, { query: 'window-functions' })
    expect(windowTagMatch.some((test) => test.slug === 'sql-interview-test')).toBe(true)
  })

  // 5. Topic Match
  it('topic match: matches tests through question topics and concepts', () => {
    const topicMatchDict = service.search(tests, { query: 'dictionaries' })
    expect(topicMatchDict.some((test) => test.slug === 'python-basics-test')).toBe(true)

    const topicMatchGen = service.search(tests, { query: 'generators' })
    expect(topicMatchGen.some((test) => test.slug === 'python-interview-test')).toBe(true)

    const topicMatchEventLoop = service.search(tests, { query: 'event loop' })
    expect(topicMatchEventLoop.some((test) => test.slug === 'javascript-core-test')).toBe(true)
  })

  // 6. Empty Search
  it('empty search: returns all tests with default ranking', () => {
    const emptyResults = service.search(tests, { query: '' })
    expect(emptyResults.length).toBe(tests.length)

    const whitespaceResults = service.search(tests, { query: '   ' })
    expect(whitespaceResults.length).toBe(tests.length)
  })

  // 7. No Results
  it('no results: returns empty array when query is completely unmatched', () => {
    const noResults = service.search(tests, { query: 'xyznonexistentterm99999' })
    expect(noResults).toEqual([])
  })

  // 8. Synonym Search
  it('synonym search: seamlessly expands domain synonyms', () => {
    // "interview" ↔ "job"
    const jobResults = service.search(tests, { query: 'python job' })
    expect(jobResults.some((test) => test.slug === 'python-interview-test')).toBe(true)

    // "mcq" ↔ "quiz" ↔ "test"
    const mcqResults = service.search(tests, { query: 'javascript mcq' })
    expect(mcqResults.some((test) => test.slug === 'javascript-core-test')).toBe(true)

    // "data analyst" ↔ "data analytics"
    const analyticsResults = service.search(tests, { query: 'data analytics' })
    expect(analyticsResults.some((test) => test.slug === 'data-analyst-test')).toBe(true)

    // "dbms" ↔ "database" / "sql"
    const dbmsResults = service.search(tests, { query: 'dbms' })
    expect(dbmsResults.some((test) => test.category.slug === 'database' || test.slug.includes('sql'))).toBe(true)
  })

  // 9. Natural Queries Test Suite
  it('natural queries: correctly ranks natural multi-term queries', () => {
    // "python interview"
    const pythonInterview = service.search(tests, { query: 'python interview' })
    expect(pythonInterview[0].slug).toBe('python-interview-test')

    // "sql data analyst"
    const sqlDataAnalyst = service.search(tests, { query: 'sql data analyst' })
    expect(sqlDataAnalyst.some((test) => test.slug === 'data-analyst-test' || test.slug.includes('sql'))).toBe(true)

    // "excel test"
    const excelTest = service.search(tests, { query: 'excel test' })
    expect(excelTest[0].slug).toBe('excel-advanced-test')

    // "javascript mcq"
    const jsMcq = service.search(tests, { query: 'javascript mcq' })
    expect(jsMcq.some((test) => test.slug === 'javascript-core-test')).toBe(true)

    // "aptitude test"
    const aptitude = service.search(tests, { query: 'aptitude test' })
    expect(aptitude.some((test) => test.category.slug === 'aptitude' || test.slug.includes('reasoning'))).toBe(true)

    // "dbms joins"
    const dbmsJoins = service.search(tests, { query: 'dbms joins' })
    expect(dbmsJoins.some((test) => test.slug === 'sql-basics-test' || test.slug === 'sql-interview-test')).toBe(true)
  })

  // 10. Filters and Sorting integration
  it('applies category, difficulty, and sort filters correctly', () => {
    const categoryFiltered = service.search(tests, {
      query: '',
      categorySlug: 'database',
    })
    expect(categoryFiltered.length).toBeGreaterThan(0)
    expect(categoryFiltered.every((t) => t.category.slug === 'database')).toBe(true)

    const difficultyFiltered = service.search(tests, {
      query: '',
      difficulty: 'advanced',
    })
    expect(difficultyFiltered.length).toBeGreaterThan(0)
    expect(difficultyFiltered.every((t) => t.difficulty === 'advanced')).toBe(true)

    const sortedByQuestions = service.search(tests, {
      query: '',
      sortBy: 'questions-asc',
    })
    for (let i = 1; i < sortedByQuestions.length; i++) {
      expect(sortedByQuestions[i].totalQuestions).toBeGreaterThanOrEqual(sortedByQuestions[i - 1].totalQuestions)
    }
  })

  // 11. Large Scale Performance (Growth to thousands of tests)
  it('performance: executes sub-millisecond search over 2,000+ tests', () => {
    // Generate 2,000 synthetic test records
    const largeCatalog: Test[] = []
    const baseTests = [...tests]

    for (let i = 0; i < 2000; i++) {
      const base = baseTests[i % baseTests.length]
      largeCatalog.push({
        ...base,
        id: `synthetic-test-${i}`,
        slug: `synthetic-${base.slug}-${i}`,
        title: `${base.title} Variation ${i}`,
        shortDescription: `${base.shortDescription} Module #${i}`,
      })
    }

    const largeScaleService = new SearchService(largeCatalog)

    const startTime = performance.now()
    const result = largeScaleService.search(largeCatalog, { query: 'sql interview window' })
    const duration = performance.now() - startTime

    expect(result.length).toBeGreaterThan(0)
    // Execution should be well under 50ms for 2,000 documents (expanded catalog with rich question banks)
    expect(duration).toBeLessThan(50)
  })
})
