# Round 42 — Findings: POM, Fixture, and Helper Naming Conventions

## Executive Summary

Page Object Model naming universally uses PascalCase with a `Page` suffix for page-level objects. Fixture names use camelCase and describe what they provide rather than what they do. Helper functions follow a verb-noun pattern. These conventions are consistent enough across Gold suites to constitute standards.

---

## Finding 1: POM Class Naming Uses PascalCase + Page Suffix Universally

| Suite | POM Classes | Naming Pattern |
|-------|------------|----------------|
| Grafana | `DashboardPage`, `PanelEditPage`, `DataSourcePage`, `ExplorePage` | PascalCase + `Page` suffix |
| Grafana plugin-e2e | `DataSourceConfigPage`, `PanelEditPage`, `AnnotationPage` | PascalCase + `Page` suffix |
| Cal.com | `BookingPage`, `EventTypePage` | PascalCase + `Page` suffix |
| Clerk template | `SignInPage`, `SignUpPage` | PascalCase + `Page` suffix |
| Boilerplate | `LoginPage`, `DashboardPage` | PascalCase + `Page` suffix |

### Non-Page POM Variants
| Variant | Example | Used By |
|---------|---------|---------|
| `*Flow` suffix | `BookingFlow` | Cal.com (for multi-step processes) |
| `*Component` suffix | `DatePicker`, `TimezoneSelector` | Not observed in Gold suites; community pattern |
| `*Model` suffix | `UserModel` | Not observed; "page object model" uses `Page` not `Model` |

### POM Method Naming Conventions
| Method Category | Naming Pattern | Examples |
|----------------|----------------|----------|
| Navigation | `goto()`, `goTo()`, `navigate()` | `dashboardPage.goto('/d/abc')`, `loginPage.navigate()` |
| Actions | verb + target | `fillUsername()`, `clickSubmit()`, `selectTimezone()` |
| Assertions (on POM) | `verify*()` or `expect*()` | `verifyDashboardLoaded()`, `expectErrorMessage()` |
| Getters | property or `get*()` | `getTitle()`, `getErrorText()`, `panelTitle` (property) |
| Waiters | `waitFor*()` | `waitForLoad()`, `waitForNavigation()` |

### Key Observation
The Playwright official POM guide uses `goto()` (lowercase 't'), while community suites split between `goto()` and `goTo()`. Grafana uses `goto()` matching the official pattern. Cal.com uses `goTo()`. Neither is wrong, but consistency within a suite matters.

**Evidence:** POM analysis from rounds 13-20, Playwright official POM guide, all Gold suite class definitions.

---

## Finding 2: Fixture Naming Uses camelCase Describing the Provided Resource

### Built-in Fixtures (Playwright defaults)
| Fixture Name | Type | What It Provides |
|-------------|------|-----------------|
| `page` | Test-scoped | A new Page instance in a new BrowserContext |
| `context` | Test-scoped | A new BrowserContext |
| `browser` | Worker-scoped | A shared Browser instance |
| `request` | Test-scoped | An APIRequestContext for API calls |
| `browserName` | Worker-scoped | The current browser name string |

### Custom Fixture Naming Patterns (Gold suites)
| Naming Pattern | Examples | Used By |
|---------------|----------|---------|
| Resource noun (camelCase) | `datasourcePage`, `panelEditPage` | Grafana plugin-e2e |
| Role + resource | `adminPage`, `viewerPage`, `authenticatedPage` | Grafana, community patterns |
| Action factory | `createUsersFixture`, `createBookingsFixture` | Cal.com |
| API client | `apiClient`, `request` | Immich, Supabase |
| Config/state | `storageState`, `baseURL` | All suites (built-in options) |

### Fixture Naming Rules (observed consensus)
1. **camelCase always** — no exceptions in any Gold suite
2. **Noun-centric** — describes what the fixture provides, not what it does
3. **Singular** — `page` not `pages`, `user` not `users`
4. **No prefix** — not `myPage` or `testPage`; just `page` or `adminPage`

### Worker-Scoped vs Test-Scoped Naming
No naming convention distinguishes scope. Both worker-scoped (`browser`) and test-scoped (`page`) use the same camelCase noun pattern. The scope distinction lives in the fixture definition's `scope` property, not in the name.

