# Validation Patterns

## Overview

This document consolidates validation patterns observed across Gold-standard Playwright suites during the landscape phase (rounds 1-11) and refined during the validation deep-dive phase (rounds 23-26). Validation patterns include assertion styles, retry strategies, wait patterns, flakiness management, and test stability approaches.

**Status:** Refined — rounds 23-26 deep dives complete (assertion strategies + retry/flakiness management)

---

## Observed Patterns

### 1. Assertion Styles

**Pattern: Web-first assertions as the primary validation mechanism**
- Frequency: 10/10 Gold suites (universal)
- Preferred: `expect(locator).toBeVisible()`, `expect(locator).toHaveText()`, `expect(locator).toBeEnabled()`
- These auto-retry until condition is met or timeout expires
- Evidence: [playwright-official] (defines the pattern), [browserstack-best-practices] (top-3 recommendation), all Gold suites

**Pattern: Web-first vs generic assertion distinction is the #1 quality signal** *(NEW — Round 23)*
- Web-first assertions (async, `await`-required) auto-retry; generic assertions (`toBe()`, `toEqual()`) evaluate once immediately
- Anti-pattern: `expect(await locator.isVisible()).toBe(true)` — evaluates once, no retry, race condition
- Correct: `await expect(locator).toBeVisible()` — auto-retries until visible or timeout
- ESLint rule `prefer-web-first-assertions` enforces this pattern
- Evidence: [playwright-best-practices], [eslint-plugin-playwright], all 10 Gold suites

**Pattern: 30+ locator matchers organized into five functional categories** *(NEW — Round 23)*
- **Visibility/State:** `toBeVisible()`, `toBeHidden()`, `toBeChecked()`, `toBeDisabled()`, `toBeEnabled()`, `toBeEditable()`, `toBeFocused()`, `toBeAttached()`
- **Content:** `toHaveText()`, `toContainText()`, `toHaveValue()`, `toHaveValues()`, `toBeEmpty()`
- **Attributes/Style:** `toHaveAttribute()`, `toHaveClass()`, `toHaveId()`, `toHaveCSS()`, `toHaveJSProperty()`
- **Accessibility:** `toHaveAccessibleName()`, `toHaveAccessibleDescription()`, `toHaveRole()`, `toMatchAriaSnapshot()`
- **Layout/Visual:** `toBeInViewport()`, `toHaveScreenshot()`, `toHaveCount()`
- Evidence: [playwright-assertions-docs] complete matcher enumeration

**Pattern: Locator assertions outnumber page assertions 10:1** *(NEW — Round 24)*
- Page assertions limited to 3: `toHaveTitle()`, `toHaveURL()`, `toHaveScreenshot()`
- API response assertions limited to 1: `toBeOK()` (status 200-299)
- All element validation uses locator assertions; page assertions only for navigation/title
- Evidence: [playwright-assertions-docs], [calcom-e2e], [supabase-e2e]

**Pattern: Locator priority hierarchy**
- Recommended order: `getByRole()` > `getByText()` > `getByTestId()` > `getByLabel()` > CSS/XPath (last resort)
- Frequency: Explicitly documented in 2/10 Gold suites, implicitly followed by most
- Evidence: [freecodecamp-e2e] (contributor guide prescribes `getByRole` > `getByText` > `data-playwright-test-label`), [playwright-best-practices]

**Pattern: Custom expect matchers for domain-specific validation**
- Frequency: 2/10 Gold suites (highest maturity indicator)
- Grafana publishes 8 custom matchers as npm package: `toBeChecked`, `toBeOK`, `toDisplayPreviews`, `toHaveAlert`, `toHaveChecked`, `toHaveColor`, `toHaveNoA11yViolations`, `toHaveSelected`
- Custom matchers created via `expect.extend()`; composable via `mergeExpects()`
- Evidence: [grafana-plugin-e2e] 8 matcher files in `src/matchers/`

**Pattern: API response validation requires two-layer approach** *(NEW — Round 23)*
- Layer 1: `await expect(response).toBeOK()` or `expect(response.status()).toBe(201)` for status
- Layer 2: Generic assertions on parsed JSON for body validation
- API-heavy suites (Immich, Cal.com) follow this pattern consistently
- Evidence: [playwright-apiresponse-docs], [immich-e2e], [playwrightsolutions-api-guide]

