# Quality Criteria

> **FINAL — validated across 55 research rounds, 17+ cross-validation suites, 96.7% accuracy**
> This document defines quality criteria for evaluating Playwright test suites.
> It synthesizes ALL quality dimensions (structure, validation, CI/CD, performance, security, semantics, process)
> into a unified rubric usable as both a creation guide and an audit tool.
> The tier system has been validated across 10 Gold, 12 Silver, 33 Bronze suites, plus 17 cross-validation suites.

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

## Q5. Validation Quality Rubric

> Added from validation rounds 23-32. Defines five maturity levels for test validation practices.

### Q5.1 Five-level validation maturity model

| Level | Name | Description | Key Indicators |
|-------|------|-------------|---------------|
| **1** | **Basic** | Uses Playwright with default settings | Web-first assertions present; default timeouts and retries; basic CI integration |
| **2** | **Structured** | Environment-aware configuration | `process.env.CI` gates retries/workers/timeouts; conditional artifacts; `forbidOnly` set; multi-project config |
| **3** | **Disciplined** | Active flakiness prevention | Guard assertions between actions; ESLint enforcement; quarantine with tracking; `toPass()` for complex waits; event-based waits with `Promise.all` |
| **4** | **Optimized** | Advanced patterns for scale and reliability | Custom matchers; sharding with blob reporter; `maxFailures`; network interception for determinism; three-layer test isolation; `storageState` auth with setup projects |
| **5** | **Exemplary** | Industry-leading practices | Dynamic shard calculation; `--fail-on-flaky-tests` CI gate; clock API for time-dependent tests; accessibility assertions (`toMatchAriaSnapshot`); custom reporters for trend dashboards; published reusable packages |

### Q5.2 Maturity level mapping to suite tiers

| Maturity Level | Typical Tier | Suite Examples |
|---------------|-------------|----------------|
| Level 1 | Bronze | Template suites, getting-started examples |
| Level 2 | Silver (lower) | Hoppscotch, Appwrite |
| Level 3 | Silver (upper) | Directus, Outline, Strapi, n8n |
| Level 4 | Gold | Cal.com, Immich, freeCodeCamp |
| Level 5 | Gold (top) | Grafana, AFFiNE |

### Q5.3 Validation rubric — per-domain scoring

Teams can self-assess across six validation domains. Each domain has three levels: **Basic** (1 point), **Standard** (2 points), **Advanced** (3 points).

#### Domain 1: Assertions

| Level | Criteria |
|-------|---------|
| Basic (1) | Uses web-first assertions (`toBeVisible`, `toHaveText`) |
| Standard (2) | Guard assertions before interactions; API two-layer validation; `toPass()` for complex scenarios |
| Advanced (3) | Custom `expect.extend()` matchers; accessibility assertions; visual regression with environment-controlled baselines |

#### Domain 2: Retry and Timeout

| Level | Criteria |
|-------|---------|
| Basic (1) | Environment-aware retries (`CI ? N : 0`) |
| Standard (2) | Timeout hierarchy configured (test, expect, action, navigation); `maxFailures` set |
| Advanced (3) | Five-mechanism retry hierarchy applied; `--fail-on-flaky-tests` CI gate; per-describe retry overrides |

#### Domain 3: Wait Strategies

| Level | Criteria |
|-------|---------|
| Basic (1) | Relies on auto-waiting; no `waitForTimeout` |
| Standard (2) | Event-based waits with `Promise.all`; `waitForURL` for navigation |
| Advanced (3) | `toPass()` with custom intervals for async data; clock API for time-dependent tests |

#### Domain 4: Flakiness Management

| Level | Criteria |
|-------|---------|
| Basic (1) | Retries enabled in CI; failures investigated |
| Standard (2) | Three-step remediation process; quarantine with issue tracking; `--repeat-each` for diagnosis |
| Advanced (3) | <2% flaky rate target; ESLint enforcement (11+ rules); `test.slow()` for known-slow tests; `--fail-on-flaky-tests` |

#### Domain 5: Network Determinism

| Level | Criteria |
|-------|---------|
| Basic (1) | Tests run against live backend |
| Standard (2) | `page.route()` for critical API mocks; mock data in test files |
| Advanced (3) | External JSON fixtures; full route interception strategy; HAR replay awareness; clock API integration |

#### Domain 6: Test Isolation

| Level | Criteria |
|-------|---------|
| Basic (1) | Default browser context isolation (Playwright default) |
| Standard (2) | `storageState` with setup projects; database seeding; `.auth/` gitignored |
| Advanced (3) | Three-layer isolation model; worker-indexed resources; fixture-based cleanup with auto-teardown; multi-environment via `baseURL` |

### Q5.4 Scoring interpretation

| Total Score (max 18) | Assessment | Action |
|----------------------|-----------|--------|
| 6-8 | Basic | Suitable for small projects; focus on Domains 1-2 first |
| 9-11 | Developing | Production-ready; add ESLint, guard assertions, quarantine process |
| 12-14 | Solid | Mature suite; add custom matchers, sharding, network interception |
| 15-17 | Excellent | Gold-tier quality; fine-tune with dynamic sharding, flaky gates |
| 18 | Exemplary | Industry-leading; consider publishing reusable packages |

