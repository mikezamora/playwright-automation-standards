# Pre-Creation Quality Checklist

> **DEFINITIVE** -- Derived from all finalized standards documents.
> Use this checklist before creating or auditing a Playwright test suite.
> Every item is a yes/no question linked to its source standard ID.

---

## 1. Structure Checklist

> Source: [structure-standards.md](../standards/structure-standards.md)

### File Organization (S1)

- [ ] Do all test files use the `.spec.ts` extension? [S1.1]
- [ ] Are tests in a dedicated directory at project root (e.g., `tests/`, `e2e/`)? [S1.2]
- [ ] Are page objects in a dedicated `pages/` or `page-models/` directory? [S1.3]
- [ ] Are `storageState` files saved to `playwright/.auth/` or `.auth/`? [S1.4]
- [ ] Is the `.auth/` directory listed in `.gitignore`? [S1.4]
- [ ] For suites with 20+ test files: are tests organized into feature-based subdirectories? [S1.5]

### Configuration (S2)

- [ ] Is the configuration file `playwright.config.ts` (not `.js` or `.json`)? [S2.1]
- [ ] Does the config differentiate CI and local execution via `process.env.CI`? [S2.2]
- [ ] Are `retries`, `workers`, `timeout`, and `reporter` configured differently for CI vs. local? [S2.2]
- [ ] Are 2+ Playwright projects defined (e.g., setup + chromium)? [S2.3]
- [ ] Is `webServer` configured with `reuseExistingServer: !process.env.CI`? [S2.4]
- [ ] Is the timeout hierarchy defined (test timeout > expect timeout > action timeout)? [S2.5]
- [ ] Does the test timeout follow the 3-5x expect timeout rule? [S2.5]
- [ ] Are 2+ reporters configured for CI (following the three-slot pattern)? [S2.6]
- [ ] Is `trace` set to `'retain-on-failure'` or `'on-first-retry'`? [S2.7]
- [ ] Is `screenshot` set to `'only-on-failure'`? [S2.7]
- [ ] Is `video` set to `'off'` (unless specifically justified)? [S2.7]

### Page Object Model (S3)

- [ ] Does the POM approach match suite complexity (hybrid, fixture-based, function helpers, or data-only)? [S3.1]
- [ ] Do POM constructors accept `Page` as the sole argument? [S3.2]
- [ ] Are locators defined as `readonly` properties in the constructor? [S3.2]
- [ ] Do locators use Playwright's locator API (`getByRole`, `getByLabel`, `getByText`), not raw CSS/XPath? [S3.2]
- [ ] Are POM methods organized into navigation, action, and assertion categories? [S3.3]
- [ ] Is there zero POM inheritance (no `extends BasePage`)? [S3.4]
- [ ] Is dynamic content handled via locator composition (`.filter()`, `.nth()`, `.locator()` chains)? [S3.5]

### Fixtures (S4)

- [ ] Is shared test setup implemented via `test.extend<T>()` with typed fixtures? [S4.1]
- [ ] Are fixture interfaces defined with proper TypeScript types? [S4.1]
- [ ] Are fixtures scoped correctly (test scope for POMs, worker scope for expensive resources)? [S4.2]
- [ ] For suites with 20+ fixtures: is `mergeTests()` used for domain segmentation? [S4.3]
- [ ] Does authentication use setup projects with `storageState`? [S4.4]
- [ ] Are domain-specific custom matchers defined when the same assertion repeats 3+ times? [S4.5]

### Test Grouping (S5)

- [ ] Are tests organized by feature or application domain? [S5.1]
- [ ] Are tags reserved for execution-context control (browser exclusion, CI tier), not priority classification? [S5.2]
- [ ] Are related tests within files grouped using `test.describe()`? [S5.3]
- [ ] Is `test.step()` reserved for CUJ tests exceeding ~50 lines, not used as a general organization tool? [S5.4]

### Data Management (S6)

- [ ] Is test data created via API or database, not via UI? [S6.1]
- [ ] Are factory functions used for test data generation with sensible defaults? [S6.2]
- [ ] Does every test that creates data clean it up via fixture teardown? [S6.3]
- [ ] Do parallel workers create unique, non-conflicting data (via `workerInfo.workerIndex` or timestamps)? [S6.4]

### Scaling — Scale Tiers (S8)