**Pattern: Visual regression assertions require environment-controlled baselines** *(NEW — Round 23)*
- `toHaveScreenshot()` for pixel comparison; `toMatchSnapshot()` for data snapshots
- Critical config: `maxDiffPixels`, `maxDiffPixelRatio`, `threshold`, `animations: 'disabled'`, `mask`
- Three biggest flakiness sources: CSS animations, dynamic content, cross-environment rendering
- Baselines must be generated in the same CI environment where tests run
- Evidence: [playwright-visual-comparisons], [excalidraw-e2e]

**Pattern: Soft assertions for specific scenarios, not as default** *(NEW — Round 23)*
- `expect.soft()` continues test execution after failure, collects all failures
- Use cases: form validation, table structure verification, smoke tests
- Gold suites show low adoption — prefer hard assertions with focused test scope
- Evidence: [playwright-assertions-docs], [checkly-assertions], [timdeschryver-soft-assertions]

**Pattern: Assertion granularity — one behavior per test, multiple assertions acceptable** *(NEW — Round 23)*
- Gold suites average 2-5 assertions per test, clustered around a single user flow
- "One assertion per test" is too strict; "one behavior per test with supporting assertions" is correct
- Parallel execution benefits from more granular tests
- Evidence: [checkly-assertions], [playwright-best-practices]

**Pattern: Guard assertions prevent race conditions between actions** *(NEW — Round 24)*
- Insert `await expect(locator).toBeVisible()` between action steps as a synchronization point
- Demonstrated in Cal.com flaky-fix PR #23487
- Evidence: [calcom-flaky-fix-pr]

**Pattern: `toMatchAriaSnapshot()` — accessibility-driven assertion paradigm** *(NEW — Round 24)*
- Asserts against accessibility tree (not visual DOM)
- Cross-browser consistent; built-in a11y validation as side effect
- Grafana's `toHaveNoA11yViolations` extends this concept
- Evidence: [playwright-assertions-docs], [grafana-plugin-e2e]

**Anti-pattern: `page.waitForTimeout()` — universally banned**
- ESLint rule `no-wait-for-timeout` enforces the ban
- Replacement: web-first assertions, `waitForResponse()`, `waitForURL()`, `toPass()`
- Evidence: [eslint-plugin-playwright], [browserstack-waitfortimeout], all Gold suites

### 2. Retry Strategies

**Pattern: Environment-specific retry counts encode infrastructure complexity**
- Frequency: 10/10 Gold suites configure retries differently for CI vs. local
- Validated correlation with expanded data: *(UPDATED — Round 25)*

| Suite | CI Retries | Local Retries | Infrastructure |
|-------|-----------|---------------|----------------|
| Grafana | 1 | 0 | Direct server, simple compose |
| Cal.com | 2 | 0 | Monorepo, Prisma, multiple services |
| AFFiNE | 3 | 0 | 9 test packages, complex build |
| Immich | 4 | 0 | Docker Compose, 5+ containers |
| Slate | 5 | 0 | Cross-platform rendering, editor instability |

- Standard recommendation: 2 retries in CI, 0 locally
- Per-group overrides via `test.describe.configure({ retries: N })` for known-unstable areas
- Evidence: All Gold suites; [playwright-retries-docs]

**Pattern: Playwright's built-in flaky test detection via test categorization** *(NEW — Round 25)*
- Three categories: "passed" (first run), "flaky" (failed then passed on retry), "failed" (all retries failed)
- `--fail-on-flaky-tests` flag converts "flaky" to failure — underutilized (2/10 Gold suites)
- `testInfo.retry` provides runtime retry awareness for conditional cleanup
- Evidence: [playwright-retries-docs]

