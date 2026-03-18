# Round 26 — Findings

**Phase:** Validation
**Focus:** Deep dive on retry and flakiness management — network interception, clock manipulation, timeout strategies, ESLint enforcement

---

## Finding 1: Network interception via `page.route()` is the primary determinism strategy — with three distinct operation modes

`page.route()` supports three operations on intercepted requests:

**`route.fulfill()`** — Return mock response without hitting the server:
```typescript
await page.route('**/api/users', route => route.fulfill({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify([{ id: 1, name: 'Alice' }]),
}));
```
Use for: third-party APIs, unstable backends, deterministic test data.

**`route.continue()`** — Modify request before it reaches the server:
```typescript
await page.route('**/api/data', route => route.continue({
  headers: { ...route.request().headers(), 'X-Test': 'true' },
}));
```
Use for: adding test headers, modifying request payloads.

**`route.abort()`** — Block requests entirely:
```typescript
await page.route('**/*.{png,jpg,jpeg}', route => route.abort());
```
Use for: performance testing, blocking analytics/tracking, testing offline behavior.

Critical rule: register `page.route()` before triggering the action that causes the network request. Otherwise the request may complete before the route handler is installed.

- **Evidence:** [playwright-network-docs] three route operations; [playwright-mock-api-docs] fulfill patterns; [oneuptime-network-interception] implementation guide; [grafana-e2e] fixture-based route setup
- **Implication:** Mock only specific routes (not `**/*`); store mock payloads in external JSON fixture files; register routes before triggering actions

## Finding 2: Mock payload management follows the "external JSON fixtures" pattern in Gold suites

Gold suites store mock API responses as separate JSON files rather than inline in test code:

```
tests/
  fixtures/
    api-responses/
      users-list.json
      user-detail.json
      error-response.json
  specs/
    user-dashboard.spec.ts
```

Benefits:
- Mock data is reviewable independent of test logic
- Multiple tests can share the same mock responses
- Mock data can be generated from real API responses (HAR recording)
- Changes to mock structure are visible in code review diffs

Playwright also supports HAR replay via `page.routeFromHAR()` for recording and replaying full request/response sequences, though Gold suites prefer hand-crafted mocks for stability.

- **Evidence:** [testdino-network-mocking] fixture-based mock storage; [playwright-mock-api-docs] HAR replay; [testleaf-api-mocking] mock response alignment
- **Implication:** Store mock payloads in `fixtures/api-responses/` alongside test files; keep mock data aligned with real API schema; prefer hand-crafted mocks over HAR replay for stability

## Finding 3: Clock API enables deterministic time-dependent testing with two primary patterns

**Pattern 1 — Fixed Time (most common):**
```typescript
// Freeze Date.now() while timers still run
await page.clock.setFixedTime(new Date('2026-01-15T10:00:00'));
await page.goto('/dashboard');
await expect(page.getByTestId('current-date')).toHaveText('January 15, 2026');
```
Use for: date-dependent UI (calendars, "time since" labels, scheduled displays).

**Pattern 2 — Install and Advance (time progression):**
```typescript
// Take full control of time, then fast-forward
await page.clock.install({ time: new Date('2026-01-15T08:00:00') });
await page.goto('/session');
await page.clock.fastForward('30:00'); // advance 30 minutes
await expect(page.getByText('Session timeout warning')).toBeVisible();
```
Use for: inactivity monitoring, session timeouts, animation testing, scheduled tasks.

Critical ordering: `install()` must be called before any other clock method. The Clock API overrides `Date`, `setTimeout`, `setInterval`, `requestAnimationFrame`, and `performance` APIs.

- **Evidence:** [playwright-clock-docs] setFixedTime and install/fastForward patterns; [microsoft-learn-clock] code samples; [testingwithedd-clock] real-world inactivity monitoring example
- **Implication:** Use `setFixedTime` as the default approach; resort to `install()` + `fastForward()` only when time progression is needed

## Finding 4: The timeout hierarchy has four configurable layers — misunderstanding this hierarchy causes both flakiness and slowness

Four timeout levels, from broadest to narrowest:
1. **Test timeout** (default 30s): `timeout` in config — maximum for entire test
2. **Expect timeout** (default 5s): `expect.timeout` in config — maximum per auto-retrying assertion
3. **Action timeout** (default 0/unlimited): `actionTimeout` in config — maximum per action (click, fill)
4. **Navigation timeout** (default 0/unlimited): `navigationTimeout` in config — maximum per navigation

Common misconfiguration: setting test timeout too close to expect timeout. If a test has 5 assertions at 5s each, the test timeout must be at least 25s + action time.

Gold suite configuration patterns:
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

- **Evidence:** [playwright-testconfig-docs] four timeout levels; [checkly-waits-timeouts] timeout hierarchy; [slate-e2e] `actionTimeout: 0` for editor (infinite); [grafana-e2e] CI/local timeout split
- **Implication:** Test timeout should be 3-5x the expect timeout; action timeout should be between expect and test timeout; navigation timeout can equal test timeout

