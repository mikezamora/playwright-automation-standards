# Structural Patterns

## Overview

This document consolidates structural patterns observed across 10 Gold-standard Playwright suites, 5 Silver suites, 7+ Bronze/community suites, and 25+ documentation sources during the landscape phase (rounds 1-11), refined with deep-dive analysis from the structure phase (rounds 13-20), and validated with a 12-suite sweep in round 21.

**Status:** FINAL — Updated with rounds 21-22 findings. All open questions resolved. Definitive structure standards published.

---

## Confirmed Patterns (Rounds 13-16 Deep Dives)

### 1. Configuration File Patterns

**Pattern: TypeScript-only configuration**
- Frequency: 10/10 Gold suites use `playwright.config.ts` (never `.js`)
- Confirmed across all 10 deep-dive suites + 2 additional (Slate, playwright-ts)
- Evidence: [grafana-e2e], [calcom-e2e], [affine-e2e], [immich-e2e], [playwright-official], [freecodecamp-e2e], [grafana-plugin-e2e], [slate], [playwright-ts]

**Pattern: Environment-aware configuration**
- Frequency: 12/12 suites implement CI vs. local conditional logic
- Implementation: `process.env.CI ? ciValue : localValue` — universal mechanism, no suite uses .env files or dotenv for CI/local split
- **Confirmed divergent strategies:**
  - Cal.com: 60s CI / 240s local (shorter in CI — "dev servers are slow locally")
  - AFFiNE: 50s CI / 30s local (longer in CI — "CI environments are less predictable")
  - Grafana: 10s expect timeout globally (no CI/local split for timeouts)
  - Immich: 4 retries CI / 0 local (highest retry count — Docker variability)
  - freeCodeCamp: 15s flat timeout, `maxFailures: 6` in CI
  - Slate: 5 retries CI / 2 local, fullyParallel inverted (true local, false CI)

**Pattern: Multi-project configuration**
- Frequency: 12/12 suites define multiple Playwright projects
- **Confirmed range:** 2 projects (Playwright) to 31 projects (Grafana, updated count)
- **Project count correlates with application complexity:**
  - Grafana: 31 (auth setup + viewer setup + 12 data sources + 12 features + CUJS chain + unauthenticated)
  - Cal.com: 7 (app + packages + cross-browser embeds)
  - freeCodeCamp: 6 (setup + 5 browsers)
  - Grafana plugin-e2e: 5 (auth + admin + admin-wide + viewer)
  - Slate: 3-4 (Chromium + Firefox + Mobile + conditional WebKit)
  - Immich: 3 (web + ui + maintenance)
  - Playwright: 2 (playwright-test + image_tools)

**Pattern: `webServer` auto-start**
- Frequency: 7/12 suites
- Convention: `reuseExistingServer: !process.env.CI` (fresh in CI, reuse locally) — near-universal
- **Four architectural variants (NEW — Round 18):**
  - **Pattern A — App server**: Cal.com (3 ports), AFFiNE (yarn workspace)
  - **Pattern B — Conditional server**: Grafana (only when `GRAFANA_URL` not set)
  - **Pattern C — Infrastructure server**: freeCodeCamp (Mailpit for email testing)
  - **Pattern D — Full-stack orchestration**: Immich (Docker Compose with `--renew-anon-volumes`)

### 2. Directory Structure Patterns

**Pattern: Dedicated test directory at project root**
- Frequency: 12/12 suites
- **Confirmed variants with frequencies:**
  - `e2e/` — Cal.com, Immich, freeCodeCamp (3/12)
  - `e2e-playwright/` — Grafana (1/12)
  - `tests/` — AFFiNE, Playwright, Supabase (3/12)
  - `playwright/` — Slate (1/12)
  - `packages/plugin-e2e/` — Grafana plugin-tools (1/12)

**Pattern: Suite-based directory grouping (Gold standard for large suites)**
- Frequency: 3/5 Gold suites with 20+ tests
- Grafana: `*-suite/` directories (alerting-suite, dashboards-suite, panels-suite)
- Cal.com: Feature directories (auth/, eventType/, team/, organization/)
- AFFiNE: Deployment-target packages (affine-local, affine-cloud, affine-desktop)
- **Contrast:** freeCodeCamp uses flat file organization (126 files, no subdirectories)