**Pattern: Five retry mechanisms form a hierarchy from implicit to explicit** *(NEW — Round 26)*
1. **Actionability auto-wait** (implicit): 6 checks before every action
2. **Locator assertion auto-retry** (implicit): Web-first assertions retry until timeout
3. **`toPass()` block retry** (explicit): Retries entire assertion block with custom intervals
4. **`expect.poll()` polling** (explicit): Polls a function value with assertions
5. **Test-level retry** (explicit): Re-runs entire test on failure
- Principle: use the most implicit mechanism that handles your case
- `toPass()` defaults: intervals `[100, 250, 500, 1000]`, timeout `0` (unlimited)
- `expect.poll()`: same configuration surface as `toPass()`
- Evidence: [timdeschryver-retry-apis], [playwright-assertions-docs], [playwright-retries-docs]

**Pattern: `trace: 'retain-on-failure'` as the universal trace strategy**
- Frequency: 7/10 Gold suites use `retain-on-failure`; 1/10 uses `on-first-retry`
- Rationale: Captures traces for failures without the performance overhead of `trace: 'on'`
- Evidence: [grafana-e2e], [calcom-e2e], [affine-e2e] (retain-on-failure); [immich-e2e] (on-first-retry)

**Pattern: `maxFailures` for early CI abort**
- Frequency: 2/10 Gold suites (Cal.com, implicitly others)
- Purpose: Prevents wasting CI minutes on cascading failures
- Evidence: [calcom-e2e] (`maxFailures: 10` in headless mode)

**Pattern: Serial retry behavior creates implicit dependencies** *(NEW — Round 25)*
- `test.describe.serial()` + retries: entire group re-runs from first failed test
- Correct for truly dependent tests (create-then-verify flows)
- Wasteful for tests serial only for resource reasons
- Evidence: [playwright-retries-docs], [immich-e2e]

### 3. Wait Patterns

**Pattern: Built-in auto-waiting (actionability checks)**
- Playwright performs 6 actionability checks before every action: attached, visible, stable, receives events, enabled, editable
- Makes most explicit waits unnecessary *(REFINED — Round 25)*
- Evidence: [playwright-auto-wait-docs]

**Pattern: Event-based waiting for network operations**
- `page.waitForResponse()` for specific API calls — requires `Promise.all` coordination *(REFINED — Round 25)*
- `page.waitForURL()` for navigation completion
- `page.waitForLoadState('domcontentloaded')` for page ready (rarely needed)
- Critical: register wait before triggering action to avoid race conditions
- Evidence: [calcom-flaky-fix-pr], [browserstack-waitforresponse], [checkly-waits-timeouts]

**Pattern: `Promise.all` coordination for `waitForResponse`** *(NEW — Round 25)*
```typescript
const [response] = await Promise.all([
  page.waitForResponse(resp => resp.url().includes('/api/data') && resp.status() === 200),
  page.getByRole('button', { name: 'Save' }).click(),
]);
```
- Prevents race condition where response arrives before wait handler is installed
- Gold suites use this pattern consistently
- Evidence: [browserstack-waitforresponse], [calcom-e2e]

**Pattern: `toPass()` for retry with custom intervals**
- Wraps any assertion block with configurable retry intervals and timeouts
- Default intervals: `[100, 250, 500, 1000]` — default timeout: `0` (unlimited, must configure explicitly)
- Used for non-UI conditions: localStorage, background tasks, multi-step validation
- Evidence: [semaphore-flaky-tests], [playwright-retries-docs], [timdeschryver-retry-apis]

### 4. Flakiness Management

**Pattern: Three-step flaky test remediation**
1. Replace generic waits with explicit conditions
2. Add visibility assertions before interacting (guard assertions)
3. Use scoped locators to reduce ambiguity
- Evidence: [calcom-flaky-fix-pr] PR #23487

**Pattern: Three-tier quarantine with distinct mechanisms** *(EXPANDED — Round 25)*
- **Tier 1 — `test.skip(condition, reason)`**: Conditional skip; platform/environment-specific issues
- **Tier 2 — `test.fixme()`**: Known broken, not worth running (saves CI time)
- **Tier 3 — `test.fail()`**: Expected failure, still runs (alerts if bug accidentally fixed)
- Additional: `--grep-invert` with `@quarantined` tag for bulk exclusion
- All quarantine decisions must include issue reference and fix deadline
- Evidence: [calcom-e2e] (skip+TODO), [grafana-e2e] (fixme+issue), [freecodecamp-e2e] (grep-invert), [playwright-annotations-docs]

