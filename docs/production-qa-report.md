# Production QA Report

Date: 2026-08-26
Scope: client-side production build, route behavior, content integrity, quiz execution, learning flows, PWA assets, accessibility, and responsive layout.

## Critical

None found.

## High

### Fixed: Background-tab timer drift
The timer previously depended only on one-second interval callbacks. Background-tab throttling could give a user extra time. Attempts now persist an absolute `expiresAt` deadline, derive remaining time from the clock, and re-check when the document becomes visible.

### Fixed: Broken PWA assets
The manifest referenced missing PNG and touch-icon files. Local favicon and SVG PWA icon assets now exist, and the generated manifest, service worker, robots file, sitemap, and icons returned HTTP 200 during browser QA.

### Fixed: Placeholder external destination
The GitHub URL was `example/quizflow`. The link is now hidden until a real repository URL is configured.

## Medium

### Fixed: Async loading failures
Homepage, catalog, test detail, quiz start, and review loading paths now expose retryable error states instead of leaving users in an indefinite loading state.

### Fixed: Modal accessibility
Confirmation modals now use dialog semantics, `aria-modal`, a labelled title, initial focus, and focus trapping.

### Fixed: Quiz option accessibility
Options now use native radio inputs inside touch-friendly labels, preserving keyboard and screen-reader behavior.

### Fixed: Weighted score consistency
Score percentages now use earned points divided by maximum points, matching the displayed point totals for weighted questions.

### Fixed: SPA scroll state and stale detail content
Route changes now use React Router location state for scroll reset, and test details are cleared while a different slug loads.

### Fixed: Result and homepage clutter
Removed duplicated explanatory homepage sections, redundant result category statistics, unnecessary score confetti, verbose pre-start instructions, and stale navigation links.

## Low

### Remaining: Bundle-size optimization
The production build succeeds but reports a large JavaScript chunk after adding Markdown and KaTeX support. Route-level code splitting is a future optimization, not a runtime failure.

### Remaining: Deployment rewrites
`BrowserRouter` requires the deployment host to rewrite nested URLs to `index.html`. This is documented deployment configuration rather than an application runtime defect.

## Route Matrix

| Route | Result |
| --- | --- |
| `/` | Pass: search-first landing page |
| `/tests` | Pass: catalog, canonical categories, search and filters |
| `/tests/:slug` | Pass: metadata, detail, start CTA |
| `/quiz/:testSlug` | Pass: question runner, keyboard input, timer and persistence |
| `/quiz/:testSlug/result` | Pass: result summary and next actions |
| `/quiz/:testSlug/review` | Pass: answer review and explanations |
| `/about` | Pass |
| `/practice/mistakes` | Pass: empty and populated local states |
| `/contribute/validate` | Pass: valid, invalid, and malformed JSON states |
| `/tests/create` | Pass: create, validate, save, edit, delete |
| unknown routes and slugs | Pass: clear 404/test-not-found states |

## Automated and Browser Checks

- TypeScript validation: passed with zero errors.
- Content validation: passed all 9 integrity and category-coverage checks.
- Focused scoring tests: passed, including weighted scoring.
- Browser route sweep: all application routes returned HTTP 200 through the SPA server.
- Public asset sweep: manifest, service worker, favicon, PWA icons, robots, and sitemap returned HTTP 200.
- Browser smoke checks: homepage at mobile width, search intent, quiz start, keyboard answer selection, review marking, result submission, and review navigation passed.
- Browser console: no application console errors or failed network requests. VS Code browser harness preload errors were external to the application.
- Responsive check: 390px viewport had no horizontal overflow.

## Conclusion

No Critical or High production issues remain. Medium reliability, accessibility, scoring, and navigation issues identified during the audit were fixed. The remaining risks are deployment configuration and bundle-size optimization.
