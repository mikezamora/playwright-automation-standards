# Round 69 — Suites and Sources Analyzed

## Suites Re-examined (CI Differentiation and Tiering)

| Suite | Tier | CI Differentiation | Tiering Mechanism |
|-------|------|-------------------|-------------------|
| grafana/grafana | Gold | Change detection gating; triggered workflows | Structural (31 Playwright projects) + suite-level tags |
| element-hq/element-web | Gold | Two-tier: PR (Chrome+Synapse) vs merge queue (full matrix) | Tags (`@mergequeue`) + project config |
| n8n-io/n8n | Silver | 7 separate CI workflows (main, coverage-weekly, Docker, Helm, infra, performance) | Structural (28 test categories) |
| calcom/cal.com | Gold | None; all tests on every PR | Structural (7 Playwright projects) |
| immich-app/immich | Gold | 2 CI jobs (server-cli, web); path-based filtering | Structural (3 Playwright projects) |
| toeverything/AFFiNE | Gold | Copilot tests path-filtered; otherwise all | Structural (7 Playwright projects) |
| freeCodeCamp/freeCodeCamp | Gold | None visible | Structural only |
| wordpress/gutenberg | Silver | Browser tags (`@webkit`, `@firefox`) | Structural (5 directories) + browser tags |
| RocketChat/Rocket.Chat | Silver | None visible | Structural (flat files + federation subdir) |
| TryGhost/Ghost | Silver | None visible | Structural (5 E2E layers, 6 configs) |

## Community Sources Consulted

| Source | Key Contribution |
|--------|-----------------|
| BrowserStack — "15 Best Practices 2026" | "Smoke on PRs, regression on merge, slow on nightly" |
| Tim Deschryver — "Test Sets Using Tags and Grep" | 4 tag categories: @smoke, @flow, @ci, @feature |
| Playwright Solutions — Two-Tier CI Pattern | Daily full suite + PR targeted tests |
| Denis Skvortsov — Selective Execution by Code Change | git diff detection -> tag-based selective execution |
| Finnish Government (Opetushallitus) | Smoke projects targeting both QA and prod environments |
| German Government (digitalservicebund) | Smoke project targeting staging; full tests targeting localhost |
| Grafana Plugin Tools migration docs | Migration from @grafana/e2e (Cypress) to @grafana/plugin-e2e (Playwright) |
| Grafana issue #98825 | Epic tracking Cypress-to-Playwright migration: 8 months, 32/33 subtasks complete |
