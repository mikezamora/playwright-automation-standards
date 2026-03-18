# Performance Standards

> **DEFINITIVE** — Validated through performance phase (rounds 33-36).
> Evidence sourced from community guides, library documentation, Artillery/k6 docs, and browser API standards.
> **Important caveat:** 0/10 Gold-standard suites demonstrate integrated performance testing. All patterns are community-recommended, not production-observed.

---

## P1. Application Performance Testing

### P1.1 Use PerformanceObserver via `page.evaluate()` for Web Vitals measurement

Collect Core Web Vitals using the native browser Performance API. This is cross-browser, zero-dependency, and based on W3C standards.

```typescript
// LCP
const lcp = await page.evaluate(() => new Promise((resolve) => {
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    resolve(entries.at(-1).startTime);
  }).observe({ type: 'largest-contentful-paint', buffered: true });
}));
expect(lcp).toBeLessThan(2500);

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
expect(cls).toBeLessThan(0.1);

// TTFB
const ttfb = await page.evaluate(() => {
  const nav = performance.getEntriesByType('navigation')[0];
  return nav.responseStart - nav.requestStart;
});
expect(ttfb).toBeLessThan(800);
```

- Use `page.addInitScript()` when metrics must be captured from initial page load
- Use `{ buffered: true }` to capture entries emitted before the observer was created
- **Basis:** [checkly-performance], [focusreactive-performance]; W3C PerformanceObserver API
- **Gold suite evidence: None** (0/10)

### P1.2 Apply Google's Core Web Vitals thresholds as starting budgets

| Metric | Good (Target) | Needs Improvement | Poor |
|--------|--------------|-------------------|------|
| LCP | < 2,500ms | 2,500-4,000ms | > 4,000ms |
| FCP | < 1,800ms | 1,800-3,000ms | > 3,000ms |
| CLS | < 0.1 | 0.1-0.25 | > 0.25 |
| INP | < 200ms | 200-500ms | > 500ms |
| TTFB | < 800ms | 800-1,800ms | > 1,800ms |
| TBT | < 200ms | 200-600ms | > 600ms |

- Start with your application's current metrics as baseline; ratchet toward "Good" thresholds over time
- Do NOT begin with Google's thresholds if your app currently exceeds them — set achievable initial targets
- **Basis:** Google Core Web Vitals program; [focusreactive-performance]

### P1.3 Integrate Lighthouse for comprehensive performance audits

Use `playwright-lighthouse` for automated Lighthouse audits within Playwright tests:

```typescript
import { playAudit } from 'playwright-lighthouse';

await playAudit({
  page,
  port,  // remote debugging port
  thresholds: {
    performance: 80,
    accessibility: 90,
    'best-practices': 85,
    seo: 80,
  },
  reports: {
    formats: { html: true, json: true },
    name: `lighthouse-${pageName}`,
    directory: './lighthouse-reports',
  },
});
```

**Required setup:**
- Launch browser with `--remote-debugging-port=XXXX`
- Use `get-port` package for dynamic port allocation in parallel tests
- Create a worker-scoped fixture managing port and browser lifecycle
- Set test timeout to 60s+ (Lighthouse audits take 5-15s per page)
- Chromium-only (Lighthouse depends on Chrome DevTools Protocol)

**Dedicated Lighthouse fixture:**
```typescript
import { test as base } from '@playwright/test';
import { chromium } from 'playwright';

export const lighthouseTest = base.extend({
  port: [async ({}, use) => {
    const { default: getPort } = await import('get-port');
    await use(await getPort());
  }, { scope: 'worker' }],

  browser: [async ({ port }, use) => {
    const browser = await chromium.launch({
      args: [`--remote-debugging-port=${port}`],
    });
    await use(browser);
  }, { scope: 'worker' }],
});
```

- **Basis:** [playwright-lighthouse-repo], [kazis-lighthouse], [testingplus-lighthouse], [greenreport-lighthouse]
- **Gold suite evidence: None** (0/10)

### P1.4 Use CDP for network and CPU throttling

Simulate poor network conditions to test performance under constraint. Playwright has no built-in throttling API; use CDP:

