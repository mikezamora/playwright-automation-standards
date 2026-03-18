# Round 44 — Findings: Terminology Validation and Glossary Preparation

## Executive Summary

All Playwright-specific terms have been validated against v1.50 documentation. The glossary will contain 40+ entries organized into six categories: Core API, Test Organization, Configuration, Interaction, Assertion, and Community/Industry terms. Seven contested terms have been resolved with preferred definitions and cited alternatives. The glossary is ready for initial population.

---

## Finding 1: Complete Term Inventory — 42 Glossary Entries Validated

### Category 1: Core API (12 terms)
| Term | Playwright Version Introduced | Stability |
|------|------------------------------|-----------|
| Browser | v1.0 | Stable, rarely used directly |
| BrowserContext | v1.0 | Stable, foundational |
| Page | v1.0 | Stable, primary interaction surface |
| Frame | v1.0 | Stable, iframe testing |
| Locator | v1.14 | Stable, recommended since v1.14 |
| Route | v1.0 | Stable, network interception |
| Request (APIRequestContext) | v1.16 | Stable, API testing |
| Response | v1.0 | Stable |
| StorageState | v1.8 | Stable, auth reuse |
| Trace | v1.12 | Stable, debugging |
| Download | v1.12 | Stable |
| Dialog | v1.0 | Stable |

### Category 2: Test Organization (10 terms)
| Term | Version Introduced | Stability |
|------|-------------------|-----------|
| test | v1.18 (@playwright/test) | Stable |
| test.describe | v1.18 | Stable |
| test.step | v1.18 | Stable |
| test.beforeAll | v1.18 | Stable |
| test.afterAll | v1.18 | Stable |
| test.beforeEach | v1.18 | Stable |
| test.afterEach | v1.18 | Stable |
| test.skip | v1.18 | Stable |
| test.fixme | v1.18 | Stable |
| test.slow | v1.18 | Stable |

### Category 3: Configuration (8 terms)
| Term | Scope | Stability |
|------|-------|-----------|
| Project | Config-level | Stable |
| Worker | Runtime | Stable |
| Shard | CLI | Stable |
| Fixture | test.extend | Stable |
| test.extend | API | Stable |
| test.use | API | Stable |
| fullyParallel | Config | Stable |
| testMatch | Config | Stable |

### Category 4: Interaction (5 terms)
| Term | Scope | Notes |
|------|-------|-------|
| getByRole | Locator method | Shared with Testing Library |
| getByText | Locator method | Shared with Testing Library |
| getByLabel | Locator method | Shared with Testing Library |
| getByTestId | Locator method | Shared with Testing Library |
| getByPlaceholder | Locator method | Shared with Testing Library |

### Category 5: Assertion (4 terms)
| Term | Scope | Notes |
|------|-------|-------|
| expect | Assertion entry point | Web-first when used with Locator |
| Web-first assertion | Concept | Auto-retrying assertion |
| Soft assertion | expect.soft() | Non-blocking failure |
| Custom matcher | expect.extend() | Domain-specific assertions |

### Category 6: Community/Industry (3 terms)
| Term | Scope | Notes |
|------|-------|-------|
| Page Object Model | Design pattern | Universal testing pattern |
| Data test attribute | HTML attribute | `data-testid` convention |
| Tag | Test metadata | `{ tag: ['@smoke'] }` since v1.42 |

---

## Finding 2: Seven Contested Terms — Resolved Definitions

### 1. Fixture
- **Preferred:** In Playwright, a fixture is a named object provided to tests via `test.extend()`. It has automatic setup and teardown lifecycle. Fixtures can be test-scoped (created per test) or worker-scoped (shared across tests in a worker).
- **Alternative (Cypress):** A static JSON data file loaded via `cy.fixture()`.
- **Alternative (Generic QA):** Any precondition, test data, or environment needed for a test.
- **Resolution:** Always say "Playwright fixture" when referring to the dependency injection mechanism. Say "test data" for static data files.

### 2. Worker
- **Preferred:** A Playwright worker is an operating system process that runs a subset of tests. Multiple workers enable parallel execution. Each worker has its own browser instance.
- **Alternative:** In other contexts, "worker" may mean a web worker, service worker, or generic thread.
- **Resolution:** In Playwright docs, "worker" always means a test runner process. Specify "Playwright worker" in cross-framework documentation.

