# Round 41 — Suites & Sources Analyzed: Playwright-Specific Terminology Extraction

## Scope

Extract all Playwright-specific terminology and test naming patterns from previously analyzed Gold suites, Playwright official documentation, and community sources. Build the raw term inventory for glossary construction.

## Sources Cross-Referenced

| # | Source | Used For |
|---|--------|----------|
| 1 | Playwright Official — Test API Docs | Canonical definitions: test, test.describe, test.step, test.extend, test.use, test.beforeAll, test.afterAll |
| 2 | Playwright Official — Locators Guide | Locator semantics: getByRole, getByText, getByLabel, getByTestId, locator |
| 3 | Playwright Official — Fixtures Guide | Fixture definitions: built-in vs custom, worker-scoped vs test-scoped |
| 4 | Playwright Official — Configuration Guide | Project, worker, shard, browser context, fullyParallel |
| 5 | Playwright Official — Browser Contexts | BrowserContext, Page, Frame, route, storageState |
| 6 | Playwright Official — Tracing Guide | Trace, trace viewer, HAR recording |
| 7 | Playwright Official — Assertions | expect, web-first assertions, soft assertions |
| 8 | grafana-e2e (31 projects) | Tag usage (@dashboards), describe nesting, fixture naming (datasourcePage, panelEditPage) |
| 9 | calcom-e2e (7 projects) | Test naming (should patterns), fixture factories (createUsersFixture), POM naming (BookingPage) |
| 10 | affine-e2e (9 packages) | Kit-based helpers, function naming (clickNewPageButton, waitForEditorLoad) |
| 11 | immich-e2e (3 projects) | API test naming, maintenance project pattern |
| 12 | freecodecamp-e2e (6 projects) | data-playwright-test-label, --grep-invert filtering |
| 13 | grafana-plugin-e2e (5 projects) | Published fixture package, custom matcher naming (toHaveAlert, toHaveNoA11yViolations) |
| 14 | excalidraw-e2e | Visual regression naming, a11y test patterns |
| 15 | supabase-e2e | REST API test naming, session terminology |
| 16 | slate-e2e | Editor-specific test patterns, cross-browser project naming |
| 17 | nextjs-e2e | Framework integration test naming |
| 18 | eslint-plugin-playwright | Rule naming conventions mapping to best practices |
| 19 | Rounds 1-40 findings | All previously cataloged naming observations |

## Extraction Method

1. Enumerated all Playwright API terms from official docs (v1.50+)
2. Searched each Gold suite for term usage frequency and variations
3. Cataloged test description patterns (`test('...')` first argument) across suites
4. Mapped file naming conventions across all 10 Gold suites
5. Documented describe block naming strategies
6. Extracted tag/annotation vocabulary from config files and test files
