# Structure Standards

> **PRELIMINARY — to be validated in phases 2-7 (rounds 13-55)**
> This document contains initial standards based on landscape observations from rounds 1-12.
> All recommendations should be treated as starting points subject to revision as deeper analysis is conducted.

---

## S1. Configuration

### S1.1 Use TypeScript configuration exclusively
- All Playwright configuration MUST use `playwright.config.ts` (never `.js` or `.json`)
- **Basis:** 10/10 Gold suites use TypeScript configuration [grafana-e2e, calcom-e2e, affine-e2e, immich-e2e, playwright-official, freecodecamp-e2e, supabase-e2e, excalidraw-e2e, grafana-plugin-e2e, nextjs-e2e]

### S1.2 Implement environment-aware configuration
- Configuration MUST differentiate between CI and local execution environments
- At minimum, configure differently: `retries`, `workers`, `timeout`, `reporter`
- Pattern: `process.env.CI ? ciValue : localValue`
- **Basis:** 10/10 Gold suites [calcom-e2e: 10s CI / 120s local; grafana-e2e: retries 1 CI / 0 local; immich-e2e: retries 4 CI / 0 local]

### S1.3 Define multiple Playwright projects
- Configuration SHOULD define multiple projects for different execution profiles
- Common project types: browser targets, auth roles, application areas, test categories
- **Basis:** 10/10 Gold suites; range from 3 projects (Immich) to 30+ (Grafana)

### S1.4 Configure `webServer` for auto-start
- Use `webServer` configuration to auto-start the application under test
- Set `reuseExistingServer: !process.env.CI` (fresh in CI, reuse locally)
- **Basis:** 6/10 Gold suites [calcom-e2e, affine-e2e, immich-e2e, excalidraw-e2e, nextjs-e2e, freecodecamp-e2e]

---

## S2. Directory Structure

### S2.1 Use a dedicated test directory at project root
- Playwright tests MUST reside in a dedicated directory (recommended: `e2e/` or `tests/`)
- Do NOT scatter test files throughout the application source tree
- **Basis:** 10/10 Gold suites use dedicated test directories

### S2.2 Organize auth state in `.auth/` directory
- storageState files MUST be saved to `playwright/.auth/` or `.auth/`
- This directory MUST be in `.gitignore`
- **Basis:** [grafana-e2e, grafana-plugin-e2e, supabase-e2e, playwright-auth-docs]

### S2.3 Organize page objects and fixtures alongside tests
- Page objects, fixtures, and test utilities SHOULD live within or adjacent to the test directory
- Common patterns: `e2e/pages/`, `e2e/fixtures/`, `e2e/helpers/`
- **Basis:** [grafana-plugin-e2e (models/), calcom-e2e (fixtures/)]

---

## S3. Page Object Model

### S3.1 Use hybrid POM + fixtures architecture
- Page objects SHOULD be implemented as TypeScript classes
- Page objects SHOULD be registered as Playwright fixtures via `test.extend<T>()`
- This hybrid approach combines encapsulation (classes) with dependency injection (fixtures)
- **Basis:** Emerging dominant pattern across Gold/Silver suites [grafana-e2e, calcom-e2e]

### S3.2 Keep page objects focused on UI abstraction
- Page objects encapsulate locators and interactions
- Fixtures handle test setup, teardown, and dependency injection
- Tests contain assertions and business logic
- **Basis:** [playwright-best-practices, grafana-plugin-e2e]

---

## S4. Fixtures

### S4.1 Use `test.extend<T>()` for custom fixtures
- All shared test setup SHOULD be implemented as typed fixtures
- Fixtures MUST be typed — define an interface for all custom fixtures
- **Basis:** 8/10 Gold suites use custom fixtures; this is the primary maturity indicator

### S4.2 Extend Playwright with domain-specific abstractions
- Mature suites SHOULD extend Playwright with domain-specific fixtures and matchers
- Custom expect matchers improve test readability for domain concepts
- **Basis:** [grafana-plugin-e2e: `expect(panel).toHaveNoDataError()`]

### S4.3 Use factory functions for test data
- Test data SHOULD be generated via factory functions, not hardcoded
- Use Faker.js or similar for randomized, typed data generation
- **Basis:** [clerk-e2e-template, playwrightsolutions-datafactory]

---

## S5. CI Integration Structure

### S5.1 Maintain dedicated CI workflow files
- Playwright E2E tests MUST have dedicated CI workflow files
- Recommended: `.github/workflows/e2e-playwright.yml`
- **Basis:** 10/10 Gold suites have dedicated CI workflows

### S5.2 Configure multi-reporter output
- CI configuration SHOULD use 2+ reporters simultaneously
- Recommended combination: blob (for sharding) + HTML (for debugging) + platform reporter (JUnit/GitHub)
- **Basis:** 8/10 Gold suites use multiple reporters [calcom-e2e: 3 reporters]

### S5.3 Capture artifacts conditionally
- `trace: 'retain-on-failure'` (or `'on-first-retry'`)
- `screenshot: 'only-on-failure'`
- Video: OFF by default (traces provide richer debugging data)
- **Basis:** 10/10 Gold suites; only AFFiNE captures video

---

## Revision History

| Date | Change | Basis |
|---|---|---|
| 2026-03-18 | Initial draft from landscape rounds 1-12 | 10 Gold suites, 12 Silver, ~97 total sources |
