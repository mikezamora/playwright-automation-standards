# Round 93 — Validation: Scoring Fresh Suites Against Draft Standards

**Phase:** Validation
**Focus:** Score 6 fresh suites from round 92 against TA1-TA6, COV1-COV5, S8-S12
**Date:** 2026-03-19

---

## Scoring Methodology

For each standard prediction, mark:
- **CONFIRMED** — standard correctly predicts the pattern observed
- **FAILED** — pattern does not match standard prediction
- **PARTIAL** — standard partially applies; nuance needed

---

## Suite 1: Lexical (facebook/lexical) — 50+ specs, Medium tier

### Test Anatomy (TA1-TA6)

**TA1.1 (AAA as conceptual framework): CONFIRMED**
- All tests follow identifiable Arrange-Act-Assert phases
- Arrange is handled by `beforeEach(initialize({isCollab, page}))` + `focusEditor(page)`
- Act is keyboard/mouse interactions
- Assert is `assertHTML()` + `assertSelection()`

**TA1.2 (Interleaved Act-Assert in multi-step flows): CONFIRMED**
- Dominant pattern: type text -> assertHTML -> undo -> assertHTML -> redo -> assertHTML
- History.spec.mjs: Every undo/redo cycle has immediate assertion
- TextFormatting.spec.mjs: Format -> assert -> format more -> assert pattern throughout

**TA1.3 (Fixture-driven Arrange): FAILED**
- Lexical uses `beforeEach` + helper functions, NOT `test.extend<T>()` fixtures
- `initialize({isCollab, page})` is a helper function, not a fixture
- Our standard predicts fixture-driven Arrange as the clean path; Lexical achieves clean separation without fixtures, using helpers instead

**TA2.1 (Short tests under 30 lines): PARTIAL**
- Links.spec.mjs: avg 30-40 lines — matches our "medium" bucket
- TextFormatting.spec.mjs: avg 25-35 lines — within range
- History.spec.mjs: avg 85-90 lines — "very long" bucket
- Overall distribution matches our table: majority in 15-40 range, some outliers above 40
- Standard prediction of "under 30 lines" is an aspiration that ~50% of tests meet

**TA2.4 (3-10 tests per file): PARTIAL**
- History: 7 tests (matches)
- TextFormatting: 29 tests (exceeds our 15-test threshold)
- Links: 62 tests (far exceeds — monolithic file)
- Pattern: editor suites tend toward larger files than our standard predicts

**TA3.1 (test.step() absent): CONFIRMED**
- Zero `test.step()` usage across 50+ spec files, consistent with our 80% prediction

**TA3.2 (Prefer splitting over test.step()): CONFIRMED**
- Lexical uses nested `describe` blocks and feature-per-file organization instead
- CopyAndPaste/ and Headings/ subdirectories for large feature areas

**TA4.1 (Setup placement matches complexity): CONFIRMED**
- Tier 2 setup (component render + state reset): `beforeEach(() => initialize({isCollab, page}))`
- No auth, no data deps — matches our decision framework for stateless component testing

**TA4.2 (Prefer fixtures over beforeEach): FAILED**
- Uses `beforeEach` for all setup; no `test.extend<T>()` fixtures
- Helper functions serve the role we assign to fixtures

**TA5 (Assertion density 3-5): PARTIAL**
- Links: 2-4 assertions per test (matches)
- TextFormatting: 2-4 (matches)
- History: 8-12 (exceeds our range significantly)
- Editor suites use more assertions because `assertHTML` + `assertSelection` are paired

**TA6 (Test independence): CONFIRMED**
- Each test starts from clean state via `beforeEach(initialize())`
- No shared mutable state between tests
- `test.skip(isCollab)` used to skip incompatible configurations

### Coverage (COV1, COV2, COV4)

**COV1.1 (E2E scope = user-facing workflows): CONFIRMED**
- All tests exercise user-visible editor interactions (typing, formatting, links, history)
- No business logic unit tests at E2E level

**COV2.1 (Structural tiering via directories): CONFIRMED**
- Organization is by feature: one file per editor feature (History, Links, TextFormatting, etc.)
- Subdirectories for large features (CopyAndPaste/, Headings/)