- [ ] Is the suite's current scale tier documented (Starter/Growing/Large/Enterprise)? [S8.1]
- [ ] Are measurable transition triggers identified for the next tier? [S8.2]
- [ ] Are pain points at the current tier boundary anticipated and mitigated? [S8.3]
- [ ] Can the team identify their tier using the scaling decision tree? [S8.4]

### Scaling — Directory & File (S9)

- [ ] Has the suite restructured from flat to nested directories at 20-30 test files? [S9.1]
- [ ] Are feature directories split into sub-feature directories at 10-15 spec files? [S9.2]
- [ ] Are spec files split at 200 lines or 10 tests? [S9.3]
- [ ] Do directory names align with Playwright project names? [S9.4]
- [ ] Are cross-feature tests placed in a dedicated shared directory? [S9.5]
- [ ] For monorepos: are per-package test directories used? [S9.6]

### Scaling — Configuration (S10)

- [ ] For Large suites: is config-level orchestration used with helper functions? [S10.1]
- [ ] For Enterprise suites: is CI-level orchestration used? [S10.2]
- [ ] Is dynamic project generation used for infrastructure-variant testing? [S10.3]
- [ ] Are config DRY patterns applied to reduce project definition duplication? [S10.4]
- [ ] Is configuration split when single-file config exceeds 400 LOC? [S10.5]

### Scaling — Fixtures & Dependencies (S11)

- [ ] Is fixture investment proportional to suite size? [S11.1]
- [ ] Are fixtures segmented by environment scope and module boundary? [S11.2]
- [ ] For multi-page workflows: is a composables layer considered above page objects? [S11.3]
- [ ] Are published utility packages reserved for ecosystem platforms only? [S11.4]
- [ ] Are circular dependencies between fixture modules prevented? [S11.5]

### Scaling — Execution Strategy (S12)

- [ ] Is the execution strategy aligned to the current scale tier? [S12.1]
- [ ] Has sharding begun at 100 tests or 5 minutes CI duration? [S12.2]
- [ ] Is serial execution at 50+ tests treated as an anti-pattern? [S12.3]
- [ ] Is tiered execution implemented at 200+ tests using structural tiers? [S12.4]
- [ ] Is selective test execution added at 500+ tests? [S12.5]
- [ ] Is CODEOWNERS used for test directory ownership at scale? [S12.6]

---

## 2. Validation Checklist

> Source: [validation-standards.md](../standards/validation-standards.md)

### Web-First Assertions (V1)

- [ ] Do all element assertions use web-first (auto-retrying) assertions? [V1.1]
- [ ] Is there zero usage of `expect(await locator.isVisible()).toBe(true)` pattern? [V1.1]
- [ ] Is the appropriate guard assertion level used (auto-wait, locator-chain, guard, multi-guard) based on state transition ambiguity? [V1.2]
- [ ] Are custom matchers created for repeated domain-specific assertions? [V1.3]
- [ ] Is `expect.soft()` used only selectively (forms, tables), not as default? [V1.4]
- [ ] Do API tests use the two-layer approach (status + body)? [V1.5]

### Retry and Timeout (V2)

- [ ] Are implicit retry mechanisms used before explicit ones (five-mechanism hierarchy)? [V2.1]
- [ ] Are retries set to 0 locally and 1-5 in CI (based on infrastructure complexity)? [V2.2]
- [ ] Is the four-layer timeout hierarchy configured (test, expect, action, navigation)? [V2.3]
- [ ] Is `--fail-on-flaky-tests` considered as a CI quality gate? [V2.4]
- [ ] Is `maxFailures` set for CI cost control? [V2.5]

### Wait Strategies (V3)

- [ ] Is the suite relying on Playwright's built-in auto-waiting? [V3.1]
- [ ] Is there zero usage of `page.waitForSelector()`? [V3.1]
- [ ] Are event-based waits using `Promise.all` for coordination? [V3.2]
- [ ] Is `page.waitForTimeout()` completely absent from the codebase? [V3.3]
- [ ] Is ESLint configured to enforce `no-wait-for-timeout` and `no-wait-for-selector`? [V3.3]

### Flakiness Management (V4)

- [ ] Is the three-step flaky remediation process followed (replace waits, add guards, scope locators)? [V4.1]
- [ ] Does every quarantined test have a tracking issue and fix deadline? [V4.2]
- [ ] Are slow tests marked with `test.slow()` instead of hardcoded timeouts? [V4.3]
- [ ] Is `eslint-plugin-playwright` configured with the recommended ruleset? [V4.4]
- [ ] Are the 11 critical assertion/wait rules enabled? [V4.4]

