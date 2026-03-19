# Round 56 Findings — Re-analyze Grafana and Cal.com (Anatomy, Coverage, Scaling)

## Grafana E2E — Three-Lens Analysis

### Test Anatomy

**AAA Pattern:** Grafana tests follow a loosely-applied Arrange-Act-Assert pattern. Most tests combine arrangement and action inline rather than separating them into distinct phases. The typical flow is: navigate to page, interact with elements, assert visibility/state. Pure AAA is rare because E2E interactions are inherently sequential, so action and assertion are often interleaved.

**Setup Mechanisms:**
- `beforeAll` with API calls for heavy setup (e.g., importing dashboards via `request.post('/api/dashboards/import')` in `dashboard-browse.spec.ts`)
- `afterAll` / `afterEach` for cleanup via API (e.g., `request.delete('/api/dashboards/uid/${dashboardUID}')`)
- `test.use()` blocks at module level for feature toggle configuration -- this is a **unique Grafana pattern** using `featureToggles` to control which Grafana features are enabled for a test file
- Custom fixtures from `@grafana/plugin-e2e` (e.g., `gotoDashboardPage`, `createDataSourceConfigPage`, `selectors`) handle navigation and element location
- Very little inline data construction -- most tests operate against pre-provisioned dashboards loaded via `devenv/` provisioning files or JSON dashboard fixtures in `e2e-playwright/dashboards/`

**Assertions per test:**
- Simple tests (navigation, smoke): 2-4 assertions
- Medium complexity (panels, templating): 5-10 assertions
- Complex CUJ tests (dashboard-view.spec.ts): 15-25+ assertions spread across `test.step()` blocks
- Average across sampled files: ~6 assertions per test

**`test.step()` usage:** Moderate but intentional. Found in:
- `dashboard-view.spec.ts`: Heavy usage with numbered steps ("1.Loads dashboard successfully", "2.Top level selectors", "3.View individual panel", "4.Set time range", "5.Force refresh", "6.Turn off refresh") -- nesting steps 3 levels deep (4.1, 4.2, 4.3, 4.4)
- `timeseries.spec.ts`: Steps named by action ("Load dashboard and verify cursor changes to grab", "Capture initial time range", "Drag right pans backward in time", "Drag left pans forward in time")
- `booking-pages.e2e.ts` (Cal.com comparison -- Grafana uses steps differently): Grafana uses numbered CUJ steps; not found in simpler tests
- Naming pattern: descriptive sentences, sometimes prefixed with step numbers
- Frequency: ~20% of test files use `test.step()`; primarily in CUJ (Critical User Journey) tests

**Test self-containment:** Tests are largely self-contained within their describe block. `beforeAll` sets up shared state (e.g., dashboard UID) that tests within the describe block reference. No cross-file test dependencies detected. The `dashboard-cujs` suite is an exception: it has explicit `global-setup.spec.ts` and `global-teardown.spec.ts` files with Playwright project-level dependencies configured in `playwright.config.ts`.

**Average test length:**
- Short tests (smoke, navigation): 10-25 lines
- Medium tests (panel interactions, alerts): 30-60 lines
- Long CUJ tests: 80-170 lines
- Average across sampled files: ~45 lines per test

**Describe-to-test nesting:** Consistently shallow. Most tests use a single `test.describe()` wrapping all tests in a file. No nesting beyond 1 level observed. The describe block typically gets its `tag` annotation at the describe level.

**Selector patterns:** Grafana uses a centralized selector registry (`selectors` fixture from `@grafana/plugin-e2e`) enabling `page.getByTestId(selectors.pages.BrowseDashboards.table.row('name'))`. This is a key architectural choice: selectors are versioned (with minimum Grafana version annotations) and shared between production code and test code.

**Localized helper objects:** The `saved-searches.spec.ts` test defines a `ui` object with locator factory functions (e.g., `savedSearchesButton: (page: Page) => page.getByRole('button', { name: /saved searches/i })`). This is a file-level page object pattern -- lighter than full POM classes.

### Coverage Strategy