**Pattern: Reproduce flaky tests with `--repeat-each=100`**
- Diagnostic workflow: isolate, repeat 100x, analyze, fix, verify
- `--fail-on-flaky-tests` + `--retries=2` as CI quality gate
- Evidence: [charpeni-flaky-repro], [playwright-retries-docs]

**Pattern: `test.slow()` for declarative slow test marking** *(NEW — Round 25)*
- Triples the default timeout; communicates intent ("this test is slow")
- Scales with global timeout changes (vs. hardcoded `test.setTimeout()`)
- Evidence: [playwright-annotations-docs], [excalidraw-e2e]

### 5. Network Interception and Determinism *(NEW — Round 26)*

**Pattern: `page.route()` with three operation modes for deterministic tests**
- `route.fulfill()`: Return mock response without hitting server (most common)
- `route.continue()`: Modify request before it reaches server (add headers, change payloads)
- `route.abort()`: Block requests (analytics, images, offline testing)
- Critical: register route before triggering action
- Evidence: [playwright-network-docs], [grafana-e2e], [calcom-e2e]

**Pattern: External JSON fixtures for mock payloads**
- Store mock API responses in `fixtures/api-responses/*.json`
- Reviewable independent of test logic; shareable across tests
- HAR replay via `page.routeFromHAR()` available but hand-crafted mocks preferred for stability
- Evidence: [testdino-network-mocking], [playwright-mock-api-docs]

### 6. Clock Manipulation *(NEW — Round 26)*

**Pattern: Fixed time for date-dependent UI testing**
- `page.clock.setFixedTime()` — freezes `Date.now()` while timers run naturally
- Use for: calendars, "time since" labels, scheduled content
- Evidence: [playwright-clock-docs]

**Pattern: Install and advance for time-progression testing**
- `page.clock.install()` + `page.clock.fastForward()` — full time control
- Use for: inactivity monitoring, session timeouts, animation testing
- Overrides: `Date`, `setTimeout`, `setInterval`, `requestAnimationFrame`, `performance`
- Critical: `install()` must be called before other clock methods
- Evidence: [playwright-clock-docs], [microsoft-learn-clock]

### 7. Timeout Configuration *(NEW — Round 26)*

**Pattern: Four-layer timeout hierarchy**
1. **Test timeout** (default 30s): `timeout` in config
2. **Expect timeout** (default 5s): `expect.timeout` in config
3. **Action timeout** (default 0/unlimited): `use.actionTimeout` in config
4. **Navigation timeout** (default 0/unlimited): `use.navigationTimeout` in config

Rule of thumb: test timeout = 3-5x expect timeout. Application type determines expect timeout:
- Standard apps: 5s (default)
- Rendering-heavy apps (editors, dashboards): 8-10s
- API-focused tests: 3-5s

Gold suite configuration pattern:
```typescript
export default defineConfig({
  timeout: process.env.CI ? 60_000 : 30_000,
  expect: { timeout: process.env.CI ? 10_000 : 5_000 },
  use: {
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
});
```
- Evidence: [playwright-testconfig-docs], [slate-e2e], [grafana-e2e], [checkly-waits-timeouts]

### 8. ESLint Enforcement *(NEW — Round 24/26)*

**Pattern: 11 assertion/wait rules in recommended eslint-plugin-playwright config**
| Rule | Prevents |
|------|----------|
| `prefer-web-first-assertions` | `isVisible()` in `expect()` — forces auto-retrying matchers |
| `no-wait-for-timeout` | `page.waitForTimeout()` — arbitrary delays |
| `no-wait-for-selector` | `page.waitForSelector()` — redundant with auto-waiting |
| `no-wait-for-navigation` | `page.waitForNavigation()` — deprecated |
| `missing-playwright-await` | Un-awaited assertions — silent pass bug |
| `no-force-option` | `{ force: true }` — bypasses actionability |
| `expect-expect` | Tests without assertions |
| `no-standalone-expect` | `expect()` outside test blocks |
| `no-conditional-expect` | Non-deterministic assertion paths |
| `no-useless-await` | Unnecessary `await` on sync methods |
| `no-useless-not` | `.not.toBeHidden()` when `.toBeVisible()` exists |

