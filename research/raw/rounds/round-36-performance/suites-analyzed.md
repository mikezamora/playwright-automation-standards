# Round 36 — Suites & Sources Analyzed: Standards Synthesis

## Scope

Final synthesis round: determine what is production-ready vs. experimental, establish definitive performance standards, assess threshold management and alerting patterns.

## Sources Cross-Referenced for Standards

| # | Source | Used For |
|---|--------|----------|
| 1 | Checkly — Performance Measurement | PerformanceObserver API patterns; Navigation/Resource/Paint Timing |
| 2 | FocusReactive — Performance Testing | Threshold values; multi-condition testing; CDP patterns |
| 3 | playwright-performance-metrics | Library assessment; fixture integration; network presets |
| 4 | playwright-lighthouse | Lighthouse integration maturity; API stability; version compatibility |
| 5 | Kazis.dev — Lighthouse Tests | CI/CD workflow; dedicated project pattern; GitHub Actions |
| 6 | Artillery — Playwright Engine | Load testing maturity; auto Web Vitals; scaling architecture |
| 7 | k6 — Browser Module | Alternative load testing; Grafana integration; hybrid model |
| 8 | Playwright Issues #8622, #29155, #32618 | Official stance on network throttling; CDP as recommended path |
| 9 | Google Core Web Vitals Program | Authoritative threshold values for LCP, CLS, INP, TTFB, FCP |
| 10 | All 10 Gold Suites | Confirmation: 0/10 have performance testing (no counter-evidence found) |

## Maturity Assessment

| Pattern/Tool | Maturity | Production-Ready? | Basis |
|--------------|----------|-------------------|-------|
| PerformanceObserver via page.evaluate() | Stable | Yes | W3C standard; cross-browser; no dependencies |
| CDP Performance.getMetrics | Stable | Yes (Chromium) | Chrome DevTools Protocol; long-standing API |
| CDP Network.emulateNetworkConditions | Stable | Yes (Chromium) | Chrome DevTools Protocol; documented presets |
| playwright-lighthouse (v4.x) | Stable | Yes | 3+ years maintained; Lighthouse 11; active repo |
| playwright-performance-metrics | Early | Conditional | Newer library; lower adoption; useful abstractions |
| Artillery + Playwright | Stable | Yes | Built-in engine; commercial support; distributed scaling |
| k6 Browser Module | GA | Yes | Grafana-backed; GA status; enterprise support |
| Chrome Trace profiling | Stable | Conditional | Advanced; requires custom analysis tooling |
| page.route() delay-based throttling | Stable | No (use CDP) | Only adds latency; does not throttle bandwidth |
| web-vitals library injection | Unstable | No | Does not work in page.evaluate() context |
| Playwright built-in throttling API | N/A | N/A | Does not exist; feature requested but not planned |

## Threshold Management Patterns Observed

### Pattern 1: Static Thresholds (Most Common)
```typescript
const PERF_BUDGETS = {
  lcp: 2500,
  fcp: 1800,
  cls: 0.1,
  ttfb: 800,
  inp: 200,
};
```
Hardcoded in test files or shared config. Simple but doesn't account for drift.

### Pattern 2: Baseline + Tolerance
```typescript
// Compare against rolling average
expect(currentLcp).toBeLessThan(baselineLcp * 1.2); // 20% regression tolerance
```
Requires maintaining a history file. More resilient to natural variance.

### Pattern 3: Ratcheting (Lighthouse)
Start with current scores, only allow improvement:
- Week 1: performance >= 65
- Week 4: performance >= 70 (if achieved consistently)
- Week 8: performance >= 75

### Pattern 4: Tiered Budgets by Page Criticality
```typescript
const BUDGETS = {
  homepage: { lcp: 2000, cls: 0.05 },  // Stricter
  settings: { lcp: 3000, cls: 0.15 },  // More lenient
  admin: { lcp: 4000, cls: 0.25 },     // Lenient
};
```

## Alerting Patterns

No standardized alerting patterns exist in the Playwright performance testing ecosystem. Observed approaches:
1. **CI failure = alert** — Performance test failure blocks merge or sends notification
2. **Artillery Cloud** — Built-in alerting on threshold breaches
3. **Grafana Alerting** — k6 metrics exported to Prometheus; Grafana alert rules
4. **Custom** — Slack webhooks on CI failure; custom scripts comparing metric history

## What's NOT Production-Ready

1. **No standard performance regression detection** — No built-in way to compare metrics across runs
2. **No standard performance dashboard for Playwright** — Must use external tools
3. **No cross-browser performance testing** — CDP-dependent patterns are Chromium-only
4. **No official Playwright performance testing API** — All approaches use evaluation or external tools
5. **Performance test flakiness is an unsolved problem** — Metric variance requires statistical approaches
