# Validation Patterns

## Overview

This document consolidates validation patterns observed across Gold-standard Playwright suites during the landscape phase (rounds 1-11) and refined during the validation deep-dive phase (rounds 23-30). Validation patterns include assertion styles, retry strategies, wait patterns, flakiness management, CI/CD integration, and test isolation approaches.

**Status:** FINAL — rounds 23-32 complete. All patterns validated across 21 suites (10 Gold + 11 Silver). Zero contradictions. DEFINITIVE standards written in `standards/validation-standards.md` and `standards/cicd-standards.md`.

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

**Pattern: workers=1 in CI with sharding for scale** *(EXPANDED — Round 28)*
- Official recommendation for stability: `workers: process.env.CI ? 1 : undefined`
- Scale horizontally via `--shard=X/Y` rather than increasing workers
- Shard count by suite size: <50 tests (0), 50-200 (2-4), 200+ (4-8)
- `fail-fast: false` in GitHub Actions matrix ensures all shards complete
- Evidence: [playwright-ci-docs], [currents-github-actions], [calcom-e2e] 4 shards, [affine-e2e] 6 shards

**Pattern: Four granularity levels of parallelism control** *(NEW — Round 28)*
- Workers (process-level) > Projects (suite-level) > Files (file-level) > Describes (block-level)
- `fullyParallel: true` enables cross-file parallel execution within a worker
- `test.describe.configure({ mode: 'parallel' | 'serial' })` for block-level control
- `workerInfo.workerIndex` for resource partitioning; `workerInfo.parallelIndex` for recycled resource pools
- Evidence: [playwright-parallelism-docs], [ray.run-parallelism]

**Pattern: Worker isolation guarantees test independence** *(NEW — Round 28)*
- Each worker = separate Node.js process with its own browser instance
- Workers share no state (globals, browser context, cookies)
- Worker restarts on test failure with retries enabled (clean state for retry)
- Evidence: [playwright-parallelism-docs]

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

**Pattern: Tiered artifact retention** *(NEW — Round 27)*
- Main branch: 30-day retention for historical regression baselines
- PR branches: 7-day retention (review cycle only)
- Shard-specific artifact naming for merge: `playwright-report-${{ matrix.shard }}`
- Content: HTML reports + `test-results/` (traces, screenshots, diff images)
- Evidence: [affine-e2e], [calcom-e2e], [playwright-ci-docs]

### 11. CI/CD Integration Patterns *(NEW — Rounds 27-28)*

**Pattern: Universal three-step GitHub Actions workflow**
- Step 1: `npm ci` + `npx playwright install --with-deps chromium`
- Step 2: `npx playwright test`
- Step 3: `actions/upload-artifact@v4` with `if: always()`
- `--with-deps` installs OS-level dependencies; selective browser install saves ~400MB
- Evidence: All 10 Gold suites; [playwright-ci-docs]

**Pattern: Sharded CI with blob reporter + merge-reports**
- `reporter: [['blob'], ['github']]` in CI config for mergeable report fragments
- Post-job: `npx playwright merge-reports --reporter=html ./all-blob-reports`
- Required for any suite using `--shard=N/M`
- Evidence: [calcom-e2e], [affine-e2e], [playwright-ci-docs]

**Pattern: Docker execution requires `--init` and `--ipc=host`**
- `mcr.microsoft.com/playwright:v1.50.0-noble` official image with pre-installed browsers
- `--init` prevents zombie browser processes; `--ipc=host` (or `--shm-size=1gb`) prevents Chromium SIGBUS crashes
- Pin image version to match `@playwright/test` npm version
- 4/10 Gold suites use Docker image; 6/10 use `npx playwright install --with-deps`
- Evidence: [playwright-docker-docs], [immich-e2e], [affine-e2e]

**Pattern: `process.env.CI` as universal configuration switch**
- Gates: workers, retries, timeouts, reporters, artifacts, `forbidOnly`
- Set automatically by GitHub Actions, GitLab CI, CircleCI, and all major CI platforms
- `forbidOnly: !!process.env.CI` prevents `.only()` commits from skipping tests
- Evidence: All 10 Gold suites; [playwright-ci-docs]

