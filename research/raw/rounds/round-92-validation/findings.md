# Round 92 — Validation: Fresh Suite Discovery & Initial Analysis

**Phase:** Validation
**Focus:** Find 6 fresh Playwright suites NOT in existing bibliography; perform initial structural analysis
**Date:** 2026-03-19

---

## Methodology

Searched GitHub for Playwright suites with 1000+ stars not previously analyzed in rounds 1-91. Used `gh search code "playwright.config"` across 40+ candidate repositories. Selected 6 suites spanning different industries, sizes, and product types to stress-test draft standards.

**Selection criteria:**
- Must have `playwright.config.ts` or `.js` at root or package level
- Must have 5+ spec/test files (not toy examples)
- Must NOT appear in `research/sources.md` or any prior round
- Spread across industries: CRM, CMS, editor, BaaS, survey tool, visual builder

---

## Suites Found

### 1. Lexical (facebook/lexical)
- **Stars:** 23,122
- **Category:** Rich text editor framework (developer tool)
- **Language:** JavaScript (`.spec.mjs` files)
- **Test count:** 50 spec files + 2 subdirectories (CopyAndPaste/, Headings/)
- **Config:** 49 LOC, 3 browser projects (Chromium, Firefox, WebKit), 4 workers, 4 retries in CI
- **Test directory:** `packages/lexical-playground/__tests__/e2e/`
- **File naming:** `.spec.mjs` (unique — JavaScript modules, not TypeScript)
- **Key patterns observed:**
  - `beforeEach` with `initialize({isCollab, page})` — every file
  - No custom fixtures via `test.extend<T>()`
  - Heavy use of helper functions (`assertHTML`, `assertSelection`, `focusEditor`, `toggleBold`)
  - Multi-browser testing (3 projects)
  - Parametric testing via `test.describe.each` patterns
  - `.spec.mjs` extension (non-standard for Playwright ecosystem)

### 2. Twenty CRM (twentyhq/twenty)
- **Stars:** 40,567
- **Category:** Open-source CRM
- **Language:** TypeScript
- **Test count:** 8 spec files (early-stage suite)
- **Config:** 94 LOC, 2 projects (setup + Chrome), 1 worker, serial execution
- **Test directory:** `packages/twenty-e2e-testing/tests/`
- **Infrastructure:** Extensive POM library (15+ page objects in `lib/pom/`), API request helpers, custom reporter
- **Key patterns observed:**
  - Rich POM investment despite small test count (15+ POMs for 8 tests)
  - Auth state in `.auth/user.json`
  - Custom fixtures (screenshot fixture)
  - `test.step()` used in at least 1 test (signup invite flow)
  - Serial execution (`workers: 1`)
  - API helpers for workflow CRUD operations
  - Custom reporter (`log-summary-reporter.ts`)

### 3. Payload CMS (payloadcms/payload)
- **Stars:** 41,319
- **Category:** Headless CMS
- **Language:** TypeScript
- **Test count:** 82 e2e spec files
- **Config:** 42 LOC, 1 project (Chromium), 16 workers, 5 retries in CI
- **Test directory:** `test/` (per-feature subdirectories, each with `e2e.spec.ts`)
- **Helper library:** 80+ e2e helper files in `test/__helpers/e2e/`
- **Key patterns observed:**
  - Feature-based directory organization (`test/auth/`, `test/fields/collections/Text/`, `test/access-control/`)
  - Consistent filename: every e2e test is named `e2e.spec.ts`
  - Very high parallelism (16 workers)
  - Extensive helper library (80+ helper files for assertions, auth, fields, columns)
  - `beforeAll` for shared setup, `beforeEach` with DB reinitialization
  - Short tests (avg 8-15 lines in field tests, 15-25 in auth tests)
  - Strong negative test coverage (access-control has 200+ tests including permission enforcement)
  - No `test.step()` usage
  - No custom fixtures via `test.extend<T>()` — relies on helpers + hooks

