# Validation Patterns

## Overview

This document consolidates validation patterns observed across Gold-standard Playwright suites during the landscape phase (rounds 1-11). Validation patterns include assertion styles, retry strategies, wait patterns, flakiness management, and test stability approaches.

**Status:** Initial synthesis — to be refined in validation phase (rounds 23-32)

---

## Observed Patterns

### 1. Assertion Styles

**Pattern: Web-first assertions as the primary validation mechanism**
- Frequency: 10/10 Gold suites (universal)
- Preferred: `expect(locator).toBeVisible()`, `expect(locator).toHaveText()`, `expect(locator).toBeEnabled()`
- These auto-retry until condition is met or timeout expires
- Evidence: [playwright-official] (defines the pattern), [browserstack-best-practices] (top-3 recommendation), all Gold suites

**Pattern: Locator priority hierarchy**
- Recommended order: `getByRole()` > `getByText()` > `getByTestId()` > `getByLabel()` > CSS/XPath (last resort)
- Frequency: Explicitly documented in 2/10 Gold suites, implicitly followed by most
- Evidence: [freecodecamp-e2e] (contributor guide prescribes `getByRole` > `getByText` > `data-playwright-test-label`), [playwright-best-practices]

**Pattern: Custom expect matchers for domain-specific validation**
- Frequency: 2/10 Gold suites (highest maturity indicator)
- Example: `expect(panel).toHaveNoDataError()`, `expect(datasource).toBeConfigured()`
- Evidence: [grafana-plugin-e2e] (custom matchers published as npm package)

**Anti-pattern: `page.waitForTimeout()` — universally banned**
- ESLint rule `no-wait-for-timeout` enforces the ban
- Replacement: web-first assertions, `waitForResponse()`, `waitForURL()`, `toPass()`
- Evidence: [eslint-plugin-playwright], [browserstack-waitfortimeout], all Gold suites

### 2. Retry Strategies

**Pattern: Environment-specific retry counts**
- Frequency: 10/10 Gold suites configure retries differently for CI vs. local
- Range across Gold suites: 1-4 retries in CI, 0-1 locally
- Correlation: Higher retries correlate with infrastructure complexity, not suite quality
- Evidence: [grafana-e2e] (1 CI), [calcom-e2e] (2 CI), [affine-e2e] (3 CI), [immich-e2e] (4 CI / Docker Compose)

**Pattern: `trace: 'retain-on-failure'` as the universal trace strategy**
- Frequency: 7/10 Gold suites use `retain-on-failure`; 1/10 uses `on-first-retry`
- Rationale: Captures traces for failures without the performance overhead of `trace: 'on'`
- Evidence: [grafana-e2e], [calcom-e2e], [affine-e2e] (retain-on-failure); [immich-e2e] (on-first-retry)

**Pattern: `maxFailures` for early CI abort**
- Frequency: 2/10 Gold suites (Cal.com, implicitly others)
- Purpose: Prevents wasting CI minutes on cascading failures
- Evidence: [calcom-e2e] (`maxFailures: 10` in headless mode)

### 3. Wait Patterns

**Pattern: Built-in auto-waiting (actionability checks)**
- Playwright performs 6 actionability checks before every action: visible, enabled, stable, receives events, attached, editable
- Evidence: [playwright-auto-wait-docs]

**Pattern: Event-based waiting for network operations**
- `page.waitForResponse()` for specific API calls
- `page.waitForURL()` for navigation completion
- `page.waitForLoadState('domcontentloaded')` for page ready
- Evidence: [calcom-flaky-fix-pr] (replaced blind `reload()` with `reload({ waitUntil: "domcontentloaded" })`)

**Pattern: `toPass()` for retry with custom intervals**
- Wraps any assertion block with configurable retry intervals and timeouts
- Used for complex validation sequences that need collective retry
- Evidence: [semaphore-flaky-tests], [playwright-retries-docs]

### 4. Flakiness Management

**Pattern: Three-step flaky test remediation**
1. Replace generic waits with explicit conditions
2. Add visibility assertions before interacting
3. Use scoped locators to reduce ambiguity
- Evidence: [calcom-flaky-fix-pr] PR #23487

**Pattern: Quarantine as short-term emergency, not permanent strategy**
- Mechanisms: `test.skip()` + TODO/issue reference, `--grep-invert`, `test.fixme()`
- All quarantine decisions coupled with tracking (GitHub issues, comments)
- Target: <2% flaky rate
- Evidence: [calcom-e2e] (`test.skip()` + TODO), [freecodecamp-e2e] (`--grep-invert`), [grafana-e2e] (`test.fixme()` + issue)

**Pattern: Reproduce flaky tests with `--repeat-each=100`**
- Runs each test 100 times to surface intermittent failures
- Evidence: [charpeni-flaky-repro]

### 5. Parallelism Control

**Pattern: Per-project parallelism based on state mutation**
- Tests that mutate shared state run serially; read-only tests run in parallel
- Frequency: 3/10 Gold suites implement per-project control
- Evidence: [immich-e2e] (web: 1 worker serial; ui: 3 workers parallel; maintenance: 1 worker serial)

**Pattern: workers=1 in CI with sharding for scale**
- Official recommendation for stability
- Scale horizontally via `--shard=X/Y` rather than increasing workers
- Evidence: [playwright-ci-docs], [currents-github-actions]

### 6. Artifact Strategy

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

1. **Auto-waiting is the foundation** — Playwright's built-in actionability checks eliminate most explicit waits
2. **Retry counts are environment-specific, not quality-specific** — Higher retries reflect infra complexity
3. **Traces replace video** — 9/10 Gold suites prefer traces over video for debugging
4. **Flakiness management is disciplined** — Quarantine always paired with tracking and fix deadlines
5. **Parallelism is nuanced** — Per-project control outperforms global parallel/serial toggle

---

## Open Questions (for Validation Phase)

1. What is the optimal `expect.timeout` value for different application types?
2. How do Gold suites handle async data loading in assertions?
3. What retry intervals does `toPass()` use in practice?
4. How do teams track and trend flaky test rates over time?
5. What custom reporter integrations exist for flaky test detection?
