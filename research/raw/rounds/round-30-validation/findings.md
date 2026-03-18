# Round 30 — Findings

**Phase:** Validation
**Focus:** Test isolation and environment management — global setup, webServer config, preview deployment testing, multi-environment strategies

---

## Finding 1: The `webServer` config is the standard mechanism for starting application servers before tests

Playwright's `webServer` config starts a dev server before tests and stops it after:

```typescript
export default defineConfig({
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

Key configuration details:
- `command`: The shell command to start the server
- `url`: Playwright polls this URL until the server responds (with 200-399 status)
- `reuseExistingServer`: When `true`, skips starting if the URL is already responsive
- `timeout`: Maximum time to wait for server startup (default 60s)
- `stdout`/`stderr`: `'pipe'` to capture output, `'ignore'` to suppress

Multiple servers are supported via array syntax:
```typescript
webServer: [
  { command: 'npm run start:api', url: 'http://localhost:4000/health', reuseExistingServer: !process.env.CI },
  { command: 'npm run start:web', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI },
],
```

Gold suite adoption: 5/10 use `webServer`; 5/10 manage servers externally (Docker Compose, CI setup steps).

- **Evidence:** [playwright-webserver-docs] configuration options; [calcom-e2e] Next.js webServer; [freecodecamp-e2e] curriculum server; [excalidraw-e2e] Vite webServer; [affine-e2e] per-package webServer
- **Implication:** Use `webServer` for simple server startup; use external management (Docker Compose) for complex multi-service setups; always set `reuseExistingServer: !process.env.CI`

## Finding 2: The `reuseExistingServer` consensus pattern bridges local and CI execution

The universal pattern across Gold suites:

```typescript
reuseExistingServer: !process.env.CI
```

This creates two behaviors:
- **Locally (`CI` not set):** Reuses an already-running server — developers start the server once and run tests repeatedly without restart overhead
- **In CI (`CI` is set):** Always starts a fresh server — ensures deterministic, clean-state execution

This is one of the strongest consensus patterns observed: every Gold suite that uses `webServer` implements exactly this logic.

Why not `reuseExistingServer: true` in CI:
- A leftover server from a previous step may have stale state
- Server configuration may not match test expectations
- No guarantee the server is healthy (it may be running but broken)

Why not `reuseExistingServer: false` locally:
- Developers would need to wait for server startup on every test run
- Hot-reload during development would be lost
- Multiple test runs would fight over the same port

- **Evidence:** [playwright-webserver-docs] `reuseExistingServer` docs; [calcom-e2e] `!process.env.CI`; [freecodecamp-e2e] `!process.env.CI`; [excalidraw-e2e] `!process.env.CI`
- **Implication:** Always use `reuseExistingServer: !process.env.CI` — no exceptions observed in Gold suites

## Finding 3: Global setup scripts serve three distinct purposes — with project dependencies as the modern alternative

Gold suites use `globalSetup` for three purposes:

**Purpose 1 — Infrastructure initialization:**
```typescript
// global-setup.ts
async function globalSetup() {
  // Start Docker containers
  execSync('docker compose up -d');
  // Wait for services to be healthy
  await waitForHealthCheck('http://localhost:5432');
  await waitForHealthCheck('http://localhost:3000/api/health');
}
```

**Purpose 2 — Database preparation:**
```typescript
async function globalSetup() {
  // Run migrations
  execSync('npx prisma migrate deploy');
  // Seed test data
  execSync('npx prisma db seed');
}
```

**Purpose 3 — Auth state generation (legacy approach):**
```typescript
async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('/login');
  // ... authenticate ...
  await page.context().storageState({ path: '.auth/user.json' });
  await browser.close();
}
```

**Modern alternative: Project dependencies replace `globalSetup` for auth:**
```typescript
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  { name: 'tests', dependencies: ['setup'], use: { storageState: '.auth/user.json' } },
]
```

Project dependencies are preferred over `globalSetup` because:
- They produce trace files (debuggable)
- They can use all test fixtures
- They are visible in test reports
- They run per-worker, not globally (better isolation)

`globalSetup` remains necessary for infrastructure tasks (Docker, database migration) that must happen once before any test.

- **Evidence:** [playwright-global-setup-docs] function signatures; [playwright-auth-docs] setup projects as modern approach; [calcom-e2e] database migration in globalSetup; [immich-e2e] Docker health checks; [grafana-e2e] server initialization
- **Implication:** Use project dependencies for auth setup; reserve `globalSetup` for infrastructure tasks (Docker, database); always implement matching `globalTeardown` for cleanup

## Finding 4: Preview deployment testing integrates CI with deployment platforms via URL injection

Gold suites that deploy to preview environments (Vercel, Netlify) test against the preview URL:

**Vercel preview testing pattern:**
```yaml
# .github/workflows/e2e-preview.yml
on:
  deployment_status:

jobs:
  e2e:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
        env:
          BASE_URL: ${{ github.event.deployment_status.target_url }}
```

**Alternative: Vercel CLI for URL detection:**
```yaml
- name: Get preview URL
  id: preview
  run: |
    PREVIEW_URL=$(vercel ls --token=${{ secrets.VERCEL_TOKEN }} | grep ${{ github.sha }} | awk '{print $2}')
    echo "url=$PREVIEW_URL" >> $GITHUB_OUTPUT

- run: npx playwright test
  env:
    BASE_URL: ${{ steps.preview.outputs.url }}
```

Key details:
- `deployment_status` event triggers after deployment completes (no polling needed)
- The preview URL is injected as `BASE_URL` environment variable
- Tests use relative URLs (`page.goto('/')`) — `baseURL` handles the rest
- Preview environments may have different data than staging — tests must be resilient
- Cal.com uses this pattern for PR validation against Vercel previews

**Netlify equivalent:**
```yaml
on:
  deployment_status:
jobs:
  e2e:
    if: github.event.deployment_status.state == 'success' && github.event.deployment_status.environment == 'Preview'
    steps:
      - run: npx playwright test
        env:
          BASE_URL: ${{ github.event.deployment_status.target_url }}
```

- **Evidence:** [calcom-e2e] Vercel preview testing; [vercel-docs] deployment events; [netlify-docs] deploy previews; [currents-preview-testing] integration patterns
- **Implication:** Use `deployment_status` event for preview testing; inject preview URL as `BASE_URL`; ensure tests work with relative URLs; preview tests should focus on critical paths (not full suite)

## Finding 5: Multi-environment test execution follows a three-tier strategy — local, staging, production

Gold suites that test across environments organize execution into three tiers:

**Tier 1 — Local development:**
- Full test suite runs against `localhost`
- `webServer` config starts the application
- Database seeded locally
- All tests run (no tag filtering)
- `workers: undefined` (50% of CPU cores)

**Tier 2 — Staging / Preview:**
- Full or near-full test suite
- Runs against deployed staging environment or preview URL
- No `webServer` config needed (server already running)
- Database may have different state — tests create their own data
- `workers: 1` for stability against shared staging

```bash
BASE_URL=https://staging.example.com npx playwright test
```

**Tier 3 — Production (smoke tests only):**
- Critical path tests only, tagged `@smoke` or `@critical`
- Read-only tests (no data creation/mutation)
- Runs against production URL
- Strict timeouts (production should be fast)
- No retries (failures indicate real issues)

```bash
BASE_URL=https://app.example.com npx playwright test --grep @smoke --retries=0
```

Configuration pattern supporting all three tiers:
```typescript
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
  webServer: process.env.BASE_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

The `webServer` is conditionally omitted when `BASE_URL` is set — indicating an external server is already running.

- **Evidence:** [calcom-e2e] preview + staging testing; [grafana-e2e] configurable GRAFANA_URL; [currents-multi-env] multi-environment strategies; [playwright-ci-docs] baseURL configuration
- **Implication:** Design tests to work against any environment via `BASE_URL`; conditionally disable `webServer` when targeting external environments; limit production tests to read-only smoke tests

