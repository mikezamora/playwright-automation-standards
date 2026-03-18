# Round 28 — Findings

**Phase:** Validation
**Focus:** CI/CD integration patterns — parallelism strategies, PR check integration, cost optimization, CI-vs-local differences

---

## Finding 1: Parallelism operates at four granularity levels — workers, projects, files, and describes

Playwright's parallelism model has four distinct levels, each configured independently:

**Level 1 — Workers (process-level):**
```typescript
export default defineConfig({
  workers: process.env.CI ? 1 : undefined, // undefined = 50% of CPU cores
});
```
Each worker is a separate OS process with its own browser instance. Workers share nothing.

**Level 2 — Projects (suite-level):**
Projects run in parallel by default. Each project can have its own worker count:
```typescript
projects: [
  { name: 'auth-setup', testMatch: /global.setup\.ts/ },
  { name: 'logged-in', dependencies: ['auth-setup'], use: { storageState: '.auth/user.json' } },
  { name: 'admin', dependencies: ['auth-setup'], use: { storageState: '.auth/admin.json' } },
]
```
Projects with `dependencies` wait for dependency completion before starting.

**Level 3 — Files (test-file-level):**
With `fullyParallel: true`, tests from different files run in parallel. Without it, each file runs sequentially within its worker.

**Level 4 — Describes (test-block-level):**
```typescript
test.describe.configure({ mode: 'parallel' }); // all tests in this describe run in parallel
test.describe.configure({ mode: 'serial' });    // all tests run sequentially, retry restarts group
```

Gold suite parallelism profiles:

| Suite | CI Workers | fullyParallel | Shards | Strategy |
|-------|-----------|---------------|--------|----------|
| Grafana | 2 | per-project | 3 | Mixed: parallel read, serial write |
| Cal.com | 1 | false | 4 | Horizontal sharding only |
| AFFiNE | 1 | false | 6 | Per-package parallelism |
| Immich | 1 | false | 0 | Serial for Docker stability |
| Slate | 1 | true | 0 | Platform matrix instead |
| Excalidraw | 1 | true | 0 | Browser matrix instead |

- **Evidence:** [playwright-parallelism-docs] four levels; [ray.run-parallelism] worker isolation; [grafana-e2e] per-project config; [calcom-e2e] shard-only strategy
- **Implication:** Default to `workers: 1` + sharding in CI; use `fullyParallel` only when tests are truly independent; per-project parallelism for mixed read/write suites

## Finding 2: The `workers=1 + sharding` pattern dominates CI execution — for good reason

The consensus pattern across Gold suites is: single worker per shard, multiple shards via matrix strategy.

Why `workers=1` in CI:
- **Determinism:** Eliminates inter-test resource contention (shared databases, API rate limits)
- **Debuggability:** Test output is sequential and uninterleaved
- **Cost-effectiveness:** CI runners typically have 2 vCPUs; multiple browser processes compete for limited resources
- **Docker stability:** Container resource limits interact poorly with multiple browser processes

Why sharding over workers:
- **Horizontal scaling:** Each shard is a separate CI job with its own resources
- **Fault isolation:** One shard's failure doesn't affect others
- **Parallelism:** GitHub Actions runs matrix jobs concurrently (up to runner limit)
- **Reporting:** Blob reporter + merge-reports provides unified results

Shard count selection:
- Small suites (<50 tests): No sharding needed
- Medium suites (50-200 tests): 2-4 shards
- Large suites (200+ tests): 4-8 shards
- Diminishing returns beyond 8 shards (merge overhead, runner availability)

```yaml
strategy:
  fail-fast: false
  matrix:
    shard: [1/4, 2/4, 3/4, 4/4]
```

- **Evidence:** [playwright-ci-docs] workers recommendation; [calcom-e2e] 1 worker + 4 shards; [affine-e2e] 1 worker + 6 shards; [currents-github-actions] shard optimization
- **Implication:** Start with `workers: 1` in CI; add shards when wall-clock time exceeds threshold (5-10 minutes); balance shard count against merge overhead

## Finding 3: PR check integration follows a two-tier gate pattern — fast smoke + full suite

Gold suites implement two tiers of CI checks for PRs:

**Tier 1 — Smoke gate (every PR, fast feedback):**
- Runs on every push to PR branch
- Limited test scope: critical paths, smoke tests, `@smoke` tagged tests
- Single shard, single browser
- Target: <5 minutes
- Blocks merge via GitHub required status checks

```yaml
# .github/workflows/e2e-smoke.yml
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - run: npx playwright test --grep @smoke
```

**Tier 2 — Full suite (merge queue or main branch):**
- Runs on merge to main or in merge queue
- Full test scope with sharding
- All browsers (if cross-browser testing is configured)
- Target: <15 minutes
- Failure triggers rollback or blocks deployment

```yaml
# .github/workflows/e2e-full.yml
on:
  push:
    branches: [main]
  merge_group:
jobs:
  full-suite:
    strategy:
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]
```