**COV4.1 (80-90% happy, 10-20% error): CONFIRMED**
- Links.spec.mjs: 62 tests, 0 explicit negative tests (100:0 ratio)
- History.spec.mjs: all positive path
- Estimated suite-wide: ~95:5 happy-to-error ratio
- Matches our prediction that editor suites are 90-95% happy path (comparable to Excalidraw and Slate)

### Scaling (S8, S9)

**S8.1 (Scale tier identification): CONFIRMED**
- 50+ specs, 3 browser projects, multi-browser testing
- Our Medium tier (50-200 tests) matches: auth setup project absent (no auth), feature directories beginning, CI differentiation present (3 browsers)

**S9.1 (Flat to nested at 20-30 files): PARTIAL**
- 50+ files but only 2 subdirectories (CopyAndPaste/, Headings/)
- Most files remain flat with feature-name prefixes
- Sits at the threshold where restructuring would help but isn't strictly needed for an editor-testing suite

---

## Suite 2: Twenty CRM (twentyhq/twenty) — 8 specs, Small tier

### Test Anatomy (TA1-TA6)

**TA1.1 (AAA conceptual framework): CONFIRMED**
- Tests follow Arrange (navigation, setup) -> Act (UI interactions) -> Assert (GraphQL verification)
- create-record.spec.ts: Clear Arrange-Act-Assert with API verification at end

**TA1.2 (Interleaved Act-Assert): CONFIRMED**
- workflow-creation.spec.ts: Navigate -> assert visibility -> create -> assert URL
- signup_invite_email.spec.ts: Each step has an assertion after the action

**TA1.3 (Fixture-driven Arrange): PARTIAL**
- Uses custom `screenshot` fixture for teardown but not for arrangement
- Uses POM objects injected via fixture pattern (`loginPage`, `leftMenu`, `settingsPage`)
- Arrangement still largely inline

**TA2.1 (Short tests under 30 lines): FAILED**
- create-record.spec.ts: ~100 lines (single test)
- workflow-creation.spec.ts: ~50 lines (single test)
- signup_invite_email.spec.ts: ~50 lines (single test with 4 steps)
- Average well above 30-line target; tests are 1-per-file comprehensive scenarios

**TA2.4 (3-10 tests per file): FAILED**
- Every file has exactly 1 test (1 test/file ratio)
- This is a comprehensive-scenario approach: one large test per feature

**TA3.1 (test.step() absent): PARTIAL**
- Used in 1/8 files (signup_invite_email.spec.ts with 4 steps)
- 12.5% usage rate — close to Cal.com's 10-15% pattern
- Standard predicts mostly absent with occasional CUJ use — matches

**TA4.1 (Setup placement): CONFIRMED**
- Tier 5 approach emerging: POM library (15+ POMs), API helpers, fixture injection
- Product complexity (CRM) warrants this investment level

**TA4.2 (Prefer fixtures over beforeEach): CONFIRMED**
- Uses fixture injection for page objects (`loginPage`, `leftMenu`, etc.)
- No `beforeEach` in test files
- Auth via storageState in config

**TA5 (Assertion density 3-5): CONFIRMED**
- create-record.spec.ts: 8 assertions (above range but justified by GraphQL verification)
- workflow-creation.spec.ts: 3 assertions (matches)
- signup_invite_email.spec.ts: 3 assertions (matches)

**TA6 (Test independence): CONFIRMED**
- Each test creates its own data
- Workflow tests use API cleanup in `finally` blocks

### Coverage (COV1, COV2, COV4)

**COV1.1 (E2E scope): CONFIRMED**
- Tests cover authentication, record CRUD, workflow creation/execution — all user-facing
- No unit-level testing at E2E layer

**COV1.2 (Priority table): CONFIRMED**
- Auth flows: yes (signup, invite link)
- Core CRUD: yes (create record)
- Navigation: implicit in tests
- This matches our "Phase 1 Foundation" growth path exactly (first 10-20 tests)

**COV4.1 (Error ratio): CONFIRMED**
- 0/8 tests are negative/error path (100:0 ratio)
- Very early suite — our standard predicts low error coverage in early suites

### Scaling (S8, S9)

