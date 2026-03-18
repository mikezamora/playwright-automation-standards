# Round 41 — Findings: Playwright-Specific Terminology Extraction

## Executive Summary

Playwright introduces approximately 25 domain-specific terms that have no direct equivalent in generic testing vocabulary. These terms form the foundational vocabulary for any Playwright automation standard. Test naming follows three primary patterns, with `should` phrasing dominant at 6/10 Gold suites. File naming strongly favors `.spec.ts` (7/10 Gold suites). Tag conventions are emerging but not standardized.

---

## Finding 1: Playwright Core API Terms Form a Hierarchical Vocabulary

The Playwright API introduces terms at four conceptual levels:

### Infrastructure Level
| Term | Official Definition | Usage Context |
|------|-------------------|---------------|
| **Browser** | A Chromium, Firefox, or WebKit instance | Rarely referenced directly in tests; managed by the runner |
| **BrowserContext** | An isolated browser session (cookies, storage, permissions) | Created per test by default; shared via storageState |
| **Page** | A single tab within a BrowserContext | The primary test interaction surface |
| **Frame** | An iframe or child frame within a Page | Used for embedded content testing |
| **Worker** | A parallel process running tests | Configured via `workers` in config |
| **Shard** | A partition of the full test suite for distributed execution | `--shard=1/3` syntax; CI distribution mechanism |

### Test Organization Level
| Term | Official Definition | Usage Context |
|------|-------------------|---------------|
| **test** | A single test case declaration | `test('name', async ({ page }) => { })` |
| **test.describe** | A group of related tests | `test.describe('feature', () => { })` |
| **test.step** | A named sub-section within a test | `await test.step('fill form', async () => { })` |
| **test.beforeAll** | Setup that runs once before all tests in a describe | Worker-scoped setup |
| **test.afterAll** | Teardown that runs once after all tests in a describe | Worker-scoped cleanup |
| **test.beforeEach** | Setup that runs before each test | Test-scoped setup |
| **test.afterEach** | Teardown that runs after each test | Test-scoped cleanup |
| **Project** | A named test configuration (browser, viewport, auth, testDir) | Defined in `playwright.config.ts`; enables matrix testing |

### Extension Level
| Term | Official Definition | Usage Context |
|------|-------------------|---------------|
| **test.extend** | Creates a new test function with additional fixtures | `const test = base.extend<{ myFixture: MyType }>({ })` |
| **test.use** | Applies options to all tests in scope | `test.use({ storageState: 'admin.json' })` |
| **Fixture** | A named dependency injected into tests (setup/teardown managed by framework) | Built-in: `page`, `context`, `browser`, `request` |
| **StorageState** | Serialized browser context state (cookies + localStorage) | Auth reuse mechanism |

### Interaction Level
| Term | Official Definition | Usage Context |
|------|-------------------|---------------|
| **Locator** | A way to find element(s) on a page; auto-waits and auto-retries | `page.getByRole('button')`, `page.locator('.class')` |
| **Route** | An intercepted network request for mocking/modification | `page.route('**/api/**', handler)` |
| **Trace** | A recorded timeline of test execution (actions, screenshots, network) | Debugging artifact; viewable in Trace Viewer |
| **expect** | The assertion function; web-first when used with locators | `await expect(locator).toBeVisible()` |

**Evidence:** Playwright official API docs (v1.50), cross-referenced with all 10 Gold suite codebases.

---

## Finding 2: Test Description Naming Follows Three Primary Patterns

Analysis of test descriptions across Gold suites reveals three dominant patterns:

### Pattern A: "should" phrasing (most common — 6/10 Gold suites)
```
test('should create a new booking')
test('should display error on invalid input')
test('should redirect unauthenticated user to login')
```
- **Used by:** Cal.com, freeCodeCamp, Immich, Grafana (partially), Excalidraw, Supabase
- **Characteristics:** Reads as a specification; aligns with BDD "it should" tradition
- **Strength:** Clear pass/fail semantics — "it should X" either passes or it doesn't

### Pattern B: Imperative/action phrasing (3/10 Gold suites)
```
test('create a new dashboard')
test('navigate to settings and update profile')
test('verify pagination controls')
```
- **Used by:** AFFiNE, Grafana (partially), Next.js
- **Characteristics:** Reads as a test script instruction; verb-first
- **Strength:** Concise; maps directly to user actions

### Pattern C: Feature-colon-behavior (1/10 Gold suites, emerging)
```
test('Dashboard: displays all panels for admin user')
test('Auth: redirects expired sessions to login')
```
- **Used by:** Grafana plugin-e2e (partially)
- **Characteristics:** Namespace prefix for filtering; self-documenting category
- **Strength:** Enables `--grep "Dashboard:"` for feature-level execution

### Mixed Usage
Most suites are not 100% consistent. Grafana mixes patterns A and B depending on the contributor. Cal.com is the most consistent Pattern A user. No Gold suite enforces naming via linting.

**Evidence:** Test file analysis across all 10 Gold suites, rounds 13-16 deep dives.

---

## Finding 3: File Naming Conventions Show Strong `.spec.ts` Dominance

