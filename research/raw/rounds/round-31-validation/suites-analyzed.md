# Round 31 — Suites Analyzed

**Phase:** Validation
**Focus:** Final validation sweep — assertion patterns, retry config, CI setup across 10+ suites not yet deeply analyzed in validation rounds
**Date:** 2026-03-18

## Suites and Sources Analyzed

### Silver-Standard Suites — Validation Sweep

1. **supabase/supabase** — Web-first assertions used throughout dashboard tests; `toBeVisible()` and `toHaveText()` dominate; CI runs Chromium-only with 2 retries; `trace: 'retain-on-failure'`; setup project for admin auth; Turborepo `passThroughEnv` for Playwright vars
2. **appwrite/appwrite** — Assertion patterns follow web-first convention; `toHaveURL()` for navigation verification; Docker Compose for backend services; 1 CI retry; `screenshot: 'only-on-failure'`; no custom matchers
3. **directus/directus** — Uses `getByRole()` and `getByText()` as primary locators; `toBeVisible()` guard assertions before form fills; 2 CI retries; GitHub Actions matrix for multi-database (Postgres, MySQL, SQLite); `trace: 'on-first-retry'`
4. **outline/outline** — Web-first assertions with `toContainText()` for rich-text editor output; `toPass()` used for editor rendering stabilization; 1 retry; `webServer` with `reuseExistingServer: !process.env.CI`; Postgres + Redis via Docker Compose
5. **strapi/strapi** — `getByRole()` dominant locator strategy; `toBeEnabled()` before button clicks; 2 retries in CI; monorepo with Turborepo; `baseURL` from environment variable; `forbidOnly: !!process.env.CI`
6. **nocodb/nocodb** — Heavy use of `toHaveCount()` for table/grid validation; `toHaveAttribute()` for cell state; 3 retries (complex Docker backend); `maxFailures: 5` for early abort; serial mode for data-dependent create/edit/delete flows
7. **hoppscotch/hoppscotch** — API-focused assertions: `toBeOK()` for response validation; `toHaveURL()` for navigation; 1 retry; Chromium-only CI; Vite `webServer` config; minimal test suite (~30 tests)
8. **logto-io/logto** — Multi-tenant auth testing; `storageState` per tenant role; `toHaveURL()` for redirect flow verification; 2 retries; `expect.timeout: 10_000` (auth flows are slow); setup project dependencies for tenant creation
9. **n8n-io/n8n** — Workflow builder testing with complex drag-and-drop assertions; `toBeVisible()` guard assertions extensively; `toHaveClass()` for connection state; 2 retries; Vue.js `webServer` config; `test.slow()` for complex workflow tests
10. **twentyhq/twenty** — CRM testing with `getByRole()` dominant; `toHaveValue()` for form pre-fill verification; 1 retry; `baseURL` from `TWENTY_FRONTEND_URL` env var; setup project for user auth; Chromium-only
11. **requarks/wiki** — Content management assertions with `toContainText()` for rendered markdown; `toHaveScreenshot()` for editor visual regression; 2 retries; Docker Compose with Postgres; `globalSetup` for database migration

### Recently Published Best Practices Sources

12. **Playwright official blog (2026)** — Updated best practices guide: reinforces web-first assertions, `storageState` with setup projects, `workers: 1` in CI, blob reporter for sharding
13. **TestingBot guide (2025)** — Comprehensive assertion patterns review; validates web-first as universal standard; documents `toMatchAriaSnapshot()` adoption growth
14. **Currents.dev 2026 report** — CI/CD integration benchmarks: median CI time 8-12 minutes for Gold-equivalent suites; sharding reduces to 3-5 minutes; `maxFailures` saves 40% of wasted CI minutes on cascading failures

## Method

- Quick-scanned 11 Silver-standard suites for assertion patterns, retry config, CI setup
- Compared against established patterns from rounds 23-30
- Noted deviations from Gold-standard patterns
- Searched for recently published Playwright best practices guides (2025-2026)
- Validated that patterns hold across diverse application types (CRM, CMS, API platform, auth provider, workflow builder)
