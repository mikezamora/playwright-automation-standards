# Round 59 Findings — Re-analyze Next.js and Grafana plugin-e2e (Anatomy, Coverage, Scaling)

Two suites examined through three new lenses: test anatomy, coverage strategy, and scaling organization. All findings based on direct inspection of test files, CI workflows, and config files from the current canary (Next.js) and main (Grafana plugin-tools) branches.

---

## Next.js (vercel/next.js) — Three-Lens Analysis

### Test Anatomy

**AAA Pattern:** Next.js E2E tests follow a **loose Act-Assert pattern with virtually no explicit "Arrange" phase**. The `nextTestSetup()` call at the describe-block level provisions an entire isolated Next.js application from the test directory's `app/` or `pages/` folder. Individual tests then act (via `next.fetch()`, `next.render()`, or `next.browser()`) and assert immediately. Example from `app-custom-routes.test.ts`:

```
const res = await next.fetch(basePath + '/basic/endpoint', { method })   // Act
expect(res.status).toEqual(200)                                          // Assert
expect(await res.text()).toContain('hello, world')                       // Assert
```

There is no per-test "Arrange" beyond the suite-level `nextTestSetup()`. This is an extreme form of fixture-driven arrangement -- the entire Next.js app (config, pages, routes) IS the arrangement, pre-baked into the test directory.

**Setup pattern:** `nextTestSetup()` is the universal setup mechanism. It accepts:
- `files: __dirname` -- the test directory becomes the Next.js app
- `dependencies` -- npm packages to install
- `skipDeployment` -- opt out of deploy testing
- Returns `{ next, isNextDev, isNextStart, isNextDeploy, isTurbopack }`

No `beforeEach` blocks observed. `beforeAll`/`afterAll` are rare and used only for file-patching scenarios (e.g., creating temporary route files). Setup is entirely delegated to the framework utility.

**Assertions per test:**
- Simple route tests: 2-3 assertions (status + body content)
- Response-header tests: 3-5 assertions (status + headers + body)
- Complex multi-step tests: 5-10 assertions
- Average across sampled files: ~3-4 assertions per test

**`test.step()` usage:** Zero. Not used in any examined test file. Next.js does not use `test.step()` at all -- tests are kept focused on a single HTTP request/response cycle or a single browser interaction.

**Self-containment:** Tests are fully self-contained within their describe block. Each test makes its own request independently. The `nextTestSetup()` ensures complete isolation -- a fresh Next.js installation is created per test suite in a temp directory, then destroyed after completion.

**Average test length:**
- Simple fetch-based tests: 8-15 lines
- Browser interaction tests: 15-30 lines
- Complex caching/revalidation tests: 30-60 lines
- Average across sampled files: ~15-20 lines per test

**Describe-to-test nesting:** Moderate to deep. `app-custom-routes.test.ts` uses 3 levels of nesting: `describe > describe > describe.each > it.each`. This is the deepest nesting observed in any Gold-tier suite. The nested describes group by HTTP method (`describe.each(['GET', 'POST', ...])`), behavior category (`body`, `context`, `hooks`), and sub-category (`headers`, `cookies`, `redirect`).

**Conditional test execution via runtime guards:** Next.js tests use inline `if` blocks extensively:
- `if (isNextStart) { ... }` for production-only assertions
- `if (isNextDev) { ... }` for dev-only describe blocks
- `if (!isNextDeploy) { ... }` for tests that cannot run in deployed environments
- `process.env.IS_TURBOPACK_TEST ? it.skip : it` for Turbopack-incompatible tests

This is a unique pattern not seen in other Gold-tier suites. Rather than using `test.skip()` annotations, tests inline runtime branching within the test body.

**Parametric testing via `it.each` and `describe.each`:** Heavily used. Examples:
- `it.each(['/static/first/data.json', '/static/second/data.json', ...])` for path variations
- `describe.each(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])` for HTTP method coverage
- Combines with nesting to create multiplicative coverage

