# Structure Standards

> **DEFINITIVE** — validated across 10 Gold-standard suites, 5 Silver suites, 7+ community suites, and 25+ documentation sources (rounds 1-22, 122+ total sources)

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

## Revision History

| Date | Change | Basis |
|---|---|---|
| 2026-03-18 | Initial draft from landscape rounds 1-12 | 10 Gold suites, 12 Silver, ~97 total sources |
| 2026-03-18 | **DEFINITIVE version** from structure rounds 13-22 | 10 Gold + 5 Silver + 7 Bronze deep-dived, 122+ total sources, validation sweep of 12 additional suites |

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
