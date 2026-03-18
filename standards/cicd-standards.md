# CI/CD Standards

> **PRELIMINARY — to be validated in phases 2-7 (rounds 13-55)**
> This document contains initial standards based on landscape observations from rounds 1-12.
> All recommendations should be treated as starting points subject to revision as deeper analysis is conducted.

---

## C1. CI Setup

### C1.1 Follow the three-step CI setup
- Every CI configuration MUST follow: (1) install dependencies, (2) install browsers, (3) run tests
- Pattern: `npm ci` → `npx playwright install --with-deps` → `npx playwright test`
- This is identical across all CI providers (GitHub Actions, GitLab CI, Jenkins, etc.)
- **Basis:** [playwright-ci-docs]; universal across all Gold suites

### C1.2 Use Playwright's official Docker images
- CI environments SHOULD use `mcr.microsoft.com/playwright:v{version}-noble`
- Pin the image version to match the project's Playwright version
- Use `--init` flag for PID=1 handling and `--ipc=host` for Chromium memory
- **Basis:** [playwright-docker-docs]

### C1.3 Install only needed browsers
- Use `npx playwright install chromium --with-deps` instead of installing all browsers
- Install additional browsers only when cross-browser testing is configured
- **Basis:** [playwright-ci-docs]; browser caching is NOT recommended (no net benefit)

---

## C2. Sharding and Parallelism

### C2.1 Use sharding for horizontal scaling
- Scale test execution by distributing across CI machines using `--shard=X/Y`
- Do NOT scale by increasing workers within a single machine
- **Basis:** [playwright-ci-docs, playwright-sharding-docs]

### C2.2 Use workers=1 per shard for stability
- Set `workers: 1` in CI environments for stability and reproducibility
- Locally, let Playwright auto-detect based on CPU count
- **Basis:** [playwright-ci-docs]: "We recommend setting workers to '1' in CI environments"

### C2.3 Implement dynamic shard calculation for growing suites
- For suites with 200+ tests, calculate shard count at runtime
- Formula: `shards = max(MIN, min(MAX, ceil(test_count * projects / tests_per_shard)))`
- Prevents manual maintenance as test suites grow
- **Basis:** [foster-dynamic-sharding, lewis-nelson-dynamic-sharding]

### C2.4 Use blob reporter with merge-reports for sharded execution
- Each shard produces a blob report preserving all test data
- After all shards complete, `npx playwright merge-reports` combines into unified HTML
- **Basis:** [playwright-sharding-docs, calcom-e2e, affine-e2e]

---

## C3. Reporters

### C3.1 Configure multiple simultaneous reporters
- CI SHOULD use 2+ reporters: terminal + machine-readable + debugging
- Recommended combination:
  - **Blob** (for sharding merge) or **List** (for local)
  - **HTML** (for debugging)
  - **JUnit XML** (for Azure DevOps/Jenkins) or **GitHub** (for PR annotations)
- **Basis:** 8/10 Gold suites use multiple reporters [calcom-e2e: 3 reporters]

### C3.2 Use `github` reporter for GitHub Actions
- Provides inline failure annotations directly on PR diffs
- **Basis:** [affine-e2e (uses github reporter in CI)]

---

## C4. Artifacts

### C4.1 Capture artifacts conditionally
- `trace: 'retain-on-failure'` or `'on-first-retry'`
- `screenshot: 'only-on-failure'`
- `video: 'off'` by default (traces provide richer data)
- **Basis:** 10/10 Gold suites use conditional capture

### C4.2 Always upload artifacts in CI
- GitHub Actions: use `if: always()` on artifact upload steps
- Without this, artifacts from failed runs are lost
- **Basis:** [devto-ci-integrations]: "Missing if: always() means crucial traces disappear"

### C4.3 Set retention policies for trace artifacts
- Feature branches: 7 days
- Main/production branches: 30 days
- Critical production failures: long-term archive
- **Basis:** [momentic-trace-guide]

---

## C5. Environment Management

### C5.1 Use environment-aware configuration
- Timeouts, retries, workers, and reporters MUST differ between CI and local
- Pattern: `process.env.CI ? ciValue : localValue`
- **Basis:** 10/10 Gold suites

### C5.2 Use `.env.e2e.example` as developer template
- Provide `.env.e2e.example` with sensible defaults for local development
- CI uses injected secrets — not .env files
- **Basis:** [calcom-e2e, grafana-e2e, immich-e2e]

### C5.3 For monorepos, pass through Playwright environment variables
- Turborepo: configure `passThroughEnv` for `PLAYWRIGHT_*`, `CI`, `PWDEBUG`
- Nx: use the Playwright plugin for automatic handling
- **Basis:** [turborepo-playwright-guide, nx-playwright-docs]

---

## C6. Failure Containment

### C6.1 Set `maxFailures` to prevent CI waste
- Configure `maxFailures` to abort on cascading failures
- Recommended starting point: 10
- **Basis:** [calcom-e2e: `maxFailures: 10`]

### C6.2 Use `--only-changed` for PR feedback
- Run only tests affected by changes for fast PR feedback
- Run the full suite on merge to main
- **Basis:** [playwright-ci-docs]

---

## Revision History

| Date | Change | Basis |
|---|---|---|
| 2026-03-18 | Initial draft from landscape rounds 1-12 | 10 Gold suites, 12 Silver, ~97 total sources |
