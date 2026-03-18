# Semantic Conventions

> **FINAL — validated across 10 Gold-standard suites in rounds 1-46, cross-validated in rounds 47-55**
> This document contains finalized naming and semantic conventions for Playwright test automation.
> Each standard includes a clear recommendation, 2+ suite citations, valid alternatives, and anti-patterns.
> Cross-validation: 93% accuracy, 0 contradictions, 1 minor addition (actor naming convention note).

---

## N1. File Naming

### N1.1 Use `.spec.ts` as the default test file extension

**Recommendation:** Test files SHOULD use the `*.spec.ts` naming convention. This aligns with Playwright's default `testMatch` configuration and requires no config override.

**Evidence:** 7/10 Gold suites use `.spec.ts` [grafana-e2e, calcom-e2e, affine-e2e, immich-e2e, excalidraw-e2e, grafana-plugin-e2e, nextjs-e2e]

**Alternatives:**
- `*.test.ts` — Valid for teams with Jest/Vitest conventions. Used by [freecodecamp-e2e, supabase-e2e]. Requires `testMatch` override in config.
- `*.e2e.ts` or `*.e2e-spec.ts` — Valid for projects that need to distinguish E2E from unit tests in the same directory. Used by NestJS convention, Angular legacy. Requires `testMatch` override.

**Anti-patterns:**
- Mixing `.spec.ts` and `.test.ts` in the same project without explicit config
- Using `.js` extension for TypeScript-first projects
- No extension convention at all (e.g., `test1.ts`, `dashboard.ts` without suffix)

### N1.2 Name test files by feature area

**Recommendation:** Test files SHOULD be named after the feature or page they test: `booking.spec.ts`, `dashboard.spec.ts`, `auth.spec.ts`. Group related tests by domain, not by test type.

**Evidence:** Observed across all 10 Gold suites. Examples: [calcom-e2e] `booking-pages.e2e.ts`, [grafana-e2e] `dashboard-browse.spec.ts`, [immich-e2e] `album.spec.ts`

**Alternatives:**
- Component-based naming: `sidebar.spec.ts`, `modal.spec.ts` — Valid for component-focused suites [slate-e2e]
- Journey-based naming: `checkout-flow.spec.ts`, `onboarding-flow.spec.ts` — Valid for user journey tests

**Anti-patterns:**
- Generic names: `test1.spec.ts`, `smoke.spec.ts`, `main.spec.ts`
- Overly specific names that couple to implementation: `button-click-handler.spec.ts`
- Naming by test type rather than feature: `regression-tests.spec.ts`, `api-tests.spec.ts`

### N1.3 Use kebab-case for file names

**Recommendation:** All test-related files SHOULD use kebab-case naming:
- Test files: `booking-flow.spec.ts`, `user-auth.spec.ts`
- Page objects: `dashboard-page.ts`, `login-page.ts`
- Fixtures: `auth-fixtures.ts`, `api-fixtures.ts`
- Utilities: `test-utils.ts`, `api-helpers.ts`

**Evidence:** 8/10 Gold suites use kebab-case [grafana-e2e, calcom-e2e, affine-e2e, immich-e2e, excalidraw-e2e, freecodecamp-e2e, supabase-e2e, nextjs-e2e]

**Alternatives:**
- camelCase: `bookingFlow.spec.ts` — Valid in some projects but less common in TypeScript ecosystem
- No Gold suite uses PascalCase or snake_case for test file names

**Anti-patterns:**
- Mixing casing conventions within the same project
- Spaces or special characters in file names
- PascalCase for file names (reserve PascalCase for class names in code)

### N1.4 Use `*.setup.ts` for setup project files

**Recommendation:** Files that run in a setup project (authentication, database seeding) SHOULD use the `*.setup.ts` convention. This enables clean `testMatch` patterns in config: `testMatch: /.*\.setup\.ts/`.

**Evidence:** [grafana-e2e] `auth.setup.ts`, [calcom-e2e] `auth.setup.ts`, [immich-e2e] `auth.setup.ts`