```typescript
const client = await page.context().newCDPSession(page);

// Network throttling (Slow 3G)
await client.send('Network.emulateNetworkConditions', {
  offline: false,
  downloadThroughput: (50 * 1024) / 8,
  uploadThroughput: (20 * 1024) / 8,
  latency: 400,
  connectionType: 'cellular3g',
});

// CPU throttling (4x slowdown, simulates mid-tier mobile)
await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
```

- Chromium-only (CDP not available on Firefox/WebKit)
- Do NOT use `page.route()` with delays as a substitute — it only adds latency, not bandwidth limits
- Do NOT use `slowMo` for network simulation — it slows Playwright operations, not actual network
- **Basis:** [sdetective-throttle], [tomatoqa-throttle]; Playwright Issues #8622, #29155, #32618
- **Gold suite evidence: None** (0/10)

### P1.5 Use CDP Performance.getMetrics for deep profiling

For granular performance investigation (not routine CI):

```typescript
const client = await page.context().newCDPSession(page);
await client.send('Performance.enable');
const { metrics } = await client.send('Performance.getMetrics');
// Returns: JSHeapUsedSize, JSHeapTotalSize, Nodes, LayoutCount,
//          RecalcStyleCount, ScriptDuration, TaskDuration, etc.
```

- Use for memory leak detection, layout thrash investigation, script duration analysis
- Chromium-only
- **Basis:** [sofea-cdp-performance], [checkly-performance]
- **Gold suite evidence: None** (0/10)

---

## P2. Load Testing

### P2.1 Use Artillery + Playwright for browser-based load testing

Artillery's built-in Playwright engine is the recommended path for load testing with real browser behavior:

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

scenarios:
  - engine: playwright
    testFunction: userJourney
```

```typescript
async function userJourney(page, vuContext, events, test) {
  await test.step('homepage', async () => {
    await page.goto('/');
  });
  await test.step('search', async () => {
    await page.fill('[name="q"]', 'product');
    await page.click('button[type="submit"]');
  });
}
```

**Auto-collected metrics:** LCP, FCP, CLS, INP, TTFB, FID per page URL.

- Do NOT run load tests on every PR — too resource-intensive; run weekly or pre-release
- Use `test.step()` for named timing histograms
- Artillery Cloud for distributed testing (AWS Fargate, Azure ACI)
- **Basis:** [artillery-playwright-engine], [artillery-playwright-overview], [codoid-artillery-playwright]
- **Gold suite evidence: None** (0/10)

### P2.2 Consider k6 browser module for Grafana-stack teams

k6's browser module offers Playwright-compatible APIs with Grafana ecosystem integration:

- Rough Playwright API compatibility (familiar patterns, not 100% parity — by design)
- Web Vitals (FCP, INP, TTFB) as core metrics
- Hybrid model: HTTP protocol tests for load + browser tests for user-perceived performance
- Grafana Cloud/Prometheus/Loki integration for dashboarding and alerting
- Better choice than Artillery when the team already uses Grafana for observability

- **Basis:** [grafana-k6-browser-blog], [k6-hybrid-testing]
- **Gold suite evidence: None** (0/10)

---

## P3. Performance Budget Enforcement

### P3.1 Implement tiered performance budgets

Apply different performance checking rigor at different pipeline stages:

**PR-level (every commit, < 30s total):**
- TTFB < 800ms on critical pages
- Total page weight < 500KB (critical pages)
- No individual resources > 250KB uncompressed

**Nightly (thorough, 5-15 min):**
- Lighthouse performance score >= 80
- LCP < 2,500ms (desktop), < 4,000ms (throttled mobile)
- CLS < 0.1
- FCP < 1,800ms

**Weekly/Pre-release (load):**
- Artillery: p95 response < 3,000ms at target concurrency
- Error rate < 1% under load

- Do NOT block PRs on full Lighthouse audits — too slow (5-15s per page) and too variable
- PR-level smoke tests should complete in < 30s total
- **Basis:** [focusreactive-performance], [kazis-lighthouse], [artillery-playwright-engine]

### P3.2 Start lenient and ratchet thresholds up over time

- Begin with your application's current performance as the baseline
- Set initial thresholds 10-20% above current metrics (to prevent false failures)
- Tighten thresholds as the team improves performance
- Example progression: performance score 65 -> 70 -> 75 -> 80 -> 85 over weeks/months
- Use page-criticality tiers: homepage (strictest), product pages (strict), admin (lenient)

- **Basis:** [kazis-lighthouse], [testingplus-lighthouse]

### P3.3 Account for performance metric variance

- Performance metrics vary between runs (CPU load, network jitter, GC timing)
- Do NOT make pass/fail decisions on a single metric from a single run
- Options for handling variance:
  - Run performance tests multiple times and compare averages/percentiles
  - Compare against a rolling average of the last N runs (20% regression threshold)
  - Use `test.describe.configure({ retries: 2 })` for performance tests
- Accept approximately 20% variance as normal for browser-based performance metrics

- **Basis:** [focusreactive-performance], community practice

---

## P4. Performance Test Structure

### P4.1 Separate performance tests from functional tests

Create a dedicated Playwright project for performance tests:

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'e2e',
      testDir: './tests/e2e',
    },
    {
      name: 'performance',
      testDir: './tests/performance',
      use: {
        headless: true,
        browserName: 'chromium',  // CDP/Lighthouse require Chromium
      },
      timeout: 60000,  // Longer timeout for perf tests
    },
    {
      name: 'performance-smoke',
      testDir: './tests/performance/smoke',
      use: {
        headless: true,
        browserName: 'chromium',
      },
      timeout: 30000,
    },
  ],
});
```

