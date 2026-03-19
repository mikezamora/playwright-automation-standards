# Round 70 — Suites and Sources Analyzed

## Suites Re-examined (Growth Patterns and Negative Testing)

| Suite | Tier | Growth Pattern | Error Ratio | Key Negative Pattern |
|-------|------|---------------|-------------|---------------------|
| grafana/grafana | Gold | Migration-driven (Cypress to Playwright, 8 months) | 80:20 | Empty states, conflicting settings |
| calcom/cal.com | Gold | Organic feature-tracking | 85:15 | Booking conflicts, webhook errors |
| immich-app/immich | Gold | Layer-by-layer (API first, then UI, then UI mocks) | 70:30 (API) / 90:10 (UI) | Error DTO factory, permission matrix |
| n8n-io/n8n | Silver | Infrastructure-first (fixtures enable rapid addition) | 80:20 | Chaos testing, memory consumption, regression |
| element-hq/element-web | Gold | Security-driven (crypto tests disproportionate) | 88:12 | Key reset, backup deletion, consent |
| TryGhost/Ghost | Silver | Multi-layer E2E pyramid | 88:12 | Disabled features, theme errors |
| toeverything/AFFiNE | Gold | Multi-platform expansion | 95:5 | Minimal error testing |
| freeCodeCamp/freeCodeCamp | Gold | Curriculum-tracking | 95:5 | Minimal error testing |
| wordpress/gutenberg | Silver | Block-by-block growth | 90:10 | Limited negative cases |
| RocketChat/Rocket.Chat | Silver | Feature-tracking with serial execution | ~90:10 | Permission testing, invalid URLs |

## Community Sources Consulted

| Source | Key Contribution |
|--------|-----------------|
| Grafana issue #98825 | Migration timeline: Jan-Sep 2025, 32/33 subtasks, suite-by-suite conversion |
| Grafana Plugin Tools migration docs | No automated migration tooling; manual 1-by-1 test conversion |
| cryan.com — "Negative Testing in Playwright" | Try/catch pattern; helper function extraction; strategic value statement |
| Playwright mock docs (playwright.dev/docs/mock) | page.route() for error simulation; fulfill/abort/continue |
| BrowserStack — "How to Mock API with Playwright" | Route matching patterns; handler conflicts; code organization |
| TestDino — "Network Mocking" | route.fulfill/continue/abort; common pitfalls |
| Medium (Suseela) — "Playwright Edge Cases" | Edge case categories: timing, shadow DOM, API variability |
