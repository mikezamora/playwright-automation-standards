# Coverage Strategy Standards

> **DRAFT** — based on research rounds 56-71, covering 15+ suites (10 Gold, 5 new large-scale) plus 30 community resources.
> Each standard includes decision frameworks, evidence citations, and anti-patterns.

---

## COV1. E2E Testing Boundaries

### COV1.1 Define E2E scope by user-facing workflows and system integration points

E2E tests MUST cover user-facing workflows and system integration points. Leave implementation details, business logic calculations, and component rendering to unit and integration tests.

**Decision criteria — test at E2E when ALL of the following are true:**
1. The behavior is user-visible (a real user could trigger and observe it)
2. The behavior spans multiple system components (frontend + backend, or multiple services)
3. The behavior cannot be fully verified at a lower test layer (e.g., multi-step flows, cross-service state)

**Decision criteria — delegate to unit/integration when ANY of the following are true:**
1. The behavior is pure computation (price calculation, date formatting, string parsing)
2. The behavior is isolated to one component (rendering, state management)
3. The behavior involves internal API contract validation
4. The behavior tests CSS/styling correctness beyond visual regression

- **Evidence:** 15/15 suites test user-facing workflows at E2E; 0/15 suites test business logic at E2E. Grafana explicitly documents preferring real interactions over stubs/mocks. Ghost, Immich, and Next.js delegate API contracts and component rendering to dedicated lower-layer test suites.
- **Anti-pattern:** Testing pure business logic at E2E — creates slow, fragile tests that duplicate unit test coverage without adding integration confidence.

### COV1.2 Follow the priority table for E2E coverage scope

Not all features deserve equal E2E investment. Use the following priority table, derived from cross-suite analysis of what 15 production suites actually test:

**Must-have (test at E2E in every suite):**

| Category | Evidence | What to Test |
|----------|----------|-------------|
| Authentication flows | 13/15 suites | Login, signup, logout, 2FA, session persistence |
| Core CRUD on primary data type | 15/15 suites | Create, read, update, delete of the entity your product revolves around (dashboards in Grafana, bookings in Cal.com, workflows in n8n, posts in Ghost) |
| Navigation and page rendering | 15/15 suites | Route loading, menu interaction, breadcrumbs |
| Form submissions | 14/15 suites | Data entry on critical forms, validation feedback display |

**Should-have (test at E2E in mature suites):**

| Category | Evidence | What to Test |
|----------|----------|-------------|
| Permission/role enforcement | 8/15 suites | Admin vs viewer access, redirect on unauthorized |
| Search and filtering | 9/15 suites | Query inputs, result display, filter clearing |
| Settings and preferences | 10/15 suites | User configuration changes that persist |
| Third-party integration touchpoints | 5/15 suites | Data source connections, payment flow entry, calendar sync start |
| Data import/export | 6/15 suites | File upload, CSV export, JSON import |

**Rarely-at-E2E (delegate to lower layers):**

| Category | Evidence | Better Layer |
|----------|----------|-------------|
| Pure computation/business logic | 0/15 suites test at E2E | Unit tests |
| Component rendering in isolation | 0/15 suites test at E2E | Component tests (Excalidraw, AFFiNE use Storybook/vitest) |
| API contract validation | 0/15 suites test at E2E | API-level tests (Immich, Ghost, Next.js) |
| Database query correctness | 0/15 suites test at E2E | Integration tests |
| CSS/styling correctness | 0/15 suites test at E2E | Visual regression or component tests |
| Email delivery verification | 1/15 suites (Cal.com via MailHog) | Dedicated integration test or manual |
| Offline/sync-conflict scenarios | 0/15 suites | Unit/integration with mocked network |
| Third-party service internals | 0/15 suites (all mock externals) | Service-level contract tests |

- **Basis:** Cross-suite analysis of 15 suites [grafana-e2e, calcom-e2e, immich-e2e, ghost-e2e, element-web-e2e, n8n-e2e, affine-e2e, freecodecamp-e2e, excalidraw-e2e, supabase-e2e, slate-e2e, gutenberg-e2e, rocket-chat-e2e, nextjs-e2e, shopware-e2e]; community guidance from Kent C. Dodds, web.dev testing strategies, Leading EDJE
- **Anti-pattern:** Percentage-based E2E coverage targets (e.g., "80% code coverage from E2E") — no production suite uses code coverage targets for E2E. Scope by features and user journeys, not by lines of code.

### COV1.3 Use multi-layer E2E architecture when product complexity warrants it

Mature suites do not treat "E2E" as a single test layer. When a product has both API and UI surfaces, maintain separate E2E layers with different scopes:

| Suite | E2E Layers | Total E2E Files |
|-------|-----------|-----------------|
| Ghost CMS | Browser, API, Frontend, Server, Webhooks | ~199 |
| Immich | Server API (vitest), Web UI (Playwright), UI mock (Playwright) | ~45+ |
| Next.js | e2e, development, production, integration | ~550+ dirs |
| n8n | Main e2e, Docker, Helm, Performance, Coverage, Infrastructure | 174 specs |
| Grafana | Main suites, Plugin e2e, CUJ, Smoke, Storybook | 163+ specs |

**Pattern: API layer for breadth, UI layer for depth.** Suites with both API and UI E2E layers consistently cover MORE endpoints at the API layer. Immich: 23 API spec files vs 14 UI spec files. Ghost: 60+ API files vs 54 browser files. The API layer provides broad coverage cheaply; the UI layer validates critical visual workflows.

**When to adopt multi-layer E2E:**
- Product has distinct API and UI surfaces consumed by different users
- Suite exceeds ~100 spec files and single-layer tests become slow
- Security-critical features require multi-client, multi-server verification (Element Web: crypto tests account for 10% of the suite)

- **Evidence:** Ghost (5 layers), Immich (3 layers), n8n (6 workflow types), Grafana (5 project categories)
- **Valid alternative:** Single-layer E2E — acceptable for products with only one user-facing surface and fewer than 100 spec files
- **Anti-pattern:** Running ALL E2E tests through the UI when an API layer would provide faster feedback and higher error coverage — Immich's API tests achieve 70:30 happy-to-error ratio vs 90:10 for UI tests

---

## COV2. Coverage Tiers

### COV2.1 Use structural tiering (directories and Playwright projects) as the primary organization

Test tiers MUST be implemented through directory structure and Playwright project definitions, not through priority tags. This is the universal production pattern: 11/15 suites use directory structure as their primary categorization; 0/15 suites use priority tags (`@smoke`, `@critical`, `@regression`) as their primary organization.

**Recommended four-tier structure:**

| Tier | Purpose | Time Budget | Content | Implementation |
|------|---------|-------------|---------|----------------|
| **Smoke** | Core health check | < 5 min | Auth + primary CRUD + critical path (5-10% of tests) | Dedicated `smoke/` directory or Playwright project |
| **Regression** | Feature-scoped verification | < 30 min | Feature directories, one per product area (60-80% of tests) | Feature-named directories: `dashboards/`, `bookings/`, `workflows/` |
| **Comprehensive** | Full suite including slow tests | < 2 hrs | All tests including cross-browser, visual regression | Full Playwright config with all projects enabled |
| **Specialized** | Nightly or scheduled | Variable | Performance, chaos, accessibility, coverage collection | Separate CI workflows with cron triggers |

**Grafana reference implementation (most mature tiering observed):**
- `smoke-tests-suite/` — 3 specs, core health check
- `dashboard-cujs/` — 8 specs, Critical User Journeys with setup/teardown project chain
- `dashboards-suite/`, `panels-suite/`, `various-suite/` — feature-scoped regression
- Per-datasource projects (elasticsearch, mysql, etc.) — integration verification
- `admin` and `viewer` projects — role-based access verification

**Ghost CMS reference implementation (multi-config tiering):**
- `e2e/tests/admin/` — admin panel tests
- `e2e/tests/public/` — public site tests
- `e2e/visual-regression/` — screenshot comparisons
- 6+ separate Playwright configs for different apps

- **Evidence:** 11/15 suites use structural tiering only; Grafana (31 Playwright projects), Ghost (6+ configs), Cal.com (7 projects), Element Web (9 projects)
- **Anti-pattern:** Using `@smoke`, `@critical`, `@regression` tags as the primary tier mechanism — found exclusively in QA-authored frameworks and tutorial projects, never in production suites. Tags drift from reality because they require per-test maintenance; directory structure is self-documenting.

### COV2.2 Reserve tags for cross-context execution control, not priority classification

Tags are valid ONLY when tests need to be excluded from specific execution contexts (browsers, servers, or CI pipelines). When tags ARE used, they serve one of four purposes:

| Tag Purpose | Example | Suites |
|-------------|---------|--------|
| **CI tier control** | `@mergequeue` — skip in PR CI, include in merge queue | Element Web |
| **Browser exclusion** | `@no-firefox`, `@no-webkit` — skip in incompatible browsers | Element Web, Gutenberg |
| **Fixture modification** | `@auth:none` — change setup behavior | n8n |
| **Suite identification** | `@dashboards`, `@acceptance` — mirrors directory structure for CLI filtering | Grafana |

**When to introduce tags:**
- Suite runs in multiple browsers and some tests are browser-incompatible
- Suite has a merge queue CI pipeline separate from PR CI
- Specific tests need different fixture behavior

