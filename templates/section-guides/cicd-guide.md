# CI/CD Guide

> Section guide for CI/CD pipeline standards. References: [cicd-standards.md](../../standards/cicd-standards.md) C1-C7.

---

## Purpose and Goals

CI/CD integration ensures tests run automatically on every push or PR. A well-configured CI pipeline:
- Follows the three-step workflow (install deps, install browsers, run tests)
- Scales horizontally via sharding for large suites
- Produces mergeable reports from parallel runs
- Captures artifacts only on failure with tiered retention
- Optimizes cost through path filters and selective browser installation

---

## Key Standards

### C1.1 Three-Step Workflow

Every CI configuration MUST follow:
1. Install dependencies (`npm ci`)
2. Install Playwright browsers (`npx playwright install --with-deps chromium`)
3. Run tests (`npx playwright test`)
4. Upload artifacts (`if: always()`)

### C1.3 Selective Browser Install

Install only needed browsers. Chromium-only saves ~400MB and 30-60s per job.

```bash
# Install only Chromium (recommended for most suites)
npx playwright install --with-deps chromium

# Full matrix only when needed
npx playwright install --with-deps chromium firefox webkit
```

### C2.1 Sharding Strategy

Scale horizontally via CI matrix, not by increasing workers within a machine:

```yaml
strategy:
  fail-fast: false
  matrix:
    shard: [1/4, 2/4, 3/4, 4/4]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}
```

| Test Count | Recommended Shards |
|---|---|
| < 50 | 0 (no sharding) |
| 50-200 | 2-4 |
| 200+ | 4-8 |

### C2.2 Blob Reporter with merge-reports

Each shard produces a blob report; a post-job combines them into a unified HTML report:

```yaml
# Per shard: blob reporter
- run: npx playwright test --shard=${{ matrix.shard }}

# Merge job: download all blobs, merge into HTML
- run: npx playwright merge-reports --reporter=html ./all-blob-reports
```

### C4.1 CI Reporter Stack

```typescript
reporter: process.env.CI
  ? [['blob'], ['github']]
  : [['html', { open: 'never' }]],
```

### C5.1 Conditional Artifacts

```typescript
use: {
  trace: 'retain-on-failure',
  screenshot: 'only-on-failure',
  video: 'off',
},
```

### C5.2 Always Upload with `if: always()`

Without `if: always()`, artifacts from failed runs are lost.

### C7.2 Path Filters

```yaml
on:
  pull_request:
    paths:
      - 'src/**'
      - 'tests/**'
      - 'playwright.config.ts'
      - 'package.json'
```

---

## Code Example: Complete Workflow

```yaml
name: Playwright Tests
on:
  push:
    branches: [main]
  pull_request:
    paths:
      - 'src/**'
      - 'tests/**'
      - 'playwright.config.ts'

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --shard=${{ matrix.shard }}
      - if: always()
        uses: actions/upload-artifact@v4
        with:
          name: blob-report-${{ strategy.job-index }}
          path: blob-report/

  merge-reports:
    if: always()
    needs: [test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - uses: actions/download-artifact@v4
        with:
          pattern: blob-report-*
          path: all-blob-reports
          merge-multiple: true
      - run: npx playwright merge-reports --reporter=html ./all-blob-reports
      - uses: actions/upload-artifact@v4
        with:
          name: playwright-html-report
          path: playwright-report/
          retention-days: ${{ github.ref == 'refs/heads/main' && 30 || 7 }}
```

---

## Common Pitfalls

| Pitfall | Why It Fails | Fix |
|---|---|---|
| Installing all browsers | Wastes ~400MB + 30-60s when only Chromium needed | `npx playwright install --with-deps chromium` [C1.3] |
| Missing `if: always()` on artifact upload | Traces lost on failure -- exactly when needed | Always add `if: always()` [C5.2] |
| `workers: 4` in CI without sharding | Resource contention causes flakiness | `workers: 1` per shard + horizontal scaling [C2.1] |
| Same artifact name across shards | Artifacts overwrite each other | Shard-specific naming: `blob-report-${{ strategy.job-index }}` [C5.4] |
| HTML reporter in sharded runs | Produces N separate reports instead of one | blob reporter + merge-reports [C2.2] |
| Running full suite on every commit | Wastes CI minutes for doc-only changes | Path filters [C7.2] |
| Default 90-day retention on all branches | Storage costs grow with PR volume | 7 days PR / 30 days main [C5.3] |
| No `maxFailures` | Cascading failures waste CI time | `maxFailures: 10` in CI [C7.3] |

---

## When to Deviate

- **No sharding:** Suites with fewer than 50 tests do not benefit from sharding [C2.1].
- **Full browser matrix:** Justified for applications with browser-dependent features (rich text editors, canvas rendering). Grafana and Slate run all browsers [C7.1].
- **Docker execution:** Valid alternative to browser install. Use Playwright's official images (`mcr.microsoft.com/playwright:v1.50.0-noble`) [C3.1].
- **`dot` reporter instead of `github`:** When log size is a concern or not using GitHub Actions [C4.2].
- **Preview deployment testing:** Use `deployment_status` event to trigger tests against Vercel/Netlify preview URLs [C6.4].
