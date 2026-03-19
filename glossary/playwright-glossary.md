# Playwright Automation Glossary

A reference glossary of Playwright-specific and testing terminology, built from analysis of 10 Gold-standard production suites, Playwright official documentation (v1.50), and community sources across 44 research rounds.

**Status:** FINAL — validated in Rounds 45-46. All 42 entries verified against 10 Gold suites and Playwright v1.50 docs. No definition changes from initial population; four minor gaps addressed (setup project disambiguation, globalSetup distinction, testMatch note, flaky test clarification).

---

## Core API Terms

### Browser
**Definition:** An instance of Chromium, Firefox, or WebKit launched by Playwright. Manages one or more BrowserContexts.
**Context:** Rarely referenced directly in tests. The test runner creates and manages Browser instances per worker. Most test code interacts with Page, not Browser.
**Example:**
```typescript
// Typically implicit — the runner handles this
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
```
**Related terms:** BrowserContext, Page, Worker
**Evidence:** Playwright API docs; 10/10 Gold suites use implicitly via runner.

---

### BrowserContext
**Definition:** An isolated browser session with its own cookies, localStorage, and permissions. Equivalent to an incognito profile. Each test gets a fresh BrowserContext by default.
**Context:** The isolation boundary in Playwright. Tests in the same worker share a Browser but get separate BrowserContexts. StorageState serializes and restores a BrowserContext's auth state.
**Example:**
```typescript
// New context with specific options
const context = await browser.newContext({
  storageState: 'playwright/.auth/admin.json',
  viewport: { width: 1280, height: 720 }
});

// Access cookies
const cookies = await context.cookies();
```
**Alternatives:** Cypress has no direct equivalent (uses spec-level isolation). Selenium uses "session."
**Related terms:** Page, StorageState, Browser
**Evidence:** Playwright BrowserContext docs; [grafana-e2e] (multi-context RBAC), [calcom-e2e] (storageState per role).

---

### Page
**Definition:** A single browser tab or popup within a BrowserContext. The primary surface for test interactions — clicking, typing, navigating, and asserting.
**Context:** Every `@playwright/test` test receives a `page` fixture by default. Page provides locator methods (`getByRole`, `getByText`, `locator`), navigation (`goto`), and network interception (`route`).
**Example:**
```typescript
test('should display dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```
**Related terms:** BrowserContext, Frame, Locator
**Evidence:** Universal — 10/10 Gold suites use `page` as primary interaction surface.

---

### Frame
**Definition:** An iframe or child frame within a Page. Frames have their own DOM and execution context. Playwright can interact with frames using `page.frame()` or `page.frameLocator()`.
**Context:** Used for testing embedded content (iframes, third-party widgets, cross-origin embeds). Less common than direct Page interaction.
**Example:**
```typescript
const frame = page.frameLocator('#embed-iframe');
await frame.getByRole('button', { name: 'Submit' }).click();
```
**Related terms:** Page, Locator
**Evidence:** Playwright Frame docs; [calcom-e2e] (embed testing across frames).

---

### Locator
**Definition:** A way to find element(s) on a page. Locators are strict (fail if matching multiple elements unless explicitly filtering), auto-wait for elements to be actionable, and auto-retry on assertions. Introduced in Playwright v1.14 to replace the older ElementHandle API.
**Context:** The recommended way to interact with DOM elements. Locators are lazy — they don't query the DOM until an action or assertion is performed. This makes them resilient to DOM changes between creation and use.
**Example:**
```typescript
// Semantic locators (preferred)
page.getByRole('button', { name: 'Submit' })
page.getByText('Welcome back')
page.getByLabel('Email address')
page.getByTestId('booking-form')

// CSS/XPath locator (when semantic locators are insufficient)
page.locator('.dashboard-panel >> nth=0')
```
**Alternatives:** Cypress uses `cy.get()` (CSS-only). Selenium uses `findElement()` with `By` selectors. "Selector" was Playwright's pre-v1.14 term and now refers only to the CSS/XPath string.
**Related terms:** getByRole, getByText, getByTestId, Page, Web-first assertion
**Evidence:** Playwright Locator docs; 10/10 Gold suites use locators.

---

### Route
**Definition:** An intercepted network request. `page.route()` registers a handler for requests matching a URL pattern, enabling mocking, modification, or blocking of network traffic.
**Context:** Used for API mocking, simulating error responses, blocking third-party scripts, and testing offline behavior. Not to be confused with application URL routing.
**Example:**
```typescript
// Mock an API endpoint
await page.route('**/api/users', route => {
  route.fulfill({ json: [{ id: 1, name: 'Test User' }] });
});

// Block analytics
await page.route('**/*analytics*', route => route.abort());
```
**Alternatives:** Cypress uses `cy.intercept()`. Selenium has no built-in equivalent.
**Related terms:** Page, Request, Response
**Evidence:** Playwright Route docs; [grafana-e2e] (data source mocking), [calcom-e2e] (API stubbing).

---