**When NOT to introduce tags:**
- Suite runs in a single browser (11/15 suites run Chromium only)
- Team wants to mark tests as "smoke" or "critical" (use directories instead)
- Small suite with < 50 tests (no need for any categorization beyond directories)

- **Evidence:** 13/15 suites use zero tags; 2/15 use tags for execution context control (Element Web, Gutenberg); 1/15 uses tags for fixture control (n8n). Zero suites use priority tags.
- **Basis:** Rounds 56-62 landscape analysis, round 69 tier patterns deep dive
- **Anti-pattern:** `@smoke` and `@regression` tags on individual tests — community guides universally recommend this, but 0/15 production suites implement it. The gap is the largest finding of the coverage research.

### COV2.3 Scale CI tier complexity to suite size

Not every suite needs tiering. Match CI execution strategy to suite size:

| Suite Size | Strategy | Evidence |
|------------|----------|----------|
| **< 50 tests** | No tiering. Run everything on every PR. | Slate (35 tests): single CI job, no differentiation |
| **50-200 tests** | Change detection gating. Skip test runs when no relevant code changed. Optional smoke subset. | Immich: path-filtered triggering; AFFiNE: copilot tests only on copilot changes |
| **200-500 tests** | Structural tiering with sharding. Smoke directory + feature directories. Change detection. | Grafana (~400 tests, 8 shards): change detection gating, 20-min timeout; Cal.com (~380 tests): runs all tests, no tiering needed yet |
| **500+ tests** | Full tiered CI with merge queue differentiation. Tag-based exclusions. Multiple workflows. | Element Web (~500+ tests): two-tier CI with `@mergequeue` exclusion; n8n (~500+ tests): 7 separate CI workflows |

**CI differentiation mechanisms (from most to least common):**

1. **Playwright projects** (most mature): Separate projects in config map to different directories. CI selects by project name. Used by: Grafana, Element Web, Cal.com, Immich.
2. **Separate CI workflows**: Multiple `.github/workflows/` files target different test subsets. Used by: n8n (7 workflows), Immich (2 jobs), Grafana (main + triggered).
3. **Change detection gating**: `git diff` analysis determines whether to run tests at all. Used by: Grafana, AFFiNE, Immich. Zero-cost for unrelated changes.
4. **Tag-based filtering**: CLI `--grep` or config `grep` filters by tag. Used by: Element Web (`@mergequeue` exclusion). Fine-grained per-test control.

**Two-tier CI model (Element Web reference):**
- **PR CI:** Chromium only, primary server only, all tests except `@mergequeue` — fast feedback (< 15 min)
- **Merge queue CI:** Full browser x server matrix (3 browsers x 3 servers), all tests including `@mergequeue` — comprehensive verification (< 45 min)
- **Override:** `X-Run-All-Tests` label forces full matrix on PR when needed

- **Evidence:** Only 2/15 suites implement two-tier CI (Element Web, Grafana with change detection); 11/15 run all tests on every trigger. The gap exists because: (a) sharding makes suites fast enough for PR feedback, (b) change detection achieves similar speed benefits without tier maintenance, (c) suites under ~200 tests complete in <10 minutes.
- **Valid alternative:** Running all tests on every PR — this is what 11/15 production suites actually do. Tiering is an optimization, not a requirement.
- **Anti-pattern:** Implementing complex tier logic for suites under 200 tests — the overhead of maintaining tier definitions exceeds the time saved.

---

## COV3. Prioritization & Growth Strategy

### COV3.1 Define Critical User Journeys as the primary unit of E2E coverage

E2E coverage SHOULD be measured in "business-critical user journeys covered," not in "lines of code executed" or "number of tests." Critical User Journeys (CUJs) — also called "Money Paths" — represent the workflows that, if broken, would directly impact revenue or core product value.

**Identifying CUJs:**
1. List the 5-10 workflows your product cannot function without
2. For each, define the end-to-end user flow from entry to completion
3. Prioritize by: `Risk = Impact x Likelihood of Failure`

**CUJ examples from production suites:**

| Suite | CUJ | Test Implementation |
|-------|-----|---------------------|
| Grafana | Dashboard creation and viewing journey | Dedicated `dashboard-cujs/` directory, 8 specs with numbered steps, setup/teardown projects |
| Cal.com | Booking flow (create event type -> user books -> confirmation) | `booking-pages.e2e.ts` as de facto CUJ |
| Ghost | Post creation and publishing flow | Data factory enables rapid CUJ construction; `posts.test.ts` covers full publish flow |
| Element Web | Encrypted message verification across users | Crypto verification flows spanning multiple users and servers |
| n8n | Workflow build -> execute -> verify output | Workflow execution tests as implicit CUJs |