### 3. Project
- **Preferred:** In `playwright.config.ts`, a project is a named test configuration object defining browser, viewport, auth state, test directory, and other options. Tests run once per matching project.
- **Alternative:** In general software, "project" means the codebase or repository.
- **Resolution:** Context usually disambiguates. In config discussions, "project" means Playwright project.

### 4. Smoke Test
- **Preferred (for this glossary):** A minimal, fast-running subset of tests that verify core functionality works after a deployment or code change. Typically 5-15 minutes.
- **Alternative (ISTQB):** "A test suite that covers the main functionality of a component or system to determine whether it works properly before planned testing begins."
- **Resolution:** Both definitions align. In Playwright context, smoke tests are tagged or placed in a dedicated project for selective CI execution.

### 5. Regression Test
- **Preferred:** Running the full test suite to verify that new changes haven't broken existing functionality.
- **Alternative:** A specific test written to reproduce and guard against a previously fixed bug.
- **Resolution:** Both are valid. In Playwright CI, "regression run" typically means the full suite. A "regression test" (singular) may target a specific past bug.

### 6. E2E Test
- **Preferred (Playwright community):** A test that exercises a complete user journey through a real (or near-real) application, from UI interaction through backend services.
- **Alternative (broader industry):** Any test spanning multiple system layers, including partial flows.
- **Resolution:** In Playwright context, E2E means full user journey. Tests that only call APIs without UI are "API tests," not E2E tests (even if they span services).

### 7. Integration Test
- **Preferred (Playwright community):** A test that combines multiple services or systems (e.g., UI + API + database) without mocking.
- **Alternative (unit testing community):** A test that combines multiple modules within a single service.
- **Resolution:** In Playwright context, integration tests typically mean API-to-API or API-to-database tests run via `request` fixture. Distinguish from E2E (which includes UI).

---

## Finding 3: Terminology Gaps Identified and Filled

| Gap | Resolution |
|-----|-----------|
| No standard term for "setup project" | Use "dependency project" (Playwright's term) or "setup project" (community term). Both are understood. |
| No standard term for "test data factory" | Use "fixture factory" when it returns Playwright fixtures, "data factory" when it returns raw data. |
| "Flaky test" has no formal Playwright API term | Playwright uses "retry" mechanism; "flaky" is a community term for tests that intermittently fail. |
| "Golden file" vs "snapshot" vs "baseline" | Playwright uses "snapshot" officially. "Baseline" is acceptable. "Golden file" is a Selenium-era term. |
| "Selector" vs "locator" | Playwright deprecated "selector" in favor of "locator" in v1.14. "Locator" is the current term. "Selector" refers to the CSS/XPath string, not the Playwright object. |

---

## Finding 4: Glossary Entry Structure Determined

Each entry in `glossary/playwright-glossary.md` will follow this structure:

```
### Term Name
**Definition:** One-sentence canonical definition.
**Context:** Where/how this term is used in Playwright.
**Example:** Code or config snippet demonstrating usage.
**Alternatives:** Other definitions in circulation (with source).
**Related terms:** Links to related glossary entries.
**Evidence:** Suite citations.
```

This structure supports:
- Quick reference (definition only)
- Learning (definition + context + example)
- Disambiguation (alternatives section)
- Validation (evidence trail)

---

## Finding 5: Priority Order for Glossary Population

Based on frequency of use and likelihood of confusion:

**Tier 1 — Populate First (highest confusion risk or most referenced):**
1. Fixture (contested term)
2. Locator (core concept, deprecates "selector")
3. Page (foundational)
4. BrowserContext (isolation model)
5. Project (overloaded term)
6. Worker (overloaded term)
7. StorageState (auth pattern)
8. Web-first assertion (quality differentiator)
9. Page Object Model (universal pattern)
10. Shard (CI concept)

**Tier 2 — Populate Second (important but less confusing):**
11-20: test.describe, test.extend, test.use, test.step, Route, Trace, expect, Tag, test.skip/fixme/slow, Data test attribute

**Tier 3 — Populate Third (standard terms with clear definitions):**
21-42: Remaining terms with straightforward definitions
