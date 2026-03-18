# Round 29 — Suites Analyzed

**Phase:** Validation
**Focus:** Test isolation and environment management — fresh contexts, storage state, database handling, environment variables
**Date:** 2026-03-18

## Suites and Sources Analyzed

### Gold-Standard Suites — Test Isolation Evidence

1. **grafana/grafana** — Fixture-based isolation: custom `grafanaPage` fixture creates fresh browser context per test; API-based cleanup in `afterEach`; `storageState` for auth persistence across tests within a project; environment-specific config via `.env.test`
2. **calcom/cal.com** — Setup project for auth: `global.setup.ts` authenticates via API, saves `storageState` to `.auth/`; Prisma database seeding in CI setup step; per-test API cleanup for booking/event data; environment variables via `.env.appStore`
3. **toeverything/AFFiNE** — Worker-scoped fixtures for expensive initialization; fresh browser context per test via `context` fixture; local storage manipulation for feature flags; environment-specific config per package
4. **immich-app/immich** — Docker Compose provides fully isolated environment; database seeded via migrations in CI; API-based test data creation and cleanup; `storageState` for admin vs user sessions; fresh containers per CI run
5. **freeCodeCamp/freeCodeCamp** — Database seeding via `npm run seed` in CI setup; fresh browser context per test (default Playwright behavior); environment variables managed via `.env` template; global setup runs database migrations
6. **ianstormtaylor/slate** — Minimal isolation needs (editor is client-side only); fresh browser context per test; no backend state management; `storageState` not used (no auth)

### Isolation and Environment Sources

7. **Playwright official docs** — Auth page: setup projects, `storageState`, reuse signed-in state, multi-role auth patterns
8. **Playwright official docs** — Global setup page: `globalSetup` and `globalTeardown` functions, project dependencies as modern alternative
9. **Playwright official docs** — Test fixtures page: worker-scoped vs test-scoped, automatic cleanup via `use`, fixture override patterns
10. **Ray.run blog** — Test isolation best practices: context isolation, storage state management, API-based cleanup
11. **Currents.dev guide** — Environment management: base URL configuration, secrets handling, multi-environment strategies

## Method

- Analyzed test isolation mechanisms across all Gold suites
- Documented `storageState` usage patterns for auth persistence
- Compared database seeding and cleanup strategies (API-based vs fixture-based vs migration-based)
- Mapped environment variable management patterns (dotenv, CI secrets, config files)
- Studied global setup scripts and their CI-specific configurations