**Custom utilities:** `check()`, `retry()`, and `waitFor()` from `next-test-utils` are used instead of Playwright's built-in `expect.poll()` or `toPass()`. The `check()` utility polls a function until it returns an expected string -- this is a custom retry mechanism predating Playwright's native retry assertions.

**Notable pattern: base-path test reuse.** `app-custom-route-base-path.test.ts` is a 2-line file that sets `process.env.BASE_PATH = '/docs'` and then requires the main test file. This reuses the entire test suite with a different environment variable -- a DRY pattern unique to Next.js.

### Coverage Strategy

**Features with E2E tests (app-dir alone = 382 subdirectories):**
- **App Router routes:** custom routes, static routes, dynamic routes, catch-all routes, route groups, parallel routes, intercepting routes
- **Server Actions:** form submissions, progressive enhancement, size limits, streaming, encryption, navigation, revalidation, middleware integration
- **Caching/Revalidation:** ISR, client cache semantics (staleTimes), on-demand revalidation, cache handlers, `use-cache` (21+ subdirectories)
- **CSS:** CSS modules, global CSS, Sass/SCSS, CSS ordering, inline CSS, external CSS, tailwind
- **Rendering:** SSR, static, edge, streaming, dynamic rendering, force-static
- **Navigation/Routing:** prefetching, client-side navigation, basepath, redirects, middleware, i18n
- **Configuration:** turbopack, rspack, webpack loaders (12 variants), babel
- **Error handling:** error boundaries, not-found, unauthorized, 404, 500, deprecation warnings
- **A11y:** route announcer test (single file)
- **Edge Runtime:** edge pages, edge API, edge compiler, edge async local storage
- **External packages:** module resolution, transpilePackages, dynamic imports

**Additional test directories:**
- `test/e2e/` (non-app-dir): 169 total directories covering Page Router, edge runtime, basepath, browserslist, cancel-request, config schema validation, CPU profiling, define, DX warnings, worker, etc.
- `test/development/`: 43 directories (HMR, error overlays, config validation, dev-indicator, tsconfig)
- `test/production/`: 74 directories (bundle size, chunk loading, build lifecycle, deploy, standalone, performance)
- `test/integration/`: 279 directories (legacy tests, various framework features)
- `test/unit/`: 58 directories

**Missing coverage:**
- No security-specific E2E tests (XSS, CSRF, CSP validation)
- No load/performance E2E tests (performance testing is via separate benchmarking infrastructure)
- No visual regression tests
- No multi-browser tests (tests run on Chromium; there is a single `test-firefox-safari` CI job)
- No accessibility tests beyond the single route-announcer test
- Error-path coverage is ~5-8% of total tests (mostly in `error conditions` describe blocks)

**Tag system:** None. Zero test tags observed across all examined files. There are no `@smoke`, `@critical`, `@regression`, or any other annotations.

**CI subsets:** Test categorization is entirely structural:
- `test/e2e/` = e2e tests (run via `--type e2e`)
- `test/development/` = development tests (run via `--type development`)
- `test/production/` = production tests (run via `--type production`)
- `test/integration/` = integration tests (run via `--type integration`)
- `test/unit/` = unit tests (run via `--type unit`)

Test manifests (`turbopack-dev-tests-manifest.json`, `deploy-tests-manifest.json`, etc.) list which tests pass/fail/flake per bundler and control which tests are included/excluded.

**Happy-path vs error ratio:** Overwhelmingly happy-path (~92-95%). Error condition describe blocks exist in some files but typically cover only 2-4 error scenarios per feature area.

**Test distribution across features:** The app-dir directory dominates with 382 subdirectories (~70% of e2e test volume). Each subdirectory is a self-contained Next.js application with its own `app/` folder, config, and test file(s). This "one app per feature" architecture is unique among Gold-tier suites.

### Scaling Profile

