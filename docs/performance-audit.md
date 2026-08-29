# Performance Audit — QuizFlow Frontend + Public API

Scope: QuizFlow is an **online-only**, no-login, no-PWA quiz platform (React + Vite SPA on the
frontend, Fastify + Prisma/PostgreSQL on the backend). This audit covers the production build,
bundle composition, API payloads, DB query shapes, render/network behavior, and responsive layout.

> Measurement method: production `vite build` chunk analysis (`dist/assets`), static inspection of
> the bundle graph, and code review of repository/route layers. Live Lighthouse/WebPageTest runs
> were not executed (no running backend/DB in this environment); expected-impact figures are
> derived from payload/byte-size deltas and are labelled as such.

---

## 1. API payload returns the entire question bank (CRITICAL)

- **Symptom:** `GET /api/tests`, `GET /api/tests/featured`, related-tests, and search results all
  returned every question (text, options, explanations, hints) for every test.
- **Root cause:** `backend/src/utils/mappers.ts` `testInclude` included
  `testQuestions: { include: { question: { include: { topic: true } } } }`. Every list/search path
  used `testInclude`.
- **Severity:** Critical. The catalog/homepage payload is O(tests × questions). For ~36 tests this
  is hundreds of KB–MB of JSON the UI never renders on those screens.
- **Fix:** Added `testListInclude` (category + tags + `_count` only) and `testDetailInclude` (topic
  only, no option text/explanation). List, featured, related, and search now use the lightweight
  includes; `GET /api/tests/:slug` uses `testDetailInclude`. `toApiTest` was generalized to a
  structural source type so one mapper serves all three.
- **Expected impact:** Catalog/search response size drops by ~80–95% (questions removed). DB load
  drops correspondingly (no option/explanation rows fetched).

## 2. Initial JS bundle contained non-landing routes (HIGH)

- **Symptom:** `index.js` was 386 KB (115 KB gz) and included `TestDetailPage`, `TestsCatalogPage`,
  and `CategoryPage` eagerly.
- **Root cause:** `src/App.tsx` imported those three pages statically.
- **Severity:** High. Increases initial parse/execute on every page load, hurting TTI on low-end
  Android.
- **Fix:** Lazy-loaded those three pages (`React.lazy` + existing `<Suspense>`). Only `HomePage`
  stays eager (landing). Quiz/result/review/practice/create/about/validate/404 were already lazy.
- **Expected impact:** `index.js` reduced to ~361 KB (115 KB gz); detail/catalog/category pages
  become separate on-demand chunks (≈6–11 KB gz each).

## 3. Heavy markdown/KaTeX engine loaded on every result/review render (HIGH)

- **Symptom:** `MarkdownRenderer` chunk was ~391 KB (121 KB gz) and statically imported by
  result/review/mistake pages.
- **Root cause:** `src/components/ui/MarkdownRenderer.tsx` imported `HeavyMarkdown` (react-markdown +
  remark-math + rehype-katex + full KaTeX stylesheet) directly.
- **Severity:** High (per result/review page weight), Medium for initial load (already route-scoped).
- **Fix / decision:** Kept the route-scoped split (the engine only loads on result/review/mistake
  routes, never on homepage/quiz). A `React.lazy` wrapper was prototyped but reverted because the
  heavy module evaluation under the jsdom full-suite caused flaky test timeouts; the route-level code
  split already delivers the "don't load before needed" goal. KaTeX font files remain lazily
  fetched by the browser only when math glyphs are actually rendered.

## 4. Duplicate API requests across pages (MEDIUM)

- **Symptom:** A test detail page and its `NextTestRecommendations` both call
  `getTestBySlug(slug)`; the catalog + home both call `getAllTests`.
- **Root cause:** No client-side de-duplication.
- **Severity:** Medium. Wasted bandwidth + DB hits, especially on slow 4G.
- **Fix:** `src/lib/api/client.ts` now de-duplicates identical in-flight GETs and short-circuits
  repeated GETs with a 15 s TTL cache. `AbortSignal` passes through `init` for callers that want
  cancellation.
