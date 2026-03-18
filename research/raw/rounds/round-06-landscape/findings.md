# Round 06 — Landscape: Findings

**Focus:** Specialized Playwright capabilities — which are commonly used together and which are specialized
**Date:** 2026-03-18

---

## Key Findings

### 1. Visual regression testing is built-in but requires CI-only execution for reliability

Playwright's `toHaveScreenshot()` and `toMatchSnapshot()` provide zero-dependency visual regression testing. However, the community consensus is that visual tests MUST run in consistent CI environments (not developer machines) because browser rendering varies by OS, hardware, power source, and headless mode. The recommended pattern is: generate baselines in CI, review diffs in PRs, use `stylePath` to hide volatile elements.

**Evidence:** Official documentation: "browser rendering can vary based on the host OS, version, settings, hardware, power source, headless mode, and other factors." CSS-Tricks recommends CI-only execution. Duncan Mackenzie's guide demonstrates generating baselines exclusively in GitHub Actions. Chromatic extends this with cloud-based archive comparison that captures DOM + styling for interactive debugging.

### 2. Visual regression testing is typically Chromium-only in practice

Despite Playwright's cross-browser support, the community recommends running visual regression tests in Chromium only. Cross-browser rendering differences create separate baselines per browser, multiplicatively increasing maintenance burden. Teams use cross-browser E2E testing for functional validation and single-browser visual testing for pixel-level regression.

**Evidence:** Multiple guides recommend Chromium-only visual testing. The snapshot naming convention `{testName}-{number}-{browser}-{platform}.png` shows Playwright anticipates per-browser baselines, but production teams avoid maintaining 3x baselines. Excalidraw's visual regression work targets a single browser engine.

### 3. API testing via APIRequestContext is primarily used for test setup, not standalone API suites

While Playwright supports standalone API testing without browsers, the most common pattern in production projects is using `APIRequestContext` for test setup and teardown (seeding data, cleaning up, authenticating) rather than as a standalone API testing framework. The shared cookie/session context between `page.request` and browser interactions makes it ideal for hybrid UI+API workflows.

**Evidence:** Official documentation demonstrates API testing primarily in the context of E2E test setup: creating test data via API before UI interactions, verifying side effects via API after UI actions. CircleCI's guide shows standalone API testing but notes it's less common. Medium article on unified suites shows `tests/api/` and `tests/ui/` sharing authentication state -- the API tests validate backend preconditions for UI tests.

### 4. @axe-core/playwright is the undisputed standard for Playwright accessibility testing

Every accessibility testing resource surveyed uses the `@axe-core/playwright` package from Deque Systems. No competing libraries exist for automated WCAG testing in Playwright. The standard pattern is: `AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()`, with `.exclude()` for known issues and `.include()` for targeted scanning.

**Evidence:** Official Playwright docs recommend @axe-core/playwright exclusively. Subito, Excalidraw, and the Playwright_AccessibilityTests framework all use it. Widen/expect-axe-playwright wraps it with ergonomic matchers. The npm package `axe-playwright` (community alternative) also builds on axe-core. There is no meaningful alternative ecosystem.

### 5. Accessibility testing follows two CI patterns: fail-on-violation vs. audit-and-report

Production teams adopt one of two CI strategies for accessibility testing. The "fail-on-violation" pattern treats a11y violations as test failures that block merge. The "audit-and-report" pattern runs a11y tests but reports results to GitHub Issues or dashboards without blocking, enabling progressive remediation of accessibility debt.

**Evidence:** Subito chose audit-and-report because they "had significant accessibility debt to address progressively" -- their CI creates/updates GitHub Issues with violation reports. Jakub Andrzejewski's guide demonstrates the same pattern. The official Playwright docs show the fail-on-violation pattern with `expect(results.violations).toEqual([])`. The choice depends on the project's a11y maturity level.

### 6. Component testing remains experimental with limited production adoption

Playwright's component testing packages (@playwright/experimental-ct-react, -vue, -svelte) remain experimental despite active maintenance (v1.58.2 published March 2026). The "experimental" label, limitations around complex object passing and async callbacks, and competition from Vitest/Testing Library for component testing mean production adoption is limited. Most teams use Playwright for E2E and a separate tool for component tests.

**Evidence:** Official docs label it "experimental." Key limitation: "You can't pass complex live objects to your component." The ct packages require Vite bundling, separate config (`playwright-ct.config.ts`), and a facade page. Testomat.io positions it as a "modern alternative" but acknowledges it's not yet mainstream. The Medium article on 2025 testing trends notes most teams combine Vitest for unit/component + Playwright for E2E.

### 7. Mobile viewport testing is commonly configured as a separate Playwright project

The standard pattern for mobile testing is defining a separate Playwright project that uses device descriptors (`playwright.devices['iPhone 12']`), running the same test files with mobile viewport, user-agent, and touch capabilities. This approach tests responsive behavior without separate test files, leveraging Playwright's project configuration to multiply test coverage.

**Evidence:** Official emulation docs show device descriptor configuration per project. AFFiNE runs separate mobile E2E shards. Checkly's guide demonstrates `devices['iPhone 12']` in project config. AlphaBin recommends a hybrid approach: Playwright emulation for CI + real device testing for critical journeys. The `isMobile` flag enables conditional test logic for mobile-specific flows.

### 8. The most common capability combination is E2E + API setup + CI sharding; visual and a11y testing are additive specializations

Production projects overwhelmingly combine E2E UI testing with API-based test setup/teardown and CI sharding as the baseline. Visual regression, accessibility testing, and component testing are additive capabilities that projects adopt based on specific needs -- they are not part of the standard baseline. Projects that use visual regression rarely also do component testing, and accessibility testing is most common in customer-facing applications.

**Evidence:** Cal.com, Grafana, freeCodeCamp, and Supabase all use E2E + API setup + CI sharding as their core pattern. Excalidraw adds accessibility testing. AFFiNE adds mobile viewport testing. Visual regression is most common in design-focused tools. Component testing is adopted primarily by teams migrating from Testing Library. No surveyed project uses all five capabilities simultaneously.

---

## Questions for Next Rounds

1. How should a standards document structure recommendations for baseline capabilities vs. additive specializations?
2. What quality indicators distinguish a "good" visual regression setup from a brittle one?
3. How do the most mature Playwright configurations (Cal.com, Grafana, Playwright itself) structure their fixture hierarchies?
