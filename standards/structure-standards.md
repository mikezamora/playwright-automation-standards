# Structure Standards

> **FINAL** — validated across 10 Gold-standard suites, 5 Silver suites, 7+ community suites, 25+ documentation sources, and 17 cross-validation suites (rounds 1-55, 122+ total sources, 0 contradictions)

---

## S1. File Organization

### S1.1 Use `.spec.ts` for test file naming

- Test files MUST use the `.spec.ts` extension
- **Rationale:** `.spec.ts` is the dominant convention across production suites and the Playwright CLI default
- **Evidence:** 7/10 Gold suites use `.spec.ts` [grafana-e2e, affine-e2e, freecodecamp-e2e, playwright-official, supabase-e2e, excalidraw-e2e, nextjs-e2e]; PostHog, Actual Budget, Supabase community, Documenso also use `.spec.ts`
- **Valid alternatives:** `.e2e.ts` (Cal.com) — acceptable when distinguishing E2E from unit tests in the same codebase; `.e2e-spec.ts` (Immich) — acceptable but verbose
- **Anti-pattern:** `.test.ts` for Playwright files — this convention belongs to unit test frameworks (Jest, Vitest) and creates ambiguity in mixed codebases

### S1.2 Use a dedicated test directory at project root

- Playwright tests MUST reside in a dedicated directory, not scattered through application source
- **Recommended names (in preference order):**
  1. `e2e/` — Cal.com, Immich, freeCodeCamp (3/12 deep-dived suites)
  2. `tests/` — AFFiNE, Playwright, Supabase (3/12)
  3. `e2e-playwright/` — Grafana (1/12, useful when multiple E2E frameworks coexist)
  4. `playwright/` — Slate, PostHog (2/12)
- **Evidence:** 22/22 analyzed production suites use dedicated test directories
- **Anti-pattern:** Scattering `.spec.ts` files throughout `src/` — makes test discovery unreliable and complicates CI configuration

### S1.3 Organize page objects in `pages/` or `page-models/` directory

- Page objects SHOULD be organized in a dedicated directory within or adjacent to the test directory
- **Recommended:** `pages/` (most common), `page-models/` (PostHog), or `models/` (Grafana plugin-e2e for framework packages)
- **Evidence:** PostHog (`playwright/page-models/`), community templates (`pages/`), Grafana plugin-e2e (`models/`)
- **Anti-pattern:** Inlining page object classes in test files — breaks reuse across tests

### S1.4 Organize auth state in `.auth/` directory

- `storageState` files MUST be saved to `playwright/.auth/` or `.auth/`
- This directory MUST be listed in `.gitignore`
- **Pattern:** `playwright/.auth/<role>.json` (e.g., `admin.json`, `viewer.json`, `certified-user.json`)
- **Evidence:** [grafana-e2e, grafana-plugin-e2e, freecodecamp-e2e (`certified-user.json`), supabase-community-e2e]
- **Anti-pattern:** Committing auth state files to version control — contains session tokens

### S1.5 Use feature-based directory organization for test grouping

- Suites with 20+ test files SHOULD organize tests into feature-based subdirectories
- **Pattern:** Name directories after application features or domains, not test types
- **Gold suite examples:**
  - Grafana: `dashboards-suite/`, `alerting-suite/`, `panels-suite/`
  - Cal.com: `auth/`, `eventType/`, `team/`, `organization/`
  - AFFiNE: `affine-local/`, `affine-cloud/`, `affine-desktop/` (deployment-target packages)
- **Evidence:** 5/5 Gold suites with 20+ tests use feature-based grouping
- **Valid alternative:** Flat file organization — viable for smaller suites (freeCodeCamp: 126 files, no subdirectories)
- **Anti-pattern:** Type-based directories (`e2e/`, `ui/`, `api/`, `visual/`) — observed only in Bronze community templates, not in production suites. Feature changes scatter across type directories, increasing maintenance cost

---

## S2. Configuration

### S2.1 Use TypeScript configuration exclusively

- All Playwright configuration MUST use `playwright.config.ts`
- Never use `.js` or `.json` configuration files
- **Evidence:** 22/22 production suites use TypeScript configuration. Only Bronze community templates use JavaScript config.
- **Ecosystem context:** Some ecosystems (WordPress/PHP, legacy .NET) maintain JavaScript toolchains where TypeScript adoption has not yet reached test configuration. The recommendation to use TypeScript config remains — the benefits (type safety for project definitions, reporter config, and use options) apply regardless of the application's primary language.
- **Anti-pattern:** `playwright.config.js` — loses type safety for project definitions, reporter config, and use options

### S2.2 Implement environment-aware configuration via `process.env.CI`

- Configuration MUST differentiate between CI and local execution using `process.env.CI`
- At minimum, configure differently: `retries`, `workers`, `timeout`, `reporter`
- **Pattern:** `process.env.CI ? ciValue : localValue`
- **Evidence:** 12/12 deep-dived suites use this exact pattern. No suite uses `.env` files or `dotenv` for CI/local branching.
- **Configuration examples by suite:**
  - Cal.com: `timeout: process.env.CI ? 60_000 : 240_000` (shorter in CI — fast CI, slow dev server)
  - AFFiNE: `timeout: process.env.CI ? 50_000 : 30_000` (longer in CI — CI variability)
  - Grafana: `retries: process.env.CI ? 1 : 0`
  - Immich: `retries: process.env.CI ? 4 : 0`
- **Note:** The direction of timeout change (shorter or longer in CI) depends on your infrastructure. Document the rationale.
- **Anti-pattern:** Multiple environment config files (dev.env.js, qa.env.js, staging.env.js) — adds unnecessary complexity, observed only in enterprise templates not production suites

### S2.3 Define multiple Playwright projects scaled to application complexity

- Configuration SHOULD define multiple projects for different execution profiles
- **Scale guidance:**
  - **Small teams (2-5 projects):** Inline project definitions — Cal.com, Immich
  - **Medium teams (5-15 projects):** Auth helper function pattern — `withAuth()` from Grafana
  - **Large teams (15-31 projects):** Domain-segmented projects with setup/teardown chains — Grafana (31 projects)
- **Multi-frontend pattern (e-commerce, CMS):** Applications with distinct user-facing frontends (admin dashboard + public storefront) SHOULD define separate Playwright projects per frontend, each with its own `baseURL`, viewport, and auth state. Example: `{ name: 'admin', use: { baseURL: '/admin' } }` and `{ name: 'storefront', use: { baseURL: '/' } }`. Evidence: [shopware-acceptance-tests, saleor-dashboard, woocommerce-e2e]
- **CMS/modular platform pattern:** Platforms with independent admin domains (Strapi, Directus) may use per-domain `playwright.config.ts` files, each spawning its own application instance. This is analogous to the monorepo pattern where each package has its own config.
- **Common project types:** Browser targets, auth roles, application areas, test categories, setup/teardown pairs
- **Evidence:** 12/12 deep-dived suites define multiple projects; range from 2 (Playwright) to 31 (Grafana)
- **Valid alternative:** Single project — acceptable for focused test suites targeting one browser and one auth context

### S2.4 Configure `webServer` for auto-start when applicable

- Use `webServer` configuration to auto-start the application under test
- Set `reuseExistingServer: !process.env.CI` (fresh in CI, reuse locally)
- **Four architectural variants:**
  - **Pattern A — App server:** Direct app start (Cal.com: 3 ports, AFFiNE: yarn workspace)
  - **Pattern B — Conditional server:** Only when URL not set (`GRAFANA_URL` check in Grafana)
  - **Pattern C — Infrastructure server:** Supporting services like email (freeCodeCamp: Mailpit)
  - **Pattern D — Full-stack orchestration:** Docker Compose (Immich: `--renew-anon-volumes`)
- **Evidence:** 7/12 deep-dived suites use `webServer` config
- **When to skip:** Applications requiring Docker Compose, external databases, or multi-service orchestration that exceeds `webServer` capabilities

### S2.5 Configure timeout hierarchy appropriate to application type

