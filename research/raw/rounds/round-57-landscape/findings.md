# Round 57 Findings — Re-analyze AFFiNE, Immich, and freeCodeCamp

Three Gold-tier suites examined through three new lenses: test anatomy, coverage strategy, and scaling organization. All findings based on direct inspection of test files, CI workflows, and config files from the current main/canary branches.

---

## AFFiNE E2E — Three-Lens Analysis

### Test Anatomy

**AAA Pattern:** Tests follow a loose Arrange-Act-Assert structure but without formal separation. The "Arrange" phase is almost entirely delegated to utility functions imported from `@affine-test/kit/utils/*`. A typical test opens the home page, waits for editor load, then performs actions and asserts. Example from `all-page.spec.ts`:

```
await openHomePage(page);          // Arrange (utility)
await waitForEditorLoad(page);     // Arrange (utility)
await clickSideBarAllPageButton(page); // Act
// implicit assertion: page loaded without error
```

**Setup pattern:** Setup is inline in each test body via utility calls — there are no `beforeEach` blocks in `affine-local` tests. The `affine-cloud` tests use `test.beforeEach` for user creation and login (`createRandomUser()`, `loginUser()`). BlockSuite tests use `enterPlaygroundRoom(page)` and `initEmptyParagraphState(page)` as the first two lines of every test.

**Assertions per test:** Low — typically 1-3 `expect()` calls per test. Many tests have a single `expect` at the end (e.g., `settings.spec.ts` tests each check one modal element). The `all-page.spec.ts` "select two pages and delete" test has ~5 assertions. BlockSuite `paragraph.spec.ts` uses custom assertion helpers (`assertTitle`, `assertRichTexts`, `assertBlockType`) averaging 2-4 per test.

**`test.step()` usage:** Not observed in any examined test files. AFFiNE does not use `test.step()` at all. Tests are kept short and single-purpose instead.

**Self-containment:** Tests are fully self-contained. No test depends on state from another test. Each test navigates from `openHomePage(page)` independently. The `fullyParallel: true` config confirms this.

**Average test length:** 15-30 lines for `affine-local` tests. BlockSuite tests tend to be longer (30-50 lines) due to more complex editor interactions. Cloud collaboration tests reach 60-80 lines due to multi-browser context setup.

**Describe-to-test nesting:** Flat — `affine-local` tests have zero `describe` blocks. Tests are at the top level of each file. `affine-cloud` tests also skip `describe`. BlockSuite `paragraph.spec.ts` uses flat `test()` calls with no nesting. The only exception is `affine-cloud-copilot` which organizes into subdirectories instead.

**Utility abstraction depth:** Very high. Virtually all DOM interactions are abstracted into utility modules (`@affine-test/kit/utils/`). There are 19 utility files covering page-logic, sidebar, settings, keyboard, editor, filter, cloud, workspace, etc. The custom `test` export from `@affine-test/kit/playwright` extends the base with a `workspace` fixture and coverage/CDP throttling support.

**Notable pattern: annotation-based issue tracking.** BlockSuite tests use `test.info().annotations.push({ type: 'issue', description: 'https://...' })` to link tests to specific GitHub issues.

### Coverage Strategy

**Features with E2E coverage (affine-local):** All-page listing, journal creation/editing, quick search, navigation history, settings modal, theme switching, page properties, import dialog, drag-page, links, image preview, attachment preview, routing, templates, layout, workspace management (create/delete/list), favorites, collections, trash/restore, export, avatar. Total: 38 spec files.

**Features with E2E coverage (affine-cloud):** Collaboration, comments, login, migration, open-in-app, page history, share page (2 files), storage, templates, workspace management. Total: 13 spec files (including 1 skipped migration test).

**Features with E2E coverage (blocksuite):** Paragraph editing, lists, code blocks, hotkeys, clipboard, bookmarks, attachments, databases, drag, format bar, images, LaTeX, links, linked pages, slash menu, markdown, selections, zero-width chars. Subdirectories: edgeless (28 spec files covering shapes, brushes, connectors, frames, groups, text, etc.), fragments, cross-platform, multiple-editors. Total: ~50+ spec files.