**Pattern: Auth state in dedicated directory**
- Frequency: 6/12 suites
- Convention: `playwright/.auth/<role>.json` added to `.gitignore`
- Evidence: [grafana-e2e], [grafana-plugin-e2e], [freecodecamp-e2e] (`certified-user.json`)

### 3. Page Object Model Variants

**Variant A: Class-based POM (Traditional/Historical)**
- Page objects as TypeScript classes with constructor accepting `Page`
- Constructor pattern: `constructor(page: Page)` with `readonly` Locator properties
- Evidence: [clerk-e2e-template] (archived, represents pre-2023 approach)
- **Status:** Superseded by Variants B and C in production suites

**Variant B: Fixture-based POM (Modern)**
- Page objects registered as fixtures via `test.extend<T>()`
- Injected into tests via dependency injection
- Evidence: [grafana-plugin-e2e] (models + fixtures + matchers + selectors)
- **Highest maturity:** Published as npm package for ecosystem consumption

**Variant C: Hybrid POM + Fixtures**
- Class-based page objects created inside fixture definitions
- Combines encapsulation (classes) with dependency injection (fixtures)
- Evidence: [calcom-e2e] (factory fixtures with scenario composition)
- **Dominant pattern in active Gold suites**

**Variant D: Function-based helpers (No POM)**
- Standalone utility functions, no class abstraction
- Evidence: [affine-e2e] (`openHomePage()`, `clickNewPageButton()` from `@affine-test/kit`)
- Evidence: [freecodecamp-e2e] (utils/ directory with helper functions)
- **Viable for suites that prioritize simplicity over abstraction**

**Variant E: No abstraction (Data fixtures only)**
- Plain TypeScript DTO objects with factory methods, no page interaction abstraction
- Evidence: [immich-e2e] (`fixtures.ts` with `createUserDto.create()`)
- **Suitable for API-heavy testing with minimal UI interaction**

**NEW — POM Inheritance Analysis (Round 20):**
- `extends BasePage` pattern is prevalent in community templates but **absent from all Gold production suites**
- Gold suites use composition (fixtures, factories) over inheritance
- Decision: inheritance adds complexity without benefit when fixtures provide composition

### 4. Fixture Patterns

**Pattern: `test.extend<T>()` for custom fixtures**
- Frequency: 5/12 suites (Gold suites with Playwright-native patterns)
- Key indicator: separates mature suites from basic implementations
- Evidence: [grafana-e2e], [calcom-e2e], [grafana-plugin-e2e]

**Pattern: Shared kit/utility packages in monorepos**
- Frequency: 2/12 (AFFiNE `@affine-test/kit`, Grafana `@grafana/plugin-e2e`)
- Centralizes test utilities for consumption across multiple test packages
- **Highest maturity variant:** Published npm package (Grafana)

**Pattern: Domain-specific custom matchers**
- Frequency: 1/12 suites (highest maturity)
- Example: `expect(panel).toHaveNoDataError()` in Grafana
- Evidence: [grafana-plugin-e2e] (published npm package with custom matchers)

**Pattern: Factory functions for test data**
- Frequency: 3/12 suites
- Cal.com: `createUsersFixture()` with scenario composition (teams, orgs, feature flags)
- Immich: `createUserDto.create()` factory method on DTO objects
- Clerk: `createSignupAttributes()` (historical template)

### 5. CI Integration Structure

**Pattern: Dedicated CI workflow files**
- Frequency: 10/12 suites (excluding Supabase Vitest and Excalidraw non-Playwright)
- Convention: `.github/workflows/e2e-playwright.yml` or similar

**Pattern: Multi-reporter configuration**
- Frequency: 7/12 suites use 2+ reporters
- **Reporter stacking follows three-slot pattern (NEW — Round 17):**
  1. **Progress slot** — dot/list/github for real-time CI feedback
  2. **Artifact slot** — HTML for post-run human analysis
  3. **Integration slot** — JUnit/JSON/blob for CI pipeline consumption
