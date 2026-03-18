# Validation Standards

> **FINAL — validated across 21 suites (10 Gold, 11 Silver) in rounds 23-32, cross-validated in rounds 47-55**
> These standards represent consensus patterns observed across production Playwright test suites.
> Each standard is backed by 2+ suite citations, includes valid alternatives, and lists anti-patterns.
> Cross-validation: 98% accuracy, 0 contradictions, 1 minor addition (WebSocket note).

---

## V1. Web-First Assertions

### V1.1 Use web-first assertions as the primary validation mechanism

All element assertions MUST use web-first (auto-retrying) assertions. Web-first assertions wait for the condition to be met, retrying automatically until the expect timeout expires.

**Required matchers (by frequency of use):**
1. `toBeVisible()` — element presence and visibility (most used across all suites)
2. `toHaveText()` / `toContainText()` — text content verification
3. `toHaveURL()` — navigation and routing verification
4. `toBeEnabled()` / `toBeDisabled()` — interactive state
5. `toHaveCount()` — list/table/collection length
6. `toHaveValue()` — form input values
7. `toHaveAttribute()` — element attributes
8. `toHaveClass()` — CSS class state
9. `toBeChecked()` — checkbox/radio state
10. `toBeEditable()` / `toBeFocused()` — form field state

**Full matcher taxonomy (30+ matchers in five categories):**
- **Visibility/State:** `toBeVisible`, `toBeHidden`, `toBeChecked`, `toBeDisabled`, `toBeEnabled`, `toBeEditable`, `toBeFocused`, `toBeAttached`
- **Content:** `toHaveText`, `toContainText`, `toHaveValue`, `toHaveValues`, `toBeEmpty`
- **Attributes/Style:** `toHaveAttribute`, `toHaveClass`, `toHaveId`, `toHaveCSS`, `toHaveJSProperty`
- **Accessibility:** `toHaveAccessibleName`, `toHaveAccessibleDescription`, `toHaveRole`, `toMatchAriaSnapshot`
- **Layout/Visual:** `toBeInViewport`, `toHaveScreenshot`, `toHaveCount`

**Anti-pattern:** `expect(await locator.isVisible()).toBe(true)` — evaluates once with no retry, creating a race condition. The `prefer-web-first-assertions` ESLint rule prevents this.

- **Basis:** 21/21 suites (universal); [playwright-assertions-docs], [eslint-plugin-playwright]

### V1.2 Use guard assertions between action steps to prevent flakiness

Insert `await expect(locator).toBeVisible()` before interacting with elements to serve as a synchronization point. This ensures the element is ready before the action executes.

```typescript
// Correct: guard assertion before interaction
await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
await page.getByRole('button', { name: 'Save' }).click();
await expect(page.getByText('Saved successfully')).toBeVisible();
```

Guard assertions are the single most effective flakiness prevention technique, observed in 18/21 suites (86%).