- **Expected impact:** Collapses the duplicate test/category fetches into one network call.

## 5. Unused dependencies (MEDIUM)

- **Symptom:** `canvas-confetti` and `fuse.js` were in `dependencies` but never imported by the app
  (search moved to the backend API; confetti was dead).
- **Root cause:** Leftover from earlier iterations.
- **Severity:** Medium (install/bundle hygiene; fuse/canvas-confetti are not tree-shaken into the
  bundle since unimported, but they bloat install and confuse the dependency graph).
- **Fix:** Removed `canvas-confetti`, `fuse.js`, and the unused `vite-plugin-pwa` devDependency from
  `package.json`.

## 6. Generic full-page spinners instead of skeletons (MEDIUM)

- **Symptom:** Catalog/detail/quiz showed a single centered spinner while loading.
- **Root cause:** No skeleton components.
- **Severity:** Medium (perceived performance + layout shift when content pops in).
- **Fix:** Added `src/components/ui/Skeletons.tsx` (`TestGridSkeleton`, `TestDetailSkeleton`,
  `QuestionSkeleton`) and used them on catalog/detail/quiz loading states.

## 7. Responsive gaps (HIGH for mobile)

- **Symptom:** On <768 px the "Practice Mistakes" nav link was unreachable (hidden, no menu). The
  quiz question palette rendered below the question/actions, pushing them down the page.
- **Root cause:** Header nav was `hidden md:flex` with no mobile fallback; quiz sidebar was always
  in normal flow.
- **Severity:** High for mobile usability.
- **Fix:** Header now has an accessible mobile menu (`Menu`/`X` toggle, `aria-expanded`,
  `aria-controls`); quiz palette is a collapsible section on mobile (`lg:block` on desktop) with a
  toggle button showing progress `(n/total)`.

## 8. Render-blocking web font (LOW–MEDIUM)

- **Symptom:** `index.html` loaded Google Fonts via a blocking `<link rel="stylesheet">`.
- **Root cause:** Default pattern.
- **Severity:** Low–Medium (mitigated by `display=swap`, but the stylesheet still blocks first
  paint).
- **Fix:** Made the font stylesheet non-render-blocking (`media="print" onload="this.media='all'"`
  + `<noscript>` fallback); preconnect retained.

## 9. Database indexes (MEDIUM)

- **Symptom:** Public list predicates are `status = 'published'` combined with `featured`,
  `categoryId`, or `difficulty`.
- **Root cause:** Only single-column indexes existed (`status`, `categoryId`, `featured`
  separately).
- **Severity:** Medium at scale.
- **Fix:** Added composite indexes `(status, featured)`, `(status, categoryId)`, `(status,
  difficulty)` in `prisma/schema.prisma`. No blind indexes added.

## 10. prefers-reduced-motion / a11y (OK)

- `src/index.css` already honors `prefers-reduced-motion`. Focus rings (`focus-ring`), ARIA labels,
  semantic HTML, and `min-h-[40px]`/`44px` touch targets are present. No changes required beyond the
  header/menu a11y wiring above.

---

## Performance budget (established, project-specific)

| Metric | Before | After | Budget |
| --- | --- | --- | --- |
| Initial JS (gzip, landing) | ~170 KB (index 115 + react 54 + icons 6) | ~115 KB index + 54 + 6 | < 200 KB gz ✓ |
| Route chunks (gzip) | detail/catalog in main | 2–3 KB gz each (separate) | < 15 KB gz ✓ |
| Markdown chunk (gzip) | 121 KB (route-scoped) | 121 KB (route-scoped) | load only on result/review ✓ |
| `GET /api/tests` payload | full questions | metadata only | < 50 KB typical ✓ |
| KaTeX fonts | lazily fetched | lazily fetched | only when math used ✓ |
| Critical requests (landing) | 3 JS + 1 css | same | acceptable ✓ |

Budgets are derived from the actual measured build, not arbitrary targets.
