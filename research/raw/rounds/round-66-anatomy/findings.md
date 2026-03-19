# Round 66 Findings: Assertion Patterns Deep Dive

## Methodology

Analyzed assertion patterns across all five suites (Ghost, n8n, Grafana, Gutenberg, Element Web) from Rounds 64-65 data, supplemented with targeted searches for community guidance on guard assertions, assertion density, and assertion ordering.

---

## 1. Guard Assertions (Precondition Assertions Before Main Action)

### Definition
A **guard assertion** verifies that the test environment is in the expected state before performing the main action. It prevents false positives by confirming the starting condition.

### Evidence Across Suites

**Ghost CMS — Implicit Guards via Navigation Waits**
Ghost does not use explicit guard assertions. Instead, it relies on Playwright's auto-waiting:
```javascript
await page.goto('/ghost');
// No explicit "page loaded" assertion — auto-wait handles it
await createPostDraft(sharedPage, { title: 'Test post', body: 'Test post content' });
```

**n8n — Guard via beforeEach**
n8n's `fromBlankCanvas()` is effectively a guard — it ensures the canvas is empty before each test:
```typescript
test.beforeEach(async ({ n8n }) => {
  await n8n.start.fromBlankCanvas();
});
```
No explicit assertion verifies the blank canvas state, but the fixture method handles this internally.

**Grafana — Explicit Guard Assertions in CUJ Steps**
Grafana uses the most explicit guard assertions:
```typescript
await test.step('1.Loads dashboard successfully', async () => {
  // Guard: dashboard must load before testing selectors
  await expect(dashboardPage.panel.getByTitle(panelTitle)).toBeVisible();
});
await test.step('2.Top level selectors', async () => {
  // Now safe to interact with selectors
  await expect(page.getByTestId('GroupByVariable')).toBeVisible();
});
```
Each CUJ step's first assertion acts as a guard for subsequent interactions within that step.

**Gutenberg — Guard via beforeEach + Implicit Check**
```javascript
test.beforeEach(async ({ admin, page }) => {
  await admin.createNewPost();
  // Guard: verify title field has focus (confirms editor loaded)
  await expect(page.locator('role=textbox[name="Add title"]')).toBeFocused();
});
```
This is the most explicit guard pattern: the beforeEach not only sets up state but **asserts** the expected initial condition.

**Element Web — Guard via Helper Return Values**
```typescript
async function startDMWithBob(page, app, bob) {
  // ...creates DM...
  await expect(page.getByRole('heading', { name: 'Bob' })).toBeVisible();
  // Guard: DM room is confirmed before proceeding
}
```
Guards are embedded in helper functions — the function won't return until the precondition is verified.

### Guard Assertion Taxonomy

| Pattern | Used By | Mechanism |
|---------|---------|-----------|
| No explicit guard (rely on auto-wait) | Ghost, n8n | Playwright's built-in actionability checks |
| Guard in beforeEach assertion | Gutenberg | `expect().toBeFocused()` in hook |
| Guard as first step assertion | Grafana | First `expect()` in test.step() block |
| Guard in helper function | Element Web | Helper asserts before returning |
| Guard via fixture internals | n8n | Fixture method ensures state |

### Finding: Guard Assertions Are Rare as a Deliberate Pattern
Only 2/5 suites (Gutenberg, Grafana) use explicit guard assertions. The rest rely on Playwright's auto-waiting. Community guidance (Playwright docs) does not recommend guard assertions — instead recommending web-first assertions that auto-retry.

**Recommendation emerging:** Guard assertions add value only when the initial state is ambiguous (e.g., after complex navigation). For simple page loads, Playwright's auto-waiting is sufficient.

---

## 2. Assertion Density Across Suites

### Quantitative Analysis

| Suite | Min | Max | Average | Median |
|-------|-----|-----|---------|--------|
| Ghost CMS | 2 | 8 | 3.8 | 3 |
| n8n | 1 | 6 | 2.5 | 2 |
| Grafana (CUJ) | 10 | 20+ | 15.5 | 15 |
| Grafana (panels) | 4 | 8 | 5.5 | 5 |
| Gutenberg | 2 | 5 | 2.8 | 3 |
| Element Web | 1 | 10 | 3.5 | 3 |

### Cross-Suite Average (Excluding CUJ)
**3.2 assertions per test**

### Assertion Density vs Test Type

| Test Type | Typical Density | Rationale |
|-----------|----------------|-----------|
| Smoke/auth tests | 1-2 | Single verification (logged in, page loaded) |
| CRUD operations | 3-5 | Create → verify → modify → re-verify |
| Complex workflows | 5-8 | Multi-step with intermediate checks |
| CUJ (journey) tests | 10-20+ | Full user flow with checkpoint assertions |
| Visual regression | 1-2 | Single screenshot comparison |

### Finding: Assertion Density Correlates With Test Archetype, Not Quality
Higher assertion counts are not inherently better. The optimal density depends on the test archetype:
- **Single-interaction tests**: 1-3 assertions (optimal)
- **Workflow tests**: 3-5 assertions (optimal)
- **Journey tests (CUJ)**: 10+ assertions across steps (expected)

---

## 3. Assertion Type Distribution

### Most Common Assertions Across All Suites