- **Confirmed combinations:**
  - Cal.com: blob (CI) + HTML + JUnit XML (3 slots)
  - Playwright: dot + JSON + blob (3 slots, CI only)
  - playwright-ts: custom logger + HTML + dot (3 slots)
  - AFFiNE: github (CI) / list (local) — context-switched (1 slot)
  - Grafana: HTML + custom a11y reporter (2 slots)
  - Slate: github (CI) / list (local) + trace (2 slots)
  - freeCodeCamp: HTML only (1 slot)
  - Immich: HTML only (1 slot)

**Pattern: Conditional artifact capture**
- Frequency: 10/12 suites
- **Standard confirmed:** `trace: 'retain-on-failure'` or `'on-first-retry'`
- Screenshot: `'only-on-failure'` universal
- Video: AFFiNE only (`'on-first-retry'`) — unique among analyzed suites

### 6. Retry Configuration Spectrum

**Pattern: Retry count correlates with infrastructure AND domain complexity (UPDATED — Round 17)**
- Slate: 5 retries (contenteditable race conditions — domain complexity)
- Immich: 4 retries (Docker Compose full-stack — infrastructure complexity)
- AFFiNE: 3 retries (yarn workspace dev server)
- Cal.com: 2 retries (3 web servers)
- freeCodeCamp: 2 retries (Docker API + external app)
- playwright-ts: 2 retries (CI) / 0 (local)
- Grafana: 1 retry (plugin build + local server)
- Grafana plugin-e2e: 2 retries
- Playwright: 0 retries (no webServer, testing framework itself)

### 7. Worker Configuration Patterns

**Pattern: Five distinct worker allocation strategies (UPDATED — Round 18)**
1. **CPU percentage string**: AFFiNE `workers: '50%'` — portable across machines
2. **CPU formula**: Immich `Math.round(os.cpus().length * 0.75)` — explicit 75% reservation
3. **Fixed CI + auto local**: Grafana `workers: process.env.CI ? 4 : undefined` — deterministic CI
4. **Fixed both (inverted)**: playwright-ts `workers: process.env.CI ? 3 : 6` — more workers locally
5. **Serial**: freeCodeCamp `workers: 1` — eliminates parallelism concerns

---

## Configuration Pattern Catalog (NEW — Rounds 17-18)

### Timeout Hierarchy

Three-tier timeout architecture observed across all suites:

| Suite | Test Timeout | Expect Timeout | Action Timeout |
|-------|-------------|----------------|----------------|
| Slate | 20s | 8s | 0 (unlimited) |
| Grafana | 30s (default) | 10s | default |
| Cal.com | 60s CI / 240s local | default | default |
| AFFiNE | 50s CI / 30s local | default | default |
| freeCodeCamp | 15s | default | default |
| playwright-ts | externalized constants | externalized | externalized |

**Key insight:** Action timeout of 0 (unlimited) is valid for editor-heavy UIs where individual operations may take variable time, bounded by test timeout.

### Project Definition Patterns

| Pattern | Example | When to Use |
|---------|---------|-------------|
| **`withAuth()` helper** | Grafana (25+ projects) | Large suites with many authenticated project groups |
| **Inline dependencies** | Cal.com, freeCodeCamp | Small-to-medium suites with few auth contexts |
| **Conditional platform** | Slate (WebKit on macOS only) | Cross-platform testing with platform-specific browsers |
| **Setup-test-teardown chain** | Grafana CUJS | Data lifecycle management requiring guaranteed cleanup |
| **Role-based directories** | Grafana plugin-e2e (as-admin-user/, as-viewer-user/) | Role-based test organization with 1:1 project mapping |

### Custom testIdAttribute Values

| Suite | Value | Risk |
|-------|-------|------|
| Most suites | `data-testid` (default) | None — ecosystem standard |
| Slate | `data-test-id` | Low — close to default |
| freeCodeCamp | `data-playwright-test-label` | Medium — verbose, non-standard |
| playwright-ts | `qa-target` | Medium — short but non-standard |

**Recommendation:** Use default `data-testid` unless organizational convention requires otherwise.

### Global Setup Architecture

