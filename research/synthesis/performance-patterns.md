# Performance Patterns

## Overview

This document consolidates performance testing patterns discovered during the landscape phase (rounds 1-11) and the dedicated performance phase (rounds 33-36). Performance patterns include Web Vitals measurement via PerformanceObserver, Lighthouse integration, CDP profiling, Artillery load testing, network simulation, and CI pipeline architecture for performance testing.

**Status:** COMPLETE — Expanded from THIN (0/10 Gold suites) to comprehensive community-sourced patterns. Evidence is from guides, blogs, library documentation, and community practice — NOT from Gold suite observation.

---

## Pattern Taxonomy

### Tier 1: Production-Ready, Recommended

| Pattern | Cross-Browser | Dependencies | Complexity | Best For |
|---------|--------------|--------------|------------|----------|
| PerformanceObserver via page.evaluate() | Yes | None | Medium | Per-page Web Vitals assertions |
| playwright-lighthouse | Chromium only | playwright-lighthouse, lighthouse, get-port | Low | Comprehensive audits with scoring |
| Artillery + Playwright | Chromium only | artillery | Medium | Load testing with Web Vitals |

### Tier 2: Production-Ready, Situational

| Pattern | Cross-Browser | Dependencies | Complexity | Best For |
|---------|--------------|--------------|------------|----------|
| CDP Performance.getMetrics | Chromium only | None | High | Deep profiling, memory analysis |
| CDP Network.emulateNetworkConditions | Chromium only | None | Medium | Throttled condition testing |
| k6 Browser Module | Chromium only | k6 | Medium | Grafana-stack load testing |

### Not Recommended

| Pattern | Reason |
|---------|--------|
| page.route() for bandwidth throttling | Only adds latency; does not limit bandwidth |
| web-vitals library injection | Does not work in page.evaluate() context |
| slowMo for network simulation | Slows Playwright ops, not network |
| Single-run metric assertions | Variance too high; use statistical comparison |

---

## Observed Patterns

### 1. Web Vitals via PerformanceObserver

**Pattern: Use native browser Performance APIs within `page.evaluate()` for cross-browser metric collection**

Metrics collected: LCP, CLS, FCP, TTFB, INP, TBT

```typescript
// LCP
const lcp = await page.evaluate(() => new Promise((resolve) => {
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    resolve(entries.at(-1).startTime);
  }).observe({ type: 'largest-contentful-paint', buffered: true });
}));

// CLS
const cls = await page.evaluate(() => new Promise((resolve) => {
  let CLS = 0;
  new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
      if (!entry.hadRecentInput) CLS += entry.value;
    });
    resolve(CLS);
  }).observe({ type: 'layout-shift', buffered: true });
}));

// TTFB
const ttfb = await page.evaluate(() => {
  const nav = performance.getEntriesByType('navigation')[0];
  return nav.responseStart - nav.requestStart;
});
```

**Pre-navigation injection pattern:**
```typescript
await page.addInitScript(() => {
  window.__vitals = {};
  new PerformanceObserver((list) => {
    window.__vitals.lcp = list.getEntries().at(-1)?.startTime;
  }).observe({ type: 'largest-contentful-paint', buffered: true });
});
```

**Recommended thresholds (Google Core Web Vitals):**

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | < 2,500ms | 2,500-4,000ms | > 4,000ms |
| FCP | < 1,800ms | 1,800-3,000ms | > 3,000ms |
| CLS | < 0.1 | 0.1-0.25 | > 0.25 |
| INP | < 200ms | 200-500ms | > 500ms |
| TTFB | < 800ms | 800-1,800ms | > 1,800ms |
| TBT | < 200ms | 200-600ms | > 600ms |

- Evidence: [checkly-performance], [focusreactive-performance], [playwright-performance-metrics-lib]
- **Gold suite usage: 0/10**

### 2. Lighthouse Integration via playwright-lighthouse

**Pattern: Run Lighthouse audits within Playwright tests using `playAudit()` with threshold enforcement**

```typescript
import { playAudit } from 'playwright-lighthouse';

await playAudit({
  page,
  port: 9222,  // remote debugging port
  thresholds: {
    performance: 85,
    accessibility: 90,
    'best-practices': 90,
    seo: 80,
  },
  reports: {
    formats: { html: true, json: true },
    name: 'lighthouse-homepage',
    directory: './lighthouse-reports',
  },
});
```

**Key implementation requirements:**
- Browser must launch with `--remote-debugging-port=XXXX`
- Use `get-port` for dynamic port allocation in parallel tests
- Create worker-scoped fixture managing port + browser lifecycle
- Chromium-only (Lighthouse depends on CDP)
- Test timeout: 60s+ (Lighthouse audits take 5-15s per page)
- v3.x uses Lighthouse 10; v4.x uses Lighthouse 11

