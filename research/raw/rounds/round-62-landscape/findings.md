# Round 62 — Landscape: Three-Lens Analysis of Five New Large-Scale Suites

**Phase:** Landscape (continued discovery)
**Date:** 2026-03-19
**Methodology:** Three-lens analysis (Test Anatomy, Coverage Strategy, Scaling Profile) via GitHub API tree traversal, test file sampling, CI workflow inspection, and web search.

---

## Suite 1: WordPress/Gutenberg

**Repository:** `wordpress/gutenberg`
**Stack:** JavaScript/TypeScript, WordPress block editor
**Test location:** `test/e2e/specs/` + `packages/e2e-test-utils-playwright/`

### Test Anatomy

**Files sampled:** `buttons.spec.js`, `navigable-toolbar.spec.js` (plus config and utils inspection)

- **AAA compliance:** Moderate. Tests follow Arrange-Act-Assert conceptually but boundaries blur in longer tests. Short tests (3-5 assertions) show clean AAA; longer tests (8-15 assertions) chain actions and assertions without separation.
- **Setup approach:** `test.beforeEach` creates a fresh post via admin utils. API-based setup via `requestUtils` is the documented best practice — no UI-based test data creation.
- **Assertions per test:** Range 1-12, average ~4. Heavy use of `expect.poll()` for eventual consistency. Common matchers: `toBeFocused()`, `toBeVisible()`, `toMatchObject()`, `toBe()`.
- **test.step() usage:** **Zero.** No `test.step()` found in any sampled file. Tests are flat sequential chains.
- **Test length:** 15-80 lines per test. Longer tests bundle multiple scenarios (viewport changes, keyboard sequences) rather than decomposing.

**Key anatomy pattern:** Gutenberg treats tests as integration scenarios, not unit-like slices. A single test may exercise insert-block -> type -> navigate -> assert-focus -> resize-viewport -> assert-scroll. This produces higher assertion counts but fewer overall test cases.

### Coverage Strategy

- **Feature coverage:** Block behavior (buttons, paragraphs, headings, etc.), editor workflows (publishing, drafts, collaboration), site editor, admin features, widget management, interactivity API.
- **Structural categorization:** 5 top-level directories: `admin/`, `editor/`, `interactivity/`, `site-editor/`, `widgets/`. No tag system — pure directory-based routing. **Editor is dominant** with the vast majority of the 278 spec files.
- **CI tiers:** 3 browser projects in config: Chromium (default/primary), WebKit (`@webkit` tagged), Firefox (`@firefox` tagged). Chromium gets all tests; WebKit and Firefox only tagged subsets.
- **Error-path ratio:** Low. Sampled tests focus on happy-path interactions (insert block, type content, verify output). Error scenarios (invalid input, broken blocks) appear sparse based on naming.
- **Performance testing:** Integrated. The utils package includes `lighthouse/` and `metrics/` modules. Performance tests run via the same Playwright infrastructure.

### Scaling Profile

| Metric | Value |
|--------|-------|
| Spec files | **278** |
| Spec directories | 5 top-level categories |
| Utils package files | **62** (published as `@wordpress/e2e-test-utils-playwright`) |
| Config complexity | Extends base from `@wordpress/scripts`, custom flaky-tests-reporter |
| Workers | **1** (serial execution) |
| Sharding | Not in main config — 1 worker suggests CI handles parallelism externally |
| Reporters | CI: GitHub + flaky-tests-reporter + blob; Local: list |
| Global setup | `config/global-setup.ts` |
| Browser projects | 3 (Chromium, WebKit, Firefox) |

**Scaling philosophy:** **Abstraction-heavy.** The entire `@wordpress/e2e-test-utils-playwright` package (62 files) is published to npm. This is the most extreme example of test infrastructure as a shared library seen in any suite. It provides `admin`, `editor`, `pageUtils`, and `requestUtils` as first-class fixture namespaces. This enables the WordPress ecosystem (plugins, themes) to write Playwright tests using the same abstractions.

