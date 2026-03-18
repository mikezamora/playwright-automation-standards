# Fixtures Guide

> Section guide for Playwright fixtures standards. References: [structure-standards.md](../../standards/structure-standards.md) S4.1-S4.5, [semantic-conventions.md](../../standards/semantic-conventions.md) N4.1-N4.3.

---

## Purpose and Goals

Fixtures are Playwright's dependency injection system. They replace `beforeEach`/`afterEach` hooks with typed, composable, lifecycle-managed setup. Well-designed fixtures:
- Provide typed interfaces for all shared test resources
- Guarantee cleanup via teardown (even on test failure)
- Enable scoping (test-level vs. worker-level) for resource lifecycle management
- Support composition via `mergeTests()` for domain segmentation

---

## Key Standards

### S4.1 Use `test.extend<T>()` for Custom Fixtures

All shared test setup SHOULD be implemented as typed fixtures. Custom fixtures are the primary maturity indicator separating basic from advanced suites (80% Gold suite adoption).

```typescript
type MyFixtures = {
  dashboardPage: DashboardPage;
  testOrg: Organization;
};

export const test = base.extend<MyFixtures>({
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  testOrg: async ({ request }, use) => {
    const org = await createOrg(request);
    await use(org);
    await deleteOrg(request, org.id);
  },
});
```

### S4.2 Fixture Scoping

| Scope | Lifecycle | Use For |
|---|---|---|
| **Test (default)** | Created/destroyed per test | Page objects, test-specific data |
| **Worker** | Created once per worker process | DB connections, auth state, API clients |
| **Auto (`{ auto: true }`)** | Runs without explicit dependency | Logging, metrics, screenshot capture |

**Decision rule:** Use a fixture (not a utility function) when:
1. Setup/teardown lifecycle matters
2. The resource is shared via scoping
3. Dependency injection ordering matters

### S4.3 Composition with `mergeTests()`

Large suites SHOULD compose fixtures from multiple domain-specific modules:

```typescript
import { test as dbTest } from './db-fixtures';
import { test as a11yTest } from './a11y-fixtures';
import { mergeTests } from '@playwright/test';

export const test = mergeTests(dbTest, a11yTest);
```

### S4.4 Authentication via storageState

Authentication SHOULD use dedicated setup projects that write `storageState` files:

```typescript
// auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.TEST_USER!);
  await page.getByLabel('Password').fill(process.env.TEST_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
```

### S4.5 Custom Matchers

Extend `expect` with domain-specific assertions when the same pattern repeats 3+ times:

```typescript
expect.extend({
  async toHaveAlert(page, message, options) {
    const alert = page.getByRole('alert');
    await expect(alert).toContainText(message, options);
    return { pass: true, message: () => '' };
  },
});
```

---

## Code Example: Complete Fixture File

```typescript
import { test as base, Page } from '@playwright/test';

type TestFixtures = {
  authenticatedPage: Page;
  testUser: { email: string; id: string };
};

type WorkerFixtures = {
  apiClient: { baseURL: string };
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Worker-scoped: created once per worker process [S4.2]
  apiClient: [async ({}, use) => {
    const baseURL = process.env.API_URL || 'http://localhost:3001';
    await use({ baseURL });
  }, { scope: 'worker' }],

  // Test-scoped: auth context per test [S4.4]
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // Test-scoped: data with guaranteed cleanup [S6.3]
  testUser: async ({ request }, use, workerInfo) => {
    const email = `test-${workerInfo.workerIndex}-${Date.now()}@example.com`;
    const resp = await request.post('/api/users', { data: { email } });
    const user = await resp.json();
    await use({ email, id: user.id });
    await request.delete(`/api/users/${user.id}`); // Guaranteed teardown
  },
});

export { expect } from '@playwright/test';
```

---

## Common Pitfalls

| Pitfall | Why It Fails | Fix |
|---|---|---|
| `beforeEach`/`afterEach` for shared setup | Weaker typing, no guaranteed cleanup on exceptions | `test.extend<T>()` fixtures [S4.1] |
| Worker-scoping page objects | Page objects depend on `Page` which is test-scoped | Use test scope (default) for POMs [S4.2] |
| Monolithic fixture file with 20+ fixtures | Hard to maintain and reason about | Domain-segmented fixtures + `mergeTests()` [S4.3] |
| Using `globalSetup` for auth | Loses report visibility, trace files, fixture access | Setup projects with `storageState` [S4.4] |
| No fixture types defined | Loses TypeScript autocomplete and type checking | Define interfaces for all fixture types [S4.1] |
| Factory fixtures named as nouns (`user`) | Ambiguous -- creates or provides? | Verb prefix: `createUser` [N4.3] |
| Relying on `afterEach` for cleanup | Not guaranteed on uncaught exceptions | Fixture teardown via `use()` callback [S6.3] |

---

## When to Deviate

- **Utility functions instead of fixtures:** When setup/teardown lifecycle does not matter and the resource is not shared. Simple helper functions are lighter weight [S4.2].
- **Auto fixture auth (PostHog pattern):** Moves auth from setup project to `{ auto: true }` fixture. Better `--ui` mode compatibility but less visible in reports [S4.4].
- **No `mergeTests()`:** Small suites (under 10 fixtures) do not need domain segmentation [S4.3].
- **Constructor-based POM:** `new DashboardPage(page)` in each test is acceptable for small suites where fixture overhead is not justified [N3.4].
