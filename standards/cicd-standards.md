# CI/CD Standards

> **FINAL — validated across 21 suites (10 Gold, 11 Silver) in rounds 23-32, cross-validated in rounds 47-55**
> These standards represent consensus patterns observed across production Playwright test suites.
> Each standard is backed by 2+ suite citations, includes valid alternatives, and lists anti-patterns.
> Cross-validation: 96% accuracy, 0 contradictions, 1 minor addition (monorepo selective execution note).

---

## C1. Pipeline Structure

### C1.1 Follow the three-step CI workflow

Every CI configuration MUST follow three steps:

```yaml
steps:
  - name: Install dependencies
    run: npm ci

  - name: Install Playwright browsers
    run: npx playwright install --with-deps chromium

  - name: Run tests
    run: npx playwright test

  - name: Upload artifacts
    if: always()
    uses: actions/upload-artifact@v4
    with:
      name: playwright-report
      path: playwright-report/
```

The `--with-deps` flag installs OS-level dependencies (libnss3, libgbm, etc.) required by Chromium. This pattern is identical across GitHub Actions, GitLab CI, CircleCI, and Jenkins.

**Anti-pattern:** Installing all browsers when only Chromium is needed — wastes ~400MB of download and 30-60 seconds.

- **Basis:** [playwright-ci-docs]; universal across all 21 suites

### C1.2 Use `forbidOnly` and `process.env.CI` as universal configuration switches

```typescript
export default defineConfig({
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['blob'], ['github']]
    : [['html', { open: 'never' }]],
});
```

`process.env.CI` is set automatically by all major CI platforms. It gates: workers, retries, timeouts, reporters, artifacts, and `forbidOnly`.

`forbidOnly: !!process.env.CI` MUST be set — it prevents `.only()` from being committed and silently skipping all other tests in CI.

**Anti-pattern:** Missing `forbidOnly` — a developer commits `test.only(...)` and CI reports "all tests passed" on just one test.

- **Basis:** All 21 suites use `process.env.CI`; 11/21 (52%) use `forbidOnly` — promoted to MUST based on risk analysis

### C1.3 Install only needed browsers in CI

```bash
# Install only Chromium (saves ~400MB and 30-60s)
npx playwright install --with-deps chromium

# Install specific browsers when cross-browser testing is required
npx playwright install --with-deps chromium firefox webkit
```

**Cross-browser strategy (validated across Gold suites):**
- 6/10 Gold suites: Chromium-only in CI
- 3/10: Full browser matrix (Grafana, Slate, Excalidraw)
- 1/10: Chromium primary + nightly cross-browser

**Recommended:** Chromium-only for PRs; full matrix on nightly schedule or merge to main.

**Anti-pattern:** `npx playwright install` (installs all browsers) when only Chromium is configured.

- **Basis:** [playwright-ci-docs], [grafana-e2e], [calcom-e2e], [slate-e2e]

---

## C2. Sharding

### C2.1 Use `workers=1` per shard with horizontal scaling via `--shard`

```typescript
// playwright.config.ts
workers: process.env.CI ? 1 : undefined,
```

Scale horizontally via CI matrix strategy, not by increasing workers within a machine:

```yaml
strategy:
  fail-fast: false
  matrix:
    shard: [1/4, 2/4, 3/4, 4/4]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}
```

`fail-fast: false` ensures all shards complete — prevents losing results from passing shards when one shard fails.

**Shard count by suite size:**

| Test Count | Recommended Shards |
|-----------|-------------------|
| < 50 | 0 (no sharding) |
| 50-200 | 2-4 |
| 200+ | 4-8 |

**Anti-pattern:** `workers: 4` in CI without sharding — increases flakiness from resource contention.

- **Basis:** [playwright-ci-docs] ("We recommend setting workers to '1' in CI environments"), [calcom-e2e] (4 shards), [affine-e2e] (6 shards), [currents-github-actions]

### C2.2 Use blob reporter with `merge-reports` for sharded execution

Each shard produces a blob report; a post-job combines them:

