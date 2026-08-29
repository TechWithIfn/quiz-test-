import { cp, mkdir, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const backend = resolve(root, 'backend')
const api = resolve(root, 'api')

async function safeRm(target) {
  await rm(target, { recursive: true, force: true })
}

// Remove previously copied assets (idempotent).
await safeRm(resolve(api, 'dist'))
await safeRm(resolve(api, 'node_modules'))

// Copy the compiled backend app into the function directory.
await cp(resolve(backend, 'dist'), resolve(api, 'dist'), { recursive: true })

// Copy backend node_modules (already pruned to prod deps during build) so the
// function is fully self-contained: @prisma/client AND its query-engine binary
// resolve from the correct relative path inside the function bundle.
await mkdir(resolve(api, 'node_modules'), { recursive: true })
await cp(resolve(backend, 'node_modules'), resolve(api, 'node_modules'), { recursive: true })

console.log('API serverless function assets prepared in api/')
