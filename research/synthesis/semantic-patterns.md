# Semantic Patterns

## Overview

This document consolidates semantic patterns observed across Playwright suites during the landscape phase (rounds 1-11), refined with deep-dive analysis from prior phases, and expanded with terminology extraction from the semantics phase (rounds 41-44).

**Status:** Updated with Rounds 41-44 terminology extraction and consistency validation. Glossary draft populated.

---

## Observed Patterns

### 1. Test File Naming Conventions

**Pattern: `*.spec.ts` as the dominant convention**
- Frequency: 7/10 Gold suites use `.spec.ts`
- Playwright's default `testMatch` pattern matches `*.spec.ts`
- Evidence: [grafana-e2e], [calcom-e2e], [affine-e2e], [immich-e2e], [excalidraw-e2e], [grafana-plugin-e2e], [nextjs-e2e]

**Variant: `*.test.ts`**
- Used by suites closer to Jest/Vitest conventions
- Evidence: [freecodecamp-e2e], [supabase-e2e]

**Variant: `*.e2e.ts` or `*.e2e-spec.ts`**
- Used to distinguish E2E from unit tests in the same project
- Evidence: Some Silver/Bronze suites; NestJS convention; Angular Protractor legacy
- Requires explicit `testMatch` override in Playwright config

**File name casing: kebab-case dominant (8/10 Gold)**
- Examples: `dashboard-browse.spec.ts`, `booking-pages.e2e.ts`
- No Gold suite uses camelCase or PascalCase for test file names

### 2. Test Description Conventions

**Pattern A: "should" phrasing (dominant — 6/10 Gold suites)**
- Format: `test('should [verb] [object] [condition]')`
- Examples: `test('should create a new booking')`, `test('should display error on invalid input')`
- Used by: Cal.com, freeCodeCamp, Immich, Grafana (partially), Excalidraw, Supabase
- Strength: Reads as specification; clear pass/fail semantics

**Pattern B: Imperative/action phrasing (3/10 Gold suites)**
- Format: `test('[verb] [object]')`
- Examples: `test('create a new dashboard')`, `test('navigate to settings')`
- Used by: AFFiNE, Grafana (partially), Next.js
- Strength: Concise; maps directly to user actions

**Pattern C: Feature-colon-behavior (emerging — 1/10 Gold suites)**
- Format: `test('[Feature]: [behavior]')`
- Examples: `test('Dashboard: displays all panels for admin')`
- Used by: Grafana plugin-e2e (partially)
- Strength: Enables `--grep "Dashboard:"` for feature filtering

**Consistency note:** Most suites are not 100% consistent internally. No Gold suite enforces naming via linting. Cal.com is the most consistent Pattern A user.

### 3. `test.describe` Naming Strategies

**Four organizational strategies observed:**

| Strategy | Example | Used By | Frequency |
|----------|---------|---------|-----------|
| Feature name | `test.describe('Dashboard')` | Grafana, Cal.com | 4/10 |
| Page/component name | `test.describe('Booking Page')` | Cal.com, Immich | 3/10 |
| Capability/action | `test.describe('Authentication')` | freeCodeCamp, Supabase | 3/10 |
| User story prefix | `test.describe('As admin, managing users')` | Not observed in Gold | 0/10 |

**Nesting depth:**
- 1 level (flat): freeCodeCamp, Immich — single describe per file
- 2 levels (standard): Cal.com, Grafana — feature > scenario
- 3 levels (deep): Grafana — feature > role/context > scenario (e.g., Dashboard > with viewer role > should see read-only panels)

### 4. Locator Naming and Data Attributes

**Pattern: `data-testid` as the escape hatch attribute**
- Used when semantic locators (`getByRole`, `getByText`) are insufficient
- Convention: `data-testid="component-action"` (kebab-case)
- Evidence: [freecodecamp-e2e] (`data-playwright-test-label`), [calcom-e2e] (`data-testid`)
- Structure: `[scope]-[element]-[qualifier]` (e.g., `booking-form-submit`)