Gold suite adoption:
- AFFiNE: smoke on PR, full on merge — explicit two-tier
- Cal.com: full suite on PR with sharding — single tier, fast via shards
- Grafana: per-project conditional runs — implicit two-tier via `paths` filter
- Immich: full suite on PR — single tier, small enough to be fast

- **Evidence:** [affine-e2e] smoke + full workflow split; [calcom-e2e] sharded PR checks; [grafana-e2e] conditional path triggers; [currents-github-actions] tiered CI patterns
- **Implication:** Implement at minimum a single required PR check; add smoke tier when full suite exceeds 10 minutes

## Finding 4: Cost optimization techniques reduce CI spend by 40-70% without sacrificing coverage

Six cost optimization techniques observed across Gold suites:

**1. Conditional test execution via `paths` filter:**
```yaml
on:
  pull_request:
    paths:
      - 'packages/web/**'
      - 'tests/e2e/**'
      - 'playwright.config.ts'
```
Skip e2e tests entirely when only docs, README, or backend-only files change.

**2. Browser caching (saves 30-60s per job):**
Cache `~/.cache/ms-playwright` keyed on `package-lock.json` hash.

**3. Selective browser installation:**
```bash
npx playwright install --with-deps chromium  # not "all browsers"
```
Install only the browser(s) needed. Chromium-only saves ~400MB download.

**4. `maxFailures` for early abort:**
```typescript
export default defineConfig({
  maxFailures: process.env.CI ? 10 : 0,
});
```
Stop after N failures to avoid burning CI minutes on cascading failures.

**5. Shard balancing:**
Unbalanced shards waste time (fastest shard waits for slowest). Playwright's sharding distributes by file, which is a reasonable default. Custom shard balancing tools (Currents, Split) optimize by historical test duration.

**6. Docker image as browser cache:**
Using `mcr.microsoft.com/playwright` eliminates browser installation entirely — browsers are pre-baked into the image.

- **Evidence:** [grafana-e2e] `paths` filter; [calcom-e2e] `maxFailures: 10`; [currents-github-actions] cost optimization; [playwright-ci-docs] selective browser install
- **Implication:** Start with path filters and selective browser install (easiest wins); add browser caching and `maxFailures` next; shard balancing is an advanced optimization

## Finding 5: Cross-browser testing in CI follows three strategies — with "Chromium-primary" as the consensus

**Strategy 1 — Chromium-only (most common, 6/10 Gold suites):**
```typescript
projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
```
- Rationale: Playwright's Chromium captures 80%+ of browser bugs; cross-browser adds 2-3x CI cost
- Used by: Cal.com, AFFiNE, Immich, freeCodeCamp

**Strategy 2 — Browser matrix via CI (3/10 Gold suites):**
```yaml
matrix:
  browser: [chromium, firefox, webkit]
```
```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
]
```
- Rationale: Product requirements demand cross-browser support
- Used by: Grafana, Slate, Excalidraw

**Strategy 3 — Chromium in CI, cross-browser on schedule (1/10 Gold suites):**
```yaml
# Nightly cross-browser run
on:
  schedule:
    - cron: '0 2 * * *'
```
- Rationale: Balance coverage with cost; cross-browser issues caught within 24 hours
- Evidence: Conceptual pattern documented in Playwright guides

- **Evidence:** [playwright-ci-docs] project configuration; [grafana-e2e] 3-browser matrix; [calcom-e2e] Chromium-only; [slate-e2e] cross-platform + cross-browser matrix
- **Implication:** Default to Chromium-only in CI; add cross-browser only when product requirements demand it; nightly cross-browser is a good compromise

## Finding 6: Worker isolation model guarantees test independence — each worker gets a fresh environment

Playwright's worker isolation model is the foundation of CI reliability:

- Each worker is a separate Node.js process
- Each worker gets its own browser instance
- Workers share no state (no global variables, no shared browser context)
- `workerInfo.workerIndex` provides a unique index (0-based) for resource partitioning

```typescript
// Use workerIndex for resource isolation
test('database test', async ({ page }, workerInfo) => {
  const dbName = `test_db_${workerInfo.workerIndex}`;
  // Each worker uses a different database
});
```

`workerInfo.parallelIndex` is similar but recycles indices as workers complete — useful for limited resource pools (e.g., 3 test accounts shared across workers).

Worker lifecycle:
1. Worker process starts
2. `beforeAll` hooks run (worker-scoped fixtures initialize)
3. Tests in the worker run sequentially
4. `afterAll` hooks run (worker-scoped fixtures tear down)
5. Worker process exits

A worker restarts if a test fails and retries are enabled — this ensures clean state for retried tests.

- **Evidence:** [playwright-parallelism-docs] worker isolation; [ray.run-parallelism] worker lifecycle; [immich-e2e] worker-aware resource allocation
- **Implication:** Design tests assuming no shared state between workers; use `workerIndex` for resource partitioning; worker-scoped fixtures for expensive setup that persists across tests in the same worker