**Unique pattern:** The flaky-tests-reporter is a custom reporter that specifically tracks and reports flaky test behavior, suggesting institutional awareness of flakiness as an ongoing concern at scale.

---

## Suite 2: n8n

**Repository:** `n8n-io/n8n`
**Stack:** TypeScript, workflow automation platform
**Test location:** `packages/testing/playwright/`

### Test Anatomy

**Files sampled:** `canvas-actions.spec.ts`, `signin.spec.ts` (plus fixtures and pages inspection)

- **AAA compliance:** Strong in short tests. `signin.spec.ts` is a clean Arrange (fixture injection) -> Act (navigate, login) -> Assert (sidebar visible) pattern. `canvas-actions.spec.ts` shows moderate AAA with 2-4 assertions per test maintaining clear boundaries.
- **Setup approach:** Fixture-based with `n8n.start.fromBlankCanvas()` in `beforeEach`. Database reset occurs per-worker via `dbSetup` fixture. Authentication is tag-driven: `@auth:none` skips login, default tests get owner-role cookies injected.
- **Assertions per test:** Range 1-4, average ~2.5. Very lean. Primary matchers: `toHaveCount()`, `toBeVisible()`, `toBeHidden()`, `toContainText()`.
- **test.step() usage:** **Zero** in sampled files. Flat sequential structure.
- **Test length:** 10-30 lines per test. Consistently short. The `n8n` fixture absorbs complexity.

**Key anatomy pattern:** n8n achieves short tests through extremely high fixture and page-object investment. Tests read like pseudo-code: `n8n.canvas.addNode()`, `n8n.signIn.loginWithEmailAndPassword()`. Almost no raw Playwright API calls in test files.

### Coverage Strategy

- **Feature coverage:** 28 test categories spanning: AI/LLM workflows (14 specs), workflow building blocks (5), authentication (5), settings (13), nodes (12), credentials (4), sharing (4), projects (6), regression (12), source control (2), observability (1), chat hub (7), benchmarks (10), chaos testing (2).
- **Structural categorization:** Deep directory nesting by feature domain. No `@tag`-based selection visible — categorization is structural + CI workflow-level.
- **CI tiers:** **7 distinct CI workflows** — the most of any suite analyzed:
  - `test-e2e-reusable.yml` (main tests)
  - `test-e2e-ci-reusable.yml` (CI-specific)
  - `test-e2e-coverage-weekly.yml` (weekly coverage report)
  - `test-e2e-docker-pull-reusable.yml` (pre-built images)
  - `test-e2e-helm.yml` (Kubernetes)
  - `test-e2e-infrastructure-reusable.yml` (infra)
  - `test-e2e-performance-reusable.yml` (performance)
- **Error-path ratio:** Higher than most. Chaos testing (2 specs), regression tests (12 specs), and memory-consumption/retention tests suggest deliberate error-path and resilience coverage. Estimated ~15-20%.
- **Auth tag:** `@auth:none` tag controls fixture behavior (skip authentication), showing tags used for fixture control rather than test selection.

### Scaling Profile

| Metric | Value |
|--------|-------|
| Spec files | **174** |
| Test categories | **28** |
| Page object files | **69** (including components and node-specific pages) |
| Fixture files | 5+ (base, capabilities, observability, console-error-monitor, AI-specific) |
| CI workflows | **7** |
| Sharding | 8 shards (default), 2 workers per shard |
| Infrastructure modes | 3 (local, docker-build, docker-pull) |
| Timeout | 30 min per job |
| Test data | JSON workflow fixtures, test user config |
| Services | Mailpit, Gitea, proxy, observability (via fixture) |

**Scaling philosophy:** **Infrastructure-first isolation.** n8n's fixture system manages entire container lifecycles per worker. The `N8NStack` container provides complete server instances. Database reset per worker ensures isolation. Multiple CI workflows test against different infrastructure configurations (local, Docker, Helm). This is the most sophisticated container-managed test infrastructure observed.

