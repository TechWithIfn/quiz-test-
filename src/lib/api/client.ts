/**
 * Centralized HTTP client for the QuizFlow backend.
 *
 * All fetches go through here so components never scatter raw `fetch()` calls.
 * The backend returns a uniform envelope `{ success, data, meta?, error? }`;
 * this client unwraps `data` and throws a typed `ApiClientError` on failure so
 * the UI can show friendly, non-raw error states (Prompt 11 §6/§7).
 */

// Resolve the backend base URL. Contracts (see .env.example):
//   - If VITE_API_BASE_URL is set, use it as-is (after trimming a trailing slash).
//   - If unset/blank, production deployments serve the API same-origin at "/api"
//     (frontend + backend behind one origin via a reverse proxy, so no CORS and
//     no hardcoded host). Local development (localhost/127.0.0.1) defaults to the
//     backend dev server on :3001 for convenience; everything else uses same-origin.
// A hardcoded "localhost:3001" fallback must NOT be applied unconditionally, or the
// production SPA would call the visitor's own machine and every API call would fail.
const configuredBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
const API_BASE_URL = configuredBase
  ? configuredBase.replace(/\/+$/, '')
  : isLocalhost
    ? 'http://localhost:3001'
    : ''

export class ApiClientError extends Error {
  status: number
  code: string
  details?: unknown
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
    this.details = details
  }
}

function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.append(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

async function doFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        accept: 'application/json',
        ...(init?.body ? { 'content-type': 'application/json' } : {}),
        ...init?.headers,
      },
    })
  } catch (cause) {
    // Network / CORS / offline — surface as a connection error, never cache.
    throw new ApiClientError(0, 'CONNECTION_ERROR', 'Unable to reach the server. Check your connection.')
  }

  const text = await response.text()
  let json: Record<string, unknown> = {}
  if (text) {
    try {
      json = JSON.parse(text) as Record<string, unknown>
    } catch {
      json = {}
    }
  }

  if (!response.ok) {
    const error = (json.error as { code?: string; message?: string; details?: unknown }) || {}
    throw new ApiClientError(
      response.status,
      error.code || 'HTTP_ERROR',
      error.message || response.statusText || 'Request failed',
      error.details,
    )
  }

  // Envelope: return the `data` payload. If the body has no envelope, return as-is.
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as T
  }
  return json as unknown as T
}

// De-duplicate identical in-flight GETs and short-circuit repeated GETs with a
// brief TTL cache. This collapses the duplicate fetches that naturally happen
// across pages (e.g. a test detail page and its recommendations both request the
// same test) into a single network call, and avoids re-fetching during rapid
// re-renders (Step 6). Mutations (POST/PUT/DELETE) are never cached.
const GET_CACHE_TTL_MS = 15_000
const responseCache = new Map<string, { value: unknown; expires: number }>()
const inflight = new Map<string, Promise<unknown>>()

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? 'GET').toUpperCase()
  const key = `${method}:${path}`

  if (method === 'GET') {
    const cached = responseCache.get(key)
    if (cached && cached.expires > Date.now()) return cached.value as T
    const pending = inflight.get(key)
    if (pending) return pending as T
    const promise = doFetch<T>(path, init)
      .then((value) => {
        responseCache.set(key, { value, expires: Date.now() + GET_CACHE_TTL_MS })
        inflight.delete(key)
        return value
      })
      .catch((err) => {
        inflight.delete(key)
        throw err
      })
    inflight.set(key, promise)
    return promise
  }

  return doFetch<T>(path, init)
}

export const apiClient = {
  BASE: API_BASE_URL,
  request,
  buildQuery,
}
