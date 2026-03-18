# Round 20 — Suites Analyzed

**Phase:** Structure
**Focus:** Deep dive on Page Object Model patterns — class structure, inheritance, composition
**Date:** 2026-03-18

## Suites Analyzed

### 1. grafana/plugin-tools (POM deep dive)
- **POM focus:** Full model hierarchy — page models as fixture-injected classes, domain-specific models per Grafana concept
- **Key files examined:** `packages/plugin-e2e/src/fixtures/` (page fixtures), model structure (dashboardPage, panelEditPage, explorePage, alertRuleEditPage, variableEditPage, annotationEditPage)
- **Key patterns:** Each page model registered as a fixture, locator definitions via version-aware selectors, API client model for non-UI operations
- **Analysis:** [research/raw/suite-analyses/grafana-plugin-tools.md](../../suite-analyses/grafana-plugin-tools.md)

### 2. calcom/cal.com (POM deep dive)
- **POM focus:** Factory-fixture hybrid — no traditional page object classes, scenario-based composition
- **Key files examined:** `apps/web/playwright/fixtures/users.ts`, factory methods
- **Key patterns:** Fixture factories replace POM classes, `self()` method for DB state refresh, fluent builder chain
- **Analysis:** [research/raw/suite-analyses/calcom.md](../../suite-analyses/calcom.md)

### 3. Playwright official docs (POM reference)
- **POM focus:** Canonical POM patterns — constructor, locator definitions, action methods
- **Key patterns:** `constructor(page: Page)`, `readonly` locator properties, navigation methods, interaction methods with embedded assertions
- **Source:** https://playwright.dev/docs/pom

### 4. Community POM patterns (inheritance analysis)
- **POM focus:** BasePage abstract class pattern, inheritance hierarchies, component POM
- **Key patterns:** `abstract class BasePage` with shared header/footer/dialog locators, concrete pages via `extends BasePage`, `abstract get url(): string` for navigation
- **Sources:** GitHub repos (playwright-boilerplate, playwright-ts, playwright-page-object), community articles

## Method
- Compared POM implementations across production suites and framework templates
- Cataloged constructor patterns, locator definition strategies, and method organization
- Analyzed inheritance vs composition approaches in POM design
- Evaluated the fixture vs utility function boundary
