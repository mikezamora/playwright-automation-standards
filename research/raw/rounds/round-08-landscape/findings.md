# Round 08 — Landscape: Key Findings

**Focus:** Test stability and flakiness management patterns in Gold-standard suites
**Date:** 2026-03-18

---

## Key Findings

### Finding 1: CI retry counts correlate with application complexity, not suite quality

Gold-standard suites show a wide range of CI retry counts: Grafana uses 1, Cal.com uses 2, AFFiNE uses 3, and Immich uses 4. The pattern is not "more retries = worse tests" but rather "more retries = more complex environment." Immich (Docker Compose with multiple services) needs 4 retries because container startup timing is inherently variable. AFFiNE (rich editor with collaborative features) needs 3 because complex DOM interactions are timing-sensitive. Grafana (well-isolated plugin tests) needs only 1. The correct retry count is environment-specific, not a universal constant.

**Evidence:** Immich (Docker Compose, 4 retries), AFFiNE (rich editor, 3 retries), Cal.com (Next.js monorepo, 2 retries), Grafana (isolated plugins, 1 retry)

### Finding 2: The "retain-on-failure" trace strategy is the universal Gold-standard choice

Every Gold-tier suite uses either `trace: 'retain-on-failure'` or `trace: 'on-first-retry'`. None use `trace: 'on'` (always capture) because of the performance overhead. None use `trace: 'off'` because traces are essential for debugging CI failures. The distinction between the two strategies is nuanced: `retain-on-failure` captures traces for every run but only keeps them on failure; `on-first-retry` only starts capturing on the first retry attempt. Immich uses `on-first-retry` (lower overhead, slightly less diagnostic data), while most others use `retain-on-failure` (more data, slightly higher overhead).

**Evidence:** Grafana, Cal.com, AFFiNE (`retain-on-failure`); Immich (`on-first-retry`)

### Finding 3: Environment-aware timeouts prevent false failures in CI while keeping local runs fast

Cal.com demonstrates the most sophisticated timeout strategy: action/expect timeouts are 10s in CI but 120s locally; test timeout is 60s in CI but 240s locally. This inverted pattern (shorter in CI) seems counterintuitive but works because CI tests should fail fast and retry, while local developers need patience during debugging. AFFiNE reverses this: 50s in CI, 30s locally, because their CI containers are slower than developer machines. The key insight is that timeout values should be tuned to the execution environment, not set to a single "safe" value.

**Evidence:** Cal.com (10s CI / 120s local for actions; 60s CI / 240s local for tests), AFFiNE (50s CI / 30s local)

### Finding 4: Per-project parallelism control is the advanced isolation strategy

Immich demonstrates the most nuanced parallelism strategy: `fullyParallel: false` globally, with per-project overrides. Web tests run serially (1 worker) because they modify shared database state. UI tests run in parallel (3 workers) because they are read-only. Maintenance tests run serially (1 worker) because they perform cleanup operations. This per-project approach avoids the all-or-nothing choice between `fullyParallel: true` (fast but risks state conflicts) and `fullyParallel: false` (safe but slow).

**Evidence:** Immich (web: 1 worker serial; ui: 3 workers parallel; maintenance: 1 worker serial)

### Finding 5: Flaky test fixes follow a consistent three-step pattern

Cal.com's PR #23487 demonstrates the universal pattern for fixing flaky tests: (1) Replace generic waits with explicit conditions (`reload({ waitUntil: "domcontentloaded" })` instead of blind `reload()`), (2) Add visibility assertions before interacting (`expect(getByTestId("workflow-list")).toBeVisible()`), (3) Use scoped locators to reduce ambiguity (`getByTestId("workflow-list").locator("> li")` instead of broad selectors). This three-step pattern — condition waits, assert visibility, scope locators — appears across all Gold suites and represents the primary flakiness remediation playbook.

**Evidence:** Cal.com PR #23487 (waitUntil + visibility + scoped locators), Grafana Issue #89051 (test.fixme for feature-flag-broken tests)

### Finding 6: The `page.waitForTimeout()` anti-pattern is banned in Gold suites

The eslint-plugin-playwright rule `no-wait-for-timeout` enforces the ban on `page.waitForTimeout()` at the linting level. Gold suites replace hard waits with: (a) Web-first assertions that auto-retry (`toBeVisible()`, `toBeEnabled()`), (b) Playwright's built-in actionability checks (visible, enabled, stable, attached), (c) Event-based waits (`waitForResponse()`, `waitForURL()`), (d) The `toPass()` wrapper for retry with configurable intervals. freeCodeCamp's contributor guide prescribes `getByRole` and `getByText` locators specifically because they auto-wait for accessibility tree readiness.

**Evidence:** eslint-plugin-playwright `no-wait-for-timeout` rule, Playwright built-in actionability checks (6 checks: visible, enabled, stable, receives events, attached, editable), freeCodeCamp contributor locator priority

### Finding 7: Screenshot and video capture is deliberately minimal in Gold suites

Only 1 of 10 Gold suites (AFFiNE) captures video on failure. All others limit artifacts to screenshots on failure and traces on failure/retry. This minimalist approach is intentional: traces provide richer debugging data than video (DOM snapshots, network logs, console output), and artifact storage costs scale linearly with test count. The recommended artifact strategy for CI is: `screenshot: 'only-on-failure'` + `trace: 'retain-on-failure'` (or `on-first-retry`) + no video.

**Evidence:** AFFiNE (`video: 'retain-on-failure'`), all others (screenshot + trace only)

### Finding 8: Quarantine is treated as a short-term emergency measure, not a permanent strategy

Cal.com uses `test.skip()` with TODO comments referencing GitHub issues for tracking re-enablement. freeCodeCamp uses `--grep-invert` to exclude specific flaky test files from CI runs. Grafana uses `test.fixme()` for tests broken by feature flags (issue #89051). In all cases, quarantine is coupled with tracking mechanisms (GitHub issues, TODO comments) and treated as temporary. No Gold suite has a permanent "quarantine project" or "known-flaky" tag that runs separately. The community consensus (BrowserStack 2026, TestDino) is that quarantine unblocks deployments but must be paired with a root-cause investigation ticket.

**Evidence:** Cal.com (`test.skip()` + TODO), freeCodeCamp (`--grep-invert`), Grafana (`test.fixme()` + issue tracking)

---

## Stability Pattern Decision Matrix

| Decision | Recommended Pattern | Anti-Pattern |
|---|---|---|
| Retry count | Environment-specific: 1-4 based on infra complexity | Static high count (e.g., `retries: 5` everywhere) |
| Trace capture | `retain-on-failure` or `on-first-retry` | `on` (always) or `off` (never) |
| Timeouts | Env-aware (shorter CI, longer local) OR (longer CI, shorter local) based on infra | Single static timeout for all environments |
| Parallelism | Per-project control based on state mutation | Global `fullyParallel: true` for all tests |
| Hard waits | ESLint rule `no-wait-for-timeout`; use web-first assertions | `page.waitForTimeout()` for "just in case" |
| Flaky remediation | Condition waits + visibility assertions + scoped locators | Adding more retries to mask the problem |
| Quarantine | `test.skip()`/`test.fixme()` + tracking issue | Permanent quarantine suite with no fix deadline |
| Artifacts | Screenshots on failure + traces on failure; no video | Video for all tests; screenshots for all tests |
