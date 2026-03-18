# Round 05 — Landscape: Suites Analyzed

**Focus:** CI/CD integration patterns for Playwright
**Date:** 2026-03-18
**Search queries used:**
- "Playwright CI/CD GitHub Actions sharding parallelism configuration 2025"
- "Playwright Docker setup CI testing container configuration"
- "Playwright GitLab CI configuration pipeline example 2025"
- "Playwright reporters HTML blob JSON JUnit CI configuration patterns"
- "Playwright projects using github workflows sharding example calcom grafana next.js CI pipeline"

---

## Resources and Projects Analyzed

### 1. Playwright Official — Test Sharding Documentation

| Field | Value |
|---|---|
| **URL** | https://playwright.dev/docs/test-sharding |
| **Type** | Official documentation |
| **Notable** | Canonical sharding reference. Covers `--shard=X/Y` flag, `fullyParallel` distribution modes (test-level vs. file-level), blob reporter for shard merging, complete GitHub Actions workflow with matrix strategy, and `merge-reports` CLI. |

### 2. Playwright Official — Continuous Integration Documentation

| Field | Value |
|---|---|
| **URL** | https://playwright.dev/docs/ci |
| **Type** | Official documentation |
| **Notable** | Covers 10 CI providers: GitHub Actions, Azure Pipelines, CircleCI, Jenkins, Bitbucket Pipelines, GitLab CI, Google Cloud Build, Drone, Docker, Selenium Grid. Recommends workers=1 for CI stability. Advises against browser caching (restoration time matches download time). Recommends `--only-changed` for fail-fast PR feedback. |

### 3. Playwright Official — Docker Documentation

| Field | Value |
|---|---|
| **URL** | https://playwright.dev/docs/docker |
| **Type** | Official documentation |
| **Notable** | Pre-built Docker images: `mcr.microsoft.com/playwright:v1.58.2-noble` (Ubuntu 24.04), `-jammy` (Ubuntu 22.04). Recommends `--init` flag for PID=1 handling and `--ipc=host` for Chromium memory. Pin image version to match Playwright version in project. |

### 4. Playwright Official — Reporters Documentation

| Field | Value |
|---|---|
| **URL** | https://playwright.dev/docs/test-reporters |
| **Type** | Official documentation |
| **Notable** | Built-in reporters: List, Line, Dot, HTML, JSON, JUnit, Blob, GitHub (for annotations). Supports multiple simultaneous reporters. Blob reporter is specifically designed for sharded execution with merge-reports support. JUnit for Azure DevOps/Jenkins integration. |

### 5. Danny Foster — Dynamic Playwright Sharding in GitHub Actions

| Field | Value |
|---|---|
| **URL** | https://foster.sh/blog/dynamic-playwright-sharding-in-github-actions |
| **Type** | Technical blog |
| **Publisher** | Danny Foster (individual) |
| **Notable** | Dynamic sharding calculates optimal shard count at runtime based on test count and project count. Uses grep to count `test(` patterns, multiplies by projects, divides by desired tests-per-shard with configurable min/max bounds. Eliminates manual maintenance when test count changes. |

### 6. DEV Community — Playwright CI/CD Integrations: What Actually Works

| Field | Value |
|---|---|
| **URL** | https://dev.to/testdino01/playwright-cicd-integrations-github-actions-jenkins-and-gitlab-ci-what-actually-works-39j2 |
| **Type** | Technical blog (re-examined for CI specifics) |
| **Notable** | Compares three CI platforms side by side. GitHub Actions: fastest setup for GitHub repos. GitLab CI: built-in `parallel` keyword simplifies sharding. Jenkins: full infrastructure control for regulated environments. Universal pattern: all three use Playwright Docker image, `npm ci`, `npx playwright install --with-deps`. |

### 7. Tim Deschryver — Using Playwright Test Shards with Job Matrix

| Field | Value |
|---|---|
| **URL** | https://timdeschryver.dev/blog/using-playwright-test-shards-in-combination-with-a-job-matrix-to-improve-your-ci-speed |
| **Type** | Technical blog |
| **Publisher** | Tim Deschryver (individual) |
| **Notable** | Practical walkthrough of combining Playwright's `--shard` flag with GitHub Actions matrix strategy. Demonstrates blob report upload per shard and merge into single HTML report. Shows the complete workflow from test execution through artifact upload to report merging. |

### 8. Aron Schueler — Publish Playwright Test Reports with GitLab CI/CD Artifacts

| Field | Value |
|---|---|
| **URL** | https://aronschueler.de/blog/2024/12/03/automatically-publishing-playwright-test-reports-gitlab-pages/ |
| **Type** | Technical blog |
| **Publisher** | Aron Schueler (individual) |
| **Notable** | Demonstrates using GitLab Pages to persistently host Playwright HTML reports. Extends basic GitLab CI config with a `pages` job that deploys reports to the project's GitLab Pages domain. Solves the problem of ephemeral CI artifacts. |

### 9. Atul Sharma — Parallel Runs with Sharding on Docker via GitHub Actions

| Field | Value |
|---|---|
| **URL** | https://medium.com/@sharma.atulkumar29/enhancing-playwright-test-efficiency-parallel-runs-with-docker-sharding-on-github-actions-2ce87ac97ef7 |
| **Type** | Technical blog |
| **Publisher** | Medium (Atul Sharma) |
| **Notable** | Combines Docker-based Playwright execution with GitHub Actions matrix sharding. Demonstrates containerized test execution where each shard runs in its own Docker container, ensuring consistent environments across all parallel jobs. |

### 10. Currents.dev — Playwright GitHub Actions Documentation

| Field | Value |
|---|---|
| **URL** | https://docs.currents.dev/getting-started/ci-setup/github-actions/playwright-github-actions |
| **Type** | Third-party tool documentation |
| **Publisher** | Currents.dev |
| **Notable** | Shows integration of Currents orchestration layer on top of GitHub Actions sharding. Provides load-balanced test distribution (vs. Playwright's static sharding), historical analytics, and flaky test detection. Represents the commercial CI optimization layer. |

### 11. calcom/cal.com (CI re-examination)

| Field | Value |
|---|---|
| **URL** | https://github.com/calcom/cal.com |
| **Type** | Production project CI |
| **Notable** | GitHub Actions workflows with sharding, different timeout configurations for CI (30s) vs. local (120s), Turborepo-aware CI pipeline, blob reporter for shard merging. Demonstrates real-world CI configuration in a large monorepo. |

### 12. toeverything/AFFiNE (CI re-examination)

| Field | Value |
|---|---|
| **URL** | https://github.com/toeverything/AFFiNE |
| **Type** | Production project CI |
| **Notable** | 5-shard CI execution for mobile E2E tests, separate workflows for web, desktop, and mobile testing targets. Demonstrates multi-platform CI configuration within a single monorepo. |

---

## Summary Statistics

- **Total resources analyzed:** 12
- **Official documentation:** 4 (sharding, CI, Docker, reporters)
- **Technical blogs:** 6 (dynamic sharding, CI comparisons, GitLab reports, Docker+sharding, job matrix, Currents integration)
- **Production project CI re-examinations:** 2 (Cal.com, AFFiNE)