**Pattern: CI reporter stack — github + blob + junit**
- `github` reporter: inline failure annotations on PR diffs (8/10 Gold suites)
- `blob` reporter: mergeable fragments for sharded runs
- `junit` reporter: machine-readable XML for dashboard integrations (Allure, Currents)
- `html` reporter: human-readable artifact for download
- Evidence: [grafana-e2e], [calcom-e2e], [devto-ci-integrations]

**Pattern: Browser caching saves 30-60s per CI job**
- Cache `~/.cache/ms-playwright` keyed on `hashFiles('package-lock.json')`
- Conditional install: `if: steps.playwright-cache.outputs.cache-hit != 'true'`
- Alternative: Docker image eliminates caching complexity entirely
- Evidence: [currents-github-actions], [grafana-e2e]

**Pattern: Two-tier PR gate — smoke + full suite**
- Tier 1 (every PR): `--grep @smoke`, single shard, <5 minutes, required check
- Tier 2 (merge to main): full suite with sharding, all browsers, <15 minutes
- AFFiNE: explicit two-tier; Cal.com: single-tier fast via shards; Grafana: implicit via `paths` filter
- Evidence: [affine-e2e], [calcom-e2e], [grafana-e2e]

**Pattern: Cost optimization techniques — six proven strategies**
1. `paths` filter: skip e2e when only non-test files change
2. Browser caching: 30-60s savings per job
3. Selective browser install: Chromium-only unless cross-browser required
4. `maxFailures`: early abort on cascading failures
5. Shard balancing: distribute by historical duration (advanced)
6. Docker image: eliminate browser install entirely
- Evidence: [grafana-e2e], [calcom-e2e], [currents-github-actions]

**Pattern: Chromium-primary cross-browser strategy**
- 6/10 Gold suites: Chromium-only in CI
- 3/10: Full browser matrix via CI (Grafana, Slate, Excalidraw)
- Compromise: Chromium in CI, cross-browser on nightly schedule
- Evidence: [playwright-ci-docs], [grafana-e2e], [calcom-e2e], [slate-e2e]

### 12. Test Isolation and Environment Management *(NEW — Rounds 29-30)*

**Pattern: Three-layer test isolation model**
- Layer 1 — Browser context (automatic): fresh cookies, localStorage, sessionStorage per test
- Layer 2 — Application state (manual): fixture-based API cleanup with automatic teardown
- Layer 3 — Infrastructure (CI): fresh Docker containers, database migration + seed
- Evidence: [playwright-fixtures-docs], [grafana-e2e], [calcom-e2e], [immich-e2e]

**Pattern: `storageState` with setup projects for auth isolation**
- Setup project authenticates once, saves to `.auth/user.json`
- Test projects declare `dependencies: ['setup']` and `use: { storageState }`
- Multi-role: separate `.auth/*.json` files per role (user, admin)
- `.auth/` directory must be in `.gitignore`
- 7/10 Gold suites use this pattern; API-based auth faster when available
- Evidence: [playwright-auth-docs], [calcom-e2e], [grafana-e2e], [immich-e2e]

**Pattern: Database seeding — migration + seed as consensus**
- Strategy 1 (4/10): Migration + seed script before tests (Cal.com, freeCodeCamp)
- Strategy 2 (2/10): Docker Compose with pre-seeded database (Immich)
- Strategy 3 (3/10): API-based data creation per test (Grafana)
- Consensus: migration + seed for baseline, API-based for test-specific data
- Evidence: [calcom-e2e], [immich-e2e], [grafana-e2e], [freecodecamp-e2e]

**Pattern: Layered environment variable management**
- Layer 1: Defaults in `playwright.config.ts` (`process.env.X || 'default'`)
- Layer 2: `.env.test` (committed, non-sensitive) and `.env.local` (gitignored)
- Layer 3: CI secrets via `${{ secrets.X }}` for sensitive values
- Sensitive values never appear in committed files
- Evidence: [calcom-e2e], [grafana-e2e], [freecodecamp-e2e]

**Pattern: `baseURL` from environment variable with sensible defaults**
- `baseURL: process.env.BASE_URL || 'http://localhost:3000'`
- Tests use relative URLs (`page.goto('/')`) — `baseURL` handles the rest
- Enables: local, staging, preview, and production execution from same tests
- Evidence: [calcom-e2e], [grafana-e2e], [playwright-ci-docs]

