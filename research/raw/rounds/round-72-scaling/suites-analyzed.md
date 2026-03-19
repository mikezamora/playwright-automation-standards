# Round 72 — Suites Analyzed

## Primary Analysis

### 1. Grafana (`grafana/grafana`)
- **Config analyzed:** `playwright.config.ts` (main branch, full file)
- **Focus:** 30-project configuration architecture, project taxonomy, dependency chains
- **Key finding:** Single mega-config with 30 projects maintainable via helper functions (`withAuth()`, `baseConfig` spreading)
- **Projects documented:** All 30 projects across 5 tiers (auth setup, role-scoped, data source plugins, core features, CUJ chain)

### 2. Next.js (`vercel/next.js`)
- **Config analyzed:** `.github/workflows/build_and_test.yml` (1,207 lines) + workflow directory listing (33 files)
- **Focus:** CI matrix architecture, shard distribution strategy, timing-based optimization
- **Key finding:** ~84 shards across 10+ test groups, static shard allocation with timing-based test assignment, multi-dimension matrix (React version x Node version x platform)

## Secondary Analysis (comparison data)

### 3. n8n (`n8n-io/n8n`)
- **Config analyzed:** `packages/testing/playwright/playwright-projects.ts`
- **Focus:** Dynamic project generation pattern
- **Key finding:** 5-7 projects generated dynamically based on environment (local vs container), conditional branching for database/topology variants

### 4. WordPress/Gutenberg (`wordpress/gutenberg`)
- **Focus:** Cross-reference from Round 62 — serial execution (1 worker), 3 browser projects
- **Key finding:** Config extends base from `@wordpress/scripts`, external parallelism handling

### 5. Rocket.Chat (`RocketChat/Rocket.Chat`)
- **Focus:** Cross-reference from Round 62 — serial execution anti-pattern
- **Key finding:** 170 specs, 1 worker, no sharding — confirmed as anti-pattern for suite of this size

## Community Sources

- BrowserStack: "15 Best Practices for Playwright testing in 2026"
- DEV Community (Playwright team): "Organizing Playwright Tests Effectively"
- DEV Community (Denis Skvortsov): "Selective test execution mechanism with Playwright"
- DEV Community (Playwright team): "Iterate quickly using the new --only-changed option"
- Playwright official docs: Sharding, Parallelism, Best Practices, Projects
- Microsoft Learn: "Optimal test suite configuration — Playwright Workspaces"
- Various monorepo setup guides: Nx, Turborepo, Finsweet patterns
