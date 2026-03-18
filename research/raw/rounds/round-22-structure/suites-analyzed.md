# Round 22 — Suites Analyzed

**Phase:** Structure
**Focus:** Finalize structure standards — synthesis of all structural evidence from rounds 1-21
**Date:** 2026-03-18

## Suites Referenced (Standards Evidence Base)

This round synthesizes findings across all previously analyzed suites to produce the definitive structure standards. No new suites were analyzed; instead, all prior evidence was cross-referenced and validated.

### Gold-Standard Suites (10) — Primary Evidence
1. **grafana/grafana** — 31 projects, suite-based directories, `withAuth()` helper, setup/teardown chains
2. **calcom/cal.com** — 7 projects, factory fixtures, transactional cleanup, monorepo-aware config
3. **toeverything/AFFiNE** — 9 test packages, shared `@affine-test/kit`, function-based helpers
4. **immich-app/immich** — 3 projects, Docker Compose orchestration, DTO factory methods
5. **microsoft/playwright** — 2 projects, framework self-testing, canonical patterns
6. **freeCodeCamp/freeCodeCamp** — 6 projects, flat file structure, serial execution, maxFailures
7. **supabase/supabase** — Setup projects, storageState auth, globalSetup migration
8. **excalidraw/excalidraw** — Visual regression, a11y testing, Vitest hybrid
9. **grafana/plugin-tools** — 19 fixture files, published npm package, version-aware selectors
10. **vercel/next.js** — CI sharding, framework-level e2e testing

### Silver Suites (5) — Validation Evidence
11. **ianstormtaylor/slate** — 5 retries, conditional platform projects, action timeout 0
12. **PostHog/posthog** — Auto fixture auth, page-models/ directory, Cypress migration
13. **actualbudget/actual** — TypeScript conversion, Electron fixtures, local-first app
14. **supabase-community/e2e** — Auth-qualified filenames, globalSetup, localStorage auth
15. **vasu31dev/playwright-ts** — globalSetup/globalTeardown, custom logger reporter

### Bronze/Community (7) — Counter-Evidence
16. **ovcharski/playwright-e2e** — BasePage anti-pattern, JavaScript config
17. **rishivajre framework** — Multi-env config files, enterprise template
18. **ecureuill/saucedemo-playwright** — Type-based test directories (e2e/ui/visual)
19. **angelo-loria/playwright-boilerplate** — POM-as-fixture injection
20. **sampennington/playwright-posthog** — Custom matcher npm package
21. **MakerKit template** — Auth-state directory organization
22. **Nextbase Starter Kit** — Supabase auth integration

### Documentation Sources — Canonical Patterns
23. **Playwright official docs** — POM, fixtures, auth, configuration, best practices, test organization
24. **Playwright community** (dev.to/playwright) — Test organization article
25. **BrowserStack guides** — Playwright best practices 2026, timeout hierarchy, fixtures guide
26. **Better Stack** — Playwright best practices and pitfalls
27. **Community articles** — 17 Playwright mistakes, data management strategies, fixture composition

## Method
- Cross-referenced all 22+ suite analyses from rounds 1-21
- Validated each standard against minimum 2 Gold suite implementations
- Identified counter-patterns and documented as anti-patterns
- Consulted official documentation and community best practices for gap-filling
- Produced definitive standards with confidence levels and evidence citations
