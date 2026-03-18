# Round 19 — Suites Analyzed

**Phase:** Structure
**Focus:** Deep dive on fixture patterns — composition, scoping, auth, data
**Date:** 2026-03-18

## Suites Analyzed

### 1. calcom/cal.com (fixture deep dive)
- **Fixture focus:** Multi-layered factory pattern, scenario composition, feature flag fixtures
- **Key files examined:** `apps/web/playwright/fixtures/users.ts`, fixture factory chain
- **Key patterns:** `createUsersFixture()` factory, transactional cleanup, worker-isolated email tracking, feature flag injection at user and team levels
- **Analysis:** [research/raw/suite-analyses/calcom.md](../../suite-analyses/calcom.md)

### 2. grafana/plugin-tools (fixture deep dive)
- **Fixture focus:** 19 fixture files, domain-specific page fixtures, API client fixtures
- **Key files examined:** `packages/plugin-e2e/src/fixtures/` directory (19 items), fixture composition across page/API/feature domains
- **Key patterns:** Domain-segmented fixtures (page fixtures, API fixtures, feature flag fixtures, accessibility fixtures), published as npm package
- **Analysis:** [research/raw/suite-analyses/grafana-plugin-tools.md](../../suite-analyses/grafana-plugin-tools.md)

### 3. Playwright official docs (fixture patterns reference)
- **Fixture focus:** Canonical fixture patterns from official documentation
- **Key patterns:** `test.extend<T>()` basic/advanced, `mergeTests()` composition, `{ scope: 'worker' }` scoping, `{ auto: true }` automatic fixtures, `{ timeout: N }` fixture-level timeouts, `{ option: true }` parameterized fixtures
- **Source:** https://playwright.dev/docs/test-fixtures

### 4. Auth pattern analysis (fixture-based vs project-based)
- **Fixture focus:** Comparing auth approaches across ecosystem
- **Key patterns:** Setup project with `storageState` (Grafana), fixture-based `globalCache.get()` on-demand auth (community pattern), worker-scoped shared accounts with `parallelIndex`
- **Source:** https://dev.to/vitalets/authentication-in-playwright-you-might-not-need-project-dependencies-2e02

## Method
- Deep-read Cal.com fixture factory implementation for composition patterns
- Cataloged Grafana plugin-e2e fixture organization
- Extracted canonical patterns from Playwright official documentation
- Compared auth fixture approaches: project dependencies vs on-demand fixtures
