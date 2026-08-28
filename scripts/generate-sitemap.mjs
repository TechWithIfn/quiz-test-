import { createServer } from 'vite'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Sitemap + robots generator.
 *
 * Loads the real version-controlled test data through Vite's SSR module loader
 * (so @/ aliases and TypeScript resolve exactly as the app does), then emits:
 *   - public/sitemap.xml  : home, catalog, about, indexable test pages, and
 *                           category landing pages only (thin/duplicate state
 *                           routes such as /quiz, /result, /practice are excluded)
 *   - public/robots.txt   : allows crawlers everywhere except transient state
 *                           routes, and references the sitemap.
 *
 * The production site URL is taken from VITE_SITE_URL (env). If unset it falls
 * back to the value exported by @/utils/seo (which itself defaults to
 * localhost). Set VITE_SITE_URL in your build/deploy environment.
 */

const server = await createServer({
  configFile: resolve('vite.config.ts'),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

try {
  const { ALL_RAW_TESTS } = await server.ssrLoadModule('/src/data/tests/index.ts')
  const { TEST_CATEGORIES } = await server.ssrLoadModule('/src/config/constants.ts')
  const { isTestIndexable, SITE_URL } = await server.ssrLoadModule('/src/utils/seo.ts')

  const siteUrl = (process.env.VITE_SITE_URL || SITE_URL).replace(/\/+$/, '')

  const escapeXml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')

  const today = new Date().toISOString().slice(0, 10)

  const indexableTests = ALL_RAW_TESTS.filter((test) => isTestIndexable(test))
  const indexableSlugs = new Set(indexableTests.map((test) => test.slug))

  const categorySlugsWithContent = new Set(
    indexableTests
      .map((test) => test.category?.slug)
      .filter(Boolean)
  )

  const paths = [
    '/',
    '/tests',
    '/about',
    '/categories',
    ...[...categorySlugsWithContent].map((slug) => `/categories/${slug}`),
    ...indexableTests.map((test) => `/tests/${test.slug}`),
  ]

  const urls = [...new Set(paths)].map((path) => {
    const test = indexableTests.find((t) => `/tests/${t.slug}` === path)
    const lastmod = (test?.updatedAt || test?.createdAt || today).slice(0, 10)
    return { loc: `${siteUrl}${path}`, lastmod }
  })

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) =>
      `  <url><loc>${escapeXml(url.loc)}</loc><lastmod>${escapeXml(url.lastmod)}</lastmod></url>`
  )
  .join('\n')}
</urlset>
`

  writeFileSync(resolve('public/sitemap.xml'), sitemap)

  const robots = `User-agent: *
Allow: /

# Transient application state routes - never indexable
Disallow: /quiz/
Disallow: /tests/create
Disallow: /contribute/
Disallow: /practice/

Sitemap: ${siteUrl}/sitemap.xml
`

  writeFileSync(resolve('public/robots.txt'), robots)

  console.log(
    `Generated sitemap with ${urls.length} URLs (${indexableTests.length} indexable tests, ${categorySlugsWithContent.size} categories) from ${ALL_RAW_TESTS.length} total tests.`
  )
} finally {
  await server.close()
}