**Unique patterns:**
- **`@auth:` tags for fixture control:** Tags modify fixture behavior rather than selecting tests
- **Claude templates:** `.github/claude-templates/e2e-test.md` — AI-assisted test generation templates
- **Debounce multiplier:** `N8N_DEBOUNCE_MULTIPLIER=0` in test mode eliminates UI debounce delays
- **Multi-main testing:** `createApiForMain` fixture enables testing multi-instance deployments
- **BasePage inherits FloatingUiHelper:** POM hierarchy includes UI interaction helpers at the base level

---

## Suite 3: Rocket.Chat

**Repository:** `RocketChat/Rocket.Chat`
**Stack:** TypeScript, Meteor framework, enterprise messaging
**Test location:** `apps/meteor/tests/e2e/`

### Test Anatomy

**Files sampled:** `account-profile.spec.ts`, `channel-management.spec.ts` (plus page objects and utils inspection)

- **AAA compliance:** Mixed. `account-profile.spec.ts` shows clean AAA for simple tests but the Personal Access Tokens test bundles 9 assertions with `test.step()` — good structure but breaks AAA per-step. `channel-management.spec.ts` shows tight Act-Assert coupling with interleaved assertions.
- **Setup approach:** `storageState` fixture provides pre-authenticated user sessions (via `Users.user3.state` / `Users.admin.state`). `beforeEach` navigates to starting page. `beforeAll` creates shared channels via API utility `createTargetChannel()`.
- **Assertions per test:** Range 1-6, average ~3. Common matchers: `toBeVisible()`, `toContainText()`, `toHaveURL()`, `not.toBeFocused()`.
- **test.step() usage:** **Sparse but present.** Found in `account-profile.spec.ts` for the Personal Access Tokens test — 6 steps wrapping logical sub-operations. Not found in `channel-management.spec.ts`. Estimated <5% of tests use steps.
- **Test length:** 10-50 lines. Serial execution (`test.describe.serial()`) is common, suggesting state dependencies between tests.

**Key anatomy pattern:** Rocket.Chat uses `test.describe.serial()` extensively, which is unusual among large suites. This trades test independence for execution efficiency — create a channel once, then test multiple operations on it sequentially. The pattern reduces test count but creates fragile ordering dependencies.

### Coverage Strategy

- **Feature coverage:** Account management, channel operations, admin panels, messaging (text/voice/video), omnichannel/livechat, federation (11 specs with separate page objects), SAML/SSO, encryption (E2EE with dedicated page objects), device management, marketplace, roles/permissions.
- **Structural categorization:** Flat file naming at the spec level (`account-profile.spec.ts`, `channel-management.spec.ts`). Federation tests are in a separate `federation/` subdirectory with duplicated page objects. No tag system detected.
- **CI tiers:** Not fully visible, but the config mentions CI-specific settings: 2 workers, 2M ms timeout, 2 retries.
- **Error-path ratio:** Low-moderate. Profile tests include invalid URL handling. Channel tests include permission enforcement. Estimated ~10%.
- **Accessibility:** Dedicated a11y tests using `makeAxeBuilder()` — integrated axe-core scanning per route. This is the most explicit a11y testing seen in any suite.

### Scaling Profile

| Metric | Value |
|--------|-------|
| Spec files | **159** (main) + **11** (federation) = **170** |
| Page object files | **112** (the highest POM count of any suite analyzed) |
| Fragment/component POs | 80+ (modals, flextabs, composers, sidebars) |
| Utils files | 20+ (including omnichannel-specific utils) |
| Fixture files | `userStates` for pre-authenticated sessions |
| Config | Global setup, SAML containers, separate federation config |
| Workers | 2 (CI) |
| Retries | 2 (CI) |
| Timeout | 2,000,000 ms (~33 min) |

**Scaling philosophy:** **Page-object maximalism.** 112 page object files for 170 spec files is a 0.66 POM-to-spec ratio — far higher than any other suite. The POM architecture uses fragments (composable UI component objects) composed into page objects. Modals get their own classes (21 modal page objects). This is the most granular POM decomposition observed.