```yaml
# In test job (per shard)
- run: npx playwright test --shard=${{ matrix.shard }}
  env:
    PLAYWRIGHT_BLOB_OUTPUT_DIR: playwright-report

# In merge job (after all shards)
- name: Download all reports
  uses: actions/download-artifact@v4
  with:
    pattern: playwright-report-*
    path: all-blob-reports
    merge-multiple: true

- name: Merge reports
  run: npx playwright merge-reports --reporter=html ./all-blob-reports
```

**Config for sharded runs:**
```typescript
reporter: process.env.CI
  ? [['blob'], ['github']]
  : [['html', { open: 'never' }]],
```

**Anti-pattern:** Using HTML reporter directly in sharded runs — produces N separate HTML reports instead of one unified report.

- **Basis:** [playwright-sharding-docs], [calcom-e2e], [affine-e2e]

### C2.3 Implement dynamic shard calculation for growing suites

For suites with 200+ tests, calculate shard count at runtime to prevent manual maintenance:

```bash
# Calculate shard count
TEST_COUNT=$(npx playwright test --list --reporter=json | jq '.suites | length')
SHARD_COUNT=$(( (TEST_COUNT + 49) / 50 ))  # ~50 tests per shard
SHARD_COUNT=$(( SHARD_COUNT > 8 ? 8 : SHARD_COUNT ))  # Cap at 8
SHARD_COUNT=$(( SHARD_COUNT < 2 ? 2 : SHARD_COUNT ))  # Floor at 2
```

**Formula:** `shards = clamp(MIN, MAX, ceil(test_count / tests_per_shard))`

**Valid alternative:** Fixed shard count with periodic manual adjustment — simpler but requires maintenance.

**Anti-pattern:** Single shard for 200+ tests — CI takes 30+ minutes when 5 minutes is achievable.

- **Basis:** [foster-dynamic-sharding], [lewis-nelson-dynamic-sharding]; validated against Cal.com and AFFiNE growth patterns

### C2.4 Use four granularity levels of parallelism control

| Level | Scope | Mechanism |
|-------|-------|-----------|
| Workers | Process | `workers: N` in config |
| Projects | Suite | `projects: [...]` with per-project `workers` |
| Files | File | `fullyParallel: true` enables cross-file parallel |
| Describes | Block | `test.describe.configure({ mode: 'parallel' | 'serial' })` |

**Worker isolation guarantees:**
- Each worker = separate Node.js process with its own browser instance
- Workers share no state (globals, browser context, cookies)
- Worker restarts on test failure when retries are enabled (clean state)

**Serial mode for dependent tests:**
```typescript
test.describe.serial('CRUD flow', () => {
  test('create item', async ({ page }) => { /* ... */ });
  test('verify item', async ({ page }) => { /* ... */ });
  test('delete item', async ({ page }) => { /* ... */ });
});
```

With retries, the entire serial group re-runs from the first failed test.

- **Basis:** [playwright-parallelism-docs], [ray.run-parallelism], [immich-e2e] (per-project control)

---

## C3. Docker Execution

### C3.1 Use Playwright's official Docker images

```dockerfile
FROM mcr.microsoft.com/playwright:v1.50.0-noble
```

Or run via Docker directly:
```bash
docker run --rm --init --ipc=host \
  -v $(pwd):/work -w /work \
  mcr.microsoft.com/playwright:v1.50.0-noble \
  npx playwright test
```

Images come with all browsers pre-installed — eliminates `npx playwright install` step entirely.

**Valid alternative:** `npx playwright install --with-deps` on CI runner — simpler, no Docker knowledge required. Used by 6/10 Gold suites.

- **Basis:** [playwright-docker-docs], [immich-e2e], [affine-e2e]; 4/10 Gold suites use Docker images

### C3.2 Always use `--init` and `--ipc=host` flags with Docker

| Flag | Purpose | Without It |
|------|---------|-----------|
| `--init` | Proper PID 1 handling | Zombie browser processes accumulate |
| `--ipc=host` | Shared memory for Chromium | Chromium SIGBUS crashes on large pages |

**Alternative to `--ipc=host`:** `--shm-size=1gb` — more restrictive but works in environments where `--ipc=host` is disallowed (e.g., some Kubernetes pods).

**Anti-pattern:** Running Docker without `--init` — browser processes are not properly reaped, leading to resource exhaustion.

- **Basis:** [playwright-docker-docs]; [immich-e2e], [affine-e2e]

