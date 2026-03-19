# Round 58 Findings — Re-analyze Excalidraw, Slate, and Supabase (Anatomy, Coverage, Scaling)

## Excalidraw — Three-Lens Analysis

### Test Anatomy

**Framework note:** Excalidraw uses Vitest with React Testing Library, not Playwright. This makes it a component/integration testing suite rather than a browser E2E suite. However, the test anatomy patterns are still instructive because the tests simulate complex user interactions (pointer events, keyboard shortcuts, drag operations) at a level comparable to E2E tests.

**AAA Pattern:** Strong compliance (~85%). Most tests follow a clear Arrange-Act-Assert structure. The "Arrange" phase uses `API.createElement()` or `API.setElements()` to set up scene state. The "Act" phase uses `Pointer` and `Keyboard` helper classes to simulate interactions. The "Assert" phase uses `expect()` with snapshot and state assertions. However, longer tests (especially in `history.test.tsx`) interleave assertions throughout execution rather than grouping them at the end, particularly when testing multi-step undo/redo sequences.

**Setup Mechanisms:**
- `beforeEach` is the dominant pattern: clears localStorage, resets mocks, reseeds randomization (deterministic seed e.g. `seed: 7`), renders `<Excalidraw />` component
- `beforeAll`/`afterAll` for expensive mocks like `mockBoundingClientRect()` / `restoreOriginalGetBoundingClientRect()`
- Inline setup via `API.createElement()`, `API.setElements()`, `API.setAppState()` within test bodies
- No fixture-based DI pattern -- everything is imperative
- `GlobalTestState` singleton provides shared render state across helpers
- Spy setup on render functions (`renderInteractiveScene`, `renderStaticScene`) to count re-renders
- File: `packages/excalidraw/tests/test-utils.ts` provides `renderApp()`, custom matchers (`toBeNonNaNNumber`), and assertion helpers (`assertSelectedElements`, `checkpointHistory`)

**Assertions per test:**
- Simple tests (shortcuts, basic creation): 1-4 assertions
- Medium tests (selection, move, flip): 4-8 assertions
- Complex tests (history, arrow binding): 8-25+ assertions
- Average across all sampled files: ~5 assertions per test

**`test.step()` usage:** Zero. Not a single instance across any test file. Tests use standard `it()` blocks from Vitest. No sub-step organization exists.

**Self-containment:** Tests are fully self-contained. Each test creates its own elements via API helpers and does not depend on state from previous tests. The `beforeEach` resets all state including localStorage, mocks, and random seed. No cross-file dependencies detected.

**Test length:**
- Short tests: 4-12 lines (basic creation, shortcuts)
- Medium tests: 15-40 lines (selection, move, flip)
- Long tests: 40-80+ lines (history undo/redo, complex arrow binding)
- Average: ~20 lines per test

**Describe nesting depth:**
- Typical: 2 levels (describe -> it)
- Maximum: 3-4 levels (describe -> describe -> it, plus `waitFor` nesting)
- File `arrowBinding.test.tsx`: 3 levels of describe nesting

**Key helper classes (from `helpers/ui.ts` and `helpers/api.ts`):**
- `Keyboard` class: `withModifierKeys()`, `keyDown/Up/Press()`, `undo()`, `redo()`
- `Pointer` class: `move()`, `down()`, `up()`, `click()`, `doubleClick()`, `select()`, `clickOn()`
- `UI` class: `clickTool()`, `createElement()`, `editText()`, `resize()`, `crop()`, `rotate()`, `group()`
- `API` class: `createElement()`, `setElements()`, `setAppState()`, `executeAction()`, `drop()`
- Proxy pattern wrapping elements to prevent stale references

### Coverage Strategy

