# Suite Analysis: freeCodeCamp/freeCodeCamp

**Repository:** https://github.com/freeCodeCamp/freeCodeCamp
**Suite Location:** `/e2e/` (self-contained package)
**Tier:** Gold
**Round:** 15-16 (Contrasting Deep Dive)

---

## 1. Architecture Analysis

### Directory Structure
```
/e2e/
  playwright.config.ts
  package.json                 # Separate package with own dependencies
  tsconfig.json
  eslint.config.mjs
  .lintstagedrc.mjs
  .gitignore
  global-setup.ts              # Shared setup (auth state)
  fixtures/                    # Test data
  utils/                       # Helper functions
  challenge.spec.ts            # + 126 total spec files (flat)
  editor.spec.ts
  signin.spec.ts
  profile.spec.ts
  ...
```

### playwright.config.ts
- **6 projects**: setup + chromium + firefox + webkit + Mobile Chrome (Pixel 5) + Mobile Safari (iPhone 12)
- All browser projects depend on `setup` (auth state)
- `fullyParallel: false` — serial execution
- `workers: 1` — single worker (no parallelization)
- `retries: process.env.CI ? 2 : 0`
- `timeout: 15_000` (15s)
- `maxFailures: process.env.CI ? 6 : undefined`
- `forbidOnly: !!process.env.CI`
- `testIdAttribute: 'data-playwright-test-label'` — custom test ID attribute

### POM / Fixtures
- **No POM** — flat test files with utility functions
- `fixtures/` — test data files
- `utils/` — shared helper functions
- `global-setup.ts` — authentication state creation

### Web Server
- **Mailpit Docker container** for email testing: `docker run --rm -p 1025:1025 -p 8025:8025 axllent/mailpit`
- Port: 1025
- Startup timeout: 180s
- Main app assumed to be running externally

### Environment Config
- `HOME_LOCATION` env var for baseURL (default `http://127.0.0.1:8000`)
- `storageState: 'playwright/.auth/certified-user.json'` for authenticated tests
- Reporter output: `playwright/reporter`

## 2. Validation Analysis

### Assertion Patterns
- Standard Playwright assertions
- `toBeVisible()`, `toHaveURL()`, `toHaveText()`
- Content validation for curriculum challenges

### Locator Strategies
- **Custom test ID**: `data-playwright-test-label` (not standard `data-testid`)
- Contributor guide prescribes priority: `getByRole` > `getByText` > `data-playwright-test-label`

### Retry/Timeout Config
- 2 retries in CI
- 15s timeout (tight)
- `maxFailures: 6` in CI — fail-fast to save CI time
- `trace: 'on-first-retry'`
- `screenshot: 'only-on-failure'`

### Test Isolation
- Single worker prevents parallelism-related issues
- Auth state shared via `storageState`
- Serial execution ensures deterministic order

## 3. CI/CD Analysis

### Pipeline (.github/workflows/e2e-playwright.yml)
- Triggers: `workflow_dispatch` + pull requests to `main`/`temp-**`
- Matrix: Node 24 x Chromium (Firefox/WebKit planned)
- Fail-fast disabled
- Concurrency: grouped by workflow + PR, cancellation suppressed for `main`/`prod-*`

### Build Process
1. Build client (`client/public`) — uploaded as artifact
2. Build API Docker image — saved as tar artifact
3. Load Docker image, seed database with certified user
4. Serve client via `serve:client-ci`
5. Run Playwright tests (exclude `third-party-donation.spec.ts`)

### Reporters
- HTML reporter at `playwright/reporter`
- 7-day artifact retention

### Infrastructure
- Docker-based API
- Docker Compose for test environment
- Mailpit container for email testing

## 4. Semantic Analysis

### Test Naming
- Files: `kebab-case.spec.ts` (e.g., `challenge.spec.ts`, `donate-page-default.spec.ts`)
- **126 flat spec files** — no subdirectory nesting for test categories
- Feature-descriptive names

### Custom Test ID
- `data-playwright-test-label` instead of `data-testid`
- Documented in contributor guide with locator priority hierarchy

### Documentation
- Dedicated contributor guide at contribute.freecodecamp.org
- Locator priority hierarchy documented externally
- `.env.e2e.example` files for environment setup

## 5. Key Patterns — Contrasts with Gold Standards

1. **Single worker, serial execution** — opposite of Grafana/Cal.com's fully parallel approach; prioritizes determinism over speed
2. **Flat file organization (126 files)** — no suite directories or feature grouping, unlike Grafana's `-suite/` pattern
3. **Custom test ID attribute** — `data-playwright-test-label` is unique among all analyzed suites (all others use default `data-testid`)
4. **Mailpit as webServer** — uses Playwright's webServer for email infrastructure rather than the app server itself
5. **App started externally** — unlike Cal.com's triple-server config, the main app is built/served outside Playwright
6. **maxFailures in CI** — fail-fast after 6 failures to conserve CI resources
7. **Full cross-browser + mobile testing** — 5 browser/device configs tested (most suites only test Chromium)
8. **126 test files with no POM** — demonstrates that large suites can work without page object abstraction

### Key Contrast: Simplicity vs. Sophistication
freeCodeCamp represents the "simple but effective" end of the spectrum — single worker, flat files, no POM, no custom fixtures — yet successfully tests a massive platform. This contrasts with Grafana's 28 projects and Cal.com's factory fixtures.
