# Round 25 — Suites Analyzed

**Phase:** Validation
**Focus:** Deep dive on retry and flakiness management — retry configuration, flaky test handling, wait strategies
**Date:** 2026-03-18

## Suites and Sources Analyzed

### Gold-Standard Suites — Retry and Wait Pattern Evidence

1. **grafana/grafana** — 1 retry in CI, 0 locally; `test.fixme()` with GitHub issue references; `trace: 'retain-on-failure'`; fixture-based cleanup eliminates state-dependent flakiness
2. **calcom/cal.com** — 2 retries in CI; `test.skip()` + TODO for quarantine; `maxFailures: 10`; flaky-fix PR #23487 as remediation case study
3. **toeverything/AFFiNE** — 3 retries in CI; worker-scoped fixtures for expensive setup; video capture on failure
4. **immich-app/immich** — 4 retries in CI (Docker Compose infra); `trace: 'on-first-retry'`; serial execution for state-dependent API tests
5. **freeCodeCamp/freeCodeCamp** — Serial execution with `maxFailures`; contributor guide documents wait patterns; `--grep-invert` for quarantine
6. **ianstormtaylor/slate** — 5 retries (editor rendering instability); `actionTimeout: 0` (infinite); conditional platform-based projects

### Documentation and Community Sources

7. **Playwright official docs** — Retries page: global/per-test/per-describe configuration; test categorization (passed/flaky/failed); serial retry behavior; `testInfo.retry` metadata
8. **Playwright official docs** — Clock API: `setFixedTime`, `install`, `fastForward`, `pauseAt`, `runFor`, `resume`, `setSystemTime`
9. **Playwright official docs** — Annotations: `test.skip()`, `test.fixme()`, `test.fail()`, `test.slow()`
10. **BrowserStack guide** — Flaky test detection and avoidance in 2026; retry configuration patterns
11. **Semaphore blog** — Flaky test avoidance strategies; `toPass()` usage; explicit wait patterns
12. **Charpeni blog** — Reproduce flaky tests with `--repeat-each=100`; isolation-first debugging
13. **Better Stack guide** — Playwright flaky test avoidance; actionability checks overview
14. **Tim Deschryver blog** — Five retry APIs compared: test retries, `toPass()`, `expect.poll()`, locator retry, actionability checks

## Method

- Compared retry configuration across all Gold suites (CI vs local)
- Analyzed quarantine mechanisms (`test.skip`, `test.fixme`, `test.fail`, `@quarantined` tag)
- Studied wait strategy evolution from explicit waits to auto-waiting
- Documented `toPass()` and `expect.poll()` usage patterns with default/custom intervals
- Examined Clock API for time-dependent test patterns
