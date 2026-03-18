# Performance Patterns

## Overview

This document consolidates performance testing patterns observed during the landscape phase (rounds 1-11). Performance patterns include Playwright + Lighthouse integration, Chrome DevTools Protocol metrics, Artillery load testing, and CI execution performance optimization.

**Status:** Initial synthesis — THIN. No Gold-standard suite demonstrates integrated performance testing. To be significantly expanded in performance phase (rounds 33-36).

---

## Observed Patterns

### 1. Lighthouse Integration for Web Vitals

**Pattern: `playwright-lighthouse` package for performance audits**
- The `playwright-lighthouse` npm package bridges Playwright E2E tests with Google Lighthouse audits
- Captures Core Web Vitals: Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), Interaction to Next Paint (INP)
- Enables CI assertions: `expect(lhReport.categories.performance.score).toBeGreaterThan(0.8)`
- **Limitation:** Requires Chromium (Lighthouse depends on Chrome DevTools Protocol)
- Evidence: TestingPlus integration guide (2025), The Green Report blog, BrowserStack Lighthouse docs
- **Gold suite usage: 0/10** — No Gold suite integrates Lighthouse with Playwright

### 2. Chrome DevTools Protocol (CDP) for Granular Metrics

**Pattern: Direct CDP access via Playwright for performance profiling**
- `page.evaluate(() => performance.getEntries())` captures raw Performance API timings
- Individual resource loading metrics, Layout Shift contribution scores, Long Task detection
- More granular than Lighthouse but requires custom metric collection infrastructure
- Evidence: Aishah Sofea Medium blog on CDP + Playwright
- **Gold suite usage: 0/10**

### 3. Artillery + Playwright for Load Testing

**Pattern: Artillery orchestrates Playwright scripts as virtual users**
- Artillery defines load profiles (ramp-up, steady state, spike scenarios)
- Playwright scripts define user behavior (navigate, click, fill, assert)
- Tests how applications perform under concurrent browser sessions — not just HTTP requests
- Captures both performance metrics and functional validation under load
- Evidence: Codoid Artillery + Playwright guide
- **Gold suite usage: 0/10**

### 4. CI Execution Performance (Not Application Performance)

**Pattern: Sharding optimization for CI execution speed**
- Workers=1 per shard for stability; scale via shard count
- Dynamic shard calculation: `shards = max(MIN, min(MAX, ceil(test_count * projects / tests_per_shard)))`
- Sweet spot: 100-800 tests per suite
- Evidence: [currents-github-actions], [foster-dynamic-sharding], [lewis-nelson-dynamic-sharding]
- **Gold suite usage: 5/10** (Cal.com, AFFiNE, Grafana, freeCodeCamp, Next.js)

**Pattern: Browser caching is NOT recommended in CI**
- Official guidance: "restoration time matches download duration" — no net benefit
- Instead: install only needed browsers (`npx playwright install chromium --with-deps`)
- Evidence: [playwright-ci-docs]
- **Gold suite usage: 10/10** (all follow this guidance)

**Pattern: `maxFailures` for CI cost optimization**
- Abort run early when too many tests fail, preventing CI minute waste
- Evidence: [calcom-e2e] (`maxFailures: 10`)
- **Gold suite usage: 2/10**

---

## Emerging Themes

1. **Performance testing with Playwright is emerging but not yet standard** — The tooling exists (Lighthouse, CDP, Artillery) but no Gold suite uses it
2. **CI execution performance IS a concern** — Sharding and parallelism patterns are well-established
3. **Application performance testing remains separate from E2E** — Teams use dedicated tools (Lighthouse CLI, WebPageTest, k6) rather than embedding in Playwright suites
4. **The gap between E2E testing and performance testing is narrowing** — `playwright-lighthouse` and Artillery integration point toward convergence

---

## Gaps (to be addressed in Performance Phase, Rounds 33-36)

1. No production examples of Playwright + Lighthouse in CI pipelines
2. No patterns for performance budget enforcement in Playwright config
3. No examples of performance regression detection (comparing across runs)
4. Artillery + Playwright adoption level is unknown
5. No patterns for Web Vitals monitoring in E2E tests
6. No comparison of Lighthouse-in-Playwright vs. standalone Lighthouse CI

---

## Open Questions

1. Should performance testing be embedded in E2E suites or maintained as separate suites?
2. What is the performance overhead of Lighthouse audits within Playwright tests?
3. How do teams track performance metrics over time from Playwright tests?
4. Is Artillery + Playwright suitable for CI, or is it too resource-intensive?
5. What performance budgets are realistic for different application types?