| Approach | Pros | Cons | Who Uses It |
|----------|------|------|-------------|
| **Setup projects** (recommended) | HTML report visibility, trace recording, fixtures | Config complexity | Grafana, freeCodeCamp |
| **globalSetup file** (legacy) | Simple, single function | No traces, no fixtures, hidden in report | playwright-ts template |
| **Fixture-based on-demand** (emerging) | Only authenticates needed roles, shard-efficient | Cache warming latency | Community pattern |

---

## Fixture Pattern Catalog (NEW — Rounds 19-20)

### Fixture Scoping

| Scope | Lifecycle | Use Cases | Example |
|-------|-----------|-----------|---------|
| **Test** (default) | Setup before each test, teardown after | Page objects, test-specific state | POM class instantiation |
| **Worker** | Once per worker process | Expensive resources, shared auth | Database connections, `workerStorageState` |

### Fixture Composition Mechanisms

| Mechanism | Introduced | Purpose | Example |
|-----------|-----------|---------|---------|
| `test.extend<T>()` | Original | Define single fixture set | `test.extend<{ todoPage: TodoPage }>({...})` |
| `mergeTests()` | v1.39.0 | Combine fixture sets from multiple modules | `mergeTests(dbTest, a11yTest)` |
| `mergeExpects()` | v1.39.0 | Combine custom matcher sets | `mergeExpects(dbExpect, a11yExpect)` |
| `{ option: true }` | Original | Bridge fixtures to project config | `person: ['John', { option: true }]` |
| `{ auto: true }` | Original | Run fixture for every test without listing | Log collection, metrics, screenshots |

### Fixture Configuration Options

| Option | Syntax | Purpose |
|--------|--------|---------|
| Scope | `{ scope: 'worker' }` | Share fixture across worker's tests |
| Auto | `{ auto: true }` | Execute without test dependency |
| Timeout | `{ timeout: 60000 }` | Independent slow-fixture timeout |
| Option | `{ option: true }` | Configurable from project config |
| Combined | `{ scope: 'worker', auto: true }` | Auto-execute per worker |

### Auth Fixture Architecture Comparison

| Approach | How It Works | Pros | Cons |
|----------|-------------|------|------|
| **Setup project + storageState file** | Dedicated project logs in, writes `.auth/role.json`, dependent projects use `storageState` | Simple, visible in report | All roles auth upfront; each shard repeats |
| **Fixture-based on-demand + globalCache** | `globalCache.get('auth-admin', loginFn)` in storageState fixture | Only needed roles auth; shard-efficient | First test pays auth latency |
| **Worker-scoped shared account** | `parallelIndex`-based unique accounts, worker scope | Per-worker isolation, no conflicts | Requires account pool management |
| **Multi-role browser contexts** | Separate `BrowserContext` per role in single test | Both roles in one test | More complex fixture definition |

### Data Fixture Patterns

| Pattern | Suite | Implementation |
|---------|-------|---------------|
| **Factory with scenario composition** | Cal.com | `users.create(opts, { hasTeam, teammates, schedulingType })` creates cascading resources |
| **DTO factory methods** | Immich | `createUserDto.create()` returns plain objects |
| **Transactional cleanup** | Cal.com | `prisma.$transaction()` deletes in dependency order, `retryOnNetworkError()` wrapper |
| **Self-refresh method** | Cal.com | `self()` re-queries DB for current state — solves stale fixture data |
| **Worker-isolated identity** | Cal.com | `workerInfo.workerIndex` + timestamp suffix for unique email/username |

---

## POM Pattern Catalog (NEW — Round 20)

### Constructor Pattern (Canonical)

```typescript
class MyPage {
  readonly page: Page;
  readonly submitButton: Locator;
  readonly nameInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.nameInput = page.getByLabel('Name');
  }
}
```

### Method Organization (Three Categories)

| Category | Purpose | Example |
|----------|---------|---------|
| **Navigation** | Reach the page | `goto()`, `navigateTo()` |
| **Action** | Perform user interaction | `fillForm()`, `submit()`, `selectOption()` |
| **State/Assertion** | Verify page state | `isVisible()`, embedded `expect()` in actions |

### POM-Fixture Integration Patterns