### 4. Nhost (nhost/nhost)
- **Stars:** 9,107
- **Category:** Backend-as-a-Service (BaaS) dashboard
- **Language:** TypeScript
- **Test count:** 26 test files
- **Config:** 47 LOC, 4 projects (setup, main, local, onboarding), 1 worker, 2 retries in CI
- **Test directory:** `dashboard/e2e/` (feature-nested)
- **File naming:** `.test.ts`
- **Key patterns observed:**
  - Feature-based nesting: `auth/`, `database/tables/`, `database/views/`, `ai/`, `events/`, `graphql/`
  - Custom auth fixture (`authenticatedNhostPage`) via `test.extend<T>()`
  - Auth state in `e2e/.auth/user.json`
  - `beforeEach` for navigation setup
  - `faker` for random test data
  - Serial execution (`workers: 1`, `fullyParallel: false`)
  - Slow motion enabled (500ms) — unusual for production
  - `maxFailures: 3` in CI — fail-fast strategy
  - Helper functions for common operations (e.g., `prepareTable()`)

### 5. Formbricks (formbricks/formbricks)
- **Stars:** 11,987
- **Category:** Open-source survey tool (Qualtrics alternative)
- **Language:** TypeScript
- **Test count:** 18 spec files (8 UI + 10 API)
- **Config:** 102 LOC, 1 project (Chromium), `fullyParallel: true`, 2 retries in CI
- **Test directory:** `apps/web/playwright/`
- **Key patterns observed:**
  - **Multi-layer E2E:** Both UI tests (`survey.spec.ts`, `signup.spec.ts`) and API tests (`api/auth/security.spec.ts`, `api/management/*.spec.ts`)
  - Custom fixture via `test.extend<T>()` for `users` fixture
  - `test.step()` used in survey creation tests
  - Very long tests: survey.spec.ts averages 250+ lines per test (3 tests, up to 520 lines)
  - High assertion density in survey tests (45+ per test)
  - `test.use({ slowMo: 150 })` — slowMo in tests
  - Security-focused API tests (DoS protection, timing attack prevention, CSRF)
  - `beforeEach` used in signup tests
  - Test timeouts extended to 5-8 minutes for long survey flows

### 6. Builder.io (BuilderIO/builder)
- **Stars:** 8,645
- **Category:** Visual CMS / page builder (SDK cross-framework testing)
- **Language:** TypeScript
- **Test count:** 52 e2e spec files
- **Config:** 145 LOC, dynamic project generation from SDK map, `fullyParallel: true`, 1 worker in CI
- **Test directory:** `packages/sdks-tests/src/e2e-tests/`
- **Key patterns observed:**
  - Cross-framework SDK testing (same tests run against React, Vue, Angular, Svelte, etc.)
  - Dynamic project generation based on `SDK_MAP` and `SERVER_NAME` env var
  - Flat test directory (52 files, no subdirectories)
  - Fixtures via test parameters (`{ page, sdk, packageName, basePort, browser }`)
  - No `test.step()` usage
  - Short tests (avg 6-15 lines for component tests, 15-25 for complex tests)
  - A/B test file runs tests 10x to check for flakiness
  - Security test: `xss-exploit.spec.ts`
  - `test.skip()` extensively used for SDK-specific incompatibilities
  - `test.slow()` for potentially flaky tests
  - Multiple web servers configured dynamically

---

## Summary Table

| Suite | Stars | Test Files | Avg Lines/Test | Config LOC | Workers | Browsers | Fixtures | test.step() | Scale Tier |
|-------|-------|-----------|---------------|------------|---------|----------|----------|------------|-----------|
| Lexical | 23k | 50+ | 30-85 | 49 | 4 | 3 | No (helpers) | No | Medium |
| Twenty CRM | 40k | 8 | 50-100 | 94 | 1 | 1 | Partial (POM) | Yes (1 file) | Small |
| Payload CMS | 41k | 82 | 8-25 | 42 | 16 | 1 | No (helpers) | No | Large |
| Nhost | 9k | 26 | 8-35 | 47 | 1 | 1 | Yes (auth) | No | Small-Medium |
| Formbricks | 12k | 18 | 7-520 | 102 | default | 1 | Yes (users) | Yes | Small-Medium |
| Builder.io | 8.6k | 52 | 6-25 | 145 | 1 (CI) | 1 | Yes (params) | No | Medium |
