# Round 06 — Landscape: Suites Analyzed

**Focus:** Specialized Playwright usage — visual regression, API testing, accessibility, component testing, mobile viewport
**Date:** 2026-03-18
**Search queries used:**
- "Playwright visual regression testing screenshot comparison 2025"
- "Playwright API testing request context examples 2025"
- "@axe-core/playwright accessibility testing examples projects 2025"
- "Playwright component testing experimental-ct React Vue 2025"
- "Playwright mobile viewport testing responsive design patterns"
- "Playwright Chromatic visual testing integration storybook 2025"
- "Playwright axe-core accessibility testing open source project github"

---

## Resources and Projects Analyzed

### Visual Regression Testing

#### 1. Playwright Official — Visual Comparisons Documentation

| Field | Value |
|---|---|
| **URL** | https://playwright.dev/docs/test-snapshots |
| **Type** | Official documentation |
| **Notable** | Built-in `toHaveScreenshot()` and `toMatchSnapshot()` APIs. Uses Pixelmatch for pixel-level comparison. Supports `maxDiffPixels`, `stylePath` for hiding volatile elements, and `--update-snapshots` for baseline refresh. Snapshot naming: `{testName}-{number}-{browser}-{platform}.png`. |

#### 2. CSS-Tricks — Automated Visual Regression Testing With Playwright

| Field | Value |
|---|---|
| **URL** | https://css-tricks.com/automated-visual-regression-testing-with-playwright/ |
| **Type** | Technical blog |
| **Publisher** | CSS-Tricks |
| **Notable** | Practical walkthrough of toHaveScreenshot() with configuration options. Emphasizes running visual tests in consistent environments (CI only) to avoid false positives from device-specific rendering differences. |

#### 3. Chromatic — Visual Testing for Playwright

| Field | Value |
|---|---|
| **URL** | https://www.chromatic.com/playwright |
| **Type** | Commercial tool + documentation |
| **Publisher** | Chromatic (Storybook creators) |
| **Notable** | Cloud-based visual testing that extends Playwright with a single import change. Captures full-page archives (DOM, styling, assets) for interactive debugging. Integrates Storybook component testing with Playwright E2E visual testing. Supports Playwright v1.38.0+. |

#### 4. sudharsan-selvaraj/playshot

| Field | Value |
|---|---|
| **URL** | https://github.com/sudharsan-selvaraj/playshot |
| **Type** | Open-source library |
| **Stars** | ~50 |
| **Notable** | Cloud-powered screenshot management for Playwright visual tests. Stores screenshots on remote servers (S3, SFTP) instead of locally, solving the baseline management problem for distributed teams. |

#### 5. Duncan Mackenzie — Visual Regression Testing using Playwright and GitHub Actions

| Field | Value |
|---|---|
| **URL** | https://www.duncanmackenzie.net/blog/visual-regression-testing/ |
| **Type** | Technical blog |
| **Notable** | Practical guide to running visual regression tests in GitHub Actions CI. Demonstrates the pattern of generating baselines in CI (not locally) to ensure consistent rendering environments. |

### API Testing

#### 6. Playwright Official — API Testing Documentation

| Field | Value |
|---|---|
| **URL** | https://playwright.dev/docs/api-testing |
| **Type** | Official documentation |
| **Notable** | `APIRequestContext` for standalone HTTP testing. Shares cookie storage with browser context for combined UI+API tests. Supports all HTTP methods (GET, POST, PUT, PATCH, DELETE). Can be used without launching browsers for pure API tests. `playwright.request.newContext()` creates reusable, authenticated API clients. |

#### 7. Medium — Building a Comprehensive Playwright Suite for UI and API Testing

| Field | Value |
|---|---|
| **URL** | https://medium.com/@bluudit/building-a-comprehensive-playwright-automation-suite-for-ui-and-api-testing-in-a-unified-project-f23d64ba7457 |
| **Type** | Technical blog |
| **Publisher** | Medium (Vijay Kumar Maurya) |
| **Notable** | Demonstrates unified project structure with `tests/api/` and `tests/ui/` subdirectories sharing configuration and utilities. Shows how APIRequestContext shares authentication state between UI and API test layers. |

#### 8. CircleCI — API Testing with Playwright

| Field | Value |
|---|---|
| **URL** | https://circleci.com/blog/api-testing-with-playwright/ |
| **Type** | Technical blog |
| **Publisher** | CircleCI |
| **Notable** | Walks through using Playwright for pure API testing without browser contexts. Demonstrates `beforeAll`/`afterAll` patterns for creating and disposing of request contexts. Shows assertion patterns for JSON response bodies. |

### Accessibility Testing

#### 9. Playwright Official — Accessibility Testing Documentation

| Field | Value |
|---|---|
| **URL** | https://playwright.dev/docs/accessibility-testing |
| **Type** | Official documentation |
| **Notable** | Recommends @axe-core/playwright for automated a11y testing. AxeBuilder API with `.withTags()` for WCAG targeting, `.include()`/`.exclude()` for scoping, `.disableRules()` for known issues. Explicitly notes: "many accessibility problems can only be discovered through manual testing." |

#### 10. Subito — How We Automate Accessibility Testing with Playwright and Axe

