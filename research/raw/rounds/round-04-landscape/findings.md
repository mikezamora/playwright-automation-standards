# Round 04 — Landscape: Findings

**Focus:** Community consensus on Playwright best practices
**Date:** 2026-03-18

---

## Key Findings

### 1. Official and community best practices have converged into a stable consensus

The Playwright official documentation lists 19 distinct best practices, and third-party guides from BrowserStack, Autify, Currents.dev, and PixelQA all echo the same core recommendations with minimal divergence. This convergence indicates the Playwright community has reached a mature, stable understanding of what constitutes "best practice."

**Evidence:** The official page covers: test user-visible behavior, isolate tests, avoid third-party dependencies, use locators (not XPath/CSS), use web-first assertions, run on CI, use parallelism and sharding, and lint tests. Every third-party guide surveyed (BrowserStack 15-point guide, Autify 11-point guide, Currents.dev skill) includes these same practices almost verbatim.

### 2. Playwright has surpassed Cypress as the dominant E2E testing framework

Market data from TestGuild and TestDino confirm Playwright's position as the leading JavaScript E2E framework by adoption rate (45.1% vs. Cypress at 14.4%), retention (94% vs. 84%), and GitHub stars (78.6k vs. 49.4k). Multiple companies have publicly documented their migration from Cypress to Playwright, with quantified improvements.

**Evidence:** TestDino reports 4,484 verified companies using Playwright including Amazon, Apple, Walmart, Microsoft, NVIDIA. BigBinary documented an 88.68% improvement in test execution speed and 89.12% reduction in total suite time after migration. This Dot Labs migrated in hours using automated conversion tooling. Cypress's own documentation now includes a Playwright-to-Cypress migration guide, acknowledging competitive pressure.

### 3. "Test user-visible behavior" is the foundational consensus principle

Across all official and community sources, the single most emphasized recommendation is to test what users see and do, not implementation details. This principle drives downstream decisions about locator strategy (prefer role/text/test-id), assertion style (web-first assertions), and test scope (user journeys over unit-like checks).

**Evidence:** The official best practices page leads with this principle. BrowserStack, Currents.dev, and Autify all position it as foundational. The practical implication is consistent: avoid CSS class selectors, avoid internal state assertions, prefer `page.getByRole()` over `page.locator('.class-name')`.

### 4. Auto-waiting and web-first assertions are the primary anti-flakiness mechanisms

The community overwhelmingly recommends leveraging Playwright's built-in auto-waiting rather than explicit waits or sleep statements. Web-first assertions (`expect(locator).toBeVisible()`) are preferred over manual checks because they automatically retry until a condition is met or a timeout expires.

**Evidence:** Every guide surveyed lists auto-waiting as a top-3 practice. BigBinary reported that removing unnecessary wait/delay commands during migration improved test robustness. The official documentation states: "By using web first assertions Playwright will wait until the expected condition is met."

### 5. Page Object Model remains the recommended structural pattern despite fixture alternatives

POM is consistently recommended across community resources for organizing test code, despite Playwright's fixture system providing an alternative abstraction mechanism. The community consensus is that POM handles UI abstraction while fixtures handle test setup/teardown and dependency injection; they are complementary, not competing.

**Evidence:** BrowserStack guide: "centralize UI interactions into page classes by encapsulating selectors and actions inside page model files." Currents.dev lists "POM structure and patterns" as a core guidance area. The official best practices page recommends POM implicitly through its locator organization guidance.

### 6. The Playwright conference ecosystem has matured into an annual cycle

The Playwright community now has a dedicated annual conference (Playwright Users Event), 34+ recorded conference talks spanning 2021-2025, and representation at major software conferences (Microsoft Build, NDC, Vite Conf, JSHeroes). This represents a mature ecosystem with sustained knowledge sharing.

**Evidence:** playwright.dev/community/conference-videos lists 34 talks. The Playwright Users Event ran in 2024 (Nov 12) and 2025 (Nov 19). Key speakers include Debbie O'Brien (Developer Relations) and Max Schmitt (core contributor). Talks span English, French, Spanish, and Russian, indicating global reach.

### 7. Migration tooling has matured, lowering the barrier from Cypress to Playwright

The existence of automated conversion tools (cy2pw.com, Ray's conversion tool) and comprehensive migration guides indicates that Cypress-to-Playwright migration is now a well-trodden path. This Dot Labs migrated their entire E2E suite in hours. Currents.dev provides cost analysis and timeline guidance for the migration.

**Evidence:** cy2pw.com is a dedicated migration portal. This Dot Labs used automated conversion with FIXME_ prefixes for manual review. Currents.dev published "From Cypress to Playwright: cost, migration steps, timeline and AI tools." TestDino published a step-by-step migration guide. Even Cypress's own docs acknowledge the reverse migration path.

### 8. Codified best-practice templates are emerging as a distribution mechanism

Beyond documentation and blog posts, the community is moving toward "best practices as code" -- reusable, machine-readable configurations and templates that encode recommended patterns. Playwright Labs, Currents.dev's AI Skill, and enterprise boilerplate repos represent this trend.

**Evidence:** Playwright Labs is "a curated monorepo of skills and best practices designed specifically for modern testing workflows." Currents.dev's Playwright best-practices skill provides structured guidance integrated into development environments. This trend suggests that future standards should be distributable as templates and configurations, not just prose.

---

## Questions for Next Rounds

1. How do CI/CD configurations differ between GitHub Actions, GitLab CI, and Jenkins for Playwright?
2. What specific sharding strategies yield the best performance at scale?
3. Which Playwright capabilities (visual regression, API testing, accessibility, component testing) are commonly combined in the same project?
