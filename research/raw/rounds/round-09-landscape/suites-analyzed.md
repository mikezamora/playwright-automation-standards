# Round 09 — Landscape: Suites Analyzed

**Focus:** Analyze test data and environment management in Gold-standard suites
**Date:** 2026-03-18
**Method:** Examined Gold-tier repos for test data strategies, environment configuration, auth state management, database setup/teardown, and global setup patterns. Supplemented with official Playwright docs and community blog posts.

---

## Gold-Standard Suites — Data & Environment Management

### 1. grafana/grafana

| Pattern | Implementation |
|---|---|
| **Auth State** | `storageState: 'playwright/.auth/<username>.json'`; `withAuth()` function saves session per role |
| **Role Management** | RBAC testing with inline user definitions; admin/viewer roles created via Grafana HTTP API |
| **Environment Config** | `baseURL: process.env.GRAFANA_URL ?? DEFAULT_URL` (localhost:3001); env vars for credentials |
| **Setup/Teardown** | Setup projects with `dependencies: ['auth']`; auth runs once before dependent tests |
| **Credential Management** | `GRAFANA_ADMIN_USER` and `GRAFANA_ADMIN_PASSWORD` env vars with defaults |
| **WebServer** | Conditional start: only if `GRAFANA_URL` not set; builds plugin before starting |
| **Data Strategy** | Admin API used to create test datasources, dashboards, and users programmatically |

### 2. calcom/cal.com

| Pattern | Implementation |
|---|---|
| **Auth State** | Not using storageState; relies on `NEXT_PUBLIC_IS_E2E=1` env var to toggle test behavior |
| **Database Strategy** | SQLite test database (`schema.test.prisma` creates `test.db`); reset per E2E run |
| **Seed Data** | `yarn db-seed` in `packages/prisma`; dedicated platform OAuth client for E2E in `scripts/seed.ts` |
| **Environment Config** | `.env.e2e.example` loaded by playwright.config.ts; `NEXTAUTH_URL=http://localhost:3000` |
| **Test Data Cleanup** | Fetches all managed users/teams via OAuth client and deletes them after tests |
| **WebServer** | Port 3000 (main), 3100 (embed-core), 3101 (embed-react); `reuseExistingServer` local only |
| **E2E Toggle** | `NEXT_PUBLIC_IS_E2E=1` disables rate limiting, enables test-specific API behavior |
| **Multi-Env** | Different env files for CI vs. local; `.env.e2e.example` as template |

### 3. toeverything/AFFiNE

| Pattern | Implementation |
|---|---|
| **Environment Config** | Separate playwright.config.ts per test target: `affine-local`, `affine-cloud` |
| **WebServer** | `yarn run -T affine dev -p @affine/web`; 120s startup timeout; port 8080 |
| **Server Reuse** | `reuseExistingServer: !process.env.CI` — always fresh server in CI |
| **Reporter Config** | `github` reporter in CI (inline annotations), `list` locally |
| **Data Strategy** | Local-first architecture; tests use local storage for data persistence |
| **Multi-Platform** | Separate configs for web, desktop (Electron), and mobile viewports |

### 4. immich-app/immich

| Pattern | Implementation |
|---|---|
| **Docker Compose** | Full application stack via Docker Compose as `webServer`; auto-rebuilds before tests |
| **Environment Config** | `PLAYWRIGHT_BASE_URL` env var (default `http://127.0.0.1:2285`); `PLAYWRIGHT_DISABLE_WEBSERVER` |
| **Database Strategy** | Dockerized PostgreSQL; fresh containers per test run in CI |
| **Service Stack** | API (NestJS), web (Svelte), PostgreSQL, Redis, machine learning — all containerized |
| **Data Isolation** | Serial web tests (1 worker) prevent database state conflicts; parallel UI tests are read-only |
| **Dev Container** | `.devcontainer/devcontainer.json` with DB credentials: `DB_PASSWORD`, `DB_USERNAME`, `DB_DATABASE_NAME` |

### 5. microsoft/playwright (self-tests)

| Pattern | Implementation |
|---|---|
| **Auth Patterns** | Defines the canonical storageState pattern; setup projects with project dependencies |
| **Global Setup** | Official docs recommend project dependencies over globalSetup for observability |
| **storageState API** | `page.context().storageState({ path: authFile })` saves cookies + localStorage |
| **Multiple Roles** | Separate storage files per role; `test.use({ storageState: path })` per test file |
| **Worker Isolation** | `testInfo.parallelIndex` for per-worker account differentiation |
| **Session Storage** | Manual persist/restore via `addInitScript()` for sessionStorage (not auto-saved) |
| **Security** | Warns: "browser state file may contain sensitive cookies and headers" |

### 6. freeCodeCamp/freeCodeCamp