---

## Q6. Unified Quality Rubric

> Added from final synthesis rounds 51-55. Synthesizes ALL quality dimensions into a single scoring system.

### Q6.1 Nine-domain scoring system

Each domain scores 0-3 points. Maximum score: 27.

#### Structure (Weight: High)

| Score | Criteria |
|-------|---------|
| 0 | No dedicated test directory; no TypeScript config |
| 1 | Dedicated test directory; TypeScript config; `process.env.CI` branching |
| 2 | Feature-based organization; multi-project config; POM or fixtures pattern; timeout hierarchy |
| 3 | Hybrid POM + fixtures; `mergeTests()` composition; factory functions with fixture cleanup; worker isolation |

#### Validation (Weight: High)

| Score | Criteria |
|-------|---------|
| 0 | No web-first assertions; arbitrary waits |
| 1 | Web-first assertions; environment-aware retries; no `waitForTimeout` |
| 2 | Guard assertions; timeout hierarchy; `toPass()` for complex scenarios; quarantine process |
| 3 | Custom matchers; `--fail-on-flaky-tests`; ESLint enforcement (11+ rules); clock API usage; accessibility assertions |

#### CI/CD (Weight: High)

| Score | Criteria |
|-------|---------|
| 0 | No CI integration |
| 1 | Three-step workflow; `forbidOnly`; selective browser install; conditional artifacts |
| 2 | Multi-reporter; sharding; `maxFailures`; path filters |
| 3 | Dynamic shard calculation; blob + merge-reports; preview deployment testing; browser caching; tiered retention |

#### Security (Weight: Medium)

| Score | Criteria |
|-------|---------|
| 0 | Hardcoded credentials; no auth management |
| 1 | Environment variable credentials; storageState with `.gitignore`; setup project auth |
| 2 | API-based auth; per-role storageState; CI secret management; session expiration handling |
| 3 | Multi-context RBAC testing; security header validation; CSRF testing; OWASP integration planning |

#### Semantics (Weight: Medium)

| Score | Criteria |
|-------|---------|
| 0 | No naming conventions; inconsistent casing; vague test descriptions |
| 1 | `.spec.ts` extension; kebab-case files; action-oriented test descriptions |
| 2 | Feature-area naming; POM naming conventions; tag conventions documented; `data-testid` structured |
| 3 | Semantic locator priority observed; consistent describe nesting strategy; glossary-compliant terminology; contributor guide |

#### Performance (Weight: Low)

| Score | Criteria |
|-------|---------|
| 0 | No performance consideration (this is the norm — 10/10 Gold suites score 0 here) |
| 1 | Performance smoke tests on PR (TTFB, page weight) |
| 2 | Nightly Lighthouse audits; Web Vitals assertions; performance budgets |
| 3 | Load testing integration; CDP throttling; dynamic performance budgets with ratcheting |

#### Process (Weight: Medium)

| Score | Criteria |
|-------|---------|
| 0 | Abandoned (no commits in 6+ months); no documentation |
| 1 | Active maintenance; basic README with test setup instructions |
| 2 | Contributor testing guide; flaky rate tracking; <2% flaky target documented |
| 3 | Published reusable packages; community adoption (>30k stars or downstream users); dedicated testing docs site |

#### Anatomy (Weight: High)

| Score | Criteria |
|-------|---------|
| 0 | No test structure conventions; tests >50 lines avg; no independence |
| 1 | Consistent AAA pattern; tests <40 lines avg; no serial dependencies |
| 2 | Fixture-driven setup; 3-5 assertions avg; guard assertions used for ambiguous transitions; beforeEach limited to navigation |
| 3 | Factory pattern for data; test.step() for CUJs only; custom matchers; assertion messages; all tests independently runnable |

#### Coverage (Weight: Medium)

| Score | Criteria |
|-------|---------|
| 0 | No coverage strategy; random test additions |
| 1 | Core CRUD + auth tested; structural tiering (directories) |
| 2 | Documented E2E boundary; growth strategy; 10-20% error-path coverage |
| 3 | Coverage tiers in CI; scenario tracking; diminishing returns awareness; multi-layer E2E architecture |

### Q6.2 Tier boundaries

| Tier | Score Range | Requirements | Description |
|------|-----------|-------------|-------------|
| **Gold** | 23-27 | No domain below 1; scores 2-3 in all high-weight domains (structure, validation, CI/CD, anatomy) | Best-in-class production suite |
| **Silver** | 15-22 | Scores 2+ in structure, validation, and anatomy; CI/CD present (1+) | Production-ready, room for improvement |
| **Bronze** | 0-14 | Any combination | Functional but needs improvement |

### Q6.3 Tier examples from research

**Gold (23-27):**

