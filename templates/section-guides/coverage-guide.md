# Coverage Strategy Guide

> Section guide for deciding what to test and how much. References: [coverage-standards.md](../../standards/coverage-standards.md) COV1.1-COV1.3, COV2.1-COV2.3, COV3.1-COV3.4, COV4.1-COV4.4, COV5.1-COV5.5.

---

## Purpose and Goals

Coverage strategy answers two questions: "What should we test at E2E?" and "How much is enough?" This guide provides decision frameworks for scoping E2E tests, structuring coverage tiers, growing a suite over time, and measuring coverage health. A well-planned coverage strategy:
- Defines E2E boundaries by user-facing workflows, not code lines
- Uses structural tiering (directories + projects), not priority tags
- Grows coverage in a consistent order starting with auth and core CRUD
- Measures health through structural completeness, not code coverage percentages

---

## Key Standards

### COV1 — E2E Testing Boundaries

**Decision Framework: Should this be an E2E test?**

```
Is the behavior user-visible?
  NO → Unit or integration test. Stop here.

  YES → Does it span multiple system components?
    NO → Component or integration test. Stop here.

    YES → Can it be fully verified at a lower test layer?
      YES → Test at the lower layer first. E2E only if lower layer is insufficient.
      NO → This belongs at E2E.
```

**E2E scope priority table** [COV1.2]:

| Priority | Category | Evidence | What to Test |
|---|---|---|---|
| **Must-have** | Authentication flows | 13/15 suites | Login, signup, logout, 2FA, session persistence |
| **Must-have** | Core CRUD on primary data type | 15/15 suites | Create, read, update, delete of the main entity |
| **Must-have** | Navigation and page rendering | 15/15 suites | Route loading, menus, breadcrumbs |
| **Must-have** | Form submissions | 14/15 suites | Critical form data entry, validation feedback |
| **Should-have** | Permission/role enforcement | 8/15 suites | Admin vs viewer, redirect on unauthorized |
| **Should-have** | Search and filtering | 9/15 suites | Query inputs, results, filter clearing |
| **Should-have** | Settings and preferences | 10/15 suites | User config changes that persist |
| **Rarely E2E** | Pure computation | 0/15 suites | Delegate to unit tests |
| **Rarely E2E** | Component rendering | 0/15 suites | Delegate to component tests |
| **Rarely E2E** | API contract validation | 0/15 suites | Delegate to API-level tests |

**Multi-layer E2E** [COV1.3]: When your product has both API and UI surfaces, maintain separate E2E layers. API layer provides breadth cheaply; UI layer validates critical visual workflows. Adopt multi-layer when: (a) product has distinct API and UI surfaces, (b) suite exceeds ~100 spec files, or (c) security-critical features require multi-client verification.

---

### COV2 — Coverage Tiers

**Use structural tiering, not tags** [COV2.1]. This is the universal production pattern: 11/15 suites use directory structure; 0/15 use priority tags as primary organization.

**Recommended four-tier structure:**

| Tier | Purpose | Time Budget | Content | Implementation |
|---|---|---|---|---|
| **Smoke** | Core health check | < 5 min | Auth + primary CRUD (5-10% of tests) | Dedicated `smoke/` directory or project |
| **Regression** | Feature-scoped | < 30 min | Feature directories (60-80% of tests) | `dashboards/`, `bookings/`, `workflows/` |
| **Comprehensive** | Full suite | < 2 hrs | All tests including cross-browser | Full config with all projects enabled |
| **Specialized** | Nightly/scheduled | Variable | Performance, accessibility, chaos | Separate CI workflows with cron triggers |

**Tags are valid only for cross-context execution control** [COV2.2]:

| Valid Tag Use | Example | When Needed |
|---|---|---|
| CI tier control | `@mergequeue` | Merge queue pipeline separate from PR CI |
| Browser exclusion | `@no-firefox` | Multi-browser suite with incompatible tests |
| Fixture modification | `@auth:none` | Tests needing different setup behavior |

13/15 production suites use zero tags. Do not introduce `@smoke` or `@critical` tags — use directories instead.

**Scale tier complexity to suite size** [COV2.3]:

| Suite Size | Strategy |
|---|---|
| < 50 tests | No tiering. Run everything on every PR. |
| 50-200 tests | Change detection gating. Optional smoke subset. |
| 200-500 tests | Structural tiering with sharding. Smoke + feature directories. |
| 500+ tests | Full tiered CI with merge queue differentiation. |

---

### COV3 — Growth Strategy

**Define Critical User Journeys (CUJs) as the coverage unit** [COV3.1]:

1. List the 5-10 workflows your product cannot function without
2. For each, define the end-to-end flow from entry to completion
3. Prioritize by: `Risk = Impact x Likelihood of Failure`

**Prioritize coverage growth in this order** [COV3.2]:

```
Phase 1 — Foundation (first 10-20 tests):
  1. Authentication (login, signup)         ← always first (13/15 suites)
  2. Core entity CRUD                       ← primary data type (15/15 suites)
  3. Navigation and routing                 ← pages load, menus work (15/15 suites)

Phase 2 — Core workflows (tests 20-50):
  4. Search and filtering
  5. Settings and configuration
  6. Permission enforcement

Phase 3 — Maturity (tests 50+):
  7. Import/export workflows
  8. Edge cases and error recovery
  9. Accessibility (axe-core scanning)
  10. Visual regression (screenshots)

Phase 4 — Specialized (100+ tests):
  11. Performance budgets
  12. Real-time/WebSocket interactions
  13. Encryption verification
  14. Chaos/resilience testing
```

**Choose a breadth-vs-depth strategy** [COV3.3]:

| Strategy | Description | Best For |
|---|---|---|
| **Broad-shallow** | Many features covered minimally (1-2 tests each) | Early-stage products, small teams |
| **Narrow-deep** | Core interactions tested exhaustively | Editors, libraries, single-core-interaction products |
| **Balanced** | Moderate breadth + deeper coverage on critical paths | Most web applications (recommended default) |

**Growth transition:** Start broad-shallow, then deepen critical paths as the suite matures.

**Infrastructure milestones** [COV3.4]:

| Milestone | Required Investment |
|---|---|
| 0-20 tests | Basic config, auth fixture, 1-2 page objects |
| 20-50 tests | Feature directories, shared fixtures, CI integration |
| 50-100 tests | Sharding, page object library, data management strategy |
| 100-200 tests | Structural tiering, change detection, fixture factories |
| 200-500 tests | Multi-project config, dedicated CI workflows, CUJ directory |
| 500+ tests | Full tier strategy, merge queue differentiation, coverage monitoring |

---

### COV4 — Negative Testing

**Target 80-90% happy-path, 10-20% error-path** at the E2E level. The cross-suite average is 85:15 [COV4.1].

**Negative testing checklist** — ranked by frequency [COV4.2]:

| Category | Priority | What to Test | Adoption |
|---|---|---|---|
| Permission enforcement | MUST | Unauthorized gets 401/403 or redirect; role limits enforced | 8/15 suites |
| Empty/error states | SHOULD | No results displayed correctly; disabled features show messaging | 6/15 suites |
| Input validation | SHOULD | Invalid inputs show errors; malformed data rejected | 5/15 suites |
| Conflict resolution | NICE TO HAVE | Concurrent operations handled; duplicates handled | 3/15 suites |
| Recovery flows | NICE TO HAVE | Password reset, backup restoration, undo/rollback | 3/15 suites |
| Network/infra errors | SPECIALIZED | Mocked network failures, deliberate failure injection | 2/15 suites |

**Use API-level tests for systematic error coverage** [COV4.3]:

```typescript
// API-level: systematic error coverage (fast, high coverage ratio)
const errorDto = {
  unauthorized: { message: 'Authentication required', statusCode: 401 },
  forbidden: { message: expect.any(String), statusCode: 403 },
  badRequest: (msg: string) => ({ message: msg, statusCode: 400 }),
};

// UI-level: route mocking for error state rendering
await page.route('/api/data', route =>
  route.fulfill({ status: 500, body: '{"error": "Server Error"}' })
);
await expect(page.getByText('Something went wrong')).toBeVisible();
```

**Maintain a regression test directory** for production incidents [COV4.4]:
1. Production incident occurs
2. Write minimal E2E test that reproduces the failure
3. Place in `regression/` directory or use clear naming (`issue-1234-description.spec.ts`)
4. Verify test fails against broken code, passes against fix
5. Test runs as part of standard suite going forward

---

### COV5 — Coverage Measurement

**Do NOT require code coverage percentages for E2E tests** [COV5.1]. 13/15 production suites have zero formal E2E coverage measurement. Code coverage is misleading for E2E: executing a line is not the same as verifying its behavior.

**Track coverage through structural completeness** [COV5.2]:

```
Coverage Health Assessment:

1. List all product feature areas
2. Map each to a test directory:
   tests/
     auth/           ✅ Covered
     dashboard/      ✅ Covered
     bookings/       ✅ Covered
     payments/       ❌ Gap — no test directory
     settings/       ✅ Covered
     admin/          ⚠️  Sparse — 1 file only

3. Identify gaps (features with no test directory)
4. Prioritize filling using COV3.2 growth order
```