### StorageState
**Definition:** A serialized snapshot of a BrowserContext's cookies and localStorage. Saved as a JSON file and loaded into new contexts to restore authentication state without re-logging in.
**Context:** The canonical Playwright pattern for auth reuse. A setup project logs in once, saves storageState to a file (e.g., `playwright/.auth/admin.json`), and subsequent projects load that file. This avoids repeating login flows in every test.
**Example:**
```typescript
// Save storage state (in setup project)
await page.context().storageState({ path: 'playwright/.auth/admin.json' });

// Load storage state (in config)
{
  name: 'admin tests',
  use: { storageState: 'playwright/.auth/admin.json' },
  dependencies: ['auth setup'],
}
```
**Alternatives:** Cypress has no direct equivalent (uses `cy.session()`). Selenium requires manual cookie management.
**Related terms:** BrowserContext, Project, Fixture
**Evidence:** Playwright Auth docs; [grafana-e2e] (multi-role storageState), [calcom-e2e], [grafana-plugin-e2e].

---

### Trace
**Definition:** A recorded timeline of test execution including actions, screenshots, network requests, console logs, and DOM snapshots. Viewed in Playwright's Trace Viewer (a local web app).
**Context:** The primary debugging tool for failed tests. Configured via `trace: 'on-first-retry'` (default) or `trace: 'on'` in config. Trace files are `.zip` archives attached as CI artifacts.
**Example:**
```typescript
// In playwright.config.ts
use: {
  trace: 'on-first-retry', // Record trace only on first retry of failed tests
}
```
**Related terms:** BrowserContext, Page
**Evidence:** Playwright Tracing docs; 8/10 Gold suites configure trace recording.

---

### Request (APIRequestContext)
**Definition:** An API client for making HTTP requests without a browser. Created via `playwright.request.newContext()` or injected as the `request` fixture. Supports all HTTP methods and shares cookies/headers with the browser context.
**Context:** Used for API testing, test data setup (creating users, seeding databases), and authentication via REST endpoints. Responses can be validated with `expect(response).toBeOK()`.
**Example:**
```typescript
test('should create user via API', async ({ request }) => {
  const response = await request.post('/api/users', {
    data: { name: 'Test User', email: 'test@example.com' }
  });
  await expect(response).toBeOK();
});
```
**Related terms:** Route, Response, StorageState
**Evidence:** Playwright API Testing docs; [immich-e2e] (API-heavy testing), [supabase-e2e].

---

### Dialog
**Definition:** A browser dialog (alert, confirm, prompt, beforeunload). Playwright auto-dismisses dialogs unless a handler is registered via `page.on('dialog', handler)`.
**Context:** Must register the handler before the action that triggers the dialog. Unhandled dialogs are dismissed automatically.
**Example:**
```typescript
page.on('dialog', dialog => dialog.accept());
await page.getByRole('button', { name: 'Delete' }).click();
```
**Related terms:** Page
**Evidence:** Playwright Dialog docs.

---

## Test Organization Terms

### test
**Definition:** Declares a single test case. The fundamental unit of the `@playwright/test` runner. Accepts a name string and an async function that receives fixtures as destructured parameters.
**Context:** Each `test()` call runs in its own BrowserContext (by default). Tests are the unit of parallelism, retry, and reporting.
**Example:**
```typescript
test('should create a new booking', async ({ page }) => {
  await page.goto('/bookings/new');
  // ... test body
});
```
**Related terms:** test.describe, test.step, Fixture
**Evidence:** Universal — every Gold suite uses `test()`.

---

### test.describe
**Definition:** Groups related tests into a block. Supports nesting. Describes share beforeAll/afterAll hooks and can apply shared configuration via `test.use()`.
**Context:** Naming strategies vary: feature name (`'Dashboard'`), page name (`'Booking Page'`), or capability (`'Authentication'`). Nesting depth ranges from 1 (flat) to 3 levels in Gold suites.
**Example:**
```typescript
test.describe('Dashboard', () => {
  test.describe('with admin role', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('should see all panels', async ({ page }) => { /* ... */ });
    test('should edit panel titles', async ({ page }) => { /* ... */ });
  });
});
```
**Related terms:** test, test.use, test.beforeAll
**Evidence:** 10/10 Gold suites; [grafana-e2e] (3-level nesting), [calcom-e2e] (2-level).

---

### test.step
**Definition:** A named sub-section within a test. Steps appear in the HTML report and trace viewer, making long tests more readable. Steps can be nested.
**Context:** Used for documenting phases of a multi-step user journey within a single test. Does not affect test isolation or retry behavior.
**Example:**
```typescript
test('complete booking flow', async ({ page }) => {
  await test.step('select date and time', async () => {
    await page.getByRole('button', { name: 'Next week' }).click();
    await page.getByText('10:00 AM').click();
  });

  await test.step('fill attendee details', async () => {
    await page.getByLabel('Name').fill('John Doe');
    await page.getByLabel('Email').fill('john@example.com');
  });
});
```
**Related terms:** test, Trace
**Evidence:** Playwright test.step docs; [calcom-e2e] (multi-step booking flows).