### C3.3 Pin the Docker image version to match `@playwright/test`

```dockerfile
# Match the npm package version
FROM mcr.microsoft.com/playwright:v1.50.0-noble
```

```json
// package.json
"@playwright/test": "1.50.0"
```

The image version MUST match the npm package version. Mismatches cause browser binary incompatibilities.

**Update strategy:** When updating `@playwright/test`, update the Docker image tag in the same commit.

**Anti-pattern:** Using `latest` tag — breaks reproducibility and causes random failures when a new version is released.

- **Basis:** [playwright-docker-docs]; validated across all Docker-using suites

---

## C4. Reporters

### C4.1 Configure the CI reporter stack — `github` + `blob` + optional `junit`

```typescript
reporter: process.env.CI
  ? [['blob'], ['github'], ['junit', { outputFile: 'results.xml' }]]
  : [['html', { open: 'never' }]],
```

| Reporter | Purpose | When to Use |
|----------|---------|-------------|
| `blob` | Mergeable fragments for sharded runs | Required when using `--shard` |
| `github` | Inline failure annotations on PR diffs | Required for GitHub Actions |
| `junit` | Machine-readable XML for dashboards | When integrating with Allure, Jenkins, Azure DevOps |
| `html` | Human-readable report for download | Always — as artifact |
| `list` | Terminal output | Local development |

**Anti-pattern:** Single reporter in CI — loses either debugging context or CI integration.

- **Basis:** 8/10 Gold suites use multiple reporters; [grafana-e2e], [calcom-e2e] (3 reporters), [devto-ci-integrations]

### C4.2 Use `github` reporter for inline PR annotations

The `github` reporter adds failure annotations directly on PR diff lines in GitHub Actions:

```typescript
reporter: process.env.CI
  ? [['github'], ['blob']]
  : [['html']],
```

This provides immediate feedback without opening the HTML report. Failures appear as inline comments on the affected code.

**Valid alternative:** `dot` reporter for minimal terminal output in CI — useful when log size is a concern.

**Anti-pattern:** Only `html` reporter in CI — developers must download and open the artifact to see failures.

- **Basis:** [affine-e2e], [grafana-e2e], [playwright-ci-docs]

### C4.3 Use HTML reporter as a downloadable artifact

The HTML report is the richest debugging tool — includes traces, screenshots, video, and step-by-step execution:

```yaml
- name: Upload HTML report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-html-report
    path: playwright-report/
    retention-days: 7
```

For sharded runs, generate the HTML report from merged blobs:
```bash
npx playwright merge-reports --reporter=html ./all-blob-reports
```

- **Basis:** [playwright-ci-docs]; all Gold suites upload HTML reports

---

## C5. Artifacts

### C5.1 Capture artifacts conditionally — only on failure

```typescript
export default defineConfig({
  use: {
    trace: 'retain-on-failure',      // Or 'on-first-retry'
    screenshot: 'only-on-failure',
    video: 'off',                     // Traces provide richer data
  },
});
```

| Artifact | Recommended Setting | Rationale |
|----------|-------------------|-----------|
| Trace | `retain-on-failure` | Captures all runs, retains only failures (7/10 Gold suites) |
| Screenshot | `only-on-failure` | Lightweight, useful for quick visual debugging |
| Video | `off` | Traces provide richer data; video adds storage cost (only 1/10 Gold suites use video) |

**Valid alternative for trace:** `on-first-retry` — only captures on first retry, lower overhead. Used by Immich.

**Anti-patterns:**
- `trace: 'on'` in CI — performance overhead on every test
- `trace: 'off'` in CI — loses debugging data on failure
- `video: 'on'` without justification — high storage cost with less value than traces

- **Basis:** All 10 Gold suites use conditional capture; [grafana-e2e], [calcom-e2e], [immich-e2e]

### C5.2 Always upload artifacts with `if: always()` in CI

```yaml
- name: Upload test artifacts
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: |
      playwright-report/
      test-results/
```

Without `if: always()`, artifacts from failed runs are lost — the upload step is skipped when the test step fails.

**Anti-pattern:** Missing `if: always()` — "crucial traces disappear" when tests fail, which is exactly when they're most needed.

