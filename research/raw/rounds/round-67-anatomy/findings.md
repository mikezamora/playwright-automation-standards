# Round 67 Findings: Independence, Nesting, Parametric Tests, Community Guidance

## Methodology

Analyzed test independence strategies, describe nesting patterns, parametric test usage, and sequential-without-serial approaches across all five suites. Supplemented with community guidance from Playwright official docs, dev.to, Medium, BetterStack, and Checkly.

---

## 1. Test Independence Patterns

### How Suites Achieve Independence Without Serial Mode

All five suites achieve 100% test independence (no test depends on another test's output). Here are the specific mechanisms:

**Ghost CMS — Factory Helpers + Shared Authenticated Page**
- Each test creates its own data via inline helpers (createTier, createOffer, createPage)
- `sharedPage` fixture provides pre-authenticated browser context
- Tests never read data created by other tests
- **Trade-off:** Some data accumulates in the Ghost instance across tests within a describe block, but no test relies on data from a sibling test

**n8n — Blank Canvas Reset**
- `beforeEach` calls `n8n.start.fromBlankCanvas()` — equivalent to a full state reset
- Each test starts from zero workflows, zero nodes
- The composite fixture handles all cleanup internally
- **Trade-off:** State reset per test is slower but guarantees isolation

**Grafana — Dashboard Navigation per Test**
- Each CUJ test navigates to a specific dashboard URL with query parameters
- Dashboard state is server-controlled, not dependent on prior test actions
- Feature toggles set at file level apply uniformly
- **Trade-off:** CUJ steps within a single test ARE sequential (step 2 depends on step 1), but this is internal to one test, not inter-test dependency

**Gutenberg — createNewPost + deleteAllPosts**
- `beforeEach` creates a fresh WordPress post
- `afterAll` cleans up via REST API (`requestUtils.deleteAllPosts()`)
- Each test operates on its own post instance
- **Trade-off:** afterAll cleanup means failed test runs leave data until next afterAll execution

**Element Web — Bot-Created Rooms per Test**
- Each test creates its own Matrix room and bot users
- Room state is initialized fresh via the Matrix client API
- No shared rooms between tests
- **Trade-off:** Room creation is expensive but guarantees complete isolation

### Sequential Operations Without Serial Mode

The critical question: how do suites handle tests that need multi-step sequential flows without using `test.describe.serial`?

**Pattern 1: Everything in One Test (Grafana CUJ)**
```typescript
test('Full dashboard journey', async ({ page }) => {
  await test.step('1. Load dashboard', async () => { ... });
  await test.step('2. Select scopes', async () => { ... });
  await test.step('3. Apply filters', async () => { ... });
});
```
Sequential operations are steps within a single test. If step 1 fails, steps 2-3 are skipped naturally. No serial mode needed.

**Pattern 2: Independent Tests with Repeated Setup (Ghost)**
```javascript
test('Create tier', async ({ sharedPage }) => {
  // Creates its own tier, verifies it
});
test('Create offer for tier', async ({ sharedPage }) => {
  // Creates its own tier AND offer, verifies both
  // Does NOT depend on the "Create tier" test above
});
```
Each test performs the full setup sequence, even if it duplicates work from other tests. This is slower but fully independent.

**Pattern 3: Fixture-Based State (n8n)**
```typescript
test.beforeEach(async ({ n8n }) => {
  await n8n.start.fromWorkflow('complex-workflow.json');
});
test('Edit node', async ({ n8n }) => { ... });
test('Delete node', async ({ n8n }) => { ... });
```
The fixture loads a predefined workflow state, so each test starts from an identical complex state without building it step-by-step.

**Pattern 4: API-Based Setup (Gutenberg, Element Web)**
```javascript
// Gutenberg
test.beforeEach(async ({ admin }) => {
  await admin.createNewPost();
});

// Element Web
test('DM flow', async ({ page, app }) => {
  const roomId = await app.client.createRoom({ name: 'Test Room' });
  // Test operates on the room
});
```
Use REST APIs or client SDKs to set up state programmatically, bypassing UI setup entirely.

### Finding: Serial Mode Is an Anti-Pattern
0/5 suites use `test.describe.serial`. Playwright's own documentation states: "Using serial is not recommended. It is usually better to make your tests isolated, so they can be run independently." The suites confirm this — every one finds an alternative.

---

## 2. Describe Nesting Analysis

### Nesting Depth by Suite

| Suite | Max Depth | Typical Depth | Compensating Mechanism |
|-------|-----------|---------------|----------------------|
| Ghost CMS | 2 | 2 | — |
| n8n | 1 | 1 | 21 feature directories |
| Grafana | 1 | 1 | Separate suite directories (dashboard-cujs/, panels-suite/) |
| Gutenberg | 2 | 1-2 | 5-level directory structure (specs/editor/various/) |
| Element Web | 1 | 1 | 40+ feature directories |

### When Nesting Depth > 1 Is Used

**Ghost CMS (depth 2):** Feature → Sub-feature mapping
```javascript
test.describe('Portal', () => {           // Feature
  test.describe('Donations', () => {      // Sub-feature
    test('anonymous donation', ...);
  });
  test.describe('Offers', () => {         // Sub-feature
    test('free trial offer', ...);
  });
});
```

**Gutenberg (depth 2):** Feature → Variation grouping
```javascript
test.describe('Heading', () => {                           // Feature
  test.describe('Block Transforms FROM paragraph', () => { // Variation
    test('preserve content', ...);
  });
  test.describe('Block Transforms TO paragraph', () => {   // Variation
    test('preserve content', ...);
  });
});
```

### When Nesting Depth = 1 Is Used

**n8n, Grafana, Element Web:** Feature-only grouping
```typescript
test.describe('Node Creator Categories', { annotation }, () => {
  test('should have Actions section collapsed', ...);
  test('should show Triggers section collapsed', ...);
});
```
Sub-feature grouping is handled by directory structure or file naming rather than describe nesting.

### Finding: Directory Structure and Describe Nesting Are Complementary
Suites with shallow nesting (depth 1) compensate with deep directory structures. Suites with deeper nesting (depth 2) have flatter directory structures. The **total organizational depth** (directory depth + describe depth) is remarkably consistent at 3-4 levels across all five suites.

### Community Guidance on Nesting
The Playwright-endorsed dev.to article recommends organizing by authentication state at the directory level (`tests/logged-in/`, `tests/logged-out/`) and using describe blocks for feature grouping within files. No community source recommends nesting deeper than 2 levels.

---

## 3. Parametric Test Patterns

### Playwright's Parameterization Options

Playwright does **not** have a built-in `test.each()` method (unlike Jest). The official docs recommend:

1. **Array + forEach pattern:**
```typescript
const browsers = ['chromium', 'firefox', 'webkit'];
for (const browser of browsers) {
  test(`should work in ${browser}`, async () => { ... });
}
```

2. **CSV/JSON data loading:**
```typescript
const testData = JSON.parse(fs.readFileSync('data.json'));
for (const row of testData) {
  test(`test with ${row.name}`, async () => { ... });
}
```

3. **Project-level parameterization (playwright.config.ts):**
```typescript
projects: [
  { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
  { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
];
```

### Parametric Patterns Across Suites

**Grafana — Config-Driven Dashboard Arrays**
```typescript
const dashboards = getConfigDashboards();
for (const db of dashboards) {
  await test.step(`1.Loads dashboard successfully - ${db}`, async () => { ... });
}
```
Grafana parameterizes within test.step() rather than at the test level.

**Gutenberg — Block Transform Matrix**
```javascript
test.describe('Block Transforms FROM paragraph TO heading', () => {
  test('should preserve content', ...);
  test('should preserve text alignment', ...);
  test('should preserve metadata', ...);
});
test.describe('Block Transforms TO paragraph FROM heading', () => {
  // Mirror tests for reverse transform
});
```
Gutenberg uses parallel describe blocks rather than parameterization to test bidirectional transforms.

**Element Web — Homeserver Conditional Skip**
```typescript
test.skip(isDendrite, "does not yet support cross-signing");
```
Rather than parameterizing across homeservers, Element Web runs all tests and conditionally skips incompatible ones. This is a form of runtime parameterization.

**Ghost — No Parameterization**
Ghost tests are scenario-specific. Each offer type (free trial, one-time discount, forever discount) gets its own dedicated test rather than parameterized variations.

**n8n — No Parameterization**
n8n tests are similarly scenario-specific with no loop-based parameterization.

### Finding: Parameterization Is Underused in Production Suites
Only 1/5 suites (Grafana) uses any form of data-driven parameterization, and even that is within test.step() rather than at the test level. Most suites prefer explicit scenario-per-test over parameterized loops. This aligns with community advice that explicit tests are more readable and produce clearer failure messages.

---

## 4. Community Best Practices Synthesis

### Playwright Official Docs Key Recommendations

1. **Test isolation is paramount.** "Each test should be completely isolated from another test and should run independently with its own local storage, session storage, data, cookies etc."

2. **Prefer web-first assertions.** Use `await expect(locator).toBeVisible()` instead of `expect(await locator.isVisible()).toBe(true)`.

3. **Test observable behavior.** "Tests should verify what is rendered on the page and user interactions, avoiding implementation details."

4. **Assertions stay in tests, not page objects.** This maintains the Single Responsibility Principle.

5. **Use soft assertions for comprehensive diagnostics.** "Soft assertions collect multiple failures before test termination."

6. **No recommendation on assertion count.** Playwright docs do not specify an optimal number of assertions per test.

### Community Guidance Summary

| Source | Key Recommendation |
|--------|-------------------|
| Playwright Docs | Isolation, web-first assertions, observable behavior |
| dev.to (Playwright team) | Organize by auth state, use test.step() for complex tests, fixtures > beforeEach |
| BetterStack | Use locators not selectors, avoid hard waits, keep tests independent |
| Checkly | Fixtures for reusable setup, soft assertions for multi-check tests |
| Semantive | Fixtures over beforeEach for cross-file reusability |
| QA Wolf | AAA as organizing principle, clean separation of phases |
| Medium (multiple) | POM for maintainability, single responsibility per page object |

### Fixtures vs beforeEach — Community Consensus

Playwright's own documentation states fixtures have advantages over hooks:
1. **Encapsulate setup AND teardown in same place** — easier to write and maintain
2. **Reusable between test files** — define once, use everywhere
3. **On-demand** — only created when a test requests them
4. **Composable** — fixtures can depend on other fixtures

The community consensus: **use fixtures for cross-file shared state; use beforeEach for file-specific setup.**

### Test Length Guidance
No community source specifies an optimal test line count. However, the implicit consensus from analyzing suites:
- Under 30 lines: optimal for strict AAA compliance
- 30-50 lines: acceptable for workflow tests
- 50-100 lines: should consider test.step() decomposition
- 100+ lines: should use test.step() or be split into multiple tests (unless CUJ)

---

## 5. Emerging Standards Candidates

Based on Rounds 64-67 analysis, the following patterns have sufficient evidence to become standards:

| Candidate | Evidence Strength | Suites Supporting |
|-----------|-------------------|-------------------|
| Tests must be independently runnable | Very Strong | 5/5 |
| Avoid test.describe.serial | Strong | 5/5 (none use it) |
| Describe nesting max depth 2 | Strong | 5/5 (none exceed 2) |
| Assertion density: archetype-dependent (not fixed count) | Strong | 5/5 |
| Fixtures for cross-file state, beforeEach for file-specific setup | Strong | 4/5 (all except Ghost which uses local helpers) |
| test.step() for tests > 100 lines | Moderate | 2/5 (Grafana, Element Web) |
| Guard assertions for ambiguous state | Moderate | 2/5 (Gutenberg, Grafana) |
| Web-first assertions over synchronous checks | Very Strong | 5/5 + Playwright docs |
| File-local helpers as alternative to shared utilities | Moderate | 3/5 (Ghost, Element Web, Gutenberg) |
| Team ownership annotation on describe blocks | Weak | 1/5 (n8n only) |
| Published test utility packages for ecosystems | Moderate | 2/5 (Gutenberg, Grafana) |
| Prefer explicit scenario tests over parameterization | Moderate | 4/5 |

---

## Summary

### Top 5 Findings Across Rounds 64-67

1. **Test independence is universal and non-negotiable.** All five suites achieve 100% independence through different mechanisms (factory helpers, blank canvas, API setup, bot-created rooms). Serial mode is unused.

2. **test.step() has precisely defined use cases.** It appears in CUJ tests (Grafana inline), helper functions (Element Web), and utility classes (Gutenberg) — but never in short single-interaction tests. The threshold for adopting test.step() is approximately 100 lines.

3. **Describe nesting + directory depth = constant (~3-4 levels).** Suites trade off between deep directories with shallow nesting (n8n, Element Web) and shallower directories with deeper nesting (Ghost). Total organizational depth is remarkably consistent.

4. **Assertion strategy is archetype-dependent.** Single-interaction: 1-3 assertions. Workflow: 3-5. Journey: 10-20 with soft assertions. No single "optimal count" exists.

5. **Fixture investment is the strongest predictor of test quality.** n8n's composite fixture produces the shortest, most AAA-compliant tests. Gutenberg's published utility package enables the broadest ecosystem. Ghost's file-local helpers provide the best per-file readability.
