# Test Anatomy Patterns

> Cross-round synthesis of internal test structure patterns.
> Based on research rounds 56-62, covering 15 suites (10 Gold re-analyzed + 5 new large-scale).

## Suites Analyzed

| # | Suite | Tier | Framework | Spec Files | Est. Tests |
|---|-------|------|-----------|-----------|------------|
| 1 | Grafana | Gold | Playwright | ~163 | ~350-450 |
| 2 | Cal.com | Gold | Playwright | ~83 | ~250-350 |
| 3 | AFFiNE | Gold | Playwright | ~120+ | ~500+ |
| 4 | Immich | Gold | Playwright + Vitest | ~45+ | ~300-400 |
| 5 | freeCodeCamp | Gold | Playwright | 117 | ~400-600 |
| 6 | Excalidraw | Gold | Vitest + RTL | ~33 | ~300+ |
| 7 | Slate | Gold | Playwright | 22 | ~35 |
| 8 | Supabase Studio | Gold | Playwright | 18 | ~177 |
| 9 | Next.js | Gold | Custom (Jest+PW) | ~550+ dirs | ~5,000-10,000 |
| 10 | Grafana plugin-e2e | Gold | Playwright | ~25 | ~50-60 |
| 11 | WordPress/Gutenberg | New-Large | Playwright | 278 | ~800+ |
| 12 | n8n | New-Large | Playwright | 174 | ~500+ |
| 13 | Rocket.Chat | New-Large | Playwright | 170 | ~500+ |
| 14 | Ghost CMS | New-Large | Playwright | 81 (browser) | ~250+ |
| 15 | Element Web | New-Large | Playwright | 209 | ~600+ |

---

## AAA Pattern Observations

**Overall finding:** AAA (Arrange-Act-Assert) is the dominant test structure, but strict AAA compliance is rare in E2E tests. Observed in 15/15 suites at varying degrees of adherence.

### Compliance Rates

| Compliance Band | Suites | Count |
|----------------|--------|-------|
| Strong (85-95%) | Slate (~90%), Excalidraw (~85%), Grafana plugin-e2e (cleanest observed), Next.js (loose Act-Assert), Ghost CMS (exemplary), n8n (strong in short tests) | 6/15 |
| Moderate (65-80%) | Grafana (~75%), Cal.com (~80%), freeCodeCamp (~80%), Gutenberg (~70%), Element Web (~75%), Supabase (~70%) | 6/15 |
| Low/Loose (<65%) | AFFiNE (utility-abstracted), Immich (dual pattern), Rocket.Chat (serial chaining) | 3/15 |

### What Causes Deviation from AAA

1. **Interleaved Act-Assert chains (most common, 12/15 suites):** In E2E tests, actions and assertions naturally interleave because each user interaction produces a verifiable state change. Strict "all asserts at end" is impractical for multi-step flows. Example: Grafana dashboard-view tests chain navigate -> assert loaded -> click panel -> assert expanded -> set time range -> assert updated.

2. **Fixture-driven arrangement obscures the "Arrange" phase (8/15 suites):** When fixtures handle all setup, the test body starts directly at "Act." This looks like missing Arrange but is actually clean separation -- the Arrange phase is in the fixture system. Strongest examples: Grafana plugin-e2e (25+ fixtures eliminate all setup code), Cal.com (15 custom fixtures), Ghost CMS (data factory + env manager), n8n (container fixtures).

3. **Long CUJ/workflow tests (5/15 suites):** Tests covering Critical User Journeys inherently span multiple AAA cycles within a single test. Grafana dashboard-cujs, Cal.com booking flows, Element Web crypto verification, Rocket.Chat channel management, and Supabase table-editor all show this pattern.

4. **Complex beforeAll setup sharing state (4/15 suites):** Immich, freeCodeCamp, Rocket.Chat, and Gutenberg use beforeAll to create expensive shared resources, blurring the boundary between Arrange and shared context.

### Correlation with Test Length