**Additional recommended rules beyond default config:**
- `no-conditional-in-test`: Prevents branching logic in tests
- `no-page-pause`: Prevents debug `page.pause()` in committed code
- `prefer-locator`: Suggests locators over page methods

**Critical companion rule:** `@typescript-eslint/no-floating-promises` — second safety net for un-awaited promises

- Evidence: [eslint-plugin-playwright] 60 total rules; [grafana-e2e] recommended preset; [dev.to-catch-missing-await]

### 9. Parallelism Control

**Pattern: Per-project parallelism based on state mutation**
- Tests that mutate shared state run serially; read-only tests run in parallel
- Frequency: 3/10 Gold suites implement per-project control
- Evidence: [immich-e2e] (web: 1 worker serial; ui: 3 workers parallel; maintenance: 1 worker serial)

**Pattern: workers=1 in CI with sharding for scale**
- Official recommendation for stability
- Scale horizontally via `--shard=X/Y` rather than increasing workers
- Evidence: [playwright-ci-docs], [currents-github-actions]

### 10. Artifact Strategy

**Pattern: Minimal artifact capture in production CI**
- Standard: `screenshot: 'only-on-failure'` + `trace: 'retain-on-failure'` + no video
- Only 1/10 Gold suites captures video (AFFiNE)
- Rationale: Traces provide richer debugging data than video; storage costs scale linearly
- Evidence: All 10 Gold suites

**Pattern: `if: always()` in CI for artifact upload**
- Critical in GitHub Actions: ensures artifacts upload even when tests fail
- Missing this means "crucial traces disappear after platform retention windows close"
- Evidence: [devto-ci-integrations]

---

## Emerging Themes

1. **Auto-waiting is the foundation** — Playwright's 6 actionability checks + web-first assertion auto-retry eliminate most explicit waits
2. **Retry counts are environment-specific, not quality-specific** — Higher retries reflect infra complexity (1-5 range across Gold suites)
3. **Traces replace video** — 9/10 Gold suites prefer traces over video for debugging
4. **Flakiness management is disciplined** — Three-tier quarantine (skip/fixme/fail) always paired with issue tracking
5. **Parallelism is nuanced** — Per-project control outperforms global parallel/serial toggle
6. **Five retry mechanisms form a hierarchy** — Implicit (auto-wait, assertion retry) before explicit (toPass, poll, test retry) *(NEW)*
7. **ESLint enforcement prevents five flakiness categories** — Hard waits, stale selectors, deprecated waits, forced actions, silent passes *(NEW)*
8. **Network interception is the primary determinism tool** — `page.route()` with external JSON fixtures *(NEW)*
9. **Clock API enables deterministic time testing** — `setFixedTime` for dates, `install`+`fastForward` for time progression *(NEW)*
10. **Timeout hierarchy has four layers** — Test > expect > action > navigation, each with distinct defaults and tuning *(NEW)*

---

## Resolved Questions (from Validation Phase)

1. **Optimal `expect.timeout` by application type:** 5s standard, 8-10s rendering-heavy, 3-5s API-focused *(Resolved — Round 24)*
2. **Async data loading in assertions:** `toPass()` for non-UI conditions, `expect.poll()` for external API state, `waitForResponse()` + `Promise.all` for network-triggered updates *(Resolved — Round 25)*
3. **`toPass()` retry intervals in practice:** Default `[100, 250, 500, 1000]`; Gold suites use `[1000, 2000, 5000]` for slow backends *(Resolved — Round 25)*
4. **Flaky test rate tracking:** Built-in passed/flaky/failed categorization + `--fail-on-flaky-tests`; custom reporters for trend dashboards are the next maturity frontier *(Resolved — Round 26)*
5. **Custom reporter integrations:** JSON reporter with database aggregation; Gold suites rely on CI platform dashboards rather than custom reporters *(Resolved — Round 26)*

## Open Questions (for Remaining Validation Rounds 27-32)

1. How do Gold suites configure CI parallelism and sharding strategies?
2. What GitHub Actions workflow patterns are used for Playwright CI?
3. How do suites handle cross-browser testing matrix in CI?
4. What artifact retention and cleanup strategies exist?
5. How do suites manage test data across parallel workers?