**Features with tests:**
- Drawing/creation (rectangles, ellipses, diamonds, arrows, lines, freedraw): `dragCreate.test.tsx` (11 tests)
- Selection mechanics: `selection.test.tsx` (19 tests)
- Move/transform: `move.test.tsx` (3 tests), `flip.test.tsx` (42 tests, 14 skipped), `rotate.test.tsx`
- Arrow binding: `arrowBinding.test.tsx` (24 tests)
- History/undo/redo: `history.test.tsx` (40+ tests, including multiplayer)
- Context menu: `contextmenu.test.tsx` (21 tests)
- Library management: `library.test.tsx` (7 tests)
- Clipboard operations: `clipboard.test.tsx`
- Charts/Mermaid: `charts.test.tsx`, `mermaid.test.ts`
- Element locking: `elementLocking.test.tsx`
- Data operations: `data/restore.test.ts`, `data/reconcile.test.ts`
- Regression coverage: `regressionTests.test.tsx` (~60+ parameterized tests)
- Component rendering: `excalidraw.test.tsx` (24 tests)
- Image handling: `image.test.tsx`
- Search: `search.test.tsx`
- Scroll: `scroll.test.tsx`
- View mode: `viewMode.test.tsx`
- Laser pointer: `laser.test.tsx`
- Lasso selection: `lasso.test.tsx`
- Fit to content: `fitToContent.test.tsx`
- Tool behavior: `tool.test.tsx`

**Features missing tests:**
- Collaboration/real-time sync (only undo/redo multiplayer scenarios in history.test.tsx)
- Export/import workflows (partial in `export.test.tsx`)
- Authentication/login flows
- Performance/load testing
- Accessibility testing
- Mobile/touch interaction (partial in regressionTests)
- Error handling/recovery

**Tag usage:** Zero. No `@smoke`, `@critical`, `@regression`, or similar tags. The `regressionTests.test.tsx` file is named as a regression suite but not tagged.

**CI workflow (`test.yml`):**
- Trigger: push to `master` only (not PRs)
- Single job, no matrix, no sharding
- Command: `yarn test:app`
- No PR vs merge vs nightly differentiation
- No browser matrix

**Happy-path vs error/edge-case ratio:** ~90% happy-path, ~10% edge cases. The edge cases that exist are behavioral edge cases (e.g., "do not add element if size too small", "noop interaction after undo shouldn't create history entry") rather than error-handling tests. No tests for invalid input, network failures, or corrupt data recovery.

**Test file count:** ~30 test files in `packages/excalidraw/tests/` plus ~3 colocated test files (charts.test.ts, clipboard.test.ts, mermaid.test.ts).

**Feature distribution:** Heavily weighted toward interaction mechanics (selection, creation, transform). Under-represented: data operations, collaboration, accessibility.

### Scaling Profile

**Test count:** ~300+ individual tests across all files
**Test file count:** ~33 files
**Fixture files:** 11 fixture files in `tests/fixtures/` (images, diagram data, library data, constants)
**Helper files:** 7 files in `tests/helpers/` (api.ts, ui.ts, constants.ts, colorize.ts, mocks.ts, polyfills.ts) plus `test-utils.ts` and `tests/queries/`
**Projects:** 1 (Vitest, single config)
**Directory depth:** 3 levels max (`tests/data/__snapshots__/`, `tests/scene/__snapshots__/`)
**Config complexity:** Single Vitest config (not Playwright), low complexity
**CI shards:** 0 (single job)
**Snapshot files:** 13 `__snapshots__` files for visual regression
**Evidence of restructuring:** The colocated test files (`charts.test.ts`, `clipboard.test.ts`, `mermaid.test.ts` at package root) alongside the `tests/` directory suggest organic growth rather than a planned restructuring. Helper classes (`Keyboard`, `Pointer`, `UI`, `API`) indicate deliberate investment in test infrastructure.

---

## Slate — Three-Lens Analysis

### Test Anatomy

**Framework:** Playwright Test (genuine E2E suite). Tests in `playwright/integration/examples/` correspond 1:1 with example pages served at `http://localhost:3000/examples/{name}`.

