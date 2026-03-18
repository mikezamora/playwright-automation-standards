# Round 23 — Findings

**Phase:** Validation
**Focus:** Deep dive on assertion strategies — assertion types, web-first vs generic, custom matchers

---

## Finding 1: Playwright provides 30+ auto-retrying locator matchers organized into five functional categories

The assertion matcher taxonomy is richer than commonly documented. Locator assertions (auto-retrying) fall into five categories:
- **Visibility/State:** `toBeVisible()`, `toBeHidden()`, `toBeChecked()`, `toBeDisabled()`, `toBeEnabled()`, `toBeEditable()`, `toBeFocused()`, `toBeAttached()`
- **Content:** `toHaveText()`, `toContainText()`, `toHaveValue()`, `toHaveValues()`, `toBeEmpty()`
- **Attributes/Style:** `toHaveAttribute()`, `toHaveClass()`, `toHaveId()`, `toHaveCSS()`, `toHaveJSProperty()`
- **Accessibility:** `toHaveAccessibleName()`, `toHaveAccessibleDescription()`, `toHaveRole()`, `toMatchAriaSnapshot()`
- **Layout/Visual:** `toBeInViewport()`, `toHaveScreenshot()`, `toHaveCount()`

Page-level assertions are limited to three: `toHaveTitle()`, `toHaveURL()`, `toHaveScreenshot()`. API response assertions are limited to one: `toBeOK()` (status 200-299).

- **Evidence:** [playwright-assertions-docs] complete matcher enumeration; [checkly-assertions] categorization framework
- **Implication:** Suites should prefer locator assertions for UI validation; page assertions only for navigation/title; API validation requires generic assertions beyond `toBeOK()`

## Finding 2: The web-first vs generic assertion distinction is the single most impactful quality signal

Web-first assertions (async, `await`-required) auto-retry until condition met or timeout expires. Generic assertions (`toBe()`, `toEqual()`, `toContain()`) evaluate once immediately without retry. The critical anti-pattern is wrapping a non-retrying method in a generic assertion:

```typescript
// ANTI-PATTERN: evaluates once, no retry, race condition
expect(await page.getByText('welcome').isVisible()).toBe(true);

// CORRECT: auto-retries until visible or timeout
await expect(page.getByText('welcome')).toBeVisible();
```

Gold suites universally use web-first assertions. The `eslint-plugin-playwright` rule `prefer-web-first-assertions` enforces this pattern.

- **Evidence:** [playwright-best-practices] explicit anti-pattern example; [eslint-plugin-playwright] `prefer-web-first-assertions` rule in recommended config; all 10 Gold suites
- **Implication:** This single distinction eliminates the majority of assertion-related flakiness

## Finding 3: Grafana's custom matcher library is the gold standard for domain-specific assertion extension

`@grafana/plugin-e2e` publishes 8 custom matchers via `expect.extend()`: `toBeChecked`, `toBeOK`, `toDisplayPreviews`, `toHaveAlert`, `toHaveChecked`, `toHaveColor`, `toHaveNoA11yViolations`, `toHaveSelected`. These matchers are:
- Published as a reusable npm package (not embedded in the test suite)
- Domain-specific to Grafana plugin testing (e.g., `toHaveAlert` for Grafana alert panels)
- Include accessibility validation (`toHaveNoA11yViolations`)

Playwright supports `mergeExpects()` to combine custom matcher sets from multiple modules.

- **Evidence:** [grafana-plugin-e2e] `packages/plugin-e2e/src/matchers/` directory with 8 matcher files; [playwright-assertions-docs] `expect.extend()` and `mergeExpects()` API
- **Implication:** Custom matchers should be a publishable package for large organizations, not inlined in test files

## Finding 4: Soft assertions fill a specific niche — form validation and smoke tests — but are not universally adopted

`expect.soft()` continues test execution after failure, collecting all failures for a single report. Primary use cases:
- **Form validation:** Check all fields are pre-filled without stopping at first missing field
- **Table structure verification:** Verify all columns/headers in one pass
- **Smoke tests:** Check multiple page elements exist without early termination

Soft assertions can be configured globally via `expect.configure({ soft: true })`. Mid-test verification is possible with `expect(test.info().errors).toHaveLength(0)`. Limitation: only works with Playwright test runner.

