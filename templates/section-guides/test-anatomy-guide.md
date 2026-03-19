# Test Anatomy Guide

> Section guide for structuring individual tests for readability and maintainability. References: [test-anatomy-standards.md](../../standards/test-anatomy-standards.md) TA1.1-TA1.3, TA2.1-TA2.4, TA3.1-TA3.3, TA4.1-TA4.4, TA5.1-TA5.6, TA6.1-TA6.5.

---

## Purpose and Goals

Well-structured tests are easier to read, debug, and maintain. This guide covers how to organize the interior of a test — from the Arrange-Act-Assert pattern to setup placement, assertion ordering, and test independence. A well-structured test:
- Follows the AAA pattern as a conceptual framework (not a rigid rule)
- Stays under 30 lines by investing in fixtures
- Uses `test.step()` only for CUJ tests exceeding 50 lines
- Places setup in the right tier (inline, `beforeEach`, fixture, or factory)
- Contains 2-8 assertions ordered by navigation-state-interaction-outcome

---

## Key Standards

### TA1 — Arrange-Act-Assert Pattern

Every test SHOULD follow AAA as its organizing principle. The three phases should be identifiable, even when they interleave in multi-step flows.

```typescript
// SIMPLE TEST: Strict AAA (single interaction)
test('should display welcome message', async ({ dashboardPage }) => {
  // Arrange — handled by fixture (dashboardPage is authenticated and loaded)

  // Act
  await dashboardPage.selectTimeRange('Last 6 hours');

  // Assert
  await expect(dashboardPage.welcomeBanner).toContainText('6 hours');
});
```

For multi-step flows, interleaved Act-Assert is the dominant production pattern (12/15 suites). Each action gets its own assertion before proceeding [TA1.2].

```typescript
// MULTI-STEP FLOW: Interleaved Act-Assert
test('create and publish blog post', async ({ page, editor }) => {
  // Arrange (via fixture: editor is authenticated)

  // Act-Assert 1: Create draft
  await editor.createPost({ title: 'My Post', body: 'Hello world' });
  await expect(page.getByText('Draft saved')).toBeVisible();

  // Act-Assert 2: Publish
  await editor.publishPost();
  await expect(page.getByText('Published')).toBeVisible();

  // Act-Assert 3: Verify on public site
  await page.goto('/blog/my-post');
  await expect(page.getByRole('heading', { name: 'My Post' })).toBeVisible();
});
```

**Key insight:** Fixture-driven Arrange produces the cleanest tests. When fixtures handle all arrangement, the test body starts directly at Act [TA1.3]. Ghost CMS achieves exemplary AAA with tests averaging 10-20 lines by investing heavily in fixtures and data factories.

---

### TA2 — Single Responsibility & Test Length

Tests SHOULD be under 30 lines. Tests exceeding 50 lines deserve examination for splitting. Tests exceeding 80 lines MUST have a documented justification [TA2.1].

**Test length correlates with fixture investment:**

| Fixture Investment | Suite Examples | Avg Test Length |
|---|---|---|
| Deep (factory + fixtures) | Ghost CMS, n8n, Grafana plugin-e2e | 10-20 lines |
| Moderate (fixtures + hooks) | Cal.com, Supabase | 25-40 lines |
| Shallow (hooks only) | Rocket.Chat, freeCodeCamp | 30-80 lines |

### Decision Framework: When to Split vs Bundle [TA2.3]

| Factor | Split Into Separate Tests | Bundle Into One Test |
|---|---|---|
| Setup cost | Cheap (fixture-driven) | Expensive (multi-service, slow API) |
| State dependency | Each verification is independent | Later checks depend on earlier actions |
| Failure diagnosis | Each behavior needs independent signal | Failures are tightly correlated |
| Parallelization | Tests can run in parallel | Sequential steps cannot parallelize |
| Test length | Combined test would exceed 50 lines | Combined test stays under 30 lines |

**Rule of thumb:** When in doubt, split. Short focused tests are easier to maintain, and fixture investment makes splitting increasingly cheap over time.

### Tests-Per-File Guidelines [TA2.4]

| Range | Guidance | Evidence |
|---|---|---|
| 1-2 tests/file | Acceptable for focused component tests | Slate (1.6 avg) |
| 3-10 tests/file | Recommended range for feature-scoped files | Cal.com, Grafana, n8n |
| 10-15 tests/file | Examine for sub-feature splitting | Immich API, Supabase |
| 15+ tests/file | Split by sub-feature | Anti-pattern (Supabase filter-bar: 39) |