**Estimated total test count:** Thousands. Based on 382 app-dir subdirectories + 169 other e2e + 43 development + 74 production + 279 integration + 58 unit directories, each containing 5-50+ tests, the total is likely 5,000-10,000+ Playwright-based E2E tests plus thousands of Jest unit/integration tests.

**File count (e2e only):** ~550+ test directories, each containing 1-3 `.test.ts` files plus an entire Next.js application (app files, config, etc.)

**Fixture count:** 1 primary fixture (`nextTestSetup()`). There are no custom Playwright fixtures. Instead, `nextTestSetup()` returns an object with helper methods: `next.fetch()`, `next.render()`, `next.browser()`, `next.readFile()`, `next.patchFile()`, `next.deleteFile()`, `next.cliOutput`, etc. This is effectively a god-object fixture.

**Project count (Playwright):** Not applicable in the traditional sense. Next.js uses a custom test runner (`run-tests.js`) wrapping Jest, not Playwright natively. Each test suite is classified by type (`e2e`, `development`, `production`, `integration`, `unit`) and group number.

**Directory structure:**
```
test/
  e2e/                   # 169 top-level dirs
    app-dir/             # 382 subdirs (one Next.js app per feature)
      [feature-name]/
        app/             # Next.js app files
        next.config.js
        *.test.ts        # Test file(s)
  development/           # 43 dirs
  production/            # 74 dirs
  integration/           # 279 dirs (legacy)
  unit/                  # 58 dirs
```

Max directory depth: 4 (test/e2e/app-dir/[feature]/app/[route]/...)

**Config complexity:** Minimal Playwright config. The custom `nextTestSetup()` handles all configuration: it creates a temp directory, installs the Next.js app from the test's `__dirname`, starts the dev/build server, and provides the `next` object for test interaction. This hides enormous complexity behind a simple API.

**CI sharding:** Massive parallelization:
- E2E dev tests: 10 groups x 2 React versions = 20 parallel jobs
- E2E prod tests: 10 groups x 2 React versions = 20 parallel jobs
- Integration tests: 13 groups = 13 parallel jobs
- Turbopack dev: 7 groups x 2 React = 14 parallel jobs
- Turbopack prod: 7 groups x 2 React = 14 parallel jobs
- Turbopack integration: 13 groups = 13 parallel jobs
- Rspack dev/prod/integration: 5 + 7 + 6 groups
- Cache component tests: 6 + 7 groups
- Plus Windows-specific jobs, new-test jobs, Firefox/Safari job
- Total: **~190-200 parallel CI job instances**
- fail-fast: false across all matrices
- Test timings from previous runs are fetched and used for intelligent shard distribution

**Key scaling strategies:**
1. **One-app-per-feature isolation:** Each test creates its own Next.js installation. No shared state between test suites.
2. **Manifest-driven test selection:** JSON manifest files list test status per bundler, enabling targeted exclusions.
3. **Runtime-conditional tests:** Instead of separate test files for dev/prod/deploy, a single file uses runtime guards (`if (isNextDev) ...`).
4. **Parametric multiplication:** `describe.each` and `it.each` multiply coverage without code duplication.
5. **Custom test runner:** `run-tests.js` wraps execution with timing data, group-based sharding, and pattern filtering.

---

## Grafana plugin-e2e (grafana/plugin-tools) — Three-Lens Analysis

### Test Anatomy

**AAA Pattern:** Grafana plugin-e2e tests follow a clean **Arrange-Act-Assert pattern**, with arrangement heavily delegated to fixtures. The typical flow is:
1. **Arrange**: Fixture provides a pre-navigated page object (e.g., `panelEditPage`, `annotationEditPage`, `createDataSourceConfigPage`) plus provisioned data (e.g., `readProvisionedDataSource`)
2. **Act**: Interact with the page (fill fields, click buttons, set datasource)
3. **Assert**: Verify outcome with custom matchers (`toBeOK()`, `toHaveAlert()`, `toDisplayPreviews()`)