## Finding 5: The `--repeat-each=100` technique is the standard flaky test reproduction method

When a test is suspected flaky, the diagnostic workflow is:
1. **Isolate:** Run the test alone: `npx playwright test path/to/test.spec.ts`
2. **Repeat:** Run it many times: `npx playwright test --repeat-each=100 path/to/test.spec.ts`
3. **Analyze:** Check if any of the 100 runs fail (even 1% failure rate = flaky)
4. **Fix:** Apply the appropriate fix (web-first assertions, guard assertions, network mocking)
5. **Verify:** Run `--repeat-each=100` again to confirm the fix

The `--fail-on-flaky-tests` flag can be combined with `--retries=2` and `--repeat-each=10` in CI to automatically catch newly introduced flakiness:
```bash
npx playwright test --retries=2 --fail-on-flaky-tests
```

- **Evidence:** [charpeni-flaky-repro] `--repeat-each=100` technique; [playwright-retries-docs] `--fail-on-flaky-tests` flag; [browserstack-flaky-tests] diagnostic workflow
- **Implication:** Add `--repeat-each=100` to the flaky test investigation playbook; consider `--fail-on-flaky-tests` in CI as a quality gate

## Finding 6: ESLint enforcement of wait/retry patterns prevents five categories of flakiness

Mapping ESLint rules to the flakiness categories they prevent:

| Flakiness Category | ESLint Rule | What It Prevents |
|-------------------|-------------|------------------|
| Hard waits | `no-wait-for-timeout` | `page.waitForTimeout()` — arbitrary delays |
| Stale selectors | `no-wait-for-selector` | `page.waitForSelector()` — replaced by locator auto-wait |
| Deprecated waits | `no-wait-for-navigation` | `page.waitForNavigation()` — replaced by `waitForURL()` |
| Forced actions | `no-force-option` | `{ force: true }` — bypasses actionability checks |
| Silent passes | `missing-playwright-await` | Un-awaited assertions that silently pass |

Additional rules for determinism:
- `no-conditional-expect`: Prevents non-deterministic assertion paths
- `no-conditional-in-test`: Prevents branching logic in tests
- `no-page-pause`: Prevents debug `page.pause()` in committed code

These 8 rules collectively prevent the five most common flakiness sources observed across the Playwright ecosystem.

- **Evidence:** [eslint-plugin-playwright] rule taxonomy; [testdino-automation-checklist] ESLint configuration for flaky test reduction
- **Implication:** Enable all 8 rules in the recommended config; add `no-conditional-in-test` and `no-page-pause` beyond the default recommended set

## Finding 7: Retry metadata enables sophisticated CI dashboarding — but adoption is low

Playwright provides retry metadata through multiple channels:
- `testInfo.retry` — current retry attempt number (0-based)
- Test result categorization: passed/flaky/failed
- JSON reporter output includes retry history per test
- Custom reporters can aggregate flaky test trends over time

Advanced pattern: track flaky test trends using a custom reporter that writes to a database:
```typescript
class FlakyTracker implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'passed' && result.retry > 0) {
      // Log to dashboard: this test is flaky
      db.insert({ test: test.title, retryCount: result.retry, date: new Date() });
    }
  }
}
```

Gold suites do not implement custom flaky tracking reporters — they rely on CI platform dashboards (GitHub Actions summary, Currents, Allure). This is an opportunity for improvement in the ecosystem.

- **Evidence:** [playwright-retries-docs] `testInfo.retry` API and test categorization; [vasu31dev-e2e] custom logger reporter pattern
- **Implication:** Custom flaky-tracking reporters are the next maturity frontier; most teams should start with `--fail-on-flaky-tests` and evolve to dashboard tracking

## Finding 8: The five Playwright retry mechanisms form a hierarchy from implicit to explicit

Complete retry mechanism hierarchy (implicit to explicit):

1. **Actionability auto-wait** (implicit): 6 checks before every action — no configuration needed
2. **Locator assertion auto-retry** (implicit): Web-first assertions retry until timeout — configured via `expect.timeout`
3. **`toPass()` block retry** (explicit): Retries entire assertion block — configured via `intervals` and `timeout`
4. **`expect.poll()` polling** (explicit): Polls a function value — configured via `intervals` and `timeout`
5. **Test-level retry** (explicit): Re-runs entire test on failure — configured via `retries` in config

The principle: use the most implicit mechanism that handles your case. Only escalate to the next level when the previous one is insufficient.

- **Evidence:** [timdeschryver-retry-apis] five-mechanism comparison; [playwright-assertions-docs] auto-retry; [playwright-retries-docs] test retries; [playwright-auto-wait-docs] actionability checks
- **Implication:** Most tests should never need mechanisms 3-5; if a test requires `toPass()` or test-level retries, the root cause is likely a missing auto-waiting assertion or a non-deterministic test setup