**Alternatives:**
- `setup/*.ts` — Place setup files in a dedicated directory instead of using a naming convention
- `global-setup.ts` — For `globalSetup` config (runs once before all workers, different from setup projects)

**Anti-patterns:**
- Mixing setup logic into regular test files
- Using `globalSetup` when a setup project with dependencies would be more appropriate (setup projects support retry and parallel execution; `globalSetup` does not)

---

## N2. Test Naming

### N2.1 Use action-oriented test descriptions

**Recommendation:** `test()` descriptions SHOULD describe user actions and expected outcomes. The "should" phrasing is the primary recommendation:
- Format: `test('should [verb] [object] [condition]')`
- Example: `test('should create a new booking when valid data is submitted')`

**Evidence:** 6/10 Gold suites use "should" phrasing [calcom-e2e, freecodecamp-e2e, immich-e2e, grafana-e2e (partial), excalidraw-e2e, supabase-e2e]

**Alternatives:**
- Imperative phrasing: `test('create a new dashboard')` — Used by [affine-e2e, grafana-e2e (partial), nextjs-e2e]. More concise; maps directly to user actions.
- Feature:behavior phrasing: `test('Dashboard: displays all panels for admin')` — Used by [grafana-plugin-e2e (partial)]. Enables `--grep "Dashboard:"` for feature filtering.

**Anti-patterns:**
- Implementation-focused descriptions: `test('calls API endpoint')`, `test('renders component')`
- Vague descriptions: `test('it works')`, `test('test 1')`, `test('bug fix')`
- Overly long descriptions that duplicate the test body
- Inconsistent phrasing within the same file (mixing "should" and imperative)

### N2.2 Use `test.describe()` to group by feature area

**Recommendation:** Group related tests under descriptive `test.describe()` blocks. Four naming strategies are observed, in order of frequency:

| Strategy | Example | Frequency |
|----------|---------|-----------|
| Feature name | `test.describe('Dashboard')` | 4/10 Gold |
| Page/component name | `test.describe('Booking Page')` | 3/10 Gold |
| Capability/action | `test.describe('Authentication')` | 3/10 Gold |

**Evidence:** [grafana-e2e] (feature naming), [calcom-e2e] (page naming), [freecodecamp-e2e] (capability naming), [immich-e2e] (page naming)

**Alternatives:**
- User story prefix: `test.describe('As admin, managing users')` — Not observed in Gold suites; viable for BDD-oriented teams
- No describe blocks: Some small suites skip describe entirely — acceptable for single-feature files

**Anti-patterns:**
- Describe blocks that duplicate the file name without adding value
- Empty describe blocks with only one test (just use the test directly)
- Inconsistent naming strategy across the project

### N2.3 Use descriptive `test.step` labels for multi-step journeys

**Recommendation:** Use `test.step()` to document phases within complex, multi-step user journeys. Step labels SHOULD describe the user action or test phase, not the implementation.

**Evidence:** [calcom-e2e] (multi-step booking flows with labeled steps), Playwright test.step docs

**Alternatives:**
- Comments instead of steps: `// Step 1: Select date` — Lighter weight but does not appear in reports or trace viewer
- Separate tests instead of steps: Split the journey into individual tests — Better isolation but may miss integration between steps

**Anti-patterns:**
- Steps that describe implementation: `await test.step('click button', ...)` — Too granular
- Numbered steps without context: `await test.step('Step 1', ...)` — Add meaning
- Steps for every single action (one step per click/fill) — Steps should group related actions into logical phases

### N2.4 Limit describe nesting to 2 levels for most suites

**Recommendation:** Keep `test.describe` nesting to 2 levels (feature > scenario) for most suites. 3-level nesting (feature > context > scenario) is appropriate only for complex applications with role-based access patterns.