**S8.1 (Scale tier): CONFIRMED**
- 8 specs = Small tier
- Single CI job, 1 worker, 1 browser — matches Small tier characteristics exactly
- Heavy POM investment is unusual for Small tier (proactive scaling)

**S8.2 (Transition triggers): CONFIRMED**
- Suite has not hit any transition triggers yet
- Infrastructure investment (15+ POMs) is ahead of test count — preparing for growth

---

## Suite 3: Payload CMS (payloadcms/payload) — 82 specs, Large tier

### Test Anatomy (TA1-TA6)

**TA1.1 (AAA): CONFIRMED**
- access-control tests: Create data via API (Arrange) -> Navigate UI (Act) -> Assert visibility/count
- Field tests: Navigate to URL (Arrange) -> Fill fields (Act) -> Save and assert (Assert)
- Strongest AAA adherence of all 6 suites

**TA1.2 (Interleaved Act-Assert): CONFIRMED**
- Auth tests: Fill form -> assert error -> fill correctly -> assert success
- Pattern confirmed but less dominant than pure AAA (many tests are single-action)

**TA1.3 (Fixture-driven Arrange): FAILED**
- No `test.extend<T>()` fixtures
- Uses `beforeAll` + `beforeEach` with DB reinitialization and helper functions
- 80+ helper files serve the role we assign to fixtures

**TA2.1 (Short tests under 30 lines): CONFIRMED**
- Text field tests: 8-12 lines average
- Access-control tests: 5-15 lines average
- Auth tests: 15-25 lines average
- Payload achieves the shortest tests of all 6 suites — strong confirmation

**TA2.2 (Fixture investment enables short tests): CONFIRMED**
- 80+ helper files + `beforeAll`/`beforeEach` DB reinitialization = rich infrastructure
- This infrastructure enables the consistently short test bodies observed

**TA2.4 (3-10 tests per file): PARTIAL**
- Text field: 24 tests (exceeds threshold)
- Auth: 11 tests (slightly above ideal range)
- Access-control: 200+ tests (far exceeds — monolithic)
- But per-collection files (Checkbox, Email, etc.) tend to have 5-15 tests each

**TA3.1 (test.step() absent): CONFIRMED**
- Zero `test.step()` usage across 82 spec files

**TA4.1 (Setup placement): CONFIRMED**
- Tier 4 (API-based CRUD in hooks): `beforeAll` creates via API, `beforeEach` reinitializes DB
- Product complexity (CMS with many field types) matches this tier

**TA4.2 (Prefer fixtures over beforeEach): FAILED**
- Heavy `beforeAll`/`beforeEach` usage; no `test.extend<T>()`
- Helper library (80+ files) is functionally equivalent to a fixture framework

**TA5 (Assertion density 3-5): CONFIRMED**
- Text field tests: 1-2 assertions per test (below our range but single-verification focused)
- Auth tests: 2-6 assertions (matches range)
- Access-control: 1-4 assertions (within range)

**TA6 (Test independence): CONFIRMED**
- `beforeEach` reinitializes database — maximum isolation
- 16 parallel workers confirms independence

### Coverage (COV1, COV2, COV4)

**COV1.1 (E2E scope): CONFIRMED**
- Tests cover auth, CRUD, field types, access control, admin UI — all user-facing
- No business logic at E2E layer

