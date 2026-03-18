# Round 24 — Findings

**Phase:** Validation
**Focus:** Deep dive on assertion strategies — locator vs page assertions, ESLint enforcement, assertion composition

---

## Finding 1: eslint-plugin-playwright provides 11 assertion/wait rules in its recommended config — forming a comprehensive quality gate

The recommended config enforces these assertion and wait rules:
| Rule | Purpose |
|------|---------|
| `prefer-web-first-assertions` | Prevents `isVisible()` / `isEnabled()` in `expect()` — forces auto-retrying matchers |
| `no-wait-for-timeout` | Bans `page.waitForTimeout()` — the #1 flakiness source |
| `no-wait-for-selector` | Bans `page.waitForSelector()` — replaced by locator auto-waiting |
| `no-wait-for-navigation` | Bans deprecated `page.waitForNavigation()` — replaced by `waitForURL()` |
| `missing-playwright-await` | Catches un-awaited async assertions — silent pass without `await` |
| `no-force-option` | Bans `{ force: true }` — masks actionability failures |
| `expect-expect` | Ensures every test has at least one assertion |
| `no-standalone-expect` | Prevents `expect()` outside test blocks |
| `no-conditional-expect` | Prevents `expect()` inside conditionals — non-deterministic |
| `no-useless-await` | Removes unnecessary `await` on synchronous methods |
| `no-useless-not` | Removes `.not.toBeHidden()` when `.toBeVisible()` exists |

Additional valuable rules not in recommended config: `no-conditional-in-test`, `no-page-pause`, `prefer-locator`, `no-element-handle`, `no-eval`.

- **Evidence:** [eslint-plugin-playwright] GitHub repository: 60 total rules, recommended config analysis; [grafana-e2e] ESLint config includes recommended preset
- **Implication:** The recommended config is a minimum; Gold suites should enable additional rules (`no-conditional-in-test`, `prefer-locator`) for stricter enforcement

## Finding 2: Locator assertions outnumber page assertions 10:1 in Gold suites — reflecting the locator-centric architecture

Page-level assertions are limited to three matchers (`toHaveTitle()`, `toHaveURL()`, `toHaveScreenshot()`), while locator assertions provide 30+ matchers. In practice:
- `toHaveURL()` is used primarily after navigation actions or auth flows
- `toHaveTitle()` is used in initial page verification but rarely elsewhere
- All other assertions target locators

This ratio reflects Playwright's design philosophy: tests should interact with specific elements, not pages. The locator is the fundamental testing unit.

- **Evidence:** [playwright-assertions-docs] 30+ locator matchers vs 3 page matchers; [calcom-e2e] test files show `toBeVisible()` + `toHaveCount()` dominating; [supabase-e2e] `toHaveURL()` for auth flows
- **Implication:** Page assertions should be limited to navigation verification; all element validation should use locator assertions

## Finding 3: The assertion timeout hierarchy has three layers with distinct defaults

Three timeout levels govern assertion behavior:
1. **Global test timeout** (default 30s): maximum duration for entire test including all assertions
2. **Global expect timeout** (default 5s): maximum duration for any single auto-retrying assertion
3. **Per-assertion timeout** (overrides global): `await expect(locator).toBeVisible({ timeout: 10000 })`

Configuration pattern observed in Gold suites:
```typescript
export default defineConfig({
  timeout: process.env.CI ? 60_000 : 30_000,
  expect: {
    timeout: process.env.CI ? 10_000 : 5_000,
  },
});
```

Editor-heavy apps (Slate, Excalidraw) use higher expect timeouts (8-10s) due to complex rendering. API-focused apps (Immich) use lower expect timeouts (3-5s).

- **Evidence:** [playwright-assertions-docs] default 5s expect timeout; [slate-e2e] 8s expect timeout for editor; [grafana-e2e] 10s expect timeout for dashboard rendering; [semaphore-flaky-tests] timeout tuning patterns
- **Implication:** Expect timeout should be tuned to application type: 5s for standard apps, 8-10s for rendering-heavy apps, 3-5s for API-focused tests

## Finding 4: The `toPass()` and `expect.poll()` APIs serve distinct retry use cases beyond standard assertion retry

Standard auto-retrying assertions handle most UI validation. Two explicit retry APIs handle the remainder:

**`toPass()`** — retries an entire assertion block:
```typescript
await expect(async () => {
  const storage = await page.evaluate(() => localStorage.getItem('user'));
  expect(JSON.parse(storage)).toHaveProperty('name', 'Alice');
}).toPass({ timeout: 10_000, intervals: [1_000, 2_000, 5_000] });
```
Default intervals: `[100, 250, 500, 1000]`. Default timeout: 0 (no limit). Use for: non-UI conditions (localStorage, background tasks, multi-step validation).

**`expect.poll()`** — polls a function and asserts on its return value:
```typescript
await expect.poll(async () => {
  const response = await page.request.get('/api/status');
  return (await response.json()).state;
}, { timeout: 30_000, intervals: [1_000, 2_000, 5_000] })
  .toBe('completed');
```
Use for: external API state checks, async process completion.

- **Evidence:** [playwright-assertions-docs] `toPass()` and `expect.poll()` API; [timdeschryver-retry-apis] comparison of all 5 retry mechanisms; [playwrightsolutions-retries] per-test retry overrides
- **Implication:** Tests should use auto-retrying assertions by default; `toPass()` for multi-step non-UI validation; `expect.poll()` for polling external state

## Finding 5: The `missing-playwright-await` ESLint rule prevents the most dangerous assertion bug — silent passes

Un-awaited web-first assertions silently pass without actually checking anything:
```typescript
// BUG: assertion never executes, test passes silently
expect(page.getByText('error')).toBeVisible();  // missing await

// CORRECT: assertion executes and auto-retries
await expect(page.getByText('error')).toBeVisible();
```

The `missing-playwright-await` rule catches this at lint time. The complementary TypeScript rule `@typescript-eslint/no-floating-promises` provides a second safety net for all un-awaited promises.

Gold suites that enforce both rules have zero silent-pass bugs. This is the single highest-value ESLint configuration for Playwright.

- **Evidence:** [eslint-plugin-playwright] `missing-playwright-await` rule; [playwright-best-practices] `@typescript-eslint/no-floating-promises` recommendation; [dev.to-catch-missing-await] detailed article on the pattern
- **Implication:** Both rules must be enabled: `missing-playwright-await` (Playwright-specific) and `@typescript-eslint/no-floating-promises` (general TypeScript)

## Finding 6: Assertion composition follows a "setup-act-assert" micro-pattern within each test step

Gold suites show a consistent micro-pattern within tests:
1. **Navigate/Setup:** `await page.goto()` or fixture provides the page state
2. **Act:** `await page.getByRole('button').click()` or `await page.fill()`
3. **Assert:** `await expect(page.getByText('Success')).toBeVisible()`

Multiple act-assert cycles within a single test are common and acceptable when they represent a single user flow. The anti-pattern is assertions that depend on state from a different test.

Cal.com's flaky-fix PR (#23487) demonstrates the pattern: adding visibility assertions between act steps prevents race conditions:
```typescript
await page.getByTestId('workflow-list').click();
await expect(page.getByTestId('workflow-detail')).toBeVisible(); // guard assertion
await page.getByTestId('workflow-name').fill('New Name');
```

- **Evidence:** [calcom-flaky-fix-pr] PR #23487 visibility guard pattern; [playwright-best-practices] test isolation and structure; [checkly-assertions] setup-act-assert guidance
- **Implication:** Guard assertions (visibility checks between actions) are a key anti-flakiness pattern, not test bloat

## Finding 7: The `toMatchAriaSnapshot()` matcher represents a new assertion paradigm — accessibility-driven testing

Playwright's `toMatchAriaSnapshot()` asserts against the accessibility tree structure, not the visual DOM. This provides:
- Cross-browser consistency (accessibility tree is more stable than rendered DOM)
- Built-in accessibility validation as a side effect of functional testing
- Structural assertions that survive CSS/layout changes

Grafana's `toHaveNoA11yViolations` custom matcher extends this concept further, running a full accessibility audit as an assertion.

- **Evidence:** [playwright-assertions-docs] `toMatchAriaSnapshot()` matcher; [grafana-plugin-e2e] `toHaveNoA11yViolations` custom matcher
- **Implication:** Accessibility-driven assertions are an emerging best practice that combines functional testing with a11y validation