---

### test.beforeAll / test.afterAll
**Definition:** Hooks that run once before/after all tests in a `test.describe` block (or file if no describe). Worker-scoped — they run once per worker, not once per test.
**Context:** Used for expensive setup (database seeding, auth) that should not repeat per test. Contrast with `test.beforeEach`/`test.afterEach` which run per test.
**Example:**
```typescript
test.beforeAll(async ({ request }) => {
  await request.post('/api/seed', { data: { scenario: 'dashboard-tests' } });
});
```
**Related terms:** test.beforeEach, Fixture, Worker
**Evidence:** Playwright hooks docs; [grafana-e2e] (auth setup), [immich-e2e] (data seeding).

---

### test.skip / test.fixme / test.slow / test.fail
**Definition:** Built-in test annotations that modify test behavior.
- `test.skip()` — Marks a test as skipped. Can be conditional: `test.skip(condition, 'reason')`.
- `test.fixme()` — Marks a test as known-broken. Same as skip but signals intent to fix.
- `test.slow()` — Triples the test timeout.
- `test.fail()` — Expects the test to fail. The test passes if it fails, and fails if it passes.

**Context:** These are the primary test lifecycle annotations. `test.skip` is universal (10/10 Gold suites). `test.fixme` and `test.slow` see moderate adoption. `test.fail` is rare but useful for regression detection.
**Example:**
```typescript
test('should handle edge case', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit does not support this feature yet');
  // ... test body
});

test.fixme('flaky timezone conversion', async ({ page }) => {
  // Known issue — fix tracked in #1234
});
```
**Related terms:** test, Tag
**Evidence:** 10/10 Gold suites use `test.skip`; [grafana-e2e] (`test.fixme` for feature flags), [calcom-e2e] (`test.skip` with TODO comments).

---

## Configuration Terms

### Project
**Definition:** A named test configuration object in `playwright.config.ts`. Each project defines a combination of browser, viewport, auth state, test directory, timeout, and other options. Tests run once per matching project.
**Context:** Projects enable matrix testing (same tests across browsers), role-based testing (admin vs. viewer), and lifecycle management (setup projects that run first). The `dependencies` property creates execution order between projects.
**Example:**
```typescript
// In playwright.config.ts
projects: [
  { name: 'auth setup', testMatch: /auth\.setup\.ts/ },
  {
    name: 'admin tests',
    use: { storageState: 'playwright/.auth/admin.json' },
    dependencies: ['auth setup'],
  },
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
]
```
**Alternatives:** In general software, "project" means the repository or codebase. In Playwright, it specifically means a config entry.
**Disambiguation — Setup Project vs Global Setup:** A "setup project" is a Playwright project with `dependencies` that runs setup files (e.g., auth) before other projects — it supports retries and parallel execution. `globalSetup` is a config-level function that runs once before all workers — it does not support Playwright's retry mechanism. Use setup projects for auth; use `globalSetup` for environment startup (e.g., starting a dev server).
**Related terms:** Worker, Fixture, StorageState
**Evidence:** 10/10 Gold suites define projects; range from 2 (Playwright) to 31 (Grafana). Setup project pattern: [grafana-e2e], [calcom-e2e], [immich-e2e]. GlobalSetup pattern: [nextjs-e2e].

---

### Worker
**Definition:** An operating system process that runs a subset of tests in parallel. Each worker has its own Browser instance and state. Multiple workers enable parallel test execution.
**Context:** Configured via `workers` in config (e.g., `workers: process.env.CI ? 1 : undefined`). Worker count determines parallelism. Worker-scoped fixtures (`{ scope: 'worker' }`) are shared across all tests in a worker.
**Example:**
```typescript
// In playwright.config.ts
workers: process.env.CI ? 1 : undefined, // 1 worker in CI, auto-detect locally
```
**Alternatives:** Not to be confused with Web Workers or Service Workers (browser APIs). Cypress Cloud uses "machines" for parallel distribution.
**Related terms:** Shard, Fixture, fullyParallel
**Evidence:** Playwright Parallelism docs; all Gold suites configure workers.

---

### Shard
**Definition:** A partition of the full test suite for distributed execution across multiple CI machines. Each machine runs one shard (e.g., `--shard=1/3` runs the first third of tests).
**Context:** Sharding is the CI-level parallelism mechanism (distributing across machines), while workers provide process-level parallelism (within one machine). Optimal pattern: sharding for machine distribution, workers for per-machine parallelism.
**Example:**
```bash
# CI matrix: 3 machines, each running one shard
npx playwright test --shard=1/3  # Machine 1
npx playwright test --shard=2/3  # Machine 2
npx playwright test --shard=3/3  # Machine 3
```
**Related terms:** Worker, Project
**Evidence:** Playwright Sharding docs; [affine-e2e] (5 shards), [calcom-e2e] (CI sharding), [grafana-e2e].

---

