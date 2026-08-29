import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateContentDir } from '../src/content/validate.js'
import { reportValidation } from './content-report.js'

// Validate repository-controlled content without touching the database.
const root = path.resolve(fileURLToPath(import.meta.url), '..', '..', 'content')
const result = validateContentDir(root)
reportValidation(result)
process.exit(result.valid ? 0 : 1)
