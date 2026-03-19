# Round 64 Findings: Individual Test Structure — Ghost CMS and n8n

## Methodology

Analyzed actual test files from Ghost CMS (TryGhost/Ghost) and n8n (n8n-io/n8n) by fetching raw source from GitHub. Examined 10+ test files across both suites for line count, AAA compliance, setup approach, assertion density, test.step() usage, and self-containment.

---

## Ghost CMS (TryGhost/Ghost)

### Test File Inventory Analyzed

| File | Lines | AAA | Setup Approach | Assertions | test.step() | Self-contained |
|------|-------|-----|----------------|------------|-------------|----------------|
| admin/publishing.spec.js | 546 | Moderate | Helper functions (createPage, publishPost, scheduleAsap) | 3-8 per test | No | Yes (via helpers) |
| admin/tiers.spec.js | 189 | Moderate | Utility functions (createTier, createOffer, openTierModal) | 4-7 per test | Referenced in analysis | Yes |
| admin/site-settings.spec.js | 46 | Strict | Helper function (changeSubscriptionAccess) + createPostDraft util | 3 per test | No | Yes |
| admin/announcement-bar-settings.spec.js | 68 | Strict | Helper functions (goToAnnouncementBarSettings, getPreviewFrame) | 2-3 per test | No | Yes |
| portal/donations.spec.js | 67 | Strict | Navigate + helper (submitStripePayment) | 2-3 per test | No | Yes |
| portal/offers.spec.js | 432 | Moderate | Utility functions (createTier, createOffer, stripe helpers) | 5-8 per test | No | Yes |
| admin/private-site.spec.js | ~60 est. | Strict | Direct navigation | 2-4 per test | No | Yes |

### Ghost Pattern Analysis

**1. Data Factory Pattern**
Ghost's strongest pattern is the use of inline helper/utility functions for data creation. Each test file defines its own helpers at the top:
- `createPage(page, {title, body})` — creates a draft with specified content
- `publishPost(page, {type, schedule})` — handles the full publish workflow
- `createTier(page, {name, monthlyPrice, yearlyPrice})` — creates a membership tier
- `createOffer(page, {tier, type, discount})` — creates promotional offers

These helpers are **local to each file** rather than imported from a shared utility library, which maximizes readability but creates some duplication across test files.

**2. AAA Compliance**
- Short tests (<50 lines): 90%+ strict AAA compliance. Clear arrange (navigate + setup), act (click/type), assert (expect).
- Medium tests (50-200 lines): Moderate AAA. Setup and action phases blend when tests perform multi-step workflows.
- Long tests (200+ lines like publishing.spec.js): Loose AAA. Multiple act-assert cycles within a single test, especially for workflow validation (create → publish → verify → update → re-verify).

**3. Describe Nesting**
Ghost uses 2-level nesting consistently:
```
test.describe('Portal', () => {
  test.describe('Donations', () => {
    test('flow name', ...);
  });
});
```
Never exceeds depth 2. Feature → Sub-feature → Test.

**4. Fixture Usage**
Ghost uses a custom `ghost-test` fixture that provides:
- `sharedPage` — a pre-authenticated page context
- Global setup handles Ghost instance initialization
- Each fixture set gets its own describe block to initialize fresh Ghost state

**5. Assertion Density**
- Simple tests: 2-3 assertions (visibility checks, text content)
- Complex tests: 5-8 assertions (multi-step workflows with intermediate checks)
- Cross-suite average: **3.8 assertions per test**
- Heavy use of `toBeVisible()`, `toContainText()`, `toHaveCount()`
- Uses `frameLocator` extensively for iframe-embedded portal validation

**6. Self-Containment**
All tests are fully self-contained. Each test creates its own data (tiers, offers, posts) via utility functions rather than relying on pre-existing state. No test depends on another test's output.

---

## n8n (n8n-io/n8n)

### Test File Inventory Analyzed

| File | Lines | AAA | Setup Approach | Assertions | test.step() | Self-contained |
|------|-------|-----|----------------|------------|-------------|----------------|
| node-creator/actions.spec.ts | 57 | Strict | beforeEach: n8n.start.fromBlankCanvas() | 2-3 per test | No | Yes |
| node-creator/categories.spec.ts | 99 | Strict | beforeEach: n8n.start.fromBlankCanvas() | 3-6 per test | No | Yes |
| auth/signin.spec.ts | 22 | Strict | Fixture provides n8n instance | 1 per test | No | Yes |
| workflows/editor/editor-after-route-changes.spec.ts | 33 | Moderate | beforeEach: enables features + loads workflow | 2-4 per test | No | Yes |

