# Round 35 — Findings: Performance Budgets, Test Structure, Reporting

## Key Finding 1: Performance Budget Definition and Enforcement

### Four Budget Enforcement Patterns (Ranked by Adoption)

**1. Lighthouse Score Budgets (Most Adopted)**
- Easiest to implement; single `playAudit()` call
- Categories: performance, accessibility, best-practices, SEO, PWA
- Start with current scores, gradually tighten (e.g., 70 -> 80 -> 90)
- Reports available as CI artifacts (HTML, JSON, CSV)
- Limitation: Aggregate scores can mask individual metric regressions

**2. Web Vitals Assertion Budgets (Most Granular)**
- Per-metric thresholds using `expect()` assertions
- Google-defined "good" thresholds are the standard starting point
- Can test under multiple network conditions (3G, 4G, WiFi)
- Requires custom metric collection code (PerformanceObserver)
- Most flexible; can target specific pages and user flows

**3. Artillery Load Performance Budgets (For Scale)**
- `ensure` block in YAML config defines pass/fail conditions
- Percentile-based: p95 response time, max error rate
- Tests performance under concurrent load (realistic user counts)
- Auto-collected Web Vitals provide user-perceived performance data
- Most expensive to run (browser instances per VU)

**4. Resource/Bundle Size Budgets (Preventive)**
- Checks total transfer size via Resource Timing API
- Catches accidentally large bundles before they impact Web Vitals
- Lightweight; can run on every PR without significant cost
- Does not measure rendering performance — only transfer size

### Recommended Budget Strategy
```
PR-level (fast, every commit):
  - TTFB < 800ms
  - Total page weight < 500KB (critical pages)
  - No resources > 250KB uncompressed

Nightly (thorough):
  - Lighthouse performance score >= 80
  - LCP < 2500ms (desktop), < 4000ms (mobile/throttled)
  - CLS < 0.1
  - FCP < 1800ms

Weekly (load):
  - Artillery: p95 response < 3000ms at target concurrency
  - Error rate < 1% under load
```

## Key Finding 2: Structural Differences Between Performance and Functional Tests

| Aspect | Functional Tests | Performance Tests |
|--------|-----------------|-------------------|
| **Assertions** | State-based (visible, has text) | Metric-based (< 2500ms, < 0.1) |
| **Timeout** | 30s default | 60-120s (Lighthouse audits) |
| **Parallelism** | Safe to parallelize | May need isolation (load tests) |
| **Browser** | Multi-browser (Chromium, FF, WebKit) | Often Chromium-only (CDP, Lighthouse) |
| **Run frequency** | Every PR/commit | Nightly, weekly, or on-demand |
| **Flakiness tolerance** | Low (flaky = blocked PR) | Higher (variance is expected) |
| **Artifacts** | Screenshots, traces | Lighthouse reports, metric CSVs |
| **Setup** | App + test data | App + test data + network conditions |
| **Duration** | < 30s per test | 5-60s per test (audits), minutes (load) |
| **Config project** | Shared with functional | Separate `performance` project |

### Key Structural Pattern: Separate Performance Test Directory

```
tests/
  e2e/           # Functional tests
  performance/   # Performance tests
    lighthouse/  # Lighthouse audit tests
    vitals/      # Web Vitals assertion tests
    load/        # Artillery load test scripts
```

### Performance Test Fixture Pattern

```typescript
// fixtures/performance.ts
import { test as base } from '@playwright/test';

type PerformanceFixtures = {
  metrics: PerformanceMetrics;
  cdpClient: CDPSession;
};

export const test = base.extend<PerformanceFixtures>({
  metrics: async ({ page }, use) => {
    // Inject observers before navigation
    await page.addInitScript(() => {
      window.__perfMetrics = {};
      // ... PerformanceObserver setup
    });
    await use(/* metrics accessor */);
  },
  cdpClient: async ({ page }, use) => {
    const client = await page.context().newCDPSession(page);
    await client.send('Performance.enable');
    await use(client);
    await client.detach();
  },
});
```

## Key Finding 3: Reporting and Dashboarding Patterns

### CI Report Integration

**Lighthouse Reports:**
- HTML reports as GitHub Actions artifacts
- JSON reports for trend analysis
- `playwright-lighthouse` generates reports per audit automatically
- Store in `lighthouse-reports/` directory; upload as CI artifacts

**Web Vitals Trend Tracking:**
- No standard tool for Playwright Web Vitals trending
- Options: custom JSON logging + charting, Grafana dashboards (if using k6), Artillery Cloud
- Best practice: append metrics to a JSON Lines file per run, compare against historical data

**Artillery Reporting:**
- Built-in console, JSON, and HTML reports
- Artillery Cloud provides historical trends, comparison across runs
- Grafana integration for custom dashboards

### Trend Detection Pattern (Custom)
```typescript
// After collecting metrics, append to history file
const metrics = { date: new Date().toISOString(), lcp, fcp, cls, ttfb };
fs.appendFileSync('perf-history.jsonl', JSON.stringify(metrics) + '\n');

// In CI, compare against last N runs
const history = fs.readFileSync('perf-history.jsonl', 'utf8')
  .trim().split('\n').map(JSON.parse);
const avgLcp = history.slice(-10).reduce((s, m) => s + m.lcp, 0) / 10;
expect(lcp).toBeLessThan(avgLcp * 1.2); // 20% regression threshold
```

## Key Finding 4: CI Pipeline Architecture for Performance Tests

### Recommended: Separate Pipeline, Not Separate Repository

```yaml
# .github/workflows/performance.yml
name: Performance Tests
on:
  schedule:
    - cron: '0 2 * * *'  # Nightly at 2 AM
  pull_request:
    paths:
      - 'src/**'          # Only when source changes

jobs:
  smoke-performance:
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

  full-performance:
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

  load-test:
    if: github.event_name == 'schedule'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install chromium --with-deps
      - run: npx artillery run tests/load/scenario.yml
```

### Key Pipeline Decisions

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| Same repo or separate? | Same repo | Performance tests should evolve with the code |
| Same pipeline or separate? | Separate workflow file | Different triggers, timeouts, resource needs |
| Block PRs on performance? | Smoke only (TTFB, bundle size) | Full audits too slow/variable for PR gates |
| How often for full suite? | Nightly | Balances cost with regression detection speed |
| How often for load tests? | Weekly or pre-release | Most expensive; resource-intensive |

## Observations

1. **Performance budgets should be tiered** — lightweight checks on PRs, thorough checks nightly
2. **Lighthouse score thresholds should start low and ratchet up** — begin at current baseline, improve incrementally
3. **Performance tests need a dedicated Playwright project** — different timeout, browser, and parallelism settings
4. **No standardized performance trending tool exists** for Playwright Web Vitals — teams must build custom or use Artillery Cloud/Grafana
5. **Performance test flakiness is expected** — variance is inherent; use percentile comparisons (p75, p95) not single-run values