### Network Determinism (V5)

- [ ] Is `page.route()` used for tests requiring deterministic data? [V5.1]
- [ ] Are mock payloads stored in external JSON fixture files (not inline)? [V5.2]
- [ ] Is the Clock API used for date/time-dependent tests? [V5.3]

### Test Isolation (V6)

- [ ] Does every test start with a fresh browser context (Layer 1)? [V6.1]
- [ ] Is application state cleaned up via fixtures (Layer 2)? [V6.1]
- [ ] Is `storageState` used with setup projects for authentication? [V6.2]
- [ ] Does database seeding use migration + seed for baseline, API for per-test data? [V6.3]
- [ ] Is test data unique per worker to prevent parallel conflicts? [V6.4]

---

## 3. CI/CD Checklist

> Source: [cicd-standards.md](../standards/cicd-standards.md)

### Pipeline Structure (C1)

- [ ] Does the CI workflow follow the three-step pattern (deps, browsers, tests)? [C1.1]
- [ ] Is `forbidOnly: !!process.env.CI` set in the config? [C1.2]
- [ ] Are only needed browsers installed in CI (e.g., Chromium-only)? [C1.3]

### Sharding (C2)

- [ ] Is `workers` set to 1 in CI? [C2.1]
- [ ] Is `--shard` used for horizontal scaling when tests > 50? [C2.1]
- [ ] Is `fail-fast: false` set in the CI matrix strategy? [C2.1]
- [ ] Is the blob reporter configured for sharded runs? [C2.2]
- [ ] Is `merge-reports` used to combine shard outputs into a single HTML report? [C2.2]

### Docker (C3)

- [ ] If using Docker: is the official Playwright image used? [C3.1]
- [ ] If using Docker: are `--init` and `--ipc=host` flags included? [C3.2]
- [ ] If using Docker: is the image version pinned to match `@playwright/test`? [C3.3]

### Reporters (C4)

- [ ] Is the `github` reporter configured for inline PR annotations (GitHub Actions)? [C4.2]
- [ ] Is the HTML report uploaded as a downloadable artifact? [C4.3]

### Artifacts (C5)

- [ ] Are artifacts captured conditionally (traces on failure, screenshots on failure)? [C5.1]
- [ ] Is `if: always()` used on artifact upload steps? [C5.2]
- [ ] Are retention policies tiered (7 days PR, 30 days main)? [C5.3]
- [ ] Do sharded runs use shard-specific artifact names? [C5.4]

### Environment Management (C6)

- [ ] Is all CI-differing configuration gated on `process.env.CI`? [C6.1]
- [ ] Is `baseURL` configurable via environment variable? [C6.2]
- [ ] Is `webServer` conditionally omitted when `BASE_URL` is set? [C6.3]

### Cost Optimization (C7)

- [ ] Is Chromium-primary strategy used (full matrix only nightly)? [C7.1]
- [ ] Are path filters configured to skip E2E for non-test changes? [C7.2]
- [ ] Is `maxFailures` configured to prevent CI cost overrun? [C7.3]

---

## 4. Naming Checklist

> Source: [semantic-conventions.md](../standards/semantic-conventions.md)

### File Naming (N1)

- [ ] Do test files use `.spec.ts` extension? [N1.1]
- [ ] Are test files named by feature area (not generic names like `test1.spec.ts`)? [N1.2]
- [ ] Do all test-related files use kebab-case? [N1.3]
- [ ] Do setup project files use the `*.setup.ts` convention? [N1.4]

### Test Naming (N2)

- [ ] Do test descriptions use action-oriented "should" phrasing? [N2.1]
- [ ] Are `test.describe()` blocks named by feature area? [N2.2]
- [ ] Do multi-step tests use descriptive `test.step()` labels? [N2.3]
- [ ] Is describe nesting limited to 2 levels (3 only for role-based patterns)? [N2.4]

### POM Naming (N3)

- [ ] Do page object classes use PascalCase with `Page` suffix? [N3.1]
- [ ] Do POM methods use verb+target naming? [N3.2]
- [ ] Are locator variable names descriptive (purpose, not implementation)? [N3.3]
- [ ] Are POM fixtures injected using camelCase names? [N3.4]

### Fixture Naming (N4)

