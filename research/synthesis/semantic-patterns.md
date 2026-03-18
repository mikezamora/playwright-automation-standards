# Semantic Patterns

## Overview

This document consolidates semantic patterns observed across Playwright suites during the landscape phase (rounds 1-11). Semantic patterns include naming conventions, test categorization, tag usage, and terminology standardization.

**Status:** Initial synthesis — to be refined in semantics phase (rounds 41-46)

---

## Observed Patterns

### 1. Test File Naming Conventions

**Pattern: `*.spec.ts` as the dominant convention**
- Frequency: 7/10 Gold suites use `.spec.ts`
- Playwright's default `testMatch` pattern matches `*.spec.ts`
- Evidence: [grafana-e2e], [calcom-e2e], [affine-e2e], [immich-e2e], [excalidraw-e2e], [grafana-plugin-e2e], [nextjs-e2e]

**Variant: `*.test.ts`**
- Used by suites closer to Jest/Vitest conventions
- Evidence: [freecodecamp-e2e], some Silver suites

**Variant: `*.e2e.ts` or `*.e2e-spec.ts`**
- Used to distinguish E2E from unit tests in the same project
- Evidence: Some Silver/Bronze suites; NestJS convention

### 2. Test Description Conventions

**Pattern: Action-oriented `describe`/`test` descriptions**
- Tests describe user actions: "should create a new booking", "should display error on invalid input"
- `describe` blocks group by feature area: "Booking flows", "Authentication", "Dashboard"
- Evidence: [calcom-e2e], [freecodecamp-e2e], [immich-e2e]

**Pattern: Contextual `test.describe` nesting**
- Feature > scenario > variant hierarchy
- Example: `describe('Dashboard')` > `describe('with admin role')` > `test('should see all panels')`
- Evidence: [grafana-e2e] (role-based describe nesting), [calcom-e2e]

### 3. Locator Naming and Data Attributes

**Pattern: `data-testid` as the escape hatch attribute**
- Used when semantic locators (`getByRole`, `getByText`) are insufficient
- Convention: `data-testid="component-action"` (kebab-case)
- Evidence: [freecodecamp-e2e] (`data-playwright-test-label`), [calcom-e2e] (`data-testid`)

**Pattern: Locator priority hierarchy (semantic naming)**
- `getByRole()` — most semantic, accessibility-aligned
- `getByText()` — user-visible text
- `getByLabel()` — form labels
- `getByPlaceholder()` — input placeholders
- `getByTestId()` — explicit test attribute (last resort)
- Evidence: [freecodecamp-e2e] (contributor guide), [playwright-best-practices]

### 4. Project Naming Conventions

**Pattern: Descriptive project names reflecting scope**
- Browser-based: `chromium`, `firefox`, `webkit`, `Mobile Chrome`, `Mobile Safari`
- Role-based: `auth`, `admin`, `viewer`, `editor`
- App-based: `web`, `app-store`, `embed-core`, `embed-react`
- Evidence: [calcom-e2e] (7 named projects), [grafana-e2e] (30+ role/plugin projects), [immich-e2e] (`web`, `ui`, `maintenance`)

### 5. Test Categorization and Tagging

**Pattern: Project-based categorization (primary)**
- Tests grouped into Playwright projects rather than tagged
- Each project has its own config (testDir, timeout, dependencies)
- Evidence: [immich-e2e] (web vs. ui vs. maintenance), [calcom-e2e] (per-app projects)

**Pattern: Annotation-based categorization (supplementary)**
- `test.skip()` — temporarily disabled tests
- `test.fixme()` — known broken, tracked for fixing
- `test.slow()` — tests needing longer timeouts
- `test.fail()` — expected to fail (regression detection)
- Evidence: [grafana-e2e] (test.fixme for feature flag issues), [calcom-e2e] (test.skip with TODO)

**Pattern: `--grep` / `--grep-invert` for runtime filtering**
- Used to include/exclude test subsets in CI
- Evidence: [freecodecamp-e2e] (`--grep-invert` to exclude known-flaky tests)

### 6. Fixture and Page Object Naming

**Pattern: Camel-case fixture names matching their purpose**
- `authenticatedPage`, `apiClient`, `adminUser`, `datasourcePage`
- Evidence: [grafana-plugin-e2e], [boilerplate-playwright-ts]

**Pattern: PascalCase for page object classes**
- `DashboardPage`, `LoginPage`, `BookingFlow`
- Evidence: [clerk-e2e-template], [calcom-e2e]

---

## Emerging Themes

1. **Semantic locators align testing with accessibility** — `getByRole()` tests what screen readers see
2. **Project-based categorization replaces tags** — Playwright's project system is more powerful than simple tagging
3. **Naming follows TypeScript conventions** — camelCase for variables/fixtures, PascalCase for classes, kebab-case for test-ids
4. **Consistency within a suite matters more than cross-suite uniformity** — Each Gold suite is internally consistent but conventions vary between suites

---

## Open Questions (for Semantics Phase)

1. What naming patterns exist for fixtures that create vs. fixtures that provide?
2. How are test utility functions named and organized?
3. What tagging/annotation strategies exist beyond Playwright's built-in annotations?
4. How do monorepo suites name shared vs. package-specific tests?
5. What glossary terms are specific to Playwright testing that differ from general testing terminology?
