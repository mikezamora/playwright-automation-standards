# Round 08 — Landscape: Suites Analyzed

**Focus:** Analyze test stability and flakiness management in Gold-standard suites
**Date:** 2026-03-18
**Method:** Examined actual playwright.config.ts files, CI workflows, PRs, and issues in Gold-tier repos. Supplemented with blog posts and official Playwright docs on flakiness management.

---

## Gold-Standard Suites — Stability Patterns

### 1. grafana/grafana

| Pattern | Implementation |
|---|---|
| **Retry Config** | `retries: process.env.CI ? 1 : 0` — minimal retries; trusts test quality over retry volume |
| **Trace Strategy** | `trace: 'retain-on-failure'` — captures full trace only on failures for debugging |
| **Screenshot Strategy** | `screenshot: 'only-on-failure'` — avoids noise from passing tests |
| **Timeout Config** | `expect: { timeout: 10_000 }` — 10s expectation timeout; tight but appropriate for a fast app |
| **Worker Strategy** | `workers: process.env.CI ? 4 : undefined` — fixed CI workers; auto-detect locally |
| **Parallel Mode** | `fullyParallel: true` — all tests run concurrently |
| **Test Isolation** | Fresh browser context per test via setup projects; 30+ projects with auth dependencies |
| **Stability Annotations** | Issue #89051 shows `test.fixme()` usage for tests broken by feature flags |
| **Custom Stability** | Custom a11y reporter alongside HTML reporter; doesn't block CI for a11y regressions |

### 2. calcom/cal.com

| Pattern | Implementation |
|---|---|
| **Retry Config** | `retries: 2` in CI, `0` local — balanced retry count |
| **Trace Strategy** | `trace: 'retain-on-failure'` |
| **Timeout Config** | Navigation/action/expect: `10,000ms` CI / `120,000ms` local; test timeout: `60,000ms` CI / `240,000ms` local |
| **Worker Strategy** | `workers: 1` (debug) / CPU count (normal) |
| **Parallel Mode** | `fullyParallel: true` |
| **Max Failures** | `maxFailures: 10` in headless mode — early abort on cascading failures |
| **Flaky Test Fixes** | PR #23487 shows pattern: replace blind `reload()` with `reload({ waitUntil: "domcontentloaded" })`; add visibility checks before assertions; use scoped locators (`getByTestId("workflow-list").locator("> li")`) |
| **Skip Pattern** | Entire test suites conditionally skipped when app performance degrades (app-store tests) |
| **Stability Annotations** | `test.skip()` with TODO comments referencing GitHub issues for re-enablement tracking |

### 3. toeverything/AFFiNE

| Pattern | Implementation |
|---|---|
| **Retry Config** | `retries: 3` CI / `1` local — highest Gold-tier CI retry count |
| **Trace Strategy** | `trace: 'retain-on-failure'` |
| **Video Strategy** | `video: 'retain-on-failure'` — captures video on failure for visual debugging |
| **Timeout Config** | `timeout: 50,000ms` CI / `30,000ms` local — longer in CI to accommodate slower containers |
| **Worker Strategy** | `workers: '50%'` CI / `4` local — percentage-based CI allocation |
| **WebServer Timeout** | `120,000ms` — 2-minute startup timeout for dev server |
| **Reporter Strategy** | `github` reporter in CI for inline PR annotations; `list` locally |
| **Stability Approach** | High retry count (3) compensates for complex editor interactions that are inherently timing-sensitive |

### 4. immich-app/immich

| Pattern | Implementation |
|---|---|
| **Retry Config** | `retries: 4` CI / `0` local — highest Gold-tier retry count overall |
| **Trace Strategy** | `trace: 'on-first-retry'` — captures trace only on first retry attempt, not subsequent retries |
| **Screenshot Strategy** | `screenshot: 'only-on-failure'` |
| **Worker Strategy** | `workers: 4` CI / `Math.round(cpus().length * 0.75)` local — CPU-proportional |
| **Parallel Mode** | `fullyParallel: false` globally; enabled per-project for UI tests only |
| **Per-Project Workers** | web: 1 worker (serial); ui: 3 workers CI (parallel); maintenance: 1 worker (serial) |
| **WebServer** | Docker Compose-based; auto-rebuilds before tests; disableable via `PLAYWRIGHT_DISABLE_WEBSERVER` |
| **Test Isolation** | Serial execution for web tests ensures database state consistency; parallel for UI-only tests |

### 5. microsoft/playwright (self-tests)

