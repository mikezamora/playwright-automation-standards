# Round 05 — Landscape: Findings

**Focus:** CI/CD integration patterns for Playwright
**Date:** 2026-03-18

---

## Key Findings

### 1. The three-step CI setup is universal: install, install browsers, run tests

Regardless of CI provider, every Playwright CI configuration follows the same core sequence: (1) `npm ci` to install dependencies, (2) `npx playwright install --with-deps` to install browser binaries with system dependencies, and (3) `npx playwright test` to execute. This pattern is identical across GitHub Actions, GitLab CI, Jenkins, CircleCI, Azure Pipelines, and all other providers documented.

**Evidence:** The official Playwright CI documentation explicitly states "3 steps to get your tests running on CI." The DEV Community comparison article confirms this is the universal foundation for GitHub Actions, GitLab CI, and Jenkins configurations. Platform-specific differences are limited to YAML syntax and artifact handling.

### 2. Playwright recommends workers=1 in CI, with sharding for scale

The official documentation explicitly recommends setting workers to 1 in CI environments "to prioritize stability and reproducibility." Rather than increasing parallel workers within a single machine (which can cause resource contention), the recommended scaling approach is horizontal: distribute tests across multiple CI machines using `--shard=X/Y`.

**Evidence:** Official CI documentation: "We recommend setting workers to '1' in CI environments." AFFiNE uses 5 shards. Cal.com uses matrix-based sharding. The DEV Community article warns that "jumping directly to high worker counts introduces flakiness that wastes more debugging time than serial execution saves."

### 3. The blob reporter + merge-reports workflow is the standard for sharded CI

Playwright's blob reporter is purpose-built for sharded execution. Each shard produces a blob report that preserves all test data (traces, screenshots, videos). After all shards complete, `npx playwright merge-reports` combines them into a single unified HTML report. This is the officially documented pattern and the one adopted by production projects.

**Evidence:** Official sharding docs show the complete GitHub Actions workflow: matrix strategy creates parallel jobs, each uploads blob-report artifacts, a separate merge-reports job downloads and combines them. Tim Deschryver's walkthrough confirms this exact pattern in practice. The blob reporter is specifically designed for this purpose -- it is not a general-purpose reporter.

### 4. Dynamic sharding eliminates manual maintenance as test suites grow

Static sharding (hardcoded shard count) requires manual adjustment as test suites grow or shrink. Dynamic sharding calculates the optimal shard count at runtime by counting tests, multiplying by project configurations, and dividing by a target tests-per-shard ratio with configurable min/max bounds.

**Evidence:** Danny Foster's implementation: count `test(` patterns with grep, multiply by Playwright projects (browsers), calculate shards with clamping: `SHARD_COUNT = max(MIN, min(MAX, ceil(TOTAL / PER_SHARD)))`. This approach "eliminates manual updates when test counts change" and "prevents cost spikes through configurable upper limits."

### 5. Docker is the recommended CI environment, with specific memory and process flags

The official Playwright Docker images (`mcr.microsoft.com/playwright:v1.58.2-noble`) provide consistent, pre-configured environments. Two critical flags are recommended: `--init` to prevent zombie processes (PID=1 handling) and `--ipc=host` to prevent Chromium memory crashes. Version pinning is mandatory -- mismatched image and package versions cause browser-not-found errors.

**Evidence:** Official Docker docs specify these flags. GitLab CI configurations universally use the official Docker image. The DEV Community article confirms: "Omitting Docker or `npx playwright install --with-deps` creates ongoing maintenance headaches." Images are available for Ubuntu 24.04 (noble) and 22.04 (jammy).

### 6. Reporter strategy differs by CI platform: JUnit for Azure/Jenkins, GitHub reporter for Actions

Different CI platforms consume test results in different formats. Azure DevOps and Jenkins use JUnit XML via `PublishTestResults` tasks. GitHub Actions uses the `github` reporter for PR annotations. GitLab CI uses artifacts with optional GitLab Pages deployment for persistent HTML reports. The recommended pattern is multiple simultaneous reporters: terminal output for immediate feedback plus machine-readable format for CI integration.

**Evidence:** Official docs show JUnit configuration for Azure Pipelines: `reporter: [['junit', { outputFile: 'test-results/e2e-junit-results.xml' }]]`. Aron Schueler demonstrates GitLab Pages deployment for persistent HTML reports. The blob reporter is recommended alongside platform-specific reporters when sharding.

### 7. Browser caching is officially not recommended in CI

Counter to common CI optimization advice, the Playwright team explicitly advises against caching browser binaries in CI. The reasoning: browser binary restoration time from cache matches the download time, so caching provides no net benefit while adding complexity and potential version mismatch issues.

**Evidence:** Official CI documentation: browser binary caching is "not recommended" since "restoration time matches download duration." Instead, the recommendation is to install only needed browsers: `npx playwright install chromium --with-deps` rather than all browsers, reducing download time and disk usage.

### 8. Conditional artifact capture balances debugging data with storage costs

Production CI configurations use conditional artifact capture to collect detailed debugging data without wasting storage on passing tests. The recommended pattern: traces on `on-first-retry`, screenshots `only-on-failure`, videos `off` or `on-first-retry`. The critical CI pattern is using `if: always()` (GitHub Actions) to ensure artifacts upload even when tests fail.

**Evidence:** The DEV Community article emphasizes: "Capture traces on-first-retry and screenshots only-on-failure to balance data quality with storage costs." Missing `if: always()` means "crucial traces disappear after platform retention windows close." Production projects like Cal.com and AFFiNE use this conditional capture pattern.

---

## Questions for Next Rounds

1. Which specialized Playwright capabilities (visual regression, API testing, accessibility, component testing) integrate well with these CI patterns?
2. How do projects combine multiple testing types (E2E, visual, API, a11y) in a single CI pipeline?
3. What is the optimal shard count for different suite sizes?
