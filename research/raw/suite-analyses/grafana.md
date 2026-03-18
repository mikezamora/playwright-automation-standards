# Suite Analysis: grafana/grafana

**Repository:** https://github.com/grafana/grafana
**Suite Location:** `/e2e-playwright/` (tests) + `/playwright.config.ts` (root config)
**Tier:** Gold
**Round:** 13-14 (Structure Deep Dive)

---

## 1. Architecture Analysis

### Directory Structure
```
/playwright.config.ts          # Root config, 28 projects
/e2e-playwright/
  alerting-suite/
  cloud-plugins-suite/
  dashboard-cujs/              # Customer User Journeys
  dashboard-new-layouts/
  dashboards-search-suite/
  dashboards-suite/            # 34 spec files
  extensions/
  fixtures/                    # Shared test fixtures
  panels-suite/
  plugin-e2e/                  # Plugin integration tests
  smoke-tests-suite/
  storybook/
  test-plugins/
  unauthenticated/
  utils/                       # Shared utilities (incl. axe a11y reporter)
  various-suite/
  start-server                 # Server bootstrap script
```

### playwright.config.ts
- **28 projects** organized by: auth setup (2), data source plugins (16), feature suites (9), dashboard CUJS (3 with setup/teardown dependency chain)
- `fullyParallel: true`
- `retries: process.env.CI ? 1 : 0`
- `workers: process.env.CI ? 4 : undefined` (auto locally)
- `expect.timeout: 10_000`
- Base URL: `process.env.GRAFANA_URL ?? 'http://localhost:3001'`
- Auth: `httpCredentials: { username: 'admin', password: 'admin' }`
- Provisioning via `PROV_DIR` env var

### POM / Fixtures
- Uses `@grafana/plugin-e2e` package (published npm package with domain-specific fixtures, models, matchers, selectors)
- Fixture-based POM: models represent Grafana pages/components
- Auth fixtures: `authenticate` and `createUserAndAuthenticate` projects store state in JSON

### Data Management
- Dashboard JSON fixtures imported directly in tests
- API-driven setup/teardown via `request` fixture
- Provisioning directory for Grafana-specific config

### Environment Config
- `GRAFANA_URL` controls baseURL
- `PROV_DIR` controls provisioning root
- webServer only runs when `GRAFANA_URL` is not set (CI starts its own)

## 2. Validation Analysis

### Assertion Patterns
- `expect(element).toBeVisible()` / `toBeHidden()` — primary assertions
- Custom `@grafana/plugin-e2e` matchers (e.g., `toHaveNoDataError()`)
- Role-based locators: `getByRole()`, `getByLabel()`, `getByTestId()`

### Retry/Timeout Config
- 1 retry in CI, 0 locally
- 10s expect timeout
- `trace: 'retain-on-failure'`
- `screenshot: 'only-on-failure'`

### Flakiness Handling
- `forbidOnly: !!process.env.CI`
- `test.fixme()` with issue references for known flaky tests
- Tags for selective test execution

### Test Isolation
- Auth state isolation via separate projects (admin vs. viewer)
- API-driven data setup (import dashboard) and teardown (delete dashboard) in `beforeAll`/`afterAll`

## 3. CI/CD Analysis

### Pipeline
- `webServer` command: `yarn e2e:plugin:build && ./e2e-playwright/start-server`
- webServer only configured when `GRAFANA_URL` is not set
- Server output piped for debugging

### Reporters
- HTML reporter (primary)
- Custom accessibility reporter at `./e2e-playwright/utils/axe-a11y/reporter.ts`

### Artifacts
- Traces retained on failure
- Screenshots only on failure
- Clipboard permissions granted (clipboard-read, clipboard-write)

## 4. Semantic Analysis

### Test Naming
- Files: `kebab-case.spec.ts` (e.g., `dashboard-browse.spec.ts`)
- Describe blocks: `test.describe('Dashboard browse', { tag: ['@dashboards'] }, ...)`
- Test names: descriptive action phrases (e.g., `'Manage Dashboards tests'`)

### Tags
- `@dashboards`, `@alerting`, etc. — used for filtering test execution
- Tags applied at `describe` level via Playwright's tag API

### Documentation
- Self-documenting config through project names and testDir paths
- Provisioning directory convention documents infrastructure requirements

## 5. Key Patterns

1. **Largest project count observed (28)** — demonstrates Playwright's multi-project scalability for complex applications
2. **Published test framework (`@grafana/plugin-e2e`)** — the only suite that extracts its testing infrastructure into a reusable npm package with custom models, fixtures, matchers, and selectors
3. **Suite-based organization** — tests grouped into `-suite/` directories by feature domain rather than flat file listing
4. **Setup/teardown dependency chains** — dashboard CUJS uses project dependencies for ordered execution
5. **Accessibility reporter** — custom axe-a11y integration built into the test pipeline
6. **Plugin ecosystem testing** — 16 data source plugin projects demonstrate testing at scale across an ecosystem
