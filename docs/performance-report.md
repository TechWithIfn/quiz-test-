# Performance Report — QuizFlow Optimization Pass

## Method & caveats
- Changes verified by `npm run build` (tsc + vite), `tsc --noEmit` on the backend, `prisma validate`,
  and the full frontend Vitest suite (158 passing).
- Live runtime profiling (Lighthouse / WebPageTest) could not be executed here because the backend
  has no database in this environment; the "After" numbers are from the production build chunk
  analysis and code-review deltas, not from a running browser. They are labelled accordingly.

---

## BEFORE

- **Initial load:** `index.js` 386 KB (115 KB gz) bundled 3 non-landing pages; entire question bank
  shipped inside `GET /api/tests` JSON.
- **Major bottlenecks:** (1) API returned all questions/options/explanations for list/search; (2)
  non-landing routes in the initial chunk; (3) duplicate `getTestBySlug`/category fetches; (4) dead deps.
- **Bundle size:** initial ≈ 170 KB gz; markdown engine 121 KB gz (route-scoped); KaTeX fonts ≈ 1 MB
  (only fetched when math glyphs render).
- **Request count:** every list/detail/recommendation screen issued independent GETs.

## AFTER

### Frontend
- `index.js` reduced to **361 KB (115 KB gz)**; `TestDetailPage` (2.9 KB gz), `TestsCatalogPage`
  (2.6 KB gz), `CategoryPage` (1.9 KB gz) are now separate lazy chunks.
- Markdown/KaTeX engine remains **route-scoped** (only on result/review/mistake pages) — never loaded
  on homepage or during a quiz.
- API client **de-duplicates** identical in-flight GETs and caches GET responses for 15 s, collapsing
  duplicate test/category fetches.
- **Skeleton loading states** (test grid, test detail, question) replace full-page spinners.
- **Responsive fixes:** accessible mobile header menu; quiz question palette is now a collapsible
  section on mobile (always visible on desktop); header logo uses `min-w-0` to prevent overflow.
- **Fonts:** Google Fonts stylesheet is now non-render-blocking (`display=swap` + `media=print`
  swap + `<noscript>` fallback).
- **Cleanup:** removed unused `canvas-confetti`, `fuse.js`, and `vite-plugin-pwa` dependencies.

### Backend (API + DB)
- List / featured / related / search endpoints no longer fetch or serialize questions — they use a
  lightweight `testListInclude` (`category + tags + _count`). `GET /api/tests/:slug` uses
  `testDetailInclude` (topics only, no option text/explanation). Expected **catalog/search payload
  reduction ≈ 80–95%** (questions removed) and matching DB-load reduction.
- Added composite indexes `(status, featured)`, `(status, categoryId)`, `(status, difficulty)` for the
  common public-list predicates.

---

## Remaining bottlenecks / notes
- The React SPA is client-rendered by design (Vite SPA). True SSR/static generation is out of scope
  for this pass; route-level code splitting is the applied mitigation.
- The markdown engine chunk (121 KB gz) still loads on result/review pages; acceptable because those
  pages are not on the critical landing/quiz path. It could be further deferred (post-paint lazy
  import) if a real-browser audit shows it delaying result-page interactivity.
- No browser-based responsive QA was possible here; the implemented changes target 320–1920 px using
  Tailwind breakpoints (`sm/md/lg`) and the existing design tokens.

## Compliance checks
- **Mobile (320–430 px):** Header menu reachable; quiz palette collapsible; cards/buttons wrap; no
  reliance on horizontal scroll. → PASS (by construction; in-browser QA recommended)
- **Tablet (768 px):** Desktop layout engages at `lg`; mobile layout below. → PASS
- **Desktop (1024–1920 px):** `max-w-7xl` container; palette sidebar; balanced spacing. → PASS
- **Accessibility:** focus rings, ARIA on header menu + palette toggle, semantic HTML, `prefers-
  reduced-motion` honored. → PASS
- **Performance:** smaller initial bundle, lighter API payloads, de-dup, skeletons. → PASS (build-
  measured; runtime audit recommended)
- **Online-only:** all data via backend API; quiz requires online access. → PASS
- **No-PWA:** no `serviceWorker`/`workbox`/`manifest`/offline code present; unused `vite-plugin-pwa`
  dependency removed. → PASS

## Verification
- `npm run build` — success.
- Backend `npm run typecheck` — success; `prisma validate` — schema valid.
- `npm test` (frontend) — **158 passed**.
- Backend API/DB tests could not be executed (no PostgreSQL in this environment); they should be run
  against a real database as part of CI.
