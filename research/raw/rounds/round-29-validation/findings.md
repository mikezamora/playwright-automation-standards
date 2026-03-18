# Round 29 — Findings

**Phase:** Validation
**Focus:** Test isolation and environment management — fresh contexts, storage state, database handling, environment variables

---

## Finding 1: Test isolation operates at three layers — browser context, application state, and infrastructure

Gold suites achieve test isolation through three complementary layers:

**Layer 1 — Browser context isolation (automatic):**
Playwright creates a fresh `BrowserContext` for every test by default. This means:
- Fresh cookies, localStorage, sessionStorage
- Fresh cache and service workers
- No shared state between tests at the browser level
- No explicit cleanup needed for browser state

```typescript
// Each test gets its own context automatically
test('test A', async ({ page }) => { /* fresh context */ });
test('test B', async ({ page }) => { /* different fresh context */ });
```

**Layer 2 — Application state isolation (manual):**
Tests that create server-side data must clean up after themselves:
- API-based cleanup in `afterEach` hooks
- Fixture-based cleanup via automatic teardown
- Database reset between tests (for suites with direct DB access)

```typescript
// Fixture-based cleanup (preferred — automatic)
const test = base.extend<{ testUser: User }>({
  testUser: async ({ request }, use) => {
    const user = await request.post('/api/users', { data: { name: 'Test' } });
    await use(await user.json());
    await request.delete(`/api/users/${(await user.json()).id}`); // automatic cleanup
  },
});
```

**Layer 3 — Infrastructure isolation (CI-specific):**
- Docker Compose: fresh containers per CI run (Immich)
- Database: migration + seed in CI setup step (Cal.com, freeCodeCamp)
- Services: isolated instances per worker via `workerIndex`

- **Evidence:** [playwright-fixtures-docs] context per test; [grafana-e2e] fixture-based cleanup; [calcom-e2e] API cleanup; [immich-e2e] Docker Compose isolation
- **Implication:** Rely on Playwright's automatic context isolation for browser state; implement fixture-based cleanup for server-side state; use Docker Compose for infrastructure isolation in CI

## Finding 2: The `storageState` pattern is the universal auth isolation mechanism — with setup projects as the modern approach

Auth state management follows a well-defined pattern using setup projects:

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    // Setup project: runs first, saves auth state
    {
      name: 'auth-setup',
      testMatch: /.*\.setup\.ts/,
    },
    // Test project: uses saved auth state
    {
      name: 'logged-in-tests',
      dependencies: ['auth-setup'],
      use: {
        storageState: '.auth/user.json',
      },
    },
    // Multi-role: separate storage state per role
    {
      name: 'admin-tests',
      dependencies: ['auth-setup'],
      use: {
        storageState: '.auth/admin.json',
      },
    },
  ],
});
```

The setup script authenticates once and saves state:

```typescript
// auth.setup.ts
import { test as setup, expect } from '@playwright/test';

setup('authenticate as user', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@test.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: '.auth/user.json' });
});

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@test.com');
  await page.getByLabel('Password').fill('admin-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.context().storageState({ path: '.auth/admin.json' });
});
```

Key details:
- `.auth/` directory should be in `.gitignore`
- Setup runs once per worker (not once per test) — efficient
- `storageState` captures cookies and localStorage — sufficient for most auth mechanisms
- API-based auth setup (via `request` fixture) is faster than UI-based when available

Gold suite adoption: 7/10 use `storageState` with setup projects; 2/10 use API-based auth in fixtures; 1/10 has no auth (Slate).

- **Evidence:** [playwright-auth-docs] setup projects and storageState; [calcom-e2e] `.auth/` pattern; [grafana-e2e] API-based auth setup; [immich-e2e] multi-role storageState
- **Implication:** Use setup projects with `storageState` for auth; prefer API-based auth setup for speed; store `.auth/` in `.gitignore`; separate storage state files per role

## Finding 3: Database seeding in CI follows three strategies — with "migration + seed" as the consensus

**Strategy 1 — Migration + seed script (most common, 4/10 Gold suites):**
```yaml
# CI workflow
steps:
  - run: npx prisma migrate deploy
  - run: npx prisma db seed
  - run: npx playwright test
```
- Database is migrated to latest schema and seeded with test data before tests run
- Deterministic: same seed data every run
- Used by: Cal.com (Prisma), freeCodeCamp (MongoDB seed scripts)

**Strategy 2 — Docker Compose with pre-seeded database (2/10 Gold suites):**
```yaml
services:
  db:
    image: postgres:16
    volumes:
      - ./test-data/seed.sql:/docker-entrypoint-initdb.d/seed.sql
