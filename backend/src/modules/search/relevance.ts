import type { ApiTest } from '../../types/domain.js'

// Remove PostgreSQL ILIKE wildcards so user input cannot alter the query shape
// (e.g. `%`/`_` would otherwise act as wildcards). Backslashes are also stripped.
export function tokenize(term: string): string[] {
  return term
    .replace(/[%_\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
}

// Relevance ranking (highest priority first):
//   1. exact title match
//   2. title prefix match
//   3. title substring match
//   4. topic match
//   5. category match
//   6. description match
//   7. tag match
// Each matched token contributes; multi-word queries sum across tokens.
export function scoreTest(test: ApiTest, tokens: string[]): number {
  const title = test.title.toLowerCase()
  const description = `${test.shortDescription} ${test.fullDescription ?? ''}`.toLowerCase()
  const topics = test.topics.map((t) => t.toLowerCase())
  const category = test.category.name.toLowerCase()
  const tags = test.tags.map((t) => `${t.name} ${t.slug}`.toLowerCase())

  let score = 0
  for (const token of tokens) {
    if (!token) continue
    if (title === token) score += 100
    else if (title.startsWith(token)) score += 70
    else if (title.includes(token)) score += 50

    if (topics.some((t) => t === token)) score += 40
    else if (topics.some((t) => t.includes(token))) score += 30

    if (category === token || category.includes(token)) score += 20

    if (description.includes(token)) score += 10

    if (tags.some((t) => t.includes(token))) score += 5
  }
  return score
}