**Pattern: `webServer` with `reuseExistingServer: !process.env.CI` consensus**
- Locally: reuses running server (developer convenience, preserves hot-reload)
- In CI: starts fresh server (deterministic, clean state)
- Conditionally omitted when `BASE_URL` is set (external server already running)
- 5/10 Gold suites use `webServer`; 5/10 manage servers externally (Docker Compose)
- Evidence: [playwright-webserver-docs], [calcom-e2e], [freecodecamp-e2e], [excalidraw-e2e]

**Pattern: Project dependencies replace `globalSetup` for auth** *(NEW — Round 30)*
- `globalSetup` lacks: fixture access, trace files, report visibility, per-worker isolation
- Project dependencies provide all of these and are the modern standard
- `globalSetup` reserved for infrastructure-only tasks (Docker, database migration)
- 6/10 Gold suites migrated to project dependencies; 3/10 still use `globalSetup` for infra
- Evidence: [playwright-auth-docs], [playwright-global-setup-docs], [calcom-e2e]

**Pattern: Preview deployment testing via `deployment_status` event**
- Vercel/Netlify trigger `deployment_status` event when preview is ready
- Preview URL injected as `BASE_URL` environment variable
- Focus on critical paths (not full suite) — preview data may differ from staging
- Evidence: [calcom-e2e], [vercel-docs]

**Pattern: Three-tier multi-environment execution strategy**
- Tier 1 — Local: full suite, `webServer`, seeded database, multi-worker
- Tier 2 — Staging/Preview: full suite, external server, `workers: 1`
- Tier 3 — Production: `@smoke` tests only, read-only, no retries
- Config: conditionally disable `webServer` when `BASE_URL` is set
- Evidence: [calcom-e2e], [grafana-e2e], [currents-multi-env]

**Pattern: Test data isolation across parallel workers**
- Unique data per test via timestamps/UUIDs in API creation
- Worker-indexed resources via `workerInfo.workerIndex` for expensive shared state
- Namespace isolation: unique identifiers prevent cross-worker data collision
- Fixture-based cleanup ensures teardown even on test failure
- Evidence: [playwright-parallelism-docs], [grafana-e2e], [calcom-e2e], [immich-e2e]

**Pattern: Dedicated test accounts with least privilege for auth in CI**
- Test accounts stored as CI secrets; separate from production accounts
- Minimal permissions (principle of least privilege)
- Self-hosted backends use seeded test users (no CI secrets needed)
- `.auth/` directory gitignored; Playwright masks env vars in traces
- Evidence: [calcom-e2e], [grafana-e2e], [immich-e2e]

---

## Emerging Themes

1. **Auto-waiting is the foundation** — Playwright's 6 actionability checks + web-first assertion auto-retry eliminate most explicit waits
2. **Retry counts are environment-specific, not quality-specific** — Higher retries reflect infra complexity (1-5 range across Gold suites)
3. **Traces replace video** — 9/10 Gold suites prefer traces over video for debugging
4. **Flakiness management is disciplined** — Three-tier quarantine (skip/fixme/fail) always paired with issue tracking
5. **Parallelism is nuanced** — Per-project control outperforms global parallel/serial toggle
6. **Five retry mechanisms form a hierarchy** — Implicit (auto-wait, assertion retry) before explicit (toPass, poll, test retry)
7. **ESLint enforcement prevents five flakiness categories** — Hard waits, stale selectors, deprecated waits, forced actions, silent passes
8. **Network interception is the primary determinism tool** — `page.route()` with external JSON fixtures
9. **Clock API enables deterministic time testing** — `setFixedTime` for dates, `install`+`fastForward` for time progression
10. **Timeout hierarchy has four layers** — Test > expect > action > navigation, each with distinct defaults and tuning
11. **`workers=1 + sharding` is the CI parallelism consensus** — Horizontal scaling via matrix strategy, not vertical via workers *(NEW — Round 27-28)*
12. **`process.env.CI` gates all CI-vs-local differences** — Workers, retries, timeouts, reporters, artifacts, `forbidOnly` *(NEW — Round 27)*
13. **Three-layer test isolation** — Browser context (automatic) + application state (fixture cleanup) + infrastructure (Docker/seeds) *(NEW — Round 29)*
14. **`storageState` with setup projects** is the universal auth pattern — replaces `globalSetup` for auth *(NEW — Round 29)*
15. **`reuseExistingServer: !process.env.CI`** is a universal consensus with zero exceptions in Gold suites *(NEW — Round 30)*
16. **Multi-environment execution via `baseURL`** — Same tests target local, staging, preview, production via environment variable *(NEW — Round 30)*