| Pattern | Implementation |
|---|---|
| **Database Seeding** | `pnpm run seed:certified-user` — mandatory before running tests |
| **Environment Config** | `cp sample.env .env`; tests run against `https://127.0.0.1:8000/` |
| **Auth Strategy** | Pre-seeded certified user in MongoDB; no dynamic auth flow |
| **Data Isolation** | Fresh seed per test run ensures consistent starting state |
| **Mobile Data** | `isMobile` argument for conditional assertions; same data for all viewports |
| **CI Requirements** | MongoDB and client application must both be running before tests start |

### 7. supabase/supabase

| Pattern | Implementation |
|---|---|
| **Auth State** | storageState for session caching; saved to `storage-state.json` |
| **REST API Auth** | Alternative: authenticate via Supabase REST API instead of UI; set session in localStorage |
| **Setup Project** | Auth setup runs before all tests; session file readable by subsequent tests |
| **Global Setup** | `globalSetup` function consolidates env loading and auth; ensures Playwright UI compatibility |
| **Email Testing** | InBucket for email verification testing in CI — self-hosted email capture |
| **Local Infrastructure** | Supabase CLI for local test infrastructure; full PostgreSQL + auth stack locally |
| **Connection Limits** | Recommends 1 worker in CI to avoid database connection pool exhaustion |
| **Environment Config** | Environment variables for API URL, auth keys, database connection strings |

### 8. excalidraw/excalidraw

| Pattern | Implementation |
|---|---|
| **Data Strategy** | Minimal server dependency; canvas state managed client-side |
| **Environment Config** | Standard React dev server; minimal env configuration needed |
| **Test Scope** | Focused on accessibility (axe-core) and visual regression; minimal data dependencies |
| **A11y Data** | WCAG rule sets configured per test; exclude third-party elements |

### 9. grafana/plugin-tools

| Pattern | Implementation |
|---|---|
| **Auth State** | `playwright/.auth/<username>.json` stored per user role |
| **RBAC Provisioning** | Inline user definitions auto-provisioned via Grafana HTTP API in setup project |
| **Environment Config** | `GRAFANA_ADMIN_USER`, `GRAFANA_ADMIN_PASSWORD` env vars with admin/admin defaults |
| **Plugin Data** | Grafana provisioning YAML for datasources and dashboards; declarative test data |
| **Directory Convention** | `playwright/.auth/` for auth state; plugin root for configs |

### 10. vercel/next.js

| Pattern | Implementation |
|---|---|
| **WebServer** | `webServer: { command: 'npm run dev' }` auto-starts Next.js |
| **BaseURL** | `baseURL: 'http://localhost:3000'`; overridden for deployment testing |
| **Deployment Testing** | Dynamic baseURL from Vercel preview deployment URLs in GitHub Actions |
| **E2E Toggle** | `NEXT_PUBLIC_IS_E2E` pattern (referenced from Cal.com) |
| **Template** | `create-next-app --example with-playwright` as canonical starting point |

---

## Community/Blog Sources on Data & Environment Management

| Source | Key Pattern |
|---|---|
| Playwright Official (auth docs) | Setup project + storageState + `.auth/` directory in `.gitignore` |
| Playwright Official (global setup) | Project dependencies preferred over globalSetup for observability |
| DEV Community (Playwright team) | Setup project advantages: visible in HTML reports, traceable, fixture-compatible |
| DEV Community (Vitalets) | On-demand fixture auth: `globalCache.get()` authenticates only when needed; reduces shard overhead |
| PlaywrightSolutions | DataFactory pattern: `/lib/datafactory/` with Faker.js; `createRoom()`, `createCookies()` helpers |
| BrowserStack (env guide) | Multiple `.env` files (`.env.dev`, `.env.staging`, `.env.prod`); load based on ENV variable |
| Medium (multiple authors) | REST API seeding via globalSetup; Prisma/TypeORM scripts for database population |
| Medium (Supabase auth) | Supabase session set via localStorage after REST API auth; avoids UI login flakiness |

---

## Summary Statistics

- **Gold suites examined:** 10
- **Using storageState:** 5/10 (Grafana, Playwright core, Supabase, Grafana plugin-tools, Clerk-influenced patterns)
- **Using setup projects for auth:** 4/10 (Grafana, Supabase, Grafana plugin-tools, Playwright core)
- **Using database seeding:** 4/10 (Cal.com, freeCodeCamp, Immich, Supabase)
- **Using Docker Compose for test infra:** 1/10 (Immich)
- **Using env-specific config files:** 3/10 (Cal.com, Immich, Supabase)
- **Using webServer config:** 6/10 (Cal.com, AFFiNE, Immich, Excalidraw, Next.js, Cal.com embeds)
- **Using API for data seeding:** 3/10 (Grafana, Grafana plugin-tools, Supabase)
