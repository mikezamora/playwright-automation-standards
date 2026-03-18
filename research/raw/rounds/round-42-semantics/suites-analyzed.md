# Round 42 — Suites & Sources Analyzed: POM, Fixture, and Helper Naming Conventions

## Scope

Extract naming conventions for Page Object Models, fixtures, helper functions, and utility modules across all Gold suites. Complete the terminology extraction begun in Round 41.

## Sources Cross-Referenced

| # | Source | Used For |
|---|--------|----------|
| 1 | grafana-e2e | Model-based POM: DashboardPage, PanelEditPage, DataSourcePage (class instances as fixtures) |
| 2 | grafana-plugin-e2e | Published fixture package: datasourcePage, panelEditPage, annotationEditPage |
| 3 | calcom-e2e | Factory fixtures: createUsersFixture, createBookingsFixture; POM: BookingPage, EventTypePage |
| 4 | affine-e2e | Kit-based helpers: clickNewPageButton, waitForEditorLoad, getBlockSuiteEditorTitle |
| 5 | immich-e2e | Utility functions: utils.ts pattern, API helper naming |
| 6 | freecodecamp-e2e | Simple POM: no formal POM; direct page interactions with data-playwright-test-label |
| 7 | excalidraw-e2e | Canvas interaction helpers: createRect, clickTool, drag |
| 8 | supabase-e2e | API client fixtures, REST helper naming |
| 9 | slate-e2e | Editor POM: withSlate, createEditor helpers |
| 10 | nextjs-e2e | Framework test patterns: next.config.js integration |
| 11 | clerk-e2e-template (archived) | Historical POM pattern: SignInPage, SignUpPage |
| 12 | boilerplate-playwright-ts | Template POM: LoginPage, DashboardPage with goTo/navigate pattern |
| 13 | Playwright Official — POM Guide | Canonical POM example: PlaywrightDevPage class |
| 14 | Playwright Official — Fixtures Guide | Fixture naming: camelCase, descriptive of provided resource |
| 15 | Rounds 13-20 structure findings | All previously documented POM/fixture patterns |

## Extraction Method

1. Cataloged all POM class names and their method naming conventions
2. Extracted fixture parameter names from test.extend definitions
3. Mapped helper function naming patterns (verb-noun, action-target)
4. Documented utility module organization across suites
