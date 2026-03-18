# Round 30 — Suites Analyzed

**Phase:** Validation
**Focus:** Test isolation and environment management — global setup, webServer config, preview deployment testing, multi-environment strategies
**Date:** 2026-03-18

## Suites and Sources Analyzed

### Gold-Standard Suites — Global Setup and Environment Evidence

1. **grafana/grafana** — `globalSetup` script starts Grafana server via Docker; health check polling before test start; teardown stops containers; no `webServer` config (managed externally)
2. **calcom/cal.com** — `webServer` config for Next.js dev server; `reuseExistingServer: !process.env.CI` pattern; Vercel preview URL injection via GitHub Actions output; database migration in `globalSetup`
3. **toeverything/AFFiNE** — Per-package `webServer` configuration; build step before test in CI; `globalSetup` for workspace initialization; environment-specific feature flag configuration
4. **immich-app/immich** — Docker Compose as external server management; no `webServer` (services started via `docker compose up`); health check via API polling in `globalSetup`; database migration on container startup
5. **freeCodeCamp/freeCodeCamp** — `webServer` config for curriculum server; `npm run develop` as the command; `reuseExistingServer: true` for local (developer starts server manually); seed script in `globalSetup`
6. **excalidraw/excalidraw** — `webServer` config for Vite dev server; simple setup (no database, no auth); `reuseExistingServer` enabled locally

### Global Setup and Environment Sources

7. **Playwright official docs** — webServer configuration: command, url, reuseExistingServer, timeout, stdout/stderr handling
8. **Playwright official docs** — Global setup and teardown: function signatures, project dependencies as alternative, shared state via environment variables
9. **Vercel docs** — Preview deployment URLs: `VERCEL_URL` environment variable, GitHub Actions integration, deployment status checks
10. **Netlify docs** — Deploy previews: per-PR preview URLs, notification hooks for CI integration
11. **Currents.dev guide** — Multi-environment test strategies: preview testing, staging gates, production smoke tests

## Method

- Analyzed `globalSetup` and `globalTeardown` scripts across Gold suites
- Documented `webServer` configuration patterns and the `reuseExistingServer` consensus
- Studied preview deployment testing workflows (Vercel, Netlify)
- Mapped multi-environment execution strategies
- Compared project dependencies vs `globalSetup` for initialization patterns