### Fixture
**Definition:** A named object provided to tests via `test.extend()`. Fixtures have automatic setup and teardown lifecycle managed by the framework. They can be test-scoped (fresh per test) or worker-scoped (shared per worker).
**Context:** Playwright's dependency injection mechanism. Built-in fixtures include `page`, `context`, `browser`, `request`. Custom fixtures extend the test function to provide domain-specific objects (e.g., `authenticatedPage`, `datasourcePage`).
**Example:**
```typescript
// Define custom fixture
const test = base.extend<{ adminPage: Page }>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/admin.json'
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

// Use in test
test('admin can see all users', async ({ adminPage }) => {
  await adminPage.goto('/admin/users');
});
```
**Alternatives:**
- **Cypress:** `cy.fixture()` loads a static JSON data file — completely different concept.
- **pytest:** Fixtures are functions providing test dependencies — similar to Playwright but different scoping.
- **Generic QA:** "Test fixture" often means test data or test environment.
**Resolution:** Always say "Playwright fixture" when precision is needed. Use "test data" for static data files.
**Related terms:** test.extend, test.use, Worker, Page
**Evidence:** Playwright Fixtures docs; [grafana-plugin-e2e] (published fixture package), [calcom-e2e] (factory fixtures).

---

### test.extend
**Definition:** Creates a new `test` function with additional custom fixtures. The extended test function can be used exactly like the base `test` but provides extra injected dependencies.
**Context:** The mechanism for building fixture libraries. Grafana's `@grafana/plugin-e2e` publishes an extended test function with domain-specific fixtures. Cal.com defines factory fixtures via `test.extend`.
**Example:**
```typescript
import { test as base } from '@playwright/test';

export const test = base.extend<{ todoPage: TodoPage }>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await use(todoPage);
  },
});
```
**Related terms:** Fixture, test.use
**Evidence:** Playwright test.extend docs; [grafana-plugin-e2e], [calcom-e2e].

---

### test.use
**Definition:** Applies configuration options to all tests in the current scope (file or describe block). Options include storageState, viewport, locale, permissions, and custom fixture values.
**Context:** Used to configure shared state for a group of tests without creating separate projects. Common for role-based testing within a single file.
**Example:**
```typescript
test.describe('admin features', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' });

  test('should manage users', async ({ page }) => { /* ... */ });
});
```
**Related terms:** Project, test.describe, StorageState
**Evidence:** Playwright test.use docs; [grafana-e2e] (per-describe role configuration).

---

### fullyParallel
**Definition:** A configuration flag that enables parallel execution of tests within the same file. When `false` (default), tests in a file run sequentially; tests across files run in parallel.
**Context:** Set at config level or per-project. Most Gold suites enable `fullyParallel: true` for maximum parallelism. Some suites invert for CI stability (Slate: `true` locally, `false` in CI).
**Example:**
```typescript
// In playwright.config.ts
fullyParallel: true, // Tests within a file can run in parallel
```
**Related terms:** Worker, Project
**Evidence:** Playwright Parallelism docs; [slate-e2e] (inverted fullyParallel).

---

## Interaction Terms

### getByRole
**Definition:** A locator method that finds elements by their ARIA role (button, heading, link, textbox, etc.) and accessible name. The most semantic locator method — it queries the accessibility tree, not the DOM structure.
**Context:** Recommended as the primary locator strategy by Playwright docs and Testing Library. Tests what screen readers see. Shared vocabulary with Testing Library (`@testing-library/react`).
**Example:**
```typescript
page.getByRole('button', { name: 'Submit' })
page.getByRole('heading', { level: 1, name: 'Dashboard' })
page.getByRole('textbox', { name: 'Email' })
page.getByRole('link', { name: 'Settings' })
```
**Alternatives:** `page.locator('button')` (CSS), `page.getByText('Submit')` (text content). `getByRole` is preferred because it tests accessibility semantics.
**Related terms:** Locator, getByText, getByLabel, getByTestId
**Evidence:** Playwright Locators docs; Testing Library shared API.

---

### getByTestId
**Definition:** A locator method that finds elements by their `data-testid` attribute (configurable via `testIdAttribute` in config). The escape hatch when semantic locators are insufficient.
**Context:** Despite `getByRole` being the official recommendation, `data-testid` usage dominates in Gold suites (7/10). Used when elements lack semantic roles or when dynamic content makes text/role locators unreliable.
**Example:**
```typescript
// Default: matches data-testid attribute
page.getByTestId('booking-form-submit')

// Custom attribute (freeCodeCamp)
// Config: use: { testIdAttribute: 'data-playwright-test-label' }
page.getByTestId('challenge-output')
```
**Related terms:** Locator, getByRole, Data test attribute
**Evidence:** Playwright getByTestId docs; [calcom-e2e], [grafana-e2e], [freecodecamp-e2e] (custom attribute).

---

## Assertion Terms

