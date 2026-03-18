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
- [ ] Are tags used for cross-cutting categorization (e.g., `@smoke`, `@critical`)? [S5.2]
- [ ] Are related tests within files grouped using `test.describe()`? [S5.3]
- [ ] Do complex, multi-step tests use `test.step()` for readable reporting? [S5.4]

### Data Management (S6)

- [ ] Is test data created via API or database, not via UI? [S6.1]
- [ ] Are factory functions used for test data generation with sensible defaults? [S6.2]
- [ ] Does every test that creates data clean it up via fixture teardown? [S6.3]
- [ ] Do parallel workers create unique, non-conflicting data (via `workerInfo.workerIndex` or timestamps)? [S6.4]

---

## 2. Validation Checklist

> Source: [validation-standards.md](../standards/validation-standards.md)

### Web-First Assertions (V1)

- [ ] Do all element assertions use web-first (auto-retrying) assertions? [V1.1]
- [ ] Is there zero usage of `expect(await locator.isVisible()).toBe(true)` pattern? [V1.1]
- [ ] Are guard assertions placed between action steps? [V1.2]
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
