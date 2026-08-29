import type { ValidationResult } from '../src/content/validate.js'
import type { ImportOutcome } from '../src/content/import.js'

export function reportValidation(result: ValidationResult): void {
  if (result.valid) {
    console.log('✓ Content is valid.')
    return
  }
  console.error(`✗ Content validation failed with ${result.issues.length} issue(s):`)
  for (const issue of result.issues) {
    const where = [issue.file, issue.entityId].filter(Boolean).join(' | ')
    console.error(`  - [${issue.code}] ${issue.message}${where ? ` (${where})` : ''}`)
  }
}

export function reportImport(outcome: ImportOutcome): void {
  if (!outcome.valid) {
    reportValidation(outcome)
    return
  }
  console.log(`✓ Imported ${JSON.stringify(outcome.imported)}`)
}