**Unique patterns:**
- **Fragment composition:** `HomeChannel` composes `navbar`, `composer`, `content`, `roomHeader`, `members`, `notifications` fragments
- **Duplicated federation POs:** Federation tests maintain a separate page object hierarchy, suggesting the federation feature was developed by a different team
- **SAML container config:** Full SimpleSAMLphp container configuration checked into the test directory for SSO testing
- **Omnichannel parallel universe:** Dedicated utils, page objects, and test files for omnichannel features — almost a suite-within-a-suite

---

## Suite 4: Ghost CMS

**Repository:** `TryGhost/Ghost`
**Stack:** TypeScript, Node.js CMS
**Test location:** `e2e/` (top-level, separate from core app) + `ghost/core/test/e2e-browser/` (legacy) + multiple app-level test dirs

### Test Anatomy

**Files sampled:** `posts.test.ts` (plus fixture, data-factory, and helpers inspection)

- **AAA compliance:** **Exemplary.** `posts.test.ts` is a textbook AAA example: create factory -> create page object -> navigate -> create post -> assert count. Clean separation, minimal noise.
- **Setup approach:** Data factory pattern with API persistence. `PostFactory` creates test data via `page.request` (Playwright API context). No UI-based setup. Ghost instance management is fixture-based with per-file or per-test isolation modes.
- **Assertions per test:** Range 2-4 in sampled file. Lean and focused.
- **test.step() usage:** **Not observed** in sampled files.
- **Test length:** 10-20 lines per test. The shortest tests of any suite analyzed.

**Key anatomy pattern:** Ghost achieves extreme test brevity through three layers of abstraction: (1) Data factories create test data via API, (2) Page objects handle all UI interaction, (3) The fixture system manages Ghost instance lifecycle. Tests contain almost zero Playwright API calls.

### Coverage Strategy

- **Feature coverage (browser tests):** Admin panel (posts, members, comments, analytics, settings, tags, billing, sidebar, 2FA), public site (homepage, comments, member signup, portal, Stripe checkout). Two perspectives: admin and public visitor.
- **Structural categorization:** Clean domain hierarchy: `tests/admin/` and `tests/public/` at top level, then feature subdirectories (`posts/`, `members/`, `analytics/`, `settings/`). Visual regression is separate (`visual-regression/`).
- **Multi-layer e2e:** Ghost has **5 distinct e2e test layers** — the most of any suite:
  - `e2e/` — Playwright browser tests (54 files)
  - `ghost/core/test/e2e-api/` — API e2e tests (~60+ files)
  - `ghost/core/test/e2e-browser/` — Legacy browser tests (10 specs)
  - `ghost/core/test/e2e-frontend/` — Frontend rendering tests (~14 files)
  - `ghost/core/test/e2e-server/` — Server behavior tests (~9 files)
  - `ghost/core/test/e2e-webhooks/` — Webhook tests (5 files)
  - Plus per-app tests: `apps/comments-ui/test/e2e/` (15 files), `apps/signup-form/test/e2e/` (2 files)
- **Error-path ratio:** Moderate. Includes disabled-member, disable-commenting, theme-error-notification tests. Estimated ~12%.
- **Stripe integration:** Fake Stripe server with webhook client for payment flow testing without real Stripe calls.

### Scaling Profile

| Metric | Value |
|--------|-------|
| Browser test files | **54** (main e2e/) + **10** (legacy e2e-browser) + **17** (app-level) = **81** |
| Total e2e files (all layers) | **199** |
| Page object files | 30+ (hierarchical: base -> admin/portal/public -> feature-specific) |
| Data factory files | **7** factories (post, member, comment, tag, user, automated-email, lexical) |
| Helper/service files | 40+ (environment managers, service managers, Stripe mocks, email, flows) |
| Isolation modes | 2 (per-file default, per-test for Stripe tests) |
| Environment managers | Ghost manager + MySQL manager |
| Config files | 6+ Playwright configs (main, visual-regression, per-app configs) |

