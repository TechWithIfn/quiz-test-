import fs from 'node:fs'
import path from 'node:path'

export interface RawFile {
  data: unknown
  path: string
}

export interface LoadedRaw {
  categories: RawFile[]
  topics: RawFile[]
  questions: RawFile[]
  tests: RawFile[]
}

const SUBDIRS = ['categories', 'topics', 'questions', 'tests'] as const

// Read all `.json` content files from the repository-controlled `content/`
// directory. Each subdirectory is optional; a missing one simply yields no
// entries (which downstream validation will report as broken references).
export function loadContentDir(rootDir: string): LoadedRaw {
  const result: LoadedRaw = { categories: [], topics: [], questions: [], tests: [] }

  for (const sub of SUBDIRS) {
    const dir = path.join(rootDir, sub)
    if (!fs.existsSync(dir)) continue
    const entries = fs.readdirSync(dir)
    for (const entry of entries) {
      if (!entry.endsWith('.json')) continue
      const full = path.join(dir, entry)
      const raw = fs.readFileSync(full, 'utf8')
      let parsed: unknown
      try {
        parsed = JSON.parse(raw)
      } catch (err) {
        parsed = { __parseError: String(err) }
      }
      result[sub].push({ data: parsed, path: full })
    }
  }

  return result
}