| Assertion | Frequency | Used By |
|-----------|-----------|---------|
| `toBeVisible()` | Very High | All 5 suites |
| `toContainText()` / `toHaveText()` | High | Ghost, Grafana, Element Web |
| `toHaveCount()` | Medium | Ghost, n8n |
| `toHaveAttribute()` | Medium | n8n, Grafana |
| `toMatchObject()` / `toMatchSnapshot()` | Medium | Gutenberg (blocks), Element Web (screenshots) |
| `expect.poll()` | Low | Gutenberg (unique) |
| `expect.soft()` | Low | Grafana CUJ tests |
| `toBeFocused()` | Low | Gutenberg |
| `toHaveCSS()` | Low | Element Web (font tests) |

### Assertion Strategy by Suite

**Ghost:** Functional assertions dominate. Heavy use of `frameLocator` for iframe content. No visual regression.

**n8n:** Minimal assertions — typically just `toBeVisible()` and `toHaveAttribute()`. Tests validate that UI elements are present, not their content.

**Grafana:** `expect.soft()` in CUJ tests prevents early termination. Regular `expect()` in panel tests. Text content validation via markdown panel output.

**Gutenberg:** `expect.poll(editor.getBlocks).toMatchObject()` is the signature pattern. Validates entire block tree structure in a single assertion. Also uses `getEditedPostContent()` for HTML snapshot comparison.

**Element Web:** Mixed functional + visual. Screenshot assertions (`toMatchScreenshot()`) complement functional checks. Network request assertions (`expect(request.url()).toContain(...)`) for API validation.

---

## 4. Assertion Ordering Patterns

### Act-Then-Assert (Standard)
Used by all suites for simple interactions:
```javascript
await page.click('button');
await expect(page.locator('.result')).toBeVisible();
```

### Multi-Act-Assert (Workflow Pattern)
Common in Ghost and Element Web for multi-step workflows:
```javascript
await createTier(page, { name: 'Premium', price: 10 });
await createOffer(page, { tier: 'Premium', discount: 10 });
await expect(page.locator('.offer-list')).toContainText('Premium');
await expect(page.locator('.offer-list')).toContainText('10% off');
```

### Step-Assert-Step-Assert (CUJ Pattern)
Exclusive to Grafana:
```typescript
await test.step('1. Load dashboard', async () => {
  await expect(panel).toBeVisible(); // Assert step 1
});
await test.step('2. Configure time range', async () => {
  await expect(timeRange).toContainText('...'); // Assert step 2
});
```

### Assert-Act-Assert (Guard Pattern)
Rare but seen in Gutenberg beforeEach and Grafana CUJ step boundaries:
```javascript
await expect(page.locator('[role="textbox"]')).toBeFocused(); // Guard
await page.keyboard.type('Hello');
await expect(editor.getEditedPostContent()).toBe('<!-- wp:paragraph -->\n<p>Hello</p>\n<!-- /wp:paragraph -->');
```

---

## 5. Soft Assertions Analysis

### Usage Across Suites

| Suite | Uses expect.soft()? | Context |
|-------|---------------------|---------|
| Ghost | No | — |
| n8n | No | — |
| Grafana | **Yes** | CUJ tests to collect all failures before stopping |
| Gutenberg | No | — |
| Element Web | No | — |

### When Soft Assertions Add Value
Grafana's CUJ pattern demonstrates the primary use case: when a test validates multiple independent aspects of a user journey, soft assertions allow the full journey to complete even if one checkpoint fails. This provides complete diagnostic information rather than stopping at the first failure.

### Community Guidance
Playwright docs recommend soft assertions "to collect multiple failures before test termination, improving debugging visibility." The BetterStack guide notes: "Using soft assertions is useful for gathering more complete information during test runs."

---

## 6. Network Assertion Pattern

### Suites Using Network Assertions

**Element Web** — Validates HTTP receipt requests:
```typescript
const receiptRequest = await page.waitForRequest(url => url.includes('/receipt/'));
expect(receiptRequest.url()).toContain('m.read');
```

**Grafana** — Tracks dashboard reload requests:
```typescript
const reloadRequests = await trackDashboardReloadRequests(page);
// ... perform actions ...
await checkDashboardReloadBehavior(reloadRequests, expected);
```

**Grafana (panels)** — Route interception for external asset validation:
```typescript
await page.route('**/public/img/icons/**', route => {
  interceptedRequests.push(route.request().url());
  route.continue();
});
```

### Finding: Network Assertions Strengthen Data-Driven Tests
Network assertions verify not just that the UI changed, but that it changed for the right reason. This is especially valuable for:
- Encryption/security flows (Element Web)
- Dashboard data loading (Grafana)
- API-dependent features

---

## Summary of Assertion Patterns

| Pattern | Prevalence | Best For |
|---------|-----------|----------|
| `toBeVisible()` + `toContainText()` | Universal | Simple UI state verification |
| `expect.poll()` with matcher | Gutenberg-specific | Async state that needs retry |
| `expect.soft()` in steps | Grafana CUJ only | Multi-checkpoint journey tests |
| Screenshot comparison | Element Web | Visual regression + layout |
| Network request assertion | Element Web, Grafana | API behavior verification |
| Guard assertion in beforeEach | Gutenberg | Confirming initial state |
| `toMatchObject()` on data | Gutenberg | Structural comparison of complex objects |

### Key Takeaway
The optimal assertion strategy is **archetype-dependent**, not one-size-fits-all. Short single-interaction tests need 1-3 simple visibility assertions. CUJ tests need numbered steps with soft assertions. Data-driven tests need structural matchers or network verification.