**Additional suites:** Desktop (5 specs), Mobile (7 specs), Desktop-cloud (1 spec), Copilot AI (6+ subdirectories).

**Missing coverage:** No explicit error-path tests (e.g., network failures, corrupt data, permission denied). No performance budget tests. No accessibility-specific tests. No internationalization E2E tests despite i18n support. No offline/sync-conflict E2E tests despite CRDT architecture.

**Tags/annotations:** No `@smoke`, `@critical`, `@regression` tags observed. The `.spec.skip.ts` suffix is used for temporarily disabled tests (e.g., `migration.spec.skip.ts`).

**CI differentiation:** The same `build-test.yml` workflow runs on push to canary/beta/stable branches AND on pull requests. There is no separate nightly or smoke suite. The copilot tests have a separate workflow (`copilot-test.yml`) with a path filter that only triggers when copilot-related code changes.

**Happy-path vs error ratio:** Overwhelmingly happy-path (~95%). Error cases are limited to checking that deleted items stay deleted or that modals close properly. Very few negative test cases.

**Test file distribution:** Roughly 38 local + 13 cloud + 50 blocksuite + 7 mobile + 5 desktop + 1 desktop-cloud + copilot = ~120+ spec files across 7 test projects.

### Scaling Profile

**Total test count (estimated):** ~500+ Playwright tests based on DeepWiki documentation and shard configuration.

**File count:** ~120+ `.spec.ts` files across 7 test project directories.

**Fixture/kit count:** 19 utility files in `tests/kit/src/utils/`, plus `playwright.ts`, `electron.ts`, `mobile.ts` fixture extensions. Additional fixtures in `tests/fixtures/` and per-project fixture directories (e.g., `affine-cloud/e2e/fixtures/`).

**Project count:** 7 separate Playwright projects, each with its own `playwright.config.ts` and `package.json`: `affine-local`, `affine-cloud`, `affine-cloud-copilot`, `affine-desktop`, `affine-desktop-cloud`, `affine-mobile`, `blocksuite`.

**Directory depth:** `tests/{project}/e2e/{category?}/{file}.spec.ts` — maximum 4 levels. BlockSuite goes deeper with `tests/blocksuite/e2e/edgeless/connector/` (5 levels).

**Config complexity:** Each project has a dedicated `playwright.config.ts` (~50-70 lines each). The `affine-local` config specifies `fullyParallel: true`, 4 workers locally, `50%` on CI, 3 retries on CI, webServer command, viewport 1440x800, action timeout 5s, trace/video retain-on-failure.

**CI shard configuration:**
- BlockSuite E2E: 5 shards (single browser) + 1 cross-browser job (3 browsers)
- AFFiNE Local E2E: 5 shards
- Mobile E2E: 2 shards
- Unit tests: 5 shards (vitest, not playwright)
- Server E2E: no sharding (noted as "super fast")
- Total CI workflow: 1357 lines in `build-test.yml`

**Estimated execution time:** Wall-clock ~15-20 minutes with parallelization (from 2+ hours sequential). CI workflow includes CodeQL analysis, linting, typechecking, native builds, and Rust tests in addition to Playwright.

**Distinct test directories:** 7 top-level project directories, each with `e2e/` subdirectories. BlockSuite `e2e/` has 10+ subdirectories with further nesting.

**Restructuring evidence:** The monorepo structure with `@affine-test/kit` as a shared package suggests deliberate refactoring from per-project utilities to a centralized test kit. The `blocksuite` tests import from `./utils/` locally rather than the shared kit, suggesting they originated in the separate blocksuite repo before being merged into the AFFiNE monorepo.

---

## Immich E2E — Three-Lens Analysis

### Test Anatomy

**AAA Pattern:** Immich has TWO distinct test anatomies:

1. **Server/API tests (vitest + supertest):** Classic AAA with heavy `beforeAll` setup. Tests use `describe` > `describe` > `it` nesting. The `beforeAll` block resets the database, creates admin and test users, creates test assets and albums, and sets up shared links. Individual `it` blocks then make HTTP requests and assert responses. Example from `album.e2e-spec.ts`: setup creates 4 users, multiple albums with sharing permissions, then each `it` tests one API endpoint behavior.

2. **Web/UI tests (Playwright):** Lighter setup pattern. `test.beforeAll` creates users via SDK, `test.beforeEach` resets database. Individual tests navigate to pages and interact via Playwright locators (`getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`). The `auth.e2e-spec.ts` tests are sequential within a describe block (registration flow).

3. **UI mock tests (Playwright with route mocking):** Newest pattern. `test.beforeAll` generates timeline data using `SeededRandom` and `faker`. `test.beforeEach` sets up mock API routes. Tests are fully parallel. This is Immich's most sophisticated test anatomy pattern.

**Setup pattern:** Heavy use of `beforeAll` for expensive database resets and user/asset creation. `utils.resetDatabase()` is called at the top of nearly every spec. The `utils.ts` file (120+ lines of helper code visible) provides `adminSetup()`, `userSetup()`, `createAsset()`, `createAlbum()`, `createSharedLink()`, `connectWebsocket()`, `setAuthCookies()`, and more.

**Assertions per test:** Server API tests: 2-5 assertions per `it` (status code + body shape). Web UI tests: 3-8 assertions per test (multiple page interactions verified). UI mock tests: 1-3 assertions per test (focused on navigation/rendering).

**`test.step()` usage:** Not observed in any examined test files.

**Self-containment:** Server tests share state within a `describe` block via `beforeAll` but each `it` is independent. Web tests use `beforeAll` + `beforeEach` database reset. UI mock tests are fully parallel (`test.describe.configure({ mode: 'parallel' })`). Some cross-test state sharing exists in server API tests (user/album references from `beforeAll`).

**Average test length:** Server API `it` blocks: 5-15 lines. Web UI tests: 15-30 lines. UI mock tests: 10-20 lines. Setup blocks (beforeAll): can reach 40-80 lines (e.g., `album.e2e-spec.ts` beforeAll is ~60 lines).

**Describe nesting depth:** 2-3 levels typical. `describe('/albums')` > `describe('GET /albums')` > `it(...)`. Web tests: 1-2 levels. UI tests: 2 levels (`describe('Timeline')` > `describe('/photos')` > `test(...)`).

**Response DTO factory pattern:** `responses.ts` exports pre-built error response shapes (`errorDto.unauthorized`, `errorDto.forbidden`, `errorDto.badRequest(message)`) using `expect.any(String)` for dynamic fields. This is a reusable assertion factory — tests compare against these shapes rather than hand-writing expected objects each time.

**Generator pattern:** `generators.ts` uses a deterministic PNG factory (unique R,G,B values) to produce unique image data for each `createAsset()` call. The UI tests use `SeededRandom` for reproducible randomized test data.

### Coverage Strategy

**Features with server API E2E coverage:** Activity, albums, API keys, assets, downloads, jobs, libraries, maps, memories, OAuth, partners, persons/faces, search, server info, sessions, shared links, stacks, system config, system metadata, tags, trash, user admin, user self-service. Total: 23 API spec files.

**Features with CLI E2E coverage:** Login, server-info, upload, version. Total: 4 spec files.

**Features with web UI E2E coverage:** Albums, auth/registration, photo viewer, shared links, user admin, websocket events. Total: 7 spec files (including `asset-viewer/` subdirectory).

**Features with UI mock coverage:** Asset viewer (4 specs: viewer, broken assets, face editor, stacks), memory viewer, search gallery, timeline. Total: 7+ spec files.

**Features with maintenance coverage:** Separate `maintenance/server` and `maintenance/web` directories for database maintenance scenarios.

