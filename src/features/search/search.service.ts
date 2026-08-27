import { Test, SearchFilterState } from '@/types'

export interface FieldWeights {
  title: number
  aliases: number
  tags: number
  topics: number
  skills: number
  category: number
  shortDescription: number
  fullDescription: number
}

const DEFAULT_WEIGHTS: FieldWeights = {
  title: 120,
  aliases: 90,
  tags: 70,
  topics: 60,
  skills: 60,
  category: 45,
  shortDescription: 25,
  fullDescription: 15,
}

// Lightweight synonym dictionary for natural search queries
export const SYNONYMS: Record<string, string[]> = {
  interview: ['job', 'career', 'hiring', 'placement'],
  job: ['interview', 'career', 'placement'],
  mcq: ['quiz', 'test', 'assessment', 'questions', 'multiple choice'],
  quiz: ['mcq', 'test', 'assessment', 'exam'],
  test: ['quiz', 'mcq', 'assessment', 'exam'],
  exam: ['test', 'quiz', 'assessment'],
  assessment: ['test', 'quiz', 'exam', 'mcq'],
  'data analyst': ['data analytics', 'data analysis', 'sql', 'pandas', 'excel'],
  'data analytics': ['data analyst', 'data analysis', 'sql', 'pandas', 'excel'],
  'data analysis': ['data analyst', 'data analytics'],
  dbms: ['database', 'sql', 'relational', 'rdbms'],
  database: ['dbms', 'sql', 'rdbms'],
  rdbms: ['database', 'dbms', 'sql'],
  sql: ['dbms', 'database', 'queries', 'joins'],
  aptitude: ['reasoning', 'logical', 'logic', 'problem solving', 'quantitative', 'math'],
  reasoning: ['aptitude', 'logic', 'logical'],
  logic: ['reasoning', 'aptitude', 'logical'],
  logical: ['reasoning', 'aptitude', 'logic'],
  excel: ['spreadsheet', 'sheets', 'workbook', 'xlookup', 'formulas'],
  spreadsheet: ['excel', 'sheets'],
  js: ['javascript', 'typescript', 'es6', 'ecmascript'],
  javascript: ['js', 'ecmascript', 'frontend', 'web'],
  py: ['python', 'python3'],
  python: ['py', 'python3'],
  join: ['joins', 'inner join', 'left join'],
  joins: ['join', 'inner join', 'left join'],
  algo: ['algorithm', 'algorithms', 'dsa'],
  dsa: ['data structures', 'algorithms'],
}

