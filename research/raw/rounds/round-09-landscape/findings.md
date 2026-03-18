# Round 09 — Landscape: Key Findings

**Focus:** Test data and environment management patterns in Gold-standard suites
**Date:** 2026-03-18

---

## Key Findings

### Finding 1: Setup projects with storageState have replaced globalSetup as the recommended auth pattern

The Playwright team explicitly recommends setup projects over globalSetup for authentication. Setup projects provide four advantages: (1) they appear in HTML reports and trace viewer, (2) they can be debugged with full DOM snapshots, (3) they participate in the fixture system, (4) multiple setup projects can run in parallel. Grafana, Supabase, and Grafana plugin-tools all use this pattern. The file convention is `playwright/.auth/<username>.json` stored in `.gitignore`. The anti-pattern is using globalSetup for auth, which is invisible in reports and cannot leverage fixtures.

**Evidence:** Playwright official docs (project dependencies > globalSetup), Grafana (`dependencies: ['auth']`, storageState at `playwright/.auth/admin.json`), Supabase (setup project saves `storage-state.json`)

### Finding 2: REST API authentication is faster and more stable than UI-based login

Multiple Gold suites offer or recommend authenticating via REST API calls instead of navigating through the login UI. Supabase uses REST API auth to get session tokens and sets them directly in localStorage. Grafana plugin-tools provisions users via the Grafana HTTP API. This pattern eliminates UI-dependent flakiness in the authentication step and is significantly faster (one HTTP call vs. navigation + form fill + redirect wait). The on-demand fixture approach from Vitalets further optimizes this by caching auth state in `globalCache.get()` so each shard only authenticates for roles it actually uses.

**Evidence:** Supabase (REST API login, set session in localStorage), Grafana plugin-tools (HTTP API user provisioning), Vitalets blog (globalCache.get() for on-demand auth)

### Finding 3: Database seeding strategies fall into three distinct categories

Gold suites use one of three data seeding approaches:

1. **Script-based seeding** (freeCodeCamp: `seed:certified-user`, Cal.com: `yarn db-seed` with Prisma). Pre-populates the database before tests run. Simple but creates coupling between seed scripts and test expectations.

2. **API-based seeding** (Grafana: admin API creates datasources/users; Supabase: Supabase CLI for local infra). Creates data programmatically during test setup. More flexible but requires API client management.

3. **Container-based isolation** (Immich: fresh Docker Compose stack per CI run). Each run gets a pristine environment. Most isolated but highest overhead.

The DataFactory pattern (from PlaywrightSolutions) combines API-based seeding with factory functions in `/lib/datafactory/`, providing reusable `createRoom()`, `createCookies()` helpers with Faker.js for random data generation.

**Evidence:** freeCodeCamp (`seed:certified-user`), Cal.com (Prisma seed + SQLite reset), Grafana (admin API), Immich (Docker Compose), PlaywrightSolutions DataFactory pattern

### Finding 4: The `webServer` config is the standard pattern for auto-starting test infrastructure

Six of ten Gold suites use Playwright's `webServer` configuration to automatically start the application before tests. Cal.com starts three servers (ports 3000, 3100, 3101). AFFiNE starts its dev server with a 120s timeout. Immich starts an entire Docker Compose stack as its webServer. The `reuseExistingServer` flag is universally set to `true` locally (to use an already-running dev server) and `false` in CI (to ensure a fresh start). The anti-pattern is requiring manual server startup before running tests.

**Evidence:** Cal.com (3 webServers), AFFiNE (`reuseExistingServer: !process.env.CI`), Immich (Docker Compose as webServer), Next.js (`command: 'npm run dev'`)

### Finding 5: Environment configuration follows a layered pattern with CI overrides

Gold suites implement layered environment configuration: (1) `.env.e2e.example` as a template for developers to copy, (2) environment variables for CI (injected via GitHub Actions secrets or workflow env), (3) process.env checks in playwright.config.ts for conditional behavior. Cal.com loads `.env.e2e.example` when not in CI. Grafana uses `process.env.GRAFANA_URL ?? DEFAULT_URL` for baseURL. Immich uses `PLAYWRIGHT_BASE_URL` with a default. The pattern avoids hardcoding environment-specific values in configuration while keeping defaults sensible for local development.

**Evidence:** Cal.com (`.env.e2e.example`), Grafana (`process.env.GRAFANA_URL ?? DEFAULT_URL`), Immich (`PLAYWRIGHT_BASE_URL` default `http://127.0.0.1:2285`)

### Finding 6: Test data cleanup is as important as test data creation

Cal.com demonstrates the most explicit cleanup pattern: test data is associated with a dedicated platform OAuth client, and cleanup fetches all managed users and teams via that OAuth client and deletes them. Immich achieves cleanup through container-based isolation (fresh Docker stack per run). freeCodeCamp achieves it through database re-seeding. The absence of cleanup leads to test pollution, where data from one test run affects the next. Gold suites treat cleanup as a first-class concern, not an afterthought.

**Evidence:** Cal.com (OAuth-client-scoped cleanup), Immich (container isolation), freeCodeCamp (re-seed)

### Finding 7: The `NEXT_PUBLIC_IS_E2E` pattern enables application-level test awareness

Cal.com pioneered and Next.js adopted the pattern of setting `NEXT_PUBLIC_IS_E2E=1` to toggle application behavior during E2E tests. This disables rate limiting, enables test-specific API endpoints, and adjusts timeouts. While this creates a small divergence between test and production behavior, the trade-off is accepted because the alternatives (mocking at the network level, or dealing with rate limits in tests) are worse. The key discipline is minimizing what the flag changes and documenting each change.

**Evidence:** Cal.com (`NEXT_PUBLIC_IS_E2E=1`), Next.js (referenced pattern)

### Finding 8: Connection pooling and worker count must be coordinated with database limits

Supabase explicitly recommends running with 1 worker in CI when database connection limits are a concern. Immich runs web tests serially (1 worker) specifically to prevent database state conflicts. Cal.com adjusts workers based on debug mode. The pattern is: worker count must be coordinated with the backend's capacity. A common failure mode is setting `workers: 4` when the test database only supports 5 connections, leaving just 1 connection for the application server. Gold suites explicitly document or configure this constraint.

**Evidence:** Supabase (recommends 1 worker for connection limits), Immich (1 worker for web, 3 for UI), Cal.com (1 worker debug mode)

---

## Data & Environment Management Decision Matrix

| Decision | Recommended Pattern | Anti-Pattern |
|---|---|---|
| Authentication | Setup project + storageState + `.auth/` in `.gitignore` | globalSetup with hardcoded credentials |
| Auth speed | REST API authentication; cache with `globalCache.get()` | UI-based login in every test |
| Database seeding | Script-based (`seed:user`) or API-based (admin API) | Manual database preparation; no seeding |
| Test isolation | Fresh seed/container per run; serial for state-mutating tests | Shared database state across parallel tests |
| Server startup | `webServer` config with `reuseExistingServer` conditional | Manual server startup; no webServer config |
| Environment config | Layered: `.env.e2e.example` + CI env vars + process.env defaults | Hardcoded URLs and credentials in config |
| Data cleanup | Scoped cleanup (OAuth client), container reset, or re-seed | No cleanup; accumulating test data |
| E2E toggle | `NEXT_PUBLIC_IS_E2E=1` with minimal, documented changes | Extensive mocking; or no toggle (rate limits in tests) |
| Worker/DB coordination | Match workers to connection pool capacity; document constraint | High worker count with limited DB connections |
