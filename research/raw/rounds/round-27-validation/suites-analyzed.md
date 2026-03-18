# Round 27 — Suites Analyzed

**Phase:** Validation
**Focus:** CI/CD integration patterns — GitHub Actions workflows, Docker execution, sharding strategies
**Date:** 2026-03-18

## Suites and Sources Analyzed

### Gold-Standard Suites — CI/CD Pipeline Evidence

1. **grafana/grafana** — GitHub Actions matrix strategy across 3 browser targets; `mcr.microsoft.com/playwright` Docker image; blob reporter for sharded runs; browser caching via `actions/cache`; artifact upload with `if: always()`
2. **calcom/cal.com** — Monorepo CI with Turborepo integration; `--shard=N/M` across 4 matrix jobs; blob reporter + `merge-reports` post-step; Vercel preview deployment testing; `maxFailures: 10` for early abort
3. **toeverything/AFFiNE** — 9 test packages with per-package CI jobs; Docker Compose for service dependencies; blob reporter with 6-shard matrix; conditional CI runs via `paths` filter; extensive artifact management (HTML reports, traces, screenshots)
4. **immich-app/immich** — Docker Compose orchestration in CI (5+ containers); `docker compose up -d` in GitHub Actions setup; workers=1 for serial stability; artifact upload for traces and screenshots
5. **freeCodeCamp/freeCodeCamp** — Multi-stage CI pipeline: build > seed > test; Cypress-to-Playwright migration CI patterns; `webServer` config for local dev server in CI; conditional test execution based on changed paths
6. **ianstormtaylor/slate** — Cross-platform CI matrix (Ubuntu, macOS, Windows); browser-specific projects in CI; minimal sharding (single job per browser); `process.env.CI` for config switching

### CI/CD Documentation and Community Sources

7. **Playwright official docs** — CI page: GitHub Actions workflow template; Docker recommendations (`--init`, `--ipc=host`); sharding configuration; blob reporter + merge-reports pattern
8. **Playwright official docs** — Docker page: `mcr.microsoft.com/playwright` image variants; Dockerfile patterns; `--ipc=host` or `--shm-size=1gb` requirement
9. **Currents.dev guide** — GitHub Actions Playwright integration: matrix strategy, sharding, parallelism optimization; cost analysis of CI strategies
10. **Dev.to CI integrations** — Playwright CI patterns: artifact management, reporter selection, `if: always()` requirement
11. **BrowserStack guide** — CI/CD best practices for Playwright: pipeline structure, environment management, parallel execution

## Method

- Analyzed GitHub Actions workflow files across all Gold suites
- Compared sharding strategies (matrix dimensions, shard counts, blob reporter usage)
- Documented Docker image usage patterns and configuration requirements
- Mapped CI-specific config overrides (`process.env.CI` patterns)
- Cataloged artifact management strategies (HTML reports, traces, screenshots, videos)