**Missing coverage:** No mobile-specific UI tests. No performance/load testing. No accessibility tests. No i18n tests. No notification/email tests. No backup/restore E2E tests (despite being a photo backup tool). Limited error-path coverage in web tests.

**Tags/annotations:** No `@smoke` or `@regression` tags. Test categorization is done via directory structure (server vs web vs ui vs maintenance) and Playwright projects.

**CI differentiation:** Two separate CI jobs:
- `e2e-tests-server-cli`: runs server API + CLI tests via vitest on both ubuntu-latest and ubuntu-24.04-arm
- `e2e-tests-web`: runs web + UI + maintenance tests via Playwright on both ubuntu-latest and ubuntu-24.04-arm
- Path-based filtering: e2e tests only run when `e2e/**` files change, or when `server/**` or `web/**` change
- No nightly or smoke distinction

**Happy-path vs error ratio:** Server API tests: ~70% happy-path, 30% error/permission cases (testing 401, 403, 400 responses). This is the best error coverage ratio of the three suites. Web UI tests: ~90% happy-path.

**Test file distribution:** 23 server API + 4 CLI + 1 admin + 7 web + 7 UI mock + maintenance = ~45+ spec files. Server API tests dominate.

### Scaling Profile

**Total test count (estimated):** ~300-400 tests. The `asset.e2e-spec.ts` alone is 1,243 lines with dozens of `it` blocks. The `search.e2e-spec.ts` is 703 lines.

**File count:** ~45+ spec files across server, web, UI, CLI, and maintenance categories.

**Fixture/utility count:** `fixtures.ts` (user/login DTOs), `generators.ts` (image factory), `responses.ts` (error DTO shapes), `utils.ts` (250+ lines of test helpers), plus per-UI-spec `utils.ts` files. Also `e2e/src/ui/generators/` and `e2e/src/ui/mock-network/` directories.

**Project count in config:** 3 Playwright projects defined: `web` (specs/web, 1 worker), `ui` (UI mock specs, parallel, 3 CI workers), `maintenance` (specs/maintenance/web, 1 worker). Server tests run via vitest, not Playwright.

**Directory depth:** `e2e/src/specs/{category}/{subcategory}/{file}.e2e-spec.ts` — 5 levels from repo root. UI specs: `e2e/src/ui/specs/{feature}/{file}.e2e-spec.ts`.

**Config complexity:** Single `playwright.config.ts` (~65 lines) with 3 projects. `vitest.config.ts` also present for server tests. Docker Compose used for test environment (both `docker-compose.yml` and `docker-compose.dev.yml`). Config exports host/port constants used by test utilities.

**CI configuration:** No sharding. Tests run on 2 architecture variants (x86_64 + ARM) as a matrix. Docker Compose builds the entire application stack for each run. 4 CI retries for Playwright.

**Estimated execution time:** Not documented, but Docker build + server startup + tests likely 10-20 minutes per architecture.

**Distinct test directories:** `specs/server/api/` (23 files), `specs/server/cli/` (4 files), `specs/server/immich-admin/` (1 file), `specs/web/` (7 files), `specs/web/asset-viewer/` (sub), `specs/maintenance/server/`, `specs/maintenance/web/`, `ui/specs/` (4 subdirectories). Total: ~10 distinct directories.

**Restructuring evidence:** The dual-framework approach (vitest for server API + Playwright for web UI) indicates the suite evolved from API-first testing. The newer `ui/` directory with mock network routes and `SeededRandom` generators represents a more recent layer focused on frontend component testing without requiring a full Docker stack. The `maintenance` project is also a newer addition for testing database maintenance scenarios in isolation.

---

## freeCodeCamp E2E — Three-Lens Analysis

### Test Anatomy

**AAA Pattern:** Tests follow a clear Arrange-Act-Assert pattern. Arrange is typically a `page.goto(url)` call (sometimes with `execSync` database seeding in `beforeAll`/`beforeEach`). Act involves user interactions. Assert uses `expect` with Playwright locators. Example from `header.spec.ts`:

```
await page.goto('/');                              // Arrange
await toggleLangButton.click();                     // Act
await expect(langList).toBeVisible();               // Assert
```

**Setup pattern:** Three-tiered:
1. **Global setup (`global-setup.ts`):** Seeds database with `certifieduser` and `developmentuser`, performs API login, saves `storageState` to `playwright/.auth/` JSON files.
2. **`test.use()` for auth switching:** Tests that need the development user override storage state: `test.use({ storageState: 'playwright/.auth/development-user.json' })`.
3. **`test.beforeEach` / `test.beforeAll`:** Some tests reseed the database via `execSync('node ../tools/scripts/seed/seed-demo-user --certified-user')`. This is a blocking synchronous call that runs Node.js seed scripts.

**Assertions per test:** Typically 1-5 per test. Simple rendering tests have 1-2 assertions. Complex flows like `certification.spec.ts` or `settings.spec.ts` have 10-20+ assertions in a single test (checking multiple UI elements on a page). The `settings.spec.ts` "Should render correctly" test has 30+ `expect` calls verifying every privacy toggle and label.

**`test.step()` usage:** Not used anywhere. Tests inline all steps without sub-grouping.

**Self-containment:** Most tests are independent. However, tests that use `execSync` to reseed the database in `beforeAll`/`afterAll` create implicit coupling — a test file that seeds the "development user" restores the "certified user" in `afterAll`, creating ordering sensitivity if it fails. The `workers: 1` config prevents parallel execution, reinforcing sequential assumptions.

**Average test length:** 10-30 lines for typical tests. The `donation-modal.spec.ts` has helper functions spanning 80+ lines that drive multi-step certification completion flows. The `settings.spec.ts` "Should render correctly" test is 100+ lines of assertions.

**Describe-to-test nesting:** 1-2 levels. Most files have `test.describe('Feature Name')` > `test(...)`. Some files like `landing.spec.ts` have multiple describe blocks at the same level for A/B test variations. No deep nesting observed.

**i18n-driven testing pattern:** Unique to freeCodeCamp — nearly all assertion text comes from imported translation JSON files (`../client/i18n/locales/english/translations.json`). Tests verify against translation keys, not hardcoded strings. This means E2E tests also validate i18n key correctness.

**Locator strategy:** Following their documented guidelines:
- `getByRole()` is primary (buttons, links, headings)
- `getByText()` for non-semantic elements
- `getByTestId()` with custom attribute `data-playwright-test-label` as fallback
- `getByLabel()` for form inputs

**Custom test attribute:** Config specifies `testIdAttribute: 'data-playwright-test-label'` rather than the default `data-testid`.

**Documented contributor guidelines:** Official guide at `contribute.freecodecamp.org/how-to-add-playwright-tests/` specifies PR title format (`test(e2e,playwright): <component-name>`), locator priority, and code reuse expectations.

### Coverage Strategy

**Features with E2E coverage:** Landing page, header/footer, sign-in/sign-out, settings (privacy, email, portfolio, internet presence), profile, certifications (display, sharing, social links), editor (code editing, theme, tabs, reset), challenge workflows (description, completion modal, reset modal, code storage), search bar (default + optimized), navigation (breadcrumbs, block navigation, sidebar), donation (modal, page, third-party), exams (results, survey, token, started-show, qualified/non-qualified), SEO metadata, 404/not-found pages, mobile layout, desktop layout, map page, learn page, super-block pages, intro pages, C#/SASS/Python-specific challenges, multifile projects, video player, help modals, progress bars, notes, output panel, flash messages, A/B test variations. Total: 117 `.spec.ts` files.

**Missing coverage:** No API-level E2E tests (only UI tests). No database migration tests. No performance tests. No load testing. No email delivery verification (mailpit is started but only for functional tests). No webhook tests. No admin panel tests. No payment/subscription workflow tests beyond donation modals. Limited cross-browser coverage (chromium-only in CI despite config defining Firefox/WebKit/mobile projects).