**Evidence:** Fixture definitions from all 10 Gold suites, Playwright fixtures docs, rounds 17-18 analysis.

---

## Finding 3: Helper and Utility Function Naming Follows Verb-Noun Pattern

### Three Helper Organization Models

| Model | Structure | Used By |
|-------|-----------|---------|
| **Kit/package model** | Shared package with exported functions | AFFiNE (`@affine-test/kit`) |
| **Utils file model** | `utils.ts` or `helpers.ts` in test directory | Immich, freeCodeCamp |
| **Fixture-embedded model** | Helpers as fixture methods, not standalone functions | Grafana, Cal.com |

### Function Naming Patterns
| Pattern | Examples | Frequency |
|---------|----------|-----------|
| **verb + noun** | `clickNewPageButton()`, `createDashboard()`, `fillBookingForm()` | Most common |
| **verb + qualifier + noun** | `waitForEditorLoad()`, `getBlockSuiteEditorTitle()` | AFFiNE (longer, more specific) |
| **action + "And" + action** | `loginAndNavigate()`, `createAndVerify()` | Discouraged but occasionally seen |
| **"with" prefix** | `withSlate()`, `withHistory()` | Slate (wrapper/HOC pattern) |

### Naming Anti-Patterns (observed and corrected)
| Anti-Pattern | Problem | Better Alternative |
|-------------|---------|-------------------|
| `doStuff()` | Vague, untestable | `submitRegistrationForm()` |
| `test_helper()` | Snake case, non-TypeScript | `testHelper()` (but prefer specific name) |
| `handleX()` | Event handler naming, misleading | `processX()` or more specific verb |
| `myFunction()` | Non-descriptive placeholder | Never seen in Gold suites |

**Evidence:** Helper function analysis from rounds 13-20, AFFiNE kit package, Immich utils files.

---

## Finding 4: Data Test Attribute Naming Conventions

| Convention | Attribute | Used By |
|-----------|-----------|---------|
| Standard | `data-testid` | Cal.com, Immich, Grafana, community standard |
| Custom prefix | `data-playwright-test-label` | freeCodeCamp |
| Component-scoped | `data-testid="component-name-element"` | Cal.com (kebab-case) |
| Action-scoped | `data-testid="action-target"` | Grafana (e.g., `data-testid="dashboard-row-title-Header"`) |

### Test ID Naming Pattern
- **kebab-case** is universal for `data-testid` values
- Structure: `[scope]-[element]-[qualifier]`
- Examples: `booking-form-submit`, `dashboard-row-title-Header`, `nav-link-settings`

### Playwright `testIdAttribute` Configuration
- Default: `data-testid`
- Can be overridden in config: `use: { testIdAttribute: 'data-playwright-test-label' }`
- freeCodeCamp is the only Gold suite to override this

**Evidence:** Locator analysis from rounds 13-16, freeCodeCamp config, Playwright config docs.

---

## Finding 5: Configuration Constant and Variable Naming

| Category | Convention | Examples |
|----------|-----------|----------|
| **Environment variables** | SCREAMING_SNAKE_CASE | `CI`, `GRAFANA_URL`, `BASE_URL`, `PLAYWRIGHT_WORKERS` |
| **Config properties** | camelCase (Playwright API) | `testDir`, `fullyParallel`, `retries`, `baseURL` |
| **Timeout constants** | SCREAMING_SNAKE or inline | `DEFAULT_TIMEOUT = 30_000` or inline `timeout: 30000` |
| **Project names** | Descriptive strings | `'chromium'`, `'Mobile Chrome'`, `'auth setup'` |
| **File paths** | String literals | `'./playwright/.auth/admin.json'` |

### Project Name Conventions
| Naming Strategy | Examples | Used By |
|----------------|----------|---------|
| Browser name | `'chromium'`, `'firefox'`, `'webkit'` | Slate, freeCodeCamp |
| Role name | `'admin'`, `'viewer'`, `'editor'` | Grafana plugin-e2e |
| App name | `'@calcom/web'`, `'app-store'` | Cal.com |
| Lifecycle | `'auth setup'`, `'authenticate'` | Grafana, Cal.com (setup projects) |
| Feature name | `'dashboards'`, `'alerting'` | Grafana |

**Evidence:** Config file analysis across all 10 Gold suites, rounds 13-20 structure findings.