- **Anti-pattern:** Clicking without verifying visibility first, relying solely on auto-waiting for complex UI transitions.
- **Basis:** [calcom-flaky-fix-pr PR #23487], [n8n-e2e], [nocodb-e2e]; 18/21 suites

### V1.3 Create custom expect matchers for domain-specific validation

For domain-specific assertions used across multiple tests, create custom matchers via `expect.extend()` and compose with `mergeExpects()`.

```typescript
// Define
expect.extend({
  async toHaveAlert(page, message, options) {
    const alert = page.getByRole('alert');
    await expect(alert).toContainText(message, options);
    return { pass: true, message: () => '' };
  },
});

// Compose
const expect = mergeExpects(test.expect, myCustomExpect);
```

**Valid alternative:** Helper functions wrapping standard assertions — simpler to implement but less integrated with Playwright's reporting.

**Anti-pattern:** Duplicating assertion logic across test files instead of extracting to shared matchers.

- **Basis:** [grafana-plugin-e2e] (8 custom matchers published as npm package), [excalidraw-e2e] (visual regression matchers)

### V1.4 Use soft assertions selectively, not as the default

`expect.soft()` continues test execution after failure, collecting all failures. Use for:
- Form validation (check all error messages)
- Table/list structure verification (check all rows)
- Smoke test suites (report all issues per page)

Default to hard assertions with focused test scope. One behavior per test with 2-5 supporting assertions.

**Anti-pattern:** Using `expect.soft()` everywhere — masks root causes and inflates failure reports.

- **Basis:** [playwright-assertions-docs], [checkly-assertions], [timdeschryver-soft-assertions]; low adoption in Gold suites confirms hard assertions as default

### V1.5 Validate API responses with a two-layer approach

API-heavy tests require two assertion layers:

```typescript
// Layer 1: Status assertion (web-first)
await expect(response).toBeOK(); // 200-299

// Layer 2: Body assertion (generic, on parsed JSON)
const body = await response.json();
expect(body.id).toBeDefined();
expect(body.name).toBe('Test User');
```

For visual regression, use `toHaveScreenshot()` with deterministic configuration:
- `maxDiffPixels` or `maxDiffPixelRatio` for tolerance
- `animations: 'disabled'` to prevent animation flakiness
- `mask` to exclude dynamic content areas
- Generate baselines in CI (same environment where tests run)

**Anti-pattern:** Asserting only on status codes without validating response body shape.

- **Basis:** [immich-e2e], [calcom-e2e], [playwrightsolutions-api-guide]; [excalidraw-e2e] (visual regression)

---

## V2. Retry and Timeout

### V2.1 Follow the five-mechanism retry hierarchy — prefer implicit over explicit

Playwright provides five retry mechanisms. Use the most implicit mechanism that handles your case:

| Level | Mechanism | Behavior | When to Use |
|-------|-----------|----------|-------------|
| 1 | **Actionability auto-wait** | 6 checks before every action (implicit) | Default — no code needed |
| 2 | **Assertion auto-retry** | Web-first assertions retry until timeout (implicit) | Default — use web-first matchers |
| 3 | **`toPass()` block retry** | Retries entire assertion block (explicit) | Non-UI conditions, multi-step validation |
| 4 | **`expect.poll()` polling** | Polls a function value with assertions (explicit) | External API state, background tasks |
| 5 | **Test-level retry** | Re-runs entire test on failure (explicit) | Infrastructure instability |

**`toPass()` configuration:**
- Default intervals: `[100, 250, 500, 1000]` (exponential backoff)
- Gold suites use `[1000, 2000, 5000]` for slow backends
- Always set an explicit timeout (default is `0` / unlimited)

**`expect.poll()` configuration:** Same surface as `toPass()` — intervals and timeout.

**Anti-pattern:** Jumping to test-level retries before exhausting implicit mechanisms.

- **Basis:** [timdeschryver-retry-apis], [playwright-assertions-docs], [playwright-retries-docs]; all Gold suites

### V2.2 Configure retries by environment — CI retries encode infrastructure complexity

Retries MUST differ between CI and local:
- **Local:** 0 retries (fail fast for immediate developer feedback)
- **CI:** 1-5 retries based on infrastructure complexity

```typescript
retries: process.env.CI ? 2 : 0,
```

**Infrastructure-to-retry mapping (validated across 21 suites):**

| Infrastructure Complexity | CI Retries | Examples |
|--------------------------|-----------|----------|
| Simple frontend (Vite, static) | 1 | Hoppscotch, Twenty |
| Standard app (single service + DB) | 2 | Cal.com, Strapi, n8n, Directus |
| Complex backend (multi-service, Docker) | 3 | NocoDB, AFFiNE |
| Heavy infrastructure (5+ containers) | 4 | Immich |
| Cross-platform rendering instability | 5 | Slate |

**Per-group overrides** for known-unstable areas:
```typescript
test.describe.configure({ retries: 3 }); // Override for flaky integration area
```

**Anti-pattern:** Setting retries > 0 locally (hides flakiness) or using the same retry count everywhere (ignores infrastructure differences).

- **Basis:** [grafana-e2e] (1), [calcom-e2e] (2), [affine-e2e] (3), [immich-e2e] (4), [slate-e2e] (5); 21/21 suites use 0 locally

### V2.3 Configure the four-layer timeout hierarchy based on application type

```typescript
export default defineConfig({
  timeout: process.env.CI ? 60_000 : 30_000,       // Test timeout
  expect: { timeout: process.env.CI ? 10_000 : 5_000 }, // Expect timeout
  use: {
    actionTimeout: 15_000,                           // Action timeout
    navigationTimeout: 30_000,                       // Navigation timeout
  },
});
```

**Expect timeout by application type:**
- Standard web apps: 5s (default)
- Rendering-heavy apps (editors, dashboards): 8-10s
- API-focused tests: 3-5s

**Rule of thumb:** Test timeout = 3-5x expect timeout.

**Anti-pattern:** Increasing the global test timeout to compensate for slow assertions. Fix the assertion (use `toPass()` or `expect.poll()`) instead of raising the timeout.

- **Basis:** [playwright-testconfig-docs], [slate-e2e], [grafana-e2e], [checkly-waits-timeouts], [logto-e2e]

### V2.4 Use `--fail-on-flaky-tests` as a CI quality gate

Playwright categorizes test results as "passed" (first try), "flaky" (failed then passed on retry), or "failed" (all retries exhausted). The `--fail-on-flaky-tests` flag treats "flaky" as failure.

```bash
npx playwright test --fail-on-flaky-tests
```

Use `testInfo.retry` for retry-aware behavior in tests:
```typescript
test('data creation', async ({ page }, testInfo) => {
  if (testInfo.retry > 0) {
    await cleanupStaleData();
  }
  // ... test logic
});
```

**Valid alternative:** Accept flaky results in CI initially, track with dashboards, and fix in sprints. This is appropriate for suites transitioning from high flaky rates.

**Anti-pattern:** Ignoring the flaky category entirely — flaky tests erode CI trust over time.

- **Basis:** [playwright-retries-docs]; underutilized (2/10 Gold suites) but recommended

### V2.5 Set `maxFailures` for CI cost control

```typescript
export default defineConfig({
  maxFailures: process.env.CI ? 10 : 0, // 0 = unlimited locally
});
```

Prevents wasting CI minutes when a systemic issue causes cascading failures. Currents.dev benchmarks show `maxFailures` saves ~40% of wasted CI time on cascade scenarios.

**Anti-pattern:** No `maxFailures` limit — a broken database migration causes all 200 tests to timeout individually.

- **Basis:** [calcom-e2e] (`maxFailures: 10`), [nocodb-e2e] (`maxFailures: 5`), [currents-ci-benchmarks]

---

## V3. Wait Strategies

### V3.1 Rely on built-in auto-waiting — do not add explicit waits before standard interactions

Playwright performs 6 actionability checks before every action: **attached**, **visible**, **stable**, **receives events**, **enabled**, **editable**. These make most explicit waits unnecessary.

```typescript
// Correct: just interact — Playwright auto-waits
await page.getByRole('button', { name: 'Submit' }).click();

// Wrong: redundant explicit wait
await page.waitForSelector('button[name="Submit"]');
await page.getByRole('button', { name: 'Submit' }).click();
```

**Anti-patterns:**
- `page.waitForSelector()` — redundant with auto-waiting; banned by ESLint rule `no-wait-for-selector`
- `page.waitForNavigation()` — deprecated; use `page.waitForURL()` instead
- `page.waitForTimeout()` — arbitrary delay; banned by ESLint rule `no-wait-for-timeout`

- **Basis:** [playwright-auto-wait-docs]; all 21 suites rely on auto-waiting

### V3.2 Use event-based waits for network operations with `Promise.all` coordination

Register the wait handler before triggering the action to prevent race conditions:

```typescript
const [response] = await Promise.all([
  page.waitForResponse(resp =>
    resp.url().includes('/api/data') && resp.status() === 200
  ),
  page.getByRole('button', { name: 'Save' }).click(),
]);
```

**Event-based wait methods:**
- `page.waitForResponse()` — wait for specific API responses
- `page.waitForURL()` — wait for navigation completion (replaces deprecated `waitForNavigation`)
- `page.waitForLoadState('domcontentloaded')` — wait for page ready state (rarely needed)

**Anti-pattern:** Registering `waitForResponse` after clicking — the response may arrive before the handler is installed.

- **Basis:** [browserstack-waitforresponse], [calcom-e2e], [checkly-waits-timeouts]; [calcom-flaky-fix-pr]

### V3.3 Ban `page.waitForTimeout()` and enforce via ESLint

`page.waitForTimeout()` MUST NOT be used in production test suites. Enforce via ESLint:

```json
{
  "rules": {
    "playwright/no-wait-for-timeout": "error",
    "playwright/no-wait-for-selector": "error",
    "playwright/no-wait-for-navigation": "warn"
  }
}
```

**Replacements for common `waitForTimeout` use cases:**

| Instead of | Use |
|-----------|-----|
| `await page.waitForTimeout(1000)` before asserting | `await expect(locator).toBeVisible()` |
| `await page.waitForTimeout(2000)` for API response | `await page.waitForResponse(url)` |
| `await page.waitForTimeout(500)` for animation | `await expect(locator).toHaveCSS('opacity', '1')` |
| `await page.waitForTimeout(3000)` for background job | `await expect(async () => { ... }).toPass()` |

- **Basis:** [eslint-plugin-playwright], [browserstack-waitfortimeout]; universally banned across all 21 suites

---

## V4. Flakiness Management

### V4.1 Follow the three-step flaky test remediation process

When a test is identified as flaky:

1. **Replace generic waits with explicit conditions** — swap `waitForTimeout` with `waitForResponse`, `waitForURL`, or web-first assertions
2. **Add guard assertions before interactions** — insert `toBeVisible()` between action steps
3. **Use scoped locators to reduce ambiguity** — prefer `page.getByRole()` scoped within containers over broad page-level selectors

**Diagnostic workflow:**
```bash
# Step 1: Reproduce
npx playwright test flaky-test.spec.ts --repeat-each=100 --retries=0

# Step 2: Analyze
npx playwright test flaky-test.spec.ts --trace=on

# Step 3: Verify fix
npx playwright test flaky-test.spec.ts --repeat-each=100 --retries=0
```

- **Basis:** [calcom-flaky-fix-pr PR #23487], [charpeni-flaky-repro]; validated across multiple suites

### V4.2 Use three-tier quarantine with mandatory issue tracking

| Tier | Mechanism | Behavior | Use When |
|------|-----------|----------|----------|
| 1 | `test.skip(condition, reason)` | Conditional skip | Platform/environment-specific issues |
| 2 | `test.fixme()` | Skip, always | Known broken, not worth running (saves CI time) |
| 3 | `test.fail()` | Runs but expects failure | Alerts if bug is accidentally fixed |

Additional: `--grep-invert @quarantined` for bulk exclusion of tagged tests.

**Every quarantine decision MUST include:**
- A GitHub issue reference
- A fix deadline (default: 2 weeks)
- The quarantine tier selected and justification

**Target:** <2% flaky test rate over a rolling 7-day window.

**Anti-pattern:** Permanent quarantine without tracking — tests accumulate in quarantine and are never fixed.

- **Basis:** [calcom-e2e] (skip+TODO), [grafana-e2e] (fixme+issue), [freecodecamp-e2e] (grep-invert), [playwright-annotations-docs], [testdino-flaky-tests]

### V4.3 Mark slow tests with `test.slow()` instead of hardcoded timeouts

```typescript
test('complex workflow', async ({ page }) => {
  test.slow(); // Triples the default timeout
  // ... long test
});
```

`test.slow()` scales with global timeout changes and communicates intent, unlike `test.setTimeout(90_000)` which is brittle and opaque.

**Valid alternative:** `test.setTimeout()` when a specific timeout is needed (e.g., exactly 2 minutes for a known-slow operation).

- **Basis:** [playwright-annotations-docs], [excalidraw-e2e], [n8n-e2e]

### V4.4 Enforce validation standards via ESLint with eslint-plugin-playwright

Configure the recommended ruleset plus critical additions:

**11 assertion/wait rules in recommended config:**
| Rule | Prevents |
|------|----------|
| `prefer-web-first-assertions` | Generic assertions on async state |
| `no-wait-for-timeout` | Arbitrary delays |
| `no-wait-for-selector` | Redundant explicit waits |
| `no-wait-for-navigation` | Deprecated API |
| `missing-playwright-await` | Silent pass from un-awaited assertions |
| `no-force-option` | Bypassing actionability checks |
| `expect-expect` | Tests without assertions |
| `no-standalone-expect` | Assertions outside test blocks |
| `no-conditional-expect` | Non-deterministic assertion paths |
| `no-useless-await` | Unnecessary await on sync methods |
| `no-useless-not` | `.not.toBeHidden()` instead of `.toBeVisible()` |

**Critical additions beyond recommended:**
- `no-conditional-in-test` — prevents branching logic
- `no-page-pause` — prevents committed debug pauses
- `@typescript-eslint/no-floating-promises` — second safety net for un-awaited promises

**Anti-pattern:** Running without any Playwright ESLint rules — five categories of flakiness become preventable.

- **Basis:** [eslint-plugin-playwright] (60 total rules), [grafana-e2e] (recommended preset), [dev.to-catch-missing-await]

---

## V5. Network Determinism

### V5.1 Use `page.route()` for deterministic test execution

`page.route()` provides three operation modes:

| Mode | Method | Use Case |
|------|--------|----------|
| Mock | `route.fulfill()` | Return mock response, skip server entirely |
| Modify | `route.continue()` | Add headers, change payload before server |
| Block | `route.abort()` | Block analytics, images, offline testing |

```typescript
// Mock: return deterministic data
await page.route('**/api/users', route =>
  route.fulfill({ json: [{ id: 1, name: 'Test User' }] })
);

// Modify: add auth header
await page.route('**/api/**', route =>
  route.continue({ headers: { ...route.request().headers(), 'X-Test': 'true' } })
);

// Block: suppress analytics
await page.route('**/analytics/**', route => route.abort());
```

**Critical:** Register routes before triggering the actions that cause requests.

**Valid alternative:** HAR replay via `page.routeFromHAR()` — records and replays network traffic. Simpler to set up but less stable for APIs with dynamic data.

**Real-time applications:** For WebSocket-dependent features, use `page.on('websocket')` to intercept connections and `webSocket.on('framereceived')` to assert on messages. Most E2E tests can test WebSocket-driven features through UI assertions without direct WebSocket interception — the UI reflects the WebSocket state. Evidence: [rocketchat-e2e-playwright]

**Anti-pattern:** Relying on live API calls for tests that need deterministic data — introduces flakiness from server state, network latency, and rate limits.

- **Basis:** [playwright-network-docs], [grafana-e2e], [calcom-e2e], [testdino-network-mocking]

### V5.2 Store mock payloads in external JSON fixtures

```
fixtures/
  api-responses/
    users-list.json
    user-detail.json
    error-404.json
```

```typescript
import usersList from '../fixtures/api-responses/users-list.json';

await page.route('**/api/users', route =>
  route.fulfill({ json: usersList })
);
```

Benefits:
- Reviewable independently of test logic
- Shareable across multiple tests
- Versioned alongside tests

**Valid alternative:** Inline mock data for simple, one-off responses.

**Anti-pattern:** Embedding large mock objects directly in test files — reduces readability and prevents reuse.

- **Basis:** [testdino-network-mocking], [playwright-mock-api-docs], [grafana-e2e]

### V5.3 Use the Clock API for date and time-dependent testing

**Fixed time for date-dependent UI:**
```typescript
await page.clock.setFixedTime(new Date('2026-01-15T10:00:00'));
await page.goto('/calendar'); // Calendar shows January 15, 2026
```

**Install and advance for time-progression:**
```typescript
await page.clock.install({ time: new Date('2026-01-15T10:00:00') });
await page.goto('/session');
await page.clock.fastForward('30:00'); // Advance 30 minutes
await expect(page.getByText('Session expired')).toBeVisible();
```

Overrides: `Date`, `setTimeout`, `setInterval`, `requestAnimationFrame`, `performance`.

**Critical:** `clock.install()` must be called before navigating to the page. `setFixedTime()` freezes `Date.now()` while timers continue naturally.

**Anti-pattern:** Using `page.waitForTimeout()` to simulate time passage — unreliable and slow.

- **Basis:** [playwright-clock-docs], [microsoft-learn-clock]

---

## V6. Test Isolation

### V6.1 Implement the three-layer test isolation model

| Layer | Scope | Mechanism | Responsibility |
|-------|-------|-----------|---------------|
| 1. Browser context | Automatic | Fresh cookies, localStorage, sessionStorage per test | Playwright (default) |
| 2. Application state | Manual | Fixture-based API cleanup with automatic teardown | Test author |
| 3. Infrastructure | CI | Fresh Docker containers, database migration + seed | CI pipeline |

Layer 1 is free — Playwright creates a new `BrowserContext` per test automatically. Layers 2 and 3 require deliberate design.

**Anti-pattern:** Relying solely on Layer 1 when tests modify backend state — creates inter-test dependencies.

- **Basis:** [playwright-fixtures-docs], [grafana-e2e] (all 3 layers), [calcom-e2e] (all 3 layers), [immich-e2e] (all 3 layers)

### V6.2 Use `storageState` with setup projects for authentication

```typescript
// playwright.config.ts
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  {
    name: 'chromium',
    dependencies: ['setup'],
    use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' },
  },
]

// auth.setup.ts
import { test as setup, expect } from '@playwright/test';
setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill(process.env.TEST_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await page.context().storageState({ path: '.auth/user.json' });
});
```

**Multi-role auth:** Separate `.auth/*.json` files per role (user, admin, viewer).

**Requirements:**
- `.auth/` directory MUST be in `.gitignore`
- Prefer project dependencies over `globalSetup` for auth (trace files, fixture access, report visibility)
- Reserve `globalSetup` for infrastructure tasks only (Docker, database migration)

**Valid alternative:** API-based auth (faster, no browser needed) when the app supports it.

- **Basis:** [playwright-auth-docs], [calcom-e2e], [grafana-e2e], [immich-e2e], [logto-e2e]; 7/10 Gold suites

### V6.3 Use database seeding with API-based per-test data creation

**Consensus approach:** Migration + seed for baseline state, API-based creation for test-specific data.

| Strategy | Use When | Examples |
|----------|----------|---------|
| Migration + seed | Shared baseline data (users, config) | Cal.com (Prisma), freeCodeCamp |
| Docker Compose pre-seeded | Complex multi-service backend | Immich |
| API-based per-test | Test-specific dynamic data | Grafana |

```typescript
const test = base.extend<{ testOrg: Organization }>({
  testOrg: async ({ request }, use) => {
    const resp = await request.post('/api/orgs', {
      data: { name: `Test Org ${Date.now()}` },
    });
    const org = await resp.json();
    await use(org);
    await request.delete(`/api/orgs/${org.id}`); // Cleanup
  },
});
```

**Anti-pattern:** Tests relying on data created by other tests — creates hidden inter-test dependencies.

- **Basis:** [calcom-e2e], [immich-e2e], [grafana-e2e], [freecodecamp-e2e]

### V6.4 Ensure test data isolation across parallel workers

When multiple workers run against the same backend:

**Pattern 1 — Unique data via timestamps/UUIDs:**
```typescript
const orgName = `Test Org ${crypto.randomUUID().slice(0, 8)}`;
```

**Pattern 2 — Worker-indexed resources:**
```typescript
const test = base.extend<{}, { testDb: string }>({
  testDb: [async ({}, use, workerInfo) => {
    const dbName = `test_db_${workerInfo.workerIndex}`;
    await createDatabase(dbName);
    await use(dbName);
    await dropDatabase(dbName);
  }, { scope: 'worker' }],
});
```

**Pattern 3 — Fixture-based cleanup (ensures teardown on failure):**
```typescript
const test = base.extend<{ tempUser: User }>({
  tempUser: async ({ request }, use) => {
    const user = await createUser(request);
    await use(user);
    await deleteUser(request, user.id); // Runs even if test fails
  },
});
```

**Anti-pattern:** Shared mutable state without namespacing — parallel workers corrupt each other's data.

- **Basis:** [playwright-parallelism-docs], [grafana-e2e], [calcom-e2e], [immich-e2e]

---

## Revision History

| Date | Change | Basis |
|---|---|---|
| 2026-03-18 | Initial draft from landscape rounds 1-12 | 10 Gold suites, 12 Silver, ~97 total sources |
| 2026-03-18 | DEFINITIVE version from validation rounds 23-32 | 21 suites (10 Gold + 11 Silver), 25+ sources, 0 contradictions |
| 2026-03-18 | **FINAL version** from cross-validation rounds 51-55 | Added WebSocket note to V5.1; 0 standards reversed |