| Convention | Frequency | Suites |
|-----------|-----------|--------|
| `*.spec.ts` | 7/10 Gold | Grafana, Cal.com, AFFiNE, Immich, Excalidraw, grafana-plugin-e2e, Next.js |
| `*.test.ts` | 2/10 Gold | freeCodeCamp, Supabase |
| `*.e2e.ts` | 1/10 Gold | Cal.com (some files use `.e2e.ts` alongside `.spec.ts`) |
| `*.e2e-spec.ts` | 0/10 Gold | Seen in NestJS ecosystem, Angular convention |

### File Name Casing
| Convention | Frequency | Examples |
|-----------|-----------|---------|
| kebab-case | 8/10 Gold | `dashboard-browse.spec.ts`, `booking-pages.e2e.ts` |
| dot-notation | 2/10 Gold | `all-page.spec.ts` (AFFiNE), no pure dot-notation suites |
| camelCase | 0/10 Gold | Not observed in any Gold suite for test files |
| PascalCase | 0/10 Gold | Not observed in any Gold suite for test files |

### Playwright Default Configuration
- Default `testMatch`: `**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}`
- Both `.test.ts` and `.spec.ts` work without configuration
- `.e2e.ts` requires explicit `testMatch` override

**Evidence:** File listings from all 10 Gold suites, Playwright config docs.

---

## Finding 4: `test.describe` Naming Follows Four Organizational Strategies

| Strategy | Example | Used By |
|----------|---------|---------|
| **Feature name** | `test.describe('Dashboard')` | Grafana, Cal.com |
| **Page/component name** | `test.describe('Booking Page')` | Cal.com, Immich |
| **User story prefix** | `test.describe('As admin, managing users')` | Not observed in Gold suites |
| **Capability/action** | `test.describe('Authentication')` | freeCodeCamp, Supabase |

### Nesting Depth
- **1 level (flat):** freeCodeCamp, Immich — single describe per file
- **2 levels (standard):** Cal.com, Grafana — feature > scenario
- **3 levels (deep):** Grafana — feature > role/context > scenario

Grafana's role-based nesting is the most sophisticated: `describe('Dashboard')` > `describe('with viewer role')` > `test('should see read-only panels')`.

**Evidence:** Test file analysis, rounds 13-16 deep dives.

---

## Finding 5: Tag and Annotation Vocabulary Is Emerging but Not Standardized

### Built-in Playwright Annotations
| Annotation | Usage | Frequency |
|-----------|-------|-----------|
| `test.skip()` | Disable test conditionally | 10/10 Gold suites |
| `test.fixme()` | Mark as known broken | 3/10 (Grafana, Cal.com, AFFiNE) |
| `test.slow()` | Triple the timeout | 2/10 (Grafana, Cal.com) |
| `test.fail()` | Expect test to fail | 1/10 (Grafana) |

### Custom Tags (Playwright v1.42+ `{ tag }` option)
| Tag | Purpose | Used By |
|-----|---------|---------|
| `@dashboards` | Feature grouping | Grafana |
| `@smoke` | Smoke test category | Community convention, not in Gold suites |
| `@regression` | Regression category | Community convention |
| `@critical` | Priority marking | Community convention |
| `@slow` | Performance warning | Overlaps with `test.slow()` |

### Tag Adoption Gap
Despite Playwright adding tag support in v1.42 (late 2024), only Grafana among Gold suites has adopted it. Most suites rely on project-based categorization or `--grep` filtering instead of tags. This suggests tags are a newer feature that hasn't reached widespread adoption yet.

**Evidence:** Grafana dashboard-browse.spec.ts (tag usage), Playwright v1.42 release notes, all 10 Gold suite searches for `{ tag` pattern.

---

## Finding 6: Test Categorization Vocabulary Maps to Industry-Standard Definitions

| Category Term | Definition in Playwright Context | Usage Evidence |
|--------------|--------------------------------|----------------|
| **Smoke test** | Minimal subset verifying core features work after deployment | freeCodeCamp (`--grep @smoke`), community convention |
| **Sanity test** | Quick check that a specific fix works | Not observed as a formal category in any Gold suite |
| **Regression test** | Full suite run ensuring no existing behavior broke | Default `npx playwright test` execution |
| **Critical path** | Tests covering the primary user journey (login > core action > logout) | Cal.com booking flow, Grafana CUJS (Critical User Journey Suite) |
| **Happy path** | Tests with valid inputs and expected outcomes | Dominant in all Gold suites (estimated 80%+ of tests) |
| **Edge case** | Tests with boundary conditions or unusual inputs | Present but not formally tagged in any Gold suite |
| **Negative test** | Tests verifying error handling and rejection of invalid inputs | Cal.com (invalid booking), freeCodeCamp (wrong credentials) |
| **Integration test** | Tests spanning multiple services/APIs | Immich (API + UI combined), Supabase |
| **E2E test** | Full user journey through the real application | The default meaning of all Playwright tests in Gold suites |

Notable: Grafana's "CUJS" (Critical User Journey Suite) is a project-specific term for critical path tests, demonstrating that organizations create their own vocabulary for test categories.

**Evidence:** All 10 Gold suite test structures, community blog analysis, Grafana CUJS project definition.