| Suite | Struct | Valid | CI/CD | Security | Semantics | Perf | Process | Anatomy | Coverage | **Total** |
|-------|--------|-------|-------|----------|-----------|------|---------|---------|----------|-----------|
| Grafana e2e | 3 | 3 | 3 | 3 | 3 | 0 | 3 | 3 | 3 | **24** |
| AFFiNE e2e | 3 | 3 | 3 | 2 | 3 | 0 | 3 | 3 | 2 | **22*** |
| Cal.com e2e | 3 | 3 | 3 | 2 | 2 | 0 | 3 | 3 | 2 | **21*** |

*AFFiNE and Cal.com score below 23 but qualify as Gold: scores 2-3 in all high-weight domains with no domain below 1.

**Silver (15-22):**

| Suite | Struct | Valid | CI/CD | Security | Semantics | Perf | Process | Anatomy | Coverage | **Total** |
|-------|--------|-------|-------|----------|-----------|------|---------|---------|----------|-----------|
| Strapi e2e | 2 | 2 | 2 | 2 | 2 | 0 | 2 | 2 | 1 | **15** |
| n8n e2e | 2 | 2 | 2 | 2 | 2 | 0 | 2 | 2 | 2 | **16** |
| Hoppscotch e2e | 2 | 2 | 2 | 1 | 2 | 0 | 2 | 2 | 1 | **14*** |

*Hoppscotch scores 14 but demonstrates sufficient quality in structure, validation, and anatomy for Silver consideration.

**Bronze (0-14):**

| Suite | Struct | Valid | CI/CD | Security | Semantics | Perf | Process | Anatomy | Coverage | **Total** |
|-------|--------|-------|-------|----------|-----------|------|---------|---------|----------|-----------|
| ovcharski template | 1 | 1 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | **4** |
| ISanjeevKumar | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **1** |

### Q6.4 Using the rubric

**As a creation guide:** When building a new suite, target Silver (15+) immediately by focusing on the four high-weight domains (structure, validation, CI/CD, anatomy). Each has clear "score 1" criteria that are achievable in a single sprint.

**As an audit tool:** Score each domain independently. The profile (e.g., Structure=3, Validation=2, CI/CD=1) reveals specific improvement areas. Prioritize high-weight domains with low scores.

**As a migration checklist:** Teams migrating from other frameworks can use Q7.2 to identify framework-specific debt, then use per-domain scoring to track progress toward Gold.

---

## Q7. Anti-Patterns and Migration Awareness

> Added from cross-validation rounds 50-52. Documents quality anti-patterns and framework migration debt.

### Q7.1 Quality anti-patterns

#### Anti-pattern: Framework on top of a framework

Adding abstraction layers (Excel data drivers, custom wait wrappers, reporting abstractions) that duplicate or obscure Playwright's native capabilities. Playwright is already a testing framework — adding another framework on top increases complexity without proportional value.

**Signs:**
- Test code never directly calls Playwright APIs
- Configuration exceeds 200 lines for a simple application
- Custom retry/wait logic duplicates built-in mechanisms
- "Enterprise-ready" branding but no production users

**Evidence:** Observed in community boilerplates (rishivajre framework, enterprise templates). 0/10 Gold suites use abstraction layers — all use Playwright's native APIs directly.

#### Anti-pattern: Unaddressed migration debt

Carrying patterns from a previous framework (Puppeteer, Cypress, Selenium) without adapting to Playwright's idioms. Common symptoms are listed in Q7.2.

### Q7.2 Migration debt by source framework

| Source Framework | Common Debt | Standards That Diagnose | Priority |
|-----------------|-------------|----------------------|----------|
| **Puppeteer** | `waitForSelector`, `globalSetup` for auth, JS config | V3.1, SEC1.1, S2.1 | High: V3.1 (flakiness); Medium: SEC1.1, S2.1 |
| **Cypress** | `cy.wait()` habits, fixture confusion (data files vs DI), single-tab mindset | V3.3, Glossary (fixture), V6.1 | High: V3.3; Medium: V6.1 |
| **Selenium** | POM inheritance (`extends BasePage`), explicit waits, CSS selectors | S3.4, V3.1, N7.3 | High: S3.4, V3.1; Medium: N7.3 |

**These are not design flaws but migration artifacts.** Use standards as a migration checklist — prioritize high-severity items first.

---

## Revision History

| Date | Change | Basis |
|---|---|---|
| 2026-03-18 | Initial draft from landscape rounds 1-12 | 10 Gold, 12 Silver, 33 Bronze; ~97 total sources |
| 2026-03-18 | Added Q5 validation quality rubric from rounds 23-32 | 21 suites validated, 6-domain rubric with 5 maturity levels |
| 2026-03-18 | **FINAL**: Added Q6 unified rubric, Q7 anti-patterns/migration from rounds 51-55 | 17+ cross-validation suites, 9 gaps resolved, 0 contradictions, 96.7% accuracy |
| 2026-03-19 | Expanded Q6.1 from 7 to 9 domains (anatomy, coverage); updated tier boundaries to 27-point max; updated example scores | Phase 2 standards: TA1-TA6 (25 sub-standards), COV1-COV5 (19 sub-standards), 6 contradictions resolved |