**AAA Pattern:** Strong compliance (~90%). Almost all tests follow a clear structure:
- Arrange: `beforeEach` navigates to example page
- Act: Playwright interactions (click, type, pressSequentially)
- Assert: `expect()` with Playwright matchers (toContain, toBeVisible, toHaveCount)

The separation is clean because navigation is always in `beforeEach`, keeping test bodies focused on Act and Assert.

**Setup Mechanisms:**
- `test.beforeEach()` with `page.goto()` is the universal pattern -- every single test file uses this
- No `beforeAll` or `afterAll` hooks in any test file
- No fixture extensions or custom test base
- No factory functions or API setup
- No data seeding or database operations
- Purely navigational setup -- navigate to example page, then interact

**Assertions per test:**
- Minimal tests (existence checks): 1 assertion (images, embeds, tables, iframe)
- Medium tests (interaction checks): 2-4 assertions (richtext, mentions, check-lists)
- Complex tests (styling, code-highlighting): 8-27 assertions
- Average across all files: ~3.3 assertions per test

**`test.step()` usage:** Zero across all 22 test files. No sub-step organization.

**Self-containment:** Perfectly self-contained. Each test navigates to a fresh example page via `beforeEach`. No shared state between tests. No inter-file dependencies.

**Test length:**
- Very short tests: 2-5 lines (existence checks like images, tables, embeds)
- Short tests: 5-10 lines (interaction + assertion)
- Medium tests: 10-20 lines (multi-step interactions)
- Long tests: 20-36 lines (undo/scroll, code-highlighting)
- Average: ~8 lines per test

**Describe nesting depth:** Uniformly 2 levels (describe -> test). No nested describes in any file.

**Notable patterns:**
- `data-test-id` attribute used for test targeting (configured in `playwright.config.ts` as `testIdAttribute: 'data-test-id'`)
- `pressSequentially()` used for character-by-character input (rich text editor testing)
- `page.evaluate()` for direct DOM/browser API access (e.g., `selection.anchorNode`)
- Browser-conditional logic: Markdown shortcuts test has WebKit-specific keyboard input path
- One test file (`inlines.test.ts`) has a skipped test with FIXME comment indicating instability
- Docker configuration for containerized test execution (`playwright/docker/`)

### Coverage Strategy

**Features with tests (22 test files, one per example):**
- Rich text editing: `richtext.test.ts` (3 tests)
- Plain text: `plaintext.test.ts` (1 test)
- Tables: `tables.test.ts` (1 test)
- Images: `images.test.ts` (1 test)
- Inlines: `inlines.test.ts` (2 tests, 1 skipped)
- Check-lists: `check-lists.test.ts` (1 test)
- Mentions: `mentions.test.ts` (3 tests)
- Markdown shortcuts: `markdown-shortcuts.test.ts` (3 tests)
- Markdown preview: `markdown-preview.test.ts`
- Code highlighting: `code-highlighting.test.ts` (3 parameterized tests)
- Hovering toolbar: `hovering-toolbar.test.ts` (2 tests)
- Editable voids: `editable-voids.test.ts` (3 tests)
- Embeds: `embeds.test.ts` (1 test)
- Forced layout: `forced-layout.test.ts` (2 tests)
- Huge document: `huge-document.test.ts` (1 test)
- Placeholder: `placeholder.test.ts` (2 tests)
- Read-only: `read-only.test.ts` (1 test)
- Search highlighting: `search-highlighting.test.ts`
- Select: `select.test.ts` (1 test)
- Shadow DOM: `shadow-dom.test.ts` (3 tests)
- Iframe: `iframe.test.ts` (1 test)
- Styling: `styling.test.ts` (2 tests)
- Paste HTML: `paste-html.test.ts`

**Features missing tests:**
- Error handling (invalid content, corrupt state)
- Collaborative editing
- Mobile/touch interactions
- Accessibility (keyboard navigation, screen reader)
- Performance under load (huge-document exists but is just a rendering check)
- Copy/paste edge cases
- Undo/redo beyond basic (only in richtext.test.ts)
- RTL text support