**Tags/annotations:** No `@smoke`, `@critical`, or `@regression` tags. The `--grep-invert 'third-party-donation.spec.ts'` in CI excludes one specific test file from regular runs, suggesting it requires special third-party service availability.

**CI differentiation:** Single CI workflow (`e2e-playwright.yml`) runs on PRs to main. Only chromium browser matrix is active (Firefox/WebKit projects defined in config but not used in CI). No nightly runs. No shard splitting. A separate `e2e-third-party.yml` handles the excluded third-party donation test.

**Happy-path vs error ratio:** ~90% happy-path. Error tests are limited to: 404 page rendering, invalid URL handling, blocked user page, failed update scenarios (`failed-updates.spec.ts`). No explicit permission-denied, network-error, or timeout-recovery tests.

**Test file distribution:** 117 spec files in a single flat `e2e/` directory (no subdirectories for grouping). Files are named by feature/component (`header.spec.ts`, `editor.spec.ts`, `settings.spec.ts`). The flat structure means all features live at the same organizational level regardless of importance.

### Scaling Profile

**Total test count (estimated):** ~400-600 tests across 117 spec files (averaging 3-5 tests per file, with some files like `settings.spec.ts` and `landing.spec.ts` containing 10+ tests).

**File count:** 117 `.spec.ts` files + 1 `global-setup.ts` + 7 utility files + 10 fixture files + config files = ~140 files in the `e2e/` directory.

**Fixture count:** 10 JSON fixture files (algolia search results, quiz data, challenge data, donation mocks). 7 utility modules (`alerts.ts`, `editor.ts`, `email.ts`, `logout.ts`, `request.ts`, `url.ts`, `add-growthbook-cookie.ts`, `user-agent.ts`).

**Project count in config:** 6 projects defined: `setup` (global auth), `chromium`, `firefox`, `webkit`, `Mobile Chrome`, `Mobile Safari`. Only `chromium` is run in CI.

**Directory depth:** Flat — `e2e/{file}.spec.ts`. Only 2 subdirectories: `e2e/utils/` and `e2e/fixtures/`. Maximum depth is 2 levels from `e2e/`.

**Config complexity:** Single `playwright.config.ts` (~90 lines). Notable settings: `fullyParallel: false`, `workers: 1`, `maxFailures: 6` on CI, `retries: 2` on CI, `timeout: 15s`, custom `testIdAttribute`, `storageState` for default auth, `webServer` starts mailpit via Docker.

**CI configuration:** No sharding. Single browser (chromium). Sequential execution (`workers: 1`). The CI workflow has 3 jobs: `build-client` (builds static assets), `build-api` (Docker container), `playwright-run` (downloads artifacts, loads Docker image, seeds DB, runs tests). This is a build-then-test pipeline.

**Estimated execution time:** With `workers: 1` and ~400-600 tests at 15s timeout, worst case is very long. Practical execution likely 15-30 minutes given most tests complete well under timeout. The `maxFailures: 6` fast-fail mechanism limits wasted CI time.

**Distinct test directories:** 1 main directory (`e2e/`) + 2 helper directories (`utils/`, `fixtures/`). All spec files are in the root `e2e/` folder. This is the flattest structure of the three suites.