**Dedicated performance project in config:**
```typescript
{
  name: 'performance',
  testDir: './tests/performance',
  use: { headless: true },
  timeout: 60000,
}
```

- Evidence: [playwright-lighthouse-repo], [kazis-lighthouse], [testingplus-lighthouse], [greenreport-lighthouse]
- **Gold suite usage: 0/10**

### 3. CDP for Granular Performance Profiling

**Pattern: Use Chrome DevTools Protocol sessions for deep performance metrics and network simulation**

```typescript
const client = await page.context().newCDPSession(page);
await client.send('Performance.enable');

// Collect metrics
const { metrics } = await client.send('Performance.getMetrics');
// Returns: JSHeapUsedSize, LayoutCount, RecalcStyleCount, ScriptDuration, TaskDuration, etc.

// Network throttling (Slow 3G)
await client.send('Network.emulateNetworkConditions', {
  offline: false,
  downloadThroughput: (50 * 1024) / 8,
  uploadThroughput: (20 * 1024) / 8,
  latency: 400,
  connectionType: 'cellular3g'
});

// CPU throttling (4x slowdown)
await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
```

**Network presets:**

| Preset | Download | Upload | Latency |
|--------|----------|--------|---------|
| Slow 3G | 50 Kbps | 20 Kbps | 400ms |
| Fast 3G | 180 Kbps | 45 Kbps | 150ms |
| Regular 4G | 4 Mbps | 3 Mbps | 20ms |

- Evidence: [sofea-cdp-performance], [focusreactive-performance], [sdetective-throttle]
- **Gold suite usage: 0/10**

### 4. Artillery + Playwright for Load Testing

**Pattern: Artillery orchestrates Playwright scripts as virtual users with automatic Web Vitals collection**

```yaml
config:
  target: https://example.com
  phases:
    - duration: 60
      arrivalRate: 5
    - duration: 120
      arrivalRate: 20
  engines:
    playwright:
      extendedMetrics: true
      trace:
        enabled: true

scenarios:
  - engine: playwright
    testFunction: userJourney
```

```typescript
async function userJourney(page, vuContext, events, test) {
  const { step } = test;
  await step('homepage', async () => {
    await page.goto('/');
  });
  await step('login', async () => {
    await page.fill('#email', 'user@example.com');
    await page.click('button[type="submit"]');
  });
}
```

**Auto-collected metrics:** LCP, FCP, CLS, INP, TTFB, FID per page URL.
**Extended metrics:** domcontentloaded, dominteractive, memory_used_mb, http_requests.
**Scaling:** Local, AWS Fargate, Azure ACI via Artillery Cloud.

- Evidence: [artillery-playwright-engine], [artillery-playwright-overview], [codoid-artillery-playwright]
- **Gold suite usage: 0/10**

### 5. k6 Browser Module (Alternative to Artillery)

**Pattern: Grafana k6 with Playwright-compatible browser APIs for hybrid load testing**

- Rough Playwright API compatibility (by design, not 100% parity)
- Web Vitals (FCP, INP, TTFB) as core metrics
- Hybrid model: HTTP protocol tests for load + browser tests for Web Vitals
- Grafana Cloud/Prometheus/Loki integration for dashboarding
- Best for teams already in the Grafana ecosystem

- Evidence: [grafana-k6-browser-blog], [k6-hybrid-testing]
- **Gold suite usage: 0/10**

### 6. CI Execution Performance (from landscape phase)

**Pattern: Sharding optimization for CI execution speed**
- Workers=1 per shard for stability; scale via shard count
- Dynamic shard calculation based on test count
- Sweet spot: 100-800 tests per suite
- Evidence: [currents-github-actions], [foster-dynamic-sharding]
- **Gold suite usage: 5/10** (Cal.com, AFFiNE, Grafana, freeCodeCamp, Next.js)

**Pattern: Browser caching is NOT recommended in CI**
- Official guidance: restoration time matches download duration
- Evidence: [playwright-ci-docs]
- **Gold suite usage: 10/10**

**Pattern: `maxFailures` for CI cost optimization**
- Abort early on cascading failures
- Evidence: [calcom-e2e]
- **Gold suite usage: 2/10**

### 7. playwright-performance-metrics Library

**Pattern: Third-party library wrapping CDP + Performance APIs with Playwright fixture integration**

```typescript
import { PerformanceMetricsCollector, DefaultNetworkPresets } from 'playwright-performance-metrics';

const collector = new PerformanceMetricsCollector();
await collector.initialize(page, DefaultNetworkPresets.SLOW_3G);
await page.goto('https://example.com', { waitUntil: 'networkidle' });
const metrics = await collector.collectMetrics(page, { timeout: 10000 });

expect(metrics.domCompleteTiming).toBeLessThan(900);
expect(metrics.lcp).toBeLessThan(2500);
```