- Performance tests have different timeout, browser, and parallelism requirements
- Use separate test directories to enable independent execution
- **Basis:** [kazis-lighthouse]; structural pattern observed across community guides

### P4.2 Organize performance tests by concern

```
tests/
  e2e/                  # Functional tests
  performance/
    smoke/              # PR-level smoke tests (TTFB, bundle size)
    lighthouse/         # Lighthouse audit tests (nightly)
    vitals/             # Web Vitals assertion tests (nightly, with throttling)
    load/               # Artillery scenarios (weekly)
    fixtures/           # Performance-specific fixtures
      performance.ts    # PerformanceObserver fixture
      lighthouse.ts     # Lighthouse + get-port fixture
```

- **Basis:** Structural analysis of community patterns

### P4.3 Create performance-specific fixtures

Encapsulate metric collection in reusable fixtures:

```typescript
// fixtures/performance.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  withVitals: async ({ page }, use) => {
    await page.addInitScript(() => {
      window.__vitals = {};
      new PerformanceObserver((list) => {
        window.__vitals.lcp = list.getEntries().at(-1)?.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      // ... CLS, FCP observers
    });

    await use(async () => {
      return page.evaluate(() => window.__vitals);
    });
  },
});
```

- Pre-navigation injection ensures metrics capture from page load start
- Fixture cleanup: detach CDP sessions in fixture teardown
- **Basis:** [playwright-performance-metrics-lib], [kazis-lighthouse]

---

## P5. CI Pipeline Architecture for Performance

### P5.1 Use a separate workflow file for performance tests

```yaml
# .github/workflows/performance.yml
name: Performance Tests
on:
  schedule:
    - cron: '0 2 * * *'  # Nightly at 2 AM
  pull_request:
    paths:
      - 'src/**'

jobs:
  smoke-perf:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install chromium --with-deps
      - run: |
          npm start &
          npx wait-on http://localhost:3000
          npx playwright test --project=performance-smoke

  full-perf:
    if: github.event_name == 'schedule'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install chromium --with-deps
      - run: |
          npm start &
          npx wait-on http://localhost:3000
          npx playwright test --project=performance
      - uses: actions/upload-artifact@v4
        with:
          name: lighthouse-reports
          path: lighthouse-reports/
```

- Same repository as functional tests; separate workflow file
- PR-level: smoke only (TTFB, bundle size) — fast, non-blocking
- Nightly: full Lighthouse audits + throttled Web Vitals
- Weekly: Artillery load tests (separate job, more resources)
- Upload Lighthouse HTML reports as CI artifacts for team review
- **Basis:** [kazis-lighthouse]; CI pipeline best practices

### P5.2 Install only Chromium for performance tests

- Performance tests require Chromium (CDP, Lighthouse dependency)
- `npx playwright install chromium --with-deps` — skip Firefox/WebKit
- Saves CI time and resources compared to installing all browsers
- **Basis:** [playwright-ci-docs]

---

## P6. CI Execution Performance

