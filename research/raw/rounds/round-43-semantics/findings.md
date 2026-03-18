# Round 43 — Findings: Terminology Consistency Validation

## Executive Summary

Playwright's core API terminology is highly consistent across projects — terms like `locator`, `page`, `expect` are used identically everywhere. Divergence occurs at three levels: (1) organization-specific vocabulary layered on top of Playwright terms (e.g., Grafana's "CUJS"), (2) holdover terminology from Cypress/Selenium migrations, and (3) inconsistent community usage of "fixture" (which has different meanings in Playwright vs. pytest vs. xUnit).

---

## Finding 1: Playwright Core Terms Are Used Consistently Across All Gold Suites

| Term | Official Definition | Consistent Usage? | Notes |
|------|-------------------|-------------------|-------|
| `page` | A single browser tab | Yes (10/10) | Universal, no variation |
| `locator` | An element finder with auto-wait | Yes (10/10) | Some suites still use `page.$()` for legacy reasons |
| `expect` | Assertion function | Yes (10/10) | Always `await expect()` for web-first |
| `test.describe` | Test grouping | Yes (10/10) | Naming strategies vary, but API usage is identical |
| `test.beforeAll` | Worker-scoped setup | Yes (8/10) | 2 suites avoid it entirely, preferring fixtures |
| `BrowserContext` | Isolated session | Yes (10/10) | Rarely named explicitly; usually implicit |
| `storageState` | Serialized auth state | Yes (6/6 that use it) | Consistent where adopted |
| `project` | Named test config | Yes (10/10) | Universal in config; meaning is clear |

### Terms With Minor Inconsistencies

| Term | Inconsistency | Details |
|------|--------------|---------|
| `fixture` | Playwright vs. generic | Playwright: injected test dependency. Community sometimes means "test data" or "setup function" |
| `worker` | Process vs. thread confusion | Playwright workers are processes, but some docs say "thread" |
| `route` | Network interception vs. URL path | Playwright uses `route` for network mocking; some confuse with URL routing |
| `trace` | Artifact vs. action | "Trace" means the recorded file; sometimes confused with "tracing" (the act of recording) |

**Evidence:** Term usage analysis across all 10 Gold suites and Playwright official docs.

---

## Finding 2: Cross-Framework Terminology Mapping Reveals Carryover Confusion

### Playwright vs. Cypress Equivalents

| Concept | Playwright Term | Cypress Term | Migration Confusion |
|---------|----------------|-------------|-------------------|
| Navigate to URL | `page.goto()` | `cy.visit()` | Low — different enough to not confuse |
| Find element | `page.locator()`, `page.getByRole()` | `cy.get()`, `cy.contains()` | Medium — Cypress `cy.get()` is CSS-only; Playwright has semantic locators |
| Click element | `locator.click()` | `cy.click()` | Low — similar API |
| Type text | `locator.fill()` | `cy.type()` | Medium — `fill()` clears first, `type()` appends; behavioral difference |
| Assert visible | `expect(locator).toBeVisible()` | `cy.should('be.visible')` | Medium — Playwright uses `expect()`, Cypress chains `.should()` |
| Wait for element | Auto-wait (implicit) | `cy.get()` auto-retries | Low — both auto-wait, but mechanisms differ |
| Intercept network | `page.route()` | `cy.intercept()` | Medium — different API, same concept |
| Test isolation | BrowserContext per test | Spec-level isolation | High — Playwright's context model is more granular |
| Parallel execution | Workers + sharding | Limited (Cypress Cloud) | High — fundamentally different models |
| Fixtures | `test.extend()` injected deps | `cy.fixture()` loads JSON files | **High** — completely different meaning |

### The "Fixture" Confusion (Most Significant)
This is the single most contested term:
- **Playwright:** A fixture is a named dependency injected into tests via `test.extend()`. Fixtures have setup/teardown lifecycle. Example: `authenticatedPage` fixture provides a logged-in Page.
- **Cypress:** `cy.fixture()` loads a JSON data file from the `fixtures/` directory. It is static test data, not a dependency injection mechanism.
- **pytest:** A fixture is a function that provides test dependencies, similar to Playwright but with different scoping.
- **xUnit/JUnit:** A fixture is the setup/teardown pair (setUp/tearDown methods).
- **Generic QA:** "Test fixture" often means "test data" or "test environment" broadly.

