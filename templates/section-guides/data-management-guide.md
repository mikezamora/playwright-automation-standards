# Data Management Guide

> Section guide for test data management standards. References: [structure-standards.md](../../standards/structure-standards.md) S6.1-S6.4, [validation-standards.md](../../standards/validation-standards.md) V6.1-V6.4.

---

## Purpose and Goals

Test data management determines whether tests are reliable, isolated, and parallelizable. Well-managed test data:
- Is created via API or database, not through the UI
- Uses factory functions with sensible defaults and overrides
- Guarantees cleanup via fixture teardown
- Avoids conflicts between parallel workers via unique identifiers

---

## Key Standards

### S6.1 Create Test Data via API, Not UI

UI interactions for data setup are slow, flaky, and couple data creation to UI implementation.

```typescript
// Correct: API-based data creation
const response = await request.post('/api/users', {
  data: { name: 'Test User', email: 'test@example.com' },
});
const user = await response.json();

// Wrong: UI-based data creation
await page.goto('/admin/users/new');
await page.fill('#name', 'Test User');
await page.click('#save');
```

### S6.2 Factory Functions

Generate test data via factory functions with sensible defaults:

```typescript
// Simple factory
function createUser(overrides?: Partial<User>): User {
  return {
    name: `Test User ${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
    role: 'viewer',
    ...overrides,
  };
}

// DTO factory (Immich pattern)
const userDto = createUserDto.create({ role: 'admin' });

// Scenario composition (Cal.com pattern)
const booking = await users.create(opts, {
  hasTeam: true,
  teammates: 2,
  schedulingType: 'roundRobin',
});
```

### S6.3 Fixture Teardown for Cleanup

Every test that creates data MUST clean it up via fixture teardown. Code after `await use(resource)` runs as teardown even on failure.

```typescript
testOrg: async ({ request }, use) => {
  const resp = await request.post('/api/orgs', {
    data: { name: `Test Org ${Date.now()}` },
  });
  const org = await resp.json();
  await use(org);                              // Test runs here
  await request.delete(`/api/orgs/${org.id}`); // Guaranteed cleanup
},
```

### S6.4 Worker Isolation for Parallel Safety

Each worker SHOULD create unique, non-conflicting data:

```typescript
testUser: async ({ request }, use, workerInfo) => {
  const email = `test-user-${workerInfo.workerIndex}-${Date.now()}@example.com`;
  const resp = await request.post('/api/users', { data: { email } });
  const user = await resp.json();
  await use(user);
  await request.delete(`/api/users/${user.id}`);
},
```

### V6.1 Three-Layer Test Isolation Model

| Layer | Scope | Mechanism | Responsibility |
|---|---|---|---|
| 1. Browser context | Automatic | Fresh cookies, localStorage per test | Playwright |
| 2. Application state | Manual | Fixture-based API cleanup | Test author |
| 3. Infrastructure | CI | Fresh Docker containers, DB migration | CI pipeline |

---

## Code Example: Complete Data Management

```typescript
import { test as base } from '@playwright/test';

interface TestData {
  org: { id: string; name: string };
  user: { id: string; email: string };
}

export const test = base.extend<TestData>({
  org: async ({ request }, use, workerInfo) => {
    const name = `Org-${workerInfo.workerIndex}-${Date.now()}`;
    const resp = await request.post('/api/orgs', { data: { name } });
    const org = await resp.json();
    await use(org);
    await request.delete(`/api/orgs/${org.id}`);
  },

  user: async ({ request, org }, use, workerInfo) => {
    const email = `user-${workerInfo.workerIndex}-${Date.now()}@test.com`;
    const resp = await request.post('/api/users', {
      data: { email, orgId: org.id },
    });
    const user = await resp.json();
    await use(user);
    await request.delete(`/api/users/${user.id}`);
    // Note: org cleanup happens in its own fixture teardown
  },
});
```

### Database Seeding Strategy

| Strategy | When to Use | Example |
|---|---|---|
| Migration + seed | Shared baseline (users, config) | Cal.com (Prisma), freeCodeCamp |
| Docker Compose pre-seeded | Complex multi-service backend | Immich |
| API-based per-test | Test-specific dynamic data | Grafana |

---

## Common Pitfalls

| Pitfall | Why It Fails | Fix |
|---|---|---|
| Creating data via UI navigation | Slow, flaky, couples data to UI | API calls or direct DB operations [S6.1] |
| Hardcoded test data (magic strings) | Fails in parallel execution | Factory functions with unique data [S6.2] |
| Shared test accounts across workers | Auth conflicts and data races | `workerInfo.workerIndex` in identifiers [S6.4] |
| `afterEach` for cleanup | Not guaranteed on uncaught exceptions | Fixture teardown via `use()` callback [S6.3] |
| Tests relying on data from other tests | Hidden inter-test dependencies | Each test creates its own data [V6.3] |
| No cleanup at all | Test data accumulates, causes conflicts | Fixture teardown is mandatory [S6.3] |
| Shared mutable state without namespacing | Workers corrupt each other's data | Unique identifiers per worker [S6.4] |

---

## When to Deviate

- **Shared seed data:** Acceptable for read-only baseline data (reference tables, config). Only test-specific data needs per-test creation and cleanup [V6.3].
- **No API available:** When the application has no API endpoints, use Prisma/Knex/direct DB operations in fixtures. Cal.com uses `prisma.$transaction()` [S6.3].
- **CMS/configurable-schema apps:** Need two-level factories: (1) schema/type factories and (2) entry/record factories. Delete entries before types [S6.2].
- **Transactional cleanup:** Cal.com wraps cleanup in `prisma.$transaction()` with dependency-ordered deletes. More reliable than sequential API calls [S6.3].