**Coverage maturity model** [COV5.5]:

| Level | Name | Description | Adoption |
|---|---|---|---|
| 0 | None | No tracking of any kind | Very early suites only |
| 1 | Structural | Directory = feature coverage; gaps visible in file tree | 13/15 suites (universal floor) |
| 2 | Scenario tracking | Feature-to-scenario mapping alongside tests | 0/15 in practice; community-recommended |
| 3 | Quantitative | Code coverage collected on a schedule (weekly) | 1/15 suites (n8n weekly CI) |
| 4 | Integrated | E2E + unit coverage merged; coverage in PR review | 0/15 suites; experimental tooling only |

**Recommended progression:** Start at Level 1. Consider Level 2 only if test gaps cause production incidents. Consider Level 3 only if trend data is needed to justify E2E investment to stakeholders.

**If collecting code coverage, use weekly CI** [COV5.4]:

| Tool | Mechanism | Limitation |
|---|---|---|
| V8 Coverage API | Chromium DevTools Protocol | Chromium only |
| Istanbul instrumentation | Build-time code injection | Coverage lost on navigation |
| Monocart Reporter | V8 via Playwright reporter | Chromium only; auto shard merge |

---

## Code Examples

### Smoke Test Suite Structure

```typescript
// tests/smoke/auth.spec.ts — always in smoke tier
test('user can log in', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/dashboard');
});

// tests/smoke/core-crud.spec.ts — primary entity CRUD
test('user can create a project', async ({ authenticatedPage: page }) => {
  await page.goto('/projects/new');
  await page.getByLabel('Name').fill('Test Project');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Test Project')).toBeVisible();
});
```

### Feature Directory as Coverage Map

```
tests/
  smoke/                    # Tier 1: 5-10% of tests, <5 min
    auth.spec.ts
    core-crud.spec.ts
  auth/                     # Feature: authentication
    login.spec.ts
    signup.spec.ts
    password-reset.spec.ts
  dashboard/                # Feature: dashboards
    create.spec.ts
    edit.spec.ts
    share.spec.ts
  bookings/                 # Feature: bookings
    single.spec.ts
    recurring.spec.ts
    conflict.spec.ts        # Negative test for booking conflicts
  regression/               # Regression tests from production incidents
    issue-1234-double-booking.spec.ts
```

### Tag-Free Tier Selection in Config

```typescript
// playwright.config.ts — structural tiering via projects
export default defineConfig({
  projects: [
    {
      name: 'smoke',
      testDir: './tests/smoke',
      // Runs on every PR
    },
    {
      name: 'auth',
      testDir: './tests/auth',
      dependencies: ['setup'],
    },
    {
      name: 'dashboard',
      testDir: './tests/dashboard',
      dependencies: ['setup'],
    },
  ],
});
```

---

## Common Pitfalls

| Pitfall | Why It Fails | Fix | Standard |
|---|---|---|---|
| `@smoke` / `@critical` tags as primary tier | Tags rot without discipline; 0/15 suites use them | Use directories and projects | [COV2.1] |
| Code coverage percentage targets for E2E | Incentivizes broad shallow tests; misleading metric | Measure CUJ coverage instead | [COV5.1] |
| Testing business logic at E2E | Slow, fragile, duplicates unit test coverage | Delegate to unit tests | [COV1.1] |
| Skipping auth tests ("fixtures handle auth") | Auth flow itself needs dedicated E2E verification | Always test login/signup at E2E | [COV3.2] |
| 50% error-path coverage at UI E2E | No production suite achieves this | Target 85:15 ratio; use API tests for errors | [COV4.1] |
| Complex tiering for <200 tests | Overhead exceeds time saved | Run everything on every PR | [COV2.3] |
| External coverage spreadsheet | Drifts from reality | Directory structure IS the coverage map | [COV5.2] |

---

## When to Deviate

- **Single-layer E2E:** Acceptable when the product has only one user-facing surface and fewer than 100 spec files [COV1.3].
- **Running all tests on every PR:** This is what 11/15 production suites actually do. Tiering is an optimization, not a requirement [COV2.3].
- **Narrow-deep strategy:** Valid for products where core interaction correctness is paramount (editors, libraries) [COV3.3].
- **Scenario tracking (Level 2):** Optional structured enhancement; every production suite operates at Level 1 (structural completeness) [COV5.3].
- **Route mocking for negative testing:** Useful when API-level tests are not practical or for testing UI-specific error rendering [COV4.3].