Teams migrating from Cypress to Playwright frequently misunderstand what "fixture" means in the Playwright context.

**Evidence:** Cypress docs, Playwright docs, community migration guides, observed confusion in GitHub discussions.

---

## Finding 3: Organization-Specific Vocabulary Layers on Top of Playwright Terms

Each Gold suite introduces domain-specific terms that are not part of Playwright's vocabulary:

| Suite | Custom Term | Meaning | Playwright Equivalent |
|-------|------------|---------|----------------------|
| Grafana | CUJS (Critical User Journey Suite) | High-priority test collection | Project with critical path tests |
| Grafana | "provisioning" | Creating test data via API | Test data setup (fixture or beforeAll) |
| Grafana | "data source" | A Grafana backend connection | Domain object under test |
| Cal.com | "booking flow" | Multi-step reservation process | User journey / test scenario |
| Cal.com | "event type" | A schedulable meeting configuration | Domain object under test |
| AFFiNE | "kit" | Shared test utility package | Helper/utility module |
| AFFiNE | "block suite" | AFFiNE's editor engine | Component under test |
| Immich | "maintenance project" | Tests that clean up test data | Teardown project |
| freeCodeCamp | "challenge" | A learning exercise | Page/feature under test |
| freeCodeCamp | "certification" | A learning milestone | User flow under test |

### Observation
These terms are unavoidable — every product has domain vocabulary. The important pattern is that Gold suites keep Playwright terms for Playwright concepts and domain terms for product concepts, never conflating the two.

**Evidence:** All 10 Gold suite codebases and documentation.

---

## Finding 4: Framework Ecosystem Has Minimal Impact on Playwright Terminology

| Framework | Terminology Influence | Evidence |
|-----------|---------------------|----------|
| React | None significant | Next.js tests use standard Playwright terms |
| Angular | `.e2e-spec.ts` convention carries over | Seen in Silver/Bronze suites, not Gold |
| Vue | None significant | No Gold suites are Vue-based |
| NestJS | `.e2e-spec.ts` convention | Community repos only |
| Svelte | None significant | Limited sample |

### The Angular `.e2e-spec.ts` Remnant
Angular's Protractor (deprecated) used `.e2e-spec.ts` by convention. Some Angular teams migrating to Playwright carry this convention. Since Playwright's default `testMatch` does not match `.e2e-spec.ts`, this requires explicit configuration. No Gold suite uses this pattern.

**Evidence:** Angular CLI defaults, Playwright testMatch documentation, suite file extension analysis.

---

## Finding 5: Community Terms That Are Standard vs. Contested

### Standard (Universally Agreed)
| Term | Definition | Confidence |
|------|-----------|------------|
| Page Object Model (POM) | A class encapsulating page interactions | Universal |
| Locator | A Playwright element finder with auto-wait | Universal |
| Web-first assertion | An assertion that auto-retries against the DOM | Universal |
| Trace | A recorded test execution timeline | Universal |
| Sharding | Distributing tests across CI machines | Universal |
| storageState | Serialized browser cookies + localStorage | Universal |

### Contested (Different Definitions in Circulation)
| Term | Definition A | Definition B | Resolution |
|------|-------------|-------------|------------|
| **Fixture** | Playwright: injected test dependency | Generic: test data or setup | Use "Playwright fixture" when precision needed |
| **Worker** | Playwright: a parallel OS process | Generic: a thread or unit of work | Specify "Playwright worker" in docs |
| **Project** | Playwright: a named config in playwright.config.ts | Generic: the repository/codebase | Context usually disambiguates |
| **Smoke test** | Quick sanity check after deployment | Minimal subset of critical tests | Both definitions are correct; scope varies |
| **Regression test** | Test run verifying no behavior broke | Test specifically targeting a past bug | Both are valid; context determines meaning |
| **E2E test** | Full user journey through real app | Any test spanning multiple layers | Playwright community means "full journey" |
| **Integration test** | Test spanning services/APIs | Test combining components without mocking | Playwright suites rarely make this distinction |

**Evidence:** Community blog posts, Stack Overflow discussions, Playwright GitHub discussions, framework documentation cross-comparison.
