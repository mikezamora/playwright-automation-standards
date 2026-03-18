# Round 28 — Suites Analyzed

**Phase:** Validation
**Focus:** CI/CD integration patterns — parallelism strategies, PR check integration, cost optimization, CI-vs-local differences
**Date:** 2026-03-18

## Suites and Sources Analyzed

### Gold-Standard Suites — Parallelism and PR Integration Evidence

1. **grafana/grafana** — Per-project parallelism: plugin tests (parallel) vs admin tests (serial); `workers: 2` in CI; GitHub Actions required status checks for e2e; conditional test runs via `paths` filter on plugin directories
2. **calcom/cal.com** — 4-shard matrix with `workers: 1` per shard; Vercel preview URL detection for deployment testing; required PR checks block merge; `maxFailures: 10` for cost optimization; selective testing via affected-package detection
3. **toeverything/AFFiNE** — 6-shard matrix with per-package parallelism; conditional CI triggered only when test-related files change; build caching with Turborepo; separate smoke test job runs on every PR (fast gate), full suite on merge to main
4. **immich-app/immich** — Single-worker serial execution in CI; Docker Compose service health checks as test prerequisites; PR checks required for merge; no sharding (suite size doesn't warrant it)
5. **excalidraw/excalidraw** — Visual regression tests run only when UI files change; matrix strategy across browsers; baseline update workflow (separate CI job for updating screenshots)
6. **ianstormtaylor/slate** — Cross-platform matrix (3 OS x 3 browsers = 9 jobs); no sharding within jobs; `fail-fast: false` to capture all platform failures

### Parallelism and Optimization Sources

7. **Playwright official docs** — Parallelism page: `fullyParallel`, `workers`, per-project/per-file/per-describe control; worker index and parallel index APIs
8. **Playwright official docs** — Test sharding page: `--shard=N/M`, blob reporter, merge-reports workflow
9. **Currents.dev guide** — CI cost optimization: selective testing, browser caching, shard balancing, conditional workflows
10. **Ray.run blog** — Playwright parallelism deep dive: worker isolation model, `test.describe.configure({ mode: 'parallel' })`, worker-scoped vs test-scoped fixtures
11. **Better Stack guide** — Playwright CI performance optimization: parallelism tuning, resource allocation, test splitting strategies

## Method

- Analyzed parallelism configuration across Gold suites (workers, fullyParallel, per-project)
- Compared sharding strategies and their cost/benefit tradeoffs
- Documented PR check integration patterns (required checks, status gates)
- Studied cost optimization techniques (conditional runs, selective testing, caching)
- Mapped CI-vs-local configuration differences in detail