- Define a three-tier timeout hierarchy: test timeout > expect timeout > action timeout
- **Recommended defaults:**
  - Standard web apps: 30s test / 5s expect / default action
  - Complex web apps (editors, dashboards): 30s test / 10s expect / default action
  - Infrastructure-heavy apps (Docker, multiple services): 60s test / 10s expect / default action
- **Evidence:**
  - Slate (editor): 20s test / 8s expect / 0 (unlimited) action
  - Grafana (dashboard): 30s test / 10s expect / default
  - Cal.com (multi-service): 60s CI / 240s local test
  - freeCodeCamp (Docker API): 15s test / default expect
- **Rule of thumb:** Test timeout should be 2-4x the expect timeout
- **Anti-pattern:** Setting action timeout to 0 (unlimited) unless the application genuinely requires variable-time operations (e.g., rich text editors)

### S2.6 Use multi-reporter configuration following the three-slot pattern

- CI configuration SHOULD use 2+ reporters following the three-slot pattern:
  1. **Progress slot** — real-time CI feedback: `dot`, `list`, or `github`
  2. **Artifact slot** — post-run debugging: `html`
  3. **Integration slot** — CI pipeline consumption: `junit`, `json`, or `blob`
- **Evidence:**
  - Cal.com: `blob` (CI) + `html` + JUnit XML (3 slots)
  - Playwright: `dot` + `json` + `blob` (3 slots)
  - Grafana: `html` + custom a11y reporter (2 slots)
- **Minimum requirement:** At least `html` reporter for debugging failed tests
- **Anti-pattern:** Using only `list` reporter in CI — provides no persistent artifact for debugging

### S2.7 Configure conditional artifact capture

- **Traces:** `trace: 'retain-on-failure'` (recommended) or `'on-first-retry'`
- **Screenshots:** `screenshot: 'only-on-failure'`
- **Video:** OFF by default — traces provide richer debugging data than video
- **Evidence:** 10/10 Gold suites use conditional trace capture. Only AFFiNE captures video (`'on-first-retry'`).
- **Anti-pattern:** `trace: 'on'` in CI — generates excessive artifact storage for passing tests

---

## S3. Page Object Model

### S3.1 Use Hybrid POM + Fixtures as the default architecture

- Page objects SHOULD be implemented as TypeScript classes registered as Playwright fixtures via `test.extend<T>()`
- This hybrid approach combines encapsulation (classes) with dependency injection (fixtures)
- **Decision framework for POM approach:**

| Suite Characteristics | Recommended Approach | Gold Suite Example |
|---|---|---|
| Large suite, many pages, team collaboration | **Hybrid POM + Fixtures** (Variant C) | Cal.com |
| Framework/SDK for external consumers | **Fixture-based POM** (Variant B) | Grafana plugin-e2e |
| Small-medium suite, simplicity prioritized | **Function helpers** (Variant D) | AFFiNE, freeCodeCamp |
| API-heavy with minimal UI | **Data fixtures only** (Variant E) | Immich |
| Multi-role workflows, dual-frontend apps, screenplay pattern | **Actor-based POM** (Variant F) | Shopware acceptance-test-suite |

- **Evidence:** Cal.com (hybrid), Grafana plugin-e2e (fixture-based), AFFiNE (function helpers) — all Gold suites using different valid approaches
- **Anti-pattern:** POM inheritance via `extends BasePage` — see S3.4

### S3.2 Follow the canonical POM constructor pattern

- POM classes MUST accept `Page` as the sole constructor argument
- Locators MUST be defined as `readonly` properties initialized in the constructor
- Locators MUST use Playwright's locator API (`getByRole`, `getByLabel`, `getByText`, `locator`) — never raw CSS/XPath strings

```typescript
// CANONICAL PATTERN
class MyPage {
  readonly submitButton: Locator;
  readonly nameInput: Locator;

  constructor(public readonly page: Page) {
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.nameInput = page.getByLabel('Name');
  }
}
```

- **Evidence:** Playwright official docs POM example, Grafana plugin-e2e models, PostHog page-models — all follow this exact pattern
- **Anti-pattern:** Storing selectors as strings (`readonly selector = '#submit-btn'`) — loses auto-waiting, type safety, and locator composition

### S3.3 Organize POM methods into three categories

- **Navigation:** `goto()`, `navigateTo()` — methods that reach the page
- **Action:** `fillForm()`, `submit()`, `selectOption()` — methods performing user interactions
- **State/Assertion:** `isVisible()`, methods embedding `expect()` — methods verifying page state
- **Evidence:** Playwright official docs demonstrate embedding `expect()` assertions inside action methods: `getStarted()` includes `await expect(this.gettingStartedHeader).toBeVisible()` after click
- **Valid pattern:** Embedding assertions in action methods for built-in verification (action + assertion in one method)

### S3.4 Never use POM inheritance (`extends BasePage`)

- POM classes MUST NOT use inheritance hierarchies
- The `abstract class BasePage` pattern (shared header/footer locators, `abstract get url()`) is a community anti-pattern absent from all Gold production suites
- **Use composition via fixtures instead:** Shared functionality (navigation, common elements) should be separate fixtures or utility functions, not a base class
- **Evidence:** 0/22 production suites (Gold + Silver) use POM inheritance. Found only in Bronze community templates (ovcharski/playwright-e2e, community boilerplates).
- **Why it fails:** Inheritance creates tight coupling, fragile hierarchies, and violates the composition-over-inheritance principle. Fixtures provide the same code sharing with better testability.

### S3.5 Handle dynamic content via locator composition, not explicit waits

- Use Playwright's auto-waiting locator API — never `waitForSelector()` or `page.waitForTimeout()`
- **Composition patterns:**
  - `.filter({ hasText: '...' })` for text-based filtering
  - `.nth(n)` for index-based selection
  - `.locator()` chains for nested structure
  - `page.locator('li', { hasText: 'Guides' }).locator('a', { hasText: 'Page Object Model' })` for contextual selection
- **Evidence:** Playwright official docs POM, Grafana plugin-e2e models — all use locator composition
- **Anti-pattern:** `await page.waitForTimeout(1000)` — arbitrary sleeps cause flakiness and slow tests

---

## S4. Fixtures

### S4.1 Use `test.extend<T>()` for custom fixtures

- All shared test setup SHOULD be implemented as typed fixtures via `test.extend<T>()`
- Fixtures MUST be typed — define an interface for all custom fixtures
- Custom fixture usage is the primary maturity indicator separating basic from advanced suites
- **Evidence:** 8/10 Gold suites use custom fixtures [grafana-e2e, calcom-e2e, affine-e2e, immich-e2e, grafana-plugin-e2e, playwright-official, supabase-e2e, nextjs-e2e]
- **Anti-pattern:** Relying on `beforeEach`/`afterEach` hooks for shared setup — fixtures provide better typing, dependency injection, and guaranteed cleanup

### S4.2 Apply fixture scoping based on resource lifecycle

- **Test scope (default):** Page objects, test-specific state, per-test data
- **Worker scope:** Expensive shared resources — database connections, authenticated browser contexts, service clients
- **Auto fixtures (`{ auto: true }`):** Cross-cutting concerns — logging, metrics collection, screenshot capture, cleanup
- **Decision rule:** Use a fixture (not a utility function) when: (1) setup/teardown lifecycle matters, (2) the resource is shared via scoping, (3) dependency injection ordering matters
- **Evidence:**
  - Cal.com: test-scoped user factories, worker-scoped auth state
  - Grafana: test-scoped page models, worker-scoped API clients
  - PostHog: auto fixture for auth (runs before every test without explicit dependency)
- **Anti-pattern:** Worker-scoping page objects — page objects depend on `Page` which is test-scoped

### S4.3 Use `mergeTests()` and `mergeExpects()` for fixture composition

- Large suites SHOULD compose fixtures from multiple domain-specific modules using `mergeTests()`
- Custom matchers from multiple domains SHOULD be composed using `mergeExpects()`
- **Pattern:**
  ```typescript
  // Domain-specific fixture files
  import { test as dbTest } from './db-fixtures';
  import { test as a11yTest } from './a11y-fixtures';
  import { test } from 'playwright/test';
  export const mergedTest = mergeTests(test, dbTest, a11yTest);
  ```
