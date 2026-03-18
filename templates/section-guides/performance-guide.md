# Performance Guide

> Section guide for performance testing standards. References: [performance-standards.md](../../standards/performance-standards.md) P1-P7.
>
> **Important caveat:** 0/10 Gold-standard suites demonstrate integrated performance testing. All patterns are community-recommended, not production-observed.

---

## Purpose and Goals

Performance testing in Playwright measures application-level metrics (Web Vitals, load times) and enforces budgets to prevent regressions. Goals:
- Catch performance regressions before they reach production
- Measure Core Web Vitals using the native browser Performance API
- Enforce tiered budgets (PR-level smoke, nightly full, weekly load)
- Separate performance tests from functional tests

---

## Key Standards

### P1.1 Web Vitals via PerformanceObserver

Use the native browser `PerformanceObserver` API (cross-browser, zero-dependency):

```typescript
const lcp = await page.evaluate(() => new Promise<number>((resolve) => {
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    resolve(entries.at(-1)!.startTime);
  }).observe({ type: 'largest-contentful-paint', buffered: true });
}));
expect(lcp).toBeLessThan(2500);
```

### P1.2 Core Web Vitals Thresholds

| Metric | Good (Target) | Needs Improvement | Poor |
|---|---|---|---|
| LCP | < 2,500ms | 2,500-4,000ms | > 4,000ms |
| FCP | < 1,800ms | 1,800-3,000ms | > 3,000ms |
| CLS | < 0.1 | 0.1-0.25 | > 0.25 |
| INP | < 200ms | 200-500ms | > 500ms |
| TTFB | < 800ms | 800-1,800ms | > 1,800ms |

Start with your application's current metrics as baseline. Ratchet toward "Good" thresholds over time [P3.2].

### P3.1 Tiered Performance Budgets

| Tier | When | Tests | Duration |
|---|---|---|---|
| PR-level | Every commit | TTFB, page weight | < 30s total |
| Nightly | Scheduled | Lighthouse, Web Vitals | 5-15 min |
| Weekly | Pre-release | Artillery load tests | 15+ min |

### P4.1 Separate Performance Tests

Create a dedicated Playwright project:

```typescript
projects: [
  { name: 'e2e', testDir: './tests/e2e' },
  {
    name: 'performance',
    testDir: './tests/performance',
    use: { headless: true, browserName: 'chromium' },
    timeout: 60_000,
  },
],
```

### P6.1 CI Execution: Sharding Over Workers

- `workers: 1` per shard for stability
- Scale horizontally via `--shard=X/Y`
- Set `maxFailures` for CI cost control [P6.4]

---

## Code Example: Performance Smoke Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Performance Smoke', () => {
  test('homepage TTFB is within budget', async ({ page }) => {
    await page.goto('/');
    const ttfb = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return nav.responseStart - nav.requestStart;
    });
    expect(ttfb).toBeLessThan(800);
  });

  test('homepage LCP is within budget', async ({ page }) => {
    const lcp = await page.evaluate(() => new Promise<number>((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        resolve(entries.at(-1)!.startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    }));
    await page.goto('/');

    // Wait for LCP to be measured
    await page.waitForLoadState('networkidle');
    expect(lcp).toBeLessThan(2500);
  });
});
```

---

## Common Pitfalls

| Pitfall | Why It Fails | Fix |
|---|---|---|
| `page.route()` with delays for throttling | Only adds latency, does not throttle bandwidth | CDP `Network.emulateNetworkConditions` [P1.4] |
| `slowMo` for network simulation | Slows Playwright operations, not network I/O | CDP network throttling [P1.4] |
| Injecting `web-vitals` npm library | Does not work in `page.evaluate()` context | Native PerformanceObserver API [P1.1] |
| Single-run pass/fail | Variance too high for one measurement | Multiple runs with percentile comparison [P3.3] |
| Blocking PRs on full Lighthouse audits | 5-15s per page, too slow and variable | Smoke metrics on PR; full audits nightly [P3.1] |
| Starting with Google's ideal thresholds | Will fail immediately if app is below "Good" | Start at current baseline, ratchet up [P3.2] |
| Running Lighthouse on Firefox/WebKit | Lighthouse requires CDP (Chromium-only) | Performance tests on Chromium only [P5.2] |

---

## When to Deviate

- **Skip performance testing entirely:** 0/10 Gold suites include integrated performance testing. It adds complexity and is not a prerequisite for a high-quality functional test suite [P1.1].
- **k6 instead of Artillery:** Better choice when the team already uses Grafana for observability [P2.2].
- **No Lighthouse integration:** Lighthouse adds dependencies (`playwright-lighthouse`, `get-port`, `lighthouse`). Manual Lighthouse audits may be sufficient [P1.3].
- **Accept 20% metric variance:** Browser-based performance metrics inherently vary. Use retry/averaging rather than single-run assertions [P3.3].