### expect
**Definition:** The assertion function provided by `@playwright/test`. When used with a Locator argument, it creates a web-first assertion that auto-retries. When used with a plain value, it creates a generic (non-retrying) assertion.
**Context:** Always `await` web-first assertions: `await expect(locator).toBeVisible()`. Generic assertions do not need `await`: `expect(value).toBe(expected)`. The distinction between web-first and generic assertions is the most impactful quality signal for test reliability.
**Example:**
```typescript
// Web-first (auto-retries) — PREFERRED for UI
await expect(page.getByText('Welcome')).toBeVisible();
await expect(page).toHaveURL('/dashboard');

// Generic (evaluates once) — for computed values
expect(response.status()).toBe(200);
expect(items.length).toBeGreaterThan(0);
```
**Related terms:** Web-first assertion, Soft assertion, Locator
**Evidence:** Playwright Assertions docs; 10/10 Gold suites use `expect`.

---

### Web-first Assertion
**Definition:** An assertion that auto-retries until the condition is met or the timeout expires. Created by passing a Locator (or Page/APIResponse) to `expect()`. The key mechanism preventing race conditions in UI testing.
**Context:** The critical anti-pattern is wrapping a non-retrying method in a generic assertion: `expect(await locator.isVisible()).toBe(true)` evaluates once and can flake. The correct form is `await expect(locator).toBeVisible()` which retries.
**Example:**
```typescript
// CORRECT: web-first, auto-retries
await expect(page.getByText('Saved')).toBeVisible();

// ANTI-PATTERN: generic, evaluates once
expect(await page.getByText('Saved').isVisible()).toBe(true);
```
**Related terms:** expect, Locator, Soft assertion
**Evidence:** Playwright Best Practices; enforced by `eslint-plugin-playwright` rule `prefer-web-first-assertions`.

---

### Soft Assertion
**Definition:** An assertion created with `expect.soft()` that records failures without stopping test execution. All soft assertion failures are reported together at the end of the test.
**Context:** Used for form validation (check all fields at once), table structure verification, and smoke tests. Low adoption in Gold suites — most prefer hard assertions with focused test scope.
**Example:**
```typescript
await expect.soft(page.getByTestId('name-field')).toHaveValue('John');
await expect.soft(page.getByTestId('email-field')).toHaveValue('john@test.com');
await expect.soft(page.getByTestId('phone-field')).toHaveValue('+1234567890');
// All failures reported together
```
**Related terms:** expect, Web-first assertion
**Evidence:** Playwright Assertions docs; low adoption in Gold suites.

---

### Custom Matcher
**Definition:** A domain-specific assertion method added via `expect.extend()`. Multiple matcher sets can be combined with `mergeExpects()`.
**Context:** Grafana's `@grafana/plugin-e2e` publishes 8 custom matchers. Custom matchers should be published as a reusable package for large organizations, not inlined in test files.
**Example:**
```typescript
expect.extend({
  async toHaveAlert(panel, alertName) {
    // Custom assertion logic
  }
});

// Usage
await expect(panel).toHaveAlert('CPU Usage Alert');
```
**Related terms:** expect, Fixture
**Evidence:** [grafana-plugin-e2e] (8 custom matchers); Playwright expect.extend docs.

---

## Design Pattern Terms

### Page Object Model (POM)
**Definition:** A design pattern that encapsulates page interactions in a class. Each page or major component gets its own class with methods for navigation, actions, and assertions. The class constructor typically accepts a `Page` instance.
**Context:** Universal pattern across testing frameworks. In Playwright, two variants exist: class-based POM (traditional, uses `new DashboardPage(page)`) and fixture-based POM (modern, injects POM instances via `test.extend`). Grafana's fixture-based approach is the emerging Gold standard.
**Example:**
```typescript
// Class definition
class DashboardPage {
  constructor(private page: Page) {}

  async goto(uid: string) {
    await this.page.goto(`/d/${uid}`);
  }

  async getPanelTitle(index: number) {
    return this.page.getByTestId(`panel-title-${index}`);
  }
}

// As a fixture (Grafana pattern)
const test = base.extend<{ dashboardPage: DashboardPage }>({
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});
```
**Naming conventions:**
- Class: PascalCase + `Page` suffix (`DashboardPage`, `LoginPage`)
- Methods: verb + target (`goto()`, `fillUsername()`, `clickSubmit()`)
- Fixture: camelCase (`dashboardPage`, `loginPage`)
**Related terms:** Fixture, test.extend, Page
**Evidence:** All Gold suites with POM patterns; Playwright POM guide.

---

### Data Test Attribute
**Definition:** An HTML attribute added to elements specifically for test automation. The convention is `data-testid` (Playwright default), with kebab-case values following a `[scope]-[element]-[qualifier]` pattern.
**Context:** Playwright's `getByTestId()` method queries this attribute. The attribute name is configurable via `testIdAttribute` in config. freeCodeCamp uses `data-playwright-test-label` as a custom alternative.
**Example:**
```html
<button data-testid="booking-form-submit">Book Now</button>
<input data-testid="search-input" />
```
**Related terms:** Locator, getByTestId
**Evidence:** [calcom-e2e] (data-testid), [grafana-e2e] (data-testid), [freecodecamp-e2e] (custom attribute).

---

