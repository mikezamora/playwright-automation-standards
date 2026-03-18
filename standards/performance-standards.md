# Performance Standards

> **PRELIMINARY — to be validated in phases 2-7 (rounds 13-55)**
> This document contains initial standards based on landscape observations from rounds 1-12.
> Evidence for performance testing patterns is THIN — no Gold-standard suite demonstrates integrated performance testing.
> This document will be significantly expanded during the performance phase (rounds 33-36).

---

## P1. CI Execution Performance

### P1.1 Optimize CI execution through sharding, not workers
- Use `--shard=X/Y` for horizontal scaling across CI machines
- Set `workers: 1` per shard for stability
- **Basis:** [playwright-ci-docs, currents-github-actions]; see also CI/CD Standards C2

### P1.2 Use dynamic shard calculation for suites > 200 tests
- Automatically calculate optimal shard count from test count and project count
- Sweet spot for sharding benefit: 100-800 tests per suite
- **Basis:** [foster-dynamic-sharding, currents-sharding-analysis]

### P1.3 Do NOT cache browser binaries in CI
- Browser binary restoration time matches download time — no net benefit
- Instead, install only needed browsers
- **Basis:** [playwright-ci-docs]: official recommendation against caching

### P1.4 Set `maxFailures` to prevent CI cost overrun
- Abort test runs early when too many tests fail
- Prevents wasting CI minutes on cascading failures
- **Basis:** [calcom-e2e: `maxFailures: 10`]

---

## P2. Application Performance Testing (Emerging)

> **NOTE:** These patterns are observed in guides and blog posts but NOT in Gold-standard suites.
> They should be considered experimental recommendations.

### P2.1 Consider Lighthouse integration for performance budgets
- The `playwright-lighthouse` package enables Lighthouse audits within Playwright tests
- Captures Core Web Vitals: LCP, CLS, INP
- Can enforce performance budgets as CI assertions
- **Limitation:** Chromium only (Lighthouse depends on CDP)
- **Basis:** TestingPlus guide, The Green Report blog, BrowserStack Lighthouse docs
- **Gold suite evidence: None**

### P2.2 Consider CDP for granular performance metrics
- `page.evaluate(() => performance.getEntries())` captures raw performance data
- Useful for specific performance investigations, not routine CI
- **Basis:** Aishah Sofea Medium blog
- **Gold suite evidence: None**

### P2.3 Consider Artillery + Playwright for load testing
- Artillery can orchestrate Playwright scripts as virtual users under load
- Tests realistic concurrent usage rather than simple HTTP load
- Resource-intensive — suitable for dedicated performance test environments, not routine CI
- **Basis:** Codoid Artillery + Playwright guide
- **Gold suite evidence: None**

---

## P3. Test Suite Performance

### P3.1 Minimize artifact overhead
- Use `trace: 'retain-on-failure'` or `'on-first-retry'` — never `'on'`
- Disable video by default (only AFFiNE captures video among Gold suites)
- Disable screenshots for passing tests
- **Basis:** 10/10 Gold suites use conditional artifact capture

### P3.2 Use `webServer.reuseExistingServer` for local speed
- `reuseExistingServer: !process.env.CI` avoids server restart on every test run locally
- **Basis:** [calcom-e2e, affine-e2e, immich-e2e]

### P3.3 Target test execution sweet spots
- Individual tests: aim for < 30s per test
- Full suite: 100-800 tests is the optimal range for sharding efficiency
- Below 100 tests: sharding adds more overhead than benefit
- Above 800 tests: invest in test organization and selective execution
- **Basis:** [currents-sharding-analysis]

---

## Gaps and Future Work

- No Gold suite demonstrates integrated Lighthouse performance testing
- No patterns for performance regression detection across runs
- No comparison of in-Playwright performance testing vs. standalone tools
- Artillery + Playwright suitability for CI environments is unknown
- Performance budgets and enforcement patterns need production evidence

---

## Revision History

| Date | Change | Basis |
|---|---|---|
| 2026-03-18 | Initial draft from landscape rounds 1-12 | Guides/blogs only; 0/10 Gold suites demonstrate performance testing |