**Scaling philosophy:** **Data-factory-driven with environment isolation.** Ghost's standout pattern is the data factory system with pluggable persistence adapters (API adapter, Knex/direct-DB adapter). Combined with per-file/per-test Ghost instance management, this enables true test isolation without shared state. The `EnvironmentManager` handles Ghost server lifecycle including database provisioning.

**Unique patterns:**
- **Data factory with persistence adapters:** Factories can create data via API or directly in the database — the only suite with this dual-persistence pattern
- **Environment Manager:** Manages Ghost + MySQL lifecycle per worker, with caching by config signature
- **Fake Stripe server:** Complete Stripe mock with webhook support for payment testing
- **AI-assisted test writing:** `e2e/.claude/E2E_TEST_WRITING_GUIDE.md` and `e2e/AGENTS.md` — explicit AI coding guides for test creation
- **Multi-config monorepo:** 6+ separate Playwright config files for different apps within the monorepo
- **Lexical factory:** Content factory that generates Ghost's Lexical editor format programmatically

---

## Suite 5: Element Web

**Repository:** `element-hq/element-web`
**Stack:** TypeScript, React, Matrix protocol
**Test location:** `apps/web/playwright/` + `packages/playwright-common/`

### Test Anatomy

**Files sampled:** `crypto/crypto.spec.ts` (plus element-web-test.ts fixture inspection)

- **AAA compliance:** Good. Crypto tests follow clear Arrange (bootstrap cross-signing) -> Act (create DM, verify device) -> Assert (check state). However, the Arrange phase often involves complex multi-step initialization through helper functions.
- **Setup approach:** Fixture-based. `app` (ElementAppPage), `bot` (Bot user "Bob"), `user` (Alice credentials) injected per test. Homeserver instances (Synapse/Dendrite) launched per **worker** via Docker containers. Room creation and membership managed via REST API, not UI.
- **Assertions per test:** Range 3-8, average ~5. Mix of DOM assertions (`toBeVisible()`, `toHaveCount()`) and screenshot comparisons (`toMatchScreenshot()`).
- **test.step() usage:** **Minimal** — found in 1 of 6 crypto tests ("Fetch master key from server" step). Estimated <5% across the suite.
- **Test length:** 20-60 lines. Moderate — complexity comes from Matrix protocol setup, not test verbosity.

**Key anatomy pattern:** Element Web's tests are fundamentally integration tests of a distributed system. Each test involves multiple Matrix clients (Alice, Bob), homeserver API calls, and cryptographic state management. The `bot` fixture enables automated second-user participation. The `isDendrite` check creates server-specific test skipping — a pattern unique to suites testing against multiple backend implementations.

### Coverage Strategy

- **Feature coverage:** 48 test categories spanning: crypto/E2EE (20 specs — the largest category), settings (33 specs), read-receipts (18 specs), left-panel (11), rooms (9), right-panel (8), widgets (8), login (8), timeline (6). Heavy crypto coverage reflects the application's security-critical nature.
- **Tag system:** **Yes — 4 tags detected:**
  - `@mergequeue` — slow/flaky tests skipped in PR CI, run in merge queue
  - `@screenshot` — visual regression tests
  - `@no-firefox` — service-worker-dependent tests
  - `@no-webkit` — webkit-incompatible tests
- **CI tiers:** PR CI runs Chrome only. Merge queue runs: Chrome + Firefox + WebKit against Synapse; Dendrite + Picone against Chrome. `X-Run-All-Tests` label forces full matrix.
- **Error-path ratio:** Moderate. Crypto tests include key reset, backup deletion, device dehydration removal. Login includes forgot-password flows. Estimated ~12%.
- **Multi-homeserver testing:** Tests execute against Synapse (primary), Dendrite, and Picone — three different Matrix homeserver implementations. This is unique among all suites analyzed.

### Scaling Profile