### Tag
**Definition:** A metadata annotation on a test or describe block, introduced in Playwright v1.42. Tags enable `--grep`-based filtering for selective test execution.
**Context:** Despite being available since late 2024, only 1/10 Gold suites (Grafana) has adopted tags. Most suites use project-based categorization or `--grep` on test names instead. Community conventions include `@smoke`, `@regression`, `@critical`.
**Example:**
```typescript
test.describe('Dashboard', { tag: ['@dashboards', '@smoke'] }, () => {
  test('should display panels', async ({ page }) => { /* ... */ });
});

// Run tagged tests
// npx playwright test --grep @smoke
```
**Related terms:** test.describe, Project
**Evidence:** Playwright v1.42 release notes; [grafana-e2e] (tag usage).

---

## Test Category Terms

### Smoke Test
**Definition:** A minimal, fast-running subset of tests that verify core functionality works after a deployment or code change. Typically runs in 5-15 minutes. In Playwright, implemented as a tagged subset or dedicated project.
**Related terms:** Regression test, Critical path
**Evidence:** Community convention; [freecodecamp-e2e] (grep-based filtering).

---

### Regression Test
**Definition:** (1) Running the full test suite to verify new changes haven't broken existing functionality. (2) A specific test written to guard against a previously fixed bug. Both definitions are valid; context determines meaning.
**Related terms:** Smoke test, E2E test
**Evidence:** Industry standard; default meaning of `npx playwright test` in CI.

---

### Critical Path (Critical User Journey)
**Definition:** Tests covering the primary user journey through an application — the flow that must never break (e.g., login, core action, logout). Grafana uses the term "CUJS" (Critical User Journey Suite) for this concept.
**Related terms:** Smoke test, Happy path
**Evidence:** [grafana-e2e] (CUJS project), [calcom-e2e] (booking flow).

---

### Happy Path
**Definition:** Tests that exercise the intended flow with valid inputs and expected outcomes. The majority of tests in any suite (estimated 80%+ in Gold suites). Contrast with negative tests and edge cases.
**Related terms:** Negative test, Edge case
**Evidence:** All 10 Gold suites; dominant test type.

---

### Negative Test
**Definition:** Tests that verify the application correctly handles invalid inputs, unauthorized access, error conditions, and boundary violations. Often underrepresented compared to happy path tests.
**Example:** Submitting a form with missing required fields, accessing admin pages as a viewer, entering invalid date formats.
**Related terms:** Happy path, Edge case
**Evidence:** [calcom-e2e] (invalid booking), [freecodecamp-e2e] (wrong credentials).

---

### E2E Test (End-to-End Test)
**Definition:** In the Playwright community, a test that exercises a complete user journey through a real (or near-real) application, from UI interaction through backend services. Distinguished from API tests (no UI) and unit/component tests (isolated).
**Alternatives:** In broader industry, sometimes means any test spanning multiple system layers. In Playwright context, E2E specifically means browser-driven user flows.
**Related terms:** Integration test, Smoke test
**Evidence:** The default meaning of all Playwright tests in Gold suites.

---

### Integration Test
**Definition:** In Playwright context, a test combining multiple services or APIs without necessarily involving the browser UI. Typically uses the `request` fixture for API-to-API testing. Distinguished from E2E tests (which include UI) and unit tests (which are isolated).
**Related terms:** E2E test, Request
**Evidence:** [immich-e2e] (API + UI combined), [supabase-e2e] (REST API testing).

---

## Test Anatomy & Coverage Terms

### AAA Pattern (Arrange-Act-Assert)
**Definition:** A test structure pattern where each test is divided into three phases: Arrange (set up preconditions), Act (perform the action under test), and Assert (verify the outcome). In Playwright E2E tests, AAA is a conceptual framework, not a rigid structural rule.
**Context:** Tests under 15 lines achieve ~90% strict AAA compliance. Multi-step E2E flows commonly interleave Act-Assert pairs, where each user action is followed by verification before proceeding to the next step. Fixture-driven Arrange (where fixtures handle all setup) produces the cleanest AAA separation, with test bodies starting directly at the Act phase.
**Example:**
```typescript
// Fixture-driven AAA — test body is pure Act-Assert
test('panel updates after time range change', async ({ dashboardPage, timeRangePicker }) => {
  // Act
  await timeRangePicker.setRange('Last 6 hours');
  // Assert
  await expect(dashboardPage.panel.getByTitle('CPU')).toContainText('6h');
});
```
**Related terms:** Test independence, Guard assertion, Test anatomy
**Evidence:** 15/15 suites exhibit AAA as the dominant test structure [TA1.1]; 8/15 achieve cleanest separation through fixture-driven Arrange [TA1.3].

---

