# Round 33 — Findings: Web Vitals Measurement & Lighthouse Integration

## Key Finding 1: Three Distinct Approaches to Performance Testing with Playwright

The ecosystem has converged on three main approaches, each at different maturity levels:

| Approach | Maturity | Chromium-Only | Complexity | Best For |
|----------|----------|---------------|------------|----------|
| PerformanceObserver via `page.evaluate()` | Stable (native browser API) | No (cross-browser) | Medium | Specific metric assertions |
| CDP Session (`Performance.getMetrics`) | Stable (Chrome-specific) | Yes | High | Granular profiling |
| `playwright-lighthouse` package | Stable (3rd-party) | Yes | Low | Comprehensive audits |

## Key Finding 2: Web Vitals Measurement via PerformanceObserver

The native browser Performance API approach is the most widely recommended. Pattern:

```typescript
// LCP measurement
const lcp = await page.evaluate(() => {
  return new Promise((resolve) => {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      resolve(entries.at(-1).startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
});

// CLS measurement
const cls = await page.evaluate(() => {
  return new Promise((resolve) => {
    let CLS = 0;
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (!entry.hadRecentInput) CLS += entry.value;
      });
      resolve(CLS);
    }).observe({ type: 'layout-shift', buffered: true });
  });
});

// TTFB measurement
const ttfb = await page.evaluate(() => {
  const nav = performance.getEntriesByType('navigation')[0];
  return nav.responseStart - nav.requestStart;
});
```

**Advantages:** Cross-browser (not Chromium-only), no dependencies, direct access to W3C standard APIs.
**Disadvantages:** Requires custom collection code per metric; no aggregated scoring.

### Recommended Thresholds (from Google/community consensus)

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | < 2,500ms | 2,500-4,000ms | > 4,000ms |
| FCP | < 1,800ms | 1,800-3,000ms | > 3,000ms |
| CLS | < 0.1 | 0.1-0.25 | > 0.25 |
| INP | < 200ms | 200-500ms | > 500ms |
| TTFB | < 800ms | 800-1,800ms | > 1,800ms |
| TBT | < 200ms | 200-600ms | > 600ms |

## Key Finding 3: playwright-lighthouse Package Pattern

The `playwright-lighthouse` package wraps Google Lighthouse for in-test audits:

```typescript
import { chromium } from 'playwright';
import { playAudit } from 'playwright-lighthouse';

// Browser MUST launch with remote debugging port
const browser = await chromium.launch({
  args: ['--remote-debugging-port=9222']
});

await playAudit({
  page,
  port: 9222,
  thresholds: {
    performance: 85,
    accessibility: 90,
    'best-practices': 90,
    seo: 80,
  },
  reports: {
    formats: { html: true, json: true },
    name: 'lighthouse-report',
    directory: './lighthouse-reports',
  },
});
```

**Key patterns:**
- Use `get-port` package for dynamic port allocation in parallel tests
- Create a dedicated Lighthouse test fixture (worker-scoped) managing port + browser
- Chromium-only — cannot test on Firefox/WebKit
- v3.x uses Lighthouse 10; v4.x uses Lighthouse 11
- Test timeout should be increased (60s+) for Lighthouse audits
- Reports can be HTML, JSON, or CSV for CI artifact archival

## Key Finding 4: CDP Session for Granular Metrics

```typescript
const client = await page.context().newCDPSession(page);
await client.send('Performance.enable');

// Collect metrics
const { metrics } = await client.send('Performance.getMetrics');
// Returns: JSHeapUsedSize, JSHeapTotalSize, Nodes, LayoutCount, RecalcStyleCount,
//          LayoutDuration, RecalcStyleDuration, ScriptDuration, TaskDuration, etc.
```

**Use cases:** CPU profiling, memory leak detection, layout thrash detection.
**Limitation:** Chromium-only; not available on Firefox or WebKit.

## Key Finding 5: web-vitals Library Injection Does NOT Work Directly

Attempting to inject Google's `web-vitals` npm library via `page.evaluate()` fails with `ReferenceError`. The library is designed for bundled browser contexts, not Playwright's evaluation context. The recommended approach is using native PerformanceObserver APIs instead.

## Key Finding 6: `page.addInitScript()` for Pre-Navigation Metric Collection

For metrics that must be captured from page load start:

```typescript
await page.addInitScript(() => {
  window.__vitals = {};
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    window.__vitals.lcp = entries.at(-1)?.startTime;
  }).observe({ type: 'largest-contentful-paint', buffered: true });
});

await page.goto('https://example.com');
const vitals = await page.evaluate(() => window.__vitals);
```

This ensures observers are registered before any content loads.

## Observations

1. **No Gold suite uses any of these approaches** — performance testing remains entirely separate from E2E testing in production codebases
2. **The community recommends PerformanceObserver over CDP** for Web Vitals because it's cross-browser
3. **Lighthouse integration is the most "batteries-included" option** but adds significant test execution time (5-15s per audit)
4. **Threshold values are well-established** by Google's Core Web Vitals program
5. **The `playwright-performance-metrics` library** abstracts away boilerplate and provides network presets (SLOW_3G, FAST_3G, REGULAR_4G)
