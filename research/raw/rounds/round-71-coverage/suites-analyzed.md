# Round 71 — Suites and Sources Analyzed

## Suites Re-examined (Coverage Measurement)

| Suite | Tier | Measures E2E Coverage? | Method |
|-------|------|----------------------|--------|
| n8n-io/n8n | Silver | Yes (weekly CI) | `test-e2e-coverage-weekly.yml` |
| toeverything/AFFiNE | Gold | Partial (fixture support) | CDP coverage fixture in `@affine-test/kit` |
| vercel/next.js | Gold | Partial (manifest) | Test manifest with pass/fail/flake tracking |
| grafana/grafana | Gold | No | |
| calcom/cal.com | Gold | No | |
| immich-app/immich | Gold | No | |
| element-hq/element-web | Gold | No | |
| TryGhost/Ghost | Silver | No | |
| freeCodeCamp/freeCodeCamp | Gold | No | |
| wordpress/gutenberg | Silver | No | |
| RocketChat/Rocket.Chat | Silver | No | Monocart reporter for styled reports, not coverage |
| excalidraw/excalidraw | Gold | No (vitest unit coverage only) | |
| supabase/supabase | Gold | No | |
| ianstormtaylor/slate | Gold | No | |

## Coverage Measurement Tools Analyzed

| Tool | Approach | Maturity | Key Limitation |
|------|----------|----------|----------------|
| Playwright `page.coverage` API | V8 direct | Stable (built-in) | Chromium only; raw byte offsets |
| v8-to-istanbul | V8 -> Istanbul conversion | Stable | Requires post-processing |
| babel-plugin-istanbul | Build-time instrumentation | Stable | Requires build pipeline modification |
| vite-plugin-istanbul | Build-time instrumentation | Stable | Vite only |
| monocart-reporter | V8 via reporter lifecycle | Moderate (365+ stars) | Chromium only; fixture setup required |
| @bgotink/playwright-coverage | V8 without instrumentation | Experimental (50 stars) | "Proven on one Angular app" |
| nextcov (stevez/nextcov) | V8 client + server coverage | Experimental (10 stars) | Next.js/Vite only; requires Node 20+ |
| mxschmitt/playwright-test-coverage | Istanbul demo | Reference only | Demo project, not a library |

## Community Sources Consulted

| Source | Key Contribution |
|--------|-----------------|
| Currents.dev — "How to Measure Code Coverage in Playwright Tests" | Three approaches (V8, Istanbul, instrumentation); risk-based prioritization; "100% != perfect tests" |
| John Pourdanis — "Real-world Testing Coverage on Playwright Tests" | Istanbul + Babel approach; Coveralls reporting; "coverage is a metric, not a guarantee" |
| Kent C. Dodds — "How to Know What to Test" | Use case coverage vs code coverage; test use cases not code |
| Kent C. Dodds — "The Testing Trophy" | ROI-based testing layer guidance |
| web.dev — "Pyramid or Crab? Testing Strategies" | 6 strategy shapes; E2E placement; team-dependent selection |
| Playwright.tech — "Tracking Frontend Coverage" (2020, outdated) | Jest-Playwright coverage integration; babel-plugin-istanbul; deprecated approach |
| Alphabin — "Improving Playwright Test Coverage" | 80% scenario coverage target; feature-to-scenario spreadsheet |
| BugBug — "E2E Test Coverage" | "Money paths"; risk-based prioritization; reject 100% coverage |
| cenfun/monocart-reporter GitHub | V8 + CSS + HTML coverage; shard merging; reporter integration |
| bgotink/playwright-coverage GitHub | V8 without instrumentation; experimental status |
| stevez/nextcov GitHub | Client + server coverage; merged E2E + unit; Next.js specific |
| mxschmitt/playwright-test-coverage GitHub | Reference Istanbul integration by Playwright core contributor |
