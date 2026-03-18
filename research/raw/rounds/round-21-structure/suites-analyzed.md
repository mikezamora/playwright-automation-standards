# Round 21 — Suites Analyzed

**Phase:** Structure
**Focus:** Validation sweep on structure patterns — quick structural scans of 12 additional suites
**Date:** 2026-03-18

## Suites Analyzed (Quick Structural Scans)

### 1. PostHog/posthog (Analytics platform — Silver)
- **Directory:** `playwright/` at project root with `e2e/`, `page-models/`, `mocks/`, `utils/`, `__snapshots__/`
- **Config:** `playwright.config.ts`, environment variables for auth (`LOGIN_USERNAME`, `LOGIN_PASSWORD`, `BASE_URL`)
- **POM pattern:** Dedicated `page-models/` directory — class-based page objects
- **Auth:** Auto fixtures replacing setup projects (migrated from project dependencies to auto fixtures for --ui mode compatibility)
- **Naming:** `.spec.ts` convention
- **Key deviation:** Uses auto fixture for auth instead of setup project — emerging pattern for better DX
- **Source:** https://github.com/PostHog/posthog/tree/master/playwright

### 2. actualbudget/actual (Personal finance — Silver)
- **Directory:** `e2e/` directory in monorepo, separate Electron e2e tests in `packages/desktop-electron/`
- **Config:** `playwright.config.ts`, TypeScript-only (recently converted from JS)
- **POM pattern:** Page type imports (`AccountPage`, `ConfigurationPage`, `NavigationPage`) — class-based POM
- **Auth:** Not applicable (local-first app, no multi-user auth)
- **Naming:** `.spec.ts` (post-conversion from `.spec.js`)
- **Key deviation:** Electron-specific fixtures for desktop app testing via `_electron.launch()`
- **Source:** https://github.com/actualbudget/actual/pull/4217

### 3. supabase-community/e2e (Database platform — Silver)
- **Directory:** `e2e/` folder with auth-based file naming (`test-case.user.spec.ts` vs `test-case.spec.ts`)
- **Config:** `globalSetup` with consolidated `env.config.ts`, test timeout 120s, retries 2
- **POM pattern:** Not visible — utility-based approach
- **Auth:** Setup project with `storageState` in `playwright/.auth/`, localStorage-based session restoration
- **Naming:** `.spec.ts` with auth qualifier suffix (`.user.spec.ts`)
- **Key deviation:** Auth qualifier in filename is unique naming convention; globalSetup instead of setup projects
- **Source:** https://github.com/supabase-community/e2e

### 4. documenso/documenso (Document signing — Silver)
- **Directory:** Monorepo with dedicated e2e workflow
- **Config:** `playwright.config.ts` with CI workflow in `.github/workflows/e2e-tests.yml`
- **Naming:** `.spec.ts` convention
- **Source:** https://github.com/documenso/documenso

### 5. ovcharski/playwright-e2e (E-commerce framework — Bronze)
- **Directory:** `pages/` (BasePage, CheckoutPage, HomePage, LoginPage, ProductPage, RegisterPage) + `tests/` (api/, e2e/, ui/)
- **Config:** `playwright.config.js` (JavaScript — not TypeScript), `global-setup.js`
- **POM pattern:** Class-based with `BasePage` inheritance — `extends BasePage` pattern
- **Auth:** `global-setup.js` file approach
- **Naming:** Mixed — JavaScript files
- **Key deviation:** Uses BasePage inheritance (confirmed anti-pattern), JavaScript config (not TypeScript)
- **Source:** https://github.com/ovcharski/playwright-e2e

### 6. rishivajre/Playwright-End-to-End-E2E-Test-Automation-Framework (Enterprise template — Bronze)
- **Directory:** `.github/workflows/`, `config/` (env-specific: dev.env.js, qa.env.js, staging.env.js, prod.env.js), `data/`, `src/pages/`, `src/tests/` (e2e/, api/, mobile/), `fixtures/`, `utils/`, `reports/`
- **Config:** Environment-specific config files (NOT `process.env.CI` ternary — uses dotenv per environment)
- **POM pattern:** Class-based POM with separate helpers (apiHelper, dbHelper, testDataGenerator)
- **Key deviation:** Multi-environment config files instead of CI ternary — enterprise pattern but diverges from Gold suite convention
- **Source:** https://github.com/rishivajre/Playwright-End-to-End-E2E-Test-Automation-Framework

### 7. ecureuill/saucedemo-playwright (Demo app testing — Bronze)
- **Directory:** `tests/components/`, `tests/fixtures/` (JSON data files), `tests/pages/`, `tests/e2e/`, `tests/ui/`, `tests/visual/`
- **Config:** `auth.setup.ts` for authentication setup
- **POM pattern:** Class-based POM in `tests/pages/`
- **Auth:** `auth.setup.ts` setup file
- **Test type separation:** e2e/, ui/, visual/ — three-way test type split
- **Source:** https://github.com/ecureuill/saucedemo-playwright

### 8. angelo-loria/playwright-boilerplate (Boilerplate — Bronze)
- **Directory:** Standard structure with page objects as fixtures
- **Config:** Sharding enabled, GitHub Actions with Docker container
- **POM pattern:** Page objects instantiated via fixtures and injected into tests
- **Key pattern:** Confirms POM-as-fixture injection pattern from Gold suites
- **Source:** https://github.com/angelo-loria/playwright-boilerplate

### 9. Red Hat consoledot-e2e (Enterprise — Silver)
- **Directory:** E2E tests with multi-reporter configuration
- **Config:** `playwright.config.ts` with multiple reporters
- **Source:** https://github.com/redhat-developer/consoledot-e2e

### 10. MakerKit Next.js + Supabase template (SaaS template — Bronze)
- **Directory:** Tests organized by auth state (logged-in vs logged-out)
- **Config:** `playwright.config.ts` with `webServer` auto-start
- **Auth:** Supabase localStorage-based session via `sb-${appId}-auth-token`
- **Key pattern:** Auth-state directory organization mirrors Playwright official recommendation
- **Source:** https://makerkit.dev/docs/next-supabase-turbo/development/application-tests

### 11. Nextbase Starter Kit (SaaS template — Bronze)
- **Directory:** Integration tests alongside application code
- **Config:** Standard Playwright config
- **Auth:** Setup-based authentication with Supabase
- **Source:** https://www.usenextbase.com/docs/v1/guides/writing-integration-tests

### 12. sampennington/playwright-posthog (Analytics matchers — Bronze)
- **Directory:** Custom matcher library for PostHog analytics events
- **Config:** Library project — extends Playwright's `expect` with PostHog-specific matchers
- **Key pattern:** Domain-specific custom matchers published as npm package — mirrors Grafana plugin-e2e pattern
- **Source:** https://github.com/sampennington/playwright-posthog

## Method
- Web search for 12 additional Playwright test suites not previously deep-dived
- Quick structural scans: directory structure, config approach, POM pattern, auth approach, file naming
- Focused on identifying deviations from patterns confirmed in rounds 13-20
- Included mix of Silver/Bronze suites to broaden the sample beyond Gold tier