---

### TA3 — When to Use `test.step()`

`test.step()` is a CUJ-specific tool, not a general-purpose organizer. Only 3/15 suites use it, and adoption within those suites is below 20% of files [TA3.1].

### Decision Framework: `test.step()` vs Separate Tests [TA3.2]

Use `test.step()` ONLY when ALL of the following are true:
1. Steps are sequentially dependent (step 2 requires state from step 1)
2. Repeating earlier setup per test is prohibitively expensive
3. The combined test validates an end-to-end journey (CUJ)

Otherwise, prefer separate tests.

```typescript
// CORRECT: test.step() in a CUJ test (>50 lines, sequential phases)
test('full dashboard user journey', async ({ dashboardPage, page }) => {
  await test.step('Load dashboard and verify panels', async () => {
    await dashboardPage.goto();
    await expect(dashboardPage.panel('CPU')).toBeVisible();
    await expect(dashboardPage.panel('Memory')).toBeVisible();
  });

  await test.step('Apply time range filter', async () => {
    await dashboardPage.timeRange.set('Last 6 hours');
    await expect(dashboardPage.panel('CPU')).toContainText('6h');
  });

  await test.step('Drill into panel detail', async () => {
    await dashboardPage.panel('CPU').click();
    await expect(page.getByTestId('panel-inspect')).toBeVisible();
  });
});
```

**Alternatives to `test.step()` that 12/15 suites use successfully:**

| Alternative | When to Use | Suites |
|---|---|---|
| Short focused tests | Default approach | All 15 suites |
| Nested `describe` blocks | Feature/sub-feature grouping | 7/15 suites |
| Flat file-per-feature | File boundary as organizational unit | 4/15 suites |
| Parametric tests (`describe.each`) | Data-driven variations | 2/15 suites |

---

### TA4 — Setup Placement Decision Tree

Choose setup placement from five tiers, matching setup complexity to product complexity [TA4.1].

```
Is the app stateless (no auth, no data)?
  YES → Tier 1: Inline navigation
        beforeEach(() => page.goto('/example'))

  NO → Does the app have auth?
    NO → Tier 2: Component render + state reset
         beforeEach(() => { resetState(); render(); })

    YES → Is the data setup simple (seed scripts)?
      YES → Tier 3: Global auth + seed scripts
            Global setup creates users; execSync reseeds DB

      NO → Does the app have REST APIs for resource creation?
        YES → Tier 4: API-based CRUD in hooks
              beforeAll creates via API; afterAll deletes

        NO → Tier 5: Rich fixture composition
             15+ custom fixtures handle all setup and teardown
```

**Key rules:**
- Setup used across multiple files SHOULD be a fixture (`test.extend<T>()`), not `beforeEach` in a shared helper [TA4.2]
- `beforeAll` is ONLY for expensive shared read-only resources [TA4.3]
- Every setup mechanism MUST have a corresponding cleanup mechanism [TA4.4]

```typescript
// RECOMMENDED: Fixture for cross-file shared setup
const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('/dashboard');
    await use(page);
    // Cleanup handled by fixture teardown
  },
});

// ACCEPTABLE: beforeEach for file-specific navigation
test.beforeEach(async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard/panels');
});
```

**Cleanup patterns by tier:**

| Cleanup Pattern | When to Use |
|---|---|
| Fixture teardown (after `use()`) | Fixture-driven setup (Tier 5) |
| `afterAll` API cleanup | `beforeAll` shared resources (Tier 4) |
| Database reseed | Global seed scripts (Tier 3) |
| Container reset per worker | Container-per-worker isolation (Tier 5) |
| No cleanup needed | Stateless tests (Tiers 1-2) |

---

### TA5 — Assertion Patterns

**Target 2-8 assertions per standard test.** Scale assertion density by test archetype, not by a fixed rule [TA5.1-TA5.2].

| Test Archetype | Typical Density |
|---|---|
| Smoke / auth check | 1-2 |
| Visual regression | 1-2 |
| Single interaction | 2-4 |
| CRUD operation | 3-5 |
| Complex workflow | 5-8 |
| CUJ / journey test | 10-20+ |

**Assertion ordering** — follow the natural sequence [TA5.4]:
1. Navigation confirmation (if needed beyond auto-waiting)
2. Initial state verification
3. Interaction (user action)
4. Outcome verification

