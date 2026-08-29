import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateContentDir } from '../src/content/validate.js'
import { reportValidation } from './content-report.js'
import { prisma } from '../src/db/client.js'
import { checkDatabaseIntegrity } from '../src/content/integrity.js'

// Validate content and check live database integrity. Requires a database
// connection; if unavailable it reports the connection error and exits non-zero.
async function main() {
  const root = path.resolve(fileURLToPath(import.meta.url), '..', '..', 'content')
  const result = validateContentDir(root)
  reportValidation(result)
  if (!result.valid) process.exit(1)

  try {
    const { issues, counts } = await checkDatabaseIntegrity(prisma)
    console.log('Database counts:', counts)
    if (issues.length > 0) {
      console.error(`✗ Database integrity issues (${issues.length}):`)
      for (const issue of issues) console.error(`  - [${issue.code}] ${issue.message}`)
      process.exit(1)
    }
    console.log('✓ Database integrity OK')
    process.exit(0)
  } catch (err) {
    console.error('Could not verify database integrity (is DATABASE_URL set?):', err)
    process.exit(1)
  }
}

main()