AAA compliance inversely correlates with test length across all 15 suites:
- Tests under 15 lines: ~90% AAA compliance (Slate avg 8 lines, Grafana plugin-e2e avg 12-15 lines)
- Tests 15-40 lines: ~75% AAA compliance (most suites' average range)
- Tests over 40 lines: ~60% AAA compliance (Supabase filter-bar at 180 lines, Grafana CUJ at 170 lines)

**Contradiction:** Ghost CMS achieves "exemplary" AAA in tests averaging only 10-20 lines, confirming that heavy fixture/factory investment produces both short tests AND clean AAA structure. Meanwhile, Rocket.Chat's serial test blocks break AAA because tests depend on state from previous tests.

---

## Single Responsibility Observations

### Test Length Distributions

| Suite | Short (<15 lines) | Medium (15-40) | Long (40-80) | Very Long (80+) | Average |
|-------|-------------------|----------------|--------------|-----------------|---------|
| Slate | 70% | 25% | 5% | 0% | ~8 lines |
| Grafana plugin-e2e | 50% | 40% | 10% | 0% | ~12-15 lines |
| Ghost CMS | 60% | 35% | 5% | 0% | ~10-20 lines |
| Next.js | 30% | 50% | 15% | 5% | ~15-20 lines |
| Excalidraw | 30% | 50% | 15% | 5% | ~20 lines |
| n8n | 40% | 50% | 10% | 0% | ~10-30 lines |
| AFFiNE | 40% | 50% | 10% | rare | ~15-30 lines |
| Cal.com | 20% | 50% | 20% | 10% | ~35 lines |
| freeCodeCamp | 30% | 40% | 15% | 15% | ~10-30 lines |
| Grafana | 15% | 45% | 25% | 15% | ~45 lines |
| Supabase | 15% | 40% | 30% | 15% | ~40 lines |
| Gutenberg | 15% | 40% | 30% | 15% | ~35 lines |
| Element Web | 10% | 40% | 35% | 15% | ~20-60 lines |
| Rocket.Chat | 20% | 40% | 25% | 15% | ~10-50 lines |
| Immich (API) | 60% | 30% | 10% | 0% | ~5-15 lines |
| Immich (Web) | 30% | 50% | 15% | 5% | ~15-30 lines |

### Few-Long vs Many-Short Balance

Two distinct philosophies observed:

**Many-short-tests philosophy (9/15 suites):** AFFiNE, Excalidraw, Ghost, Grafana plugin-e2e, Immich, n8n, Next.js, Slate, freeCodeCamp. These suites prefer tests that verify one behavior each, averaging under 30 lines. They compensate for limited per-test scope with higher test counts per file (Excalidraw: ~9/file, Supabase: ~9.8/file).

**Fewer-longer-tests philosophy (6/15 suites):** Cal.com, Grafana, Gutenberg, Rocket.Chat, Supabase, Element Web. These suites bundle multiple related assertions into comprehensive scenario tests, averaging 35-60 lines. They have fewer tests per file but each test covers more ground. Gutenberg explicitly treats tests as "integration scenarios" -- a single test may exercise insert-block -> type -> navigate -> resize-viewport -> assert.

**Key insight:** Fixture investment is the strongest predictor of test length. Ghost CMS (data factory + env manager) and n8n (container fixtures) produce the shortest tests (10-30 lines). Suites with manual inline setup (freeCodeCamp with execSync, Grafana with API calls in beforeAll) produce longer tests (35-45 lines). Correlation: more fixture investment = shorter, more focused tests (confirmed across all 15 suites).

### Tests-Per-File Distribution

| Range | Suites |
|-------|--------|
| 1-2 tests/file | Slate (1.6 avg) |
| 3-5 tests/file | Cal.com, freeCodeCamp, Grafana, Gutenberg |
| 5-10 tests/file | AFFiNE, Excalidraw (~9), Supabase (~9.8), Next.js |
| 10+ tests/file | Immich (API files), Supabase filter-bar (39 in one file) |

---

## Step Usage Observations

### test.step() Adoption Rates

| Suite | test.step() Usage | Notes |
|-------|-------------------|-------|
| Grafana (main) | ~20% of files | Only Gold suite with meaningful usage; CUJ tests only |
| Cal.com | ~10-15% of files | Booking/question management tests |
| Rocket.Chat | <5% | Personal Access Tokens test only |
| Element Web | <5% | Single crypto test ("Fetch master key from server") |
| AFFiNE | 0% | |
| Immich | 0% | |
| freeCodeCamp | 0% | |
| Excalidraw | 0% | |
| Slate | 0% | |
| Supabase | 0% | Despite tests up to 180 lines |
| Next.js | 0% | |
| Grafana plugin-e2e | 0% | |
| Gutenberg | 0% | |
| n8n | 0% | |
| Ghost CMS | 0% | |

**Observed in 3/15 suites (Grafana, Cal.com, Rocket.Chat); absent from 12/15.**

### Alternatives Used Instead

Production suites that do NOT use test.step() use these alternatives for organizing complex tests:

1. **Short focused tests (12/15 suites):** The dominant alternative. Instead of using test.step() to sub-divide a long test, suites write multiple short tests. This is the universal preference.

2. **Nested describe blocks (7/15 suites):** Immich (2-3 levels), Excalidraw (2-3 levels), Supabase (2-3 levels), Grafana (1 level), freeCodeCamp (1-2 levels), Next.js (3-4 levels with describe.each), Gutenberg (1-2 levels). Describe blocks serve as the organizational unit instead of steps.

3. **Flat file-per-feature (4/15 suites):** AFFiNE (zero describes), Slate (1 describe per file), n8n (minimal nesting), Ghost (shallow hierarchy). These suites use file boundaries as organizational units.

4. **Parametric tests (2/15 suites):** Next.js uses describe.each/it.each extensively for multiplicative coverage. Excalidraw uses parameterized regression tests.

### Where test.step() IS Used

When present, test.step() appears exclusively in:
- **CUJ/workflow tests** that span multiple logical phases (Grafana dashboard-cujs)
- **Multi-phase booking/form flows** (Cal.com booking-pages, manage-booking-questions)
- **Complex CRUD sequences** (Rocket.Chat Personal Access Tokens)

Naming conventions diverge:
- Grafana: Numbered steps ("1.Loads dashboard", "2.Top level selectors", "4.1 Set time range from")
- Cal.com: Descriptive phrases ("from session", "Go to EventType Page")
- Rocket.Chat: Action descriptions ("Add token", "Regenerate token")

**Strong pattern:** test.step() is a CUJ-specific tool, not a general test organization mechanism. Suites that use it restrict it to their longest, most complex workflow tests.

---

## Setup Placement Observations

### Distribution Across 15 Suites

| Setup Approach | Suites Using | Count | Description |
|---------------|-------------|-------|-------------|
| **Custom fixtures (dominant)** | Cal.com, Grafana plugin-e2e, n8n, Ghost, Element Web, AFFiNE, Supabase | 7/15 | Playwright fixture injection provides pre-configured pages, users, data, and environments |
| **beforeEach navigation** | Slate, Gutenberg, freeCodeCamp, Rocket.Chat, Supabase, Cal.com, Excalidraw | 7/15 | Standard pattern: navigate to starting page per test |
| **beforeAll + API/DB setup** | Grafana, Immich, Rocket.Chat, freeCodeCamp, Gutenberg | 5/15 | Create expensive shared resources (users, channels, dashboards) once per describe block |
| **Inline utility calls** | AFFiNE, Excalidraw, Next.js | 3/15 | Test body begins with utility function calls (e.g., `openHomePage(page)`, `API.createElement()`) |
| **God-fixture (single fixture handles everything)** | Next.js | 1/15 | `nextTestSetup()` provisions entire app per suite |
| **Global setup project** | Grafana, freeCodeCamp, Supabase, Gutenberg, n8n | 5/15 | Separate Playwright project for authentication/environment |
| **Async disposable cleanup** | Supabase | 1/15 | `withSetupCleanup()` using TC39 Explicit Resource Management |
| **Data factory pattern** | Ghost | 1/15 | Factory classes with pluggable persistence adapters (API or DB) |
| **Container-per-worker** | n8n, Element Web | 2/15 | Fresh Docker container with clean DB per Playwright worker |

### Setup Complexity Correlates with Product Complexity

Ordered from simplest to most complex:

1. **Navigation-only** (Slate): `beforeEach(page.goto('/example'))` -- no data, no auth, no cleanup
2. **Component render + mock** (Excalidraw): `beforeEach` resets state, renders component, reseeds random
3. **Global auth + seed scripts** (freeCodeCamp): Global setup creates users, `execSync` reseeds DB per file
4. **API-based CRUD** (Grafana, Gutenberg): `beforeAll` creates resources via API, `afterAll` deletes them
5. **Rich fixture composition** (Cal.com, n8n): 15+ custom fixtures handle users, bookings, emails, etc.
6. **Full stack isolation** (Supabase, Ghost, Element Web): Global auth + environment manager + per-test DB/container + data factories + async cleanup

### Cleanup Patterns

| Pattern | Suites | Mechanism |
|---------|--------|-----------|
| afterEach explicit cleanup | Cal.com (`users.deleteAll()`), Grafana | Manual cleanup call |
| afterAll API cleanup | Grafana (`request.delete()`), Immich | Delete shared resources |
| Async disposable | Supabase (`withSetupCleanup`) | TC39 Symbol.asyncDispose |
| Container reset per worker | n8n, Element Web | Fresh container = implicit cleanup |
| Environment reset per file | Ghost | Fresh Ghost instance per file |
| DB reseed | freeCodeCamp (`execSync seed`), Immich (`utils.resetDatabase()`) | Restore to known state |
| No cleanup needed | Slate, Excalidraw, Next.js | Tests create disposable state or use fresh instances |

---

## Assertion Density Observations

### Assertions-Per-Test Distributions

| Suite | Avg Assertions/Test | Range | Distribution Shape |
|-------|--------------------|---------|--------------------|
| Slate | ~3.3 | 1-27 | Heavy left skew (many 1-assertion tests) |
| Grafana plugin-e2e | ~2-3 | 1-7 | Tight cluster around 2 |
| n8n | ~2.5 | 1-4 | Tight cluster |
| Next.js | ~3-4 | 2-10 | Moderate spread |
| AFFiNE | ~1-3 | 1-5 | Left skew (many single-assert) |
| Excalidraw | ~5 | 1-25+ | Bimodal (simple: 1-4, complex: 8-25) |
| Cal.com | ~5 | 1-20+ | Moderate spread |
| Grafana | ~6 | 2-25+ | Right skew (CUJ tests pull average up) |
| Supabase | ~5 | 1-25 | Wide spread |
| Immich (API) | ~2-5 | 2-5 | Tight cluster |
| Immich (Web) | ~3-8 | 3-8 | Moderate spread |
| freeCodeCamp | ~1-5 | 1-30+ | Extreme bimodal (1-2 for rendering, 30+ for settings) |
| Gutenberg | ~4 | 1-12 | Moderate spread |
| Rocket.Chat | ~3 | 1-6 | Moderate left skew |
| Ghost CMS | ~2-4 | 2-4 | Tight cluster |
| Element Web | ~5 | 3-8 | Moderate cluster |

**Cross-suite average: ~3-5 assertions per test.** The median is approximately 4.

### Guard Assertion Usage

Guard assertions (assertions placed before the main action to verify preconditions) are rare across all suites. Only 3/15 suites show any evidence:
- **Supabase:** Assertion messages used for debugging (`expect(element).toBeVisible({ message: 'Should show...' })`)
- **Grafana:** Dashboard-view CUJ tests assert page load before proceeding to panel interactions
- **Element Web:** Crypto tests verify cross-signing bootstrap before testing device verification

Most suites rely on Playwright's auto-waiting and web-first assertions to implicitly guard preconditions rather than explicitly asserting them.

### Assertion Strategy by Suite Type

- **API test suites** (Immich server, Next.js fetch): Status code + body shape, averaging 2-5 assertions. Reusable DTO factories (Immich `errorDto.unauthorized`, `errorDto.forbidden`).
- **UI interaction suites** (Excalidraw, Slate, Gutenberg): Visibility + state checks, averaging 3-5 assertions.
- **Full workflow suites** (Cal.com, Grafana, Supabase): Multi-step verification, averaging 5-8 assertions with higher variance.
- **SDK test suites** (Grafana plugin-e2e): Lean verification with custom matchers (`toBeOK()`, `toHaveAlert()`), averaging 2-3 assertions.

---

## Independence & Determinism Observations

### Serial Test Usage

| Suite | Serial Execution | Mechanism | Rationale |
|-------|-----------------|-----------|-----------|
| Rocket.Chat | **Extensive** | `test.describe.serial()` | Shared channel state across tests; cost-saving |
| freeCodeCamp | **Implicit** | `workers: 1` globally | Entire suite runs sequentially |
| Supabase | **Conditional** | `testRunner()` wrapper | Serial on rate-limited platforms, parallel locally |
| Gutenberg | **Implicit** | `workers: 1` | Serial execution |
| All others (11/15) | **None/Parallel** | `fullyParallel: true` or per-worker isolation | True test independence |

**Key finding:** Only 1/15 suites (Rocket.Chat) deliberately uses `test.describe.serial()` for test-to-test state sharing. This is widely considered an anti-pattern -- the other 14 suites all invest in isolation mechanisms to avoid it. Rocket.Chat's rationale (expensive channel creation via API) is a valid cost concern but creates fragile ordering dependencies and cascading failures.

### Data Isolation Approaches

| Approach | Suites | Count | Trade-off |
|----------|--------|-------|-----------|
| **Per-test user/resource creation** | Cal.com, Grafana plugin-e2e, Gutenberg | 3/15 | High isolation; higher setup cost |
| **Per-worker container/DB** | n8n, Element Web | 2/15 | Strong isolation; infrastructure complexity |
| **Per-file environment** | Ghost CMS | 1/15 | Good isolation; environment startup overhead |
| **Database reset per describe** | Immich | 1/15 | Good isolation; reset is fast for small DBs |
| **Database reseed per file** | freeCodeCamp | 1/15 | Moderate isolation; sequential execution required |
| **beforeAll shared + independent reads** | Grafana, Immich | 2/15 | Moderate isolation; read-only tests are safe |
| **Unique names with parallelIndex** | Supabase | 1/15 | Good isolation in parallel; naming convention needed |
| **Fresh app per suite** | Next.js | 1/15 | Total isolation; massive CI resource cost |
| **Implicit (no shared state)** | Slate, Excalidraw, AFFiNE | 3/15 | Total isolation; tests navigate from scratch |

### Determinism Patterns

- **Deterministic random seeds:** Excalidraw (`seed: 7`), Immich (`SeededRandom`) -- 2/15 suites
- **Unique test data generation:** Supabase (`uniqueNames()` with `parallelIndex`), Cal.com (`users.create()` with random usernames), Rocket.Chat (`faker`) -- 3/15 suites
- **Feature toggle control:** Grafana (`test.use({ featureToggles })`), Grafana plugin-e2e (`test.use({ openFeature })`) -- 2/15 suites
- **Version-conditional skipping:** Grafana plugin-e2e (`test.skip(semver.lt())`), Next.js (runtime `if (isNextDev)` guards) -- 2/15 suites

### Contradictions

**Rocket.Chat vs all others on serial execution:** Rocket.Chat is the only suite relying on serial test ordering for state sharing. Every other suite with comparable scale (Grafana 163 specs, n8n 174 specs, Gutenberg 278 specs) invests in per-test or per-worker isolation. This suggests serial execution is a technical-debt pattern rather than a deliberate architectural choice.

**freeCodeCamp workers:1 paradox:** freeCodeCamp has ~400-600 tests but runs with `workers: 1`. This is the suite that would benefit most from parallelization but runs serially. The `execSync` database seeding approach makes parallelization unsafe without refactoring. This confirms that data isolation strategy constrains scaling strategy.