- Provides: LCP, CLS, TBT, FCP, TTFB (with DNS/TLS breakdown), pageload time, resource bytes
- Network presets: SLOW_3G, FAST_3G, REGULAR_4G, FAST_WIFI
- Lower overhead than Lighthouse; focused on specific metric assertions
- Evidence: [playwright-performance-metrics-lib]
- **Gold suite usage: 0/10**

### 8. Playwright Trace Viewer for Performance Analysis

**Pattern: Use Trace Viewer's Timeline and Network tabs for ad-hoc performance investigation**

- Timeline (Gantt chart) visualizes action duration; identifies slow actions
- Network tab shows chronological HTTP requests with timing and payload size
- DOM snapshots enable render state inspection per step
- Chrome Trace (`browser.startTracing()`/`stopTracing()`) for CPU profiling
- **NOT a substitute for automated assertions** — useful for debugging, not CI enforcement

- Evidence: [momentic-trace-guide], [testdino-trace-viewer], [devto-chrome-trace]
- **Gold suite usage: 0/10** (for performance; 10/10 use trace for debugging)

---

## Performance Budget Strategy

### Tiered Budget Approach (Recommended)

**PR-level (every commit, < 30s):**
- TTFB < 800ms
- Total page weight < 500KB (critical pages)
- No individual resources > 250KB uncompressed

**Nightly (thorough, 5-15 min):**
- Lighthouse performance score >= 80
- LCP < 2,500ms (desktop), < 4,000ms (mobile/throttled)
- CLS < 0.1
- FCP < 1,800ms

**Weekly/Pre-release (load testing):**
- Artillery: p95 response < 3,000ms at target concurrency
- Error rate < 1% under load

### Budget Enforcement Patterns

1. **Lighthouse Score Budgets** — `playAudit()` with thresholds; fails test on score violation
2. **Web Vitals Assertion Budgets** — `expect(lcp).toBeLessThan(2500)` per metric
3. **Artillery Ensure Conditions** — `ensure: { p95: 3000, maxErrorRate: 1 }` in YAML
4. **Resource Size Budgets** — Resource Timing API assertions on transfer sizes

### Threshold Management
- Start with current baseline scores (even if poor)
- Ratchet thresholds up over time as improvements land
- Use page-criticality tiers (homepage stricter than admin pages)
- Compare against rolling average, not single historical value
- Accept 20% variance as normal for performance metrics

---

## CI Pipeline Architecture

### Recommended Structure
- **Same repository** as functional tests (performance tests evolve with code)
- **Separate workflow file** (`.github/workflows/performance.yml`)
- **Separate Playwright project** (`name: 'performance'` with longer timeout)
- **Separate test directory** (`tests/performance/`)
- **Smoke on PR** (TTFB, bundle size — fast, non-blocking or soft-blocking)
- **Full suite nightly** (Lighthouse audits, Web Vitals under throttling)
- **Load tests weekly** (Artillery, resource-intensive)

### Performance Test Directory Structure
```
tests/
  e2e/              # Functional tests (every PR)
  performance/
    lighthouse/     # Lighthouse audit tests (nightly)
    vitals/         # Web Vitals assertion tests (PR smoke + nightly)
    load/           # Artillery scenarios (weekly)
```

---

## Key Themes

1. **Performance testing with Playwright is viable but not standardized** — Tooling exists; no Gold suite demonstrates it; teams must assemble their own stack
2. **PerformanceObserver is the foundation** — Cross-browser, zero-dependency, W3C standard
3. **Lighthouse is the highest-value quick win** — One package, comprehensive audits, report generation
4. **Artillery is the load testing answer** — Built-in Playwright engine, auto Web Vitals, distributed scaling
5. **CDP enables advanced scenarios** — Network/CPU throttling, deep profiling, but Chromium-only
6. **Separate pipeline, same repo** — Performance tests need different triggers, timeouts, and resources
7. **Start lenient, ratchet up** — Avoid false failures from overly strict initial budgets
8. **CI execution performance IS well-established** — Sharding, maxFailures, and browser caching patterns are proven (5-10/10 Gold suites)

---

## Open Questions (Remaining)

1. Will Playwright add a built-in performance API? (Feature requests exist but no commitment)
2. Will Playwright add network throttling? (Feature requested since 2021; no plans)
3. What's the performance overhead of Lighthouse audits in CI? (5-15s per audit observed)
4. How do teams handle performance metric variance in CI? (No standard approach beyond retries)

---

## Revision History

| Date | Change | Basis |
|---|---|---|
| 2026-03-18 | Initial synthesis from landscape rounds 1-12 | Guides/blogs only; 0/10 Gold suites |
| 2026-03-18 | Major expansion from performance rounds 33-36 | Checkly, FocusReactive, playwright-lighthouse, Artillery, k6, CDP patterns; 15+ new sources |