**Tag usage:** Zero. No tags of any kind.

**CI workflow (`ci.yml`):**
- Trigger: push and pull_request (same tests for both)
- 5-job matrix: test, test:integration, lint:eslint, lint:prettier, lint:typescript
- No sharding within integration tests
- No nightly differentiation
- Artifact upload for Playwright results (30-day retention)
- No browser matrix in CI (config has chromium, firefox, mobile, webkit but CI runs all)

**Happy-path vs error/edge-case ratio:** ~95% happy-path, ~5% edge cases. The only edge case is `forced-layout.test.ts` testing persistence after deletion. No error-path tests exist.

**Test file count:** 22 test files
**Total tests:** ~35 across all files

**Feature distribution:** Even distribution -- one test file per example/feature. But extremely shallow coverage per feature (average 1.6 tests per file).

### Scaling Profile

**Test count:** ~35 individual tests
**Test file count:** 22
**Fixture count:** 0 (no custom fixtures)
**Project count:** 4 browser projects (chromium, firefox, mobile/Pixel 5, webkit/macOS-only)
**Directory depth:** 2 levels (`playwright/integration/examples/`)
**Config complexity:** ~50 lines, 4 browser projects, custom timeouts (20s test, 8s expect), Docker support
**CI shards:** 0 (single job per matrix entry)
**Distinct test directories:** 1 (`playwright/integration/examples/`)
**Execution time:** Not documented; 20s timeout per test suggests <10min total
**Docker support:** Full Docker configuration with `docker-compose.yml`, `Dockerfile`, custom entry script
**Evidence of restructuring:** None apparent. The 1:1 mapping of test files to examples suggests the test suite was designed organically alongside the examples and has not been restructured. The Docker setup indicates maturity investment in execution environment rather than test organization.

---

## Supabase Studio E2E — Three-Lens Analysis

### Test Anatomy

**Framework:** Playwright Test with custom fixture extensions. This is the most sophisticated of the three suites in terms of test infrastructure.

**AAA Pattern:** Moderate compliance (~70%). Tests follow a loose Arrange-Act-Assert structure, but the Act and Assert phases are frequently interleaved, especially in longer tests. The `withSetupCleanup` pattern handles Arrangement, but within test bodies, assertions are often placed immediately after each UI action rather than grouped at the end.

**Setup Mechanisms (ranked by frequency):**
1. **`withSetupCleanup()` (dominant pattern):** Async disposable pattern using `await using _ = await withSetupCleanup(setup, cleanup)`. Setup creates database tables, enables extensions, or seeds data. Cleanup drops tables or reverts state. Guarantees cleanup via `Symbol.asyncDispose`. Used in: `table-editor.spec.ts`, `database.spec.ts`, `rls-policies.spec.ts`, `cron-jobs.spec.ts`, `api-access-toggle.spec.ts`, `filter-bar.spec.ts`, `index-advisor.spec.ts`.
2. **`test.beforeEach()` with navigation:** Standard navigation to feature page. Used alongside `withSetupCleanup`.
3. **`beforeAll`/`afterAll` with shared browser context:** `sql-editor.spec.ts` creates a single page in `beforeAll` and shares it across all tests. Cleanup in `afterAll` removes SQL snippets and folders.
4. **`withFileOnceSetup()` / `releaseFileOnceCleanup()`:** File-level one-time setup for expensive operations like extension creation. Used in `cron-jobs.spec.ts`, `index-advisor.spec.ts`.
5. **Global setup project (`_global.setup.ts`):** Authenticates via email/password or GitHub OAuth, validates API availability, creates test project, stores auth state.
6. **Custom `test` fixture (`utils/test.ts`):** Extends base test with `env`, `ref`, and `apiUrl` options. Injects localStorage values to dismiss UI banners.
7. **API response waiters:** `createApiResponseWaiter()` for synchronizing with backend pg-meta endpoints.