---

## Resolved Questions (from Validation Phase)

1. **Optimal `expect.timeout` by application type:** 5s standard, 8-10s rendering-heavy, 3-5s API-focused *(Resolved — Round 24)*
2. **Async data loading in assertions:** `toPass()` for non-UI conditions, `expect.poll()` for external API state, `waitForResponse()` + `Promise.all` for network-triggered updates *(Resolved — Round 25)*
3. **`toPass()` retry intervals in practice:** Default `[100, 250, 500, 1000]`; Gold suites use `[1000, 2000, 5000]` for slow backends *(Resolved — Round 25)*
4. **Flaky test rate tracking:** Built-in passed/flaky/failed categorization + `--fail-on-flaky-tests`; custom reporters for trend dashboards are the next maturity frontier *(Resolved — Round 26)*
5. **Custom reporter integrations:** JSON reporter with database aggregation; Gold suites rely on CI platform dashboards rather than custom reporters *(Resolved — Round 26)*
6. **CI parallelism and sharding strategies:** `workers=1` per shard + `--shard=N/M` matrix; shard count scales with suite size (2-8 shards); `fail-fast: false` ensures all shards complete *(Resolved — Round 27-28)*
7. **GitHub Actions workflow patterns:** Universal three-step (install > browsers > test) + `if: always()` artifact upload; blob reporter for sharded runs; github reporter for PR annotations *(Resolved — Round 27)*
8. **Cross-browser testing in CI:** Chromium-primary (6/10 Gold suites); full matrix only when product requires; nightly cross-browser as compromise *(Resolved — Round 28)*
9. **Artifact retention and cleanup:** Tiered: main branch 30d, PR 7d; shard-specific naming; traces + screenshots on failure only *(Resolved — Round 27)*
10. **Test data isolation across parallel workers:** Unique data via timestamps/UUIDs; `workerIndex` for resource partitioning; fixture-based cleanup ensures teardown *(Resolved — Round 29-30)*

## Open Questions (Resolved or Deferred)

1. ~~What accessibility testing patterns integrate with Playwright validation?~~ **Partially resolved:** `toMatchAriaSnapshot()` and `toHaveNoA11yViolations` documented. Full treatment deferred to security/accessibility phase (rounds 37-40). *(Round 31)*
2. ~~How do Gold suites implement visual regression testing at scale?~~ **Resolved:** `toHaveScreenshot()` with `maxDiffPixels`, `animations: 'disabled'`, environment-controlled baselines. Documented in V1.5 and V5 standards. *(Round 31)*
3. ~~What are the recommended Playwright configuration templates for new projects?~~ **Deferred:** To Task 17 (templates and checklist). *(Round 32)*
4. ~~How do suites handle test maintenance and refactoring at scale?~~ **Partially resolved:** Through POM, fixture, and isolation standards. Full treatment in cross-validation phase. *(Round 32)*

## Round 31 Validation Sweep Summary

Round 31 scanned 11 Silver-standard suites (Supabase, Appwrite, Directus, Outline, Strapi, NocoDB, Hoppscotch, Logto, n8n, Twenty, Wiki.js) plus 3 recently published best-practices guides. Key findings:

- **Web-first assertions:** 21/21 suites (100%) — truly universal
- **Retry-infrastructure correlation confirmed:** 1 retry (simple) through 3+ (complex Docker)
- **`reuseExistingServer: !process.env.CI`:** 9/9 suites using `webServer` — strongest consensus pattern
- **Guard assertions:** 18/21 suites (86%) — should be a standard recommendation
- **`forbidOnly`:** 11/21 (52%) — promoted to MUST based on risk (silent test skipping)
- **`maxFailures`:** 3/21 (14%) — recommended but not universal enough for MUST
- **No contradictions found** across any domain

## Standards Written (Round 32)

DEFINITIVE versions of:
- `standards/validation-standards.md` — 24 standards across 6 domains (V1-V6)
- `standards/cicd-standards.md` — 24 standards across 7 domains (C1-C7)
- `standards/quality-criteria.md` — Q5 validation quality rubric with 5 maturity levels and 6-domain scoring