- [ ] Do fixture names use camelCase nouns? [N4.1]
- [ ] Do fixture option names clearly describe what they control? [N4.2]
- [ ] Do factory fixtures use verb prefixes (`createUser`, not `user`)? [N4.3]

### Tags and Annotations (N5)

- [ ] Are built-in annotations used correctly (`test.skip`, `test.fixme`, `test.slow`, `test.fail`)? [N5.1]
- [ ] Do skip annotations include reason strings? [N5.1]
- [ ] Are custom tags documented in the project README? [N5.4]

### Categorization (N6)

- [ ] Are Playwright projects used as the primary categorization mechanism? [N6.1]
- [ ] Are standard test category terms used consistently (smoke, regression, critical path)? [N6.2]
- [ ] Do project names clearly convey their scope and purpose? [N6.3]

### Data Attributes (N7)

- [ ] Is `data-testid` used as the default test attribute (when semantic locators are insufficient)? [N7.1]
- [ ] Do `data-testid` values follow kebab-case with `[scope]-[element]-[qualifier]` structure? [N7.2]
- [ ] Are semantic locators (`getByRole`, `getByText`, `getByLabel`) preferred over `data-testid`? [N7.3]

---

## 5. Performance Checklist

> Source: [performance-standards.md](../standards/performance-standards.md)
>
> Note: Performance testing is optional. 0/10 Gold suites implement it.

### Application Performance (P1)

- [ ] If measuring Web Vitals: is PerformanceObserver used (not `web-vitals` library)? [P1.1]
- [ ] Are performance thresholds based on current application baseline (not ideals)? [P1.2]
- [ ] If using Lighthouse: is it Chromium-only with a dedicated fixture? [P1.3]
- [ ] If throttling: is CDP used (not `page.route()` delays or `slowMo`)? [P1.4]

### Performance Budgets (P3)

- [ ] Are performance budgets tiered (PR smoke, nightly full, weekly load)? [P3.1]
- [ ] Are initial thresholds set 10-20% above current metrics? [P3.2]
- [ ] Is metric variance accounted for (20% expected, no single-run pass/fail)? [P3.3]

### Test Structure (P4)

- [ ] Are performance tests in a separate Playwright project? [P4.1]
- [ ] Are performance tests organized by concern (smoke, lighthouse, vitals, load)? [P4.2]

### CI Execution (P6)

- [ ] Is sharding used instead of multiple workers for scaling? [P6.1]
- [ ] Are only needed browsers installed (Chromium for performance)? [P5.2]
- [ ] Is `maxFailures` set to prevent CI cost overrun? [P6.4]

---

## 6. Security Checklist

> Source: [security-standards.md](../standards/security-standards.md)

### Authentication (SEC1)

- [ ] Is auth handled via setup projects (not `globalSetup`)? [SEC1.1]
- [ ] Is REST API auth preferred over UI login for setup? [SEC1.2]
- [ ] For sharded suites: is on-demand auth (`globalCache.get()`) considered? [SEC1.3]
- [ ] Do logout tests verify session cleanup (cookies, localStorage, redirect)? [SEC1.4]
- [ ] Do API tests verify role-based access control (403 for unauthorized)? [SEC1.5]
- [ ] Is there zero UI login in every test (only storageState reuse)? [SEC1.7]

### Credential Security (SEC2)

- [ ] Are all credentials injected via environment variables (never hardcoded)? [SEC2.1]
- [ ] Is `.auth/` in `.gitignore`? [SEC2.2]
- [ ] Does each role have its own storageState file? [SEC2.3]
- [ ] Are CI credentials managed via platform secrets (GitHub Secrets, etc.)? [SEC2.4]
- [ ] Are test users provisioned programmatically (not manually created)? [SEC2.5]
- [ ] Is `.env` in `.gitignore` (only `.env.example` committed)? [SEC2.7]

### Role-Based Access Control (SEC3)

- [ ] For multi-role apps: is each role a separate Playwright project? [SEC3.1]
- [ ] Are test users created via API during setup? [SEC3.2]
- [ ] Do tests verify that unauthorized users are rejected? [SEC3.3]
- [ ] For multi-user interactions: are separate browser contexts used per role? [SEC3.4]

### Session Management (SEC4)

- [ ] Is sessionStorage handling documented (storageState does NOT capture it)? [SEC4.1]
- [ ] For long suites: is session expiration handled (re-auth or extended TTL)? [SEC4.2]
- [ ] Are token lifecycle tests included (uniqueness, invalidation, expiration)? [SEC4.3]
- [ ] Is there zero browser context reuse across auth states? [SEC4.5]

