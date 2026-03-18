# Round 25 — Findings

**Phase:** Validation
**Focus:** Deep dive on retry and flakiness management — retry configuration, flaky test handling, wait strategies

---

## Finding 1: Retry counts across Gold suites encode infrastructure complexity — a validated correlation

Updated analysis with expanded data:

| Suite | CI Retries | Local Retries | Infrastructure |
|-------|-----------|---------------|----------------|
| Grafana | 1 | 0 | Direct server, simple compose |
| Cal.com | 2 | 0 | Monorepo, Prisma, multiple services |
| AFFiNE | 3 | 0 | 9 test packages, complex build |
| Immich | 4 | 0 | Docker Compose orchestration, 5+ containers |
| Slate | 5 | 0 | Cross-platform rendering, editor instability |

The correlation holds: simpler infrastructure = fewer retries. Retries are a cost signal, not a quality signal. Every retry adds wall-clock time: a 3-retry suite takes up to 4x the time of a 0-retry suite for failing tests.

`test.describe.configure({ retries: N })` allows per-group overrides for known-unstable areas without inflating the global retry count.

- **Evidence:** [grafana-e2e] 1 CI retry; [calcom-e2e] 2 CI retries; [affine-e2e] 3 CI retries; [immich-e2e] 4 CI retries; [slate-e2e] 5 CI retries; [playwright-retries-docs] per-describe configuration
- **Implication:** Standard recommendation: 2 retries in CI, 0 locally. Increase only when infrastructure complexity demands it.

## Finding 2: Playwright's test categorization system (passed/flaky/failed) provides built-in flaky detection

When retries are enabled, Playwright automatically categorizes test outcomes:
- **"passed"** — succeeded on first run
- **"flaky"** — failed on initial run but passed after retry
- **"failed"** — failed on all retry attempts

The `--fail-on-flaky-tests` CLI flag converts "flaky" from a warning to a failure, enforcing flaky-free CI. This is the most underutilized built-in feature: only 2/10 Gold suites use it.

Runtime retry metadata via `testInfo.retry` enables conditional behavior:
```typescript
test('state-dependent test', async ({ page }, testInfo) => {
  if (testInfo.retry) await cleanServerCache();
  // ... test logic
});
```

- **Evidence:** [playwright-retries-docs] passed/flaky/failed categorization; `--fail-on-flaky-tests` flag; `testInfo.retry` API
- **Implication:** Enable `--fail-on-flaky-tests` in CI to prevent flaky test accumulation; use `testInfo.retry` for retry-aware cleanup

## Finding 3: The quarantine pattern has three tiers with distinct mechanisms and urgency levels

Gold suites use three annotation-based quarantine tiers:

**Tier 1 — `test.skip(condition, reason)`: Conditional skip**
- Used for: platform-specific tests, feature-flagged tests, known environment issues
- Example: `test.skip(process.env.CI === 'true', 'Flaky in CI — issue #1234')`
- Always paired with issue reference
- Evidence: [calcom-e2e] `test.skip()` + TODO; [slate-e2e] platform-conditional skip

**Tier 2 — `test.fixme()`: Known broken, not worth running**
- Used for: tests that crash, hang, or are extremely slow
- Playwright does not run the test at all (saves CI time)
- Evidence: [grafana-e2e] `test.fixme()` + issue reference

**Tier 3 — `test.fail()`: Expected failure, still runs**
- Used for: documenting known bugs while keeping regression visibility
- Test runs and Playwright verifies it actually fails (alerts if the bug is accidentally fixed)
- Evidence: [playwright-annotations-docs] `test.fail()` semantics

Additional quarantine mechanism: `--grep-invert` pattern with `@quarantined` tag for bulk exclusion without modifying test files.

- **Evidence:** [playwright-annotations-docs] skip/fixme/fail semantics; [calcom-e2e], [grafana-e2e], [freecodecamp-e2e] quarantine patterns; [ray.run-flaky-tests] quarantine tag pattern
- **Implication:** All quarantine decisions must include an issue reference and a fix deadline; quarantine without tracking becomes permanent technical debt

## Finding 4: Playwright's auto-waiting performs six actionability checks — making most explicit waits unnecessary