**Assertions per test:**
- Simple tests (navigation, visibility): 1-3 assertions
- Medium tests (CRUD, dialogs): 4-8 assertions
- Complex tests (table editor importing, filter bar): 10-25 assertions
- Average across all sampled files: ~5 assertions per test

**`test.step()` usage:** Zero across all 18 spec files. Despite having tests up to 180 lines long with multiple logical phases, no test.step() is used anywhere.

**Self-containment:** Mostly self-contained via `withSetupCleanup`. Exception: `sql-editor.spec.ts` shares a page instance across tests in serial mode with state accumulation. Each test creates its own database resources and cleans them up, but the shared page could carry state.

**Test length:**
- Short tests: 8-20 lines (home, connect, status-page-banner)
- Medium tests: 30-60 lines (CRUD operations, RLS policies)
- Long tests: 60-180 lines (table editor importing, filter bar keyboard navigation)
- Average: ~40 lines per test

**Describe nesting depth:**
- Typical: 2 levels (describe -> test)
- Maximum: 3 levels (describe -> describe -> test, as in `database.spec.ts`)
- `filter-bar.spec.ts` uses many sibling describe blocks but doesn't nest deeper than 2

**Notable patterns:**
- `uniqueNames()` with `parallelIndex` for test isolation in parallel execution
- `page.waitForTimeout()` calls scattered through tests for UI stability (anti-pattern acknowledged by Playwright docs)
- Assertion messages as strings: `expect(element).toBeVisible({ message: 'Should show...' })` for debugging
- Route interception for API mocking in `logs.spec.ts`
- Conditional test skipping via `test.skip(isCLI(), 'reason')` and `test.skip(!process.env.OPENAI_API_KEY)`
- `testRunner()` wrapper that selects `test.describe.serial` or `test.describe` based on environment
- Documented testing guidelines in `e2e/studio/README.md`

### Coverage Strategy

**Features with E2E tests (18 spec files):**
- Table editor: `table-editor.spec.ts` (18 tests) -- CRUD, import/export, filtering, sorting, foreign keys, enums
- SQL editor: `sql-editor.spec.ts` (10 tests) -- execution, safety blocks, export, snippets, folders
- Storage: `storage.spec.ts` (22 tests) -- buckets, files, folders, URLs, settings
- Database: `database.spec.ts` (19 tests) -- schema visualizer, tables, triggers, indexes, roles, enums, functions
- RLS policies: `rls-policies.spec.ts` (9 tests) -- CRUD, schema switching, table editor badge
- Auth users: `auth-users.spec.ts` (2 tests) -- create, delete
- Filter bar: `filter-bar.spec.ts` (39 tests) -- keyboard navigation, boolean/date filters, error feedback
- Cron jobs: `cron-jobs.spec.ts` (11 tests) -- CRUD, history, high-cost banner
- Realtime inspector: `realtime-inspector.spec.ts` (8 tests) -- UI, broadcast, message display
- Home page: `home.spec.ts` (1 test)
- Connect dialog: `connect.spec.ts` (3 tests)
- Logs: `logs.spec.ts` (2 tests) -- API gateway, Postgres (mocked)
- Database webhooks: `database-webhooks.spec.ts` (4 tests)
- Queue table operations: `queue-table-operations.spec.ts` (17 tests)
- API access toggle: `api-access-toggle.spec.ts` (4 tests)
- Index advisor: `index-advisor.spec.ts` (2 tests)
- Assistant: `assistant.spec.ts` (1 test, requires OPENAI_API_KEY)
- Status page banner: `status-page-banner.spec.ts` (1 test)
- Log drains: `log-drains.spec.ts` (4 tests)

**Features missing E2E tests:**
- Edge functions management
- Branching/preview environments
- Billing/subscription management
- Project creation/deletion workflows
- Organization management
- Database backups/restore
- Custom domains
- Network restrictions/IP allowlisting
- Comprehensive auth provider configuration
- Performance monitoring/query analysis