**Explicit vs implicit CUJs:**
- **Explicit:** Only 2/15 suites name CUJ tests as such (Grafana `dashboard-cujs/`, Ghost publish flow). Explicit CUJs have dedicated directories, setup/teardown phases, and longer test bodies (80-170 lines).
- **Implicit:** Most suites (13/15) have CUJs without the label. The booking flow in Cal.com and workflow execution in n8n are CUJs in practice. Identifying them makes coverage discussions clearer.

- **Evidence:** Community consensus from BugBug ("Money Paths"), Kent C. Dodds ("test use cases, not code"), Makerkit (smoke test categories); Grafana and Ghost explicit CUJ implementations
- **Anti-pattern:** Measuring coverage by test count — a suite with 500 trivial tests covering 3 features has worse coverage than a suite with 50 tests covering 10 critical user journeys.

### COV3.2 Prioritize coverage growth in consistent order

Based on which features every production suite tests first, follow this growth order:

**Phase 1 — Foundation (first 10-20 tests):**
1. Authentication (login, signup) — always the first tests written (13/15 suites)
2. Core entity CRUD — the primary data type your product manages (15/15 suites)
3. Navigation and routing — page loads correctly, menus work (15/15 suites)

**Phase 2 — Core workflows (tests 20-50):**
4. Search and filtering — Supabase filter-bar: 39 tests; Element Web read-receipts: 18 files
5. Settings and configuration — user preferences that persist
6. Permission enforcement — admin vs viewer access paths

**Phase 3 — Maturity (tests 50+):**
7. Import/export workflows — file upload, data export
8. Edge cases and error recovery — see COV4
9. Accessibility — axe-core scanning (4/15 suites)
10. Visual regression — screenshot comparisons (4/15 suites)

**Phase 4 — Specialized (100+ tests):**
11. Performance budgets — dedicated performance tests (2/15 suites)
12. Real-time/WebSocket interactions (3/15 suites)
13. End-to-end encryption verification (2/15 suites)
14. Chaos/resilience testing (1/15 suites: n8n)

- **Evidence:** Feature analysis across 15 suites shows authentication and CRUD are universally first; accessibility and visual regression appear only in mature suites with 100+ tests
- **Anti-pattern:** Skipping authentication tests because "auth is handled by fixtures" — the auth flow itself must have dedicated E2E verification, even if other tests use fixture-based auth shortcuts.

### COV3.3 Select a breadth-vs-depth strategy that matches product risk profile

Three strategies exist in production. Choose based on product characteristics:

| Strategy | Description | Suites | When to Use |
|----------|-------------|--------|-------------|
| **Broad-shallow** | Many features covered minimally (1-2 tests per feature). "Does each feature work at all?" | Slate (1.6 tests/feature), freeCodeCamp, AFFiNE | Early-stage products; rapidly changing feature set; small teams where breadth of coverage is more valuable than depth |
| **Narrow-deep** | Core interactions tested exhaustively. Less total feature coverage, but high confidence in critical areas. | Excalidraw (history: 40+ tests), Supabase (filter-bar: 39 tests) | Products where core interaction correctness is paramount; library/editor products; single-feature depth > multi-feature breadth |
| **Balanced** | Moderate breadth with deeper coverage on critical paths. CUJs get 5-10 tests; secondary features get 1-3 tests. | Grafana, Cal.com, n8n, Ghost, Element Web, Gutenberg, Rocket.Chat | Most web applications; recommended default. Start broad-shallow for coverage, then deepen critical paths. |

**Growth pattern transitions:**
- Most suites start broad-shallow (cover all features minimally)
- As suites mature, critical paths get deeper coverage (transition to balanced)
- Narrow-deep suites are typically products with a single core interaction (editors, libraries)

**Risk-based depth allocation:**
- **High risk (deep coverage):** Revenue-impacting flows, security-critical features, frequently-broken areas
- **Medium risk (moderate coverage):** Core features with stable implementations, settings pages
- **Low risk (minimal coverage):** Admin-only features, rarely-used configuration, read-only pages

- **Evidence:** Cross-suite strategy analysis from rounds 56-62; Excalidraw and Supabase as narrow-deep exemplars; Grafana, Cal.com, Ghost as balanced exemplars
- **Anti-pattern:** Applying narrow-deep strategy across the entire suite — exhaustive testing of every feature leads to slow suites and diminishing returns. Reserve depth for CUJs and high-risk areas.

### COV3.4 Plan for common growth triggers and infrastructure investment

Test suites grow in response to specific triggers. Plan infrastructure investment ahead of growth:

| Growth Trigger | Rate | Infrastructure Needed |
|----------------|------|----------------------|
| New feature development | 1-3 specs/feature (most common) | Page objects, fixtures for the new feature area |
| Framework migration | Burst: 10-20 tests/week | Migration guide, parallel test execution (Grafana: 8-month Cypress-to-Playwright migration) |
| Bug-driven regression | 1 spec per production incident | Regression test directory or tags |
| Security audit | 5-15 specs in concentrated period | Auth fixtures, role-based test users |
| Infrastructure maturity | Accelerated test creation | Fixture investment, page objects, data factories (n8n: 69 page objects enable rapid addition) |

**Suite size milestones and required investment:**

| Milestone | Infrastructure Investment |
|-----------|-------------------------|
| 0-20 tests | Basic config, auth fixture, 1-2 page objects |
| 20-50 tests | Feature directories, shared fixtures, CI integration |
| 50-100 tests | Sharding, page object library, data management strategy |
| 100-200 tests | Structural tiering, change detection, fixture factories |
| 200-500 tests | Multi-project config, dedicated CI workflows, CUJ directory |
| 500+ tests | Full tier strategy, merge queue differentiation, coverage monitoring |

- **Evidence:** Grafana migration arc (8 months, 163 files), Cal.com organic growth (73 files tracking features), n8n infrastructure-first growth (69 page objects, 174 specs), Element Web security-driven growth (20 crypto specs out of 209)
- **Anti-pattern:** Writing 100+ tests without investing in fixtures and page objects — leads to test duplication, maintenance burden, and eventual suite abandonment.

---

## COV4. Negative & Edge Case Testing

### COV4.1 Target 80-90% happy-path, 10-20% error-path at the E2E level

The pragmatic norm across production suites is 85:15 happy-path to error-path ratio at the E2E layer. This is not a gap — it reflects a deliberate division of responsibility across test layers.

**Cross-suite error-path ratios:**

| Suite | Happy:Error Ratio | Error Focus Areas |
|-------|------------------|-------------------|
| Cal.com | 70:30 | Race conditions, concurrent contexts, special characters, disabled features |
| Immich (API) | 70:30 | 401/403/400 responses, permission enforcement |
| Grafana plugin-e2e | 70:30 | Missing API key, invalid queries, unsuccessful annotations |
| Grafana | 80:20 | Special characters, duplicates, empty states, conflicting settings |
| n8n | 80:20 | Chaos testing, memory consumption, retention, regression |
| Ghost CMS | 88:12 | Disabled member, disabled commenting, theme error notifications |
| Element Web | 88:12 | Key reset, backup deletion, device dehydration |
| Excalidraw | 90:10 | "Element too small" noop, history noop after undo |
| freeCodeCamp | 90:10 | 404 pages, invalid URLs, blocked user pages |
| Gutenberg | ~85:15 | Invalid input, broken blocks |
| Slate | 95:5 | Forced layout persistence after deletion |
| AFFiNE | 95:5 | Deleted items stay deleted, modals close properly |

**Cross-suite average: 85:15 happy-path to edge-case ratio.**

**Error coverage varies dramatically by test layer:**
- **API-level E2E tests** (Immich, Ghost): ~30% error coverage — fast execution enables more negative cases
- **SDK/framework E2E tests** (Grafana plugin-e2e): ~30% error coverage — explicit "should fail when..." tests
- **UI-level E2E tests** (all suites): ~5-15% error coverage — slower execution limits negative case count

- **Evidence:** Cross-suite ratio analysis of 15 suites across rounds 56-62 and round 70 deep dive
- **Anti-pattern:** Targeting 50%+ error-path coverage at the UI E2E layer — no production suite achieves this. Delegate most error-path testing to API or unit layers where feedback is faster.

### COV4.2 Focus E2E negative testing on the six categories that production suites actually test

Ranked by frequency across suites, these are the error types worth testing at E2E:

**1. Permission enforcement (8/15 suites) — MUST test:**
- Unauthorized users get 401/403 responses or are redirected
- Role-limited users cannot access admin features
- Implementation: Grafana uses separate `admin` and `viewer` Playwright projects; Immich uses a systematic 4-user permission matrix

**2. Empty/error states (6/15 suites) — SHOULD test:**
- No results displayed correctly (empty dashboard, no members)
- Disabled features show appropriate messaging (Ghost: disabled commenting)
- Loading failure states (Element Web: failed key backup)

**3. Input validation on critical forms (5/15 suites) — SHOULD test:**
- Invalid form inputs show validation errors (Cal.com: invalid URLs)
- Malformed data is rejected (Immich: missing required fields)
- Special characters handled correctly (Grafana: special characters in selectors)

**4. Conflict resolution (3/15 suites) — NICE TO HAVE:**
- Concurrent operations handled gracefully (Cal.com: booking conflicts)
- Duplicate entries handled (Grafana: duplicate panel names)