- **Evidence:** Playwright v1.39.0+ API, community fixture composition patterns
- **Known limitation:** Name conflicts between merged fixture sets produce incorrect types ([microsoft/playwright#29178](https://github.com/microsoft/playwright/issues/29178))
- **Anti-pattern:** Single monolithic fixture file with 20+ fixtures — domain segmentation improves maintainability

### S4.4 Prefer setup projects with `storageState` for authentication

- Authentication SHOULD use dedicated setup projects that write `storageState` files
- Dependent test projects reference the auth state via `use: { storageState: '.auth/admin.json' }`
- **Evidence:** [grafana-e2e, grafana-plugin-e2e, freecodecamp-e2e, supabase-e2e] — all use setup project auth
- **Valid alternative:** Auto fixture auth (PostHog pattern) — moves auth from setup project to `{ auto: true }` fixture for better `--ui` mode compatibility. Trade-off: less visible in HTML report.
- **Auth architecture comparison:**

| Approach | Pros | Cons | Best For |
|---|---|---|---|
| **Setup project + storageState** | Visible in report, traces available, simple | All roles auth upfront, shards repeat setup | Most suites |
| **Auto fixture auth** | `--ui` compatible, flexible | Less visible in report | DX-focused teams |
| **Worker-scoped shared accounts** | Per-worker isolation | Requires account pool | High parallelism |
| **Multi-role browser contexts** | Both roles in one test | Complex fixture definition | Role interaction tests |

### S4.5 Extend Playwright with domain-specific custom matchers

- Mature suites SHOULD extend `expect` with domain-specific assertions
- **Highest maturity:** Publishing matchers as npm packages for ecosystem consumption
- **Evidence:**
  - Grafana plugin-e2e: `expect(panel).toHaveNoDataError()` — published as `@grafana/plugin-e2e`
  - playwright-posthog: custom matchers for PostHog analytics event assertions — published as npm package
- **When to add custom matchers:** When the same assertion pattern repeats 3+ times across tests and encapsulates domain knowledge

---

## S5. Test Grouping

### S5.1 Group tests by feature or application domain

- Tests SHOULD be organized in directories matching application features or business domains
- **Recommended structure:**
  ```
  e2e/
    auth/
      login.spec.ts
      signup.spec.ts
      password-reset.spec.ts
    dashboard/
      dashboard-browse.spec.ts
      dashboard-create.spec.ts
    settings/
      profile.spec.ts
      billing.spec.ts
  ```
- **Evidence:**
  - Grafana: `dashboards-suite/`, `alerting-suite/`, `panels-suite/` (domain-based)
  - Cal.com: `auth/`, `eventType/`, `team/`, `organization/` (feature-based)
- **Valid alternative for small suites:** Flat file organization with descriptive filenames (freeCodeCamp: 126 tests, no subdirectories)
- **Anti-pattern:** Type-based grouping (`e2e/`, `ui/`, `api/`) — scatters related tests across directories

### S5.2 Use tags for cross-cutting test categorization

- Use `@tag` annotations for categorization that cuts across feature directories
- **Common tag categories:**
  - Priority: `@critical`, `@smoke`, `@regression`
  - Speed: `@slow`, `@fast`
  - Feature flags: `@feature-x`
  - Platform: `@mobile`, `@desktop`
- **Pattern:** `test('user can login @smoke @critical', async ({ page }) => { ... })`
- **Run with:** `npx playwright test --grep @smoke`
- **Evidence:** Playwright official docs, community best practices (dev.to/playwright test organization guide)

### S5.3 Use `test.describe()` for logical grouping within files

- Related tests within a file SHOULD be grouped using `test.describe()` blocks
- Use `test.describe()` for: shared setup/teardown via `beforeEach`, logical grouping of related scenarios, serial execution when needed (`test.describe.serial()`)
- **Evidence:** Standard Playwright API pattern observed across all Gold suites

### S5.4 Use `test.step()` for complex test documentation

- Long tests with multiple phases SHOULD use `test.step()` for readable reporting
- Steps appear in trace viewer and HTML report, improving debugging
- **Pattern:** Prefer fewer, longer tests with `test.step()` over many micro-tests
- **Evidence:** PostHog testing guidelines recommend "fewer, longer tests" with `test.step()` for logical phases; Playwright official best practices

---

## S6. Data Management

### S6.1 Create test data via API, not UI

- Test data setup SHOULD use API calls or direct database operations, not UI interactions
- UI interactions are slower, flakier, and couple data setup to UI implementation
- **Pattern:** Use Playwright's `request` context or direct API calls for data creation
- **Evidence:**
  - Cal.com: Prisma factory methods create users, teams, event types directly in database
  - Immich: `createUserDto.create()` DTO factory methods via API
  - Grafana: API client fixtures for dashboard and data source creation
- **Anti-pattern:** Creating test data by navigating through the UI — slow, fragile, and couples data setup to UI

### S6.2 Use factory functions for test data generation

- Test data SHOULD be generated via factory functions with sensible defaults
- Factories SHOULD support override patterns for test-specific customization
- **Pattern levels:**

| Pattern | Complexity | Example |
|---|---|---|
| **Simple factory** | Low | `createUser({ name?: string })` with defaults |
| **DTO factory** | Medium | `createUserDto.create()` returns typed object (Immich) |
| **Scenario composition** | High | `users.create(opts, { hasTeam, teammates, schedulingType })` (Cal.com) |

- **Evidence:** Cal.com (scenario composition), Immich (DTO factory), Clerk template (`createSignupAttributes()`)
- **Tools:** Faker.js for randomized data, custom factories for domain-specific data
- **CMS/configurable-schema pattern:** When the application's data model is user-configurable (CMS, form builders, low-code platforms), factories may need two levels: (1) schema/type factories that create the data structure, and (2) entry/record factories that create instances of that structure. Cleanup must respect dependency order — delete entries before deleting the types they conform to. Evidence: [strapi-e2e]
- **Anti-pattern:** Hardcoded test data (magic strings, shared user accounts) — causes flaky tests in parallel execution

### S6.3 Ensure test data cleanup via fixture teardown

- Every test that creates data MUST clean it up, preferably via fixture teardown
- **Pattern:** Use the `use()` callback in fixtures — code after `await use(resource)` runs as teardown even on failure
  ```typescript
  myFixture: async ({}, use) => {
    const data = await createTestData();
    await use(data);
    await deleteTestData(data.id); // Guaranteed cleanup
  }
  ```
- **Advanced patterns:**
  - Transactional cleanup: Cal.com `prisma.$transaction()` with dependency-ordered deletes
  - Self-refresh: Cal.com `self()` method re-queries DB for current state after test mutations
  - Worker-isolated identity: `workerInfo.workerIndex` + timestamp suffix for unique email/username
- **Evidence:** Cal.com (transactional cleanup), Grafana (fixture teardown), community best practices
- **Anti-pattern:** Relying on `afterEach` hooks for cleanup — fixtures guarantee cleanup even on uncaught exceptions

### S6.4 Use worker isolation for parallel data safety

- Each parallel worker SHOULD create unique, non-conflicting test data
- **Pattern:** Incorporate `workerInfo.workerIndex` or `workerInfo.parallelIndex` into generated identifiers
  ```typescript
  const email = `test-user-${workerInfo.workerIndex}-${Date.now()}@example.com`;
  ```
- **Evidence:** Cal.com uses `workerInfo.workerIndex` + timestamp suffix for email uniqueness; Playwright docs recommend `parallelIndex`-based account pools
- **Anti-pattern:** Shared test accounts across workers — causes authentication conflicts and data races

---

## Anti-Pattern Summary

| Anti-Pattern | What to Do Instead | Severity |
|---|---|---|
| POM inheritance (`extends BasePage`) | Composition via fixtures | High — 0/22 production suites use it |
| Type-based test directories (e2e/ui/api/) | Feature-based directories | Medium — found only in Bronze templates |
| `waitForTimeout()` / `waitForSelector()` | Locator composition with auto-waiting | High — causes flakiness |
| JavaScript config (`.config.js`) | TypeScript config (`.config.ts`) | Medium — loses type safety |
| Multi-env config files (dev.env, qa.env) | `process.env.CI` ternary | Medium — unnecessary complexity |
| Hardcoded test data / shared accounts | Factory functions + worker isolation | High — parallel execution failures |
| `beforeEach` for shared setup | `test.extend<T>()` fixtures | Medium — weaker typing and cleanup |
| `trace: 'on'` in CI | `trace: 'retain-on-failure'` | Low — storage waste |
| Video recording by default | Traces for debugging | Low — traces are richer |
| Monolithic fixture file | Domain-segmented fixtures + `mergeTests()` | Medium — maintainability |

---

## Maturity Spectrum

| Level | Characteristics | Config Indicators | Fixture Indicators | Example |
|---|---|---|---|---|
| **1. Basic** | Flat files, no POM, serial | Single project, flat timeout, HTML reporter | No `test.extend()`, utility functions only | freeCodeCamp |
| **2. Structured** | Feature directories, function helpers | Multiple projects, CI/local branching | Shared kit package, helper functions | AFFiNE |
| **3. Fixture-based** | test.extend(), factories, parallel | Setup projects, multi-reporter, webServer | Factory fixtures, transactional cleanup | Cal.com, Immich |
| **4. Framework** | Published package, custom matchers | withAuth() helper, version-aware selectors | 19+ fixture files, domain segmentation | Grafana plugin-e2e |

Each level is valid — maturity should match project needs, not be pursued for its own sake.

---

---

## Migration Awareness

> Added from cross-validation rounds 50-52.

Suites migrated from other frameworks carry characteristic anti-patterns. Use the standards as a migration checklist:

| Source Framework | Common Debt | Standard Fix | Priority |
|-----------------|-------------|-------------|----------|
| **Puppeteer** | `waitForSelector`, `globalSetup`, JS config | V3.1, SEC1.1, S2.1 | High: V3.1 |
| **Cypress** | `cy.wait()` habits, fixture confusion, single-tab mindset | V3.3, Glossary, V6.1 | High: V3.3 |
| **Selenium** | POM inheritance (`extends BasePage`), explicit waits, CSS selectors | S3.4, V3.1, N7.3 | High: S3.4, V3.1 |

---

## Revision History

| Date | Change | Basis |
|---|---|---|
| 2026-03-18 | Initial draft from landscape rounds 1-12 | 10 Gold suites, 12 Silver, ~97 total sources |
| 2026-03-18 | **DEFINITIVE version** from structure rounds 13-22 | 10 Gold + 5 Silver + 7 Bronze deep-dived, 122+ total sources, validation sweep of 12 additional suites |
| 2026-03-18 | **FINAL version** from cross-validation rounds 51-55 | Added Variant F (actor POM), multi-frontend/CMS notes, ecosystem context, CMS factory pattern, migration awareness; 0 standards reversed |
| 2026-03-19 | **S8-S12 scaling standards** from scaling rounds 72-75, drafting rounds 80-81 | 15 production suites analyzed for scaling patterns; 5 new standard areas (S8-S12) appended |

### Changes from Preliminary to Definitive

- **Promoted to DEFINITIVE** — removed PRELIMINARY label
- **Expanded from 5 to 6 standard areas** — added S5 (Test Grouping) and S6 (Data Management)
- **Expanded S1 (File Organization)** — added `.spec.ts` naming standard, feature-based grouping, page object directory conventions
- **Expanded S2 (Configuration)** — added timeout hierarchy (S2.5), reporter stacking (S2.6), artifact capture (S2.7), four webServer variants
- **Expanded S3 (POM)** — added 5-variant decision framework, canonical constructor pattern, explicit anti-pattern for inheritance, dynamic content handling
- **Expanded S4 (Fixtures)** — added scoping rules, composition mechanisms (`mergeTests`/`mergeExpects`), auth architecture comparison, auto fixtures
- **Added anti-pattern summary table** — consolidated from all rounds
- **Added maturity spectrum** — 4-level framework for self-assessment
- **Zero standards reversed** — all preliminary recommendations confirmed, only expanded

### Changes from Definitive to Final

- Added actor-based POM as Variant F to S3.1 decision framework (Shopware evidence)
- Added multi-frontend and CMS/modular platform notes to S2.3
- Added ecosystem context note to S2.1
- Added CMS configurable-schema factory note to S6.2
- Added migration awareness section
- **Zero standards reversed** — all changes additive

### Changes from Final to S8-S12 Scaling Extension

- Added S8 (Scale Tiers & Transition Triggers) — 4 sub-standards
- Added S9 (Directory & File Scaling) — 6 sub-standards
- Added S10 (Configuration Scaling) — 5 sub-standards
- Added S11 (Fixture & Dependency Scaling) — 5 sub-standards
- Added S12 (Execution Strategy at Scale) — 6 sub-standards
- Updated Anti-Pattern Summary with scaling anti-patterns
- **Evidence basis:** 15 production suites across rounds 72-75 (Grafana, Next.js, n8n, WordPress, Rocket.Chat, freeCodeCamp, Supabase, Element Web, Excalidraw, Slate, Ghost, Immich, Cal.com, Grafana plugin-e2e, AFFiNE)
- **Zero existing standards reversed** — all changes additive, extending S1-S7 to scaling contexts

---

---

## S8. Scale Tiers & Transition Triggers

### S8.1 Recognize four scale tiers with distinct organizational requirements

- Playwright suites fall into four scale tiers, each requiring different organizational strategies
- **Tier definitions:**

| Tier | Test Count | CI Duration | Config Complexity | Key Characteristics |
|---|---|---|---|---|
| **Small** | 1-50 | <5 min | 30-60 LOC | Default parallelism, 2-4 browser projects, single CI job |
| **Medium** | 50-200 | 5-20 min | 60-120 LOC | Auth setup project, CI/local differentiation, feature directories begin |
| **Large** | 200-1000 | 20-40 min | 120-400 LOC | Multi-project config, sharding, fixture segmentation, tiered execution |
| **Enterprise** | 1000-5000+ | 40+ min | 400+ LOC (or distributed) | CI-level orchestration, timing optimization, selective execution |

- **Evidence:**
  - Small: Excalidraw (~30 specs), Slate (~25 specs) — default parallelism, single CI job
  - Medium: Ghost (81 specs), Immich (90+ specs), freeCodeCamp (126 specs) — auth setup, CI/local branching
  - Large: Grafana (163+ specs, 30 projects), n8n (174 specs), Rocket.Chat (170 specs), WordPress (278 specs) — multi-project configs, sharding begins
  - Enterprise: Next.js (550+ dirs, 84 shards) — CI orchestration, timing-based distribution
- **Anti-pattern:** Treating all suite sizes identically — a 500-test suite run with single-shard default parallelism wastes CI resources and developer time

### S8.2 Use measurable triggers to initiate tier transitions

- Tier transitions SHOULD be driven by measurable thresholds, not subjective judgment
- **Transition trigger matrix:**

| Transition | Primary Trigger | Secondary Triggers | Evidence |
|---|---|---|---|
| Small -> Medium | CI duration approaching 5 min | 20+ test files, first auth-dependent test, first flaky test | Grafana, Ghost |
| Medium -> Large | CI duration exceeding 15-20 min | Config exceeding 150 LOC, 3+ auth roles, 10+ specs per feature dir | Supabase, Element Web |
| Large -> Enterprise | CI duration exceeding 40 min | Multiple teams writing tests, shard imbalance >2x, full-suite-on-PR fatigue | Next.js |

- **Concrete restructuring triggers:**
  - **File count:** Flat-to-nested directories at 20-30 test files [S9.1]
  - **CI time:** Begin sharding when single-agent CI exceeds 5 minutes [S12.1]
  - **Team count:** Establish test infrastructure ownership when 3+ teams write tests
  - **Config size:** Extract helper functions or split config when exceeding 150 LOC
- **Evidence:** Transition triggers documented across 15 suites in rounds 72-75. Suites that delay transitions accumulate organizational debt (freeCodeCamp: 126 flat files; Rocket.Chat: 170 specs with 1 worker)
- **Anti-pattern:** Waiting until pain is acute before restructuring — restructuring under pressure leads to incomplete migration and inconsistent patterns

### S8.3 Anticipate pain points at each tier boundary

- Each tier transition introduces predictable pain points with known solutions
- **Small -> Medium (crossing ~50 tests):**
  1. **Auth management:** Tests that manually log in become slow (2-3s per test x 50 = 2+ min wasted). Fix: auth setup project with `storageState` [S4.4]
  2. **Test data collisions:** Parallel workers create/read conflicting data. Fix: unique test data per test (timestamps, UUIDs) [S6.4]
  3. **Reporter noise:** Default `list` reporter becomes unreadable at 50+ tests in CI. Fix: `github` reporter for CI, `html` for local [S2.6]
  4. **Flaky test awareness:** At 2% flake rate, ~1 flaky test per run. Fix: CI retries (`retries: 2`) and flake monitoring [V4]
- **Medium -> Large (crossing ~200 tests):**
  1. **CI duration:** Single-job execution exceeds 15-20 min. Fix: sharding [S12.1]
  2. **Config complexity:** Single project with flat `testDir` loses organization. Fix: multi-project config with per-project `testDir` [S10.1]
  3. **Fixture monolith:** Single fixture file exceeds 100+ lines. Fix: fixture segmentation [S11.2]
  4. **Page object proliferation:** POM files multiply without ownership. Fix: POM directories mirroring feature directories [S1.3]
  5. **Flaky accumulation:** At 200+ tests, ~4+ flaky tests per run at 2% rate. Fix: flakiness reporter, quarantine process [V4]
- **Large -> Enterprise (crossing ~500 tests):**
  1. **Shard imbalance:** Static allocation leads to uneven durations. Fix: timing-based shard assignment [S12.5]
  2. **Full-suite-on-PR fatigue:** Running 500+ tests on every PR is wasteful. Fix: selective execution [S12.5]
  3. **Config monolith:** Single config exceeds 400 lines. Fix: CI-level orchestration or multi-config [S10.2]
  4. **Infrastructure ownership:** Framework needs dedicated ownership. Fix: test infrastructure team or rotation
  5. **Cross-team coordination:** Multiple teams writing against same infrastructure. Fix: shared utilities with API contracts [S11.4]
- **Evidence:** Pain points documented from both positive exemplars (Grafana, n8n) and negative exemplars (Rocket.Chat serial execution, freeCodeCamp flat structure) across rounds 72-75

### S8.4 Use the scaling decision tree for tier identification

- Teams SHOULD use measurable indicators to determine their current tier and needed actions
- **Decision tree:**

| Question | If YES | If NO |
|---|---|---|
| Do you have >50 tests? | Proceed to Medium checks | Stay at Small tier |
| Is CI duration >5 min? | Begin Medium tier transitions (auth setup, feature dirs) | Monitor, defer restructuring |
| Do you have >200 tests? | Proceed to Large checks | Stay at Medium tier |
| Is CI duration >20 min? | Begin Large tier transitions (sharding, multi-project, fixture split) | Monitor, defer restructuring |
| Do you have >500 tests? | Proceed to Enterprise checks | Stay at Large tier |
| Are multiple teams writing tests? | Begin Enterprise transitions (ownership, selective exec) | Scale within Large tier patterns |

- **Evidence:** Decision tree synthesized from transition patterns observed across 15 suites (rounds 72-75)
- **Valid alternative:** Teams may proactively adopt higher-tier patterns early if growth trajectory is clear — Cal.com used feature directories from inception regardless of test count

---

## S9. Directory & File Scaling

### S9.1 Restructure from flat to nested directories at 20-30 test files

- Suites SHOULD transition from flat to feature-nested directory organization when reaching 20-30 test files
- **Signal:** Developers struggle to find relevant test files. Naming conventions become strained with feature prefixes (`auth-login.spec.ts`, `auth-signup.spec.ts`)
- **Recommended transition:**
  ```
  BEFORE (flat, <20 files):
    e2e/
      auth-login.spec.ts
      auth-signup.spec.ts
      dashboard-create.spec.ts
      dashboard-edit.spec.ts

  AFTER (nested, 20+ files):
    e2e/
      auth/
        login.spec.ts
        signup.spec.ts
      dashboard/
        create.spec.ts
        edit.spec.ts
  ```
- **Evidence:**
  - Grafana moved to `-suite/` directories when test count grew beyond visual scanning
  - Cal.com organizes by feature from the start (`auth/`, `eventType/`, `team/`)
  - freeCodeCamp maintains flat structure at 126 files — functional but creates discovery friction
  - Rocket.Chat has 75 spec files in a flat directory — a candidate for restructuring
- **Cost of not transitioning:** Slower test discovery, harder code review (which tests are affected by a change?), CODEOWNERS becomes impractical
- **Valid alternative:** Flat organization with descriptive filenames — viable for suites that will not grow beyond ~50 files (see freeCodeCamp)
- **Anti-pattern:** Flat directory at 75+ files without clear naming conventions — creates discovery and ownership friction (Rocket.Chat, freeCodeCamp)

### S9.2 Split feature directories into sub-feature directories at 10-15 spec files

- Feature directories SHOULD be split into sub-feature directories when they accumulate 10-15 spec files
- **Signal:** A single feature directory contains specs covering distinct sub-features of the same domain
- **Recommended transition:**
  ```
  BEFORE (10+ specs in one feature dir):
    e2e/dashboard/
      create.spec.ts
      edit.spec.ts
      variables.spec.ts
      permissions.spec.ts
      sharing.spec.ts
      templating.spec.ts
      layout.spec.ts
      filters.spec.ts
      annotations.spec.ts
      versions.spec.ts
      export.spec.ts

  AFTER (sub-feature split):
    e2e/dashboard/
      crud/
        create.spec.ts
        edit.spec.ts
        export.spec.ts
        versions.spec.ts
      configuration/
        variables.spec.ts
        templating.spec.ts
        annotations.spec.ts
      access/
        permissions.spec.ts
        sharing.spec.ts
      display/
        layout.spec.ts
        filters.spec.ts
  ```
- **Evidence:**
  - Grafana `dashboards-suite/` has sub-tests for creation, editing, variables, templating, permissions
  - n8n organizes 28 categories in deep directory nesting
  - Rocket.Chat has 75 flat specs that would benefit from sub-feature directories
- **Anti-pattern:** Feature directories with 15+ spec files — loses the organizational benefit of nesting

### S9.3 Split spec files at 200 lines or 10 tests

- Individual spec files SHOULD be split when they exceed 200 lines or contain 10+ tests
- **Rationale:**
  1. Sharding effectiveness: Playwright's default sharding is file-level; large files create shard imbalance
  2. Readability: Files with 10+ tests typically cover multiple distinct user workflows that deserve separation
  3. Code review: Smaller files produce focused diffs
- **Recommended threshold:** Split when a file exceeds 200 lines OR 10 tests OR covers more than 2 distinct user workflows
- **Evidence:**
  - Grafana keeps spec files focused: typically 3-8 tests per file
  - n8n averages 4-6 tests per file
  - Community consensus: files with 10+ tests indicate multiple concerns bundled together
- **Anti-pattern:** Spec files with 10-20+ tests spanning unrelated workflows — observed in freeCodeCamp and Rocket.Chat suites

### S9.4 Align directory names with Playwright project names

- Directory names SHOULD match Playwright project names in a 1:1 mapping
- When `testDir` points to a directory, the project name should match the directory name
- **Pattern:**
  ```typescript
  // Project name matches directory name
  { name: 'dashboards', testDir: path.join(testDirRoot, 'dashboards-suite') }
  { name: 'alerting', testDir: path.join(testDirRoot, 'alerting-suite') }
  ```
- **Evidence:** Grafana maintains a 1:1 mapping across all 30 projects. No aliasing or indirection — the project name immediately tells you where the tests live.
- **Rationale:** Eliminates cognitive mapping between project names in config and directory names on disk. Simplifies CODEOWNERS, CI filtering, and test discovery.
- **Anti-pattern:** Project names that diverge from directory names — forces developers to consult config to locate tests (Rocket.Chat: 1 project for 75 flat files)

### S9.5 Place cross-feature tests in a dedicated shared directory

- Tests that exercise workflows spanning multiple features SHOULD be placed in a dedicated directory rather than arbitrarily under one feature
- **Recommended names:** `workflows/`, `integration/`, or `cross-feature/`
- **Pattern:**
  ```
  e2e/
    auth/           # Auth-specific tests
    dashboard/      # Dashboard-specific tests
    workflows/      # Tests spanning auth + dashboard + reporting
  ```
- **Rationale:** Cross-feature tests placed under a single feature directory create misleading ownership signals. A dedicated directory makes their cross-cutting nature explicit.
- **Evidence:** Grafana uses CUJ (Critical User Journey) chains as dedicated projects (`dashboard-cujs-setup`, `dashboard-cujs`, `dashboard-cujs-teardown`). n8n uses a composables layer to encapsulate cross-page workflows. No suite places cross-feature tests randomly under a single feature.
- **Valid alternative:** Place cross-feature tests under the primary feature they initiate, with a clear naming convention (e.g., `auth/full-onboarding-flow.spec.ts`) — acceptable when cross-feature tests are few (<5)

### S9.6 Use per-package test directories in monorepo configurations

- Monorepo projects SHOULD maintain per-package test directories with package-level Playwright configs
- **Pattern variants:**

| Variant | Structure | Evidence |
|---|---|---|
| **Package-scoped tests** | `packages/app-a/e2e/`, `packages/app-b/e2e/` | AFFiNE (`affine-local/`, `affine-cloud/`, `affine-desktop/`) |
| **Centralized E2E package** | `packages/e2e-tests/` | Ghost (`ghost/core/test/e2e-browser/`) |
| **Shared test infrastructure** | `packages/testing/playwright/` | n8n (tests + fixtures + services in one package) |

- **Guidance:**
  - Use **package-scoped** when packages are independently deployable with separate UIs
  - Use **centralized** when E2E tests cross package boundaries and test the integrated application
  - Use **shared infrastructure** when test utilities (fixtures, POMs, services) need to be shared across multiple test packages
- **Evidence:** AFFiNE (3 deployment targets as packages), Ghost (centralized E2E for monorepo), n8n (testing as shared infrastructure package)
- **Anti-pattern:** Scattering test utilities across packages without a shared infrastructure package — leads to duplicated fixtures and inconsistent patterns

---

## S10. Configuration Scaling

### S10.1 Use config-level orchestration with helper functions for Large suites

- Large suites (200-1000 tests) SHOULD use a single `playwright.config.ts` with helper functions to manage project definitions
- **The Grafana model:** Single config file, 30 projects, managed through:
  1. **`withAuth()` helper:** Adds `storageState` and `authenticate` dependency to any project definition
  2. **`baseConfig` object spreading:** Prevents duplication of common settings across projects
  3. **Root path variables:** `testDirRoot` and `pluginDirRoot` eliminate repeated path construction
  4. **Project naming conventions:** 1:1 mapping to directory names
- **When it works:** Monolith applications with many feature domains tested against a single deployment
- **Evidence:** Grafana proves 30 projects in one config is maintainable when:
  1. Helper functions eliminate per-project boilerplate
  2. Directory conventions are strict (each project = one directory)
  3. Project naming mirrors directory names
  4. Dependency graphs are shallow (max depth 2-3)
- **Config LOC guidance:** Config-level orchestration works up to ~400 LOC with good helper functions
- **Anti-pattern:** 30 projects defined inline without helper functions — creates a 400+ LOC config file with massive duplication

### S10.2 Use CI-level orchestration for Enterprise suites

- Enterprise suites (1000+ tests) SHOULD move orchestration complexity from Playwright config to CI workflow definitions
- **The Next.js model:** Simple per-directory Playwright configs with complexity in CI YAML:
  1. CI matrix defines shard count per test group
  2. `fetch-test-timings` job retrieves historical execution data
  3. Custom runner distributes tests based on timing data
  4. Multi-dimension matrix (framework x browser x Node version)
  5. Conditional execution (documentation-only changes skip tests, PR labels gate expensive dimensions)
- **When it works:** Monorepo frameworks with independent test directories, or any suite where static Playwright sharding produces imbalanced shard durations
- **Evidence:** Next.js uses 84 shards across 33 workflow files with timing-based distribution. Config files remain simple; CI YAML handles orchestration.
- **Key difference from S10.1:** Config-level orchestration keeps complexity in one file (config). CI-level orchestration distributes complexity across CI YAML but keeps each config file simple.
- **Anti-pattern:** Attempting to manage 500+ tests through a single Playwright config without CI-level support — the config becomes unmaintainable and static sharding produces imbalanced durations

### S10.3 Use dynamic project generation for infrastructure-variant testing

- Suites testing the same features across different infrastructure configurations SHOULD generate projects dynamically
- **The n8n model:** Separate `playwright-projects.ts` file generates 5-7 projects based on environment:
  - **Local mode** (when `BACKEND_URL` is set): Single `e2e` project, excludes container-only tests
  - **Container mode** (CI): Multiple variants per backend (sqlite, postgres, queue, multi-main) x test type (e2e, infrastructure, benchmark)
- **When it works:** Applications that deploy across multiple backends (database engines, deployment modes, cloud vs self-hosted) and need to verify behavior across all variants
- **Evidence:** n8n generates projects based on infrastructure topology, not features. This is the opposite of Grafana (feature-based projects). n8n tests the same features across sqlite, postgres, queue, and multi-main deployment modes.
- **Pattern:**
  ```typescript
  // playwright-projects.ts (separate from main config)
  export function generateProjects(env: string): Project[] {
    if (env === 'local') return [{ name: 'e2e', testDir: './tests' }];
    return backends.flatMap(backend => [
      { name: `${backend}:e2e`, testDir: './tests', ... },
      { name: `${backend}:infrastructure`, testDir: './tests/infra', ... },
    ]);
  }
  ```
- **Anti-pattern:** Duplicating project definitions for each infrastructure variant — dynamic generation with a single source of truth prevents configuration drift between variants

### S10.4 Apply config DRY patterns to reduce project definition duplication

- Multi-project configurations SHOULD use helper patterns to eliminate boilerplate
- **Four confirmed DRY patterns (in order of adoption):**

| Pattern | Mechanism | Best For | Evidence |
|---|---|---|---|
| **`withAuth()` helper** | Function wraps project definition with `storageState` and `dependencies` | Any multi-project config with auth | Grafana |
| **`baseConfig` spreading** | Shared object spread into each project definition | Common settings (browser, viewport, timeouts) | Grafana |
| **Separate projects file** | Project definitions extracted to dedicated `.ts` file | Configs exceeding 150 LOC | n8n (`playwright-projects.ts`) |
| **Config extension** | Import and extend a base config from a package | Ecosystem platforms with shared config | WordPress (`@wordpress/scripts`) |

- **Evidence:**
  - Grafana `withAuth()`: Eliminates 3-4 lines of repeated auth config per project across 30 projects
  - n8n `playwright-projects.ts`: Reduces main config to ~50 LOC by extracting project generation
  - WordPress: Extends config from `@wordpress/scripts` package for consistent settings across plugin ecosystem
- **Anti-pattern:** Repeating `storageState`, `dependencies`, and base config settings in every project definition — creates maintenance burden and increases risk of inconsistent configuration

### S10.5 Split configuration when single-file config exceeds 400 LOC

- Single-file Playwright configuration SHOULD be split or refactored when exceeding ~400 LOC
- **Splitting strategies (in order of preference):**
  1. **Extract helper functions** (first step): Move `withAuth()`, `baseConfig`, path helpers to a `playwright-helpers.ts` file
  2. **Extract project definitions** (second step): Move project array to `playwright-projects.ts` (n8n pattern)
  3. **Multiple config files** (last resort): One config per application area, each with its own `testDir` — used only in monorepo contexts or when CI-level orchestration (S10.2) replaces config-level orchestration
- **Thresholds:**
  - 150 LOC: Consider extracting helper functions
  - 300 LOC: Extract project definitions to separate file
  - 400+ LOC: Evaluate CI-level orchestration (S10.2) or multi-config approach
- **Evidence:**
  - Grafana: ~400 LOC in one file, manageable only because of helper functions
  - Next.js: Distributed across per-directory configs + CI YAML (post-400 LOC threshold)
  - n8n: Main config ~50 LOC + separate projects file — effective split
- **Anti-pattern:** A single 400+ LOC config without helper functions or project extraction — becomes difficult to review, modify, and debug

---

## S11. Fixture & Dependency Scaling

### S11.1 Scale fixture investment proportionally to suite size

- Fixture depth SHOULD increase with suite scale — deeper fixture layering correlates with shorter, more maintainable tests
- **Correlation evidence:**

| Suite | Fixture Depth | Avg Test Length | Interpretation |
|---|---|---|---|
| n8n | 5 layers (infra -> service -> fixture -> POM -> composable) | 10-30 lines | Deep investment produces concise tests |
| Grafana plugin-e2e | 3 layers (auth -> config -> test), 25+ fixtures | 15-40 lines | High investment, moderate test length |
| WordPress | 4 layers (admin -> editor -> page -> request), 62 files | 15-80 lines | Published package, variable test length |
| Ghost | 3 layers (factory -> util -> test) | 20-50 lines | Factory pattern, moderate tests |
| Rocket.Chat | 2 layers (POM -> test) | 30-80 lines | Shallow investment, longest tests |

- **Recommended fixture layers by tier:**
  - Small (1-50 tests): 1-2 layers (utility functions + optional thin POMs)
  - Medium (50-200 tests): 2-3 layers (fixtures + POMs + utilities)
  - Large (200-1000 tests): 3-4 layers (fixtures + POMs + services + factories)
  - Enterprise (1000+ tests): 4-5 layers (infrastructure + services + fixtures + POMs + composables or published package)
- **Evidence:** 5 suites across rounds 73-75 demonstrate the inverse correlation between fixture depth and test length
- **Anti-pattern:** Shallow fixture investment at scale (2 layers at 200+ tests) — forces test logic into test files, producing long, duplicative tests (Rocket.Chat: 30-80 line tests with repeated setup)

### S11.2 Segment fixtures by environment scope and module boundary

- Fixture files SHOULD be split when they exceed 100 lines or serve distinct environments
- **Segmentation pattern:**
  ```
  fixtures/
    base.ts          # Core fixtures: auth, navigation, DB, common POMs
    admin.ts         # Admin-role specific fixtures and POMs
    cloud.ts         # Cloud-environment specific fixtures
    performance.ts   # Performance test specific fixtures
  ```
- **Segmentation triggers:**
  - Fixture file exceeds 100 lines
  - 3+ auth roles require distinct fixture sets
  - 2+ environments (cloud, self-hosted) need different fixture wiring
  - Performance tests require specialized fixtures (metrics, budgets)
- **Evidence:**
  - n8n splits into `base.ts` + `cloud-only.ts` when cloud-specific fixtures accumulated
  - Grafana plugin-e2e splits fixtures by role (admin, viewer) and capability (feature flags)
  - Supabase maintains a single fixture file at ~177 tests — approaching the split threshold
- **Pattern:** Tests opt into the fixture tier they need via imports:
  ```typescript
  // Base tests import base fixtures
  import { test } from '../fixtures/base';
  // Cloud tests import cloud-extended fixtures
  import { test } from '../fixtures/cloud';
  ```
- **Anti-pattern:** Single monolithic fixture file at 100+ LOC with unrelated concerns — admin auth, cloud config, performance metrics all in one file

### S11.3 Consider a composables layer above page objects for multi-page workflows (emerging practice)

- Suites with tests that orchestrate interactions across multiple pages MAY benefit from a composables abstraction layer
- **The composables pattern:** A layer above page objects that encapsulates multi-page workflow logic. A composable like "execute workflow and verify output" might touch the canvas page, the execution panel, and the output viewer — preventing tests from containing cross-page orchestration logic.
- **Layer position:**
  ```
  Infrastructure (config, global setup)
    -> Services (API helpers, REST clients)
      -> Fixtures (Playwright fixture injection)
        -> Page Objects (single-page UI encapsulation)
          -> Composables (multi-page workflow orchestration)  <-- this layer
  ```
- **When to consider:**
  - Tests routinely orchestrate 3+ page objects in sequence
  - The same multi-page workflow appears in 3+ tests
  - Test files contain significant orchestration logic between page object calls
- **Evidence:** n8n implements this pattern — unique among all 15 analyzed suites. The composables directory encapsulates cross-page workflows (e.g., "build workflow, execute, verify output").
- **Caveat:** This is an **emerging practice** based on a single suite (n8n). The pattern addresses a real problem (cross-page orchestration logic in tests) but has not been validated across multiple independent suites. Teams should evaluate whether their multi-page workflow complexity justifies the additional abstraction layer.
- **Valid alternative:** Keeping orchestration in test files using `test.step()` for readability — acceptable when cross-page workflows are few or simple

### S11.4 Reserve published utility packages for ecosystem platforms only

- Test utilities SHOULD be published as npm packages only when the test infrastructure serves an ecosystem of external consumers (plugins, themes, extensions)
- **When justified:**
  - External developers need standardized test abstractions for the platform
  - Test utilities represent a stable API that changes infrequently
  - The platform has a plugin/extension ecosystem that writes Playwright tests
- **Evidence:** WordPress `@wordpress/e2e-test-utils-playwright` (62 source files) is the only suite where published utilities make sense — external WordPress plugin developers consume the package to write standardized E2E tests. The package exports pre-wired fixtures so consumers write `test('...', ({ admin, editor, requestUtils }) => { ... })` with zero boilerplate.
- **Cost of publishing:**
  - API stability requirements (breaking changes affect external consumers)
  - Documentation maintenance (62 files need usage guides)
  - Versioning discipline (tied to platform release cycle)
  - Test coverage of the utilities themselves
- **Anti-pattern:** Publishing a test utilities package for a single-product suite — the overhead of API stability, documentation, and versioning outweighs the benefit. Keep fixtures internal.
- **Valid alternative for multi-team organizations:** Shared internal npm package (not published to public registry) — lower API stability burden, still provides consistent test infrastructure across teams

### S11.5 Prevent circular dependencies between fixture modules

- Fixture modules MUST maintain a strict dependency direction: infrastructure -> services -> fixtures -> page objects -> composables
- **Prevention strategies:**
  1. **One-way imports:** Each layer only imports from the layer below it. Composables import page objects; page objects import fixtures; fixtures import services.
  2. **Barrel exports:** Each layer has an `index.ts` that defines its public API. Upstream layers import only from the barrel, never from internal files.
  3. **Dependency linting:** Use ESLint `import/no-cycle` rule or TypeScript project references to enforce layer boundaries at build time.
- **Evidence:** n8n's 5-layer architecture maintains strict one-way dependencies. Grafana plugin-e2e uses barrel exports across its 25+ fixture files. No analyzed suite with 3+ fixture layers exhibits circular dependencies.
- **Anti-pattern:** Page objects importing from composables, or fixtures importing from test files — creates tight coupling and makes refactoring impossible

---

## S12. Execution Strategy at Scale

### S12.1 Progress through five execution stages as suite scale grows

- Execution strategy SHOULD evolve through five stages aligned with suite scale
- **Stage definitions:**

| Stage | Test Count | CI Duration | Strategy | Key Actions |
|---|---|---|---|---|
| **1. Default parallel** | 0-50 | <5 min | `fullyParallel: true`, default workers | No explicit execution strategy needed |
| **2. Tuned parallelism** | 50-100 | 5-10 min | Explicit workers, `maxFailures`, CI retries | Set `workers: process.env.CI ? 4 : undefined`, add `retries: process.env.CI ? 2 : 0` |
| **3. Sharding** | 100-200 | 10-20 min | `--shard=N/M` with CI matrix | Add matrix strategy, blob reporter, merge step |
| **4. Tiered execution** | 200-500 | 20-40 min | Smoke on PR, full on merge | Dedicated smoke project/directory, CI-trigger differentiation |
| **5. Orchestrated execution** | 500+ | 40+ min | Timing-based sharding, selective execution | `fetch-test-timings`, `--only-changed`, multi-dimension matrix |

- **Evidence:**
  - Stage 1: Excalidraw, Slate — default parallelism, single CI job
  - Stage 2: Ghost (1 worker, conservative), Immich (default workers + 4 retries CI)
  - Stage 3: Supabase (177 tests, 2 shards), Element Web (209 specs, CI matrix)
  - Stage 4: Grafana (smoke project), Element Web (two-tier CI)
  - Stage 5: Next.js (84 shards, timing-based, React version matrix)
- **Anti-pattern:** Remaining at Stage 1 (default parallel) with 200+ tests — wastes CI time and developer productivity

### S12.2 Begin sharding at 100 tests or 5 minutes CI duration

- Suites SHOULD introduce sharding when test count reaches ~100 or single-agent CI duration exceeds 5 minutes
- **Sharding formula:**
  ```
  shardCount = Math.ceil(testCount / 40)
  ```
  Target: ~40 tests per shard. Adjust based on test duration variance.
- **Implementation checklist:**
  1. Enable `fullyParallel: true` (essential — without it, Playwright shards at file level, causing imbalanced distribution)
  2. Add CI matrix strategy: `matrix: { shard: [1/4, 2/4, 3/4, 4/4] }`
  3. Use blob reporter in CI: `reporter: process.env.CI ? 'blob' : 'html'`
  4. Add merge step after all shards complete: `npx playwright merge-reports`
- **Evidence:**
  - Supabase: 177 tests, 2 shards (~88 tests per shard — above 40 target, room for improvement)
  - Element Web: 209 specs, CI matrix sharding
  - Community consensus: Start sharding when CI exceeds 5 minutes on a single agent
- **Anti-pattern:** Adding workers but not shards beyond 100 tests — workers help within a machine but cannot exceed core count. Sharding distributes across machines.

### S12.3 Treat serial execution at 50+ tests as an anti-pattern

- Suites with 50+ tests running with `workers: 1` MUST investigate and resolve the underlying isolation problem
- **Root cause:** Serial execution (`workers: 1`) at scale is always caused by shared state between tests — database state, session state, global variables, or external service state
- **Evidence:**
  - Rocket.Chat: 170 specs, 1 worker, 30+ minute CI runs. Root cause: shared state between tests
  - WordPress: 278 specs, 1 worker, excessive CI time. Root cause: shared state between tests
  - Both suites could cut CI time by 60-75% with parallel execution
- **Resolution path:**
  1. Identify shared state (database, session, global variables)
  2. Implement per-worker isolation (per-worker DB setup, per-test data creation) [S6.4]
  3. Gradually increase worker count, monitoring for flakiness
  4. Target `fullyParallel: true` with default workers (half CPU cores)
- **Rationale:** The fix is test isolation, not serialization. Serialization masks the real problem and becomes increasingly expensive as tests accumulate.
- **Anti-pattern:** Accepting `workers: 1` as a permanent configuration for suites with 50+ tests — this is a symptom, not a solution

### S12.4 Implement tiered execution at 200+ tests using structural tiers

- Suites with 200+ tests SHOULD implement tiered execution: fast feedback on PRs, comprehensive coverage on merge
- **Tiered execution approaches (in order of preference):**

| Approach | Mechanism | Maintenance | Evidence |
|---|---|---|---|
| **Project-based** | Dedicated `smoke` project in config | Low — structural, self-documenting | Grafana (smoke as project) |
| **Directory-based** | `smoke/` directory maps to smoke project | Low — structural, discoverable | Grafana (directory maps to project) |
| **CI-trigger-based** | Different workflows for PR vs merge events | Medium — CI YAML maintenance | Element Web |
| **Tag-based** | `@smoke` tag + `--grep` filter | High — tags rot without discipline | Community guidance (0/15 production suites use this) |

- **Recommended tier structure:**

| Tier | Trigger | Duration Target | Scope |
|---|---|---|---|
| **Smoke** | Every PR | 2-5 min | Critical paths, login, core CRUD |
| **Full** | Merge to main | 10-20 min | All tests, single browser |
| **Cross-browser** | Nightly/weekly schedule | 30-60 min | All tests, all target browsers |

- **Evidence:**
  - Grafana: `smoke` as a dedicated project (structural tier, not tag-based)
  - Element Web: Two-tier CI (fast on PR, comprehensive on merge)
  - Production adoption gap: only 2/15 suites implement true tiered execution despite the need being clear at 200+ tests
- **Anti-pattern:** `@smoke` tags without enforcement discipline — tags rot as tests change; the smoke suite drifts from the critical path. 0/15 analyzed production suites use tag-based smoke selection.

### S12.5 Add selective test execution at 500+ tests

- Enterprise suites (500+ tests) SHOULD implement selective test execution to avoid running the full suite on every PR
- **Three implementation patterns:**

| Pattern | Mechanism | Coverage | Complexity | Version Requirement |
|---|---|---|---|---|
| **Playwright-native** | `npx playwright test --only-changed=main` | Import-graph aware | Low | Playwright v1.46+ |
| **Tag-grep mapping** | Detect changed modules via `git diff`, map to tags, run `--grep` | Explicit mapping | Medium | Any version |
| **File-path filtering** | `git diff --name-only -- '*.spec.ts'` | Test files only | Low | Any version |

- **Recommended two-stage CI:**
  1. PR stage: `--only-changed` (fast, affected tests only)
  2. Merge/nightly stage: Full suite (complete coverage)
- **Playwright-native `--only-changed` requirements:**
  - `fetch-depth: 0` in CI checkout for full git history
  - Import graph analysis finds affected test files (not just changed test files)
- **Evidence:** Next.js (selective execution at enterprise scale), Playwright v1.46+ release notes (`--only-changed` flag)
- **Anti-pattern:** Running the full suite on every PR at 500+ tests — slow PR feedback (15+ minutes), CI resource waste, developer frustration leading to bypassing E2E checks

### S12.6 Use CODEOWNERS for test directory ownership at scale

- Suites with feature-based directories and multiple contributing teams SHOULD define CODEOWNERS for test directories
- **Pattern:**
  ```
  # .github/CODEOWNERS
  /e2e/auth/          @team-identity
  /e2e/dashboard/     @team-dashboards
  /e2e/alerting/      @team-alerting
  /e2e/workflows/     @team-platform    # Cross-feature tests owned by platform team
  /playwright.config.ts  @test-infra-team
  /fixtures/          @test-infra-team
  ```
- **When to implement:**
  - 3+ teams contributing tests
  - Feature-based directory structure in place (S9.1)
  - Test infrastructure requires dedicated ownership
- **Rationale:** Without CODEOWNERS, test directories become "everyone's responsibility, nobody's ownership." Changes to shared fixtures or config lack review from infrastructure owners.
- **Evidence:** Grafana's 30-project structure with 1:1 directory-project mapping enables per-directory ownership. Next.js multi-team structure requires infrastructure-level ownership for CI workflow files.
- **Anti-pattern:** No CODEOWNERS for test directories when 3+ teams contribute — leads to inconsistent patterns, broken fixtures merged without review, and eroding test quality

---

## Scaling Anti-Pattern Summary

| Anti-Pattern | What to Do Instead | Severity | Evidence |
|---|---|---|---|
| Flat directory at 75+ files | Feature-based directories [S9.1] | Medium — discovery friction | Rocket.Chat, freeCodeCamp |
| Serial execution (`workers: 1`) at 50+ tests | Fix test isolation, enable parallelism [S12.3] | High — 60-75% CI time waste | Rocket.Chat, WordPress |
| No sharding at 100+ tests | Shard with `ceil(N/40)` formula [S12.2] | Medium — single-machine bottleneck | Community consensus |
| Full suite on every PR at 500+ tests | Selective execution [S12.5] | Medium — developer frustration | 9/15 suites lack this |
| Tag-based smoke without discipline | Structural tiering (project/directory) [S12.4] | Medium — tags rot over time | 0/15 suites use tag smoke |
| 30+ inline project definitions without helpers | Config DRY patterns [S10.4] | Medium — config duplication | Grafana (positive: uses helpers) |
| Published test utility package for single product | Keep fixtures internal [S11.4] | Low — unnecessary overhead | WordPress (justified: ecosystem) |
| Shallow fixtures (2 layers) at 200+ tests | Invest in 3-4+ fixture layers [S11.1] | Medium — long, duplicative tests | Rocket.Chat |