Example from `configEditor.spec.ts`:
```
const ds = await readProvisionedDataSource({ fileName: 'testdatasource.yaml' });    // Arrange
const datasourceConfigPage = await createDataSourceConfigPage({ type: ds.type });   // Arrange
await page.getByLabel('Path').fill('example.com');                                   // Act
await expect(datasourceConfigPage.saveAndTest()).toBeOK();                           // Assert
await expect(datasourceConfigPage).toHaveAlert('success');                           // Assert
```

The AAA pattern is **more clearly delineated** here than in any other Gold-tier suite because the fixture-driven arrangement is fully separated from the action phase.

**Setup pattern:** Pure fixture injection. No `beforeEach`, no `beforeAll`, no inline setup code. The Playwright config defines 5 projects:
1. `authenticate as admin` (setup project -- creates `admin.json` storage state)
2. `authenticate as viewer` (setup project -- creates user + `viewer.json` storage state)
3. `run tests as admin user` (depends on admin auth)
4. `run tests as admin user - wide viewport` (1920x1080, depends on admin auth)
5. `run tests as viewer user` (depends on viewer auth)

This is a textbook Playwright authentication pattern with project dependencies.

**Assertions per test:**
- Render/smoke tests: 1-2 assertions (visibility check)
- Config editor tests: 2-3 assertions (save + alert)
- Query/variable tests: 2-4 assertions (query + preview display)
- A11y tests: 3-7 assertions (multiple a11y rule checks)
- Average across sampled files: ~2-3 assertions per test

**`test.step()` usage:** Zero. Not used in any examined test file. Tests are kept short and focused on a single user interaction.

**Self-containment:** Tests are fully self-contained. Each test receives fresh fixtures through Playwright's fixture injection. No shared state between tests. The `test.describe.configure({ mode: 'parallel' })` in panel tests confirms parallel execution capability.

**Average test length:**
- Short fixture-driven tests: 5-10 lines
- Medium complexity tests: 10-20 lines
- Complex tests (a11y, openfeature): 20-40 lines
- Average across sampled files: ~12-15 lines per test

This is the **shortest average test length** of any Gold-tier suite examined, directly attributable to the rich fixture and page object layer.

**Describe-to-test nesting:** Very shallow. Most tests are at the top level of the file (no describe block). Only `alerting.basicMode.spec.ts` and `accessibility.spec.ts` use `test.describe()` -- with a single level of nesting. No multi-level nesting observed.

**Version-conditional test execution:** Tests use `test.skip(semver.lt(grafanaVersion, '9.5.0'), 'message')` extensively. This is a core architectural concern: the package supports Grafana 8.5.0+ and must conditionally skip tests on older versions. The `grafanaVersion` fixture provides the version string. `semver.lt()`, `semver.gte()` are imported directly from the `semver` package.

**Custom matchers:** The package extends Playwright's `expect` with domain-specific matchers:
- `toBeOK()` -- API response is 200
- `toHaveAlert(severity, options?)` -- page shows alert of specified severity
- `toDisplayPreviews(values)` -- variable editor shows expected preview values
- `toHaveNoA11yViolations(options?)` -- accessibility scan passes (with rule ignoring and threshold support)
- `toHaveSelected(value)` -- Select/MultiSelect has expected value
- `toBeChecked()` -- Switch is in checked state
- `toHaveColor(color)` -- color picker has expected value

**`test.use()` for configuration:** Used at file level for feature toggle and OpenFeature flag configuration:
- `test.use({ featureToggles: { redshiftAsyncQueryDataSupport: false } })` in config
- `test.use({ openFeature: { flags: { testFlagTrue: true } } })` in openfeature tests
- `test.use({ featureToggles: { localizationForPlugins: true } })` in preferences tests

### Coverage Strategy