**5. Recovery flows (3/15 suites) — NICE TO HAVE:**
- Password reset (Element Web: forgot-password flow)
- Backup restoration (Element Web: key backup recovery)
- Undo/rollback (AFFiNE: trash/restore)

**6. Network/infrastructure errors (2/15 suites) — SPECIALIZED:**
- Mocked network failures (Immich UI mock tests via `page.route()`)
- Deliberate failure injection (n8n: chaos testing, 2 specs)

- **Evidence:** Cross-suite negative testing analysis from rounds 56-62 and round 70 deep dive; Immich API error DTO pattern; Cal.com booking conflict tests; n8n chaos testing
- **Anti-pattern:** Testing implementation-level errors (null pointer exceptions, type errors, unhandled promises) at E2E — these are invisible to users and belong in unit tests.

### COV4.3 Use API-level tests for systematic error coverage, not UI E2E

When comprehensive error coverage is needed, invest in API-level E2E tests rather than adding UI error tests. API tests are faster, more stable, and achieve higher error coverage ratios.

**Immich's error testing pattern (best-in-class):**

```typescript
// Error DTO factory — pre-built expected error shapes
const errorDto = {
  unauthorized: { message: 'Authentication required', statusCode: 401 },
  forbidden: { message: expect.any(String), statusCode: 403 },
  badRequest: (msg: string) => ({ message: msg, statusCode: 400 }),
};

// Systematic endpoint error testing
// For EACH API endpoint, test:
// - Unauthenticated access (401)
// - Unauthorized role access (403)
// - Invalid input (400)
// - Not found (404) where applicable
// - Valid request (200/201)
```

**Immich's permission matrix pattern:**
- `beforeAll` creates 4 users with different roles
- Each `it` block tests one permission scenario
- Admin -> succeeds, Regular user -> own resources, Other user -> 403, Unauthenticated -> 401

**UI-level negative testing via route mocking:**

```typescript
// Mock API failure for UI error state testing
await page.route('/api/data', route =>
  route.fulfill({ status: 500, body: '{"error": "Server Error"}' })
);
// Verify UI shows error message
await expect(page.getByText('Something went wrong')).toBeVisible();
```

Only 1/15 suites (Immich UI mock tests) extensively uses route mocking for negative testing. Most suites (12/15) test against real backends for error scenarios or skip them entirely.

- **Evidence:** Immich API tests (23 spec files, 70:30 happy-to-error ratio), Ghost API tests (60+ files), n8n regression tests (12 dedicated specs)
- **Valid alternative:** Testing error states via route mocking in UI tests — useful when API-level tests are not practical or for testing UI-specific error rendering
- **Anti-pattern:** Duplicating API error testing in UI E2E tests — if the API test already verifies that a 403 is returned for unauthorized access, adding a UI test that clicks a button and sees a 403 redirect adds execution time without meaningful coverage gain.

### COV4.4 Maintain a regression test directory for production incidents

When production incidents occur, capture the failure scenario as an E2E test to prevent recurrence. Dedicate a directory or naming convention for regression tests.

