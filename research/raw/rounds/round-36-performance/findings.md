# Round 36 — Findings: Standards Synthesis and Final Assessment

## Executive Summary

Performance testing with Playwright is **viable but not standardized**. The tooling exists (PerformanceObserver, CDP, Lighthouse, Artillery) and multiple patterns are production-ready, but no Gold-standard suite demonstrates integrated performance testing. The community is actively developing patterns, but teams must assemble their own performance testing stack from available components.

## Final Assessment: What Works and What Doesn't

### Production-Ready Patterns

**1. Web Vitals via PerformanceObserver (RECOMMENDED — Tier 1)**
- Cross-browser (works on Chromium, Firefox, WebKit)
- Zero dependencies beyond Playwright
- Uses W3C standard APIs
- Metrics: LCP, CLS, FCP, TTFB, TBT, INP (with interaction trigger)
- Best for: Per-page performance assertions on every PR

**2. Lighthouse Integration via playwright-lighthouse (RECOMMENDED — Tier 1)**
- Comprehensive audit: performance, accessibility, best-practices, SEO
- Report generation (HTML, JSON, CSV) for CI artifacts
- Threshold-based pass/fail with `playAudit()`
- Best for: Nightly comprehensive performance audits
- Limitation: Chromium-only; 5-15s per audit

**3. CDP Performance Profiling (RECOMMENDED — Tier 2)**
- Granular metrics: JS heap, layout count, script duration, task duration
- Network throttling via `Network.emulateNetworkConditions`
- CPU throttling via `Emulation.setCPUThrottlingRate`
- Best for: Deep performance investigations; throttled testing
- Limitation: Chromium-only

**4. Artillery + Playwright Load Testing (RECOMMENDED — Tier 2)**
- Built-in Playwright engine; auto Web Vitals collection
- Distributed scaling (AWS Fargate, Azure ACI)
- `test.step()` for named timing histograms
- Best for: Load testing; concurrent user simulation
- Limitation: Resource-intensive; not for every PR

### Not Recommended

**1. page.route() for bandwidth throttling** — Only adds latency, not bandwidth limiting. Use CDP instead.
**2. web-vitals library injection** — Does not work in `page.evaluate()` context.
**3. slowMo for network simulation** — Slows Playwright operations, not network; misleading results.
**4. Single-run performance assertions** — Metrics vary between runs; use multiple runs and percentile comparison.

## Standards Determination

### MUST (Required for any performance testing implementation)

1. **Separate performance tests from functional tests** — Different project in playwright.config.ts with appropriate timeouts
2. **Use Google's Core Web Vitals thresholds as starting point** — LCP < 2500ms, CLS < 0.1, INP < 200ms, TTFB < 800ms
3. **Use PerformanceObserver for cross-browser metrics** — Not CDP (which is Chromium-only)
4. **Set test timeout >= 60s for performance tests** — Lighthouse audits and metric collection take longer
5. **Run performance tests on Chromium** — Most performance APIs and tools target Chromium

### SHOULD (Strongly Recommended)

1. **Implement tiered performance testing** — Smoke on PR, full suite nightly, load weekly
2. **Use `page.addInitScript()` for pre-navigation observers** — Ensures metrics capture from page load start
3. **Store Lighthouse reports as CI artifacts** — HTML for review, JSON for trend analysis
4. **Use `get-port` for dynamic port allocation** — Prevents port conflicts in parallel Lighthouse tests
5. **Start with lenient thresholds and ratchet up** — Avoid false failures from overly strict initial budgets
6. **Use CDP Network.emulateNetworkConditions for throttled testing** — Tests performance under poor network conditions

### MAY (Optional, Based on Team Needs)

1. **Integrate Artillery for load testing** — When concurrent user performance matters
2. **Use k6 browser module** — When team is in the Grafana ecosystem
3. **Implement performance regression detection** — Compare against rolling baseline
4. **Track performance metrics over time** — JSON Lines history file or external dashboarding
5. **Use `playwright-performance-metrics` library** — When you want an abstraction over raw APIs

### MUST NOT

1. **Do NOT block PRs on full Lighthouse audits** — Too slow and variable; use smoke metrics only
2. **Do NOT use `page.waitForTimeout()` as a performance measurement** — It measures arbitrary delay, not actual performance
3. **Do NOT rely on single-run metrics for pass/fail** — Performance variance requires statistical approaches
4. **Do NOT test performance on Firefox/WebKit if using CDP or Lighthouse** — Will fail; these are Chromium-only
5. **Do NOT use `slowMo` option for network simulation** — Misleading; slows Playwright operations, not network

## Gap Analysis: What's Still Missing

1. **Official Playwright performance API** — No built-in `page.metrics()` or `page.performanceAudit()`
2. **Cross-browser performance testing** — CDP and Lighthouse are Chromium-only
3. **Built-in network throttling** — Feature requested (Issues #8622, #29155, #32618) but not planned
4. **Performance regression detection tooling** — No standard way to compare metrics across runs
5. **Performance dashboard for Playwright** — Must use external tools (Artillery Cloud, Grafana)
6. **Gold suite validation** — 0/10 Gold suites demonstrate these patterns; all evidence is from guides/blogs
