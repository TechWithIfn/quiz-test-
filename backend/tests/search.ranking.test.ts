import { describe, it, expect, vi } from 'vitest'
import { searchService } from '../src/modules/search/search.service.js'
import { searchRepository } from '../src/modules/search/search.repository.js'
import type { ApiTest, ApiTag, ApiCategory } from '../src/types/domain.js'

// Mock only the repository; the real relevance-ranking service runs.
vi.mock('../src/modules/search/search.repository.js', () => ({
  searchRepository: { search: vi.fn() },
}))

const category = (name: string): ApiCategory => ({
  id: name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  name,
})

const tag = (name: string): ApiTag => ({ id: name, slug: name.toLowerCase(), name })

function makeTest(title: string, opts: Partial<ApiTest> = {}): ApiTest {
  return {
    id: title,
    slug: title.toLowerCase().replace(/\s+/g, '-'),
    title,
    shortDescription: '',
    fullDescription: '',
    category: category('General'),
    tags: [],
    topics: [],
    difficulty: 'beginner',
    estimatedMinutes: 10,
    totalQuestions: 1,
    language: 'en',
    passingScorePercentage: 70,
    featured: false,
    status: 'published',
    version: '1.0.0',
    indexable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...opts,
  }
}

describe('search relevance ranking', () => {
  it('prioritizes a strong title match above weaker category/description matches', async () => {
    const candidates: ApiTest[] = [
      makeTest('Intro to Stuff', {
        category: category('Algorithms'),
        fullDescription: 'Learn algorithms here',
      }),
      makeTest('Cooking Basics'),
      makeTest('Algorithms Test', {
        topics: ['Algorithms'],
        category: category('Algorithms'),
      }),
    ]
    vi.mocked(searchRepository.search).mockResolvedValue({
      tests: candidates,
      categories: [],
      topics: [],
    })

    const result = await searchService.search({
      q: 'algorithms',
      limit: 50,
      offset: 0,
      type: 'all',
    })

    // "Algorithms Test" (title + topic + category) ranks first; the
    // category/description-only match comes second; "Cooking Basics" is excluded.
    expect(result.tests.map((t) => t.title)).toEqual([
      'Algorithms Test',
      'Intro to Stuff',
    ])
  })

  it('excludes tests with no relevance to the query', async () => {
    vi.mocked(searchRepository.search).mockResolvedValue({
      tests: [makeTest('Cooking Basics')],
      categories: [],
      topics: [],
    })

    const result = await searchService.search({ q: 'python', limit: 50, offset: 0, type: 'all' })
    expect(result.total).toBe(0)
    expect(result.tests).toHaveLength(0)
  })

  it('ranks a topic-only match above a category-only match', async () => {
    const candidates: ApiTest[] = [
      makeTest('Something', { category: category('Algorithms') }),
      makeTest('Another', { topics: ['Algorithms'] }),
    ]
    vi.mocked(searchRepository.search).mockResolvedValue({ tests: candidates, categories: [], topics: [] })

    const result = await searchService.search({ q: 'algorithms', limit: 50, offset: 0, type: 'all' })
    expect(result.tests[0].title).toBe('Another') // topic match (30) > category match (20)
  })
})
