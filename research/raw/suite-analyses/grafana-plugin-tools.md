# Suite Analysis: grafana/plugin-tools (@grafana/plugin-e2e)

**Repository:** https://github.com/grafana/plugin-tools
**Suite Location:** `/packages/plugin-e2e/`
**Tier:** Gold (Published Framework)
**Round:** 15-16 (Contrasting Deep Dive)

---

## 1. Architecture Analysis

### Directory Structure
```
/packages/plugin-e2e/
  playwright.config.ts
  package.json
  jest.config.js
  vitest.config.ts
  tsconfig.json
  provisioning/                # Grafana provisioning config
  tests/                       # E2E tests
    as-admin-user/             # Admin role tests
    as-viewer-user/            # Viewer role tests
  src/
    auth/                      # Auth setup/utilities
    fixtures/                  # Playwright fixtures (test.extend)
    matchers/                  # Custom expect matchers
    models/                    # Page object models
    selectors/                 # UI selector definitions
    index.ts                   # Public API
    options.ts                 # Configuration options
    types.ts                   # TypeScript type definitions
```

### playwright.config.ts
- **5 projects**: `authenticate`, `createUserAndAuthenticate`, `admin`, `admin-wide-screen` (1920x1080), `viewer`
- `fullyParallel: true`
- `retries: process.env.CI ? 2 : 0`
- Reporter: HTML
- `trace: 'on-first-retry'`
- `baseURL: 'http://localhost:3000'`
- Custom options: `provisioningRootDir`, `grafanaAPICredentials`, `httpCredentials`, `featureToggles`

### POM / Fixtures — Published Package Architecture
- **Models** (`src/models/`): Class-based page objects representing Grafana pages and components
- **Fixtures** (`src/fixtures/`): `test.extend()` registrations that inject models into tests
- **Matchers** (`src/matchers/`): Custom `expect` extensions (e.g., `toHaveNoDataError()`)
- **Selectors** (`src/selectors/`): Centralized UI selector definitions
- **Auth** (`src/auth/`): Authentication setup utilities

### Role-Based Test Organization
- `tests/as-admin-user/` — tests running with admin auth state
- `tests/as-viewer-user/` — tests running with viewer auth state
- Each role is a separate Playwright project with its own `storageState`

### Environment Config
- `provisioningRootDir` — Grafana provisioning directory
- `grafanaAPICredentials` — API auth (username/password)
- `httpCredentials` — browser HTTP auth
- `featureToggles` — Grafana feature flag configuration

## 2. Validation Analysis

### Custom Matchers
- Published as part of `@grafana/plugin-e2e` npm package
- Domain-specific: `toHaveNoDataError()`, `toDisplayPreviousDataWhenPanelLoadFails()`
- Extend Playwright's `expect` via `mergeExpect`

### Selector Architecture
- Centralized selector definitions in `src/selectors/`
- Version-aware selectors that adapt to different Grafana versions
- Consumed by models for consistent element targeting

### Assertion Patterns
- Standard Playwright assertions enhanced with custom matchers
- Role-based locators: `getByRole()`, `getByLabel()`, `getByTestId()`
- Domain-specific assertions for Grafana UI states

## 3. CI/CD Analysis

### Pipeline
- 2 retries in CI
- HTML reporter
- Trace on first retry
- Provisioning directory for Grafana config injection

### Test Execution
- Auth projects run first (no dependencies)
- Admin/viewer projects depend on respective auth projects
- Wide-screen variant tests responsive layout behaviors

## 4. Semantic Analysis

### Test Organization by Role
- `as-admin-user/` and `as-viewer-user/` — role names in directory paths
- Clear mapping between project names and test directories

### Published API Design
- `index.ts` — single public entry point
- `options.ts` — configuration type definitions
- `types.ts` — shared type definitions
- Clean separation: models, fixtures, matchers, selectors, auth

## 5. Key Patterns — Contrasts with Gold Standards

1. **Published as npm package** — unlike all other suites that are repo-internal, `@grafana/plugin-e2e` is distributed for use by the Grafana plugin ecosystem
2. **Custom matchers as API** — `toHaveNoDataError()` demonstrates domain-specific assertions exported for external consumption
3. **Selector versioning** — selectors adapt to different Grafana versions, enabling cross-version plugin testing
4. **Role-based directory organization** — `as-admin-user/` and `as-viewer-user/` explicitly map tests to auth contexts
5. **Wide-screen project variant** — dedicated 1920x1080 project for responsive testing (unique among analyzed suites)
6. **Framework-first design** — organized as a reusable library (models, fixtures, matchers, selectors) rather than a standalone test suite
7. **Provisioning directory pattern** — Grafana-specific config injection for test environment setup

### Key Contrast: Library vs. Suite
grafana/plugin-tools represents the highest maturity level — a test suite extracted into a distributable framework. This contrasts with freeCodeCamp's simple flat-file approach and Excalidraw's Vitest-primary strategy, showing the full spectrum from "tests as code" to "tests as framework."