**Restructuring evidence:** The project is mid-migration from Cypress to Playwright. The `e2e-playwright.yml` workflow name and flat directory structure suggest the suite was initially ported file-by-file from Cypress (which also uses a flat directory convention). The custom `data-playwright-test-label` attribute (rather than standard `data-testid`) is a freeCodeCamp-specific convention, and there was a community discussion (issue #51770) that led to shifting from test-ID-first to role-first locator strategy. The config defines 6 browser/device projects but only runs chromium in CI, indicating planned but not yet implemented cross-browser coverage.

---

## Cross-Suite Observations

### Test Anatomy Patterns

| Pattern | AFFiNE | Immich | freeCodeCamp |
|---------|--------|--------|--------------|
| AAA adherence | Loose, utility-abstracted | Strong in API tests | Clear in simple tests |
| Setup strategy | Inline utility calls | beforeAll + DB reset | Global setup + execSync seed |
| Avg assertions/test | 1-3 | 2-5 (API), 3-8 (web) | 1-5 (up to 30 in verification tests) |
| `test.step()` usage | None | None | None |
| Describe nesting | Flat (0 levels) | 2-3 levels | 1-2 levels |
| Avg test length | 15-30 lines | 5-15 (API), 15-30 (web) | 10-30 lines |
| Self-contained | Yes (fullyParallel) | Mostly (beforeAll shared state) | Mostly (workers: 1 serial) |

**Key finding: None of the three suites use `test.step()`.** This is significant because `test.step()` is often recommended in Playwright documentation and testing guides. These production suites prefer short, focused tests over long tests with sub-steps.

**Key finding: `describe` usage inversely correlates with test count per file.** AFFiNE (many small files, no describes) vs Immich API tests (large files, nested describes) vs freeCodeCamp (medium files, 1 describe level). Suites with more tests per file use more describe nesting for organization.

### Coverage Strategy Patterns

| Pattern | AFFiNE | Immich | freeCodeCamp |
|---------|--------|--------|--------------|
| Total spec files | ~120+ | ~45+ | 117 |
| Error-path coverage | ~5% | ~30% (API) | ~10% |
| CI subset differentiation | Copilot filtered by path | server vs web separate jobs | third-party excluded |
| Tags/annotations | None | None | None |
| Cross-browser CI | BlockSuite only | No | No (defined but unused) |
| Documented test strategy | No | Basic (docs.immich.app) | Yes (contributor guide) |

**Key finding: None of the three suites use test tags.** No `@smoke`, `@critical`, or `@regression` annotations. Test categorization is done exclusively through directory structure and CI workflow configuration. This contradicts common recommendations for large suites.

**Key finding: Error-path coverage is universally weak in UI tests but stronger in API tests.** Immich's server API tests are the exception, with meaningful 401/403/400 coverage — but this is vitest, not Playwright.

### Scaling Organization Patterns

| Metric | AFFiNE | Immich | freeCodeCamp |
|--------|--------|--------|--------------|
| Est. total tests | ~500+ | ~300-400 | ~400-600 |
| Spec files | ~120+ | ~45+ | 117 |
| Test projects | 7 | 3 (PW) + vitest | 6 (1 active) |
| CI shards | 5+5+2 = 12 PW shards | 0 (2 arch variants) | 0 |
| Workers | 50% CI / 4 local | 4 CI / 75% local | 1 (serial) |
| Directory depth | 4-5 levels | 5 levels | 2 levels (flat) |
| Config lines | ~50-70 per project (x7) | ~65 (single) | ~90 (single) |
| CI workflow lines | 1,357 | ~560 (test.yml) | ~180 |

**Key finding: Scaling strategy varies enormously.** AFFiNE splits into 7 independent projects with 12 shards. Immich uses 3 Playwright projects + vitest in a single config. freeCodeCamp uses a flat directory with serial execution. The suite that needs parallelization most (freeCodeCamp, with ~400-600 tests) runs with `workers: 1`.

**Key finding: Directory structure reflects project architecture, not test count.** AFFiNE's 7 test projects mirror its 7 deployment targets (local, cloud, desktop, mobile, etc.). Immich's server/web/ui/maintenance split mirrors its architecture. freeCodeCamp's flat structure reflects its monolithic React application.

**Key finding: Shared test utilities emerge at ~100 spec files.** AFFiNE has the most sophisticated shared kit (`@affine-test/kit` as a monorepo package). Immich uses a simpler shared `utils.ts` + `fixtures.ts`. freeCodeCamp has the lightest utility layer (7 small files). Utility sophistication correlates with test project count more than total test count.
