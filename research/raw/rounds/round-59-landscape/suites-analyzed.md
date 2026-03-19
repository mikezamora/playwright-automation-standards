# Round 59 — Suites Analyzed

Re-analysis of two suites through test anatomy, coverage strategy, and scaling organization lenses. All data from direct inspection of current canary (Next.js) and main (Grafana plugin-tools) branches via GitHub API.

## Suites Re-analyzed

| Suite | Tier | Stars | Language | Test Framework |
|-------|------|-------|----------|----------------|
| vercel/next.js | Gold | ~132,000 | TypeScript/React | Custom runner (Jest-based) wrapping Playwright + fetchViaHTTP |
| grafana/plugin-tools (plugin-e2e) | Gold | ~400 | TypeScript | Playwright with rich fixture/matcher extensions |

## Three-Lens Summary

| Suite | Lens | Key Finding |
|-------|------|-------------|
| next.js | Anatomy | Zero `test.step()`, zero `beforeEach`; single `nextTestSetup()` god-fixture handles all arrangement; avg ~15-20 lines/test with ~3-4 assertions; deep `describe.each`/`it.each` nesting for parametric coverage; runtime `if (isNextDev)` guards instead of `test.skip()` |
| next.js | Coverage | 382 app-dir subdirectories + 169 other e2e + 43 dev + 74 prod + 279 integration dirs; each dir is a self-contained Next.js app; zero tags; manifest-driven test selection; ~5-8% error-path; test category = directory location |
| next.js | Scaling | ~190-200 parallel CI jobs; 10-group sharding x 2 React versions; custom `run-tests.js` runner with timing-based distribution; "one app per test suite" total isolation; manifest files track pass/fail/flake per bundler |
| grafana/plugin-e2e | Anatomy | Cleanest AAA pattern of any Gold suite; 25+ fixtures eliminate all setup code; avg ~12-15 lines/test (shortest observed); zero `test.step()`, zero `describe` nesting beyond 1 level; `test.skip(semver.lt())` for version gating; 7 custom matchers |
| grafana/plugin-e2e | Coverage | ~50-60 tests across 25 spec files; datasource testing dominates (~60%); role-based directories (admin vs viewer); ~30% error-path coverage (best among SDK-type suites); OpenFeature + a11y testing included; no tags |
| grafana/plugin-e2e | Scaling | 13 page models + 13 component models + 25+ fixtures + 7 custom matchers; multi-Grafana-version CI matrix; Docker Compose environment; consumer scaling via fixture composition and versioned selectors; no sharding needed |

## Cross-Suite Observations

| Observation | Evidence |
|-------------|----------|
| `test.step()` still unused | Zero occurrences in both suites; cumulative 9/9 Gold suites examined across rounds 56-59 do not use `test.step()` (Grafana main is the sole exception at 20% of files) |
| No tag systems | Zero tag annotations in either suite; cumulative 9/9 Gold suites rely on directory structure for test categorization |
| Fixture investment inversely correlates with test length | Grafana plugin-e2e (25+ fixtures) = 12-15 lines avg; Next.js (1 fixture) = 15-20 lines avg; freeCodeCamp (7 utilities) = 35-45 lines avg |
| Error-path ratio varies by suite archetype | Framework suites ~5-8%, SDK suites ~30%, application suites 5-20% |
| Two scaling philosophies | Next.js: scale through isolation (one app per test, massive CI parallelism); Grafana: scale through abstraction (rich fixtures, version-aware page objects) |
| Version-conditional testing ubiquitous | Next.js: runtime if-guards; Grafana: `test.skip(semver.lt())` -- both handle multi-version/multi-env testing but with different approaches |
| Custom matchers as SDK scaling pattern | Grafana plugin-e2e invests in 7 domain-specific matchers; no other Gold suite matches this investment -- unique to SDK/framework testing |

## Files Examined

### Next.js (vercel/next.js)
- `contributing/core/testing.md` -- test organization guide (e2e/development/production/integration/unit categories)
- `.github/workflows/build_and_test.yml` -- ~190-200 parallel CI jobs, timing-based sharding, React version matrix
- `test/deploy-tests-manifest.json` -- 8 suites with pass/fail/flake tracking, include/exclude rules
- `test/turbopack-dev-tests-manifest.json` -- 170+ test suites with per-test status tracking
- `test/e2e/app-dir/app-routes/app-custom-routes.test.ts` -- 400+ line test, deep describe.each/it.each nesting, runtime if-guards, ~45 tests covering HTTP methods, routing, body parsing, hooks, errors
- `test/e2e/app-dir/app-routes/app-custom-route-base-path.test.ts` -- 2-line file reusing test suite with different BASE_PATH
- `test/e2e/app-dir/actions/app-action.test.ts` -- 1200+ lines, actions/revalidation/caching/navigation tests
- `test/e2e/app-dir/actions/app-action-progressive-enhancement.test.ts` -- progressive enhancement tests, disableJavaScript browser option
- `test/e2e/app-dir/app-a11y/index.test.ts` -- route announcer accessibility tests, custom browser eval
- `test/e2e/app-dir/app-rendering/rendering.test.ts` -- SSR/static/ISR rendering tests, cheerio HTML parsing
- `test/e2e/app-dir/app-external/app-external.test.ts` -- external dependency resolution tests
- `test/e2e/app-dir/app-static/app-static.test.ts` -- 1000+ line caching/revalidation test
- `test/e2e/app-dir/app-client-cache/client-cache.original.test.ts` -- staleTimes cache semantics, time manipulation
- `test/e2e/edge-pages-support/index.test.ts` -- edge runtime tests, routes-manifest validation
- `test/e2e/dynamic-route-interpolation/index.test.ts` -- dynamic route parameter handling