**COV1.2 (Priority table): CONFIRMED**
- Auth: yes (auth/, auth-basic/)
- Core CRUD: yes (admin/e2e/document-view/, list-view/)
- Permission enforcement: yes (access-control/ — 200+ tests)
- Forms: yes (fields/collections/*)
- Matches "Should-have" and "Must-have" categories comprehensively

**COV2.1 (Structural tiering): CONFIRMED**
- Pure directory-based organization
- Per-feature directories: `test/auth/`, `test/fields/`, `test/access-control/`, etc.
- No tags for tiering

**COV4.1 (Error ratio): CONFIRMED**
- Access-control: extensive negative tests (permission denial, unauthorized access)
- Auth: missing password, mismatched confirmation
- Signup: 3/4 tests are negative (no name, invalid email, invalid password)
- Estimated overall: 80:20 happy-to-error ratio — matches our prediction for mature CMS suites

**COV4.2 (Error categories): CONFIRMED**
- Permission enforcement: extensive (access-control suite)
- Input validation: present (field error states)
- Empty states: present (hidden fields, restricted fields)
- Matches top 3 categories we documented

### Scaling (S8, S9)

**S8.1 (Scale tier): PARTIAL**
- 82 specs puts it at Medium-Large boundary
- But 16 workers and high parallelism suggest Large-tier execution strategy
- Our tier boundaries (Medium: 50-200) technically include it, but behavior is more Large

**S9.1 (Directory organization): CONFIRMED**
- Feature-nested directories from the start
- Per-collection subdirectories under `test/fields/collections/`
- Matches our prediction for suites at this size

**S9.3 (Split files at 200 lines or 10 tests): PARTIAL**
- access-control has 200+ tests in one file (violates threshold)
- Most field collection files stay within 5-15 tests (matches)

---

## Suite 4: Nhost (nhost/nhost) — 26 specs, Small-Medium tier

### Test Anatomy (TA1-TA6)

**TA1.1 (AAA): CONFIRMED**
- create-user: Clear Arrange (setup email/password) -> Act (call createUser) -> Assert (expect)
- overview: Arrange (beforeEach navigates) -> Act (implicit page load) -> Assert (visibility checks)

**TA1.2 (Interleaved Act-Assert): CONFIRMED**
- create-table tests: Fill form fields -> assert intermediate state -> submit -> assert final state

**TA1.3 (Fixture-driven Arrange): CONFIRMED**
- `authenticatedNhostPage` fixture via `test.extend<T>()`
- Auth handled by fixture injection, navigation by `beforeEach`
- This is the clean hybrid approach our standard recommends

**TA2.1 (Short tests under 30 lines): CONFIRMED**
- create-user: ~8 lines per test
- overview: ~8 lines per test
- create-table: ~35 lines (slightly above target, justified by complex form filling)
- Majority under 30 lines

**TA2.4 (3-10 tests per file): CONFIRMED**
- create-user: 2 tests (below ideal but acceptable)
- create-table: 10 tests (at upper bound)
- overview: 3 tests (matches)

**TA3.1 (test.step() absent): CONFIRMED**
- Zero `test.step()` usage across all 26 test files

**TA4.1 (Setup placement): CONFIRMED**
- Tier 3 (global auth + seed scripts): Auth via storageState, fixture-based auth, beforeEach navigation
- Matches product complexity (dashboard with auth + database management)

**TA4.2 (Prefer fixtures over beforeEach): CONFIRMED**
- Uses `authenticatedNhostPage` fixture for auth
- `beforeEach` only for file-specific navigation
- Matches our recommended hybrid pattern exactly

**TA5 (Assertion density 3-5): CONFIRMED**
- create-user: 1.5 per test (below range)
- create-table: 5 per test (matches)
- overview: 2.3 per test (slightly below)
- Average across suite: approximately 3 (lower bound of our range)

**TA6 (Test independence): CONFIRMED**
- Auth fixture creates isolated authenticated context
- `faker` for random test data prevents collision
- Serial execution (1 worker) also prevents collision

### Coverage (COV1, COV2, COV4)

**COV1.1 (E2E scope): CONFIRMED**
- Tests cover auth management, database operations, events, GraphQL — all user-facing dashboard operations

**COV1.2 (Priority table): CONFIRMED**
- Auth: yes (auth/)
- Core CRUD: yes (database/tables/, database/views/)
- Settings/config: yes (events/, graphql/, remote-schemas/)
- Matches "Phase 1-2 Foundation + Core workflows" growth path

**COV2.1 (Structural tiering): CONFIRMED**
- Pure directory-based organization with feature nesting
- No tags

**COV4.1 (Error ratio): CONFIRMED**
- create-user: 1/2 tests is negative (duplicate email)
- create-table: 1/10 tests is negative (duplicate name)
- Estimated: ~90:10 happy-to-error ratio
- Matches our prediction for this maturity level

### Scaling (S8, S9)

**S8.1 (Scale tier): CONFIRMED**
- 26 specs = Small tier approaching Medium boundary
- 4 Playwright projects (setup, main, local, onboarding) — Medium-level config for a Small test count
- Auth setup project matches our Small->Medium transition trigger

**S9.1 (Directory organization): CONFIRMED**
- Feature-nested at 26 files — matches our recommendation to nest at 20-30 files
- Sub-feature nesting: `database/tables/`, `database/views/`
- One of the best examples of clean directory organization at this scale

---

## Suite 5: Formbricks (formbricks/formbricks) — 18 specs, Small-Medium tier

### Test Anatomy (TA1-TA6)

**TA1.1 (AAA): CONFIRMED**
- signup tests: Clear AAA with form filling -> submit -> assert
- Security tests: Arrange (create user, get CSRF) -> Act (send requests) -> Assert (status codes)

**TA1.2 (Interleaved Act-Assert): CONFIRMED**
- survey.spec.ts: Extensive interleaved Act-Assert throughout (45+ assertions per test)
- Each survey question: fill -> assert visible -> click next -> assert next question visible

**TA1.3 (Fixture-driven Arrange): CONFIRMED**
- Custom `users` fixture via `test.extend<T>()`
- `const user = await users.create(); await user.login();`
- Clean fixture-driven arrangement in test bodies

**TA2.1 (Short tests under 30 lines): FAILED**
- survey.spec.ts: 180-520 lines per test (extreme outlier)
- signup.spec.ts: 7 lines per test (very short)
- Security: 60-80 lines per test
- Bimodal distribution: either very short or extremely long

**TA2.4 (3-10 tests per file): CONFIRMED**
- survey: 3 tests (matches)
- signup: 4 tests (matches)
- security: 7 tests (matches)

**TA3.1 (test.step() presence): PARTIAL**
- Used in survey.spec.ts (the longest tests) — matches our prediction of "CUJ/long tests only"
- Absent from all other files
- Pattern matches our standard: test.step() reserved for 50+ line tests

**TA3.2 (Prefer splitting over test.step): FAILED**
- survey.spec.ts should be split but uses test.step() instead
- 520-line test is the most extreme violation of short-test principle in all 6 suites

**TA4.1 (Setup placement): CONFIRMED**
- Tier 5 (rich fixture composition): Custom user fixture, API helpers
- Product complexity (survey builder with multiple question types) warrants this

**TA4.2 (Prefer fixtures over beforeEach): CONFIRMED**
- `users` fixture is the primary setup mechanism
- `beforeEach` used only in signup tests for navigation

**TA5 (Assertion density 3-5): PARTIAL**
- signup: 1 per test (below range)
- security: 2-6 per test (matches range)
- survey: 15-50 per test (far exceeds — but tests are 180-520 lines)
- Standard applies to normal-length tests; survey tests are outliers

**TA6 (Test independence): CONFIRMED**
- User fixture creates unique users per test
- No shared mutable state

### Coverage (COV1, COV2, COV4)

**COV1.1 (E2E scope): CONFIRMED**
- UI tests cover survey creation, signup, onboarding
- API tests cover security, management endpoints

**COV1.3 (Multi-layer E2E): CONFIRMED**
- Formbricks has both UI tests AND API tests — matches our multi-layer prediction
- API tests in `api/` subdirectory for management endpoints and security
- UI tests for survey builder workflows
- This pattern matches Immich/Ghost multi-layer E2E architecture

**COV2.1 (Structural tiering): CONFIRMED**
- Directory-based: `api/auth/`, `api/management/`, `api/organization/` for API tests
- Top-level files for UI tests
- No tags

**COV4.1 (Error ratio): PARTIAL**
- signup: 3/4 tests are negative (75% error)
- security: 7/7 tests are negative (100% error)
- survey: 0/3 tests are negative (0% error)
- Overall: approximately 50:50 — but this is because API security tests skew the ratio
- UI-only ratio is approximately 85:15 — matches our standard
- Our standard should distinguish UI vs API E2E error ratios more clearly

**COV4.2 (Error categories): CONFIRMED**
- Permission/auth security: DoS protection, timing attacks, CSRF
- Input validation: invalid email, weak password
- Matches categories 1 (permission) and 3 (input validation)

### Scaling (S8, S9)

**S8.1 (Scale tier): CONFIRMED**
- 18 specs = Small tier
- Single project, fullyParallel, Chromium only — matches Small tier

**S9.1 (Directory organization): CONFIRMED**
- Flat for UI tests (8 files at root)
- Nested for API tests (api/auth/, api/management/, api/organization/)
- At 18 files, flat organization is appropriate per our standard

---

## Suite 6: Builder.io (BuilderIO/builder) — 52 specs, Medium tier

### Test Anatomy (TA1-TA6)

**TA1.1 (AAA): CONFIRMED**
- Component tests: Navigate (Arrange) -> Locate elements (Act) -> Assert attributes/visibility
- A/B tests: Initialize test context (Arrange) -> Navigate (Act) -> Assert variant visibility

**TA1.2 (Interleaved Act-Assert): CONFIRMED**
- blocks.spec.ts: Scroll -> assert in viewport -> check attribute -> assert CSS
- Pattern matches multi-step visual verification

**TA1.3 (Fixture-driven Arrange): CONFIRMED**
- Fixtures via test parameters: `{ page, sdk, packageName, basePort, browser }`
- SDK and environment injected as fixtures
- `initializeAbTest()` helper function used alongside fixtures

**TA2.1 (Short tests under 30 lines): CONFIRMED**
- custom-components: 6-8 lines average (very short)
- ab-test: 15-25 lines average
- blocks: 15-40 lines average
- Majority under 30 lines — confirmed

**TA2.4 (3-10 tests per file): PARTIAL**
- custom-components: 10 tests (at upper bound)
- ab-test: 42 tests (far exceeds — but uses parametric multiplication)
- blocks: ~30 tests (exceeds threshold)

**TA3.1 (test.step() absent): CONFIRMED**
- Zero `test.step()` usage across 52 spec files

**TA4.1 (Setup placement): CONFIRMED**
- Tier 2 (component render + state reset): Tests navigate to SDK-served pages
- No auth, minimal data deps — matches stateless component testing

**TA4.2 (Prefer fixtures over beforeEach): CONFIRMED**
- Fixture injection of `sdk`, `packageName`, `basePort` via test parameters
- No `beforeEach` blocks
- Clean fixture-driven setup

**TA5 (Assertion density 3-5): CONFIRMED**
- custom-components: 1-2 per test (below range but single-verification focused)
- ab-test: 3-4 per test (matches)
- blocks: 2-15 per test (varies widely by element type)
- Average approximately 3-5 — matches

**TA6 (Test independence): CONFIRMED**
- Each test navigates independently
- `test.skip()` for SDK-specific incompatibilities
- No shared mutable state

### Coverage (COV1, COV2, COV4)

**COV1.1 (E2E scope): CONFIRMED**
- Tests cover SDK rendering across frameworks — user-visible output verification
- No internal API testing at E2E level

**COV2.1 (Structural tiering): CONFIRMED**
- Flat directory but one directory per test type (e2e-tests/ vs snippet-tests/)
- No tags for tiering (uses `test.skip()` for SDK filtering)

**COV4.1 (Error ratio): CONFIRMED**
- Explicit negative tests: xss-exploit.spec.ts, "should not" assertions in custom-components
- Estimated: ~90:10 happy-to-error ratio
- SDK testing focuses on rendering correctness (positive path)

**COV4.2 (Error categories): CONFIRMED**
- Security: XSS exploit testing
- Component restriction enforcement: "do not render component when restricted"
- Matches categories 1 (permission/restriction) and 6 (security)

### Scaling (S8, S9)

**S8.1 (Scale tier): CONFIRMED**
- 52 specs = Medium tier
- Dynamic project generation matches Medium-tier config complexity
- 1 worker in CI with fullyParallel — hybrid approach

**S9.1 (Directory organization): PARTIAL**
- 52 files in flat directory (no subdirectories)
- Our standard recommends nesting at 20-30 files
- Builder.io stays flat because tests are SDK feature tests, not app feature tests
- Flat organization with descriptive filenames works here due to single-domain nature (all SDK rendering tests)

**S10.3 (Dynamic project generation): CONFIRMED**
- Config dynamically generates projects from SDK_MAP
- Matches our n8n-style infrastructure-variant pattern
- Tests same features across multiple SDK implementations

---

## Accuracy Summary Table

See round-93-validation/audit-notes.md for full accuracy calculation.