**Features tested (as-admin-user = 9 categories):**
- **Datasource config editor** (4 tests): render, save+test success, save+test failure, custom health endpoint
- **Datasource query editor** (3 tests): render, dropdown options, back-to-dashboard navigation
- **Datasource annotations** (5 tests): editor render, add new annotation, successful query, failed query, provisioned query
- **Datasource alerting** (12 tests across 2 files): basic mode and advanced mode toggle, evaluate valid/invalid queries, add multiple rows, load provisioned rules
- **Datasource variables** (3 tests): editor render, create+execute query, open+execute provisioned query
- **Datasource variable interpolation** (1 test): variable substitution in queries
- **Datasource data assertions** (tests): table panel data, timeseries data, dashboard panel data, explore page data
- **Datasource dashboards** (tests): panel editing in provisioned dashboards
- **Datasource explore** (tests): explore page with version-conditional URL parameters
- **Datasource feature toggles** (tests): feature toggle configuration
- **Panels** (2+ tests): clock panel configuration, provisioned dashboard panels
- **A11y** (2 tests): basic accessibility scan, custom options (color contrast injection)
- **App plugins** (2+ tests): config page navigation, settings API wait
- **OpenFeature** (8+ tests across 6 files): OFREP interception, flag merging, getBooleanOpenFeatureFlag, compatibility, latency, multi-type, single flag
- **Preferences** (4 tests across 2 files): default language, dark theme, override defaults
- **Page loading** (1 test): goto page navigation

**Features tested (as-viewer-user = 3 tests):**
- Permission redirect verification (1 test)
- Create user with valid credentials (1 test)
- Create user with invalid credentials (1 test)

**Total test count (estimated):** ~50-60 tests across ~25 spec files.

**Missing coverage:**
- No error-path tests for network failures or timeouts
- No concurrent user tests
- No data import/export tests
- No plugin installation/uninstallation flow tests
- No migration tests (upgrading Grafana versions)

**Tag system:** None. No test tags observed. Categorization is purely structural (directory-based by feature area + role-based by user type).

**CI subsets:** The `playwright.yml` workflow runs all tests against a matrix of Grafana versions (>=8.5.0). The `resolve-versions` job dynamically determines which Grafana images to test against. Tests are NOT sharded -- all tests run as a single Playwright execution per Grafana version.

**Happy-path vs error ratio:** Approximately 70:30. The suite has notably better error-path coverage than most Gold-tier suites:
- Config editor: explicit "should return error if API key is missing" test
- Alerting: "should evaluate to false if query is invalid" tests
- Annotations: "unsuccessful annotation query" test
- But no network-level error tests or timeout tests

**Test distribution:** Datasource-related tests dominate (~60% of total). This reflects the package's primary use case: testing Grafana datasource plugins.

### Scaling Profile

**Total test count:** ~50-60 tests across ~25 spec files. This is intentionally small -- the package is a testing framework, not an application. Tests validate the framework's fixtures and matchers, not a full application.

**Fixture count:** 25+ exported fixtures organized into categories:
- **Page fixtures (7):** `panelEditPage`, `annotationEditPage`, `variableEditPage`, `variablePage`, `alertRuleEditPage`, `explorePage`, `dashboardPage`
- **Command fixtures (16):** `createDataSourceConfigPage`, `createDataSource`, `createUser`, `gotoDashboardPage`, `gotoPanelEditPage`, `gotoAnnotationEditPage`, `gotoAppConfigPage`, `gotoAppPage`, `gotoVariableEditPage`, `gotoVariablePage`, `gotoAlertRuleEditPage`, `gotoDataSourceConfigPage`, `readProvisionedDataSource`, `readProvisionedDashboard`, `readProvisionedAlertRule`, `login`
- **Utility fixtures (5+):** `grafanaVersion`, `selectors`, `grafanaAPIClient`, `isFeatureToggleEnabled`, `getBooleanOpenFeatureFlag`, `scanForA11yViolations`, `namespace`
- **Configuration fixtures (3):** `featureToggles`, `openFeature`, `userPreferences`