Gold suites show low adoption — most prefer hard assertions with focused test scope over soft assertions with broad scope.

- **Evidence:** [playwright-assertions-docs] soft assertion API; [checkly-assertions] soft assertion code examples; [timdeschryver-soft-assertions] practical patterns
- **Implication:** Soft assertions are a tool for specific scenarios, not a default; prefer granular tests with hard assertions

## Finding 5: API response validation requires a two-layer pattern — `toBeOK()` plus body parsing

Playwright provides only one built-in API assertion: `toBeOK()` (checks status 200-299). Real-world API validation requires a two-layer approach:

```typescript
// Layer 1: Status code validation
await expect(response).toBeOK();
// or for specific codes:
expect(response.status()).toBe(201);

// Layer 2: Body validation via generic assertions
const body = await response.json();
expect(body.id).toBeDefined();
expect(body.name).toBe('expected-name');
expect(body.items).toHaveLength(3);
```

Gold suites that test APIs (Immich, Cal.com) follow this pattern: status assertion first, then structured body validation using generic matchers on parsed JSON.

- **Evidence:** [playwright-apiresponse-docs] single `toBeOK()` matcher; [playwrightsolutions-api-guide] two-layer validation pattern; [immich-e2e] API test patterns
- **Implication:** API-heavy suites need generic assertions and cannot rely solely on web-first assertions; this is the correct exception to the "prefer web-first" rule

## Finding 6: Visual regression assertions require environment-controlled baselines and tolerance tuning

`toHaveScreenshot()` and `toMatchSnapshot()` serve different purposes:
- `toHaveScreenshot()`: pixel comparison of page/element screenshots (visual regression)
- `toMatchSnapshot()`: text or binary data comparison (data snapshots)

Critical configuration parameters:
- `maxDiffPixels`: absolute pixel count tolerance (e.g., `100` on 1280x720 is invisible)
- `maxDiffPixelRatio`: percentage tolerance (e.g., `0.001` = 0.1% of pixels)
- `threshold`: color sensitivity (0-1, default 0.2)
- `animations: 'disabled'`: eliminates animation-caused flakiness
- `mask`: array of locators to mask dynamic content

Three biggest flakiness sources: CSS animations, dynamic content, and cross-environment rendering differences. Baselines must be generated in the same CI environment where tests run.

- **Evidence:** [playwright-visual-comparisons] configuration options; [excalidraw-e2e] visual regression patterns; [bug0-visual-testing] tolerance tuning guide; [codoid-visual-guide] environment-controlled baselines
- **Implication:** Visual tests should be a separate project with controlled viewport, OS, and browser — never mixed with functional assertions

## Finding 7: Assertion granularity favors multiple focused tests over fewer comprehensive tests

The community consensus strongly favors granular tests: "The choice between one 'super test' and 5 or 10 smaller tests should always go with the more granular option." Reasons:
- Parallel execution benefits from more, smaller tests
- Failure isolation is clearer with focused assertions
- Retry costs are lower (retry one small test vs. one large test)

However, within a single test, multiple related assertions are acceptable and common. The anti-pattern is unrelated assertions in one test, not multiple assertions per se.

Gold suites show 2-5 assertions per test on average, with assertions clustered around a single user flow or behavior.

- **Evidence:** [checkly-assertions] granularity recommendation; [playwright-best-practices] test isolation guidance; Gold suite test file analysis showing 2-5 assertions per test
- **Implication:** "One assertion per test" is too strict; "one behavior per test with supporting assertions" is the correct granularity

## Finding 8: Custom failure messages are underutilized but high-value for debugging

Playwright supports custom failure messages as the second argument to `expect()`:

```typescript
expect.soft(getAPIResponseTime(response), 'GET /dragons response too slow')
  .toBeLessThanOrEqual(200);
```

This pattern is particularly valuable for:
- Soft assertions (where multiple failures accumulate)
- API assertions (where status codes alone don't explain the failure)
- Loop-based assertions (where the iteration context matters)

Gold suites show inconsistent adoption — most rely on auto-generated messages. Custom messages are more common in API validation and performance checks.

- **Evidence:** [checkly-assertions] custom message example with soft assertions; [playwright-assertions-docs] message parameter API
- **Implication:** Custom failure messages should be a standard practice for non-obvious assertions, especially in API and performance validation