**Tag usage:** Zero. No `@smoke`, `@critical`, or similar tags.

**CI workflow (`studio-e2e-test.yml`):**
- Trigger: push to master AND pull requests (same tests)
- 2-shard matrix with `fail-fast: false`
- Chromium only (with 40+ Chrome flags for CI optimization)
- Path filtering to only run when studio-related files change
- Blob report merge across shards
- PR comment with results via `daun/playwright-report-comment`
- `maxFailures: 3` to stop early on widespread breakage
- 5 retries in CI, 0 locally

**Happy-path vs error/edge-case ratio:** ~85% happy-path, ~15% edge cases. Edge cases include: SQL safety blocks (blocking destructive queries), filter error feedback, cancel operations, nullable boolean handling, stale filter cleanup. This is the highest edge-case ratio of the three suites.

**Test file count:** 18 spec files + 1 global setup + 1 merge config
**Total tests:** ~177 across all spec files
**Utility files:** 15 files in `utils/` and `scripts/`

**Feature distribution:** Heavily weighted toward table editor (18 tests) and filter bar (39 tests). Storage (22) and database (19) are also well-covered. Auth users has only 2 tests despite being a critical feature.

### Scaling Profile

**Test count:** ~177 individual tests
**Test file count:** 18 spec files
**Fixture count:** 1 custom test fixture (extends base with env, ref, apiUrl)
**Utility files:** 15 (auth-helpers, db client/queries, storage client/queries, filter-bar-helpers, realtime-helpers, table-helpers, dismiss-toast, debug, once-per-file, wait-for-response, reset-local-storage, to-url, is-cli)
**Project count:** 2 Playwright projects (setup + features)
**Directory depth:** 3 levels (`e2e/studio/features/`, `e2e/studio/utils/`, `e2e/studio/scripts/`)
**Config complexity:** ~80 lines, 2 projects with setup dependency, conditional serial/parallel based on environment, 40+ Chrome launch flags, conditional storage state, merge config for shard reports
**CI shards:** 2 shards
**Distinct test directories:** 1 (`features/`)
**Data files:** 5 test data files in `features/files/` (CSV, TXT for import testing)
**Evidence of restructuring:** The `withSetupCleanup` pattern and the `withFileOnceSetup` pattern suggest deliberate infrastructure investment. The `testRunner()` wrapper that conditionally applies serial mode indicates adaptation to platform rate limits. The `playwright.merge.config.ts` for shard report merging shows CI pipeline maturity. The README with testing guidelines suggests intentional team scaling.

---

## Cross-Suite Observations

### Test Anatomy Patterns

| Dimension | Excalidraw | Slate | Supabase |
|-----------|-----------|-------|----------|
| Framework | Vitest + RTL | Playwright | Playwright |
| AAA compliance | ~85% | ~90% | ~70% |
| Setup approach | beforeEach + inline API | beforeEach + page.goto | withSetupCleanup + beforeEach + global setup |
| Avg assertions/test | ~5 | ~3.3 | ~5 |
| test.step() usage | 0% | 0% | 0% |
| Avg test length | ~20 lines | ~8 lines | ~40 lines |
| Max nesting depth | 3-4 | 2 | 3 |
| Self-containment | Full | Full | Mostly (sql-editor shares page) |

**Key finding: test.step() is confirmed absent across all three Gold-tier suites.** This extends the Round 56-57 finding. Zero usage in 73 test files totaling ~500+ individual tests. Production suites do not use test.step() for sub-step organization.

**Setup complexity scales with product complexity:**
- Slate (library examples): Navigation-only setup. No data, no auth, no cleanup needed.
- Excalidraw (rich application): Component rendering + mock management + state seeding via API helpers.
- Supabase (platform with database): Global auth + project setup + per-test database table creation + cleanup via async disposables + API response synchronization.

