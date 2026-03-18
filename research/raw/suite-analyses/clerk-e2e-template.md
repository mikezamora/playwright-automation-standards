# Suite Analysis: clerk/playwright-e2e-template

**Repository:** https://github.com/clerk/playwright-e2e-template
**Suite Location:** Root directory (archived template)
**Tier:** Silver (Template/Reference)
**Round:** 15-16 (Contrasting Deep Dive)

---

## 1. Architecture Analysis

### Directory Structure
```
/
  config/                      # Configuration files
  external/                    # External system interactions (DB)
  fixtures/                    # Predefined fixture sets + factory functions
  pages/                       # Page object implementations
  tests/                       # Test specifications
  playwright.config.ts         # (inferred, Jest-based not @playwright/test)
  package.json
```

### Testing Stack
- **Jest + jest-playwright** (not `@playwright/test`) — older integration approach
- Playwright for browser automation
- TypeScript for type safety
- **Archived (read-only)** — reference template, not active development

### POM Pattern — Class-Based
- `pages/` directory contains page object classes
- Follows traditional PageObject pattern: "encapsulate each page's internal structure and responsibilities inside its own highly cohesive class file"
- Page objects treated as lightweight "view" concepts at known browser locations
- Distinction between page objects and application pages

### Fixtures
- `fixtures/` contains predefined fixture sets
- Factory functions: `createSignupAttributes()` — generates test data
- Likely uses Faker.js for randomized data generation

### External Systems
- `external/` directory for database connections and external dependencies
- Separates infrastructure concerns from test logic

## 2. Validation Analysis

### Element Selection Guidelines
- Prefer user-facing attributes (roles, input types) over brittle selectors
- Use `data-test-id` responsibly
- "No single approach fits all scenarios" — pragmatic philosophy

### Testing Approach
- Jest assertions (not Playwright's `expect`)
- jest-playwright bridge for browser automation
- `PWDEBUG=1` for inspector-based debugging

## 3. CI/CD Analysis

### Infrastructure
- Jest test runner (not Playwright CLI)
- Standard npm scripts
- Archived — no active CI pipeline maintained

## 4. Semantic Analysis

### Directory Naming
- `config/`, `external/`, `fixtures/`, `pages/`, `tests/` — clean separation of concerns
- Self-documenting directory names

### Documentation
- README explains PageObject pattern rationale
- Element selection guidelines documented
- Debugging instructions provided

## 5. Key Patterns — Contrasts with Gold Standards

1. **Jest + jest-playwright (not @playwright/test)** — represents the pre-`@playwright/test` era when Jest was the test runner and jest-playwright was the bridge
2. **Archived/template** — designed as a starting point, not a living suite; contrasts with active suites like Cal.com and Grafana
3. **Class-based POM only** — pure PageObject classes without `test.extend()` fixtures, representing the traditional approach
4. **Separate `external/` directory** — explicit separation of database/external system interactions, a pattern not seen in Gold suites
5. **Factory functions in `fixtures/`** — `createSignupAttributes()` pattern influenced later Cal.com fixtures
6. **Pragmatic selector philosophy** — "no single approach fits all" documentation rare among template repos

### Key Contrast: Historical Snapshot
This template captures the state of Playwright testing before `@playwright/test` became the standard runner. Its Jest-based approach, class-only POM, and explicit `external/` directory show how the ecosystem has evolved. Modern suites (Cal.com, Grafana) have adopted `test.extend()` fixtures and integrated data management, making this separation less necessary.

### Evolution Evidence
- **Then (Clerk template):** Jest runner, class POM, separate fixtures/external dirs
- **Now (Gold suites):** `@playwright/test` runner, fixture-based POM via `test.extend()`, integrated data factories