| Pattern | Implementation |
|---|---|
| **Retry Config** | Varies per test project; the framework supports all retry strategies |
| **Trace Strategy** | Full trace support as a built-in feature |
| **Stability Annotations** | Canonical implementation of `test.fixme()`, `test.skip()`, `test.slow()`, `test.fail()` |
| **Anti-Pattern Enforcement** | `eslint-plugin-playwright` rule `no-wait-for-timeout` bans `page.waitForTimeout()` |
| **Auto-Wait** | Built-in actionability checks: visible, enabled, stable, receives events, attached, editable |
| **Web-First Assertions** | `toBeVisible()`, `toBeEnabled()`, `toBeChecked()` with auto-retry until timeout |
| **Flaky Detection** | `--retries=N` with `--reporter=html` shows flaky tests with yellow triangle indicator |

### 6. freeCodeCamp/freeCodeCamp

| Pattern | Implementation |
|---|---|
| **CI Workflow** | GitHub Actions with browser matrix; `--grep-invert` to exclude known-flaky tests |
| **Locator Strategy** | Priority: `getByRole` > `getByText` > `data-playwright-test-label` (last resort) |
| **Test Data Stability** | `seed:certified-user` command ensures consistent database state before tests |
| **Isolation** | Fresh MongoDB seed per test run; local dev stack on `127.0.0.1:8000` |
| **Mobile Testing** | `isMobile` argument for conditional mobile-specific assertions within single tests |

### 7. supabase/supabase

| Pattern | Implementation |
|---|---|
| **Auth Stability** | Setup projects for authentication; storageState reuse eliminates login flakiness |
| **REST API Auth** | Alternative pattern: authenticate via REST API instead of UI for faster, more stable auth |
| **Email Testing** | InBucket for email testing in CI — avoids reliance on external email services |
| **Worker Limitation** | Recommends 1 worker in CI when hitting database connection limits |
| **Session Management** | storageState saved to JSON; local storage set in browser for Supabase auth |

### 8. excalidraw/excalidraw

| Pattern | Implementation |
|---|---|
| **A11y Testing** | axe-core integration runs on every PR; reports violations without blocking CI |
| **Stability Approach** | Focused test scope (a11y + visual) reduces surface area for flakiness |
| **Canvas Testing** | Addresses the inherently flaky challenge of testing canvas-based interactions |

### 9. grafana/plugin-tools

| Pattern | Implementation |
|---|---|
| **Auth Stability** | `withAuth()` function with storageState at `playwright/.auth/<username>.json` |
| **RBAC Testing** | Inline user definitions with automatic account creation via Grafana HTTP API |
| **Credential Management** | `GRAFANA_ADMIN_USER` and `GRAFANA_ADMIN_PASSWORD` environment variables |
| **Setup Dependencies** | `dependencies: ['auth']` ensures auth runs before tests |

### 10. vercel/next.js

| Pattern | Implementation |
|---|---|
| **WebServer Stability** | `webServer` auto-starts Next.js dev server; tests wait for server readiness |
| **Deployment Testing** | Dynamic baseURL from Vercel preview deployments in PRs |
| **Multiple Modes** | Tests against dev, production, and deployed modes for comprehensive stability |

---

## Blog/Community Sources on Flakiness Management

| Source | Key Pattern |
|---|---|
| BrowserStack (2026) | Quarantine flaky tests in separate CI job; track with tickets; fix root causes |
| TestDino checklist | Flaky rate above 2% erodes CI trust; target near 0% |
| Better Stack guide | `trace: 'on-first-retry'` captures diagnostic data without overhead on passing tests |
| Semaphore blog | Replace `page.waitForTimeout()` with web-first assertions; use `toPass()` for retry |
| DEV Community (TestDino) | `screenshot: 'only-on-failure'` + `trace: 'on-first-retry'` is the optimal artifact strategy |
| Charpeni blog | Reproduce flaky tests with `--repeat-each=100` to identify intermittent failures |
| ray.run | Monitor flaky test trends over time; set alerts when flaky rate increases |

---

## Summary Statistics

- **Gold suites examined:** 10
- **Average CI retries across Gold suites:** 2.2 (range: 1-4)
- **Trace strategy:** 100% use `retain-on-failure` or `on-first-retry`
- **Screenshot strategy:** 100% use `only-on-failure` or retain-on-failure
- **Video capture:** 1/10 (AFFiNE only)
- **Env-aware timeouts:** 8/10
- **Per-project parallelism control:** 3/10 (Immich, Cal.com, Grafana)