| Field | Value |
|---|---|
| **URL** | https://dev.to/subito/how-we-automate-accessibility-testing-with-playwright-and-axe-3ok5 |
| **Type** | Company blog |
| **Publisher** | Subito (DEV Community) |
| **Notable** | Production a11y testing pattern: helper functions `getAxeInstance` and `generateAxeReport`, WCAG 2.1 Level A/AA targeting, third-party element exclusion. CI creates/updates GitHub Issues instead of failing builds -- progressive remediation approach for a11y debt. |

#### 11. DEV Community — Accessibility Audits with Playwright, Axe, and GitHub Actions

| Field | Value |
|---|---|
| **URL** | https://dev.to/jacobandrewsky/accessibility-audits-with-playwright-axe-and-github-actions-2504 |
| **Type** | Technical blog |
| **Publisher** | DEV Community (Jakub Andrzejewski) |
| **Notable** | Complete CI pipeline for a11y auditing: Playwright + @axe-core/playwright in GitHub Actions. Generates JSON reports, triggers notifications on new violations. Demonstrates the "audit-and-report" pattern versus the "fail-on-violation" pattern. |

#### 12. akhileshskl/Playwright_AccessibilityTests

| Field | Value |
|---|---|
| **URL** | https://github.com/akhileshskl/Playwright_AccessibilityTests |
| **Type** | Open-source framework |
| **Notable** | Accessibility testing automation kit using Playwright + @axe-core/playwright + axe-html-reporter. Generates 3 output types per test: HTML reports, JSON data, screenshots of violations with impact categorization. Supports WCAG 2.0/2.1 compliance. |

#### 13. Widen/expect-axe-playwright

| Field | Value |
|---|---|
| **URL** | https://github.com/Widen/expect-axe-playwright |
| **Type** | Open-source library |
| **Notable** | Custom expect matchers for axe accessibility testing in Playwright. Provides `toPassAxe()` matcher that integrates with Playwright's assertion system. Offers a more ergonomic API than raw AxeBuilder for simple pass/fail a11y checks. |

### Component Testing

#### 14. Playwright Official — Component Testing Documentation

| Field | Value |
|---|---|
| **URL** | https://playwright.dev/docs/test-components |
| **Type** | Official documentation |
| **Notable** | Experimental packages: @playwright/experimental-ct-react, -vue, -svelte. Uses Vite for bundling, serves via local static server. Mount fixture renders components in real browser. Limitations: cannot pass complex live objects, async callbacks marshal between Node.js and browser. Uses `playwright-ct.config.ts`. |

#### 15. Testomat.io — Playwright Component Testing: A Modern Alternative

| Field | Value |
|---|---|
| **URL** | https://testomat.io/blog/playwright-component-testing-as-modern-alternative-to-traditional-tools/ |
| **Type** | Industry analysis |
| **Publisher** | Testomat.io |
| **Notable** | Positions Playwright CT as a middle ground between unit tests (fast, no real browser) and E2E (slow, real browser). Component tests run in real browsers but only mount individual components. Framework support: React, Vue, Svelte (Angular not yet supported). |

#### 16. Serenity/JS — Component Testing with React/Next.js and Playwright

| Field | Value |
|---|---|
| **URL** | https://www.pilot-period.org/sjs-playwright-ct/ |
| **Type** | Technical blog |
| **Publisher** | Pilot Period (Serenity/JS) |
| **Notable** | Demonstrates combining Playwright CT with Serenity/JS screenplay pattern for component testing. Shows that Playwright CT can integrate with higher-level testing frameworks for more structured component tests. |

### Mobile Viewport Testing

#### 17. Playwright Official — Emulation Documentation

| Field | Value |
|---|---|
| **URL** | https://playwright.dev/docs/emulation |
| **Type** | Official documentation |
| **Notable** | Built-in device descriptors for popular devices (iPhone 12, Pixel 5, Galaxy S20 Ultra). Configures viewport, user-agent, device scale factor, touch capabilities, and `isMobile` flag. Supports orientation changes during test execution. |

#### 18. Checkly — How to Emulate Mobile Devices with Playwright

| Field | Value |
|---|---|
| **URL** | https://www.checklyhq.com/docs/learn/playwright/emulating-mobile-devices/ |
| **Type** | Documentation |
| **Publisher** | Checkly |
| **Notable** | Practical guide to mobile emulation. Shows using `playwright.devices['iPhone 12']` in config projects for dedicated mobile test runs. Covers viewport, user-agent, touch, and geolocation emulation. |

#### 19. AlphaBin — Using Playwright for Mobile Web Testing

| Field | Value |
|---|---|
| **URL** | https://www.alphabin.co/blog/using-playwright-for-mobile-web-testing |
| **Type** | Industry guide |
| **Publisher** | AlphaBin |
| **Notable** | Covers touch gesture simulation (pinch, zoom, swipe, tap), orientation testing, and the hybrid approach: Playwright emulation for rapid CI testing + real device testing for critical user journeys. |

---

## Summary Statistics

- **Total resources analyzed:** 19
- **Visual regression:** 5 resources (1 official, 3 blogs, 1 commercial tool)
- **API testing:** 3 resources (1 official, 2 blogs)
- **Accessibility testing:** 5 resources (1 official, 2 blogs, 2 open-source projects)
- **Component testing:** 3 resources (1 official, 2 blogs)
- **Mobile viewport testing:** 3 resources (1 official, 2 guides)