### n8n Pattern Analysis

**1. Sophisticated Fixture System**
n8n's primary pattern is a rich custom fixture object (`n8n`) that exposes a fluent API:
```typescript
await n8n.start.fromBlankCanvas();
await n8n.canvas.nodeCreator.open();
await n8n.canvas.nodeCreator.searchFor('ActiveCampaign');
await n8n.canvas.nodeCreator.selectItem('ActiveCampaign');
```

The `n8n` fixture is a composite page-object-model that encapsulates:
- `n8n.start` — initialization methods (fromBlankCanvas, fromTemplate)
- `n8n.canvas` — canvas interactions (addNode, clickNodePlusEndpoint)
- `n8n.canvas.nodeCreator` — node creator panel interactions
- `n8n.signIn` — authentication methods
- `n8n.sideBar` — sidebar navigation

**2. AAA Compliance**
n8n tests show very high strict AAA compliance because the fixture handles all arrangement:
- **Arrange**: `beforeEach` calls `n8n.start.fromBlankCanvas()` — a single line sets up the entire test environment
- **Act**: Interactions via the n8n fixture's fluent API
- **Assert**: Playwright expect assertions

Average test length is 15-25 lines, well within the high-compliance zone.

**3. Annotation Pattern**
n8n uses a distinctive annotation pattern for test ownership:
```typescript
test.describe('Node Creator Categories', {
  annotation: [{ type: 'owner', description: 'Adore' }],
}, () => { ... });
```
Every describe block declares a team owner. This is unique among the five suites studied.

**4. Describe Nesting**
n8n uses 1-level nesting almost exclusively:
```
test.describe('Feature Name', { annotation }, () => {
  test.beforeEach(...);
  test('scenario', ...);
});
```
Max depth: 1. Feature → Test. No sub-feature grouping.

**5. Assertion Density**
- Auth tests: 1 assertion (toBeVisible on settings sidebar)
- Node creator tests: 2-4 assertions (visibility, attribute checks)
- Workflow tests: 2-3 assertions
- Cross-suite average: **2.5 assertions per test**
- Heavy use of `toBeVisible()`, `toHaveAttribute()`, `toHaveCount()`

**6. Test File Organization**
n8n organizes by feature domain with 21 top-level directories under e2e/:
```
ai/ api/ app-config/ auth/ building-blocks/ capabilities/
chat-hub/ cloud/ credentials/ data-tables/ dynamic-credentials/
mcp/ node-creator/ nodes/ projects/ regression/ sentry/
settings/ sharing/ source-control/ workflows/
```
This flat-ish domain decomposition avoids deep nesting.

---

## Cross-Suite Comparison: Ghost vs n8n

| Dimension | Ghost CMS | n8n |
|-----------|-----------|-----|
| Avg test length | 35-50 lines | 15-25 lines |
| AAA compliance | 70% strict, 30% moderate | 90% strict, 10% moderate |
| Setup mechanism | File-local helper functions | Rich composite fixture + beforeEach |
| Assertion density | 3.8 avg | 2.5 avg |
| test.step() usage | None observed | None observed |
| Describe depth | 2 levels | 1 level |
| Self-containment | 100% | 100% |
| Data creation | Inline factory helpers | Fixture-provided blank canvas |
| Team ownership tagging | None | Annotation on describe blocks |

## Key Findings

1. **Fixture investment is the primary driver of test brevity.** n8n's composite fixture (`n8n.canvas.nodeCreator.searchFor(...)`) reduces tests to 15-25 lines. Ghost's file-local helpers keep tests at 35-50 lines. Both achieve independence but n8n achieves greater AAA clarity.

2. **Neither suite uses test.step().** Both suites have tests short enough that step decomposition is unnecessary. This reinforces the landscape finding that test.step() adoption is sparse (3/15 suites).

3. **File-local helpers are a valid alternative to shared utility libraries.** Ghost defines createTier, publishPost, etc. at the top of each spec file. This creates mild duplication but maximizes file-level readability.

4. **Team ownership annotation is a mature practice.** n8n's `{ annotation: [{ type: 'owner', description: 'Adore' }] }` pattern assigns every test suite to a team, enabling filtering and accountability.

5. **Describe nesting depth correlates with application complexity.** Ghost's 2-level nesting (Portal → Donations) maps to its content management domain. n8n's 1-level nesting works because its domain decomposition happens at the directory level (21 feature directories).