| Metric | Value |
|--------|-------|
| Spec files | **209** |
| Test categories | **48** |
| Page object files | 9 (ElementAppPage, Spotlight, bot, client, crypto, network, settings, timeline, toasts) |
| Plugin directories | 3 (homeserver, oauth_server, webserver) |
| Homeserver configs | 5+ (Synapse variants: consent, email, legacyOAuth, MAS, longSessionTimeout; Dendrite) |
| Browser projects | 3 (Chrome, Firefox, WebKit) in merge queue |
| Backend projects | 3 (Synapse, Dendrite, Picone) |
| Shared package | `packages/playwright-common/` |

**Scaling philosophy:** **Plugin-based backend multiplexing.** Element Web's unique scaling challenge is testing against multiple Matrix homeserver implementations. The `plugins/homeserver/` directory contains server-specific configurations that launch different backends per project. Tests are written once but execute against 3+ server implementations. This creates a matrix of (3 browsers) x (3 servers) = 9 execution contexts in the full CI matrix.

**Unique patterns:**
- **Homeserver plugins:** Server implementations (Synapse, Dendrite) are plugins with lifecycle management
- **Bot fixture for distributed testing:** `Bot` class creates automated Matrix clients for multi-user scenarios
- **Visual regression in Docker only:** Screenshots must be captured in Docker for cross-platform consistency
- **`@mergequeue` tag for CI tiering:** Slow tests run only in merge queue, not on every PR
- **`packages/playwright-common/`:** Shared test utilities extracted into a monorepo package
- **Consent homeserver:** Special Synapse config requiring user consent — tests the consent flow

---

## Cross-Suite Observations

### Observation 1: test.step() remains nearly absent

| Suite | test.step() usage |
|-------|-------------------|
| Gutenberg | 0% |
| n8n | 0% |
| Rocket.Chat | <5% (tokens test only) |
| Ghost | 0% |
| Element Web | <5% (crypto test only) |

This extends the pattern from rounds 56-61: test.step() is not adopted by large production suites. Even suites with complex multi-phase tests (Element Web crypto, Rocket.Chat channel management) prefer flat sequential structure or nested describe blocks.

### Observation 2: Tag systems correlate with cross-browser/cross-server testing

| Suite | Tags | Cross-browser | Cross-server |
|-------|------|---------------|--------------|
| Gutenberg | `@webkit`, `@firefox` | Yes (3) | No |
| n8n | `@auth:none` (fixture control) | No | No |
| Rocket.Chat | None | No | No |
| Ghost | None | No | No |
| Element Web | `@mergequeue`, `@screenshot`, `@no-firefox`, `@no-webkit` | Yes (3) | Yes (3) |

Tags appear when suites need to **exclude** specific tests from specific execution contexts. Suites running only Chromium (n8n, Rocket.Chat, Ghost) have no need for tags. This reframes the tag question: tags are a scaling mechanism for multi-context execution, not a general organizational tool.

### Observation 3: POM investment varies wildly — 3 distinct strategies

| Suite | POM files | Spec files | Ratio | Strategy |
|-------|-----------|------------|-------|----------|
| Gutenberg | 62 (utils pkg) | 278 | 0.22 | Published utility package |
| n8n | 69 | 174 | 0.40 | Page objects + fixture composition |
| Rocket.Chat | 112 | 170 | 0.66 | Fragment-maximalist POM |
| Ghost | ~30 | 54 | 0.56 | Page objects + data factories |
| Element Web | 9 | 209 | 0.04 | Thin pages + plugin architecture |

Three POM philosophies:
1. **Fragment-maximalist** (Rocket.Chat): Every UI component gets a page object fragment. High maintenance cost but extreme reusability.
2. **Published utility package** (Gutenberg): Test utils are a sharable npm package. Medium POM count but designed for ecosystem consumption.
3. **Thin pages + plugins** (Element Web): Few page objects, but server lifecycle managed by plugins. Complexity shifts from UI abstraction to infrastructure abstraction.

### Observation 4: Data management maturity spectrum