### P6.1 Optimize CI execution through sharding, not workers

- Use `--shard=X/Y` for horizontal scaling across CI machines
- Set `workers: 1` per shard for stability
- **Basis:** [playwright-ci-docs, currents-github-actions]; **Gold suite evidence: 5/10**

### P6.2 Use dynamic shard calculation for suites > 200 tests

- Automatically calculate optimal shard count from test count and project count
- Sweet spot for sharding benefit: 100-800 tests per suite
- **Basis:** [foster-dynamic-sharding, currents-sharding-analysis]; **Gold suite evidence: 3/10**

### P6.3 Do NOT cache browser binaries in CI

- Browser binary restoration time matches download time — no net benefit
- Instead, install only needed browsers
- **Basis:** [playwright-ci-docs]; **Gold suite evidence: 10/10**

### P6.4 Set `maxFailures` to prevent CI cost overrun

- Abort test runs early when too many tests fail
- Prevents wasting CI minutes on cascading failures
- **Basis:** [calcom-e2e: `maxFailures: 10`]; **Gold suite evidence: 2/10**

---

## P7. Test Suite Performance

### P7.1 Minimize artifact overhead

- Use `trace: 'retain-on-failure'` or `'on-first-retry'` — never `'on'`
- Disable video by default (only AFFiNE captures video among Gold suites)
- Disable screenshots for passing tests
- **Basis:** 10/10 Gold suites use conditional artifact capture

### P7.2 Use `webServer.reuseExistingServer` for local speed

- `reuseExistingServer: !process.env.CI` avoids server restart on every test run locally
- **Basis:** [calcom-e2e, affine-e2e, immich-e2e]; **Gold suite evidence: 3/10**

### P7.3 Target test execution sweet spots

- Individual tests: aim for < 30s per test
- Full suite: 100-800 tests is the optimal range for sharding efficiency
- Below 100 tests: sharding adds more overhead than benefit
- Above 800 tests: invest in test organization and selective execution
- **Basis:** [currents-sharding-analysis]

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|-------------|---------------|------------------|
| `page.route()` with delays for throttling | Only adds latency; does not throttle bandwidth | CDP `Network.emulateNetworkConditions` |
| `slowMo` for network simulation | Slows Playwright operations, not network I/O | CDP `Network.emulateNetworkConditions` |
| Injecting `web-vitals` npm library | Does not work in `page.evaluate()` context | Native PerformanceObserver API |
| Single-run pass/fail on performance metrics | Variance too high; one run is unreliable | Multiple runs with percentile comparison |
| Blocking PRs on full Lighthouse audits | Too slow (5-15s/page) and too variable | Smoke metrics on PR; full audits nightly |
| `page.waitForTimeout()` as performance measure | Measures arbitrary delay, not actual performance | PerformanceObserver or Navigation Timing API |
| Running Lighthouse on Firefox/WebKit | Lighthouse requires CDP (Chromium-only) | Test performance on Chromium; functional on all |
| Starting with Google's ideal thresholds | Will fail immediately if app is below "Good" | Start at current baseline; ratchet up |

---

## Tool Reference

| Tool | Purpose | Install | Chromium-Only |
|------|---------|---------|---------------|
| PerformanceObserver (built-in) | Web Vitals measurement | None | No (cross-browser) |
| CDP Performance.getMetrics | Deep profiling | None (Playwright built-in) | Yes |
| CDP Network.emulateNetworkConditions | Network throttling | None (Playwright built-in) | Yes |
| playwright-lighthouse | Lighthouse audits | `npm i -D playwright-lighthouse lighthouse get-port` | Yes |
| playwright-performance-metrics | Metric collection library | `npm i -D playwright-performance-metrics` | Yes |
| Artillery | Load testing | `npm i -D artillery` | Yes (Playwright engine) |
| k6 browser | Load + synthetic testing | Separate install (Go binary) | Yes |

---

## Revision History

| Date | Change | Basis |
|---|---|---|
| 2026-03-18 | Initial draft from landscape rounds 1-12 | Guides/blogs only; 0/10 Gold suites demonstrate performance testing |
| 2026-03-18 | DEFINITIVE version from performance rounds 33-36 | 15+ sources; Checkly, FocusReactive, playwright-lighthouse, Artillery, k6, CDP patterns; community consensus |