**Pattern: Locator priority hierarchy (semantic naming)**
- `getByRole()` — most semantic, accessibility-aligned
- `getByText()` — user-visible text
- `getByLabel()` — form labels
- `getByPlaceholder()` — input placeholders
- `getByTestId()` — explicit test attribute (last resort)
- Evidence: [freecodecamp-e2e] (contributor guide), [playwright-best-practices]

**Note:** `data-testid` dominates actual usage in Gold suites (7/10) despite `getByRole()` being the official recommendation. This gap between recommendation and practice is well-documented.

**Deprecated term:** "Selector" was replaced by "locator" in Playwright v1.14. "Selector" now refers only to the CSS/XPath string, not the Playwright object.

### 5. Project Naming Conventions

**Pattern: Descriptive project names reflecting scope**

| Naming Strategy | Examples | Used By |
|----------------|----------|---------|
| Browser name | `'chromium'`, `'firefox'`, `'webkit'` | Slate, freeCodeCamp |
| Role name | `'admin'`, `'viewer'`, `'editor'` | Grafana plugin-e2e |
| App name | `'@calcom/web'`, `'app-store'` | Cal.com |
| Lifecycle | `'auth setup'`, `'authenticate'` | Grafana, Cal.com |
| Feature name | `'dashboards'`, `'alerting'` | Grafana |
| Device name | `'Mobile Chrome'`, `'Mobile Safari'` | freeCodeCamp |

Project count correlates with application complexity: 2 (Playwright) to 31 (Grafana).

### 6. Test Categorization and Tagging

**Pattern: Project-based categorization (primary)**
- Tests grouped into Playwright projects rather than tagged
- Each project has its own config (testDir, timeout, dependencies)
- Evidence: [immich-e2e] (web vs. ui vs. maintenance), [calcom-e2e] (per-app projects)

**Pattern: Annotation-based categorization (supplementary)**

| Annotation | Purpose | Adoption |
|-----------|---------|----------|
| `test.skip()` | Temporarily disabled | 10/10 Gold |
| `test.fixme()` | Known broken, tracked | 3/10 (Grafana, Cal.com, AFFiNE) |
| `test.slow()` | Triple timeout | 2/10 (Grafana, Cal.com) |
| `test.fail()` | Expected to fail | 1/10 (Grafana) |

**Pattern: Tag-based categorization (emerging — v1.42+)**
- Grafana uses `{ tag: ['@dashboards'] }` on describe blocks
- Community conventions: `@smoke`, `@regression`, `@critical`, `@slow`
- Only 1/10 Gold suites has adopted tags despite being available since late 2024
- Most suites rely on projects or `--grep` instead

**Pattern: `--grep` / `--grep-invert` for runtime filtering**
- Used to include/exclude test subsets in CI
- Evidence: [freecodecamp-e2e] (`--grep-invert` to exclude known-flaky tests)

### 7. Fixture and Page Object Naming

**POM Class Naming: PascalCase + `Page` suffix (universal)**
- Pattern: `DashboardPage`, `LoginPage`, `BookingPage`, `PanelEditPage`
- Non-page variants: `BookingFlow` (multi-step), `DatePicker` (component)
- Evidence: All Gold suites with POM patterns

**POM Method Naming:**

| Category | Pattern | Examples |
|----------|---------|----------|
| Navigation | `goto()` or `goTo()` | `dashboardPage.goto('/d/abc')` |
| Actions | verb + target | `fillUsername()`, `clickSubmit()` |
| Assertions | `verify*()` or `expect*()` | `verifyDashboardLoaded()` |
| Getters | property or `get*()` | `getTitle()`, `panelTitle` |
| Waiters | `waitFor*()` | `waitForLoad()` |

Note: Playwright official POM guide uses `goto()` (lowercase 't'). Community splits between `goto()` and `goTo()`.

**Fixture Naming: camelCase describing the provided resource**
- Pattern: noun-centric, describes what is provided
- Examples: `datasourcePage`, `adminPage`, `authenticatedPage`, `apiClient`
- Rules: always camelCase, always singular, no prefixes
- No naming convention distinguishes worker-scoped from test-scoped fixtures

**Helper Function Naming: verb-noun pattern**
- Pattern: `clickNewPageButton()`, `createDashboard()`, `waitForEditorLoad()`
- Three organization models: kit/package (AFFiNE), utils file (Immich), fixture-embedded (Grafana)

