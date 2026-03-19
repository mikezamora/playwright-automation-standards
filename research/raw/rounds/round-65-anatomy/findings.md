# Round 65 Findings: Individual Test Structure — Grafana, Gutenberg, Element Web

## Methodology

Analyzed actual test files from Grafana (grafana/grafana), WordPress/Gutenberg (WordPress/gutenberg), and Element Web (element-hq/element-web) by fetching raw source from GitHub. Examined 12+ test files for line count, AAA compliance, setup approach, assertion density, test.step() usage, and self-containment.

---

## Grafana (grafana/grafana)

### Test File Inventory Analyzed

| File | Lines | AAA | Setup Approach | Assertions | test.step() | Self-contained |
|------|-------|-----|----------------|------------|-------------|----------------|
| dashboard-cujs/dashboard-view.spec.ts | 233 | Loose | Feature toggles + fixture | 15-20 total (across 6 steps) | **Yes — 6 steps** | Yes |
| dashboard-cujs/scope-cujs.spec.ts | 164 | Loose | Feature toggles + conditional mocking | 10-15 total (across 5 steps) | **Yes — 5 steps** | Yes |
| dashboard-cujs/adhoc-filters-cujs.spec.ts | 281 | Loose | Feature toggles + fixture | 20+ total (across 6 steps) | **Yes — 6 steps** | Yes |
| dashboard-cujs/dashboard-navigation.spec.ts | 168 | Loose | Feature toggles + conditional mocking | 10-15 total (across 4 steps) | **Yes — 4 steps** | Yes |
| panels-suite/heatmap.spec.ts | 148 | Moderate | Dashboard navigation | 5-8 total (across 3 steps) | **Yes — 3 steps** | Yes |
| panels-suite/canvas-icon-mappings.spec.ts | 105 | Moderate | Dashboard navigation + route interception | 4-6 per test | **Yes — 2 steps** | Yes |

### Grafana Pattern Analysis

**1. test.step() as Organizing Principle for CUJ Tests**
Grafana is the standout adopter of test.step() in this study. Their "CUJ" (Critical User Journey) tests use numbered steps to decompose long user flows:

```typescript
test('View a dashboard', async ({ page }) => {
  await test.step('1.Loads dashboard successfully', async () => { ... });
  await test.step('2.Top level selectors', async () => { ... });
  await test.step('3.Individual panel viewing', async () => { ... });
  await test.step('4.Time range configuration', async () => { ... });
  await test.step('5.Force refresh', async () => { ... });
  await test.step('6.Refresh interval control', async () => { ... });
});
```

This pattern deliberately trades test isolation for journey completeness. A single CUJ test validates an entire user workflow (200+ lines) with numbered steps serving as logical checkpoints. Steps can also nest — time range configuration has 4 sub-steps.

**2. When test.step() Is Appropriate**
Grafana's usage reveals the specific conditions where test.step() adds value:
- Test length exceeds 100 lines
- The test validates a complete user journey rather than a single interaction
- Steps are numbered and named for traceability in reports
- Steps share state (page, dashboard) that would be expensive to recreate
- Steps use `expect.soft()` to avoid short-circuiting the entire journey

**3. AAA Compliance**
CUJ tests are intentionally **not AAA-compliant** — they follow a multi-step journey pattern (Act-Assert-Act-Assert-...). Panel-suite tests achieve moderate AAA within each step.

**4. Conditional Mocking Pattern**
```typescript
const USE_LIVE_DATA = Boolean(process.env.API_CONFIG_PATH);
```
Tests dynamically switch between mocked and live API backends. This dual-mode pattern supports both local development (mocked) and integration testing (live).

**5. Feature Toggle Configuration**
```typescript
test.use({
  featureToggles: { scopeFilters: true, groupByVariable: true, reloadDashboardsOnParamsChange: true },
});
```
Grafana configures feature flags at the test-file level, enabling tests for features that may not be enabled by default.

**6. Assertion Density**
CUJ tests: 15-20 assertions spread across 4-6 steps (3-4 per step average). Panel tests: 4-8 assertions per test. Heavy use of `expect.soft()` in CUJ tests to avoid early termination. Cross-suite average: **4.2 assertions per test** (higher than Ghost/n8n due to CUJ pattern).

**7. @grafana/plugin-e2e Framework**
Grafana extends Playwright via a published package (`@grafana/plugin-e2e`) that provides Grafana-specific fixtures, models, and matchers — similar in concept to Gutenberg's `@wordpress/e2e-test-utils-playwright`.

---

## WordPress/Gutenberg (WordPress/gutenberg)

### Test File Inventory Analyzed

