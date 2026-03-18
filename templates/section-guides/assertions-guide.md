# Assertions Guide

> Section guide for validation and assertion standards. References: [validation-standards.md](../../standards/validation-standards.md) V1.1-V1.5, V2.1-V2.5, V3.1-V3.3, V4.1-V4.4, V5.1-V5.3, V6.1-V6.4.

---

## Purpose and Goals

Assertions are the heart of test quality. Playwright's web-first assertions auto-retry until a condition is met, eliminating race conditions. Well-validated tests:
- Use web-first assertions as the default (never evaluate-then-assert)
- Place guard assertions between actions for synchronization
- Follow the five-mechanism retry hierarchy (implicit before explicit)
- Prevent flakiness via ESLint enforcement

---

## Key Standards

### V1.1 Web-First Assertions

All element assertions MUST use auto-retrying web-first assertions.

```typescript
// Correct: auto-retries until visible or timeout
await expect(locator).toBeVisible();

// Wrong: evaluates once, race condition
expect(await locator.isVisible()).toBe(true);
```

**Most-used matchers (by frequency):**
1. `toBeVisible()` / `toBeHidden()`
2. `toHaveText()` / `toContainText()`
3. `toHaveURL()`
4. `toBeEnabled()` / `toBeDisabled()`
5. `toHaveCount()`
6. `toHaveValue()`
7. `toHaveAttribute()` / `toHaveClass()`

### V1.2 Guard Assertions

Insert `await expect(locator).toBeVisible()` before interacting with elements to serve as synchronization points. This is the single most effective flakiness prevention technique (86% Gold suite adoption).

```typescript
await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
await page.getByRole('button', { name: 'Save' }).click();
await expect(page.getByText('Saved successfully')).toBeVisible();
```

### V2.1 Five-Mechanism Retry Hierarchy

Use the most implicit mechanism that handles your case:

| Level | Mechanism | When to Use |
|---|---|---|
| 1 | Actionability auto-wait | Default -- no code needed |
| 2 | Assertion auto-retry | Default -- use web-first matchers |
| 3 | `toPass()` block retry | Non-UI conditions, multi-step validation |
| 4 | `expect.poll()` polling | External API state, background tasks |
| 5 | Test-level retry | Infrastructure instability (last resort) |

### V3.1 Rely on Auto-Waiting

Playwright performs 6 actionability checks before every action. Do not add explicit waits.

```typescript
// Correct: just interact
await page.getByRole('button', { name: 'Submit' }).click();

// Wrong: redundant
await page.waitForSelector('button');
await page.click('button');
```

### V4.4 ESLint Enforcement

Configure `eslint-plugin-playwright` with critical rules:

| Rule | Prevents |
|---|---|
| `prefer-web-first-assertions` | Generic assertions on async state |
| `no-wait-for-timeout` | Arbitrary delays |
| `no-wait-for-selector` | Redundant explicit waits |
| `missing-playwright-await` | Silent pass from un-awaited assertions |
| `no-force-option` | Bypassing actionability checks |

---

## Code Examples

### Basic Assertions

```typescript
test('should show dashboard after login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('listitem')).toHaveCount(5);
});
```

### API Two-Layer Validation (V1.5)

```typescript
test('should create a user via API', async ({ request }) => {
  const response = await request.post('/api/users', {
    data: { name: 'Test User', email: 'test@example.com' },
  });

  // Layer 1: Status assertion
  await expect(response).toBeOK();

  // Layer 2: Body assertion
  const body = await response.json();
  expect(body.id).toBeDefined();
  expect(body.name).toBe('Test User');
});
```

### `toPass()` for Complex Scenarios (V2.1)

```typescript
test('should eventually process background job', async ({ page }) => {
  await expect(async () => {
    await page.reload();
    await expect(page.getByText('Processing complete')).toBeVisible();
  }).toPass({
    intervals: [1_000, 2_000, 5_000],
    timeout: 30_000,
  });
});
```

### Event-Based Waits (V3.2)

```typescript
test('should save and receive API response', async ({ page }) => {
  const [response] = await Promise.all([
    page.waitForResponse(resp =>
      resp.url().includes('/api/save') && resp.status() === 200
    ),
    page.getByRole('button', { name: 'Save' }).click(),
  ]);
  const body = await response.json();
  expect(body.success).toBe(true);
});
```

### Network Determinism with `page.route()` (V5.1)

```typescript
test('should display users from mocked API', async ({ page }) => {
  await page.route('**/api/users', route =>
    route.fulfill({ json: [{ id: 1, name: 'Mock User' }] })
  );
  await page.goto('/users');
  await expect(page.getByText('Mock User')).toBeVisible();
});
```

---

## Common Pitfalls

| Pitfall | Why It Fails | Fix |
|---|---|---|
| `expect(await el.isVisible()).toBe(true)` | Evaluates once, no retry | `await expect(el).toBeVisible()` [V1.1] |
| `page.waitForTimeout(1000)` | Arbitrary delay, flaky | Web-first assertion or event-based wait [V3.3] |
| `page.waitForSelector()` | Redundant with auto-waiting | Remove it [V3.1] |
| Clicking without guard assertion | Element may not be ready | Add `toBeVisible()` before click [V1.2] |
| Registering `waitForResponse` after action | Response may arrive first | Use `Promise.all([wait, click])` [V3.2] |
| `expect.soft()` everywhere | Masks root causes | Default to hard assertions [V1.4] |
| Only asserting API status code | Missing body shape validation | Two-layer approach [V1.5] |
| Test retries as first solution | Hides flakiness | Exhaust implicit retry mechanisms first [V2.1] |
| No ESLint rules | Five categories of flakiness go undetected | Configure `eslint-plugin-playwright` [V4.4] |

---

## When to Deviate

- **`expect.soft()` for forms:** Valid when testing all validation messages appear simultaneously [V1.4].
- **`test.slow()` for legitimate slow tests:** Triples the timeout; clearer than `test.setTimeout(90_000)` [V4.3].
- **Higher retries for infrastructure-heavy apps:** Immich uses 4 retries (Docker + multi-service). Match retries to infrastructure complexity [V2.2].
- **HAR replay:** `page.routeFromHAR()` is simpler to set up than manual route mocking but less stable for APIs with dynamic data [V5.1].
- **Live backend tests:** Acceptable when you need to validate real integration behavior. Use `page.route()` only when determinism is required [V5.1].