**Evidence:**
- 1 level (flat): [freecodecamp-e2e, immich-e2e] — single describe per file
- 2 levels (standard): [calcom-e2e, grafana-e2e] — feature > scenario
- 3 levels (deep): [grafana-e2e] — feature > role/context > scenario (e.g., Dashboard > with viewer role > should see read-only panels)

**Alternatives:**
- No nesting: Flat file with all tests at top level — Acceptable for small files
- Deep nesting (3+): Only when role-based or conditional grouping is needed

**Anti-patterns:**
- 4+ levels of nesting (readability degrades)
- Nesting for indentation aesthetics rather than logical grouping
- Inconsistent nesting depth across the same project

---

## N3. POM Naming

### N3.1 Use PascalCase + `Page` suffix for page object classes

**Recommendation:** Page object classes SHOULD use PascalCase with a `Page` suffix: `DashboardPage`, `LoginPage`, `BookingFlowPage`, `PanelEditPage`.

**Evidence:** Universal across all Gold suites with POM patterns [grafana-e2e, calcom-e2e, affine-e2e, grafana-plugin-e2e, freecodecamp-e2e]

**Alternatives:**
- Non-page component objects: Drop the `Page` suffix for reusable components: `DatePicker`, `Modal`, `Sidebar` [calcom-e2e, slate-e2e]
- Flow objects: Use a `Flow` suffix for multi-page journeys: `BookingFlow`, `OnboardingFlow` [calcom-e2e]
- Actor objects: Use role names instead of `Page` suffix when using the actor-based POM pattern (Variant F): `ShopAdmin`, `ShopCustomer` [shopware-acceptance-test-suite]. Valid when the role is the primary organizational unit, not the page.

**Anti-patterns:**
- Lowercase or camelCase class names: `dashboardPage`, `dashboard_page`
- Missing suffix: `Dashboard` (ambiguous — is it a page object or a data model?)
- `PO` or `PageObject` suffix: `DashboardPO`, `DashboardPageObject` — Verbose; not observed in Gold suites

### N3.2 Use verb+target naming for POM methods

**Recommendation:** POM methods SHOULD follow a verb+target pattern:

| Category | Pattern | Examples |
|----------|---------|----------|
| Navigation | `goto()` | `dashboardPage.goto('/d/abc')` |
| Actions | verb + target | `fillUsername()`, `clickSubmit()`, `selectDate()` |
| Assertions | `verify*()` or `expect*()` | `verifyDashboardLoaded()`, `expectPanelVisible()` |
| Getters | property or `get*()` | `getTitle()`, `panelTitle` |
| Waiters | `waitFor*()` | `waitForLoad()`, `waitForPanelData()` |

**Evidence:** [grafana-e2e] (verb+target actions), [calcom-e2e] (verb+target booking methods), [grafana-plugin-e2e] (getter properties), Playwright POM guide (`goto()`)

**Alternatives:**
- `goTo()` (camelCase 'T') instead of `goto()` — Some suites prefer this; Playwright docs use `goto()`
- Fluent/chaining API: `page.dashboard().panel(0).edit()` — Not observed in Gold suites; adds complexity

**Anti-patterns:**
- Generic method names: `doAction()`, `handleClick()`, `process()`
- Methods that do too many things: `setupAndVerifyDashboard()` — Split into `setup()` and `verify()`
- Exposing locators as public properties without action methods (breaks encapsulation)

### N3.3 Use descriptive locator variable names in POMs

**Recommendation:** Locator variable names within POMs SHOULD reflect the UI element's purpose, not its implementation:

```typescript
// GOOD: Purpose-oriented
readonly submitButton = this.page.getByRole('button', { name: 'Submit' });
readonly emailField = this.page.getByLabel('Email address');
readonly dashboardHeading = this.page.getByRole('heading', { name: 'Dashboard' });

// AVOID: Implementation-oriented
readonly btn1 = this.page.locator('.btn-primary');
readonly input = this.page.locator('#email');
```