**Features with E2E tests (by suite):**
- **Dashboards** (34 spec files): browsing, templating, time zones, timepicker, public dashboards, sharing, snapshots, exporting (JSON, image), links, tabs, variables (custom, constant, datasource, interval, query, text box), repeating panels, import
- **Panels** (27 spec files): annotations, candlestick, canvas, gauge, geomap (layers, controls, spatial), heatmap, logs table, panel editing (base, queries, transforms), state timeline, status history, table (footer, kitchen sink, markdown, nested, sparkline), timeseries (zoom, panning, labels)
- **Dashboard new layouts** (24 spec files): add panel, remove panel, move panel, group panels, duplicate panel, outline, repeats (auto grid, custom grid, tabs, snapshots), edit variables, title/description, conditional rendering, keybindings
- **Various** (29 spec files): explore, navigation, keybindings, return to previous, solo route, verify i18n, visualization suggestions, inspect drawer, advisor, bookmarks, bar gauge, pie chart, migrate to cloud, frontend sandbox (app, datasource), performance, query editor, Prometheus (annotations, config, editor, variable editor), Loki (query builder, table explore to dash), trace view scrolling, graph auto-migrate
- **Plugin E2E** (14 data source types + API tests): Elasticsearch, MySQL, MSSQL, PostgreSQL, CloudWatch, Azure Monitor, Cloud Monitoring, Graphite, InfluxDB, OpenTSDB, Jaeger, Zipkin, Loki, with role-based tests (admin: 15 spec files, viewer: 1)
- **CUJs** (8 spec files): dashboard view, navigation, ad-hoc filters, group-by, scopes
- **Smoke/Acceptance** (3 spec files): login+create datasource+dashboard flow, panel rendering, accessibility (axe)
- **Alerting** (1 spec file): saved searches
- **Cloud plugins** (1 spec file): Azure Monitor
- **Unauthenticated** (1 spec file): login
- **Storybook** (1 spec file): component verification
- **Test plugins** (5 spec files): extensions test app, test datasource

**Areas that appear to LACK E2E tests:**
- Alerting (only 1 file for saved searches -- alert rules, notification channels, silences appear untested in Playwright; likely still in legacy Cypress `e2e/` directory)
- User management, org management, RBAC roles
- API keys, service accounts
- Correlations, SLO
- Reporting, PDF export
- Grafana OnCall, Incident integration
- Annotation management (only filter-annotations tested, not CRUD)

**Tag system:** Grafana uses suite-level tags consistently:
- `@dashboards` -- dashboards-suite, dashboard-new-layouts
- `@panels` -- panels-suite
- `@various` -- various-suite
- `@acceptance` -- smoke-tests-suite
- `@alerting` -- alerting-suite
- `@dashboard-cujs` -- dashboard CUJ tests
- `@performance` -- perf-test.spec.ts
- `@timeseries` -- timeseries-specific panels test (sub-tag alongside @panels)
- Tags are applied at `test.describe()` level, not individual test level
- No `@smoke`, `@regression`, `@slow`, `@critical` tier tags observed

**CI subsets:** The PR workflow runs all Playwright tests. The `run-dashboard-search-e2e.yml` and `run-schema-v2-e2e.yml` workflows exist for specialized triggered runs. No nightly-only or merge-only subsets detected -- all tests run on every PR and push to main. Change detection gates whether tests run at all (skip if no relevant code changed).

**Happy-path vs edge-case ratio:** Estimated 80/20 happy-path-heavy. Most tests verify core flows work (navigate, create, interact, verify visible). Edge cases observed: special characters in selectors, duplicate panel handling, empty states, error conditions for conflicting settings. Performance test (`perf-test.spec.ts`) is a unique non-functional test.

