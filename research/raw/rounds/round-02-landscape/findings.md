# Round 02 — Landscape: Findings

**Focus:** TypeScript-specific conventions and patterns in Playwright suites
**Date:** 2026-03-18

---

## Key Findings

### 1. `test.extend<T>()` is the cornerstone TypeScript pattern for Playwright

The typed fixture system (`test.extend<T>()`) is the most important TypeScript-specific pattern in the Playwright ecosystem. It enables type-safe dependency injection of custom fixtures into tests while maintaining full IntelliSense support. Every high-quality TypeScript Playwright suite uses this pattern.

**Evidence:** Playwright's own test suite defines hundreds of typed fixtures. Grafana's @grafana/plugin-e2e builds its entire API on typed fixtures (datasource pages, panel configurations, dashboard models). The pattern is documented as the primary extension mechanism in Playwright's official docs.

### 2. Domain-specific Playwright extensions are an emerging best practice

The most sophisticated suites don't just use Playwright's built-in APIs -- they extend Playwright with domain-specific abstractions. This includes custom expect matchers, custom fixture types, and custom page models that encode business logic.

**Evidence:** @grafana/plugin-e2e provides custom matchers like `toHaveNoDataError()` and custom fixtures for datasource/panel testing. Clerk's template provides auth-specific page objects. Checkly extends Playwright for production monitoring. POMWright automates POM generation with typed locators.

### 3. Strict TypeScript mode is correlated with suite quality

Suites that enable TypeScript strict mode (`"strict": true` in tsconfig.json) tend to have better-maintained test code, fewer type-related bugs, and more robust fixture definitions. The strict mode flags (`noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`) catch common Playwright mistakes at compile time.

**Evidence:** Playwright's own codebase uses strict TypeScript. Grafana plugin-e2e uses strict mode. The highest-rated community frameworks (vasu31dev/playwright-ts, nenad992/boilerplate-playwright-ts) explicitly advertise strict TypeScript as a feature. Playwright's documentation recommends running the TypeScript compiler alongside Playwright to catch type errors.

### 4. ESLint rules for Playwright enforce consistency at scale

The eslint-plugin-playwright package (371+ stars, actively maintained) provides rules that enforce Playwright best practices through static analysis. Key rules include:
- `no-wait-for-timeout` — prevents use of arbitrary timeouts
- `no-force-option` — prevents bypassing auto-wait with `{ force: true }`
- `prefer-web-first-assertions` — encourages `expect(locator).toBeVisible()` over manual checks
- `no-conditional-expect` — prevents unreliable conditional assertions

**Evidence:** The plugin has 371+ stars and is maintained under the playwright-community GitHub organization. Multiple production suites reference it in their ESLint configurations. BrowserStack and other testing platforms recommend it in their best practices guides.

### 5. The Page Object Model pattern persists but is evolving

POM remains the dominant structural pattern for organizing Playwright tests, but it is evolving from traditional class-based approaches to more functional/fixture-based patterns in TypeScript codebases. The trend is toward lighter page objects that leverage Playwright's built-in locator chaining rather than wrapping every interaction in a method.

**Evidence:** Clerk uses traditional class-based POM with TypeScript. POMWright automates POM class generation. Grafana plugin-e2e uses a hybrid model/fixture approach. Newer frameworks like vasu31dev/playwright-ts use utility functions alongside POM. The Playwright official best practices documentation does not mandate POM but encourages fixture-based composition.

### 6. Factory functions for test data replace hardcoded fixtures

TypeScript suites increasingly use factory functions (often powered by Faker.js) to generate typed test data instead of static JSON fixtures. This approach provides type safety, randomized data for isolation, and reusable data creation patterns.

**Evidence:** Clerk's template uses `createSignupAttributes()` with Faker.js and typed return values. Enterprise boilerplates implement typed factory patterns. Cal.com's test setup uses programmatic data creation through API calls rather than static fixtures.

### 7. Playwright's own test suite is the ultimate TypeScript reference

Microsoft's playwright repository contains the canonical implementation of every pattern. Reading the tests in `microsoft/playwright/tests/` reveals patterns that are not documented elsewhere, including advanced fixture composition, conditional test execution, browser-specific test targeting, and trace capture strategies.

**Evidence:** The playwright repo has 84.5k stars and is updated daily by the core team. It uses strict TypeScript throughout. Community frameworks consistently cite it as their reference implementation. The test infrastructure includes custom test runners, fixture helpers, and assertion utilities that serve as the de facto standard.

### 8. Monitoring-as-code bridges testing and production observability

Checkly's approach of running standard Playwright tests as synthetic monitors represents a significant TypeScript convention: writing tests once and running them in both CI and production monitoring contexts. The TypeScript configuration (`checkly.config.ts`) mirrors `playwright.config.ts` patterns.

**Evidence:** Checkly's playwright-check-suite-examples repo shows standard Playwright tests reused as synthetic monitors. Cal.com has a `checkly.config.ts` alongside its `playwright.config.ts`. This pattern is gaining adoption as teams seek to unify testing and monitoring codebases.

---

## TypeScript Convention Summary

| Convention | Adoption Level | Quality Impact |
|---|---|---|
| `playwright.config.ts` (not .js) | Universal in quality suites | High — enables typed configuration |
| `test.extend<T>()` typed fixtures | High in mature suites | Very High — core extension mechanism |
| Strict TypeScript (`"strict": true`) | Medium-High | High — catches type errors early |
| ESLint with playwright plugin | Medium | Medium — enforces consistency |
| Factory functions with Faker.js | Medium | Medium — improves test isolation |
| Domain-specific expect matchers | Low (only in frameworks) | Very High when used — improves readability |
| POM with TypeScript classes | High | Medium — depends on implementation |
| Monitoring-as-code (dual-use tests) | Emerging | High — maximizes test investment |

---

## Questions for Next Rounds

1. How do Next.js, React, and other framework-specific setups affect TypeScript Playwright conventions?
2. Do monorepo-specific TypeScript paths (tsconfig paths, project references) create challenges for Playwright?
3. Which suites demonstrate the best test isolation patterns in TypeScript?
4. How is `mergeTests()` used in practice to compose fixtures from multiple sources?