```typescript
test('apply filter and verify results', async ({ dashboardPage }) => {
  // 1. Initial state
  await expect(dashboardPage.resultCount).toContainText('100 items');

  // 2. Interaction
  await dashboardPage.filterBy('status', 'Active');

  // 3. Outcome
  await expect(dashboardPage.resultCount).toContainText('42 items');
  await expect(dashboardPage.filterChip).toContainText('Active');
});
```

**`expect.soft()` — reserved for CUJ tests only** [TA5.5]:

```typescript
// Soft assertions for checkpoint verification in CUJ tests
await test.step('Verify all panels loaded', async () => {
  await expect.soft(dashboardPage.panel('CPU')).toBeVisible();
  await expect.soft(dashboardPage.panel('Memory')).toBeVisible();
  await expect.soft(dashboardPage.panel('Disk')).toBeVisible();
});

// Hard assertion for critical precondition
await expect(dashboardPage.timeRange.display).toContainText('6 hours');
```

**Web-first assertions are mandatory** — never use `expect(await locator.isVisible()).toBe(true)` [TA5.6].

---

### TA6 — Test Independence & Determinism

Every test MUST be runnable in isolation and in any order [TA6.1]. 14/15 analyzed suites achieve complete test independence.

**Rules:**
- Avoid `test.describe.serial` for state sharing (only 1/15 suites uses it) [TA6.2]
- Constrain `describe` nesting to a maximum depth of 2 [TA6.5]
- Use seeded randoms for reproducibility [TA6.4]
- Use unique identifiers (not hardcoded names) for parallel safety [TA6.4]

```typescript
// Unique names for parallel-safe data creation
test('create project', async ({ page }) => {
  const name = `test-project-${Date.now()}-${test.info().parallelIndex}`;
  await page.getByLabel('Project name').fill(name);
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText(name)).toBeVisible();
});

// Explicit feature toggle declaration
test.describe('New editor', () => {
  test.use({ featureToggles: { newEditor: true } });
  test('shows toolbar', async ({ page }) => {
    await expect(page.getByTestId('new-editor-toolbar')).toBeVisible();
  });
});
```

---

## Common Mistakes

| Mistake | Why It Fails | Fix | Standard |
|---|---|---|---|
| All assertions at the end of multi-step flow | Assertion far from the action that caused the state; hard to debug | Interleave Act-Assert per step | [TA1.2] |
| Tests over 100 lines without `test.step()` | Hard to debug; unclear which phase failed | Add steps to CUJs, or split into focused tests | [TA3.1] |
| `test.step()` in tests under 30 lines | Adds noise without organizational benefit | Remove steps; rely on natural Act-Assert rhythm | [TA3.1] |
| `beforeEach` in shared helper imported across files | Fixture in disguise with worse ergonomics | Convert to `test.extend<T>()` | [TA4.2] |
| `beforeAll` for mutable shared resources | Creates hidden inter-test dependencies | Use per-test fixtures or `beforeEach` | [TA4.3] |
| Hardcoded test data names (`'Test Project'`) | Collisions when tests run in parallel | Use `Date.now()` + `parallelIndex` | [TA6.4] |
| `Math.random()` without seeding | Non-reproducible failures | Use seeded random generator | [TA6.4] |
| `test.describe.serial` for state sharing | Cascading failures; prevents parallelism | Invest in per-test isolation | [TA6.2] |
| `describe` nesting 3+ levels deep | Hard to scan; excessive indentation | Use directory structure instead | [TA6.5] |
| "One assertion per test" dogma | Does not transfer from unit to E2E context | Target 2-8 assertions per standard test | [TA5.1] |

---

## When to Deviate

- **Fewer-longer-tests philosophy:** Acceptable when setup is expensive and additional assertions verify tightly coupled state changes (6/15 suites follow this) [TA2.3].
- **Flat file-per-feature with no `describe` blocks:** Valid organizational pattern (AFFiNE) where file boundaries serve as the unit [TA6.5].
- **Higher `describe` nesting for data-driven tests:** `describe.each` patterns justify depth 3-4 when the nesting is data-driven, not organizational [TA6.5].
- **Inline setup in single-file tests:** `beforeEach` is fine for setup used only within one file [TA4.2].
- **Guard assertions on complex pages:** Explicit guard assertions are justified when initial state is ambiguous after complex navigation [TA5.3].