Before every action (click, fill, type, etc.), Playwright automatically checks:
1. **Attached** — element is in the DOM
2. **Visible** — element has non-zero bounding box and is not `display: none`
3. **Stable** — element is not animating (two consecutive frames at same position)
4. **Receives Events** — element is not obscured by another element
5. **Enabled** — element is not `disabled`
6. **Editable** — element is `contenteditable` or an `<input>` (for fill/type only)

This means explicit waits are needed only for:
- **Network events:** `page.waitForResponse()` after triggering API calls
- **URL changes:** `page.waitForURL()` after navigation triggers
- **Page load states:** `page.waitForLoadState('domcontentloaded')` in rare cases
- **Non-UI conditions:** `toPass()` or `expect.poll()` for backend state

The ESLint rules `no-wait-for-selector` and `no-wait-for-timeout` enforce this: `waitForSelector()` is redundant with locator auto-waiting; `waitForTimeout()` is never appropriate.

- **Evidence:** [playwright-auto-wait-docs] six actionability checks; [eslint-plugin-playwright] `no-wait-for-selector`, `no-wait-for-timeout` rules; [checkly-waits-timeouts] explicit wait categorization
- **Implication:** Explicit waits should be limited to network/navigation events; all element interaction should rely on auto-waiting

## Finding 5: The `page.waitForResponse()` pattern has a specific coordination requirement — Promise.all

The correct pattern for waiting for a network response triggered by a user action requires parallel coordination:

```typescript
// CORRECT: wait and action run in parallel
const [response] = await Promise.all([
  page.waitForResponse(resp => resp.url().includes('/api/data') && resp.status() === 200),
  page.getByRole('button', { name: 'Save' }).click(),
]);
expect(response.status()).toBe(200);

// ANTI-PATTERN: race condition — response may arrive before waitForResponse is set up
await page.getByRole('button', { name: 'Save' }).click();
const response = await page.waitForResponse('/api/data');  // may miss it
```

Gold suites use this `Promise.all` pattern consistently for API-triggered assertions.

- **Evidence:** [browserstack-waitforresponse] Promise.all coordination pattern; [checkly-waits-timeouts] waitForResponse best practices; [calcom-e2e] API wait patterns
- **Implication:** All `waitForResponse` calls must be set up before the triggering action — `Promise.all` is the standard pattern

## Finding 6: The `test.slow()` annotation is an underused alternative to per-test timeout overrides

`test.slow()` triples the default timeout for a specific test, providing a declarative signal that the test is expected to take longer:

```typescript
test('complex workflow', async ({ page }) => {
  test.slow(); // timeout: 30s * 3 = 90s
  // ... long-running test
});
```

This is preferable to `test.setTimeout(90_000)` because:
- It communicates intent ("this test is slow") rather than a magic number
- It scales with global timeout changes
- It appears in test reports as a "slow" annotation

Gold suites use `test.slow()` for rendering-heavy tests (Excalidraw visual comparisons, Grafana dashboard loading).

- **Evidence:** [playwright-annotations-docs] `test.slow()` triples timeout; [excalidraw-e2e] slow annotation usage
- **Implication:** Prefer `test.slow()` over explicit timeout values for known slow tests; the annotation is self-documenting

## Finding 7: Serial retry behavior creates implicit test dependencies that require careful management

When `test.describe.serial()` is combined with retries, Playwright retries the entire serial group from the first failed test, not just the failed test. This means:
- All tests in the serial group re-run (including previously-passed tests)
- `beforeAll` hooks re-run for the group
- State from previous runs is discarded

This is correct for truly dependent tests (e.g., create-then-verify flows) but wasteful for tests that are serial only for resource reasons (e.g., single database).

```typescript
test.describe.serial('user lifecycle', () => {
  test('create user', async ({ page }) => { /* ... */ });
  test('edit user', async ({ page }) => { /* ... */ });   // depends on create
  test('delete user', async ({ page }) => { /* ... */ }); // depends on create
});
// If 'edit user' fails, ALL THREE tests re-run on retry
```

- **Evidence:** [playwright-retries-docs] serial retry behavior; [immich-e2e] serial tests with retries for API lifecycle tests
- **Implication:** Use `test.describe.serial()` only for true dependencies; prefer independent tests with fixture-based setup for resource-sharing scenarios