## Finding 6: Test data isolation across parallel workers requires deliberate resource partitioning

When multiple workers run against the same backend, they must not interfere with each other's data:

**Pattern 1 — Unique data per test via API creation:**
```typescript
const test = base.extend<{ uniqueUser: User }>({
  uniqueUser: async ({ request }, use) => {
    const timestamp = Date.now();
    const resp = await request.post('/api/users', {
      data: { email: `test-${timestamp}@example.com`, name: `Test User ${timestamp}` },
    });
    const user = await resp.json();
    await use(user);
    await request.delete(`/api/users/${user.id}`);
  },
});
```

**Pattern 2 — Worker-indexed resources:**
```typescript
const test = base.extend<{}, { testDb: string }>({
  testDb: [async ({}, use, workerInfo) => {
    const dbName = `test_db_${workerInfo.workerIndex}`;
    await createDatabase(dbName);
    await use(dbName);
    await dropDatabase(dbName);
  }, { scope: 'worker' }],
});
```

**Pattern 3 — Namespace isolation via unique identifiers:**
```typescript
test('create organization', async ({ page }) => {
  const orgName = `Test Org ${crypto.randomUUID().slice(0, 8)}`;
  await page.getByLabel('Organization name').fill(orgName);
  // All subsequent operations scoped to this unique org
});
```

Gold suite approaches:
- Grafana: API-based unique data per test (timestamps in names)
- Cal.com: Prisma-seeded baseline + unique booking creation per test
- Immich: Worker-indexed test albums with API cleanup
- freeCodeCamp: Shared seed data with read-only tests (no worker conflict)

- **Evidence:** [playwright-parallelism-docs] workerIndex; [grafana-e2e] unique data patterns; [calcom-e2e] API-based data creation; [immich-e2e] worker-indexed resources
- **Implication:** Never rely on shared mutable state; use unique identifiers (timestamps, UUIDs) for test data; use worker-indexed resources for expensive shared state; fixture-based cleanup ensures teardown on test failure

## Finding 7: The project dependencies model has replaced `globalSetup` as the preferred initialization pattern

The evolution of test initialization in the Playwright ecosystem:

**Legacy approach — `globalSetup` function:**
```typescript
// playwright.config.ts
export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
});

// global-setup.ts
export default async function globalSetup() {
  const browser = await chromium.launch();
  // ... setup ...
  await browser.close();
}
```

Limitations:
- No access to test fixtures
- No trace files for debugging
- Runs once globally (not per worker)
- Not visible in test reports
- Cannot use `expect` assertions

**Modern approach — Project dependencies:**
```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    { name: 'chromium', dependencies: ['setup'], use: { ...devices['Desktop Chrome'] } },
  ],
});

// auth.setup.ts
import { test as setup, expect } from '@playwright/test';
setup('authenticate', async ({ page }) => {
  // Full access to all fixtures, expect, and tracing
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  // ...
  await page.context().storageState({ path: '.auth/user.json' });
});
```

Benefits of project dependencies:
- Full fixture access (`page`, `request`, `context`)
- Trace files generated for debugging setup failures
- Visible in HTML test report
- Runs per-worker (better isolation)
- Can use `expect` for setup verification

Gold suite migration status: 6/10 use project dependencies; 3/10 still use `globalSetup` for infrastructure; 1/10 uses neither (Slate).

- **Evidence:** [playwright-auth-docs] setup projects; [playwright-global-setup-docs] legacy approach; [calcom-e2e] project dependencies; [grafana-e2e] project dependencies; [immich-e2e] mixed (globalSetup for Docker + project dependencies for auth)
- **Implication:** Migrate auth setup from `globalSetup` to project dependencies; keep `globalSetup` only for infrastructure tasks that must happen once globally (Docker, database migration)