```
- Database container starts with seed data pre-loaded
- Isolation: fresh container per CI run
- Used by: Immich (Docker Compose with migration on startup)

**Strategy 3 — API-based data creation per test (3/10 Gold suites):**
```typescript
test.beforeEach(async ({ request }) => {
  await request.post('/api/test/seed', { data: { scenario: 'dashboard' } });
});
test.afterEach(async ({ request }) => {
  await request.post('/api/test/cleanup');
});
```
- Each test creates and cleans up its own data via API
- Most isolated but slowest
- Used by: Grafana (API-based fixture setup)

The consensus pattern combines strategies: migration + seed for baseline data, API-based creation for test-specific data.

- **Evidence:** [calcom-e2e] Prisma migrate + seed; [immich-e2e] Docker Compose seeding; [grafana-e2e] API-based data management; [freecodecamp-e2e] MongoDB seed scripts
- **Implication:** Use migration + seed for CI baseline; add API-based creation for test-specific data; fixture-based cleanup ensures teardown even if test fails

## Finding 4: Environment variable management follows a layered approach — defaults, dotenv, CI secrets

Gold suites manage environment variables through three layers:

**Layer 1 — Defaults in config:**
```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
});
```

**Layer 2 — `.env` files for local development:**
```
# .env.test (committed, non-sensitive defaults)
BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://test:test@localhost:5432/test_db
API_MOCK=true

# .env.local (gitignored, developer-specific overrides)
BASE_URL=http://localhost:3001
```

**Layer 3 — CI secrets for sensitive values:**
```yaml
# GitHub Actions
env:
  DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
  AUTH_SECRET: ${{ secrets.AUTH_SECRET }}
  STRIPE_TEST_KEY: ${{ secrets.STRIPE_TEST_KEY }}
```

The layering principle: committed defaults < dotenv overrides < CI secrets. Sensitive values never appear in committed files.

Gold suite patterns:
- Cal.com: `.env.appStore` with template values; CI secrets for third-party API keys
- Grafana: `.env.test` for local config; CI sets `GF_DEFAULT_` prefixed variables
- freeCodeCamp: `.env` template in repo; CI uses GitHub Actions secrets

- **Evidence:** [calcom-e2e] `.env.appStore` template; [grafana-e2e] env var management; [freecodecamp-e2e] `.env` template; [currents-env-management] CI secrets pattern
- **Implication:** Commit `.env.test` with non-sensitive defaults; use CI secrets for sensitive values; document required env vars in a template file; never hardcode secrets in test files

## Finding 5: Secrets handling for auth tests in CI requires a distinct pattern — test accounts with limited permissions

Gold suites handle auth secrets in CI through dedicated test accounts:

**Pattern: Dedicated test accounts stored as CI secrets:**
```yaml
# GitHub Actions secrets
env:
  TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
  TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
  TEST_ADMIN_EMAIL: ${{ secrets.TEST_ADMIN_EMAIL }}
  TEST_ADMIN_PASSWORD: ${{ secrets.TEST_ADMIN_PASSWORD }}
```

```typescript
// auth.setup.ts
setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.context().storageState({ path: '.auth/user.json' });
});
```

Key rules:
- Test accounts have minimal permissions (principle of least privilege)
- Test accounts are separate from production accounts
- Secrets are never logged or captured in artifacts (Playwright masks env vars in traces)
- `.auth/` directory is gitignored (contains session tokens)
- Local development uses `.env.local` (gitignored) for test credentials

For suites with self-hosted backends (Immich, Grafana), auth secrets are deterministic (seeded test users with known credentials), eliminating the need for CI secrets.

- **Evidence:** [calcom-e2e] CI secrets for test accounts; [grafana-e2e] seeded test users; [immich-e2e] Docker-seeded admin account; [playwright-auth-docs] storageState security
- **Implication:** Use CI secrets for external service credentials; use seeded test users for self-hosted backends; gitignore `.auth/` directory; enforce least-privilege for test accounts

## Finding 6: `baseURL` configuration per environment uses a hierarchy of sources

Gold suites configure `baseURL` for different environments (local, staging, preview, production):

```typescript
// playwright.config.ts
const baseURL = process.env.BASE_URL
  || process.env.PLAYWRIGHT_BASE_URL
  || (process.env.CI ? 'http://localhost:3000' : 'http://localhost:3000');

export default defineConfig({
  use: { baseURL },
});
```

Environment-specific execution:
```bash
# Local development
npx playwright test

# Against staging
BASE_URL=https://staging.example.com npx playwright test

# Against Vercel preview
BASE_URL=$VERCEL_PREVIEW_URL npx playwright test

# Against production (smoke tests only)
BASE_URL=https://app.example.com npx playwright test --grep @smoke
```

Gold suite patterns:
- Cal.com: `NEXT_PUBLIC_WEBAPP_URL` environment variable; Vercel preview URL detection in CI
- Grafana: `GRAFANA_URL` environment variable; defaults to `http://localhost:3000`
- freeCodeCamp: Hardcoded `http://localhost:8000` with `webServer` config

The consensus: `baseURL` from environment variable with sensible default; never hardcode URLs in test files (use relative paths with `page.goto('/')`).

- **Evidence:** [calcom-e2e] NEXT_PUBLIC_WEBAPP_URL; [grafana-e2e] GRAFANA_URL; [playwright-ci-docs] baseURL configuration; [currents-env-management] multi-environment patterns
- **Implication:** Always configure `baseURL` via environment variable; use relative URLs in tests; provide sensible defaults for local development