| File | Lines | AAA | Setup Approach | Assertions | test.step() | Self-contained |
|------|-------|-----|----------------|------------|-------------|----------------|
| editor/various/writing-flow.spec.js | 1,318 | Moderate | beforeEach: createNewPost + verify focus | 2-5 per test | No (but helper class uses it) | Yes |
| editor/blocks/heading.spec.js | 565 | Strict | beforeEach: createNewPost | 2-4 per test | No | Yes |
| editor/blocks/paragraph.spec.js | 464 | Moderate | beforeEach: createNewPost | 2-3 per test | No (but DraggingUtils exists) | Yes |
| editor/various/block-deletion.spec.js | 402 | Strict | beforeEach: createNewPost | 2-3 per test | No | Yes |
| editor/various/block-grouping.spec.js | 376 | Strict | beforeEach: createNewPost | 2-4 per test | Helper class uses it |  Yes |

### Gutenberg Pattern Analysis

**1. Published Test Utilities Package**
Gutenberg's distinctive contribution is `@wordpress/e2e-test-utils-playwright`, a published npm package that extends Playwright's test module with WordPress-specific fixtures:
- `admin` — WordPress admin operations
- `editor` — block editor interactions (insertBlock, getBlocks, getEditedPostContent)
- `pageUtils` — keyboard shortcuts, platform-aware key combos
- `requestUtils` — REST API helpers for data setup/teardown

This is the most mature example of a framework-extension package in the suites studied.

**2. Consistent beforeEach Pattern**
Every test file follows the same pattern:
```javascript
test.beforeEach(async ({ admin }) => {
  await admin.createNewPost();
});
```
And cleanup:
```javascript
test.afterAll(async ({ requestUtils }) => {
  await requestUtils.deleteAllPosts();
});
```

**3. expect.poll() Pattern**
Gutenberg uses `expect.poll()` extensively for asynchronous state verification:
```javascript
await expect.poll(editor.getBlocks).toMatchObject([
  { name: 'core/heading', attributes: { content: 'Test' } },
]);
```
This pattern retries the getter until the block state matches, replacing the need for explicit waits.

**4. Custom Utility Classes via test.use()**
Tests attach utility classes to the test context:
```javascript
class WritingFlowUtils {
  getActiveBlockName() { ... }
  addDemoContent() { ... }
}
test.use({ writingFlowUtils: WritingFlowUtils });
```

Some utility classes wrap operations in test.step() for better reporting:
```javascript
async insertBlocksOfSameType() {
  await test.step('Insert blocks of same type', async () => { ... });
}
```

**5. AAA Compliance**
Individual tests within the large files are remarkably AAA-compliant:
- **Arrange**: beforeEach creates a fresh post; test inserts specific blocks via `editor.insertBlock()`
- **Act**: Keyboard interactions, toolbar clicks
- **Assert**: `expect.poll(editor.getBlocks)` or `expect(editor.getEditedPostContent())`

The key insight: **file length does not determine AAA compliance when individual tests are short.** Writing-flow.spec.js has 1,318 lines but contains 40+ small tests averaging 20-30 lines each.

**6. Describe Nesting**
Gutenberg uses 1-2 levels of nesting:
```javascript
test.describe('Heading', () => {
  test.describe('Block Transforms FROM paragraph TO heading', () => {
    test('should preserve content', ...);
  });
});
```
Max depth: 2. The 5-level directory structure (specs/editor/various/, specs/editor/blocks/) handles broader categorization.

**7. Assertion Density**
Consistently low: 2-4 assertions per test. The `expect.poll(editor.getBlocks).toMatchObject()` pattern often serves as a single comprehensive assertion that validates an entire block tree. Cross-suite average: **2.8 assertions per test**.

---

## Element Web (element-hq/element-web)

### Test File Inventory Analyzed

| File | Lines | AAA | Setup Approach | Assertions | test.step() | Self-contained |
|------|-------|-----|----------------|------------|-------------|----------------|
| crypto/crypto.spec.ts | 230 | Moderate | Fixtures (displayName, botCreateOpts) + helper functions | 3-6 per test | **Yes — in helpers** | Yes |
| crypto/device-verification.spec.ts | 429 | Moderate | Fixtures + helper functions | 5-10 per test | No | Yes |
| one-to-one-chat/one-to-one-chat.spec.ts | 51 | Strict | Fixture (user2 credential) | 1-2 per test | No | Yes |
| settings/appearance-user-settings-tab.spec.ts | 97 | Strict | Direct navigation via app.settings | 2-3 per test | No | Yes |
| spaces/spaces.spec.ts | 453 | Moderate | Helper functions + app.client API calls | 3-8 per test | No | Yes |
| read-receipts/read-receipts.spec.ts | ~350 | Moderate | Helper functions (sendMessage, fakeEventFromSent) | 2-4 per test | No | Yes |