| Suite | Data approach | Sophistication |
|-------|---------------|---------------|
| Gutenberg | API utils (`requestUtils.rest`) | Medium — REST helpers for posts, users, settings |
| n8n | JSON fixture files + API helpers | Medium — static workflow fixtures + runtime API |
| Rocket.Chat | `faker` + API utils | Medium — dynamic data generation + API setup |
| Ghost | **Data factory pattern** with dual persistence | **High** — factory pattern with API and DB adapters |
| Element Web | Bot fixture + REST API | Medium — Matrix API for room/user creation |

Ghost's data factory pattern with pluggable persistence adapters (API vs. Knex) is the most sophisticated data management system observed. This enables both black-box (API) and white-box (direct DB) test data creation from the same factory definitions.

### Observation 5: AI-assisted test generation is emerging

Two of five suites have explicit AI coding guides:
- **n8n:** `.github/claude-templates/e2e-test.md` — Claude template for e2e test generation
- **Ghost:** `e2e/.claude/E2E_TEST_WRITING_GUIDE.md` + `e2e/AGENTS.md` — AI agent instructions

This is a new pattern not seen in the Gold suites (rounds 56-61). It suggests that organizations with well-structured test architectures are beginning to treat AI as a test authoring tool, guided by established patterns.

### Observation 6: Container/environment management is a scaling differentiator

| Suite | Environment management |
|-------|----------------------|
| Gutenberg | wp-env (WordPress environment) |
| n8n | N8NStack containers per worker, multi-DB (SQLite, PostgreSQL) |
| Rocket.Chat | TEST_MODE=true on running server, SAML containers |
| Ghost | EnvironmentManager with Ghost + MySQL lifecycle per file/test |
| Element Web | Homeserver plugins launching Docker containers per worker |

The suites with the most sophisticated test architectures (n8n, Ghost, Element Web) all manage full server lifecycles as part of the test infrastructure. This moves beyond "start server, run tests" to "provision isolated server instance per test context."

### Observation 7: Fixture investment inversely correlates with test length (confirmed)

| Suite | Fixture sophistication | Avg test length |
|-------|----------------------|-----------------|
| Ghost | Very high (env manager + data factories) | 10-20 lines |
| n8n | Very high (container + auth + services) | 10-30 lines |
| Gutenberg | High (utils package) | 15-80 lines |
| Element Web | High (homeserver + bot) | 20-60 lines |
| Rocket.Chat | Medium (storage state + POM) | 10-50 lines |

This confirms the round 56-61 finding: the suites investing most heavily in fixture infrastructure produce the shortest, most readable test files. Ghost and n8n (highest fixture investment) consistently produce tests under 30 lines.

### Observation 8: Serial execution patterns

| Suite | Serial tests | Reason |
|-------|-------------|--------|
| Gutenberg | No | Per-test post creation |
| n8n | No | Per-worker DB reset |
| Rocket.Chat | **Yes** (`test.describe.serial()`) | Shared channel state across tests |
| Ghost | No | Per-file instance isolation |
| Element Web | No | Per-worker homeserver |

Rocket.Chat is the only suite using `test.describe.serial()` extensively. This appears to be a cost-saving measure — creating channels via API is expensive, so tests share channels. The tradeoff is fragile ordering and cascading failures. The other four suites all invest in per-test or per-worker isolation instead.

### Observation 9: Monorepo test distribution

| Suite | Monorepo? | Test distribution |
|-------|-----------|-------------------|
| Gutenberg | Yes | Centralized in `test/e2e/` + utils package |
| n8n | Yes | Centralized in `packages/testing/playwright/` |
| Rocket.Chat | Yes | Centralized in `apps/meteor/tests/e2e/` |
| Ghost | Yes | **Distributed** — 6+ separate Playwright configs across apps |
| Element Web | Yes | Semi-centralized — `apps/web/playwright/` + shared package |

All five suites are monorepos. Ghost stands out for distributed test ownership — each app (`comments-ui`, `signup-form`, `admin-x-settings`, `posts`, `activitypub`) has its own Playwright config. This enables app-specific test configuration while maintaining a shared fixture system.