**Observed patterns:**
- **n8n:** Dedicated `regression/` directory with 12 spec files capturing previously-failed scenarios
- **Cal.com:** Flaky test fix PRs (PR #23487) reference and stabilize existing regression tests
- **Next.js:** Manifest files track per-test pass/fail/flake status, serving as regression indicators
- **Gutenberg:** Custom `flaky-tests-reporter` tracks test stability over time

**Regression test workflow:**
1. Production incident occurs
2. Write minimal E2E test that reproduces the failure
3. Place in `regression/` directory or mark with clear naming (`issue-1234-booking-conflict.spec.ts`)
4. Verify the test fails against the broken code, passes against the fix
5. Regression test runs as part of the standard suite going forward

- **Evidence:** n8n regression directory (12 specs), Gutenberg flaky-tests-reporter, Next.js manifest tracking
- **Valid alternative:** Placing regression tests in the relevant feature directory rather than a dedicated regression directory — acceptable if the test naming makes the origin clear
- **Anti-pattern:** Writing regression tests that are too specific to the exact failure scenario and break on unrelated changes — regression tests should verify the user-facing behavior that was broken, not the implementation detail that caused the bug.

---

## COV5. Coverage Measurement & Health

### COV5.1 Do NOT require code coverage percentages for E2E tests

No production suite measures E2E code coverage as a gating metric. This is the industry norm, not a gap. Code coverage is misleading for E2E tests: a test could click every button without verifying results and achieve high coverage.

**Why suites skip E2E code coverage (from cross-suite analysis):**

1. **Chromium-only limitation:** V8 coverage API works only in Chromium. Suites testing Firefox/WebKit (Element Web, Gutenberg, Slate) cannot collect coverage in cross-browser runs.
2. **Build pipeline complexity:** Istanbul instrumentation requires modifying the build, adding environment-conditional plugins, and managing coverage across page navigations.
3. **Coverage is not correctness:** The Currents.dev guide warns: "100% coverage does not equal perfect tests." Executing a line is not the same as verifying its behavior.
4. **Structural coverage is sufficient:** Teams achieve "coverage awareness" through directory completeness (one test directory per feature). Formal code coverage adds tooling overhead without adding insight.
5. **Cost-benefit at scale:** n8n runs its coverage workflow weekly (not per-PR), suggesting even the one adopter considers the per-PR cost too high.

**Production suite adoption:**

| Approach | Suites | Count |
|----------|--------|-------|
| No formal E2E coverage measurement | Grafana, Cal.com, Element Web, Ghost, freeCodeCamp, Gutenberg, Rocket.Chat, Excalidraw, Supabase, Slate | 10/15 |
| Structural completeness as proxy | Grafana (smoke vs CUJ vs full), Next.js (manifest tracking) | 2/15 |
| Partial infrastructure (fixture support, not in CI) | AFFiNE (CDP coverage collection support) | 1/15 |
| Weekly coverage CI workflow | n8n (`test-e2e-coverage-weekly.yml`) | 1/15 |
| Manifest-based tracking | Next.js (JSON manifests with pass/fail/flake per test) | 1/15 |

- **Evidence:** 13/15 suites have zero formal E2E coverage measurement; 1/15 (n8n) runs coverage weekly; community guidance from Kent C. Dodds ("test use cases, not code"), Currents.dev, BugBug
- **Anti-pattern:** Setting a code coverage percentage target (e.g., "E2E must cover 80% of lines") — this creates perverse incentives to write broad, shallow tests that execute code without verifying behavior. Focus on CUJ coverage (COV3.1) instead.

### COV5.2 Track coverage through structural completeness as the primary heuristic

Structural completeness — one test directory per feature area — is the universal coverage heuristic. It requires zero tooling, works with any framework, and is visible in code review.

**How structural completeness works:**
- Each feature area has a corresponding test directory (e.g., `tests/dashboards/`, `tests/auth/`, `tests/bookings/`)
- Missing directories indicate untested features
- PR review ensures new features include tests
- Directory listing serves as the coverage map

**Structural completeness audit checklist:**
1. List all product feature areas
2. Map each to a test directory
3. Identify gaps (features with no corresponding test directory)
4. Prioritize gap filling using COV3.2 growth order

**Grafana example (structural = coverage map):**
```
e2e-playwright/
  smoke-tests-suite/       # Tier 1: health check
  dashboard-cujs/          # Tier 2: critical user journeys
  dashboards-suite/        # Feature: dashboards
  panels-suite/            # Feature: panels
  dashboard-new-layouts/   # Feature: new layout system
  various-suite/           # Feature: miscellaneous
  alerting-suite/          # Feature: alerting (sparse — known gap)
  unauthenticated/         # Context: pre-auth flows
```

The `alerting-suite/` directory having only 1 file is immediately visible as a coverage gap, without any tooling.

- **Evidence:** 13/15 suites rely on structural completeness; Grafana's directory structure explicitly maps to product features; Ghost's 6+ config files each cover a distinct application layer
- **Anti-pattern:** Maintaining an external spreadsheet of test coverage that drifts from reality — the test directory structure IS the coverage map. Keep them in sync by convention.

### COV5.3 Use feature-scenario tracking as an optional structured enhancement

For teams that need more visibility than directory structure provides, maintain a feature-to-scenario mapping. This is an enhancement over structural completeness, not a replacement.

**Feature-scenario matrix format:**

| Feature | Positive Scenarios | Negative Scenarios | Edge Cases | Status |
|---------|-------------------|-------------------|------------|--------|
| Login | 3 (email, OAuth, 2FA) | 2 (bad password, locked account) | 1 (expired session) | Complete |
| Booking | 5 (single, team, recurring, paid, rescheduled) | 1 (conflict) | 0 | Partial |
| Dashboard | 4 (create, edit, delete, share) | 0 | 0 | Minimal |

**Tools (community-referenced, low adoption):**
- `feature-map` npm package — YAML-based feature-to-test mapping (Playwright Solutions). Limitations: binary coverage, manual maintenance, no depth tracking.
- Test management platforms (Testomat.io, Currents) — external tooling for scenario tracking
- Custom flaky-test tracking (Gutenberg: `flaky-tests-reporter`, Next.js: JSON manifests)

**Target:** 80% scenario coverage of high-priority workflows (Alphabin community guidance). This means 80% of identified CUJ scenarios have at least one E2E test, not 80% code coverage.

- **Evidence:** Community guidance from Alphabin, BugBug, Playwright Solutions; 0/15 production suites use formal scenario tracking (all rely on structural completeness or manifest tracking instead)
- **Valid alternative:** Continuing with structural completeness only — this is what every production suite does. Scenario tracking is aspirational.
- **Anti-pattern:** Spending more time maintaining the coverage tracking system than writing tests — coverage tracking should take < 30 minutes per sprint to update.

### COV5.4 If collecting code coverage, use weekly CI rather than per-PR execution

When quantitative coverage data is desired, follow the n8n pattern: run coverage collection on a scheduled basis (weekly), not on every PR.

**Available tools for E2E code coverage collection:**

| Tool | Mechanism | Limitations |
|------|-----------|-------------|
| **V8 Coverage API** (`page.coverage.startJSCoverage()`) | Chromium DevTools Protocol | Chromium only; raw byte offsets require `v8-to-istanbul` post-processing; cached artifacts can mismatch |
| **Istanbul instrumentation** (`babel-plugin-istanbul`, `vite-plugin-istanbul`) | Build-time code injection | Requires build modification; coverage lost on page navigation; environment-conditional compilation |
| **Monocart Reporter** (`monocart-reporter`) | V8 coverage via Playwright reporter lifecycle | Chromium only; automatic shard merging; CSS + HTML coverage; 365+ GitHub stars |
| **nextcov** | V8 (client) + NODE_V8_COVERAGE (server) | Next.js/Vite specific; can merge E2E + unit coverage; 10 GitHub stars (very early) |

**Weekly CI pattern (n8n reference):**
- Dedicated `test-e2e-coverage-weekly.yml` workflow
- Triggered by cron schedule, not PR events
- Full suite execution with V8 coverage instrumentation
- Coverage report published for team review
- Tracks trends over time without per-PR overhead

**Merged coverage (experimental):**
When both E2E and unit test coverage are collected, merging them produces the most meaningful metric. Example: ~80% unit + ~46% E2E = ~88% combined (nextcov demo). This identifies code paths that neither layer exercises.

- **Evidence:** n8n (only suite with weekly coverage CI); AFFiNE (CDP coverage fixture support but not in CI); monocart-reporter (Rocket.Chat uses for styled reports but coverage feature not enabled); nextcov demo project
- **Valid alternative:** Not collecting code coverage at all — this is what 13/15 production suites do, and they operate successfully
- **Anti-pattern:** Running coverage collection on every PR — the performance overhead and Chromium-only limitation make per-PR coverage impractical at scale. n8n runs coverage weekly for exactly this reason.

### COV5.5 Assess suite health using the coverage maturity model

Use the following maturity model to assess where your suite stands and plan improvements incrementally:

| Level | Name | Description | Evidence | Adoption |
|-------|------|-------------|----------|----------|
| **0** | None | No coverage tracking of any kind | Ad hoc test writing, no structural organization | Rare (only very early suites) |
| **1** | Structural | Directory = feature coverage; gaps visible in file tree | One test directory per feature area; PR review ensures new features include tests | 13/15 suites (universal floor) |
| **2** | Scenario tracking | Feature-to-scenario mapping maintained alongside tests | Spreadsheet, YAML, or test management platform tracking which scenarios are covered | 0/15 suites in practice; community-recommended |
| **3** | Quantitative | Code coverage collected and reported on a schedule | Weekly CI workflow with V8/Istanbul; trend tracking | 1/15 suites (n8n weekly) |
| **4** | Integrated | E2E + unit coverage merged; coverage as part of PR review | Unified coverage report from multiple test layers; coverage diffs in code review | 0/15 suites; experimental tooling only (nextcov) |

**Current state of the industry:** Level 1 (structural completeness) is the universal floor. Level 2 is community-recommended but not practiced. Level 3-4 are aspirational with immature tooling. The gap between community guidance and practice is the largest of any area studied in this research.

**Recommended progression:**
1. Start at Level 1 — ensure every feature area has a test directory
2. Consider Level 2 if test gaps are causing production incidents — add scenario tracking for critical paths only
3. Consider Level 3 only if the team needs trend data to justify E2E investment to stakeholders
4. Level 4 requires experimental tooling and is not recommended for production use today

- **Evidence:** Maturity model derived from cross-suite analysis of 15 suites plus community tool landscape from round 71; n8n as only Level 3 adopter; nextcov as only Level 4 demonstration
- **Anti-pattern:** Targeting Level 4 before achieving Level 1 — teams that invest in coverage tooling before organizing tests into feature directories get misleading metrics from a disorganized suite.