### Security Validation (SEC5)

- [ ] For security-critical apps: are HTTP security headers validated? [SEC5.1]
- [ ] Are session cookie security attributes checked (httpOnly, secure, sameSite)? [SEC5.2]
- [ ] Is `bypassCSP` NOT used in security validation tests? [SEC5.6]

### Application Toggle (SEC7)

- [ ] If using an E2E toggle: is its scope minimal and documented? [SEC7.1]
- [ ] Does the toggle NOT change auth, validation, or security behavior? [SEC7.2]

---

## 7. Quality Checklist

> Source: [quality-criteria.md](../standards/quality-criteria.md)

### Gold-Tier Criteria (Q1)

- [ ] Is TypeScript used throughout (config, tests, fixtures)? [Q1.2]
- [ ] Is the suite actively maintained (commits within last 6 months)? [Q1.2]
- [ ] Is configuration environment-aware (CI vs. local)? [Q1.2]
- [ ] Are 2+ Playwright projects defined? [Q1.2]
- [ ] Is there a dedicated CI workflow with artifact capture? [Q1.2]
- [ ] Are artifacts captured conditionally (only on failure)? [Q1.2]
- [ ] Are custom fixtures used via `test.extend<T>()`? [Q1.2]
- [ ] Is there a testing guide for contributors? [Q1.2]

### Validation Maturity (Q5)

- [ ] Level 1: Are web-first assertions present with default timeouts? [Q5.1]
- [ ] Level 2: Does config gate retries/workers/timeouts on `process.env.CI`? [Q5.1]
- [ ] Level 3: Are guard assertions, ESLint enforcement, and quarantine tracking in place? [Q5.1]
- [ ] Level 4: Are custom matchers, sharding, `maxFailures`, and network interception used? [Q5.1]
- [ ] Level 5: Are dynamic shard calculation, `--fail-on-flaky-tests`, and Clock API used? [Q5.1]

### Quality Rubric Scoring (Q6)

- [ ] Structure domain score >= 2 (feature-based org, multi-project, POM or fixtures)? [Q6.1]
- [ ] Validation domain score >= 2 (guard assertions, timeout hierarchy, `toPass()`)? [Q6.1]
- [ ] CI/CD domain score >= 1 (three-step workflow, `forbidOnly`, conditional artifacts)? [Q6.1]
- [ ] Security domain score >= 1 (env var credentials, storageState, `.gitignore`)? [Q6.1]
- [ ] Semantics domain score >= 1 (`.spec.ts`, kebab-case, action-oriented descriptions)? [Q6.1]
- [ ] Process domain score >= 1 (active maintenance, basic README)? [Q6.1]
- [ ] Anatomy domain score >= 2 (fixture-driven setup, 3-5 assertions avg, guard assertions for ambiguous transitions)? [Q6.1]
- [ ] Coverage domain score >= 1 (core CRUD + auth tested, structural tiering)? [Q6.1]

### Anti-Patterns (Q7)

- [ ] Is there zero "framework on top of a framework" abstraction? [Q7.1]
- [ ] Has migration debt from prior frameworks been addressed? [Q7.2]
- [ ] Is there zero POM inheritance (`extends BasePage`)? [Q7.2]
- [ ] Is there zero `waitForTimeout()` usage? [Q7.2]
- [ ] Are there no CSS selectors where semantic locators would work? [Q7.2]

### Flakiness Quality Gate (Q4)

- [ ] Is the flaky test rate target below 2%? [Q4.1]
- [ ] Does every quarantined test have a tracking issue? [Q4.2]
- [ ] Is there no permanent quarantine without investigation? [Q4.2]

---

## 8. Test Anatomy Checklist

> Source: [test-anatomy-standards.md](../standards/test-anatomy-standards.md)

### Arrange-Act-Assert Pattern (TA1)

- [ ] Do tests follow the Arrange-Act-Assert pattern (setup, interaction, verification) as a conceptual framework? [TA1.1]
- [ ] Do multi-step flow tests interleave Act-Assert pairs, asserting after each action? [TA1.2]
- [ ] Is the Arrange phase handled by fixtures rather than inline setup code? [TA1.3]

### Single Responsibility (TA2)