| Level | Pattern | How Test Accesses POM |
|-------|---------|----------------------|
| **1. Direct instantiation** | `const page = new MyPage(page)` in test | Manual, no DI |
| **2. Fixture injection** | `test.extend<{ myPage: MyPage }>({...})` | Via test parameter |
| **3. Factory fixture** | `test.extend({ users: createUsersFixture })` | Via factory methods |
| **4. Published package** | `import { test } from '@grafana/plugin-e2e'` | Via npm import |

### Dynamic Content Handling

POM classes handle dynamic content via **locator composition** (not explicit waits):
- `.filter({ hasText: '...' })` for text-based filtering
- `.nth(n)` for index-based selection
- `.locator()` chains for nested structure
- Playwright auto-waiting handles timing — no `waitForSelector()` needed

### Version-Aware Selectors (Grafana Innovation)

Grafana plugin-e2e maintains version-branching in selector definitions, enabling the same POM to work across Grafana v9/v10/v11. The `selectors/` directory encapsulates version differences away from test code.

---

## Maturity Spectrum (Confirmed and Extended)

Based on deep-dive analysis across 12 suites, maturity levels now include fixture and config indicators:

| Level | Pattern | Config Indicators | Fixture Indicators | Example |
|-------|---------|-------------------|-------------------|---------|
| **1. Basic** | Flat files, no POM, serial execution | Single project, flat timeout, HTML reporter | No `test.extend()`, utility functions only | freeCodeCamp |
| **2. Structured** | Feature directories, function helpers | Multiple projects, CI/local branching | Shared kit package, helper functions | AFFiNE |
| **3. Fixture-based** | test.extend(), factory data, parallel | Setup projects, multi-reporter, webServer | Factory fixtures, transactional cleanup | Cal.com, Immich |
| **4. Framework** | Published package, custom matchers | withAuth() helper, version-aware selectors | 19+ fixture files, domain segmentation | Grafana plugin-e2e |

Each level is valid — maturity should match project needs, not be pursued for its own sake.

---

## Confirmed Themes

1. **Fixture-based architecture is replacing pure POM** — Hybrid (Variant C) is the dominant modern pattern
2. **Configuration complexity scales with project size** — Grafana's 31 projects vs. Playwright's 2 reflects the spectrum
3. **Monorepo structure drives config organization** — Cal.com and AFFiNE both demonstrate monorepo-specific patterns
4. **Auth structure is standardizing** — `.auth/` directory with storageState + setup projects
5. **Retry counts encode infrastructure confidence** — Higher retries = more infrastructure variability
6. **Serial execution is a valid strategy** — freeCodeCamp proves 126 tests work with 1 worker
7. **Not all apps need Playwright** — Supabase and Excalidraw show Vitest fills the gap for component-heavy apps
8. **`process.env.CI` ternary is the universal environment switch** — No suite uses .env files or dotenv for CI/local branching
9. **POM inheritance is a community anti-pattern** — Zero production suites (0/22) use `extends BasePage`; composition via fixtures is preferred
10. **Fixture composition via `mergeTests()` enables modular architecture** — Domain-segmented fixture files merged at test level
11. **Three-slot reporter pattern** — Progress + Artifact + Integration slots reflect CI maturity
12. **Transactional cleanup solves parallel data conflicts** — Cal.com's `$transaction()` with dependency-ordered deletes
13. **ROUND 21: `.spec.ts` naming is near-universal** — Confirmed across 15+ suites including Silver/Bronze tiers, not just Gold
14. **ROUND 21: Feature-based grouping outperforms type-based grouping** — 5/5 Gold suites with 20+ tests use feature directories; type-based (e2e/ui/api/) found only in Bronze templates
15. **ROUND 21: Auto fixture auth is an emerging alternative** — PostHog migrated from setup projects to auto fixtures for better --ui mode compatibility
16. **ROUND 21: Domain-specific matcher packages are reproducible** — playwright-posthog independently implements the Grafana plugin-e2e pattern of publishing custom matchers

---

## Validation Sweep Results (Round 21)

### Patterns Confirmed as Universal
| Pattern | Gold Suites | Silver Suites | Bronze/Community | Verdict |
|---------|------------|---------------|-----------------|---------|
| TypeScript config | 10/10 | 5/5 | Most | **Universal** |
| `process.env.CI` ternary | 10/10 | 4/5 | Minority | **Universal in production** |
| Dedicated test directory | 10/10 | 5/5 | All | **Universal** |
| `.spec.ts` naming | 7/10 | 5/5 | Most | **Near-universal** |
| Multi-project config | 10/10 | 5/5 | Most | **Universal** |