### Coverage Tier
**Definition:** A classification of tests into execution groups based on purpose and time budget. The recommended four tiers are: Smoke (core health check, <5 min), Regression (feature-scoped, <30 min), Comprehensive (full suite, <2 hrs), and Specialized (nightly/scheduled).
**Context:** Coverage tiers are implemented through directory structure and Playwright project definitions, not through priority tags. 11/15 production suites use structural tiering; 0/15 use priority tags as their primary organization. Tags drift from reality because they require per-test maintenance; directory structure is self-documenting.
**Example:**
```
tests/
  smoke/           # Tier 1: 5-10% of tests
  dashboards/      # Tier 2: feature-scoped regression
  bookings/        # Tier 2: feature-scoped regression
  visual/          # Tier 4: specialized, nightly
```
**Related terms:** Structural tiering, Scale tier, Critical user journey
**Evidence:** 11/15 suites use structural tiering [COV2.1]; Grafana (31 projects), Ghost (6+ configs), Cal.com (7 projects).

---

### Critical User Journey (CUJ)
**Definition:** A business-critical workflow that, if broken, would directly impact revenue or core product value. CUJs are the primary unit of E2E coverage measurement, replacing code coverage percentages. Also called "Money Paths."
**Context:** Only 2/15 suites explicitly name CUJ tests (Grafana `dashboard-cujs/`, Ghost publish flow), but 13/15 have implicit CUJs. CUJ tests are typically longer (80-170 lines), use `test.step()` for phase organization, and have higher assertion density (10-20+ assertions). CUJs should have dedicated directories and setup/teardown projects.
**Example:**
```typescript
test('full booking flow', async ({ page }) => {
  await test.step('select event type', async () => { /* ... */ });
  await test.step('choose available slot', async () => { /* ... */ });
  await test.step('fill attendee details', async () => { /* ... */ });
  await test.step('confirm booking', async () => { /* ... */ });
});
```
**Related terms:** Coverage tier, Smoke test, Critical path
**Evidence:** Grafana `dashboard-cujs/` (8 specs), Cal.com booking flow, Ghost publish flow [COV3.1].

---

### Scale Tier
**Definition:** A classification of test suites by size and complexity, determining which organizational and infrastructure patterns are appropriate. Four tiers are defined: Starter (<50 tests), Growing (50-200 tests), Large (200-500 tests), and Enterprise (500+ tests).
**Context:** Each scale tier has distinct organizational requirements. Starter suites need minimal infrastructure; Enterprise suites require CI-level orchestration, selective test execution, and CODEOWNERS. Measurable triggers (test count, CI duration, team size, failure rate) indicate when to transition between tiers.
**Related terms:** Transition trigger, Coverage tier, Execution budget
**Evidence:** Cross-suite analysis across 15 suites with scale ranges from 35 tests (Slate) to 550+ (Next.js) [S8.1-S8.4].

---

### Test Independence
**Definition:** The property that every test produces the same result whether run alone, in parallel with other tests, or in any order. Independent tests do not rely on state created by other tests and do not assume execution order.
**Context:** 14/15 production suites achieve complete test independence. Only Rocket.Chat uses `test.describe.serial()` for inter-test state sharing. Playwright's own documentation states: "Each test should be completely isolated from another test." Test independence enables parallel execution, selective reruns, and reliable failure diagnosis.
**Related terms:** AAA pattern, Test anatomy, Fixture
**Evidence:** 14/15 suites achieve complete independence [TA6.1]; Playwright official docs recommend isolation as default.

---

### Execution Budget
**Definition:** A time-based constraint on how long a coverage tier or CI pipeline stage is allowed to run. Execution budgets ensure test suites provide timely feedback and prevent CI cost overrun.
**Context:** Recommended budgets by tier: Smoke <5 minutes, Regression <30 minutes, Comprehensive <2 hours. Execution budgets are enforced through `maxFailures` configuration, sharding strategy, and change detection gating. When a tier exceeds its budget, the suite should be restructured (split tests, add shards, or promote tests to a less-frequent tier).
**Related terms:** Coverage tier, Scale tier, Shard
**Evidence:** Grafana (8 shards, 20-min timeout), Cal.com (runs all tests within budget), Element Web (PR CI <15 min, merge queue <45 min) [COV2.3].

---

### Coverage Debt
**Definition:** The accumulating gap between product features and E2E test coverage. Coverage debt grows when new features ship without corresponding tests, when production incidents reveal untested paths, or when test maintenance is deferred.
**Context:** Coverage debt is visible through structural completeness audits — missing test directories for product features indicate debt. Unlike code coverage metrics, structural debt is immediately visible in the file tree. Grafana's `alerting-suite/` having only 1 file is an example of visible coverage debt.
**Related terms:** Structural tiering, Coverage tier, Regression test
**Evidence:** Grafana alerting-suite gap, cross-suite structural completeness analysis [COV5.2].

---

### Transition Trigger
**Definition:** A measurable indicator that a test suite should move to the next scale tier's organizational patterns. Transition triggers prevent both premature optimization and delayed infrastructure investment.
**Context:** Common triggers include: test count thresholds (50, 200, 500 tests), CI duration exceeding time budgets, team growth beyond 3-5 contributors, and flaky test rate exceeding 2%. When triggers are reached, the suite should adopt the next tier's directory structure, configuration patterns, fixture investment, and execution strategy.
**Related terms:** Scale tier, Execution budget, Coverage tier
**Evidence:** Cross-suite scaling analysis of 15 suites; tier transitions observed in Grafana (8-month migration), Cal.com (organic growth), n8n (infrastructure-first) [S8.2].

