# Quality Criteria

> **PRELIMINARY — to be validated in phases 2-7 (rounds 13-55)**
> This document defines quality criteria for evaluating Playwright test suites, based on landscape observations from rounds 1-12.
> The tier system has been validated across 10 Gold, 12 Silver, and 33 Bronze suites.

---

## Q1. Quality Tier System

### Q1.1 Three-tier quality classification

| Tier | Description | Count (Landscape) |
|---|---|---|
| **Gold** | Best-in-class production suites demonstrating advanced patterns | 10 suites |
| **Silver** | Good suites with useful patterns but not exemplary across all criteria | 12 suites |
| **Bronze** | Basic implementations, templates, or reference resources | 33 suites/resources |

### Q1.2 Gold-tier criteria (ALL must be met)

| Criterion | Requirement | Weight |
|---|---|---|
| **TypeScript** | Uses `playwright.config.ts` with TypeScript throughout | Required |
| **Active Maintenance** | Commits within the last 6 months | Required |
| **Environment-Aware Config** | Different settings for CI vs. local execution | Required |
| **Multi-Project Config** | 2+ Playwright projects defined | Required |
| **CI Integration** | Dedicated CI workflow with artifact capture | Required |
| **Conditional Artifacts** | Traces/screenshots only on failure | Required |
| **Custom Fixtures** | Uses `test.extend<T>()` for shared setup | Strongly recommended |
| **Documentation** | Testing guide for contributors | Strongly recommended |

### Q1.3 Gold-tier differentiators (distinguish Gold from Silver)

| Differentiator | Gold | Silver |
|---|---|---|
| `test.extend<T>()` fixtures | 8/10 (80%) | 3/12 (25%) |
| Multi-reporter config | 8/10 (80%) | 1/12 (8%) |
| maxFailures / failure containment | 2/10 (20%) | 0/12 (0%) |
| Per-project parallelism control | 3/10 (30%) | 0/12 (0%) |
| Domain-specific extensions (npm) | 2/10 (20%) | 1/12 (8%) |
| Contributor testing guides | 8/10 (80%) | 2/12 (17%) |
| Daily commits (March 2026) | 10/10 (100%) | 5/12 (42%) |
| Community adoption (>30k stars) | 8/10 (80%) | 2/12 (17%) |

---

## Q2. Evaluation Dimensions

### Q2.1 Test Coverage and Count
- **Gold indicator:** Covers multiple features/areas; multiple test files
- **Measurement:** Number of test files, breadth of features tested
- **Evidence:** [grafana-e2e (30+ projects), calcom-e2e (7 projects), immich-e2e (3 projects)]

### Q2.2 Active Maintenance
- **Gold indicator:** Commits within last 30 days
- **Silver indicator:** Commits within last 6 months
- **Bronze indicator:** Last commit > 6 months ago
- **Evidence:** All 10 Gold suites had daily/weekly commits in March 2026

### Q2.3 TypeScript Usage
- **Gold indicator:** TypeScript strict mode; typed fixtures; typed config
- **Silver indicator:** TypeScript without strict mode
- **Bronze indicator:** JavaScript or minimal TypeScript
- **Evidence:** 10/10 Gold suites use TypeScript; 6/10 confirmed strict mode

### Q2.4 Architecture Quality
- **Gold indicator:** POM + fixtures; custom matchers; domain-specific extensions
- **Silver indicator:** POM without fixtures OR fixtures without POM
- **Bronze indicator:** Flat test files without abstraction
- **Evidence:** [grafana-plugin-e2e (custom matchers), calcom-e2e (hybrid POM + fixtures)]

### Q2.5 CI/CD Integration
- **Gold indicator:** Dedicated workflow, sharding, multi-reporter, conditional artifacts
- **Silver indicator:** CI workflow exists but basic configuration
- **Bronze indicator:** No CI workflow or broken workflow
- **Evidence:** All 10 Gold suites; [calcom-e2e (3 reporters, sharding, maxFailures)]

### Q2.6 Documentation Quality
- **Gold indicator:** Dedicated testing guide, env setup docs, contributor conventions
- **Silver indicator:** README mentions testing setup
- **Bronze indicator:** No testing documentation
- **Evidence:** [freecodecamp-e2e (dedicated contributor guide), grafana-plugin-e2e (developer docs)]

### Q2.7 Community Adoption
- **Gold indicator:** >30,000 GitHub stars; referenced in blog posts; downstream users
- **Silver indicator:** 100-30,000 stars; some community visibility
- **Bronze indicator:** <100 stars; no external references
- **Evidence:** Gold average ~124,000 stars; Silver average ~3,600 stars; Bronze average ~90 stars

---

## Q3. Capability Maturity

### Q3.1 Baseline capabilities (expected in all production suites)

| Capability | Description | Gold Adoption |
|---|---|---|
| E2E UI testing | Browser-based functional testing | 10/10 |
| TypeScript configuration | `playwright.config.ts` | 10/10 |
| CI integration | Automated test execution on push/PR | 10/10 |
| Environment-aware config | CI vs. local differentiation | 10/10 |
| Conditional artifacts | Traces/screenshots on failure only | 10/10 |
| Multi-project config | Multiple execution profiles | 10/10 |

### Q3.2 Advanced capabilities (expected in mature suites)

| Capability | Description | Gold Adoption |
|---|---|---|
| Custom fixtures | `test.extend<T>()` | 8/10 |
| Setup projects for auth | storageState with project dependencies | 4/10 |
| CI sharding | Horizontal test distribution | 5/10 |
| Multi-reporter | 2+ simultaneous reporters | 8/10 |
| ESLint integration | eslint-plugin-playwright | Measured in 2/10 |

### Q3.3 Specialized capabilities (adopted based on specific needs)

| Capability | Description | Gold Adoption |
|---|---|---|
| Accessibility testing | @axe-core/playwright | 2/10 |
| Visual regression | toHaveScreenshot() | 1/10 (POC) |
| Network mocking | page.route(), routeFromHAR | 0/10 (documented) |
| Performance testing | Lighthouse, CDP | 0/10 (documented) |
| Security testing | OWASP ZAP | 0/10 (documented) |
| Mobile viewport | Device descriptors | 2/10 |
| Component testing | Experimental CT | 0/10 |

---

## Q4. Flakiness Quality Gate

### Q4.1 Flaky test rate targets
- **Target:** <2% flaky test rate
- **Action threshold:** >2% triggers investigation and remediation sprint
- **Measurement:** Track flaky rate over rolling 7-day window
- **Basis:** [testdino-flaky-tests]: "Flaky rate above 2% erodes CI trust"

### Q4.2 Quarantine discipline
- Every quarantined test MUST have a tracking issue
- Quarantine is a short-term measure with a fix deadline
- No permanent quarantine projects or "known-flaky" tags without investigation
- **Basis:** [calcom-e2e, grafana-e2e, freecodecamp-e2e]

---

## Revision History

| Date | Change | Basis |
|---|---|---|
| 2026-03-18 | Initial draft from landscape rounds 1-12 | 10 Gold, 12 Silver, 33 Bronze; ~97 total sources |
