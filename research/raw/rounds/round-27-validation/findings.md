# Round 27 — Findings

**Phase:** Validation
**Focus:** CI/CD integration patterns — GitHub Actions workflows, Docker execution, sharding strategies

---

## Finding 1: The universal GitHub Actions Playwright workflow follows a three-step structure with consistent post-steps

Every Gold suite's CI pipeline follows the same fundamental structure:

```yaml
jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      # Step 1: Install dependencies
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci

      # Step 2: Install browsers
      - run: npx playwright install --with-deps chromium

      # Step 3: Run tests
      - run: npx playwright test

      # Post-step: Upload artifacts (ALWAYS)
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

Key details:
- `--with-deps` installs OS-level dependencies (libs, fonts) required by browser engines
- `if: always()` on artifact upload is critical — without it, test reports disappear when tests fail (the exact moment you need them)
- `retention-days` varies: 7 days for PRs, 30 days for main branch runs in Gold suites
- Browser install targets only needed browsers: `chromium` alone unless cross-browser testing is required

- **Evidence:** [playwright-ci-docs] GitHub Actions template; [grafana-e2e] `.github/workflows/`; [calcom-e2e] CI workflows; [currents-github-actions] workflow optimization
- **Implication:** All Playwright CI pipelines should follow install > browsers > test > artifacts; `if: always()` is non-negotiable for artifact steps

## Finding 2: Sharding via `--shard=N/M` with GitHub Actions matrix is the standard horizontal scaling pattern

Gold suites scale CI execution using Playwright's built-in sharding combined with GitHub Actions matrix strategy:

```yaml
strategy:
  fail-fast: false
  matrix:
    shard: [1/4, 2/4, 3/4, 4/4]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}
```

The sharding workflow requires a merge step to combine reports from all shards:

```yaml
merge-reports:
  needs: e2e-tests
  if: always()
  steps:
    - run: npx playwright merge-reports --reporter=html ./all-blob-reports
```

Key details:
- `fail-fast: false` ensures all shards complete even if one fails (otherwise GitHub Actions cancels remaining shards)
- Blob reporter (`reporter: 'blob'`) is required for sharded runs — generates mergeable report fragments
- The merge job downloads all shard artifacts, then `merge-reports` combines them into a single HTML report
- Shard count correlates with suite size: Cal.com uses 4 shards, AFFiNE uses 6, Grafana uses 3

```typescript
// playwright.config.ts for sharded CI
export default defineConfig({
  reporter: process.env.CI
    ? [['blob'], ['github']]
    : [['html', { open: 'never' }]],
});
```

- **Evidence:** [playwright-ci-docs] sharding; [calcom-e2e] 4-shard matrix; [affine-e2e] 6-shard matrix; [currents-github-actions] matrix optimization
- **Implication:** Use blob reporter in CI for sharded runs; always include a merge-reports post-job; set `fail-fast: false`

## Finding 3: Docker-based Playwright execution requires specific flags for stability

The official Playwright Docker image (`mcr.microsoft.com/playwright`) is used for consistent CI environments:

```dockerfile
FROM mcr.microsoft.com/playwright:v1.50.0-noble
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx playwright test
```

Critical Docker flags for stability:
- `--init`: Ensures proper signal handling (prevents zombie browser processes)
- `--ipc=host` OR `--shm-size=1gb`: Chromium uses `/dev/shm` for shared memory; Docker's default 64MB causes crashes
- Without these flags, Chromium crashes with `SIGBUS` errors in CI

```yaml
# In GitHub Actions with Docker container
container:
  image: mcr.microsoft.com/playwright:v1.50.0-noble
  options: --init --ipc=host