// Normalize text: lowercase, remove special characters, collapse whitespace
export function normalize(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Split into unique meaningful tokens
export function tokenize(text: string): string[] {
  const normalized = normalize(text)
  if (!normalized) return []
  return normalized
    .split(' ')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
}

// Bounded Levenshtein distance for typo matching (max distance threshold = 2)
function getLevenshteinDistance(a: string, b: string, maxLimit = 2): number {
  const aLen = a.length
  const bLen = b.length

  if (Math.abs(aLen - bLen) > maxLimit) return maxLimit + 1
  if (aLen === 0) return bLen
  if (bLen === 0) return aLen

  let prev = Array.from({ length: bLen + 1 }, (_, i) => i)
  let curr = new Array<number>(bLen + 1)

  for (let i = 1; i <= aLen; i++) {
    curr[0] = i
    let minInRow = curr[0]
    const aChar = a.charCodeAt(i - 1)

    for (let j = 1; j <= bLen; j++) {
      const cost = aChar === b.charCodeAt(j - 1) ? 0 : 1
      curr[j] = Math.min(
        prev[j] + 1, // deletion
        curr[j - 1] + 1, // insertion
        prev[j - 1] + cost // substitution
      )
      if (curr[j] < minInRow) minInRow = curr[j]
    }

    if (minInRow > maxLimit) return maxLimit + 1
    const temp = prev
    prev = curr
    curr = temp
  }

  return prev[bLen]
}

interface TestDoc {
  test: Test
  normalizedTitle: string
  normalizedSlug: string
  normalizedCategory: string
  normalizedAliases: string[]
  normalizedTags: string[]
  normalizedTopics: string[]
  normalizedSkills: string[]
  normalizedShortDesc: string
  normalizedFullDesc: string
  // Inverted field tokens with weights
  tokenFieldWeights: Map<string, number>
  uniqueTokens: string[]
}

export class SearchService {
  private tests: Test[] = []
  private documents: TestDoc[] = []
  // Inverted Index: Token -> Array<{ docIndex: number; weight: number }>
  private invertedIndex = new Map<string, Array<{ docIndex: number; weight: number }>>()
  private allIndexedTokens: string[] = []
  private queryCache = new Map<string, Test[]>()
  private maxCacheSize = 200

  constructor(tests: Test[] = []) {
    this.updateTests(tests)
  }

  /**
   * Rebuilds the inverted index when tests change.
   */
  updateTests(tests: Test[]): void {
    if (tests === this.tests) return
    this.tests = tests
    this.queryCache.clear()
    this.invertedIndex.clear()

    this.documents = tests.map((test) => {
      const normalizedTitle = normalize(test.title || '')
      const normalizedSlug = normalize(test.slug || '')
      const normalizedCategory = normalize(test.category?.name || '')
      const normalizedAliases = (test.aliases || []).map(normalize).filter(Boolean)
      const normalizedTags = (test.tags || []).flatMap((t) => [normalize(t.name || ''), normalize(t.slug || '')]).filter(Boolean)
      const normalizedTopics = (test.topics || []).map(normalize).filter(Boolean)
      const normalizedSkills = (test.skills || []).map(normalize).filter(Boolean)
      const normalizedShortDesc = normalize(test.shortDescription || '')
      const normalizedFullDesc = normalize(test.fullDescription || '')

      const tokenFieldWeights = new Map<string, number>()

      const addTokens = (text: string, weight: number) => {
        const tokens = tokenize(text)
        for (const token of tokens) {
          const current = tokenFieldWeights.get(token) || 0
          tokenFieldWeights.set(token, Math.max(current, weight))
        }
      }

      // Title & slug
      addTokens(normalizedTitle, DEFAULT_WEIGHTS.title)
      addTokens(normalizedSlug, DEFAULT_WEIGHTS.title * 0.9)

      // Aliases
      for (const alias of normalizedAliases) {
        addTokens(alias, DEFAULT_WEIGHTS.aliases)
      }

      // Tags
      for (const tag of normalizedTags) {
        addTokens(tag, DEFAULT_WEIGHTS.tags)
      }

      // Topics
      for (const topic of normalizedTopics) {
        addTokens(topic, DEFAULT_WEIGHTS.topics)
      }

      // Skills
      for (const skill of normalizedSkills) {
        addTokens(skill, DEFAULT_WEIGHTS.skills)
      }

      // Category
      addTokens(normalizedCategory, DEFAULT_WEIGHTS.category)

      // Descriptions
      addTokens(normalizedShortDesc, DEFAULT_WEIGHTS.shortDescription)
      addTokens(normalizedFullDesc, DEFAULT_WEIGHTS.fullDescription)

      const uniqueTokens = Array.from(tokenFieldWeights.keys())

      return {
        test,
        normalizedTitle,
        normalizedSlug,
        normalizedCategory,
        normalizedAliases,
        normalizedTags,
        normalizedTopics,
        normalizedSkills,
        normalizedShortDesc,
        normalizedFullDesc,
        tokenFieldWeights,
        uniqueTokens,
      }
    })

    // Populate Inverted Index
    this.documents.forEach((doc, docIndex) => {
      doc.tokenFieldWeights.forEach((weight, token) => {
        let entry = this.invertedIndex.get(token)
        if (!entry) {
          entry = []
          this.invertedIndex.set(token, entry)
        }
        entry.push({ docIndex, weight })
      })
    })

    this.allIndexedTokens = Array.from(this.invertedIndex.keys())
  }

  /**
   * Expands query terms using synonyms and common phrase replacements.
   */
  private expandQuery(normalizedQuery: string): { originalTokens: string[]; expandedTokens: Set<string>; phraseVariants: string[] } {
    const originalTokens = tokenize(normalizedQuery)
    const expandedTokens = new Set<string>(originalTokens)
    const phraseVariants = new Set<string>([normalizedQuery])

    // Check multi-word phrase synonyms (e.g. "data analyst" -> "data analytics")
    for (const [phrase, replacements] of Object.entries(SYNONYMS)) {
      if (normalizedQuery.includes(phrase)) {
        for (const replacement of replacements) {
          phraseVariants.add(normalizedQuery.replace(phrase, replacement))
          for (const token of tokenize(replacement)) {
            expandedTokens.add(token)
          }
        }
      }
    }

    // Check single token synonyms
    for (const token of originalTokens) {
      const synonyms = SYNONYMS[token]
      if (synonyms) {
        for (const syn of synonyms) {
          for (const synToken of tokenize(syn)) {
            expandedTokens.add(synToken)
          }
        }
      }
    }

    return {
      originalTokens,
      expandedTokens,
      phraseVariants: Array.from(phraseVariants),
    }
  }

  /**
   * Fast lookup of matches for a query token (Exact -> Prefix -> Levenshtein Fuzzy).
   */
  private findTokenMatches(queryToken: string): Map<number, { matchScore: number; matchType: 'exact' | 'prefix' | 'fuzzy' }> {
    const docHits = new Map<number, { matchScore: number; matchType: 'exact' | 'prefix' | 'fuzzy' }>()

    // 1. Exact Match via Inverted Index
    const exactMatches = this.invertedIndex.get(queryToken)
    if (exactMatches) {
      for (const { docIndex, weight } of exactMatches) {
        docHits.set(docIndex, {
          matchScore: weight * 1.0,
          matchType: 'exact',
        })
      }
    }

    // 2. Prefix Match (e.g. "funct" -> "functions") if queryToken >= 3 chars
    if (queryToken.length >= 3) {
      for (const indexedToken of this.allIndexedTokens) {
        if (indexedToken !== queryToken && indexedToken.startsWith(queryToken)) {
          const ratio = queryToken.length / indexedToken.length
          const postings = this.invertedIndex.get(indexedToken) || []
          for (const { docIndex, weight } of postings) {
            const current = docHits.get(docIndex)
            const score = weight * (0.8 * ratio)
            if (!current || score > current.matchScore) {
              docHits.set(docIndex, { matchScore: score, matchType: 'prefix' })
            }
          }
        }
      }
    }

    // 3. Typo / Levenshtein Fuzzy Match if no exact match found or short query and token length >= 4
    if (queryToken.length >= 4) {
      const maxDistance = queryToken.length <= 5 ? 1 : 2
      for (const indexedToken of this.allIndexedTokens) {
        if (indexedToken.length >= 3 && Math.abs(indexedToken.length - queryToken.length) <= maxDistance) {
          // Skip if already exact/prefix matched
          if (indexedToken === queryToken || indexedToken.startsWith(queryToken)) continue

          const distance = getLevenshteinDistance(queryToken, indexedToken, maxDistance)
          if (distance <= maxDistance) {
            const similarity = 1 - distance / Math.max(queryToken.length, indexedToken.length)
            const postings = this.invertedIndex.get(indexedToken) || []
            for (const { docIndex, weight } of postings) {
              const current = docHits.get(docIndex)
              const score = weight * 0.75 * similarity
              if (!current || score > current.matchScore) {
                docHits.set(docIndex, { matchScore: score, matchType: 'fuzzy' })
              }
            }
          }
        }
      }
    }

    return docHits
  }

  /**
   * Core ranking pipeline: Query -> Normalize -> Expand -> Multi-Tier Scoring -> Ranked tests
   */
  private rank(rawQuery: string): Test[] {
    const normalizedQuery = normalize(rawQuery)
    if (!normalizedQuery) return [...this.tests]

    const cached = this.queryCache.get(normalizedQuery)
    if (cached) return cached

    const { originalTokens, expandedTokens, phraseVariants } = this.expandQuery(normalizedQuery)
    if (originalTokens.length === 0) return [...this.tests]

    // Accumulate document scores
    const docScores = new Map<number, number>()
    const matchedTokenCounts = new Map<number, Set<string>>()

    // Score based on exact query phrase matches on title, aliases, categories, tags
    for (const docIndex of Array.from({ length: this.documents.length }, (_, i) => i)) {
      const doc = this.documents[docIndex]
      let phraseScore = 0

      for (const variant of phraseVariants) {
        if (doc.normalizedTitle === variant) {
          phraseScore += 300 // Exact title match
        } else if (doc.normalizedTitle.startsWith(variant)) {
          phraseScore += 200 // Title prefix match
        } else if (doc.normalizedTitle.includes(variant)) {
          phraseScore += 150 // Title contains full phrase
        }

        if (doc.normalizedSlug.includes(variant.replace(/\s+/g, '-'))) {
          phraseScore += 120
        }

        if (doc.normalizedAliases.some((alias) => alias.includes(variant))) {
          phraseScore += 100
        }

        if (doc.normalizedCategory === variant || doc.normalizedCategory.includes(variant)) {
          phraseScore += 70
        }

        if (doc.normalizedTags.some((tag) => tag === variant || tag.includes(variant))) {
          phraseScore += 60
        }

        if (doc.normalizedTopics.some((topic) => topic.includes(variant))) {
          phraseScore += 50
        }
      }

      if (phraseScore > 0) {
        docScores.set(docIndex, (docScores.get(docIndex) || 0) + phraseScore)
      }
    }

    // Score individual tokens across original & expanded synonyms
    for (const token of Array.from(expandedTokens)) {
      const isOriginal = originalTokens.includes(token)
      const tokenHits = this.findTokenMatches(token)

      for (const [docIndex, { matchScore }] of tokenHits.entries()) {
        const adjustedScore = isOriginal ? matchScore : matchScore * 0.7
        const currentScore = docScores.get(docIndex) || 0
        docScores.set(docIndex, currentScore + adjustedScore)

        let matchedSet = matchedTokenCounts.get(docIndex)
        if (!matchedSet) {
          matchedSet = new Set<string>()
          matchedTokenCounts.set(docIndex, matchedSet)
        }
        matchedSet.add(token)
      }
    }

    // Boost documents matching all or most query tokens
    for (const [docIndex, score] of docScores.entries()) {
      const matchedTokens = matchedTokenCounts.get(docIndex)
      if (matchedTokens && originalTokens.length > 1) {
        const originalMatches = originalTokens.filter((t) => matchedTokens.has(t)).length
        const coverageRatio = originalMatches / originalTokens.length

        // Significant boost if all tokens are matched
        if (coverageRatio === 1.0) {
          docScores.set(docIndex, score * 1.5 + 50)
        } else if (coverageRatio >= 0.5) {
          docScores.set(docIndex, score * (1 + coverageRatio * 0.3))
        }
      }

      // Minor popularity / featured boost
      const doc = this.documents[docIndex]
      if (doc.test.featured) {
        docScores.set(docIndex, (docScores.get(docIndex) || 0) + 10)
      }
    }

    // Rank candidates by highest score
    const rankedResults = Array.from(docScores.entries())
      .filter(([, score]) => score > 0)
      .sort((a, b) => {
        const scoreDiff = b[1] - a[1]
        if (Math.abs(scoreDiff) > 0.001) return scoreDiff
        return this.documents[a[0]].test.title.localeCompare(this.documents[b[0]].test.title)
      })
      .map(([docIndex]) => this.documents[docIndex].test)

    // Store in LRU cache
    if (this.queryCache.size >= this.maxCacheSize) {
      const firstKey = this.queryCache.keys().next().value
      if (firstKey) this.queryCache.delete(firstKey)
    }
    this.queryCache.set(normalizedQuery, rankedResults)

    return rankedResults
  }

  /**
   * Search tests with filters & sorting.
   */
  search(tests: Test[], filters: SearchFilterState): Test[] {
    this.updateTests(tests)
    const rawQuery = filters.query ? filters.query.trim() : ''

    let results = rawQuery ? this.rank(rawQuery) : [...this.tests]

    // Apply category filter
    if (filters.categorySlug && filters.categorySlug !== 'all') {
      results = results.filter((test) => test.category.slug === filters.categorySlug)
    }

    // Apply difficulty filter
    if (filters.difficulty && filters.difficulty !== 'all-levels') {
      results = results.filter((test) => test.difficulty === filters.difficulty)
    }

    // Apply tag filter
    if (filters.tagSlug) {
      results = results.filter((test) => test.tags.some((tag) => tag.slug === filters.tagSlug))
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          results = [...results].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          break
        case 'questions-asc':
          results = [...results].sort((a, b) => a.totalQuestions - b.totalQuestions)
          break
        case 'time-asc':
          results = [...results].sort((a, b) => a.timeLimitMinutes - b.timeLimitMinutes)
          break
        case 'popular':
        default:
          if (!rawQuery) {
            results = [...results].sort((a, b) => Number(b.featured) - Number(a.featured))
          }
          break
      }
    } else if (!rawQuery) {
      results = [...results].sort((a, b) => Number(b.featured) - Number(a.featured))
    }

    return results
  }
}