**Assertion density correlates with test complexity, not framework:**
- Both Excalidraw (Vitest) and Supabase (Playwright) average ~5 assertions/test
- Slate averages only ~3.3 because many tests are simple existence checks (1 assertion)
- Long Supabase tests (filter-bar, table-editor) reach 25+ assertions

### Coverage Strategy Patterns

| Dimension | Excalidraw | Slate | Supabase |
|-----------|-----------|-------|----------|
| Tag usage | None | None | None |
| CI differentiation | None (master-only) | None (same for push/PR) | Path filtering, 2 shards |
| Happy/error ratio | 90/10 | 95/5 | 85/15 |
| Test files | ~33 | 22 | 18 |
| Total tests | ~300+ | ~35 | ~177 |
| Tests per file avg | ~9 | ~1.6 | ~9.8 |

**Key finding: No tag system in any suite.** Coverage tiers are entirely structural -- organized by feature directories or file naming. There is no `@smoke` subset, no `@critical` priority, no `@regression` annotation. CI runs all tests or none.

**Coverage breadth vs depth trade-off:**
- Slate: Broad coverage (22 features) but extremely shallow (1.6 tests per feature). Prioritizes "does each example work at all?" over thorough feature testing.
- Excalidraw: Moderate breadth with deep coverage on core interactions (history: 40+ tests, flip: 42 tests). Prioritizes interaction correctness.
- Supabase: Moderate breadth (18 features) with focused depth on table operations (filter-bar: 39 tests, table-editor: 18 tests). Reflects user journey importance.

**Error-path coverage remains minimal (5-15%)** across all three suites, confirming Round 56-57 findings. Edge cases that do exist are behavioral (e.g., "what happens if element is too small") rather than error-handling (e.g., "what happens if API returns 500").

### Scaling Organization Patterns

| Dimension | Excalidraw | Slate | Supabase |
|-----------|-----------|-------|----------|
| Total tests | ~300+ | ~35 | ~177 |
| CI shards | 0 | 0 | 2 |
| Browser projects | 0 (Vitest) | 4 | 1 (chromium) |
| Custom fixtures | 0 | 0 | 1 |
| Utility files | 7+ | 0 | 15 |
| Directory depth | 3 | 2 | 3 |
| Setup projects | 0 | 0 | 1 (global setup) |

**Sharding threshold observation:** Supabase is the only suite using sharding (2 shards for ~177 tests). Slate (35 tests) and Excalidraw (300+ tests, but Vitest is faster than Playwright) do not shard. This suggests sharding becomes necessary at ~100+ Playwright E2E tests or when execution time exceeds acceptable CI limits.

**Infrastructure investment scales with organizational complexity:**
- Slate: Zero custom infrastructure. Raw Playwright API with `beforeEach` navigation. Works because the suite is small and tests are independent.
- Excalidraw: Significant custom helper classes (Keyboard, Pointer, UI, API) but no Playwright-specific infrastructure. Investment is in interaction simulation, not test orchestration.
- Supabase: Full infrastructure stack: custom fixtures, async disposable cleanup, API response waiters, global setup project, auth helpers, database client utilities, conditional serial/parallel execution, shard report merging. This is the most production-ready test infrastructure of the three.

**The async disposable pattern (`await using _ = await withSetupCleanup()`) in Supabase is a novel finding.** This leverages the TC39 Explicit Resource Management proposal for guaranteed cleanup. It is more robust than try/finally and more ergonomic than afterEach. This pattern was not observed in Rounds 1-57.

**Suite organization follows product architecture:**
- Slate: Example-per-file mapping mirrors the examples directory. Test structure = product structure.
- Excalidraw: Feature-per-file mapping (selection, history, flip, etc.) mirrors the interaction model. Test structure = interaction model.
- Supabase: Feature-per-file mapping (table-editor, sql-editor, storage, etc.) mirrors the Studio dashboard sections. Test structure = product navigation.