```

Image variants:
- `mcr.microsoft.com/playwright:v1.50.0-noble` — full image with all browsers
- `mcr.microsoft.com/playwright:v1.50.0-noble-amd64` — architecture-specific
- Images are versioned to match Playwright npm package version

Gold suite adoption: 4/10 use the official Docker image; others rely on `npx playwright install --with-deps` on `ubuntu-latest`.

- **Evidence:** [playwright-docker-docs] image variants and flags; [playwright-ci-docs] Docker recommendations; [immich-e2e] Docker Compose CI; [affine-e2e] Docker-based CI
- **Implication:** Always use `--init` and `--ipc=host` (or `--shm-size=1gb`) with Docker; pin image version to match `@playwright/test` version

## Finding 4: CI-specific Playwright config overrides are gated by `process.env.CI` — the universal environment switch

Every Gold suite uses `process.env.CI` to switch between CI and local configurations:

```typescript
export default defineConfig({
  // Parallelism: restricted in CI for stability
  workers: process.env.CI ? 1 : undefined,
  fullyParallel: !process.env.CI,

  // Retries: more in CI (infrastructure flakiness)
  retries: process.env.CI ? 2 : 0,

  // Timeouts: higher in CI (slower machines)
  timeout: process.env.CI ? 60_000 : 30_000,

  // Reporters: CI-optimized
  reporter: process.env.CI
    ? [['blob'], ['github'], ['junit', { outputFile: 'results.xml' }]]
    : [['html', { open: 'never' }]],

  // Artifacts: failure-only in CI
  use: {
    trace: process.env.CI ? 'retain-on-failure' : 'on',
    screenshot: process.env.CI ? 'only-on-failure' : 'off',
    video: process.env.CI ? 'retain-on-failure' : 'off',
  },

  // Forbid test.only in CI
  forbidOnly: !!process.env.CI,
});
```

`process.env.CI` is set to `'true'` automatically by GitHub Actions, GitLab CI, CircleCI, and all major CI platforms. This is a cross-platform standard, not a Playwright-specific feature.

`forbidOnly: !!process.env.CI` prevents accidental `.only()` commits from silently skipping tests in CI — a critical safety net.

- **Evidence:** [playwright-ci-docs] `process.env.CI` usage; all 10 Gold suites use this pattern; [grafana-e2e], [calcom-e2e], [affine-e2e] config files
- **Implication:** Gate all CI-vs-local differences on `process.env.CI`; always enable `forbidOnly` in CI

## Finding 5: Reporter selection follows a CI-specific strategy — GitHub Actions reporter, blob, and JUnit serve distinct purposes

Gold suites configure multiple reporters simultaneously in CI:

| Reporter | Purpose | Format | CI Usage |
|----------|---------|--------|----------|
| `github` | Inline annotations on PR diffs | GitHub-specific | 8/10 Gold suites |
| `blob` | Mergeable report fragments for sharding | Binary | All sharded suites |
| `junit` | Machine-readable results for CI integrations | XML | 4/10 Gold suites |
| `html` | Human-readable report for artifact download | HTML | 6/10 Gold suites |
| `list` | Console output during CI run | Text | 3/10 Gold suites |

The `github` reporter is the highest-value CI-specific reporter: it adds failure annotations directly to the PR diff at the failing line, making failures visible without downloading artifacts.

```typescript
reporter: process.env.CI
  ? [['blob'], ['github'], ['junit', { outputFile: 'test-results.xml' }]]
  : [['html', { open: 'never' }]],
```

JUnit XML enables integration with CI dashboard tools (Allure, Currents, TestRail) and GitHub Actions test summary features.

- **Evidence:** [playwright-ci-docs] reporter recommendations; [grafana-e2e] github + blob reporters; [calcom-e2e] multi-reporter setup; [devto-ci-integrations] reporter selection guide
- **Implication:** Always include `github` reporter in GitHub Actions CI; use `blob` for sharded runs; add `junit` for dashboard integrations

## Finding 6: Artifact management follows a tiered retention strategy

Gold suites manage CI artifacts with distinct strategies based on branch and content type:

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report-${{ matrix.shard }}
    path: |
      playwright-report/
      test-results/
    retention-days: ${{ github.ref == 'refs/heads/main' && 30 || 7 }}
```

Tiered retention:
- **Main branch:** 30 days — historical baseline for regression detection
- **PR branches:** 7 days — only needed during review cycle
- **Traces/screenshots:** Captured only on failure (`retain-on-failure`)
- **HTML reports:** Always generated in CI for post-mortem analysis

Content in `test-results/`:
- Trace files (`.zip`) — full interaction replay
- Screenshots (`.png`) — failure state capture
- Videos (`.webm`) — when enabled (rare in Gold suites)
- Diff images — for visual regression tests

For sharded runs, each shard uploads its own artifact (e.g., `playwright-report-1-4`), and the merge job combines them.

- **Evidence:** [playwright-ci-docs] artifact management; [affine-e2e] artifact upload with retention; [calcom-e2e] shard-specific artifact naming; [devto-ci-integrations] `if: always()` requirement
- **Implication:** Use `if: always()` for all artifact uploads; implement tiered retention (main: 30d, PR: 7d); include both report and test-results directories

## Finding 7: Browser caching in CI reduces pipeline time by 30-60 seconds

Caching browser binaries avoids re-downloading ~200MB per browser on every CI run:

```yaml
- name: Cache Playwright browsers
  uses: actions/cache@v4
  id: playwright-cache
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}

- name: Install Playwright browsers
  if: steps.playwright-cache.outputs.cache-hit != 'true'
  run: npx playwright install --with-deps chromium
```

Key details:
- Cache key includes `package-lock.json` hash — cache invalidates when Playwright version changes
- `~/.cache/ms-playwright` is the default browser binary location on Linux
- `--with-deps` must still run even with cached browsers (OS dependencies may differ)
- 3/10 Gold suites implement browser caching; others accept the download time

Alternative: using the official Docker image avoids browser installation entirely (browsers are pre-installed in the image).

- **Evidence:** [currents-github-actions] caching strategies; [grafana-e2e] cache configuration; [playwright-ci-docs] Docker as caching alternative
- **Implication:** Cache browser binaries in CI; invalidate cache on Playwright version change; Docker images eliminate caching complexity entirely