### 8. Test Categorization Vocabulary

| Category | Definition in Playwright Context | Evidence |
|----------|--------------------------------|----------|
| Smoke test | Minimal subset verifying core features post-deployment | freeCodeCamp, community |
| Regression test | Full suite verifying no existing behavior broke | Default execution |
| Critical path | Tests covering primary user journey | Cal.com booking, Grafana CUJS |
| Happy path | Tests with valid inputs and expected outcomes | 80%+ of all Gold suite tests |
| Edge case | Boundary conditions or unusual inputs | Present but untagged |
| Negative test | Error handling and invalid input rejection | Cal.com, freeCodeCamp |
| E2E test | Full user journey through real application | Default meaning in Playwright |
| Integration test | Test spanning multiple services/APIs | Immich, Supabase |

---

## Terminology Consistency Findings (Rounds 43-44)

### Consistent Terms (no divergence across suites)
`page`, `locator`, `expect`, `test.describe`, `storageState`, `project`, `BrowserContext`

### Contested Terms (resolved)
| Term | Preferred Definition | Common Confusion |
|------|---------------------|-----------------|
| **Fixture** | Playwright: injected dependency via `test.extend()` | Cypress: static JSON file; Generic QA: test data |
| **Worker** | OS process running test subset | Confused with web/service workers |
| **Project** | Named config in `playwright.config.ts` | Confused with the repository |
| **Selector** | CSS/XPath string (deprecated for the object) | Replaced by "locator" in v1.14 |

### Cross-Framework Term Mapping
| Concept | Playwright | Cypress | Selenium |
|---------|-----------|---------|----------|
| Find element | `locator` / `getByRole()` | `cy.get()` | `findElement()` |
| Navigate | `page.goto()` | `cy.visit()` | `driver.get()` |
| Type text | `locator.fill()` | `cy.type()` | `element.sendKeys()` |
| Assert visible | `expect(loc).toBeVisible()` | `.should('be.visible')` | Custom |
| Network mock | `page.route()` | `cy.intercept()` | N/A |
| Test isolation | BrowserContext | Spec-level | Session-level |
| Parallel | Workers + shards | Cypress Cloud | TestNG/Grid |

---

## Emerging Themes

1. **Semantic locators align testing with accessibility** — `getByRole()` tests what screen readers see
2. **Project-based categorization replaces tags** — Playwright's project system is more powerful than simple tagging
3. **Naming follows TypeScript conventions** — camelCase for variables/fixtures, PascalCase for classes, kebab-case for test-ids and filenames
4. **Consistency within a suite matters more than cross-suite uniformity** — Each Gold suite is internally consistent but conventions vary between suites
5. **"Fixture" is the most confusing cross-framework term** — Teams migrating from Cypress or pytest must relearn what "fixture" means
6. **Tag adoption lags behind feature availability** — Tags (v1.42) are underutilized; projects and grep remain primary filtering mechanisms
7. **Domain vocabulary coexists with Playwright vocabulary** — Gold suites keep Playwright terms for framework concepts and domain terms for product concepts

---

## Open Questions Resolved (from initial synthesis)

| Question | Answer |
|----------|--------|
| What naming patterns exist for fixtures that create vs. provide? | Factory fixtures use verb prefix (`createUsersFixture`); provider fixtures use noun (`datasourcePage`). Cal.com and Grafana exemplify this split. |
| How are test utility functions named and organized? | Three models: kit/package (AFFiNE), utils file (Immich), fixture-embedded (Grafana). All use verb-noun naming. |
| What tagging/annotation strategies exist beyond built-ins? | Custom tags via `{ tag: ['@name'] }` since v1.42. Only Grafana has adopted. Most suites use projects or grep. |
| How do monorepo suites name shared vs. package-specific tests? | Shared utilities in a kit/package (AFFiNE `@affine-test/kit`); tests in per-package directories. |
| What glossary terms are Playwright-specific? | 25+ terms with no direct equivalent: locator, fixture (Playwright sense), BrowserContext, storageState, worker, shard, project, test.extend, test.use, trace, web-first assertion, and others. Full glossary populated. |