### Grafana plugin-e2e (grafana/plugin-tools)
- `packages/plugin-e2e/playwright.config.ts` -- 5 projects (2 auth + 3 execution), Docker Compose, version matrix
- `packages/plugin-e2e/package.json` -- v3.4.8, Playwright ^1.52.0, axe-core optional peer dep
- `packages/plugin-e2e/CONTRIBUTING.md` -- architecture guide, versioned compatibility, canary release workflow
- `packages/plugin-e2e/README.md` -- consumer API overview, basic test example
- `packages/plugin-e2e/src/index.ts` -- public API: extended test/expect, fixture registration, matcher registration
- `packages/plugin-e2e/src/fixtures/page.ts` -- page fixture with featureToggle + OpenFeature injection
- `packages/plugin-e2e/src/fixtures/selectors.ts` -- version-aware selector resolution
- `packages/plugin-e2e/src/fixtures/grafanaAPIClient.ts` -- API client fixture with auth
- `packages/plugin-e2e/src/fixtures/commands/login.ts` -- login command fixture
- `packages/plugin-e2e/src/models/pages/GrafanaPage.ts` -- base page model (navigate, getByGrafanaSelector, mock*, waitFor*)
- `packages/plugin-e2e/src/models/pages/DataSourceConfigPage.ts` -- config page with saveAndTest()
- `packages/plugin-e2e/src/models/pages/PanelEditPage.ts` -- 20+ methods for panel editing
- `packages/plugin-e2e/src/models/components/DataSourcePicker.ts` -- version-aware datasource selection
- `packages/plugin-e2e/tests/as-admin-user/datasource/config-editor/configEditor.spec.ts` -- 4 tests: render, success, error, custom health
- `packages/plugin-e2e/tests/as-admin-user/datasource/query-editor/queryEditor.spec.ts` -- 3 tests: render, dropdown, back-to-dashboard
- `packages/plugin-e2e/tests/as-admin-user/datasource/annotations/annotationEditor.spec.ts` -- 2 tests: render, add new
- `packages/plugin-e2e/tests/as-admin-user/datasource/annotations/annotationQueryRunner.spec.ts` -- 3 tests: success/fail/provisioned
- `packages/plugin-e2e/tests/as-admin-user/datasource/alerting/alerting.basicMode.spec.ts` -- 6 tests with version skipping
- `packages/plugin-e2e/tests/as-admin-user/datasource/alerting/alerting.advancedMode.spec.ts` -- 8 tests, advanced mode toggle
- `packages/plugin-e2e/tests/as-admin-user/datasource/variables/variableEditor.spec.ts` -- 3 tests: render, create, open
- `packages/plugin-e2e/tests/as-admin-user/datasource/variables/variableInterpolation.spec.ts` -- 1 test: interpolation
- `packages/plugin-e2e/tests/as-admin-user/a11y/accessibility.spec.ts` -- 2 tests: basic scan, custom options
- `packages/plugin-e2e/tests/as-admin-user/openfeature/openFeature.spec.ts` -- 3 tests: OFREP interception, flag merging, fixture retrieval
- `packages/plugin-e2e/tests/as-admin-user/preferences/defaults.spec.ts` -- 2 tests: language, theme
- `packages/plugin-e2e/tests/as-viewer-user/permissions.spec.ts` -- 1 test: permission redirect
- `packages/plugin-e2e/tests/as-admin-user/datasource/data-assertions/dataAssertion.spec.ts` -- panel data assertions
- `packages/plugin-e2e/tests/as-admin-user/panel/panel.spec.ts` -- clock panel tests

## Sources Consulted

- `vercel/next.js` canary branch: `test/` directory tree, `.github/workflows/build_and_test.yml`, `contributing/core/testing.md`, `test/readme.md`, test manifest JSON files, 10+ test files read in full
- `grafana/plugin-tools` main branch: `packages/plugin-e2e/` full source tree, `playwright.config.ts`, `.github/workflows/playwright.yml`, `CONTRIBUTING.md`, `README.md`, `package.json`, 15+ test files read in full, all fixture/model/matcher source files examined