- **Basis:** [devto-ci-integrations]; all Gold suites with GitHub Actions

### C5.3 Set tiered retention policies for artifacts

| Branch Type | Retention | Rationale |
|-------------|----------|-----------|
| Main/production | 30 days | Historical regression baselines |
| PR/feature branches | 7 days | Review cycle only |
| Critical production failures | Long-term archive | Post-mortem reference |

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: ${{ github.ref == 'refs/heads/main' && 30 || 7 }}
```

**Anti-pattern:** Default retention (90 days) on all branches — storage costs grow linearly with PR volume.

- **Basis:** [affine-e2e], [calcom-e2e], [momentic-trace-guide], [playwright-ci-docs]

### C5.4 Use shard-specific artifact naming for parallel runs

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: playwright-report-${{ matrix.shard }}
    path: playwright-report/
```

Each shard uploads with a unique name. The merge job downloads all artifacts with pattern matching:

```yaml
- uses: actions/download-artifact@v4
  with:
    pattern: playwright-report-*
    path: all-blob-reports
    merge-multiple: true
```

**Anti-pattern:** Same artifact name across shards — artifacts overwrite each other.

- **Basis:** [calcom-e2e], [affine-e2e], [playwright-sharding-docs]

---

## C6. Environment Management

### C6.1 Use environment-aware configuration via `process.env.CI`

All configuration that differs between CI and local MUST be gated on `process.env.CI`:

```typescript
export default defineConfig({
  timeout: process.env.CI ? 60_000 : 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI
    ? [['blob'], ['github']]
    : [['html', { open: 'never' }]],
  use: {
    trace: process.env.CI ? 'retain-on-failure' : 'on',
    screenshot: process.env.CI ? 'only-on-failure' : 'off',
  },
});
```

**Anti-pattern:** Hardcoded CI-specific values without the `process.env.CI` gate — developers experience CI settings locally.

- **Basis:** All 21 suites; [playwright-ci-docs]

### C6.2 Use `baseURL` from environment variable with sensible defaults

```typescript
use: {
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
},
```

Tests use relative URLs (`page.goto('/')`) — `baseURL` handles the rest. This enables the same tests to run against local, staging, preview, and production:

```bash
# Local (default)
npx playwright test

# Staging
BASE_URL=https://staging.example.com npx playwright test

# Production smoke
BASE_URL=https://app.example.com npx playwright test --grep @smoke
```

**Anti-pattern:** Hardcoded absolute URLs in tests — prevents multi-environment execution.

- **Basis:** [calcom-e2e], [grafana-e2e], [twenty-e2e], [playwright-ci-docs]

### C6.3 Use `webServer` with the `reuseExistingServer: !process.env.CI` consensus

```typescript
webServer: process.env.BASE_URL ? undefined : {
  command: 'npm run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
  stdout: 'pipe',
  stderr: 'pipe',
},
```

**Key patterns:**
- Conditionally omit `webServer` when `BASE_URL` is set (external server already running)
- `reuseExistingServer: !process.env.CI` — locally reuses running server; CI starts fresh
- Multiple servers via array syntax for multi-service apps
- 5/10 Gold suites use `webServer`; 5/10 manage servers externally (Docker Compose)

**Anti-patterns:**
- `reuseExistingServer: true` in CI — may connect to stale/broken server
- `reuseExistingServer: false` locally — forces full server restart on every test run
- Not conditionally disabling `webServer` when `BASE_URL` is set — attempts to start server when targeting external environment

- **Basis:** [playwright-webserver-docs], [calcom-e2e], [freecodecamp-e2e], [excalidraw-e2e], [outline-e2e]; 9/9 `webServer` suites use `!process.env.CI`

### C6.4 Support preview deployment testing via `deployment_status` event

```yaml
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
      - run: npx playwright test --grep @critical
        env:
          BASE_URL: ${{ github.event.deployment_status.target_url }}
```

**Key details:**
- `deployment_status` triggers after Vercel/Netlify preview is ready — no polling needed
- Run critical path tests only (not full suite) — preview data may differ
- The preview URL becomes `BASE_URL`, and tests use relative URLs

**Valid alternative:** Vercel CLI to detect preview URL manually, or `wait-on` to poll for deployment readiness.