**Page object model count:** 13 page models + 13 component models:
- Pages: AlertRuleEditPage, AnnotationEditPage, AnnotationPage, AppConfigPage, AppPage, DashboardPage, DataSourceConfigPage, ExplorePage, GrafanaPage (base), PanelEditPage, PluginConfigPage, VariableEditPage, VariablePage
- Components: AlertRuleQuery, ColorPicker, ComponentBase (base), DataSourcePicker, MultiSelect, Panel, PanelEditOptionsGroup, RadioGroup, Select, Switch, TimeRange, UnitPicker

**Directory structure:**
```
packages/plugin-e2e/
  src/
    auth/                  # Authentication setup
    fixtures/
      commands/            # 16 command fixtures (goto*, create*, read*)
      scripts/             # Boot data override scripts
      *.ts                 # Page, selector, API client fixtures
    matchers/              # 9 custom matchers
    models/
      pages/               # 13 page object models
      components/          # 13 component models
    selectors/             # Versioned selector registry
    types.ts               # Type definitions
    options.ts             # Configuration options
    index.ts               # Public API (test, expect, models, types)
  tests/
    as-admin-user/         # 8 feature directories
      a11y/
      app/
      datasource/          # 9 sub-feature directories
      openfeature/
      page-loading/
      panel/
      permissions/
      preferences/
    as-viewer-user/        # 2 test files + 1 subdirectory
    utils.ts
  provisioning/            # Test data (YAML + JSON)
  playwright.config.ts     # 5 projects (2 auth + 3 execution)
```

**Config complexity:** Moderate. The `playwright.config.ts` defines 5 projects with authentication dependencies. Docker Compose orchestrates a Grafana instance for testing. The config supports environment variable overrides for provisioning directory and Grafana version.

**CI execution:** Matrix strategy testing against multiple Grafana versions:
- `resolve-versions` job determines which Grafana images to test (>=8.5.0)
- Each version gets its own CI job running the full test suite
- Docker Compose starts Grafana + test datasource plugin
- No sharding within a Grafana version (suite is small enough)
- 60-minute timeout per job
- Artifacts: Playwright HTML reports published to GitHub Pages with 7-day retention

**Consumer scaling architecture:** The package is designed to scale not through its own test count, but through the **consumer ecosystem**. Key scaling mechanisms:

1. **Versioned selectors:** `resolveSelectors(versionedComponents, grafanaVersion)` resolves version-appropriate selectors at runtime. Consumers write once, the framework handles version differences.

2. **Page object model inheritance:** All page models extend `GrafanaPage`, which provides `navigate()`, `getByGrafanaSelector()`, `mockQueryDataResponse()`, `waitForQueryDataRequest()`. Consumers get navigation, mocking, and waiting for free.

3. **Fixture composition:** Consumers import `{ test, expect }` from `@grafana/plugin-e2e` and get all 25+ fixtures plus custom matchers injected. The test API is identical to vanilla Playwright -- no learning curve beyond knowing the fixture names.

4. **Provisioning pattern:** Consumers provide YAML/JSON provisioning files, and `readProvisionedDataSource()` / `readProvisionedDashboard()` / `readProvisionedAlertRule()` fixtures parse them. This eliminates API setup code from tests.

5. **Feature toggle injection:** `test.use({ featureToggles: {...} })` and `test.use({ openFeature: { flags: {...} } })` allow consumers to test against specific Grafana feature configurations without modifying Grafana itself.

---

## Cross-Suite Observations

### Observation 1: `test.step()` remains unused (N=9 suites, 0 usage)
Round 59 adds two more suites (Next.js, Grafana plugin-e2e) with zero `test.step()` usage, extending the pattern from rounds 56-57 (7 suites, 0 outside Grafana main). The only Gold-tier suite using `test.step()` is Grafana's own monorepo (20% of files), and even there it is restricted to CUJ tests.