**Documented testing strategy:** Yes. `contribute/style-guides/e2e-playwright.md` provides:
- Framework structure: Selector, Page, Component, Flow abstractions (Martin Fowler's Page Object)
- Preference for `data-testid` attributes over CSS selectors
- Instructions for adding new plugin tests (create directory, add project to config, update CODEOWNERS)
- Explicit guidance: "We generally do not use stubs or mocks as to fully simulate a real user"
- Recommends Playwright VS Code extension for local development

### Scaling Profile

**Total spec file count:** ~163 spec files across all directories
- Core suites: 129 spec files (alerting: 1, cloud-plugins: 1, dashboard-cujs: 8, dashboard-new-layouts: 24, dashboards-search: 1, dashboards-suite: 34, panels-suite: 27, smoke-tests: 3, various-suite: 29, unauthenticated: 1)
- Plugin e2e: 14 spec files (13 data sources + 1 Loki) + 16 API test spec files (15 admin + 1 viewer)
- Test plugins: 5 spec files (3 extensions test app, 2 test datasource)
- Storybook: 1 spec file

**Total test count (approximate):** ~350-450 tests (estimated from files examined; average 2-4 tests per spec file, with CUJ files having fewer but longer tests)

**Fixture count:** 4 JSON data fixture files in `e2e-playwright/fixtures/`, plus 13 JSON dashboard fixtures in `e2e-playwright/dashboards/`. Custom fixture infrastructure provided by `@grafana/plugin-e2e` package (external).

**Project count:** 31 Playwright projects defined in `playwright.config.ts` (authenticate, createUserAndAuthenticate, admin, viewer, 14 plugin data source projects, extensions-test-app, grafana-e2etest-datasource, canvas, unauthenticated, various, panels, smoke, dashboards, loki, cloud-plugins, alerting, dashboard-new-layouts, dashboard-cujs-setup, dashboard-cujs, dashboard-cujs-teardown, grafana-e2etest-panel)

**Directory depth and structure:**
```
e2e-playwright/                        # Root
  alerting-suite/                      # Depth 2 - flat spec files
  cloud-plugins-suite/                 # Depth 2
  dashboard-cujs/                      # Depth 2 - includes setup/teardown + utils
  dashboard-new-layouts/               # Depth 2 - flat + utils.ts
  dashboards/                          # Depth 2 - JSON fixtures, not tests
    cujs/                              # Depth 3 - CUJ dashboard JSONs
  dashboards-search-suite/             # Depth 2
  dashboards-suite/                    # Depth 2 - flat + utils/
    utils/                             # Depth 3
  extensions/                          # Depth 2 - empty (.keep)
  fixtures/                            # Depth 2 - JSON data files
  panels-suite/                        # Depth 2 - flat
  plugin-e2e/                          # Depth 2
    azuremonitor/                      # Depth 3
    ...14 datasource dirs...           # Depth 3
    plugin-e2e-api-tests/              # Depth 3
      as-admin-user/                   # Depth 4
      as-viewer-user/                  # Depth 4
      mocks/                           # Depth 4
  smoke-tests-suite/                   # Depth 2
  start-server                         # Depth 2 - server script
  storybook/                           # Depth 2
  test-plugins/                        # Depth 2
    grafana-extensionstest-app/tests/  # Depth 4
    grafana-test-datasource/tests/     # Depth 4
    grafana-test-panel/tests/          # Depth 4
  unauthenticated/                     # Depth 2
  utils/                               # Depth 2 - shared utilities
  various-suite/                       # Depth 2
```
- Max directory depth: 4 (plugin-e2e-api-tests/as-admin-user/, test-plugins/*/tests/)
- 18 top-level directories containing test files
- Test files distributed across ~25 distinct directories

**Config file complexity:** `playwright.config.ts` is ~130 lines. It defines:
- A `withAuth` helper function for adding authentication dependencies to projects
- A `baseConfig` object with retries (1 on CI), workers (4 on CI), timeouts (10s expect), reporter (HTML + custom accessibility), trace on failure, screenshots on failure
- 31 projects with authentication dependencies
- Optional `webServer` configuration
- Feature toggle management via `test.use()` (not in config but in individual test files)

**CI workflow: shard count, estimated execution time:**
- 8 shards (`matrix.shard: [1, 2, 3, 4, 5, 6, 7, 8]`)
- 20-minute timeout per shard
- Runs on `ubuntu-x64-large` runners
- Separate build-backend and build-frontend jobs (15 min timeout each)
- Blob report merging in a final consolidation job
- Grafana server started in background during browser installation (parallel optimization)
- Change detection gates: if no relevant code changed, entire workflow is skipped

**Evidence of restructuring:** Yes, significant.
- Legacy `e2e/` directory still exists alongside `e2e-playwright/`, containing Cypress-era test infrastructure (dashboards, benchmarks, utilities). The old directory still has `cypress/` subdirectory.
- Epic issue #98825 "Use Playwright for E2E tests" tracks migration from Cypress to Playwright
- PRs like #99192 "move loki-editor e2e test to playwright" show active migration
- The `-suite` naming convention on directories suggests a deliberate reorganization strategy: tests are grouped by functional suite, each mapping to a Playwright project


---

## Cal.com E2E — Three-Lens Analysis

### Test Anatomy

**AAA Pattern:** Cal.com tests follow a more recognizable Arrange-Act-Assert pattern than Grafana, primarily because their fixture system handles arrangement. Typical flow:
1. **Arrange**: `users.create()` in `beforeEach` or inline, `user.apiLogin()`, navigate to URL
2. **Act**: Fill forms, click buttons, interact with UI via `data-testid` selectors
3. **Assert**: `expect()` calls verifying visibility, text content, URL changes, API responses

The pattern is cleaner in Cal.com because the `users` fixture provides a comprehensive user factory that creates fully configured test users with event types, schedules, and team memberships in a single call.

**Setup Mechanisms:**
- **Custom fixtures** are the primary mechanism: `users`, `bookings`, `payments`, `orgs`, `emails`, `embeds`, `servers`, `prisma`, `routingForms`, `bookingPage`, `workflowPage`, `features`, `eventTypePage`, `appsPage`, `webhooks` -- 15 custom fixtures total in `lib/fixtures.ts`
- `test.describe.configure({ mode: "parallel" })` appears at the top of almost every test file
- `beforeEach` creates users and navigates; `afterEach` calls `users.deleteAll()` -- explicit cleanup pattern
- Helper functions in `lib/testUtils.ts`: `bookFirstEvent`, `bookOptinEvent`, `bookTimeSlot`, `confirmBooking`, `selectFirstAvailableTimeSlotNextMonth`, `createNewUserEventType`, etc.
- Direct Prisma access in tests (via `prisma` fixture) for complex setup that goes beyond fixture capabilities (e.g., creating team memberships, updating event types with hashed links)
- `users.create()` accepts rich configuration objects: `{ name, username, eventTypes: [{title, slug, length, ...}], schedule, overrideDefaultEventTypes }` plus team options `{ hasTeam, schedulingType, teammates, seatsPerTimeSlot }`

**Assertions per test:**
- Simple tests (login validation, page rendering): 1-3 assertions
- Medium tests (booking flows): 3-6 assertions
- Complex tests (webhook payloads, booking questions): 10-20+ assertions (webhook tests use `toMatchObject` with large expected payloads)
- Average across sampled files: ~5 assertions per test

**`test.step()` usage:** Less frequent than Grafana. Found in:
- `booking-pages.e2e.ts` prefill section: `test.step("from session", ...)`, `test.step("from query params", ...)`
- `manage-booking-questions.e2e.ts`: `test.step("Go to EventType Page", ...)`, `test.step("Add Question and see that it's shown on Booking Page", ...)`
- `login.e2e.ts`: `test.step("Log in", ...)`, `test.step("Log out", ...)`
- Naming pattern: descriptive action phrases, no numbering
- Frequency: ~10-15% of test files use `test.step()`, primarily in longer multi-phase tests

**Test self-containment:** Highly self-contained. Each test creates its own users via fixtures, interacts with them, and deletes them in `afterEach`. The `todo()` helper (aliased from `test.skip`) is used for marking planned but unimplemented tests (e.g., `todo("check SSR and OG - Team Event Type")`). No cross-file test dependencies.

**Average test length:**
- Short tests (login, page rendering): 8-15 lines
- Medium tests (booking, availability): 20-45 lines
- Long tests (webhook verification, booking questions): 50-120 lines
- Average across sampled files: ~35 lines per test

**Describe-to-test nesting:** Generally 1-2 levels. Pattern:
```
test.describe("feature area", () => {
  test.describe("user type" or "scenario", () => {
    test("specific case", ...)
  })
})
```
The deepest nesting observed is 3 levels in `workflow.e2e.ts` (Workflow Tab > Check functionalities > User Workflows / Team Workflows). Most files use 1 level.

**Notable patterns:**
- `test.setTimeout(testInfo.timeout * 3)` used for long booking flows -- explicit timeout multipliers
- Browser context manipulation: `browser.newContext()` for testing concurrent slot reservation
- `page.waitForResponse()` used for API call assertions alongside UI assertions
- JSDOM usage in SSR/OG meta tag tests -- unique hybrid approach of parsing server-rendered HTML within E2E tests

### Coverage Strategy

**Features with E2E tests:**
- **Booking flows** (~15 files): booking pages, booking seats, booking limits, duration limits, booking confirmations/rejections, booking filters, booking race conditions, dynamic booking pages, booking phone autofill, booking sheet keyboard, booking duplicate API calls, booking list management
- **Authentication** (~6 files): login, login with 2FA, login via API, login OAuth, signup, forgot password, delete account
- **Event types** (~6 files): event type management, managed event types, event type availability tab, event type limit tab, AI translation
- **Scheduling** (~4 files): availability, out-of-office, wipe-my-cal, overlay calendar
- **Organization** (~9 files): creation flows, invitation, privacy, redirection, settings, team management, booking within org, cross-org, segment filters
- **Teams** (~3 files): teams management, team availability, team invitation
- **Payments** (~3 files): payment, payment apps, buy credits, cancellation fee warning
- **Integrations** (~4 files): app list card, app store, webhook, embed code generator
- **Insights/Analytics** (~4 files): insights, insights routing, insights routing filters, insights charts
- **Workflows** (1 file): workflow creation, editing, deletion, actions
- **Settings** (~5 files): change password, change theme, change username, profile, settings admin, upload avatar
- **Other** (~8 files): onboarding, impersonation, i18n routing, locale, hash-my-url, icons, unpublished, feature opt-in banner, SAML, OAuth provider, filter segment, system segments, trial, ab-tests-redirect, admin users

**Areas that appear to LACK E2E tests:**
- Calendar sync (Google Calendar, Outlook -- only Apple Calendar has a test file)
- Zapier/Make/n8n integrations
- API v2 (has its own separate workflow `e2e-api-v2.yml`)
- Mobile responsive testing (embed tests have mobile project, but core web tests do not)
- Accessibility (no dedicated a11y tests found unlike Grafana)
- Detailed analytics/reporting

**Tag system:** Cal.com does NOT use Playwright tags (`@smoke`, `@regression`, etc.). Tests are organized by file rather than by tag. The CI workflow runs all tests without tag-based filtering. The `ready-for-e2e` GitHub label gates whether E2E tests run on PRs.

**CI subsets:**
- `e2e.yml`: Main web E2E tests (sharded)
- `e2e-app-store.yml`: App store tests
- `e2e-embed.yml`: Embed core tests
- `e2e-embed-react.yml`: Embed React tests
- `e2e-api-v2.yml`: API v2 tests
- `e2e-atoms.yml`: Atoms (component) tests
- `e2e-report.yml`: Report consolidation
- `performance-tests.yml`: Performance tests
- These are separate workflow files, each triggered by `workflow_call`, indicating a parent/orchestrator workflow
- No documented nightly vs PR distinction, but the `ready-for-e2e` label mechanism gates PR runs

**Happy-path vs edge-case ratio:** Estimated 70/30 -- Cal.com has notably more edge-case testing than Grafana. Examples:
- Special characters in usernames (`franz-janBen`, `Benny`)
- Concurrent slot reservation across browser contexts
- Cancellation of past bookings
- Race condition prevention (booking-race-condition.e2e.ts)
- Duplicate API call prevention (booking-duplicate-api-calls.e2e.ts)
- Disabled cancellation/rescheduling enforcement
- Optional email field validation (valid, invalid, empty)
- Seats with recurring events (expected error)
- GTM container loaded/not-loaded on private vs public pages

**Documented testing strategy:** Partial. `CONTRIBUTING.md` mentions "Mention What Was Tested (and How)" as a PR guideline but does not provide specific testing standards. `AGENTS.md` references running `PLAYWRIGHT_HEADLESS=1 yarn e2e path/to/file.e2e.ts` but no architectural testing guide exists comparable to Grafana's `e2e-playwright.md`. The testing conventions are implicit in the fixture architecture and helper functions.

### Scaling Profile

**Total test file count:** ~83 e2e test files
- Root level: 61 `.e2e.ts` files
- auth/: 3 files
- eventType/: 3 files
- organization/: 8 files + 1 in across-org/
- team/: 1 file
- settings/: 1 file
- apps/analytics/: 1 file
- apps/conferencing/: 1 file
- oauth/: 4 files

**Total test count (approximate):** ~250-350 tests (estimated; files average 3-5 tests each, with some large files like `booking-pages.e2e.ts` having 20+ tests)

**Fixture count:** 15 custom Playwright fixtures defined in `lib/fixtures.ts`: `orgs`, `users`, `bookings`, `payments`, `embeds`, `servers`, `prisma`, `emails`, `routingForms`, `bookingPage`, `workflowPage`, `features`, `eventTypePage`, `appsPage`, `webhooks`. Each fixture has its own factory file in `fixtures/` directory (17 files including types.ts and image files).

**Project count:** 7 Playwright projects in root `playwright.config.ts`:
- `@calcom/web` (main E2E tests)
- `@calcom/app-store`
- `@calcom/embed-core`
- `@calcom/embed-react`
- `@calcom/embed-core--firefox`
- `@calcom/embed-core--webkit`
- `@calcom/embed-core--isMobile`

**Directory depth and structure:**
```
apps/web/playwright/                   # Root test directory
  *.e2e.ts (61 files)                  # Flat test files at root
  auth/                                # Depth 2 - auth flows (3 files)
  eventType/                           # Depth 2 - event type specific (3 files)
  organization/                        # Depth 2 (8 files)
    across-org/                        # Depth 3 (1 file)
    lib/                               # Depth 3 - org-specific helpers
  team/                                # Depth 2 (1 file + expects.ts)
  settings/                            # Depth 2 (1 file)
  apps/                                # Depth 2
    analytics/                         # Depth 3 (1 file)
    conferencing/                      # Depth 3 (1 file)
  oauth/                               # Depth 2 (4 files)
  fixtures/                            # Depth 2 - 17 fixture files
  lib/                                 # Depth 2 - shared libraries
    test-helpers/                      # Depth 3 - specialized helpers
  icons.e2e.ts-snapshots/              # Depth 2 - visual snapshots
  integrations.e2e.ts-snapshots/       # Depth 2 - visual snapshots
```
- Max directory depth: 3 (organization/across-org/, apps/analytics/)
- Test files distributed across ~12 distinct directories
- Predominantly flat structure with 74% of test files in root directory

**Config file complexity:** Root `playwright.config.ts` is ~250 lines. It defines:
- Dynamic timeout configuration (CI vs local: 10s vs 120s for navigation/expect/action; 60s vs 240s for test timeout)
- Dynamic webServer configuration (conditional embed servers)
- 7 projects with cross-browser coverage for embeds
- Custom `toBeEmbedCalLink` expect matcher (~100 lines of custom assertion logic)
- `ExpectedUrlDetails` type export for embed testing
- Environment variable driven: `process.env.CI`, `NEXT_PUBLIC_IS_E2E`, `PLAYWRIGHT_HEADLESS`

**CI workflow: shard count, estimated execution time:**
- 8 shards (`matrix.shard: [1, 2, 3, 4, 5, 6, 7, 8]`)
- 20-minute timeout per shard job
- 4 workers per shard
- Runs on `blacksmith-4vcpu-ubuntu-2404` runners (custom high-performance)
- Services: PostgreSQL 18, MailHog (email testing)
- 2 retries on CI (`retries: process.env.CI ? 2 : 0`)
- Blob report uploaded per shard, merged in `e2e-report.yml`
- `ready-for-e2e` label gates whether tests run on PRs

**Evidence of restructuring:** Yes.
- PR #4072 "One playwright config to rule them all" consolidated from multiple configs to a single root config
- PR #17070 moved Playwright installation to a separate CI job to reduce blocking
- PR #15364 added `ready-for-e2e` label gating to reduce CI cost
- The flat file structure (61 files in root) suggests organic growth without aggressive reorganization -- files are added as features are built rather than reorganized periodically
- Subdirectories (`organization/`, `auth/`, `eventType/`) appear to have been created later for features with enough tests to warrant grouping


---

## Cross-Suite Observations

### Test Anatomy Patterns

| Dimension | Grafana | Cal.com |
|-----------|---------|---------|
| AAA pattern | Loosely applied; interleaved | Cleaner due to fixture-driven setup |
| Setup mechanism | `test.use()` + fixtures + API calls + provisioning | Custom fixtures (`users.create()`) + Prisma |
| Cleanup | `afterAll` API calls | `afterEach` via `users.deleteAll()` |
| test.step() frequency | ~20% of files (CUJ-heavy) | ~10-15% of files |
| test.step() naming | Numbered steps ("1.Loads...", "2.Top level...") | Descriptive phrases ("from session", "Go to EventType Page") |
| Avg assertions/test | ~6 | ~5 |
| Avg test length | ~45 lines | ~35 lines |
| Describe nesting depth | 1 level (flat) | 1-2 levels |
| Selector strategy | Centralized versioned registry (`selectors.pages.*`) | Inline `data-testid` strings |
| Helper pattern | External `@grafana/plugin-e2e` package | Local `lib/testUtils.ts` helper functions |

### Coverage Strategy Patterns

| Dimension | Grafana | Cal.com |
|-----------|---------|---------|
| Tag usage | Suite-level tags (`@dashboards`, `@panels`, etc.) | No tags |
| CI gating | Change detection (skip if no relevant code changes) | `ready-for-e2e` label on PR |
| CI subsets | Single workflow, all tests | 6+ separate workflows by area |
| Happy:edge ratio | ~80:20 | ~70:30 |
| Testing guide | Detailed `e2e-playwright.md` style guide | Minimal (CONTRIBUTING.md mentions testing) |
| Cross-browser | No (Chromium only) | Yes (Firefox, Safari, Mobile for embeds) |

### Scaling Organization Patterns

| Dimension | Grafana | Cal.com |
|-----------|---------|---------|
| Spec file count | ~163 | ~83 |
| Approx test count | ~350-450 | ~250-350 |
| Projects in config | 31 | 7 |
| Fixture count | 4 JSON + external package | 15 custom fixtures + 17 fixture files |
| CI shards | 8 | 8 |
| CI timeout/shard | 20 min | 20 min |
| CI retries | 1 | 2 |
| Max directory depth | 4 | 3 |
| Test directories | ~25 | ~12 |
| File organization | Suite-based directories (dashboards-suite, panels-suite) | Primarily flat with feature subdirectories |
| Restructuring evidence | Active Cypress-to-Playwright migration | Config consolidation, CI optimization |

### Key Differentiators

1. **Grafana's suite-based organization** groups tests into named suites that map 1:1 to Playwright projects. This enables running `--project dashboards` to test a specific area. Cal.com groups all web tests into a single project.

2. **Grafana's selector registry** (`@grafana/e2e-selectors`) provides versioned selectors shared between production and test code. Cal.com uses inline `data-testid` strings without centralization.

3. **Cal.com's fixture richness** is exceptional: 15 custom fixtures covering users, bookings, payments, organizations, emails, webhooks, workflows, features, etc. Grafana relies more on its `@grafana/plugin-e2e` external package.

4. **Cal.com tests more edge cases** (race conditions, concurrent contexts, special characters, disabled features) while Grafana focuses on comprehensive happy-path coverage across many features.

5. **Both use 8 CI shards** with 20-minute timeouts, but with different gating mechanisms (change detection vs label-based).

6. **CUJ (Critical User Journey) testing** is an explicit concept in Grafana with dedicated directories and numbered test steps. Cal.com does not use this terminology but achieves similar coverage through long booking flow tests.

7. **Grafana's `test.use({ featureToggles: {...} })` pattern** for controlling feature flags in tests is unique and reflects the needs of a large product with many experimental features.
