# Semantic Conventions

> **PRELIMINARY — to be validated in phases 2-7 (rounds 13-55)**
> This document contains initial conventions based on landscape observations from rounds 1-12.
> All recommendations should be treated as starting points subject to revision as deeper analysis is conducted.

---

## N1. File Naming

### N1.1 Use `.spec.ts` as the default test file extension
- Test files SHOULD use the `*.spec.ts` naming convention
- This aligns with Playwright's default `testMatch` configuration
- **Basis:** 7/10 Gold suites use `.spec.ts` [grafana-e2e, calcom-e2e, affine-e2e, immich-e2e, excalidraw-e2e, grafana-plugin-e2e, nextjs-e2e]

### N1.2 Name test files by feature area
- Test files SHOULD be named after the feature they test: `booking.spec.ts`, `dashboard.spec.ts`, `auth.spec.ts`
- Avoid generic names like `test1.spec.ts` or `smoke.spec.ts`
- **Basis:** Observed across all Gold suites

### N1.3 Use kebab-case for file names
- Test files: `booking-flow.spec.ts`, `user-auth.spec.ts`
- Page objects: `dashboard-page.ts`, `login-page.ts`
- Fixtures: `auth-fixtures.ts`, `api-fixtures.ts`
- **Basis:** TypeScript community convention; observed in Gold suites

---

## N2. Test Descriptions

### N2.1 Use action-oriented test descriptions
- `test()` descriptions SHOULD describe user actions and expected outcomes
- Format: "should [action] [expected result]" or "[action] [expected result]"
- Example: `test('should create a new booking when valid data is submitted')`
- **Basis:** [calcom-e2e, freecodecamp-e2e, immich-e2e]

### N2.2 Use `test.describe()` to group by feature area
- Group related tests under descriptive `test.describe()` blocks
- Nest for context: `describe('Dashboard')` > `describe('with admin role')` > `test(...)`
- **Basis:** [grafana-e2e (role-based nesting), calcom-e2e]

---

## N3. Locator Attributes

### N3.1 Use `data-testid` as the escape hatch attribute
- When semantic locators are insufficient, use `data-testid`
- Convention: kebab-case values: `data-testid="booking-form"`, `data-testid="submit-button"`
- **Basis:** [calcom-e2e, playwright-best-practices]

### N3.2 Prefer semantic locator names
- Locator variable names SHOULD reflect the UI element's purpose
- Example: `const submitButton = page.getByRole('button', { name: 'Submit' })`
- Avoid: `const btn1 = page.locator('.btn-primary')`
- **Basis:** [playwright-best-practices, freecodecamp-e2e contributor guide]

---

## N4. Code Naming

### N4.1 Use camelCase for fixtures and variables
- Fixture names: `authenticatedPage`, `apiClient`, `adminUser`
- Local variables: `bookingForm`, `dashboardPanel`
- **Basis:** TypeScript convention; [grafana-plugin-e2e, boilerplate-playwright-ts]

### N4.2 Use PascalCase for page object classes
- Page object classes: `DashboardPage`, `LoginPage`, `BookingFlowPage`
- **Basis:** TypeScript convention; [clerk-e2e-template, calcom-e2e]

### N4.3 Use descriptive project names
- Playwright project names SHOULD clearly convey their scope
- Browser projects: `chromium`, `firefox`, `webkit`
- Role projects: `auth-admin`, `auth-viewer`, `setup`
- App projects: `web`, `api`, `embed`, `mobile`
- **Basis:** [calcom-e2e (7 named projects), grafana-e2e (30+ projects), immich-e2e]

---

## N5. Categorization

### N5.1 Use Playwright projects as the primary categorization mechanism
- Prefer project-based grouping over tags or grep patterns
- Each project can have its own config (testDir, timeout, dependencies)
- **Basis:** [immich-e2e (web vs. ui vs. maintenance), calcom-e2e (per-app projects)]

### N5.2 Use annotations for test status, not categorization
- `test.skip()` — temporarily disabled (with tracking)
- `test.fixme()` — known broken (with issue reference)
- `test.slow()` — needs longer timeout
- `test.fail()` — expected to fail (regression detection)
- **Basis:** [grafana-e2e, calcom-e2e, playwright-annotations-docs]

---

## Revision History

| Date | Change | Basis |
|---|---|---|
| 2026-03-18 | Initial draft from landscape rounds 1-12 | 10 Gold suites, ~97 total sources |