- [ ] Are tests under 30 lines on average (excluding fixture setup)? [TA2.1]
- [ ] Is fixture investment sufficient to enable short tests? [TA2.2]
- [ ] Is there a decision framework for when to bundle vs split tests? [TA2.3]
- [ ] Do test files contain 3-10 tests covering related behaviors of a single feature? [TA2.4]

### Test Step Usage (TA3)

- [ ] Is `test.step()` reserved for CUJ and long workflow tests (>50 lines), not general-purpose? [TA3.1]
- [ ] Are separate focused tests preferred over single tests with `test.step()` divisions? [TA3.2]
- [ ] Do `test.step()` names describe user-visible actions, not implementation details? [TA3.3]

### Setup Placement (TA4)

- [ ] Is setup complexity matched to product complexity using the five-tier decision framework? [TA4.1]
- [ ] Are fixtures used (not `beforeEach`) for cross-file shared setup? [TA4.2]
- [ ] Is `beforeAll` reserved for expensive shared read-only resources? [TA4.3]
- [ ] Does every setup mechanism have a corresponding colocated cleanup? [TA4.4]

### Assertion Patterns (TA5)

- [ ] Do standard (non-CUJ) tests contain 2-8 assertions? [TA5.1]
- [ ] Is assertion density scaled by test archetype (smoke: 1-2, CRUD: 3-5, CUJ: 10-20+)? [TA5.2]
- [ ] Are explicit guard assertions used only for ambiguous state transitions (not every page load)? [TA5.3]
- [ ] Do assertions follow the navigation-state-interaction-outcome ordering? [TA5.4]
- [ ] Is `expect.soft()` used for multi-checkpoint CUJ tests, not for short tests? [TA5.5]
- [ ] Are all element assertions web-first (auto-retrying), with zero synchronous assertion patterns? [TA5.6]

### Test Independence & Determinism (TA6)

- [ ] Is every test runnable in isolation and in any order? [TA6.1]
- [ ] Is `test.describe.serial` avoided for state sharing between tests? [TA6.2]
- [ ] Is the data isolation approach matched to the application's infrastructure? [TA6.3]
- [ ] Are determinism patterns implemented for tests with variable inputs (seeded randoms, unique IDs)? [TA6.4]

---

## 9. Coverage Strategy Checklist

> Source: [coverage-standards.md](../standards/coverage-standards.md)

### E2E Testing Boundaries (COV1)

- [ ] Is there a documented E2E testing boundary (what to test at E2E vs lower levels)? [COV1.1]
- [ ] Does E2E coverage follow the priority table (must-have, should-have, rarely-at-E2E)? [COV1.2]
- [ ] For complex products: is a multi-layer E2E architecture used (API layer for breadth, UI layer for depth)? [COV1.3]

### Coverage Tiers (COV2)

- [ ] Are coverage tiers implemented through directory structure and Playwright projects, not priority tags? [COV2.1]
- [ ] Are tags reserved for cross-context execution control (browser exclusion, CI tier), not priority classification? [COV2.2]
- [ ] Is CI tier complexity scaled to suite size (no tiering under 50 tests, structural tiering at 200+)? [COV2.3]

### Prioritization & Growth Strategy (COV3)

- [ ] Are Critical User Journeys defined as the primary unit of E2E coverage measurement? [COV3.1]
- [ ] Does coverage growth follow the recommended priority order (auth, CRUD, navigation first)? [COV3.2]
- [ ] Is a breadth-vs-depth strategy selected that matches the product risk profile? [COV3.3]
- [ ] Are common growth triggers and infrastructure milestones planned for? [COV3.4]

### Negative & Edge Case Testing (COV4)

- [ ] Is the E2E test ratio approximately 80-90% happy-path and 10-20% error-path? [COV4.1]
- [ ] Is E2E negative testing focused on the six categories that production suites actually test? [COV4.2]
- [ ] Are API-level tests used for systematic error coverage rather than UI E2E? [COV4.3]
- [ ] Is there a regression test directory or naming convention for production incidents? [COV4.4]

### Coverage Measurement & Health (COV5)

- [ ] Is code coverage measurement absent as a gating metric (or weekly at most, not per-PR)? [COV5.1]
- [ ] Is structural completeness (one test directory per feature) used as the primary coverage heuristic? [COV5.2]
- [ ] Is feature-scenario tracking used as an optional enhancement if needed? [COV5.3]
- [ ] If collecting code coverage: is it run weekly, not per-PR? [COV5.4]
- [ ] Is suite health assessed using the coverage maturity model? [COV5.5]
