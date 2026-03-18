# Round 20 — Findings

**Phase:** Structure
**Focus:** Page Object Model patterns — class structure, inheritance, composition, dynamic content

---

## Finding 1: The POM constructor pattern has converged to a single canonical form

Every class-based POM implementation follows the same constructor signature: `constructor(page: Page)` with `this.page = page` and `readonly` locator properties initialized in the constructor body. Locators are defined via `page.locator()`, `page.getByRole()`, `page.getByLabel()`, or `page.getByText()` — never raw selectors stored as strings.
- **Evidence:** Playwright official docs POM example, Grafana plugin-e2e models, community boilerplate repos — all use `constructor(page: Page)` with Locator properties

## Finding 2: POM method organization follows a three-category structure

Page object methods cluster into three categories: (1) **Navigation** — `goto()`, `navigateTo()` methods that reach the page, (2) **Action** — `fillForm()`, `submit()`, `select()` methods that perform user interactions, (3) **State** — getter methods or assertion helpers that verify page state. The official Playwright docs demonstrate embedding `expect()` assertions inside action methods for built-in verification.
- **Evidence:** Playwright docs POM — `getStarted()` method includes `await expect(this.gettingStartedHeader).toBeVisible()` after click, combining action + verification

## Finding 3: POM inheritance via `extends BasePage` is a community pattern absent from production Gold suites

The `abstract class BasePage` pattern (shared header/footer locators, `abstract get url()`) is prevalent in framework templates and boilerplate repos but absent from all Gold-standard production suites analyzed. Gold suites either use (a) fixture-injected models without inheritance (Grafana), (b) factory fixtures without classes (Cal.com), or (c) standalone helper functions (AFFiNE, freeCodeCamp). The inheritance approach adds complexity without clear benefit when fixtures provide composition.
- **Evidence:** Community repos (playwright-boilerplate, playwright-page-object) use BasePage inheritance. Zero Gold suites (Grafana, Cal.com, AFFiNE, Immich, freeCodeCamp) use POM inheritance.

## Finding 4: Grafana's version-aware selectors solve cross-version POM fragility

Grafana plugin-e2e maintains version-aware selectors that adapt locator definitions based on the target Grafana version. This enables the same page object to work across Grafana v9, v10, and v11 where DOM structure has changed. The `selectors/` directory within the fixture package encapsulates version branching away from test code.
- **Evidence:** Grafana plugin-e2e `src/selectors/` directory, version-aware selector resolution in fixture initialization

## Finding 5: The utility-vs-fixture boundary follows a clear decision rule

Use a **fixture** when: (1) setup/teardown lifecycle matters (cleanup guaranteed even on failure), (2) the resource is shared across tests via scoping, (3) dependency injection ordering matters. Use a **utility function** when: (1) the operation is stateless, (2) no cleanup is needed, (3) the function is called explicitly rather than injected. AFFiNE's `openHomePage()` and `clickNewPageButton()` are correctly utilities — they have no teardown and no shared state.
- **Evidence:** AFFiNE (`@affine-test/kit` utility functions), Cal.com (factory fixtures with transactional cleanup), Grafana (fixtures with model lifecycle)

## Finding 6: POM classes handle dynamic content via locator composition, not explicit waits

Modern POM implementations rely on Playwright's auto-waiting locator API rather than explicit `waitForSelector()` or `page.waitForTimeout()`. Locators compose via `.filter()`, `.nth()`, `.locator()` chains to handle dynamic content. The `page.locator('li', { hasText: 'Guides' }).locator('a', { hasText: 'Page Object Model' })` pattern chains static structure with dynamic text content.
- **Evidence:** Playwright docs POM — nested locator composition: `page.locator('li', { hasText: 'Guides' }).locator('a', { hasText: 'Page Object Model' })`

## Finding 7: Multi-role POM uses browser context isolation, not page object duplication

The recommended multi-role pattern creates separate `BrowserContext` instances per role (each with its own `storageState`), then wraps each context's page in a role-specific page object (e.g., `AdminPage`, `UserPage`). Both roles can coexist in a single test via different browser contexts. This is more flexible than role-specific fixture chain approaches.
- **Evidence:** Playwright docs auth — `adminPage: async ({ browser }, use) => { const ctx = await browser.newContext({ storageState: 'admin.json' }); await use(new AdminPage(await ctx.newPage())); await ctx.close(); }`

## Finding 8: Cal.com's `self()` pattern solves the stale fixture problem

Cal.com fixtures include a `self()` method that re-queries the database for the current user state: `const self = async () => prisma.user.findUnique({ where: { id } })`. This ensures the fixture always reflects the latest database state, not a stale snapshot from creation time. This is critical when tests modify server-side state that the fixture needs to observe.
- **Evidence:** Cal.com `fixtures/users.ts` — `self()` method on user fixture returns fresh Prisma query result, used for post-action verification
