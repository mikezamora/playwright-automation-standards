# Round 43 — Suites & Sources Analyzed: Terminology Consistency Validation

## Scope

Validate whether Playwright terminology is used consistently across projects. Identify where different projects define the same concepts differently, and where Playwright official terminology diverges from community usage.

## Sources Cross-Referenced

| # | Source | Used For |
|---|--------|----------|
| 1 | Playwright Official Docs (v1.50) | Canonical term definitions, API terminology |
| 2 | Playwright GitHub Issues & Discussions | Community usage of terms, feature request language |
| 3 | grafana-e2e | Internal terminology: "CUJS", "data source provisioning", "e2e-playwright" |
| 4 | calcom-e2e | Internal terminology: "booking flow", "event type", factory fixtures |
| 5 | affine-e2e | Internal terminology: "kit", "block suite", deployment-target packages |
| 6 | immich-e2e | Internal terminology: "maintenance project", "asset uploading" |
| 7 | freecodecamp-e2e | Internal terminology: "challenge", "certification", custom test-label |
| 8 | Cypress Documentation | Cross-framework comparison: cy.visit vs goto, cy.get vs locator |
| 9 | Selenium WebDriver Docs | Cross-framework comparison: WebDriver, findElement, WebElement |
| 10 | Testing Library Docs | Cross-framework comparison: getByRole, getByText (shared vocabulary) |
| 11 | WebdriverIO Documentation | Cross-framework comparison: $, $$, browser.url |
| 12 | eslint-plugin-playwright | Rule names as terminology signals (prefer-web-first-assertions, no-wait-for-timeout) |
| 13 | Community blog posts (rounds 1-12) | Community terminology usage patterns |
| 14 | Stack Overflow [playwright] tag | Community question terminology patterns |

## Validation Method

1. Compared official Playwright docs definitions with actual usage in Gold suites
2. Identified terms used differently across suites
3. Mapped Playwright terms to Cypress/Selenium equivalents
4. Cataloged contested or ambiguous terminology
5. Checked whether framework ecosystem (React, Angular, Vue) influences terminology
