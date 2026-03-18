# Round 33 — Suites & Sources Analyzed: Performance Testing Patterns (Search Phase 1)

## Scope

Search for Playwright performance testing patterns: Web Vitals measurement, Lighthouse integration, CDP metrics, network performance monitoring, and performance assertions.

## Sources Analyzed

| # | Source | Type | URL | Relevance |
|---|--------|------|-----|-----------|
| 1 | Checkly — Measuring Page Performance with Playwright | Docs/Guide | https://www.checklyhq.com/docs/learn/playwright/performance/ | HIGH — Comprehensive coverage of Navigation Timing, Resource Timing, Paint Timing, LCP, CLS, TBT APIs with code examples |
| 2 | FocusReactive — Testing Web Application Performance with Playwright | Blog | https://focusreactive.com/testing-web-application-performance-with-playwright/ | HIGH — PerformanceObserver patterns for all Core Web Vitals, CDP throttling, performance assertions with thresholds |
| 3 | playwright-performance-metrics (npm) | Library | https://github.com/Valiantsin2021/playwright-performance-metrics | HIGH — Dedicated library wrapping CDP + Performance APIs; fixture integration; network presets |
| 4 | playwright-lighthouse (npm) | Library | https://github.com/abhinaba-ghosh/playwright-lighthouse | HIGH — Lighthouse audit integration; playAudit() API; threshold-based assertions; report generation |
| 5 | Kazis.dev — Playwright & Lighthouse Tests | Blog | https://www.kazis.dev/blogs/playwright-lighthouse-tests | HIGH — Complete Lighthouse fixture pattern with get-port; CI/CD GitHub Actions workflow; dedicated performance project |
| 6 | TestingPlus — Lighthouse + Playwright 2025 Guide | Blog | https://testingplus.me/how-to-integrate-lighthouse-playwright-performance-testing-2025-guide/ | MEDIUM — Core Web Vitals capture; performance budget enforcement; CI integration |
| 7 | The Green Report — Frontend Performance Testing | Blog | https://www.thegreenreport.blog/articles/frontend-performance-testing-with-playwright-and-lighthouse/ | MEDIUM — Lighthouse audit within Playwright test context; performance score assertions |
| 8 | BrowserStack — Playwright Performance Testing | Guide | https://www.browserstack.com/guide/playwright-performance-testing | MEDIUM — Overview of approaches; CDP, Lighthouse, Artillery overview |
| 9 | Aishah Sofea — CDP Performance Deep Dive | Blog | https://medium.com/@aishahsofea/automated-performance-testing-with-playwright-and-chrome-devtools-a-deep-dive-52e8b240b00d | MEDIUM — CDP session metrics; Performance.getMetrics; Long Task detection |
| 10 | chrisbremmer/playwright-performance | Repo | https://github.com/chrisbremmer/playwright-performance | LOW — Small example repo; Web Performance API usage patterns |

## Gold Suite Performance Testing Audit

| Suite | Has Performance Tests | Approach | Notes |
|-------|----------------------|----------|-------|
| Cal.com | No | N/A | Functional E2E only |
| AFFiNE | No | N/A | Functional E2E only |
| Grafana | No | N/A | Functional E2E only (but Grafana builds k6 for perf) |
| freeCodeCamp | No | N/A | Functional E2E only |
| Excalidraw | No | N/A | Functional E2E only |
| Immich | No | N/A | Functional E2E only |
| Slate | No | N/A | Functional E2E only |
| Supabase | No | N/A | Functional E2E only |
| Next.js | No | N/A | Functional E2E only |
| Playwright (self) | No | N/A | Tests Playwright APIs, not application performance |

**Confirmed: 0/10 Gold suites include dedicated performance testing with Playwright.**

## Search Queries Used

1. "playwright performance testing patterns 2025 2026 page.metrics web vitals"
2. "playwright lighthouse integration CI performance budget enforcement 2025"
3. "playwright performance API CDP metrics LCP CLS INP TTFB measurement"
4. "playwright performance web-vitals library inject page.evaluate PerformanceObserver"
5. "playwright-lighthouse npm package CI github actions performance score threshold"