**Evidence:** [calcom-e2e] (descriptive locator names), [grafana-plugin-e2e] (semantic locator naming), [freecodecamp-e2e contributor guide] (recommends semantic naming)

**Alternatives:**
- Computed locator methods: `getPanel(index: number)` — Better for dynamic elements than static properties

**Anti-patterns:**
- Single-letter or abbreviated names: `const btn`, `const inp`, `const el`
- Names that reference CSS selectors: `const primaryButton` (tied to `.btn-primary` class)
- Exposing raw CSS selectors as string constants

### N3.4 Inject POMs as fixtures using camelCase names

**Recommendation:** When using the fixture-based POM pattern (recommended), inject POM instances via `test.extend()` using camelCase names that match the class name:

```typescript
const test = base.extend<{ dashboardPage: DashboardPage }>({
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});
```

**Evidence:** [grafana-plugin-e2e] (published fixture package with `datasourcePage`, `panelEditPage`), [calcom-e2e] (fixture-injected POMs)

**Alternatives:**
- Constructor-based POM: `const dashboard = new DashboardPage(page)` in each test — Simpler but repetitive; no automatic cleanup

**Anti-patterns:**
- PascalCase fixture names: `DashboardPage` as fixture name conflicts with the class name
- Prefixed fixture names: `pomDashboard`, `pageDashboard` — Unnecessary; camelCase is sufficient

---

## N4. Fixture Naming

### N4.1 Use camelCase noun-centric names for fixtures

**Recommendation:** Fixture names SHOULD be camelCase and describe the resource they provide:
- Page fixtures: `authenticatedPage`, `adminPage`, `mobilePage`
- Service fixtures: `apiClient`, `dbConnection`, `mailServer`
- Data fixtures: `testUser`, `bookingData`, `seedData`

**Evidence:** [grafana-plugin-e2e] (`datasourcePage`, `panelEditPage`), [calcom-e2e] (`bookingsPage`, `users`), [boilerplate-playwright-ts]

**Alternatives:**
- Verb-prefixed for factory fixtures: `createUser`, `generateBooking` — Valid for fixtures that create resources on-the-fly [calcom-e2e]

**Anti-patterns:**
- PascalCase fixture names: `DashboardPage` — Reserve PascalCase for class names
- snake_case fixture names: `dashboard_page` — Not TypeScript convention
- Overly generic names: `data`, `page2`, `stuff`
- No naming convention to distinguish worker-scoped from test-scoped fixtures (this is a known gap — Playwright provides no mechanism for this)

### N4.2 Use descriptive option names for fixture options

**Recommendation:** Fixture option names (configurable via `test.use()`) SHOULD clearly describe what they control:

```typescript
type MyOptions = {
  defaultUserRole: 'admin' | 'viewer' | 'editor';
  baseURL: string;
  enableFeatureFlags: boolean;
};
```

**Evidence:** [grafana-plugin-e2e] (options for Grafana version, feature toggles), [calcom-e2e] (per-project fixture options)

**Alternatives:**
- Shorter names acceptable for well-known concepts: `locale`, `viewport`, `storageState` (Playwright built-in conventions)

**Anti-patterns:**
- Abbreviated option names: `role`, `url`, `ff` — Ambiguous without context
- Boolean options without verb prefix: `featureFlags` vs `enableFeatureFlags` — Prefer verb prefix for clarity

### N4.3 Use verb prefix for factory fixtures

**Recommendation:** Fixtures that create or generate resources SHOULD use a verb prefix to distinguish them from provider fixtures:

| Fixture Type | Pattern | Examples |
|-------------|---------|----------|
| Provider (gives access) | noun | `dashboardPage`, `apiClient`, `testUser` |
| Factory (creates new) | verb + noun | `createUser`, `generateBooking`, `seedDatabase` |

**Evidence:** [calcom-e2e] (factory fixtures for booking creation), [grafana-e2e] (provider fixtures for page access)

**Alternatives:**
- All fixtures as nouns regardless of type — Simpler but loses the create/provide distinction

