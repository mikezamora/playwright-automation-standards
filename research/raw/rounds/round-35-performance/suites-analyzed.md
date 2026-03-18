# Round 35 — Suites & Sources Analyzed: Deep Dive — Budgets, Structure, Reporting

## Scope

Deep dive into performance budget definition and enforcement, how performance tests differ structurally from functional tests, reporting and dashboarding patterns, and CI pipeline architecture for performance testing.

## Sources Re-Analyzed (Deep Dive)

| # | Source | Focus Area | Key Insight |
|---|--------|------------|-------------|
| 1 | Kazis.dev — Playwright & Lighthouse | Budget enforcement | Complete fixture pattern: worker-scoped port + browser; dedicated `Performance` project in config; GitHub Actions workflow with `wait-on` for server readiness |
| 2 | playwright-lighthouse (GitHub) | Budget thresholds | Default behavior fails if ANY metric < 100; customizable per-metric; `reports` option for HTML/JSON/CSV artifacts; `get-port` for parallel execution |
| 3 | FocusReactive — Performance with Playwright | Threshold assertions | Explicit `expect(lcp).toBeLessThan(2500)`; tests three network conditions (Slow 3G, Fast 3G, Slow 4G); CI recommendation: "every preview deployment" |
| 4 | Checkly — Measuring Performance | Metric collection | Navigation Timing, Resource Timing, Paint Timing, LCP, CLS, TBT APIs; recommends combining RUM + synthetic + testing + audits |
| 5 | Artillery — Playwright Engine | Load test reporting | Auto Web Vitals; Artillery Cloud for dashboarding; historical trend analysis; `test.step()` for custom timing histograms |
| 6 | playwright-performance-metrics (npm) | Library pattern | `PerformanceMetricsCollector` class; fixture integration; `collectMetrics()` with timeout/retry; `cleanup()` lifecycle; network presets |
| 7 | k6 — Hybrid Performance Testing | Dashboard integration | Grafana Cloud dashboards; Prometheus metrics export; time-series performance data |
| 8 | Momentic — Trace Viewer Guide | Performance debugging | Trace as performance investigation tool; action timing in Gantt view; network request analysis |
| 9 | TestDino — Playwright Reporting Metrics | Metric tracking | Test duration trends, flaky rate, pass rate; performance as a dimension of test health |
| 10 | Loadview Testing — Playwright Load Testing | Scaling patterns | Browser-based vs protocol-based load testing distinction; resource costs of browser-based approaches |

## Cross-Referencing: Performance Budget Enforcement Patterns

### Pattern A: Lighthouse Score Budgets
- **Definition:** Numeric scores (0-100) for categories: performance, accessibility, best-practices, SEO, PWA
- **Enforcement:** `playAudit()` fails test if score < threshold
- **Granularity:** Category-level (not individual metric-level)
- **Example:** `{ performance: 85, accessibility: 90 }`

### Pattern B: Web Vitals Metric Budgets
- **Definition:** Millisecond/numeric thresholds per metric (LCP < 2500ms, CLS < 0.1)
- **Enforcement:** Standard Playwright `expect()` assertions
- **Granularity:** Individual metric level
- **Example:** `expect(lcp).toBeLessThan(2500)`

### Pattern C: Artillery Performance Budgets
- **Definition:** `ensure` conditions in Artillery YAML config
- **Enforcement:** Artillery exits with non-zero code if conditions fail
- **Granularity:** Aggregate percentile-level (p95, p99)
- **Example:** `ensure: { p95: 3000, maxErrorRate: 1 }`

### Pattern D: Resource Budget (Bundle Size)
- **Definition:** Maximum transfer size per resource type
- **Enforcement:** Resource Timing API assertions
- **Granularity:** Per-resource or aggregate
- **Example:** `expect(totalTransferSize).toBeLessThan(500 * 1024)` (500KB)
