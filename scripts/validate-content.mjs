import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const vitestEntry = resolve('node_modules/vitest/vitest.mjs')
const result = spawnSync(process.execPath, [vitestEntry, 'run', 'tests/contentValidation.test.ts'], {
  stdio: 'inherit',
  shell: false,
})

if (result.error) {
  console.error(`Unable to run content validation: ${result.error.message}`)
  process.exit(1)
}

process.exit(result.status ?? 1)
