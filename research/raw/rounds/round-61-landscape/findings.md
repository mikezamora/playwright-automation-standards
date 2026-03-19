# Round 61 Findings — Coverage Strategy Patterns

## Phase
Landscape (Phase 2) — Coverage Strategy Discovery

## Objective
Find suites and community resources demonstrating mature coverage strategy patterns: how teams decide what to test, how they organize test tiers, and how they measure coverage. This is the area with the LEAST existing evidence from rounds 1–55.

---

## 1. Suites with Tag-Based Categorization

### Playwright's Native Tag System (v1.42+)
Playwright v1.42 introduced a dedicated `tag` property that separates tags from test titles. Prior to this, tags were embedded in test names (e.g., `test('login @smoke', ...)`), causing clutter in HTML reports. The new syntax:

```typescript
test('user can login', { tag: ['@smoke', '@slow'] }, async ({ page }) => { ... });
test.describe('group', { tag: '@report' }, () => { ... });
```

Tags can be filtered via CLI (`--grep @smoke`, `--grep-invert @regression`) and within `playwright.config.ts` per project (`grep: /@smoke/`).

**Source:** Playwright official docs (test-annotations), dev.to/playwright (Debbie O'Brien), Tim Deschryver blog

### Common Tag Taxonomies Found in Practice
From community guides and real projects, the following tag categories appear repeatedly:

| Tag | Purpose | Usage Pattern |
|-----|---------|---------------|
| `@smoke` | Quick health-check of critical paths | Run on every commit/deploy; < 5 min |
| `@regression` | Full feature coverage | Run nightly or on merge to main |
| `@critical` | Revenue/safety-impacting flows | Run on every PR |
| `@slow` | Tests exceeding normal timeout | Excluded from PR checks, included in nightly |
| `@flow` | Multi-step user journey tests | Grouped for workflow validation |
| `@ci` | Tests designed for CI execution | May differ from local-run tests |
| `@feature-X` | Feature-scoped tests | Enables team-based filtering |
| `@vrt` | Visual regression tests | Separate execution with snapshot comparisons |
| `@sanity` | Post-bugfix quick validation | Subset of regression |

### Real Suites Using Tags

**RocketChat/e2e-playwright**: Uses Monocart reporter with styled tag definitions (`smoke`, `sanity`, `critical`, `slow`) and JIRA integration columns. Tags have custom colors in reports and descriptions explaining their purpose. This is one of the most mature tag systems found.

**aeshamangukiya/playwright-test-automation-framework**: Uses `tag: ['@smoke', '@regression']` with severity annotations marked as 'critical'. Demonstrates combining priority tags with test-type tags.

**OmonUrkinbaev/playwright-qa-automation**: Tags for selective execution: `@smoke` for fast smoke tests, `@ui` for UI E2E, `@api` for API contract tests.

### Key Finding
Tag-based categorization is predominantly found in **QA-engineer-authored frameworks** and **tutorial/template projects**, NOT in product-team-maintained suites. The Gold suites from rounds 1–55 (product teams) use structural organization instead. This suggests tags are a QA-discipline practice that product teams replace with directory structure.

---

## 2. Suites with Tiered CI Execution

### Grafana — The Standout Example
**Repository:** grafana/grafana (97k+ stars)

Grafana's Playwright suite (`e2e-playwright/`) is the most mature example of structural tiering found. It uses named Playwright projects as tiers:

- **`smoke`** → `e2e-playwright/smoke-tests-suite/` — 3 spec files (accessibility, panels, smoketests). Tagged `@acceptance`. Tests core CRUD: create datasource, create dashboard, add panel, verify render.
- **`dashboard-cujs`** → `e2e-playwright/dashboard-cujs/` — "Critical User Journeys" with setup/teardown projects. Tests AdHoc filters, GroupBy variables, Scopes, dashboard navigation. Has own README documenting purpose, env flags, and data setup.
- **`unauthenticated`** → `e2e-playwright/unauthenticated/` — Login flow tests that run WITHOUT auth state.
- **`alerting`**, **`dashboards`**, **`panels`**, **`various`**, **`cloud-plugins`** → Feature-scoped suites.
- **Per-datasource projects**: `elasticsearch`, `mysql`, `mssql`, `cloudwatch`, `grafana-postgresql-datasource`, etc.
- **Role-based projects**: `admin` (with admin auth), `viewer` (with viewer auth).

Key architectural patterns:
1. `withAuth()` helper function wraps projects with authentication dependencies
2. Authentication itself is a separate Playwright project (`authenticate`, `createUserAndAuthenticate`)
3. Dashboard CUJs have explicit setup/teardown projects with dependency chains
4. Per-datasource isolation prevents cross-contamination

### Finnish Government Education Service (Opetushallitus/valtionavustus)
Has explicit smoke test projects in `playwright.config.ts`:
```typescript
projects: [
  { name: 'smoke-test-qa', testDir: 'smoke-tests', use: { env: 'qa', baseURL: '...' } },
  { name: 'smoke-test-prod', testDir: 'smoke-tests', use: { env: 'prod', baseURL: '...' } },
  { name: 'Default', testDir: 'tests' },
]
```
Runs smoke tests against BOTH QA and production environments. This is a real-world government service separating smoke from full test suite.

### German Government Digital Service (digitalservicebund/ris-search)
Separates `smoke-tests` as a distinct project targeting staging, while regular tests target localhost:
```typescript
{ name: 'smoke-tests', testDir: './smoke-tests', use: { baseURL: 'https://ris-portal.dev.ds4g.net', httpCredentials: {...} } }
```
Cross-browser projects (chromium, firefox, webkit, mobile) for full tests; single Chrome project for smoke.

### Selective Execution by Code Change (Denis Skvortsov pattern)
A documented pattern uses `git diff` to detect changed services and runs only relevant tests via `--grep`:
1. **detect-changes** job → analyzes `git diff --name-only origin/main HEAD`
2. Tags match repository folder hierarchy (`@apps/microservice1`)
3. Shared code changes trigger full suite; service changes trigger selective tests
4. Two conditional jobs: `selective-tests` and `all-tests`

### Two-Tier CI Pattern (Playwright Solutions)
- **Daily full suite**: Cron schedule (`0 6 * * *`) runs all tests with full browser matrix
- **PR targeted tests**: Runs only spec files changed in the PR, detected via `git diff` + `grep ".spec.ts"`
- Sequential workers (`--workers=1`) for PR runs to reduce cost; full parallelism for nightly

### Key Finding
Tiered CI execution is achieved through THREE mechanisms, in order of maturity:
1. **Structural** (most mature): Separate directories → separate Playwright projects → CI triggers select projects by name (Grafana, Finnish/German gov)
2. **Tag-based**: `--grep @smoke` in CI YAML, same directory structure (RocketChat, QA frameworks)
3. **Change-detection**: `git diff` determines which tests to run (monorepo pattern)

Most production suites use mechanism 1; most QA frameworks teach mechanism 2.

---

## 3. Community Guidance on Coverage Strategy

### What to Test at the E2E Level

**Playwright Official Best Practices** (playwright.dev/docs/best-practices):
- Focus on **user-visible behavior**, not implementation details
- Don't test third-party services; mock them with Network API
- Test against **staging environments** with consistent data
- Tests should be **completely independent** with fresh browser contexts

**BugBug "E2E Test Coverage" Guide** (bugbug.io):
- Coined "Money Paths" — critical business workflows where failure has maximum revenue/compliance impact
- Risk-based prioritization: `High Risk = High Impact × High Likelihood`
- Reject 100% coverage as a goal; track "% of business-critical flows covered" instead
- Track: regression detection time post-deploy, ratio of automated vs manual checks needed

**Alphabin "Improving Playwright Test Coverage"** (alphabin.co):
- Risk prioritization model: `High Risk = High Impact × High Likelihood`
- Recommends 80% scenario coverage target (not code coverage)
- Distinguishes **positive scenarios**, **negative scenarios**, and **edge cases**
- Spreadsheet-based scenario tracking: features × test status (✓ / ✗ / ⚠)
- Coverage multipliers: same tests across browsers AND environments (QA, staging, prod)

**Makerkit "Smoke Testing Your SaaS"** (makerkit.dev):
- Smoke tests: 10–20% of functionality; full E2E: 70–90%
- Three essential smoke categories: Authentication, Payment Integration, Core Feature CRUD
- Goal: "early warning system" — not comprehensive validation
- Run after every deployment; keep under 5 minutes

**Tim Deschryver "Test Sets Using Tags and Grep"** (timdeschryver.dev):
- Four tag categories: `@smoke` (simple, fast, read-only), `@flow` (full workflows), `@ci` (CI-specific), `@feature` (feature-scoped)
- Core principle: "A test that isn't executed is always faster than a test that is executed"
- Run full suites nightly; run targeted subsets on PRs
- Read-only smoke tests safe for production releases

**BrowserStack "15 Best Practices for Playwright 2026"** (browserstack.com):
- Quick smoke tests on feature branches; full suites on main branches
- Different test types at different stages: smoke on PRs, regression on merge, slow E2E on nightly

**OneUpTime "E2E Testing Best Practices 2026"** (oneuptime.com):
- Focus on core, frequently-used workflows pivotal to business functionality
- 100% test coverage is unrealistic; capture essence of user interaction
- Achieving 100% test coverage is unrealistic; focus on business-critical scenarios

### Testing Pyramid Guidance

**Frontend Testing Pyramid** (techme365.com, meticulous.ai):
- Unit (50–60%), Component (≥80% coverage), E2E (critical user flows)
- E2E sits at top; fewest in number, highest in confidence per test
- "E2E code coverage should be used as an indicator of whether you have not forgotten to cover any business-critical scenario" — not as a dull 100% goal

**Testomat.io Pyramid** (testomat.io):
- Many unit tests (fast, cheap), fewer integration tests, fewest E2E tests (slow, expensive)
- E2E tests should verify complete user journeys, not individual components

### Key Findings
- **No community source recommends > 80% code coverage for E2E tests**
- **Risk-based prioritization** is universally recommended over percentage targets
- **"Money paths" / "Critical user journeys"** are the consensus unit of E2E coverage
- **Smoke : Full ratio** is approximately 10–20% : 70–90% of features
- **Time budget** for smoke: < 5 minutes; for full: nightly cadence acceptable
- **Production monitoring** (Checkly) blurs the line between testing and observability

---

## 4. Negative/Edge Case Testing Patterns

### What Was Found
Negative testing in Playwright E2E suites is **poorly documented** compared to happy-path testing. The community guidance is largely limited to:

1. **Try/catch pattern** for validating that errors are thrown (cryan.com):
   - Wrap expected-failing operations in try/catch
   - Assert `errorCaught === true` and check error message contents
   - Helper function pattern: `expectError(fn, expectedMessagePart)`

2. **HTTP status validation** (various):
   - `response.status()` and `response.ok()` for checking 404/500 responses
   - `page.onResponse` handler for monitoring all network responses

3. **Role-based access denial testing**:
   - Multiple browser contexts with different storage states (admin vs viewer)
   - Playwright docs recommend testing features "with different users and roles"
   - Grafana implements this structurally with `admin` and `viewer` projects

4. **Empty/error state UI validation**:
   - No dedicated community guides found
   - Covered implicitly in "what to test" guides: "have you tested what happens when they add an item that goes out of stock while they're checking out?"

### Concrete Edge Case Examples from Guides
From BugBug's coverage guide, a mature checkout flow should test:
- Guest checkout with credit card (happy path)
- Logged-in checkout with saved payment (variation)
- Checkout with coupon code applied (feature interaction)
- Checkout with shipping address change mid-flow (state transition)
- **Checkout with failed payment and retry flow** (error recovery)
- **Checkout with inventory conflict during checkout** (race condition)
- **Checkout with session timeout recovery** (session edge case)

### Key Finding
Error-path coverage in E2E suites is aspirational in community guidance but **rarely demonstrated** in real open-source suites. The 5–15% error-path coverage ratio found in Gold suites (rounds 56–59) appears to be the norm, not an outlier. Most teams delegate error-path testing to unit/integration layers.

---

## 5. Coverage Measurement Approaches

### Code Coverage (Instrumentation-Based)

**V8 Coverage API** (Playwright built-in):
- `page.coverage.startJSCoverage()` / `page.coverage.stopJSCoverage()`
- Returns raw byte offsets and function ranges (not human-readable)
- **Chromium-only** — Firefox and WebKit not supported
- Requires `v8-to-istanbul` to convert to Istanbul/NYC format for HTML/LCOV reports

**Istanbul Instrumentation** (babel-plugin-istanbul, vite-plugin-istanbul):
- Injects counters during build; captures coverage in `window.__coverage__`
- Works across all browsers
- Requires build pipeline modification (Babel/Vite plugin)

**Helper Packages**:
- `@bgotink/playwright-coverage` — Simplifies V8-to-Istanbul pipeline
- `mxschmitt/playwright-test-coverage` — Demo repo for Istanbul integration
- `stevez/nextcov` — Next.js-specific V8 coverage for Playwright

**Best Practice from Currents**: "Treat coverage as a guide, not a goal. High coverage percentages don't guarantee test quality — tests can achieve 100% coverage without meaningful assertions."

### Feature Coverage (Scenario-Based)

**feature-map npm package** (playwrightsolutions.com):
- YAML file mapping pages → features → boolean (true/false for automation exists)
- Calculates per-page and total product coverage percentages
- Manual maintenance: developers mark features `true` when tests are added
- **Limitations**: Binary only (no depth), manual sync, no omission status, no scenario tracking
- **Strengths**: Version-controlled, transparent to stakeholders, lives alongside test code
- Example output: `/auth/login page has 50% coverage — Total Product coverage is: 9.09%`

**Spreadsheet/Matrix Tracking** (Alphabin):
- Requirements × tests matrix with status markers (✓ / ✗ / ⚠)
- Formula: `(Tested Scenarios / Total Scenarios) × 100`
- Simple but not version-controlled or CI-integrated

### Test Management Platforms

**Testomat.io**: Imports Playwright test structure, tracks automated coverage %, flaky tests, slowest tests. Detects out-of-sync tests when source code changes.

**Currents**: Aggregates coverage metrics from parallel sharded runs into dashboards. Centralized coverage trend tracking.

**Checkly**: Converts existing Playwright E2E tests into synthetic production monitors. Uses tags (`@critical`, `@smoke`) to select which tests run as monitors. Bridges testing and observability.

**Azure DevOps Test Plans + Playwright**: Maps Playwright tests to Azure test cases for traceability.

**Xray (Jira) + Playwright**: Maps test execution results back to Jira requirements.

### Key Finding
Coverage measurement in the Playwright ecosystem splits into two distinct philosophies:
1. **Code coverage** (V8/Istanbul): Measures lines executed, Chromium-only for native API, requires build modification for Istanbul. Used as a sanity check, not a target.
2. **Feature/scenario coverage** (feature-map, spreadsheets, test management platforms): Measures which user-facing features have tests. Manual maintenance burden but more meaningful for E2E.

No widely-adopted standard tool exists for feature coverage tracking. The `feature-map` package is the closest but has significant limitations (binary, manual, no depth).

---

## 6. Key Insights for Standards (COV1–COV5)

### COV1: Coverage Scope Definition
**Evidence supports**: Teams should define E2E coverage scope using "critical user journeys" (Grafana's term) or "money paths" (BugBug's term), NOT code coverage percentages.
- Risk-based prioritization: `Impact × Likelihood`
- Focus on revenue-impacting, safety-impacting, and compliance-impacting flows
- Explicitly exclude from E2E: third-party services, pure computation, pixel-level validation

### COV2: Test Tier Organization
**Evidence supports**: Two primary mechanisms exist, both valid:
- **Structural tiers** (directories → Playwright projects): Grafana, Finnish gov, German gov. Better for large suites, clearer separation, project-level configuration.
- **Tag-based tiers** (`@smoke`, `@regression`, `@critical`): RocketChat, QA frameworks. Better for smaller suites, more flexible, lower organizational overhead.
- **Hybrid** is possible but not widely observed.

Recommended tiers (consensus across all sources):
1. **Smoke** (10–20% of features, < 5 min): Auth, core CRUD, payment
2. **Critical/CUJ** (30–50%): Full user journeys, error recovery, cross-feature interactions
3. **Regression/Full** (70–90%): All automated scenarios, multi-browser, nightly

### COV3: Tiered CI Execution
**Evidence supports**: Tiers should map to CI triggers:
- **PR/commit**: Smoke tests only (fast feedback)
- **Merge to main**: Critical + Regression (gate for deployment)
- **Nightly/scheduled**: Full suite including slow, visual regression, multi-browser
- **Post-deploy**: Smoke tests against production (monitoring boundary)

### COV4: Error/Edge Case Coverage
**Evidence supports**: The 5–15% error-path ratio is the pragmatic norm.
- Delegate most error-path testing to unit/integration layers
- E2E error coverage should focus on: failed payment + retry, session timeout recovery, inventory conflicts, RBAC enforcement
- "Have you tested what happens when..." is the heuristic question

### COV5: Coverage Tracking
**Evidence supports**: Feature/scenario coverage tracking is more meaningful than code coverage for E2E:
- Code coverage tools exist but are Chromium-only or require build modification
- Feature coverage tools (feature-map) exist but are immature
- Test management platforms (Testomat.io, Currents) provide the most complete picture
- Manual tracking via scenario matrices remains common
- Target: 80% scenario coverage of high-priority workflows, not 100% of code

---

## Contradictions and Open Questions

1. **Tags vs Structure**: Community guides universally recommend tags, but the most mature real-world suites (Grafana) prefer structural organization. Are tags a stepping stone to structural maturity, or a parallel valid approach?

2. **Coverage percentage targets**: Sources range from "no targets" (BugBug) to "80%" (Alphabin) to "80–90% of high-priority workflows" (various). Need to distinguish code coverage targets (discouraged) from scenario coverage targets (encouraged).

3. **Error-path placement**: Some guides recommend E2E error-path tests; all real suites show minimal error-path coverage at the E2E layer. This tension suggests the community aspires to more error coverage than teams actually implement.

4. **Smoke test scope**: Makerkit says 10–20% of functionality; BrowserStack says "small subset"; Grafana's smoke suite is 3 spec files out of hundreds. Need to investigate whether "10–20%" is features or test count.