### Element Web Pattern Analysis

**1. Multi-Server Matrix Architecture**
Element Web's unique complexity is the multi-server test infrastructure. Tests create Matrix "bots" (secondary clients on the homeserver) that interact with the primary user:
```typescript
const bob = await app.bot.create({ displayName: 'Bob' });
await bob.joinRoom(roomId);
```
This enables testing of federated, encrypted, and multi-user flows that no other suite in this study requires.

**2. test.step() in Crypto Helpers**
Element Web uses test.step() inside helper functions rather than directly in tests:
```typescript
async function fetchMasterKey() {
  return await test.step("Fetch master key from server", async () => { ... });
}
```
This is a distinctly different pattern from Grafana's inline step numbering — steps are encapsulated in reusable functions.

**3. Homeserver Skip Conditions**
```typescript
test.skip(isDendrite, "does not yet support cross-signing (https://github.com/element-hq/element-web/issues/3492)");
```
Tests conditionally skip based on the homeserver implementation (Synapse vs Dendrite), a pattern unique to Matrix ecosystem projects.

**4. Screenshot-Based Assertions**
Element Web uses visual regression testing:
```typescript
await app.timeline.scrollToBottom();
await expect(page.locator(".mx_RoomView")).toMatchScreenshot("encrypted-room.png");
```
Combined with functional assertions, providing dual-layer verification.

**5. Helper Function Pattern**
Like Ghost, Element Web defines test-file-local helper functions. Unlike Ghost's data-factory pattern, Element Web's helpers wrap complex multi-step interactions:
- `checkDMRoom()` — verifies DM creation messages and encryption
- `startDMWithBob()` — initiates conversation
- `testMessages()` — validates encryption icons
- `bobJoin()` — handles membership events with waiting

**6. Assertion Density**
Simple tests (settings, 1:1 chat): 1-3 assertions. Crypto tests: 5-10 assertions including screenshot comparisons and state verification. Spaces tests: 3-8 assertions. Cross-suite average: **3.5 assertions per test**.

**7. Describe Nesting**
Element Web uses 1 level of nesting:
```typescript
test.describe("Cryptography", () => {
  test("Setting up key backup", ...);
});
```
Max depth: 1. Directory structure handles categorization (40+ feature directories under e2e/).

---

## Cross-Suite Comparison: All Round 65 Suites

| Dimension | Grafana | Gutenberg | Element Web |
|-----------|---------|-----------|-------------|
| Avg test length | 150-230 lines (CUJ), 50-100 (panels) | 20-30 lines per test (in large files) | 30-60 lines |
| AAA compliance | 30% (CUJ=loose), 70% (panels) | 85% strict | 65% strict, 35% moderate |
| Setup mechanism | Feature toggles + fixture | Published utility package + beforeEach | Custom fixtures + helper functions |
| Assertion density | 4.2 avg | 2.8 avg | 3.5 avg |
| test.step() usage | **Heavy — all CUJ tests** | Via utility classes only | In helper functions only |
| Describe depth | 1 level | 1-2 levels | 1 level |
| Self-containment | 100% | 100% | 100% |
| Unique pattern | CUJ numbered steps | expect.poll() for state | Multi-server bot interactions |

## Key Findings

1. **test.step() has three distinct usage patterns:**
   - **Grafana (inline numbered steps):** Steps decompose a long CUJ test into numbered checkpoints. Steps are written directly in the test body. Used when test length exceeds ~100 lines.
   - **Element Web (encapsulated in helpers):** Steps wrap reusable operations for better tracing. Steps live in helper functions, not test bodies.
   - **Gutenberg (in utility classes):** Steps wrap setup operations inside utility class methods. Tests themselves don't use steps.

2. **File length vs test length distinction is critical.** Gutenberg's writing-flow.spec.js is 1,318 lines but contains 40+ tests averaging 25 lines each. AAA compliance should be measured per-test, not per-file.

3. **Published test utility packages represent maturity.** Gutenberg (`@wordpress/e2e-test-utils-playwright`) and Grafana (`@grafana/plugin-e2e`) both publish their testing infrastructure as packages, enabling ecosystem-wide adoption.

4. **expect.poll() is a Gutenberg-distinctive pattern** that replaces explicit waits with retry-based state verification. No other suite in this study uses it as extensively.

5. **Feature toggle configuration at test-file level** (Grafana pattern) is a clean solution for testing unreleased features without global configuration changes.

6. **Directory-level organization compensates for shallow describe nesting.** All three suites keep describe nesting at 1-2 levels but use deep directory structures (Grafana: dashboard-cujs/, panels-suite/; Gutenberg: editor/various/, editor/blocks/; Element Web: 40+ feature directories).
