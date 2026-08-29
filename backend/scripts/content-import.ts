import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { importContentFromDir } from '../src/content/import.js'
import { reportImport } from './content-report.js'

// Validate, then import content into the database inside a single transaction.
// Any validation failure aborts before any write (fail-safe).
const root = path.resolve(fileURLToPath(import.meta.url), '..', '..', 'content')

importContentFromDir(root)
  .then((outcome) => {
    reportImport(outcome)
    process.exit(outcome.valid ? 0 : 1)
  })
  .catch((err) => {
    console.error('Import failed:', err)
    process.exit(1)
  })