---

### Test Anatomy
**Definition:** The structural conventions governing how individual tests are written, organized, and composed. Test anatomy encompasses the AAA pattern, single responsibility, step usage, setup placement, assertion patterns, and independence/determinism.
**Context:** Test anatomy is distinct from test organization (how tests are grouped into files and directories) and test infrastructure (fixtures, CI, configuration). Good anatomy produces short, focused, independently-runnable tests with clear phase separation. The strongest predictor of good anatomy is fixture investment — suites with rich fixtures produce shorter tests with higher AAA compliance.
**Related terms:** AAA pattern, Test independence, Single responsibility
**Evidence:** TA1-TA6 standards derived from analysis of 15 suites across rounds 56-67.

---

### Guard Assertion
**Definition:** An assertion placed before the main action in a test to verify that a precondition holds. Guard assertions catch failures at the point of the broken assumption rather than producing confusing failure messages later.
**Context:** The research identifies a four-level spectrum for precondition verification: (1) **Auto-wait** — Playwright's built-in waiting handles simple preconditions; (2) **Locator-chain** — chaining locators implicitly guards parent element existence; (3) **Guard assertion** — explicit `await expect(locator).toBeVisible()` before interaction, used for ambiguous state transitions; (4) **Multi-guard** — multiple guard assertions in CUJ tests verifying complex preconditions. Only 2/15 suites use explicit guard assertions as a deliberate pattern (Gutenberg, Grafana); 13/15 rely entirely on auto-waiting.
**Example:**
```typescript
// Level 3: Guard assertion for ambiguous state after complex navigation
await expect(page.getByTestId('widget-panel')).toBeVisible();
await page.getByTestId('widget-panel').getByRole('button', { name: 'Configure' }).click();
```
**Related terms:** Web-first assertion, AAA pattern, Auto-waiting
**Evidence:** V1.2 guard assertion spectrum; TA5.3 (only 2/15 suites use explicit guards); Gutenberg `beforeEach` guard, Grafana CUJ step guards.

---

### Structural Tiering
**Definition:** The practice of organizing tests into coverage tiers using directory structure and Playwright project definitions as the primary mechanism, rather than tags or metadata annotations.
**Context:** Structural tiering is the universal production pattern: 11/15 suites use directory structure as their primary categorization; 0/15 use priority tags (`@smoke`, `@critical`, `@regression`). Directories are self-documenting — a `smoke-tests-suite/` directory's purpose is immediately clear, while `@smoke` tags require scanning every file.
**Example:**
```
e2e-playwright/
  smoke-tests-suite/       # Tier 1: health check
  dashboard-cujs/          # Tier 2: critical user journeys
  dashboards-suite/        # Tier 3: feature regression
  panels-suite/            # Tier 3: feature regression
```
**Related terms:** Coverage tier, Coverage debt, Scale tier
**Evidence:** 11/15 suites use structural tiering [COV2.1]; Grafana (31 projects), Ghost (6+ configs).

---

### Feature Coverage
**Definition:** The breadth of product features that have corresponding E2E tests, measured through structural completeness (one test directory per feature area) rather than code coverage percentages. Feature coverage is the universal production heuristic for E2E test completeness.
**Context:** Structural completeness requires zero tooling: list product features, map each to a test directory, identify gaps. Missing directories indicate untested features. PR review ensures new features include tests. 13/15 production suites rely on structural completeness as their sole coverage metric; 0/15 use formal code coverage for E2E.
**Related terms:** Structural tiering, Coverage debt, Coverage tier
**Evidence:** 13/15 suites rely on structural completeness [COV5.2]; Grafana directory structure maps to product features; Kent C. Dodds: "test use cases, not code."

---

## Cross-Framework Reference

For teams migrating from other frameworks:

| Concept | Playwright | Cypress | Selenium |
|---------|-----------|---------|----------|
| Find element | `page.locator()` / `page.getByRole()` | `cy.get()` | `driver.findElement()` |
| Navigate | `page.goto(url)` | `cy.visit(url)` | `driver.get(url)` |
| Type text | `locator.fill(text)` | `cy.type(text)` | `element.sendKeys(text)` |
| Assert visible | `expect(loc).toBeVisible()` | `.should('be.visible')` | Custom assertion |
| Network mock | `page.route(pattern, handler)` | `cy.intercept(pattern, response)` | N/A |
| Test isolation | BrowserContext per test | Spec-level isolation | Session-level |
| Auth reuse | StorageState | `cy.session()` | Cookie injection |
| Parallel | Workers + shards | Cypress Cloud | TestNG / Selenium Grid |
| Fixtures (DI) | `test.extend()` | N/A (Cypress has no DI) | N/A |
| Test data files | Not a framework feature | `cy.fixture()` | Not a framework feature |
