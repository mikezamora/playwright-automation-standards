# Round 16 — Findings

**Phase:** Structure
**Focus:** Contrasting suites — grafana/plugin-tools, clerk/playwright-e2e-template

---

## Finding 1: The highest-maturity pattern is extracting test infrastructure into a published package
`@grafana/plugin-e2e` publishes models, fixtures, matchers, and selectors as an npm package consumed by the entire Grafana plugin ecosystem. This represents the apex of Playwright suite maturity — from ad-hoc tests to distributable framework.
- **Evidence:** grafana/plugin-tools src/ (auth/, fixtures/, matchers/, models/, selectors/, types.ts, index.ts)

## Finding 2: Custom expect matchers are a key differentiator for domain-specific testing
`@grafana/plugin-e2e` exports matchers like `toHaveNoDataError()` that encapsulate complex Grafana-specific assertions. This eliminates duplication across plugin repositories and standardizes how data source errors are validated.
- **Evidence:** grafana/plugin-tools src/matchers/ directory, published via npm

## Finding 3: Selector versioning enables cross-version compatibility testing
`@grafana/plugin-e2e` maintains version-aware selectors that adapt to different Grafana releases. This enables plugin developers to test against multiple Grafana versions without maintaining version-specific test code.
- **Evidence:** grafana/plugin-tools src/selectors/ directory

## Finding 4: Role-based directory organization maps directly to auth projects
`tests/as-admin-user/` and `tests/as-viewer-user/` mirror the `admin` and `viewer` Playwright projects. This 1:1 mapping between directory structure and project config makes the relationship between auth state and test scope immediately visible.
- **Evidence:** grafana/plugin-tools playwright.config.ts (5 projects), tests/ directory structure

## Finding 5: The Jest-to-@playwright/test migration represents a generational shift
Clerk's template uses `jest-playwright` (Jest as runner, Playwright for automation). All Gold suites use `@playwright/test` (unified runner). This historical contrast shows the ecosystem has converged on a single runner that integrates fixtures, assertions, and browser management.
- **Evidence:** Clerk template (Jest + jest-playwright), all 5 Gold suites (@playwright/test)

## Finding 6: Class-based POM without fixtures is the pre-modern pattern
Clerk's template uses pure class-based page objects without `test.extend()`. Modern suites (Cal.com, Grafana) wrap classes in fixture definitions, combining encapsulation with dependency injection. The hybrid pattern has superseded the pure-class approach.
- **Evidence:** Clerk pages/ (class-based), Cal.com fixtures/ (factory + extend), Grafana plugin-e2e (models + fixtures)

## Finding 7: Wide-screen viewport projects address responsive testing
`@grafana/plugin-e2e` includes an `admin-wide-screen` project with 1920x1080 viewport alongside the standard `admin` project. This dedicated project for wide-screen testing is unique among analyzed suites and addresses dashboard layout verification.
- **Evidence:** grafana/plugin-tools config (admin-wide-screen project, 1920x1080)

## Finding 8: Template repositories capture ecosystem evolution snapshots
Clerk's archived template documents how Playwright testing was structured before `@playwright/test`. Its `external/` directory (database), `fixtures/` (factories), and `pages/` (POM) represent clean separation that modern suites have integrated via `test.extend()`.
- **Evidence:** Clerk template directory structure, archived status, Jest configuration