**Anti-pattern:** Running full test suite against preview — preview environments often have limited data and resources.

- **Basis:** [calcom-e2e], [vercel-docs], [netlify-docs], [currents-preview-testing]

---

## C7. Cost Optimization

### C7.1 Use Chromium-primary strategy with selective cross-browser testing

| Strategy | When | CI Minutes Impact |
|----------|------|------------------|
| Chromium-only | Default for all PRs | 1x (baseline) |
| Chromium + nightly cross-browser | Product with broad browser support | 1x daily + 3x nightly |
| Full matrix (Chromium + Firefox + WebKit) | Browser-dependent features | 3x always |

```yaml
# Default: Chromium only
- run: npx playwright install --with-deps chromium
- run: npx playwright test --project=chromium

# Nightly: full matrix
- run: npx playwright install --with-deps
- run: npx playwright test
```

**Anti-pattern:** Full browser matrix on every PR — 3x CI cost with diminishing returns (most bugs are not browser-specific).

- **Basis:** [playwright-ci-docs], [grafana-e2e] (full matrix), [calcom-e2e] (Chromium-only), [slate-e2e] (full matrix justified by editor rendering differences)

### C7.2 Use path filters and selective testing for fast PR feedback

```yaml
on:
  pull_request:
    paths:
      - 'src/**'
      - 'e2e/**'
      - 'playwright.config.ts'
      - 'package.json'
```

**Two-tier PR gate:**
- Tier 1 (every PR): `--grep @smoke`, single shard, <5 minutes, required check
- Tier 2 (merge to main): full suite with sharding, all browsers, <15 minutes

**Additional techniques:**
- `--only-changed` flag — run only tests affected by code changes
- `paths` filter — skip e2e entirely when only docs/non-test files change
- **Monorepo pattern:** In monorepos (Cal.com, Strapi), use dependency-graph tools (Turborepo `--filter`, nx affected) to run E2E tests only for packages affected by the change. Combine with `paths` filters: `paths: ['packages/app/**', 'packages/shared/**', 'e2e/**']`

**Anti-pattern:** Running full E2E suite on every commit to every branch — wasteful for documentation or config-only changes.

- **Basis:** [affine-e2e] (two-tier), [calcom-e2e] (fast sharding), [grafana-e2e] (paths filter), [playwright-ci-docs]

### C7.3 Cache browsers and use `maxFailures` for cost control

**Browser caching (saves 30-60s per job):**
```yaml
- name: Cache Playwright browsers
  id: playwright-cache
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ hashFiles('package-lock.json') }}

- name: Install browsers (cache miss only)
  if: steps.playwright-cache.outputs.cache-hit != 'true'
  run: npx playwright install --with-deps chromium
```

**`maxFailures` for early abort (saves ~40% on cascade scenarios):**
```typescript
maxFailures: process.env.CI ? 10 : 0,
```

**Six proven cost optimization strategies (ranked by impact):**
1. `paths` filter — skip e2e for non-test changes (highest impact)
2. Sharding — parallelize across machines (halves wall-clock time)
3. Selective browser install — Chromium-only saves ~400MB
4. `maxFailures` — early abort on cascading failures
5. Browser caching — 30-60s per job
6. Docker image — eliminates browser install entirely

**Note:** The caching benefit depends on CI network speed. On fast networks, cache restore time can match download time (see P6.3). Docker images are the preferred alternative as they eliminate caching complexity entirely.

**Anti-pattern:** No cost controls — full suite, all browsers, no caching, no sharding, no maxFailures on every push.

- **Basis:** [currents-github-actions], [grafana-e2e] (caching), [calcom-e2e] (maxFailures), [currents-ci-benchmarks]

---

## Revision History

| Date | Change | Basis |
|---|---|---|
| 2026-03-18 | Initial draft from landscape rounds 1-12 | 10 Gold suites, 12 Silver, ~97 total sources |
| 2026-03-18 | DEFINITIVE version from validation rounds 23-32 | 21 suites (10 Gold + 11 Silver), 25+ sources, 0 contradictions |
| 2026-03-18 | **FINAL version** from cross-validation rounds 51-55 | Added monorepo selective execution note to C7.2; clarified browser caching note in C7.3; 0 standards reversed |
