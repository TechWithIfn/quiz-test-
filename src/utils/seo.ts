import { Test, TestCategory } from '@/types'
import { APP_ENV } from '@/config/env'

export const SITE_URL = APP_ENV.siteUrl

/**
 * Minimum number of questions for a test to be treated as an indexable SEO
 * landing page. Tests below this threshold are still fully usable on the site
 * but are marked `noindex` and excluded from the sitemap to avoid thin/duplicate
 * SEO pages. This gate is shared by the test page meta tags and the sitemap
 * generator so both stay consistent.
 */
export const MIN_INDEXABLE_QUESTIONS = 10

export interface TestSeoMetadata {
  title: string
  description: string
  canonicalUrl: string
  imageUrl: string
  keywords: string[]
  indexable: boolean
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

/** A test is indexable when it has genuine, unique, schema-valid content. */
export function isTestIndexable(test: SeoTestLike): boolean {
  const questionCount = test.totalQuestions ?? test.questionCount ?? test.questions?.length ?? 0
  return (
    questionCount >= MIN_INDEXABLE_QUESTIONS &&
    Boolean(test.title && test.title.trim().length >= 5) &&
    Boolean(test.slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(test.slug)) &&
    Boolean(test.shortDescription || test.fullDescription) &&
    Boolean(test.category && test.category.slug)
  )
}

export function buildTestSeoMetadata(test: SeoTestLike): TestSeoMetadata {
  const title = test.title || 'Quiz Test'
  const slug = test.slug || 'quiz-test'
  const categoryName = test.category?.name || 'Quiz'
  const categorySlug = test.category?.slug || 'quiz'
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

  const description = `${title} is a ${test.difficulty || 'beginner'} ${categoryName.toLowerCase()} practice test with ${questionCount} questions and ${durationMinutes || 15} minutes. ${descriptionSource.slice(0, 180).replace(/\s+/g, ' ').trim()}. Practice ${topicKeywords[0] || 'key concepts'} and improve your ${categoryName.toLowerCase()} skills with instant scoring and detailed explanations.`

  const canonicalUrl = `${SITE_URL}/tests/${slug}`
  const indexable = isTestIndexable(test)

  const schema: Record<string, unknown> = {
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
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: categoryName, item: `${SITE_URL}/categories/${categorySlug}` },
        { '@type': 'ListItem', position: 3, name: title, item: canonicalUrl },
      ],
    },
  }

  return {
    title: `${title} – ${categoryName} Practice Test`,
    description,
    canonicalUrl,
    imageUrl: `${SITE_URL}/og-image.svg`,
    keywords,
    indexable,
    schema,
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
  setMeta('robots', seo.indexable ? 'index,follow,max-image-preview:large' : 'noindex,follow')
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

export interface CategorySeoMetadata {
  title: string
  description: string
  canonicalUrl: string
  keywords: string[]
  schema: Record<string, unknown>
}

export function buildCategorySeoMetadata(
  category: TestCategory,
  testCount: number
): CategorySeoMetadata {
  const name = category.name
  const canonicalUrl = `${SITE_URL}/categories/${category.slug}`
  const description =
    `Explore ${name} tests and quizzes on QuizFlow. Practice ${testCount} ${testCount === 1 ? 'assessment' : 'assessments'} covering ${category.description || 'core concepts'} with instant scoring and detailed explanations. No login required.`

  const keywords = [
    `${name} test`,
    `${name} quiz`,
    `${name} practice test`,
    `${name} online test`,
    `${name} assessment`,
    `${name} MCQ`,
  ].slice(0, 10)

  return {
    title: `${name} Tests & Quizzes – Practice Online`,
    description,
    canonicalUrl,
    keywords,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `${name} Tests`,
      description,
      url: canonicalUrl,
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: `${name} Tests`, item: canonicalUrl },
        ],
      },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: testCount,
      },
      provider: {
        '@type': 'Organization',
        name: 'QuizFlow',
        url: SITE_URL,
      },
      inLanguage: 'en',
    },
  }
}

export function applyCategorySeoMetadata(category: TestCategory, testCount: number): void {
  const seo = buildCategorySeoMetadata(category, testCount)

  document.title = seo.title

  const setMeta = (name: string, content: string, property = false): HTMLMetaElement => {
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
    let element = document.head.querySelector(selector) as HTMLMetaElement | null
    if (!element) {
      element = document.createElement('meta')
      if (property) element.setAttribute('property', name)
      else element.setAttribute('name', name)
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
  setMeta('og:title', seo.title, true)
  setMeta('og:description', seo.description, true)
  setMeta('og:type', 'website', true)
  setMeta('og:url', seo.canonicalUrl, true)

  let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', seo.canonicalUrl)

  let jsonLd = document.head.querySelector('script[data-seo="category-page"]') as HTMLScriptElement | null
  if (!jsonLd) {
    jsonLd = document.createElement('script')
    jsonLd.setAttribute('type', 'application/ld+json')
    jsonLd.setAttribute('data-seo', 'category-page')
    document.head.appendChild(jsonLd)
  }
  jsonLd.textContent = JSON.stringify(seo.schema)
}

export interface StaticPageSeoInput {
  title: string
  description: string
  path: string
  keywords?: string[]
  indexable?: boolean
  breadcrumb?: Array<{ name: string; path: string }>
}

export function applyStaticPageSeoMetadata(input: StaticPageSeoInput): void {
  const { title, description, path, keywords = [], indexable = true } = input
  const canonicalUrl = `${SITE_URL}${path}`

  document.title = title

  const setMeta = (name: string, content: string, property = false): HTMLMetaElement => {
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
    let element = document.head.querySelector(selector) as HTMLMetaElement | null
    if (!element) {
      element = document.createElement('meta')
      if (property) element.setAttribute('property', name)
      else element.setAttribute('name', name)
      document.head.appendChild(element)
    }
    element.setAttribute('content', content)
    return element
  }

  setMeta('description', description)
  setMeta('keywords', keywords.join(', '))
  setMeta('robots', indexable ? 'index,follow,max-image-preview:large' : 'noindex,follow')
  setMeta('twitter:card', 'summary_large_image')
  setMeta('twitter:title', title)
  setMeta('twitter:description', description)
  setMeta('og:title', title, true)
  setMeta('og:description', description, true)
  setMeta('og:type', 'website', true)
  setMeta('og:url', canonicalUrl, true)

  let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', canonicalUrl)

  const breadcrumbItems = input.breadcrumb
    ? {
        '@type': 'BreadcrumbList',
        itemListElement: input.breadcrumb.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: `${SITE_URL}${crumb.path}`,
        })),
      }
    : undefined

  let jsonLd = document.head.querySelector('script[data-seo="static-page"]') as HTMLScriptElement | null
  if (!jsonLd) {
    jsonLd = document.createElement('script')
    jsonLd.setAttribute('type', 'application/ld+json')
    jsonLd.setAttribute('data-seo', 'static-page')
    document.head.appendChild(jsonLd)
  }
  jsonLd.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: canonicalUrl,
    ...(breadcrumbItems ? { breadcrumb: breadcrumbItems } : {}),
    provider: { '@type': 'Organization', name: 'QuizFlow', url: SITE_URL },
    inLanguage: 'en',
  })
}
