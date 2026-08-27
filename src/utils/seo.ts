import { Test } from '@/types'
import { APP_ENV } from '@/config/env'

export const SITE_URL = APP_ENV.siteUrl

export interface TestSeoMetadata {
  title: string
  description: string
  canonicalUrl: string
  imageUrl: string
  keywords: string[]
  schema: Record<string, unknown>
}

type SeoTestLike = Partial<Test> & {
  title?: string
  slug?: string
  fullDescription?: string
  shortDescription?: string
  category?: { name?: string; slug?: string; description?: string }
  tags?: Array<{ name?: string; slug?: string }>
  topics?: string[]
  difficulty?: string
  totalQuestions?: number
  questionCount?: number
  timeLimitMinutes?: number
  estimatedMinutes?: number
  questions?: Array<{ topic?: string }>
  createdAt?: string
  updatedAt?: string
}

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export function buildTestSeoMetadata(test: SeoTestLike): TestSeoMetadata {
  const title = test.title || 'Quiz Test'
  const slug = test.slug || 'quiz-test'
  const categoryName = test.category?.name || 'Quiz'
  const descriptionSource = test.fullDescription || test.shortDescription || `${title} practice test.`
  const questionCount = test.totalQuestions ?? test.questionCount ?? test.questions?.length ?? 0
  const durationMinutes = test.timeLimitMinutes ?? test.estimatedMinutes ?? 0
  const tagNames = (test.tags || []).map((tag) => tag.name).filter(Boolean) as string[]
  const topicKeywords = [...tagNames, ...(test.topics || [])]
    .filter(Boolean)
    .slice(0, 8)

  const keywordSeed = [
    title,
    `${title} ${categoryName}`,
    `${categoryName} test`,
    `${categoryName} quiz`,
    `${title} online`,
    ...topicKeywords,
    test.difficulty,
  ]

  const keywords = Array.from(
    new Set(
      keywordSeed
        .flatMap((value) => String(value ?? '').split(/[\s|,/]+/).filter(Boolean))
        .map((value) => value.trim())
        .filter((value) => value.length > 2)
    )
  ).slice(0, 12)

  const description = `${title} is a ${test.difficulty || 'beginner'} ${categoryName.toLowerCase()} test with ${questionCount} questions and ${durationMinutes || 15} minutes. ${descriptionSource.slice(0, 180).replace(/\s+/g, ' ').trim()}. Practice ${topicKeywords[0] || 'key concepts'} and improve your ${categoryName.toLowerCase()} skills with instant scoring and detailed explanations.`

  const canonicalUrl = `${SITE_URL}/tests/${slug}`

  return {
    title: `${title} | ${categoryName} Test & Quiz`,
    description,
    canonicalUrl,
    imageUrl: `${SITE_URL}/og-image.svg`,
    keywords,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Quiz',
      name: title,
      description,
      url: canonicalUrl,
      image: `${SITE_URL}/og-image.svg`,
      educationalLevel: test.difficulty || 'beginner',
      timeRequired: `PT${durationMinutes || 15}M`,
      numberOfQuestions: questionCount,
      learningResourceType: 'Quiz',
      keywords: keywords.join(', '),
      about: (test.tags || []).map((tag) => tag.name),
      teaches: (test.topics || []).slice(0, 6),
      provider: {
        '@type': 'Organization',
        name: 'QuizFlow',
        url: SITE_URL,
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
      audience: {
        '@type': 'Audience',
        audienceType: `${categoryName} learners`,
      },
      inLanguage: 'en',
    },
  }
}

export function applyTestSeoMetadata(test: Test): void {
  const seo = buildTestSeoMetadata(test)

  document.title = seo.title

  const setMeta = (name: string, content: string, property = false): HTMLMetaElement => {
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
    let element = document.head.querySelector(selector) as HTMLMetaElement | null

    if (!element) {
      element = document.createElement('meta')
      if (property) {
        element.setAttribute('property', name)
      } else {
        element.setAttribute('name', name)
      }
      document.head.appendChild(element)
    }

    element.setAttribute('content', content)
    return element
  }

  setMeta('description', seo.description)
  setMeta('keywords', seo.keywords.join(', '))
  setMeta('robots', 'index,follow,max-image-preview:large')
  setMeta('twitter:card', 'summary_large_image')
  setMeta('twitter:title', seo.title)
  setMeta('twitter:description', seo.description)
  setMeta('twitter:image', seo.imageUrl)
  setMeta('og:title', seo.title, true)
  setMeta('og:description', seo.description, true)
  setMeta('og:type', 'website', true)
  setMeta('og:url', seo.canonicalUrl, true)
  setMeta('og:image', seo.imageUrl, true)

  let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', seo.canonicalUrl)

  let jsonLd = document.head.querySelector('script[data-seo="test-page"]') as HTMLScriptElement | null
  if (!jsonLd) {
    jsonLd = document.createElement('script')
    jsonLd.setAttribute('type', 'application/ld+json')
    jsonLd.setAttribute('data-seo', 'test-page')
    document.head.appendChild(jsonLd)
  }
  jsonLd.textContent = JSON.stringify(seo.schema)

  const slug = slugify(test.title || 'quiz-test')
  if (slug.length > 0) {
    document.documentElement.setAttribute('data-page-slug', slug)
  }
}

export function buildSitemapEntries(tests: Array<{ slug: string } | undefined | null> = []): string[] {
  const testUrls = tests
    .filter((test): test is { slug: string } => Boolean(test && test.slug))
    .map((test) => `${SITE_URL}/tests/${test.slug}`)

  return [
    `${SITE_URL}/`,
    `${SITE_URL}/tests`,
    `${SITE_URL}/about`,
    ...testUrls,
  ]
}

export function buildSitemapXml(tests: Array<{ slug: string } | undefined | null> = []): string {
  const urls = buildSitemapEntries(tests)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${url}</loc></url>`)
    .join('\n')}\n</urlset>\n`
}
