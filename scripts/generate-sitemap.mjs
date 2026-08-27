import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const registryPath = resolve(root, 'src/data/tests/index.ts')
const registrySource = readFileSync(registryPath, 'utf8')
const catalogSource = readdirSync(resolve(root, 'src/data/tests'), { recursive: true })
  .filter((file) => String(file).endsWith('.ts'))
  .map((file) => readFileSync(resolve(root, 'src/data/tests', String(file)), 'utf8'))
  .join('\n')

const registryMatch = registrySource.match(/ALL_RAW_TESTS[\s\S]*?=\s*\[([\s\S]*?)\]/)
if (!registryMatch) throw new Error('Unable to find ALL_RAW_TESTS in the test registry.')

const testNames = [...registryMatch[1].matchAll(/\b([A-Za-z][A-Za-z0-9]*Test)\b/g)].map((match) => match[1])
const slugs = testNames.map((testName) => {
  const source = catalogSource

  const factoryMatch = source.match(new RegExp(`export const ${testName}[^=]*=\\s*(?:makeTest|buildExpandedTest)\\(\\s*['"][^'"]+['"]\\s*,\\s*['"]([^'"]+)`))
  const objectMatch = source.match(new RegExp(`export const ${testName}[^=]*=\\s*\\{[\\s\\S]*?\\bslug:\\s*['"]([^'"]+)`))
  const slug = factoryMatch?.[1] || objectMatch?.[1]
  if (!slug) throw new Error(`Unable to extract slug for registered test export: ${testName}`)
  return slug
})

const siteUrl = (process.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/+$/, '')
const escapeXml = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
const paths = ['/', '/tests', '/about', ...slugs.map((slug) => `/tests/${slug}`)]
const urls = [...new Set(paths)].map((path) => `${siteUrl}${path}`)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`)
  .join('\n')}\n</urlset>\n`

writeFileSync(resolve(root, 'public/sitemap.xml'), sitemap)
writeFileSync(resolve(root, 'public/robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`)

console.log(`Generated sitemap with ${urls.length} URLs from ${slugs.length} registered tests.`)