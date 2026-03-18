# Round 13 — Suites Analyzed

**Phase:** Structure
**Focus:** Deep dive on gold-standard suites (batch 1)
**Date:** 2026-03-18

## Suites Analyzed

### 1. grafana/grafana
- **Config:** 28 projects, suite-based organization, custom a11y reporter
- **Key files examined:** `playwright.config.ts`, `e2e-playwright/` directory structure, `dashboards-suite/dashboard-browse.spec.ts`
- **Analysis:** [research/raw/suite-analyses/grafana.md](../../suite-analyses/grafana.md)

### 2. calcom/cal.com
- **Config:** 7 projects, monorepo-aware, triple webServer
- **Key files examined:** `playwright.config.ts`, `apps/web/playwright/` directory, `booking-pages.e2e.ts`, `fixtures/users.ts`
- **Analysis:** [research/raw/suite-analyses/calcom.md](../../suite-analyses/calcom.md)

### 3. toeverything/AFFiNE
- **Config:** 9 test packages, shared kit, GitHub reporter
- **Key files examined:** `tests/affine-local/playwright.config.ts`, `tests/` directory structure, `e2e/all-page.spec.ts`
- **Analysis:** [research/raw/suite-analyses/affine.md](../../suite-analyses/affine.md)

## Method
- Fetched playwright.config.ts for each suite
- Examined directory structures for architecture patterns
- Read sample test files for naming, assertion, and locator patterns
- Cross-referenced with landscape phase data
