# Test Anatomy Standards

> **DRAFT** — based on research rounds 56-67, covering 15+ suites (10 Gold, 5 new large-scale).
> Each standard includes evidence citations, code examples, valid alternatives, and anti-patterns.

---

## TA1. Arrange-Act-Assert Pattern

### TA1.1 Use AAA as the conceptual framework for every test

- Every test SHOULD follow the Arrange-Act-Assert pattern as its organizing principle
- AAA is a **conceptual framework**, not a rigid structural rule: the test author should be able to point to where arrangement, action, and assertion happen, even when they interleave
- **Rationale:** AAA provides a shared vocabulary for reviewing and reasoning about tests. When a test's phases are identifiable, reviewers can quickly assess whether setup is sufficient, actions are realistic, and assertions are meaningful.
- **Evidence:** 15/15 suites exhibit AAA as the dominant test structure at varying degrees of adherence [grafana-e2e, calcom-e2e, affine-e2e, immich-e2e, freecodecamp-e2e, excalidraw-e2e, slate-e2e, supabase-e2e, nextjs-e2e, grafana-plugin-e2e, gutenberg-e2e, n8n-e2e, rocketchat-e2e, ghost-e2e, element-web-e2e]
- **Compliance rates by test length:**
  - Tests under 15 lines: ~90% strict AAA compliance [slate-e2e avg 8 lines, grafana-plugin-e2e avg 12-15 lines]
  - Tests 15-40 lines: ~75% strict AAA compliance (majority of suites' average range)
  - Tests over 40 lines: ~60% strict AAA compliance [supabase-e2e filter-bar at 180 lines, grafana-e2e CUJ at 170 lines]
- **Anti-pattern:** Treating AAA as a literal "all assertions must be at the end" rule — this leads to artificially batching assertions after complex multi-step flows, producing tests that are harder to debug because the assertion is far from the action that produced the state

### TA1.2 Accept interleaved Act-Assert in multi-step flows

- Tests covering multi-step user flows MAY interleave action and assertion phases
- Each Act-Assert pair SHOULD verify the outcome of its corresponding action before proceeding
- **Rationale:** In E2E tests, each user interaction produces a verifiable state change. Asserting after each action catches failures at the exact step where they occur, rather than at the end of a long sequence.
- **Evidence:** Interleaved Act-Assert is the dominant pattern in 12/15 suites [grafana-e2e, calcom-e2e, affine-e2e, freecodecamp-e2e, supabase-e2e, excalidraw-e2e, gutenberg-e2e, n8n-e2e, rocketchat-e2e, ghost-e2e, element-web-e2e, immich-e2e]

```typescript
// RECOMMENDED: Interleaved Act-Assert for multi-step flow
test('create and publish blog post', async ({ page, editor }) => {
  // Arrange (via fixture: editor is pre-authenticated and on dashboard)

  // Act-Assert 1: Create draft
  await editor.createPost({ title: 'My Post', body: 'Content here' });
  await expect(page.getByText('Draft saved')).toBeVisible();

  // Act-Assert 2: Publish
  await editor.publishPost();
  await expect(page.getByText('Published')).toBeVisible();

  // Act-Assert 3: Verify on public site
  await page.goto('/blog/my-post');
  await expect(page.getByRole('heading', { name: 'My Post' })).toBeVisible();
});
```

- **Valid alternative:** Strict AAA with all assertions at the end — acceptable for short single-interaction tests (under 15 lines) where a single action produces all verifiable outcomes
- **Anti-pattern:** Multi-step flow with assertions only at the end — when the test fails, the error message says "expected Published to be visible" but the actual failure happened three steps earlier during post creation

### TA1.3 Use fixture-driven Arrange for clean phase separation

- The Arrange phase SHOULD be handled by fixtures rather than inline setup code
- When fixtures handle all arrangement, the test body starts directly at the Act phase — this is clean separation, not missing Arrange
- **Rationale:** Fixture-driven arrangement eliminates duplication across tests, guarantees cleanup via the fixture teardown, and produces shorter test bodies with clear Act-Assert structure.
- **Evidence:** 8/15 suites achieve the cleanest AAA separation through fixture-driven Arrange [grafana-plugin-e2e (25+ fixtures eliminate all setup code — cleanest observed), calcom-e2e (15 custom fixtures), ghost-e2e (data factory + env manager), n8n-e2e (container fixtures), affine-e2e, supabase-e2e, element-web-e2e, nextjs-e2e]
- **Strongest example:** Ghost CMS achieves "exemplary" AAA in tests averaging only 10-20 lines, confirming that heavy fixture/factory investment produces both short tests AND clean AAA structure.

```typescript
// RECOMMENDED: Fixture-driven Arrange — the test body is pure Act-Assert
test('panel displays data after time range change', async ({
  dashboardPage,     // Fixture: navigates to dashboard, waits for load
  timeRangePicker,   // Fixture: provides time range controls
}) => {
  // Act
  await timeRangePicker.setRange('Last 6 hours');

  // Assert
  await expect(dashboardPage.panel.getByTitle('CPU Usage')).toContainText('6h');
});
```

- **Anti-pattern:** Duplicating arrangement inline across tests when a fixture could encapsulate it — this inflates test length, reduces AAA clarity, and creates maintenance burden when setup requirements change

---

## TA2. Single Responsibility

### TA2.1 Prefer short focused tests under 30 lines

- Tests SHOULD be under 30 lines of test body code (excluding blank lines and comments)
- Tests exceeding 50 lines SHOULD be examined for splitting opportunities
- Tests exceeding 80 lines MUST have a documented justification (e.g., CUJ coverage)
- **Rationale:** Short tests have higher AAA compliance (~90% under 15 lines vs ~60% over 40 lines), produce clearer failure messages, run faster in isolation, and are easier to review.
- **Evidence:** 9/15 suites follow the many-short-tests philosophy, averaging under 30 lines per test [affine-e2e, excalidraw-e2e, ghost-e2e, grafana-plugin-e2e, immich-e2e, n8n-e2e, nextjs-e2e, slate-e2e, freecodecamp-e2e]

| Suite | Short (<15 lines) | Medium (15-40) | Long (40-80) | Very Long (80+) | Average |
|-------|-------------------|----------------|--------------|-----------------|---------|
| Slate | 70% | 25% | 5% | 0% | ~8 lines |
| Grafana plugin-e2e | 50% | 40% | 10% | 0% | ~12-15 lines |
| Ghost CMS | 60% | 35% | 5% | 0% | ~10-20 lines |
| n8n | 40% | 50% | 10% | 0% | ~10-30 lines |
| Grafana | 15% | 45% | 25% | 15% | ~45 lines |
| Supabase | 15% | 40% | 30% | 15% | ~40 lines |

- **Valid alternative:** Fewer-longer-tests philosophy — 6/15 suites bundle multiple related assertions into comprehensive scenario tests averaging 35-60 lines [calcom-e2e, grafana-e2e, gutenberg-e2e, rocketchat-e2e, supabase-e2e, element-web-e2e]. This is acceptable when the additional assertions verify tightly coupled state changes that would require expensive re-setup if split.
- **Anti-pattern:** Tests exceeding 100 lines without `test.step()` structure — observed in supabase-e2e filter-bar (180 lines) and grafana-e2e CUJ tests (170 lines); these become difficult to debug when failures occur mid-test

### TA2.2 Invest in fixtures to enable short tests

- Fixture investment is the strongest predictor of test length and quality
- Suites that invest in rich fixtures produce shorter, more focused, higher-quality tests
- **Rationale:** Without fixtures, each test must perform its own setup inline, inflating test bodies and obscuring the core behavior being tested. Fixtures externalize setup, making short focused tests practical.
- **Evidence:** Strong inverse correlation between fixture investment and test length confirmed across all 15 suites:
  - Ghost CMS (data factory + env manager) → average 10-20 lines per test
  - n8n (container fixtures + composite `fromBlankCanvas()`) → average 10-30 lines per test
  - Grafana plugin-e2e (25+ fixtures) → average 12-15 lines per test
  - Suites with manual inline setup (freeCodeCamp with `execSync`, Grafana with API calls in `beforeAll`) → average 35-45 lines per test

```typescript
// WITHOUT fixture investment: 40+ lines of inline setup
test('verify dashboard panel data', async ({ page }) => {
  // Arrange — inline, verbose, duplicated across tests
  await page.goto('/login');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL('/dashboards');
  await page.goto('/d/abc123/my-dashboard');
  await expect(page.getByText('My Dashboard')).toBeVisible();

  // Act
  await page.getByLabel('Time range').click();
  await page.getByText('Last 6 hours').click();

  // Assert
  await expect(page.getByTestId('panel-cpu')).toContainText('6h');
});

// WITH fixture investment: 8 lines, pure Act-Assert
test('verify dashboard panel data', async ({ dashboardPage, timeRangePicker }) => {
  await timeRangePicker.setRange('Last 6 hours');
  await expect(dashboardPage.panel.getByTitle('CPU Usage')).toContainText('6h');
});
```

- **Anti-pattern:** Duplicating setup code across tests rather than investing in fixtures — this is a false economy that produces longer tests, slower review cycles, and higher maintenance costs

### TA2.3 Use a decision framework to determine when to bundle vs split tests

- Decide whether to bundle multiple verifications into one test or split them based on these criteria:

| Factor | Split Into Separate Tests | Bundle Into One Test |
|--------|--------------------------|---------------------|
| Setup cost | Setup is cheap (fixture-driven) | Setup is expensive (multi-service, slow API) |
| State dependency | Each verification is independent | Later checks depend on earlier actions |
| Failure diagnosis | Each behavior needs independent failure signal | Failures are tightly correlated |
| Parallelization | Tests can run in parallel for speed | Sequential steps cannot parallelize |
| Test length | Combined test would exceed 50 lines | Combined test stays under 30 lines |

- **Evidence:** The 9 suites following the many-short-tests philosophy all have strong fixture investment that makes setup cheap, enabling splitting. The 6 suites following the fewer-longer-tests philosophy face higher setup costs that incentivize bundling [calcom-e2e, grafana-e2e, gutenberg-e2e, rocketchat-e2e, supabase-e2e, element-web-e2e].
- **Rule of thumb:** When in doubt, split. Short focused tests are easier to maintain than long bundled tests, and fixture investment makes splitting increasingly cheap over time.

### TA2.4 Maintain consistent tests-per-file ratios

- Test files SHOULD contain 3-10 tests covering related behaviors of a single feature
- Files with more than 15 tests SHOULD be examined for splitting by sub-feature
- **Rationale:** Very small files (1-2 tests) create filesystem noise and overhead. Very large files (15+ tests) become hard to navigate and indicate the feature scope is too broad.
- **Evidence:**

| Range | Suites | Notes |
|-------|--------|-------|
| 1-2 tests/file | Slate (1.6 avg) | Acceptable for focused component tests |
| 3-5 tests/file | Cal.com, freeCodeCamp, Grafana, Gutenberg | Most common range |
| 5-10 tests/file | AFFiNE, Excalidraw (~9), Supabase (~9.8), Next.js | Acceptable for feature-dense modules |
| 10+ tests/file | Immich (API files), Supabase filter-bar (39 in one file) | Risk of monolithic test files |

- **Anti-pattern:** Monolithic test files with 30+ tests — Supabase's filter-bar file (39 tests, 180+ lines per test) is the most extreme example; it is difficult to navigate, slow to run, and produces noisy failure reports

---

## TA3. Test Step Usage

### TA3.1 Reserve `test.step()` for CUJ and long workflow tests

- `test.step()` SHOULD only be used in tests exceeding ~50 lines that cover multi-phase workflows or Critical User Journeys (CUJs)
- `test.step()` MUST NOT be used as a general-purpose test organization mechanism
- **Rationale:** `test.step()` is a CUJ-specific tool. The overwhelming production consensus is to write shorter tests rather than subdivide long tests with steps. Steps add value only when the test inherently cannot be split because the phases are sequentially dependent and the setup cost of repeating earlier phases is prohibitive.
- **Evidence:** Only 3/15 suites use `test.step()`, and adoption within those suites is below 20% of files:

| Suite | test.step() Usage | Context |
|-------|-------------------|---------|
| Grafana (main) | ~20% of files | CUJ tests only (dashboard-cujs) |
| Cal.com | ~10-15% of files | Booking/question management flows |
| Rocket.Chat | <5% | Personal Access Tokens test only |
| **12 other suites** | **0%** | Including Supabase (despite tests up to 180 lines) |

```typescript
// RECOMMENDED: test.step() in a CUJ test (>50 lines, sequential phases)
test('full dashboard user journey', async ({ dashboardPage, page }) => {
  await test.step('Load dashboard and verify panels', async () => {
    await dashboardPage.goto();
    await expect(dashboardPage.panel.getByTitle('CPU')).toBeVisible();
    await expect(dashboardPage.panel.getByTitle('Memory')).toBeVisible();
  });

  await test.step('Apply time range filter', async () => {
    await dashboardPage.timeRange.set('Last 6 hours');
    await expect(dashboardPage.panel.getByTitle('CPU')).toContainText('6h');
  });

  await test.step('Drill into panel detail', async () => {
    await dashboardPage.panel.getByTitle('CPU').click();
    await expect(page.getByTestId('panel-inspect')).toBeVisible();
  });
});
```

- **Anti-pattern:** Using `test.step()` in tests under 30 lines — the overhead of step boundaries adds noise without organizational benefit; prefer the natural Act-Assert rhythm of short tests

### TA3.2 Prefer splitting into separate tests over using `test.step()`

- When deciding between a single test with steps and multiple focused tests, prefer multiple focused tests
- Split unless all of the following are true: (a) steps are sequentially dependent, (b) repeating earlier setup per test is prohibitively expensive, (c) the combined test meaningfully validates an end-to-end journey
- **Rationale:** Separate tests run in parallel, produce independent failure signals, and are individually retryable. Stepped tests are monolithic: if step 2 fails, step 3 is skipped entirely.
- **Evidence:** 12/15 suites achieve complex test organization without `test.step()` using these alternatives:

| Alternative | Suites | Count |
|------------|--------|-------|
| Short focused tests (universal preference) | All 15 suites | 15/15 |
| Nested describe blocks (feature/sub-feature) | Immich, Excalidraw, Supabase, Grafana, freeCodeCamp, Next.js, Gutenberg | 7/15 |
| Flat file-per-feature (file boundary as unit) | AFFiNE, Slate, n8n, Ghost | 4/15 |
| Parametric tests (data-driven loops) | Next.js, Excalidraw | 2/15 |

- **Valid alternative:** `test.step()` for CUJ tests — when a test genuinely models an end-to-end user journey that cannot be decomposed without losing the journey-level validation, steps are the right tool
- **Anti-pattern:** Using `test.step()` to organize tests that could be independent — this couples unrelated verifications into a single test, creating cascading skips on failure and preventing parallel execution

### TA3.3 Use descriptive step names that communicate intent

- Step names SHOULD describe the user-visible action or business operation, not implementation details
- **Evidence:** Naming conventions diverge across suites:
  - Grafana: Numbered steps (`'1.Loads dashboard'`, `'2.Top level selectors'`, `'4.1 Set time range from'`)
  - Cal.com: Descriptive phrases (`'from session'`, `'Go to EventType Page'`)
  - Rocket.Chat: Action descriptions (`'Add token'`, `'Regenerate token'`)
- **Recommendation:** Use descriptive phrases. Numbered prefixes are acceptable for long CUJ tests where step ordering is critical.
- **Anti-pattern:** Implementation-detail step names (`'Click the button'`, `'Wait for API'`) — these provide no business context in failure reports

---

## TA4. Setup Placement

### TA4.1 Select setup placement based on a five-tier decision framework

- Choose setup placement from these five tiers, ordered from simplest to most complex:

| Tier | Setup Approach | When to Use | Example |
|------|---------------|-------------|---------|
| 1 | **Inline navigation** | Stateless apps, no auth, no data deps | `beforeEach(() => page.goto('/example'))` |
| 2 | **Component render + state reset** | Component-level testing, mocked deps | `beforeEach(() => { resetState(); render(); reseedRandom(); })` |
| 3 | **Global auth + seed scripts** | Apps with auth, moderate data needs | Global setup creates users; `execSync` reseeds DB per file |
| 4 | **API-based CRUD in hooks** | Apps with REST APIs, shared resources | `beforeAll` creates resources via API; `afterAll` deletes them |
| 5 | **Rich fixture composition** | Complex apps, multi-role, multi-service | 15+ custom fixtures handle users, bookings, emails, containers |

- **Rationale:** Over-engineering setup wastes effort; under-engineering creates flaky, entangled tests. Match setup complexity to product complexity.
- **Evidence:** Setup complexity correlates with product complexity across all 15 suites:
  - Tier 1: Slate (`beforeEach(page.goto('/example'))`) — no data, no auth, no cleanup
  - Tier 2: Excalidraw (`beforeEach` resets state, renders component, reseeds random)
  - Tier 3: freeCodeCamp (global setup creates users; `execSync` reseeds DB per file)
  - Tier 4: Grafana, Gutenberg (`beforeAll` creates resources via API; `afterAll` deletes them)
  - Tier 5: Cal.com (15+ custom fixtures), n8n (container fixtures), Ghost (data factory + env manager), Supabase (global auth + environment manager + per-test DB + async cleanup), Element Web (per-test bot-created rooms)

### TA4.2 Prefer fixtures over `beforeEach` for cross-file shared setup

- Setup that is used across multiple test files SHOULD be implemented as fixtures via `test.extend<T>()`
- Setup that is specific to a single test file MAY use `beforeEach`
- **Rationale:** Fixtures encapsulate setup AND teardown in the same place, are reusable across files without import gymnastics, execute on-demand (only when a test requests them), and compose via dependency injection.
- **Evidence:** 7/15 suites use custom fixtures as the dominant setup mechanism [calcom-e2e, grafana-plugin-e2e, n8n-e2e, ghost-e2e, element-web-e2e, affine-e2e, supabase-e2e]. 7/15 suites use `beforeEach` for file-specific navigation [slate-e2e, gutenberg-e2e, freecodecamp-e2e, rocketchat-e2e, supabase-e2e, calcom-e2e, excalidraw-e2e]. These overlap: suites commonly use fixtures for cross-file setup AND `beforeEach` for file-specific navigation.
- **Community consensus:** Playwright's own documentation states fixtures have advantages over hooks: encapsulate setup and teardown, reusable between test files, on-demand, and composable. The Semantive guide and Checkly both recommend fixtures over `beforeEach` for reusable setup.

```typescript
// RECOMMENDED: Fixture for cross-file shared setup
const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // Arrange: login once
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('/dashboard');

    // Provide to test
    await use(page);

    // Cleanup: handled automatically by fixture teardown
  },
});

// ACCEPTABLE: beforeEach for file-specific navigation
test.describe('Dashboard panels', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/my-panels');
  });

  test('displays CPU panel', async ({ authenticatedPage }) => { /* ... */ });
  test('displays memory panel', async ({ authenticatedPage }) => { /* ... */ });
});
```

- **Anti-pattern:** Using `beforeEach`/`afterEach` in a shared helper file imported across test files — this is a fixture in disguise with worse ergonomics. Convert to `test.extend<T>()`.

### TA4.3 Use `beforeAll` only for expensive shared read-only resources

- `beforeAll` SHOULD be reserved for creating expensive resources that multiple tests will read but not mutate
- Tests that write to shared `beforeAll` state MUST NOT run in parallel
- **Rationale:** `beforeAll` creates resources once per `describe` block, amortizing setup cost. But if tests mutate the shared resource, they become order-dependent and cannot parallelize.
- **Evidence:** 5/15 suites use `beforeAll` for shared resource creation [grafana-e2e, immich-e2e, rocketchat-e2e, freecodecamp-e2e, gutenberg-e2e]. In Grafana and Immich, tests read from shared dashboards/albums without modifying them. In Rocket.Chat, tests mutate shared channels — this creates ordering dependencies.

```typescript
// RECOMMENDED: beforeAll for read-only shared resources
test.describe('Dashboard viewer', () => {
  let dashboardUid: string;

  test.beforeAll(async ({ request }) => {
    // Create expensive resource once
    const response = await request.post('/api/dashboards/db', {
      data: { dashboard: { title: 'Test Dashboard', panels: [...] } }
    });
    dashboardUid = (await response.json()).uid;
  });

  test.afterAll(async ({ request }) => {
    await request.delete(`/api/dashboards/uid/${dashboardUid}`);
  });

  // Tests read from the shared dashboard — safe to parallelize
  test('displays panel titles', async ({ page }) => { /* navigate and assert */ });
  test('shows time range picker', async ({ page }) => { /* navigate and assert */ });
});
```

- **Anti-pattern:** Using `beforeAll` to create resources that tests will mutate (create, update, delete) — this creates hidden inter-test dependencies. Use per-test fixtures or `beforeEach` instead.

### TA4.4 Implement explicit cleanup that matches setup complexity

- Every setup mechanism MUST have a corresponding cleanup mechanism
- The cleanup mechanism SHOULD be colocated with setup (fixture teardown, `afterAll` paired with `beforeAll`)

| Cleanup Pattern | Suites Using | When to Use |
|----------------|-------------|-------------|
| Fixture teardown (after `use()`) | Cal.com, n8n, Ghost, Element Web | Fixture-driven setup (Tier 5) |
| `afterAll` API cleanup | Grafana, Immich, Gutenberg | `beforeAll` shared resource creation (Tier 4) |
| `afterEach` explicit cleanup | Cal.com (`users.deleteAll()`) | Per-test resource creation |
| Database reseed | freeCodeCamp (`execSync seed`), Immich (`utils.resetDatabase()`) | Global seed scripts (Tier 3) |
| Container reset per worker | n8n, Element Web | Container-per-worker isolation (Tier 5) |
| No cleanup needed | Slate, Excalidraw, Next.js | Stateless tests or fresh instances per suite |
| Async disposable (TC39) | Supabase (`withSetupCleanup`) | Advanced cleanup with `Symbol.asyncDispose` |

- **Evidence:** Cleanup pattern distribution across 15 suites shows strong correlation with setup tier — simpler setup tiers (1-2) need no cleanup, while complex setup tiers (4-5) require explicit cleanup mechanisms.
- **Anti-pattern:** Creating resources without cleanup — leads to state accumulation that eventually causes flaky tests as the database/environment fills with test artifacts

---

## TA5. Assertion Patterns

### TA5.1 Target 2-8 assertions per standard test

- Standard tests (non-CUJ) SHOULD contain 2-8 assertions
- Tests with a single assertion MAY indicate incomplete verification
- Tests with more than 8 assertions (outside CUJ context) SHOULD be examined for splitting
- **Rationale:** The cross-suite average is ~3-5 assertions per test (median ~4). Fewer than 2 assertions often means the test is a smoke check that does not verify meaningful behavior. More than 8 typically indicates the test is covering multiple behaviors.
- **Evidence:** Assertion density across 15 suites:

| Suite | Average | Range | Distribution |
|-------|---------|-------|-------------|
| n8n | ~2.5 | 1-6 | Tight cluster |
| Gutenberg | ~2.8 | 2-5 | Moderate spread |
| Slate | ~3.3 | 1-27 | Left skew (many 1-assertion tests) |
| Ghost CMS | ~3.8 | 2-8 | Tight cluster |
| Element Web | ~3.5 | 1-10 | Moderate cluster |
| Cal.com | ~5 | 1-20+ | Moderate spread |
| Excalidraw | ~5 | 1-25+ | Bimodal |
| Supabase | ~5 | 1-25 | Wide spread |
| Grafana (panels) | ~5.5 | 4-8 | Tight cluster |
| Grafana (CUJ) | ~15.5 | 10-20+ | CUJ-specific high density |

- **Cross-suite average (excluding CUJ): 3.2 assertions per test**
- **Anti-pattern:** "One assertion per test" dogma — this unit testing rule does not transfer to E2E tests, where each user interaction produces multiple verifiable state changes that should be checked together

### TA5.2 Scale assertion density by test archetype

- Assertion count SHOULD be determined by the test archetype, not by a fixed rule:

| Test Archetype | Typical Density | Rationale |
|---------------|----------------|-----------|
| Smoke / auth check | 1-2 | Single verification: page loads, user is logged in |
| Visual regression | 1-2 | Single screenshot comparison |
| Single interaction | 2-4 | Action + primary outcome + secondary state check |
| CRUD operation | 3-5 | Create -> verify -> modify -> re-verify |
| Complex workflow | 5-8 | Multi-step with intermediate checkpoint assertions |
| CUJ / journey test | 10-20+ | Full user flow with checkpoint assertions per step |

- **Evidence:** Confirmed across all 15 suites — assertion density correlates with test archetype, not quality. Higher counts are not inherently better [round-66 findings]. Ghost CMS (avg 3.8) and Grafana plugin-e2e (avg 2-3) are among the highest-quality suites with the lowest assertion counts, while Grafana CUJ tests (avg 15.5) legitimately require high density.
- **Anti-pattern:** Applying a uniform assertion count target across all test types — smoke tests with 8 assertions are over-specified; CUJ tests with 3 assertions are under-specified

### TA5.3 Rely on Playwright's auto-waiting; use explicit guard assertions only for ambiguous state transitions

- Tests SHOULD rely on Playwright's web-first assertions (`await expect(locator).toBeVisible()`) rather than explicit guard assertions for precondition checking
- Explicit guard assertions (assertions placed before the main action to verify preconditions) SHOULD only be used when the initial state is ambiguous after complex navigation or multi-step setup
- **Rationale:** Playwright's auto-waiting locator API implicitly guards preconditions — `await page.click('button')` will wait for the button to be visible, enabled, and stable before clicking. Adding explicit guard assertions for every precondition adds noise without value.
- **Evidence:** Only 2/15 suites use explicit guard assertions as a deliberate pattern:
  - Gutenberg: Guard in `beforeEach` — `await expect(page.locator('[role="textbox"]')).toBeFocused()` confirms editor loaded
  - Grafana: Guard as first CUJ step assertion — verifies dashboard loaded before testing panel interactions
  - The other 13/15 suites rely entirely on Playwright's auto-waiting [ghost-e2e, n8n-e2e, calcom-e2e, affine-e2e, immich-e2e, excalidraw-e2e, slate-e2e, supabase-e2e, nextjs-e2e, grafana-plugin-e2e, rocketchat-e2e, element-web-e2e, freecodecamp-e2e]

```typescript
// ACCEPTABLE: Guard assertion for ambiguous state (after complex navigation)
test('configure widget after dashboard load', async ({ page }) => {
  await page.goto('/dashboard/complex-layout');
  // Guard: dashboard has multiple async panels; ensure target panel is ready
  await expect(page.getByTestId('widget-panel')).toBeVisible();

  // Now safe to interact
  await page.getByTestId('widget-panel').getByRole('button', { name: 'Configure' }).click();
  await expect(page.getByRole('dialog', { name: 'Widget Settings' })).toBeVisible();
});

// PREFERRED: No guard needed — auto-waiting handles simple navigation
test('click submit button', async ({ page }) => {
  await page.goto('/form');
  // No guard assertion needed — click will auto-wait for button
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('Submitted')).toBeVisible();
});
```

- **Anti-pattern:** Guard assertions on every page load — `await expect(page).toHaveURL('/dashboard'); await expect(page.getByText('Welcome')).toBeVisible();` before every interaction adds 2-3 assertions per test that Playwright's auto-waiting already handles

### TA5.4 Order assertions following the navigation-state-interaction-outcome sequence

- Within a test, assertions SHOULD follow this natural ordering:
  1. **Navigation confirmation** (page/URL is correct) — if not handled by auto-waiting
  2. **Initial state verification** (expected elements are present)
  3. **Interaction** (user action)
  4. **Outcome verification** (expected result is visible/correct)
- **Evidence:** This ordering is the implicit pattern across all 15 suites, most explicitly in:
  - Grafana CUJ: Step 1 asserts load -> Step 2 asserts selectors -> Step 3 interacts -> Step 4 asserts result
  - Ghost: Navigate -> verify page element -> create entity -> verify entity appears
  - Gutenberg: `beforeEach` guards focus -> test types content -> assert block structure

```typescript
// RECOMMENDED: Natural assertion ordering
test('apply filter and verify results', async ({ dashboardPage }) => {
  // 1. Initial state: verify unfiltered state
  await expect(dashboardPage.resultCount).toContainText('100 items');

  // 2. Interaction: apply filter
  await dashboardPage.filterBy('status', 'Active');

  // 3. Outcome: verify filtered state
  await expect(dashboardPage.resultCount).toContainText('42 items');
  await expect(dashboardPage.filterChip).toContainText('Active');
});
```

- **Anti-pattern:** Random assertion ordering within a test — mixing outcome assertions with precondition checks makes the test flow difficult to follow during debugging

### TA5.5 Use `expect.soft()` for multi-checkpoint CUJ tests

- CUJ tests with 10+ assertions SHOULD use `expect.soft()` for checkpoint assertions that should not terminate the test early
- Critical guard assertions within CUJ tests SHOULD still use regular `expect()` to fail fast on broken preconditions
- **Rationale:** In CUJ tests, soft assertions allow the full journey to complete even if one checkpoint fails, providing complete diagnostic information for debugging. Without soft assertions, the first failure terminates the test, hiding subsequent failures.
- **Evidence:** Only Grafana uses `expect.soft()` in production (1/15 suites), exclusively in CUJ tests. Community guidance from Playwright docs and BetterStack recommends soft assertions "to collect multiple failures before test termination."

```typescript
// RECOMMENDED: Soft assertions in CUJ test
test('dashboard journey', async ({ dashboardPage, page }) => {
  await test.step('Verify panels loaded', async () => {
    await expect.soft(dashboardPage.panel.getByTitle('CPU')).toBeVisible();
    await expect.soft(dashboardPage.panel.getByTitle('Memory')).toBeVisible();
    await expect.soft(dashboardPage.panel.getByTitle('Disk')).toBeVisible();
  });

  await test.step('Apply time range', async () => {
    await dashboardPage.timeRange.set('Last 6 hours');
    // Hard assertion for critical precondition
    await expect(dashboardPage.timeRange.display).toContainText('6 hours');
  });

  await test.step('Verify panels updated', async () => {
    await expect.soft(dashboardPage.panel.getByTitle('CPU')).toContainText('6h');
    await expect.soft(dashboardPage.panel.getByTitle('Memory')).toContainText('6h');
  });
});
```

- **Anti-pattern:** Using `expect.soft()` in short focused tests — soft assertions reduce test strictness; in tests with 2-4 assertions, every assertion should be a hard requirement

### TA5.6 Use web-first assertions exclusively

- All assertions on DOM elements MUST use Playwright's web-first assertions (`await expect(locator).toBeVisible()`)
- Tests MUST NOT use synchronous assertion patterns (`expect(await locator.isVisible()).toBe(true)`)
- **Rationale:** Web-first assertions auto-retry until the condition is met or the timeout expires, eliminating race conditions. Synchronous assertions check once and fail immediately if the DOM is not yet updated.
- **Evidence:** All 15 suites use web-first assertions as the default [confirmed across rounds 56-67]. Playwright official docs explicitly recommend: "Use `await expect(locator).toBeVisible()` instead of `expect(await locator.isVisible()).toBe(true)`."
- **Most common assertion types across all suites:**

| Assertion | Prevalence | Purpose |
|-----------|-----------|---------|
| `toBeVisible()` | Very High (15/15) | Element presence verification |
| `toContainText()` / `toHaveText()` | High (12/15) | Text content verification |
| `toHaveCount()` | Medium (8/15) | List/collection size verification |
| `toHaveAttribute()` | Medium (7/15) | Element attribute verification |
| `toMatchObject()` | Medium (3/15) | Structural comparison (Gutenberg blocks) |
| `expect.poll()` | Low (1/15) | Async state retry (Gutenberg-specific) |

- **Anti-pattern:** `expect(await page.locator('.item').count()).toBe(5)` — this reads the count once and fails immediately if the list is still loading. Use `await expect(page.locator('.item')).toHaveCount(5)` instead.

---

## TA6. Test Independence & Determinism

### TA6.1 Every test MUST be runnable in isolation and in any order

- Every test MUST produce the same result whether run alone, in parallel with other tests, or in any order
- Tests MUST NOT depend on state created by other tests
- Tests MUST NOT assume they will run after or before any other test
- **Rationale:** Test independence enables parallel execution, selective reruns, and reliable failure diagnosis. When tests depend on each other, a single failure cascades into multiple failures, obscuring the root cause.
- **Evidence:** 14/15 suites achieve complete test independence. Only Rocket.Chat deliberately uses `test.describe.serial()` for inter-test state sharing — the only suite to do so. Every other suite with comparable scale (Grafana 163 specs, n8n 174 specs, Gutenberg 278 specs) invests in per-test or per-worker isolation.
- **Playwright official docs:** "Each test should be completely isolated from another test and should run independently with its own local storage, session storage, data, cookies etc."

### TA6.2 Avoid `test.describe.serial` for state sharing between tests

- `test.describe.serial` MUST NOT be used to share state between tests
- `test.describe.serial` MAY be used when tests must run in sequence for other reasons (rate limiting, resource contention), but each test MUST still be independently valid
- **Rationale:** Serial execution for state sharing creates ordering dependencies, prevents parallel execution, and produces cascading failures when one test fails and all subsequent tests are skipped.
- **Evidence:** Only 1/15 suites (Rocket.Chat) uses `test.describe.serial()` for state sharing. Playwright's own documentation states: "Using serial is not recommended. It is usually better to make your tests isolated, so they can be run independently." Serial usage distribution:

| Suite | Serial Execution | Mechanism | Rationale |
|-------|-----------------|-----------|-----------|
| Rocket.Chat | **Extensive** | `test.describe.serial()` | Shared channel state (cost-saving) |
| freeCodeCamp | **Implicit** | `workers: 1` globally | DB reseed is not parallelization-safe |
| Gutenberg | **Implicit** | `workers: 1` | WordPress environment limitations |
| Supabase | **Conditional** | `testRunner()` wrapper | Serial on rate-limited platforms only |
| **11 other suites** | **None/Parallel** | `fullyParallel: true` | True test independence |

- **Anti-pattern:** Using serial mode to avoid investing in test isolation — Rocket.Chat's approach saves setup cost (expensive channel creation) but creates fragile ordering dependencies and cascading test failures. Every other suite at comparable scale finds an alternative.

### TA6.3 Select a data isolation approach that matches your infrastructure

- Choose a data isolation approach based on your application's infrastructure and state management:

| Approach | Suites Using | Trade-off | Best For |
|----------|-------------|-----------|----------|
| **Implicit (no shared state)** | Slate, Excalidraw, AFFiNE | Total isolation; tests navigate from scratch | Stateless apps, component tests |
| **Per-test user/resource creation** | Cal.com, Grafana plugin-e2e, Gutenberg | High isolation; higher setup cost per test | Apps with fast API-based resource creation |
| **Per-worker container/DB** | n8n, Element Web | Strong isolation; infrastructure complexity | Apps requiring full-stack isolation |
| **Per-file environment** | Ghost CMS | Good isolation; environment startup overhead | Apps where per-file reset is cheap |
| **Database reset per describe** | Immich | Good isolation; reset speed depends on DB size | Apps with small, fast-to-reset databases |
| **Database reseed per file** | freeCodeCamp | Moderate isolation; requires sequential execution | Legacy apps with global DB state |
| **Unique names with `parallelIndex`** | Supabase | Good isolation in parallel; naming convention needed | Apps where data is identifiable by name |
| **beforeAll shared + independent reads** | Grafana, Immich | Moderate isolation; only safe if tests do not mutate | Read-heavy test suites |
| **Fresh app per suite** | Next.js | Total isolation; massive CI resource cost | Framework testing with per-test server spin-up |

- **Evidence:** Distribution data from 15 suites shows no single approach is dominant — the right choice depends on product architecture [anatomy-patterns synthesis, round-67 findings]. 3/15 suites need no isolation mechanism at all (stateless apps), while 5/15 require full-stack isolation (container, environment, or app-per-suite).

### TA6.4 Implement determinism patterns for tests with variable inputs

- Tests involving randomness MUST use seeded random number generators
- Tests creating shared data MUST use unique identifiers (not hardcoded names)
- Tests depending on feature toggles MUST declare their toggle requirements explicitly
- **Rationale:** Non-deterministic tests produce intermittent failures that erode trust in the test suite. Seeded randoms make tests reproducible; unique identifiers prevent cross-test collisions; explicit toggle declarations prevent environment-dependent failures.
- **Evidence:**

| Determinism Pattern | Suites Using | Mechanism |
|--------------------|-------------|-----------|
| Seeded random numbers | Excalidraw (`seed: 7`), Immich (`SeededRandom`) | 2/15 |
| Unique test data generation | Supabase (`uniqueNames()` with `parallelIndex`), Cal.com (random usernames), Rocket.Chat (`faker`) | 3/15 |
| Feature toggle control | Grafana (`test.use({ featureToggles })`), Grafana plugin-e2e (`test.use({ openFeature })`) | 2/15 |
| Version-conditional skipping | Grafana plugin-e2e (`test.skip(semver.lt())`), Next.js (runtime `if (isNextDev)` guards) | 2/15 |

```typescript
// RECOMMENDED: Seeded random for reproducible tests
const SEED = 42;
const random = new SeededRandom(SEED);

test('renders shapes consistently', async ({ page }) => {
  await page.evaluate((seed) => {
    window.__testSeed = seed;
  }, SEED);
  // All random operations in the app use the seeded generator
  await expect(page.getByTestId('canvas')).toHaveScreenshot();
});

// RECOMMENDED: Unique names for parallel-safe data creation
test('create project with unique name', async ({ page }) => {
  const projectName = `test-project-${Date.now()}-${test.info().parallelIndex}`;
  await page.getByLabel('Project name').fill(projectName);
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText(projectName)).toBeVisible();
});

// RECOMMENDED: Explicit feature toggle declaration
test.describe('New editor feature', () => {
  test.use({ featureToggles: { newEditor: true } });

  test('shows new editor toolbar', async ({ page }) => {
    await expect(page.getByTestId('new-editor-toolbar')).toBeVisible();
  });
});
```

- **Anti-pattern:** Using `Math.random()` without seeding — produces different test data on each run, making failures non-reproducible
- **Anti-pattern:** Hardcoded test data names (`'Test Project'`) — causes collisions when tests run in parallel across workers

### TA6.5 Constrain describe nesting to a maximum depth of 2

- `describe` blocks SHOULD NOT nest deeper than 2 levels within a single file
- **Rationale:** Directory depth + describe depth should total approximately 3-4 levels of organizational hierarchy. Suites with shallow describe nesting compensate with deep directory structures, and vice versa. Deeper nesting (3+) produces indentation-heavy code that is hard to scan.
- **Evidence:** No suite exceeds depth 2 for describe nesting across all 15 analyzed suites:

| Suite | Max Depth | Compensating Mechanism |
|-------|-----------|----------------------|
| AFFiNE | 0 (no describe) | Feature directories |
| n8n | 1 | 21 feature directories |
| Grafana | 1 | Suite directories (dashboard-cujs/, panels-suite/) |
| Element Web | 1 | 40+ feature directories |
| Ghost CMS | 2 | Feature -> sub-feature mapping |
| Gutenberg | 2 | 5-level directory structure |
| Excalidraw | 2-3 | Acceptable for parameterized variations |
| Next.js | 3-4 | Uses `describe.each` — deeper nesting is data-driven, not organizational |

- **Valid alternative:** Flat file-per-feature with no describe blocks (AFFiNE pattern) — file boundaries serve as the organizational unit
- **Anti-pattern:** Deep describe nesting (3+) for organizational purposes — use directory structure instead. Reserve deeper nesting for data-driven parameterization (`describe.each`) only.