### Patterns Confirmed as Gold-Only (Production Best Practice)
| Pattern | Gold | Silver/Bronze | Verdict |
|---------|------|---------------|---------|
| Feature-based grouping | 5/5 (20+ tests) | Rare | **Gold standard, not universal** |
| `test.extend<T>()` fixtures | 8/10 | 2/5 | **Maturity indicator** |
| Factory fixtures | 3/10 | 0/5 | **Advanced pattern** |
| Custom matchers as npm packages | 1/10 | 1/12 | **Highest maturity** |

### Patterns Confirmed as Anti-Patterns
| Pattern | Gold | Silver | Bronze | Verdict |
|---------|------|--------|--------|---------|
| POM inheritance (`extends BasePage`) | 0/10 | 0/5 | 2/7 | **Anti-pattern** |
| Type-based directories (e2e/ui/api/) | 0/10 | 0/5 | 3/7 | **Anti-pattern** |
| JavaScript config | 0/10 | 0/5 | 1/7 | **Anti-pattern** |
| Multi-env config files | 0/10 | 0/5 | 1/7 | **Anti-pattern** |

---

## Resolved Questions

### From Landscape Phase
1. **How do Gold suites compose fixtures?** — Cal.com uses factory composition, Grafana publishes via npm, AFFiNE uses shared kit package
2. **What is the maximum practical depth for fixture hierarchies?** — 2 levels observed (factory -> scenario -> user), not deeper
3. **How do monorepo suites share page objects?** — Via workspace packages (@affine-test/kit, @grafana/plugin-e2e)
4. **Test file naming conventions:** `.spec.ts` (Grafana, AFFiNE, freeCodeCamp, Playwright), `.e2e.ts` (Cal.com), `.e2e-spec.ts` (Immich)
5. **Test utility organization:** `utils/` or `lib/` alongside tests, or shared workspace packages

### From Rounds 13-16 (Answered in Rounds 17-20)
6. **What specific fixture composition patterns (mergeTests, mergeExpect) are used in practice?** — `mergeTests()` combines domain-specific fixture sets; `mergeExpects()` combines custom matcher sets. Both introduced v1.39.0. Known issue: name conflicts produce incorrect types.
7. **How do suites handle test data cleanup across parallel workers?** — Cal.com uses `prisma.$transaction()` with dependency-ordered deletes + `retryOnNetworkError()`. Worker isolation via `workerInfo.workerIndex` + timestamp suffix.
8. **What is the optimal project structure for teams of different sizes?** — Small teams: inline project definitions (2-5 projects). Medium teams: auth helper function like `withAuth()` (5-15 projects). Large teams: domain-segmented projects with setup/teardown chains (15-31 projects).

### From Rounds 17-20 (Answered in Rounds 21-22)
9. **How should the timeout hierarchy be configured for different application types?** — Application type determines expect timeout: standard web apps (5s), editor/dashboard-heavy apps (8-10s), infrastructure-heavy apps (10s). Test timeout should be 2-4x expect timeout. Action timeout of 0 (unlimited) is valid for editor-heavy UIs.
10. **What are the performance implications of different worker allocation strategies?** — CPU percentage (AFFiNE `'50%'`) is most portable across machines. Fixed CI workers (Grafana `4`) are most deterministic for reproducible CI. CPU formula (Immich `Math.round(os.cpus().length * 0.75)`) balances both. Serial execution (freeCodeCamp `1`) eliminates parallelism concerns at the cost of speed.
11. **How should cross-browser testing be structured given the CI cost tradeoff?** — Run Chromium-only for development (fast feedback). Run full matrix (Chromium + Firefox + WebKit) in CI. Firefox runs ~34% slower than Chromium requiring proportional CI allocation. Use conditional platform projects for platform-specific browsers (Slate: WebKit on macOS only).

## Open Questions

All structural questions have been resolved. No open questions remain for the structure phase.

Structure standards are now **DEFINITIVE** — see `standards/structure-standards.md`.