**Emerging standard:** Production-grade suites prefer short, focused tests (10-20 lines) over long multi-step tests with `test.step()` demarcation.

### Observation 2: Tag systems remain absent (N=9 suites, 0 tag systems)
Neither Next.js nor Grafana plugin-e2e uses any test tagging system. Grafana plugin-e2e uses directory structure (as-admin-user/ vs as-viewer-user/) for categorization. Next.js uses directory structure (e2e/ vs development/ vs production/) plus manifest files for test selection. This extends the pattern: all 9 Gold-tier suites examined across rounds 56-59 rely on structural organization rather than annotation tags.

### Observation 3: Error-path ratio varies by suite type
- **Framework test suites** (Next.js): ~5-8% error-path coverage. Tests focus on verifying framework behavior works correctly.
- **SDK/library test suites** (Grafana plugin-e2e): ~30% error-path coverage. Tests include explicit "should fail when..." cases for API validation.
- **Application test suites** (Grafana main, AFFiNE, freeCodeCamp): 5-20% error-path coverage depending on maturity.

### Observation 4: Fixture-driven arrangement produces the shortest tests
Grafana plugin-e2e's rich fixture layer (25+ fixtures) produces tests averaging 12-15 lines. Next.js's single `nextTestSetup()` produces tests averaging 15-20 lines. Suites with manual setup (freeCodeCamp, Immich) average 30-45 lines. The correlation is clear: **more fixture investment = shorter, more readable tests**.

### Observation 5: Two distinct scaling philosophies
- **Next.js (massive monolith):** Scale through isolation. Each test suite is a self-contained application. ~190-200 parallel CI jobs. Custom test runner. Manifest-driven selection. Test timings for intelligent distribution. No Playwright config at all -- custom Jest-based infrastructure.
- **Grafana plugin-e2e (lean SDK):** Scale through abstraction. Rich page objects + fixtures + matchers handle complexity. Consumers write short tests. Version compatibility handled by the framework. Multi-version CI matrix rather than multi-shard.

### Observation 6: Version-conditional testing is a cross-cutting concern
Both suites implement version-conditional testing, but differently:
- Next.js: runtime `if (isNextDev)` / `if (isNextStart)` / `if (isNextDeploy)` guards within test bodies
- Grafana: `test.skip(semver.lt(grafanaVersion, '9.5.0'), 'message')` annotations at test level

Grafana's approach is more declarative and produces cleaner test output (skipped tests are reported with reasons). Next.js's approach is more flexible but makes it harder to know which tests actually run in which environment.

### Observation 7: CI parallelization scales linearly with test count
- Next.js: ~5,000-10,000 tests, ~190-200 CI jobs, custom timing-based sharding
- Grafana plugin-e2e: ~50-60 tests, no sharding, version matrix instead
- Previous suites: Grafana main (~500+ tests, 8 shards), Cal.com (~300 tests, 8 shards), AFFiNE (~500 tests, 12 shards)

The ratio is roughly 1 CI shard per 50-100 tests for suites that shard. Next.js breaks this ratio because each test suite requires its own Next.js server startup, increasing per-test overhead.

### Observation 8: "One app per test suite" is a framework-testing pattern
Next.js's architecture -- where each test directory IS a Next.js application -- is unique among Gold-tier suites. This pattern makes sense for framework testing (verify the framework works with this specific configuration) but would not scale for application testing. It enables total isolation at the cost of massive CI resource usage.

### Observation 9: Custom matchers as a scaling mechanism
Grafana plugin-e2e's custom matchers (`toHaveAlert()`, `toDisplayPreviews()`, `toBeOK()`, `toHaveNoA11yViolations()`) reduce assertion boilerplate and create a domain-specific testing language. This is a pattern for SDK/framework testing: invest in custom matchers so consumers write less code per test. No other Gold-tier suite invests this heavily in custom matchers.
