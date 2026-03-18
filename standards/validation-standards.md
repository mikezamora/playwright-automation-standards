# Validation Standards

> **PRELIMINARY — to be validated in phases 2-7 (rounds 13-55)**
> This document contains initial standards based on landscape observations from rounds 1-12.
> All recommendations should be treated as starting points subject to revision as deeper analysis is conducted.

---

## V1. Assertions

### V1.1 Use web-first assertions as the primary validation mechanism
- All visibility, text, and state assertions MUST use web-first assertions
- Preferred: `expect(locator).toBeVisible()`, `expect(locator).toHaveText()`, `expect(locator).toBeEnabled()`
- These auto-retry until condition is met or timeout expires
- **Basis:** 10/10 Gold suites (universal); [playwright-best-practices]

### V1.2 Follow the locator priority hierarchy
- Locator selection MUST follow this priority:
  1. `getByRole()` — most semantic, accessibility-aligned
  2. `getByText()` — user-visible text
  3. `getByLabel()` — form labels
  4. `getByPlaceholder()` — input placeholders
  5. `getByTestId()` — explicit test attribute (last resort)
- CSS selectors and XPath SHOULD NOT be used except as a documented last resort
- **Basis:** [freecodecamp-e2e contributor guide, playwright-best-practices]

### V1.3 Ban `page.waitForTimeout()`
- `page.waitForTimeout()` MUST NOT be used in production test suites
- Enforce via ESLint rule: `no-wait-for-timeout` from eslint-plugin-playwright
- Replace with: web-first assertions, `waitForResponse()`, `waitForURL()`, `toPass()`
- **Basis:** [eslint-plugin-playwright, browserstack-waitfortimeout]; universal Gold suite practice

### V1.4 Use `toPass()` for complex retry scenarios
- When multiple assertions must pass together, wrap in `expect(async () => { ... }).toPass()`
- Configure intervals and timeouts appropriate to the scenario
- **Basis:** [semaphore-flaky-tests, playwright-retries-docs]

---

## V2. Retry Strategy

### V2.1 Configure retries by environment, not globally
- CI retries SHOULD be 1-4 based on infrastructure complexity
- Local retries SHOULD be 0 (fail fast for immediate feedback)
- Higher retry counts reflect environment complexity, not test quality
- **Basis:** [grafana-e2e: 1 CI, calcom-e2e: 2 CI, affine-e2e: 3 CI, immich-e2e: 4 CI]

### V2.2 Use `trace: 'retain-on-failure'` as the default trace strategy
- Captures traces for every run but only retains on failure
- Alternative: `'on-first-retry'` for lower overhead (captures only on first retry)
- NEVER use `trace: 'on'` in CI (performance-heavy)
- NEVER use `trace: 'off'` in CI (loses debugging data)
- **Basis:** 7/10 Gold suites use `retain-on-failure`; 1/10 uses `on-first-retry`

### V2.3 Set `maxFailures` for CI cost control
- CI configurations SHOULD set `maxFailures` to prevent cascading failure waste
- Recommended: `maxFailures: 10` as starting point
- **Basis:** [calcom-e2e: `maxFailures: 10`]

---

## V3. Wait Patterns

### V3.1 Rely on built-in auto-waiting
- Playwright performs 6 actionability checks before actions: visible, enabled, stable, receives events, attached, editable
- Do NOT add explicit waits before standard interactions
- **Basis:** [playwright-auto-wait-docs]

### V3.2 Use event-based waits for network operations
- `page.waitForResponse()` — wait for specific API responses
- `page.waitForURL()` — wait for navigation completion
- `page.waitForLoadState('domcontentloaded')` — wait for page ready state
- **Basis:** [calcom-flaky-fix-pr: replaced blind reload() with reload({ waitUntil: "domcontentloaded" })]

---

## V4. Flakiness Management

### V4.1 Follow the three-step flaky remediation pattern
1. Replace generic waits with explicit conditions
2. Add visibility assertions before interactions
3. Use scoped locators to reduce ambiguity
- **Basis:** [calcom-flaky-fix-pr PR #23487]

### V4.2 Quarantine with tracking, never permanently
- Use `test.skip()`, `test.fixme()`, or `--grep-invert` for quarantine
- ALWAYS pair with a GitHub issue or TODO comment for tracking
- Target: <2% flaky test rate
- Quarantine is a short-term emergency measure, not a permanent strategy
- **Basis:** [calcom-e2e, freecodecamp-e2e, grafana-e2e, testdino-flaky-tests]

### V4.3 Reproduce flaky tests with `--repeat-each`
- Use `--repeat-each=100` to surface intermittent failures during investigation
- **Basis:** [charpeni-flaky-repro]

---

## V5. Parallelism

### V5.1 Control parallelism per-project based on state mutation
- Tests that modify shared state SHOULD run serially (1 worker)
- Read-only tests SHOULD run in parallel
- Avoid global `fullyParallel: true` unless all tests are stateless
- **Basis:** [immich-e2e: web 1 worker serial, ui 3 workers parallel]

### V5.2 Use workers=1 per shard in CI
- Within each CI shard, use 1 worker for stability
- Scale horizontally via `--shard=X/Y` rather than increasing workers per machine
- **Basis:** [playwright-ci-docs]; official recommendation

---

## Revision History

| Date | Change | Basis |
|---|---|---|
| 2026-03-18 | Initial draft from landscape rounds 1-12 | 10 Gold suites, 12 Silver, ~97 total sources |
