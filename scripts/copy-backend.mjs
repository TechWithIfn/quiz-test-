import { cp, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = resolve(root, 'backend/dist')
const dest = resolve(root, 'api/dist')

await mkdir(dirname(dest), { recursive: true })
await cp(src, dest, { recursive: true })
console.log('Copied backend/dist -> api/dist')