**Anti-patterns:**
- Factory fixtures named as nouns: `user` (does it create a new user or provide an existing one?)
- Provider fixtures with verb prefix: `getPage` (misleading — fixtures don't "get", they provide)

---

## N5. Tag/Annotation Conventions

### N5.1 Use built-in annotations for test lifecycle status

**Recommendation:** Use Playwright's built-in annotations for test status:

| Annotation | Purpose | Usage |
|-----------|---------|-------|
| `test.skip(condition, 'reason')` | Temporarily disabled | Always include a reason string |
| `test.fixme('description')` | Known broken, intent to fix | Link to issue tracker when possible |
| `test.slow()` | Needs longer timeout (3x) | For legitimately slow tests, not flaky ones |
| `test.fail()` | Expected to fail | For regression detection |

**Evidence:**
- `test.skip`: 10/10 Gold suites
- `test.fixme`: 3/10 [grafana-e2e, calcom-e2e, affine-e2e]
- `test.slow`: 2/10 [grafana-e2e, calcom-e2e]
- `test.fail`: 1/10 [grafana-e2e]

**Alternatives:**
- Comments: `// TODO: fix this test` — Less visible than `test.fixme()`; does not appear in reports
- Skip without reason: `test.skip()` — Allowed but loses context

**Anti-patterns:**
- Using `test.skip` for permanently disabled tests (delete the test or track with an issue)
- Using `test.slow()` to mask flaky tests (fix the root cause)
- Using `test.fail()` without tracking the underlying bug

### N5.2 Use tags for cross-cutting categorization (emerging)

**Recommendation:** Teams that need runtime filtering beyond projects SHOULD use the Playwright v1.42+ tag syntax:

```typescript
test.describe('Dashboard', { tag: ['@smoke', '@dashboards'] }, () => {
  test('should display panels', async ({ page }) => { /* ... */ });
});

// Run tagged tests: npx playwright test --grep @smoke
```

**Evidence:** [grafana-e2e] (tag usage with `@dashboards`), Playwright v1.42 release notes

**Recommended tag conventions:**
- `@smoke` — Minimal verification of core functionality
- `@regression` — Full suite marker (less useful since regression is the default)
- `@critical` — Critical user journey tests
- `@slow` — Tests known to be slow (complement to `test.slow()` for filtering)
- `@[feature]` — Feature-specific tags: `@dashboards`, `@auth`, `@booking`

**Alternatives:**
- Project-based categorization instead of tags — Currently dominant (9/10 Gold suites)
- `--grep` on test names: `npx playwright test --grep "Dashboard"` — Works without tags

**Anti-patterns:**
- Over-tagging: Every test gets 5+ tags (diminishes value)
- Tags that duplicate project names (redundant)
- Tags without a corresponding `--grep` usage in CI (dead metadata)

### N5.3 Use `--grep` and `--grep-invert` for runtime filtering

**Recommendation:** Use `--grep` to run test subsets and `--grep-invert` to exclude tests from CI runs:

```bash
# Run only smoke-tagged tests
npx playwright test --grep @smoke

# Exclude known-flaky tests from CI
npx playwright test --grep-invert @flaky
```

**Evidence:** [freecodecamp-e2e] (`--grep-invert` to exclude known-flaky tests), Playwright CLI docs

**Alternatives:**
- Separate projects for each test category — More config overhead but more control
- Test file organization: Place smoke tests in `tests/smoke/` directory — Works with `testDir` per project

**Anti-patterns:**
- Relying solely on grep for test organization (fragile — depends on naming consistency)
- Using `--grep` patterns that match unintended tests (e.g., `--grep "test"` matches everything)

### N5.4 Document custom annotations in project README

**Recommendation:** If a project uses custom annotations or tags beyond the built-in set, document them in the project README or a `TESTING.md` file:

```markdown
## Test Tags
- `@smoke` — Run with `--grep @smoke` for post-deploy verification (< 5 min)
- `@critical` — Critical user journeys that must never break
- `@slow` — Tests requiring extended timeout (> 30s)
```

**Evidence:** [grafana-e2e] (documents tag conventions in README), [freecodecamp-e2e] (contributor guide documents test conventions)

**Alternatives:**
- Inline comments in config file: Document tag meanings where `--grep` is configured
- No documentation: Acceptable for small teams with shared context

**Anti-patterns:**
- Undocumented custom tags that only the original author understands
- Tags that mean different things to different team members

---

## N6. Test Categorization Taxonomy

### N6.1 Use projects as the primary categorization mechanism

**Recommendation:** Playwright projects SHOULD be the primary mechanism for test categorization. Each project can have its own config (testDir, timeout, dependencies, browser):

| Project Type | Naming Pattern | Examples |
|-------------|---------------|----------|
| Browser | Browser name | `'chromium'`, `'firefox'`, `'webkit'` |
| Role | Role name | `'admin'`, `'viewer'`, `'editor'` |
| Application | App name | `'@calcom/web'`, `'app-store'`, `'embed'` |
| Lifecycle | Phase name | `'auth setup'`, `'authenticate'` |
| Feature | Feature name | `'dashboards'`, `'alerting'` |
| Device | Device name | `'Mobile Chrome'`, `'Mobile Safari'` |

**Evidence:** [calcom-e2e] (7 named projects by app), [grafana-e2e] (30+ projects by feature and role), [immich-e2e] (web vs. ui vs. maintenance projects), [freecodecamp-e2e] (browser + device projects)

**Alternatives:**
- Tags for categorization: Viable complement to projects, especially for cross-cutting categories like `@smoke`
- Directory-based categorization: Place tests in `tests/smoke/`, `tests/regression/` — Simpler but less flexible

**Anti-patterns:**
- Overloading a single project with all tests (loses the benefits of project isolation)
- Creating projects for one-off test configurations (use `test.use()` in a describe block instead)
- Project names that don't convey their purpose: `'project1'`, `'p2'`, `'misc'`

### N6.2 Use standard test category terminology

**Recommendation:** Use these standard terms consistently across the project:

| Category | Definition | Implementation |
|----------|-----------|----------------|
| **Smoke test** | Minimal, fast subset verifying core functionality works (5-15 min) | Tag `@smoke` or dedicated project |
| **Regression test** | Full suite verifying no existing behavior broke | Default `npx playwright test` execution |
| **Critical path** | Tests covering the primary user journey that must never break | Tag `@critical` or dedicated project |
| **Happy path** | Tests with valid inputs and expected outcomes | Default test type (80%+ of tests) |
| **Negative test** | Tests verifying correct handling of invalid inputs and error conditions | Explicitly named: "should show error when..." |
| **Edge case** | Tests for boundary conditions or unusual inputs | Present but typically not tagged separately |
| **E2E test** | Full user journey through real application (browser-driven) | Default meaning of Playwright tests |
| **Integration test** | Test spanning multiple services/APIs, may not include UI | Tests using `request` fixture without `page` |

**Evidence:** All Gold suites use these categories implicitly. [freecodecamp-e2e] (grep-based smoke filtering), [grafana-e2e] (CUJS = Critical User Journey Suite), [calcom-e2e] (booking flow as critical path), [immich-e2e] (API integration tests)

**Alternatives:**
- BDD terminology: "feature", "scenario", "given/when/then" — Not observed in Gold suites
- Custom taxonomy: Teams may define their own categories — Document them per N5.4

**Anti-patterns:**
- Using "regression test" to mean "a test for a specific bug" without clarifying (ambiguous — see glossary)
- Using "E2E test" for API-only tests (use "integration test" or "API test")
- Over-categorizing: Every test belongs to exactly one category (most tests are simply "happy path E2E tests")

### N6.3 Use descriptive project names reflecting scope

**Recommendation:** Playwright project names in config SHOULD clearly convey their scope and purpose:

```typescript
// GOOD: Clear, descriptive project names
projects: [
  { name: 'auth setup', testMatch: /auth\.setup\.ts/ },
  { name: 'admin tests', use: { storageState: 'playwright/.auth/admin.json' } },
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'mobile safari', use: { ...devices['iPhone 13'] } },
]
```

**Evidence:** [calcom-e2e] (per-app project names: `'@calcom/web'`, `'app-store'`), [grafana-e2e] (feature-based: `'dashboards'`, `'alerting'`), [immich-e2e] (scope-based: `'web'`, `'api'`)

**Alternatives:**
- Short names: `'admin'`, `'web'` — Acceptable when project count is small
- Namespaced names: `'@calcom/web'` — Useful in monorepos

**Anti-patterns:**
- Numbered project names: `'project1'`, `'p1'`
- Identical names across projects (Playwright allows it but reports become ambiguous)
- Overly long project names that clutter test reports

---

## N7. Data Attribute Conventions

### N7.1 Use `data-testid` as the default test attribute

**Recommendation:** When semantic locators (`getByRole`, `getByText`, `getByLabel`) are insufficient, use `data-testid` as the escape hatch attribute. This is Playwright's default `testIdAttribute`.

**Evidence:** 7/10 Gold suites use `data-testid` [calcom-e2e, grafana-e2e, immich-e2e, excalidraw-e2e, affine-e2e, nextjs-e2e, slate-e2e]

**Alternatives:**
- Custom attribute: `data-playwright-test-label` [freecodecamp-e2e] — Valid; configured via `testIdAttribute` in config
- `data-cy` or `data-test` — Carry-over from Cypress/other frameworks; works but non-standard for Playwright

**Anti-patterns:**
- Using `id` attributes for testing (IDs serve CSS/JS purposes and are fragile)
- Using CSS classes for test selection (classes change with styling refactors)
- Adding `data-testid` to every element (bloats DOM; prefer semantic locators first)

### N7.2 Use kebab-case with `[scope]-[element]-[qualifier]` structure

**Recommendation:** `data-testid` values SHOULD follow a kebab-case pattern with optional structure:

```
[scope]-[element]-[qualifier]

Examples:
  booking-form-submit        (scope: booking, element: form, qualifier: submit)
  search-input               (scope: search, element: input)
  dashboard-panel-title      (scope: dashboard, element: panel, qualifier: title)
  user-menu-dropdown         (scope: user, element: menu, qualifier: dropdown)
```

**Evidence:** [calcom-e2e] (component-scoped testids), [grafana-e2e] (panel-scoped testids), [immich-e2e] (feature-scoped testids)

**Alternatives:**
- Flat naming: `submit-button`, `email-input` — Simpler but less organized at scale
- Dot notation: `booking.form.submit` — Not observed in Gold suites; works but unconventional

**Anti-patterns:**
- camelCase values: `bookingFormSubmit` — Inconsistent with HTML attribute convention
- Overly long IDs: `main-dashboard-left-sidebar-navigation-menu-item-settings-link`
- Dynamic testids without a stable prefix: `item-${uuid}` (use `item-0`, `item-1` or filter with `locator('[data-testid^="item-"]')`)

### N7.3 Prefer semantic locators over data-testid

**Recommendation:** Follow the locator priority hierarchy — use `data-testid` only when semantic locators are truly insufficient:

1. `getByRole()` — Most semantic, accessibility-aligned (PREFERRED)
2. `getByText()` — User-visible text
3. `getByLabel()` — Form labels
4. `getByPlaceholder()` — Input placeholders
5. `getByTestId()` — Explicit test attribute (LAST RESORT)

**Evidence:** Playwright official docs (locator priority), [freecodecamp-e2e contributor guide] (recommends semantic first), [eslint-plugin-playwright] (`prefer-native-locators` rule)

**Reality check:** Despite this being the official recommendation, `data-testid` dominates actual practice in 7/10 Gold suites. This is the most notable gap between official guidance and observed practice. Teams should aspire to semantic locators while acknowledging `data-testid` as a pragmatic fallback.

**Anti-patterns:**
- Defaulting to `data-testid` without trying semantic locators first
- Using `page.locator()` with CSS selectors when `getByRole()` would work
- Mixing locator strategies within the same page object (e.g., some methods use `getByRole`, others use CSS)

---

## N8. Common Pitfalls

### Pitfall 1: "Selector" vs "Locator" — Deprecated Term Usage

**Issue:** "Selector" was Playwright's term before v1.14. Since v1.14, "locator" is the correct term for the Playwright object. "Selector" now refers only to the CSS/XPath string passed to `page.locator()`.

**Correct usage:**
- "Use a locator to find the button" (the Playwright Locator object)
- "Pass a CSS selector to `page.locator()`" (the string)

**Incorrect usage:**
- "Use a selector to find the button" (ambiguous — do you mean the string or the object?)

**Evidence:** Playwright v1.14 changelog; Playwright API docs; `eslint-plugin-playwright` rule names use "locator"

### Pitfall 2: "Fixture" Cross-Framework Confusion

**Issue:** "Fixture" means fundamentally different things across frameworks:
- **Playwright:** Dependency injection via `test.extend()` — provides objects with lifecycle management
- **Cypress:** Static JSON data file loaded via `cy.fixture()` — completely different concept
- **pytest:** Function providing test dependencies — similar to Playwright but different scoping
- **Generic QA:** Test data, test environment, or preconditions

**Recommendation:** Always say "Playwright fixture" when precision is needed. Use "test data" for static data files. Never assume cross-framework audiences share your definition.

**Evidence:** All frameworks' documentation; common confusion reported in migration guides

### Pitfall 3: "Flaky" as Diagnosis vs Symptom

**Issue:** "Flaky test" is widely used but ambiguous. It describes a symptom (intermittent failure) not a cause. The term often prevents root cause analysis because the test gets labeled "flaky" and deprioritized.

**Better vocabulary:**
- "This test has a race condition" (specific cause)
- "This test depends on test execution order" (specific cause)
- "This test has a timing-dependent assertion" (specific cause)
- "This test fails intermittently — investigating root cause" (honest status)

**Evidence:** [grafana-e2e] (tracks flaky tests with specific causes), [freecodecamp-e2e] (`--grep-invert` to exclude failing tests with tracking)

### Pitfall 4: "Worker" Confusion with Web/Service Workers

**Issue:** In Playwright context, "worker" always means a test runner process (OS-level). This is unrelated to Web Workers or Service Workers (browser APIs). Cross-domain conversations frequently confuse these.

**Recommendation:** In Playwright documentation, "worker" means test runner process. If discussing browser workers in a Playwright context, always prefix: "Web Worker", "Service Worker."

**Evidence:** Playwright Parallelism docs; observed confusion in community forums

### Pitfall 5: "Project" Overloading

**Issue:** In `playwright.config.ts`, "project" has a specific meaning: a named test configuration object. In general software, "project" means the repository or codebase. In conversations about Playwright, "project" almost always means the config entry, but new team members may be confused.

**Recommendation:** In config discussions, "Playwright project" or just "project" is clear. When both meanings might apply, disambiguate: "the Playwright project config" vs "the repository."

**Evidence:** Playwright Configuration docs; 10/10 Gold suites define multiple projects

---

## Revision History

| Date | Change | Basis |
|---|---|---|
| 2026-03-18 | Initial PRELIMINARY draft from landscape rounds 1-12 | 10 Gold suites, ~97 total sources |
| 2026-03-18 | DEFINITIVE version: expanded from 5 to 8 sections, 30 standards + 5 pitfalls | Rounds 1-46, 10 Gold suites, Playwright v1.50 docs |
| 2026-03-18 | **FINAL version** from cross-validation rounds 47-55 | Added actor naming convention alternative to N3.1; 0 standards reversed |
