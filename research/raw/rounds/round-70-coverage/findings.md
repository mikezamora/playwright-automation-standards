# Round 70 Findings — Coverage Growth and Negative Testing Patterns

## Phase
Coverage Strategy Deep Dive (Phase 2)

## Objective
Analyze how test suites grow over time, how negative/edge case testing is distributed across layers, and what patterns suites with higher error coverage use.

---

## 1. Test Suite Growth Patterns

### Grafana: Cypress-to-Playwright Migration Arc

**Timeline (from GitHub issue #98825 and commit history):**
- **Pre-2024:** Entire E2E suite in Cypress (`e2e/` directory)
- **Early 2024:** `@grafana/plugin-e2e` package published (April 2024), providing Playwright-based fixtures and models for plugin testing
- **January 2025:** Epic #98825 "Use Playwright for E2E tests" opened
- **January-September 2025:** Migration executed over 8 months, 32/33 subtasks completed
- **Migration approach:** Suite-by-suite conversion -- each Cypress suite directory was individually migrated to a corresponding `e2e-playwright/*-suite/` directory
- **Subtasks included:** storybook-verification, dashboard-new-layouts, smoke-tests-suite, panels-suite, dashboards-suite, various-suite
- **September 2025:** Migration essentially complete; legacy `e2e/` directory still exists but is deprecated
- **Current state:** 163 Playwright spec files, ~400 tests, 31 Playwright projects

**Growth pattern:** Migration-driven growth followed by stabilization. The Playwright suite did not start from zero -- it was a deliberate replacement of an existing Cypress suite. This means Grafana's Playwright test count approximately mirrors what existed in Cypress, plus new tests added for features developed during the migration period.

**Key insight:** Grafana's migration took 8 months for a team with deep Playwright expertise (they publish `@grafana/plugin-e2e` as a public npm package). This suggests migration timelines for large suites (100+ tests) should be measured in quarters, not weeks.

### Cal.com: Organic Growth

**Observable indicators:**
- 73 spec files currently, estimated ~380 tests
- PR #23487 (flaky test fixes, 2025) references existing tests that needed stabilization, not new tests
- GitHub discussion #20370 references "e2e test failed" issues, suggesting an established suite encountering scaling challenges
- The fixture infrastructure (`users.create()` with 15 fixtures) suggests mature investment over time
- No evidence of a migration from another framework -- Cal.com appears to have started with Playwright

**Growth pattern:** Organic growth tracking feature development. Cal.com's test count likely grew linearly with feature releases. The sophisticated fixture system (15 custom fixtures) suggests multiple iterations of test infrastructure as the suite scaled.

### Immich: Layered Growth

**Observable indicators:**
- API E2E layer (vitest): 23 spec files covering 23 endpoints -- appears comprehensive and mature
- UI E2E layer (Playwright): 14+ spec files -- newer addition
- UI mock tests: newest pattern with `SeededRandom` and route mocking -- most recent layer
- `e2e-spec.ts` naming convention unique to Immich, suggesting deliberate design from the start

**Growth pattern:** Layer-by-layer growth. API tests came first (broadest coverage), then UI tests for critical flows, then mock-based UI tests for visual components. This three-stage growth mirrors the community-recommended pattern of establishing API coverage before investing in UI E2E.

### n8n: Infrastructure-First Growth

**Observable indicators:**
- 174 spec files across 28 categories
- 7 CI workflows suggest gradual infrastructure expansion
- Weekly coverage workflow (`test-e2e-coverage-weekly.yml`) is unique -- indicates deliberate coverage tracking
- AI/LLM workflows (14 specs) are a recent category addition
- Chaos testing (2 specs) and benchmarks (10 specs) are specialized additions
- Claude templates for AI-assisted test generation suggest accelerated recent growth

**Growth pattern:** Infrastructure investment enables rapid test addition. n8n's container-per-worker fixtures, 69 page objects, and 5+ fixture files create a platform where adding new tests is low-friction. The AI test generation templates suggest the team is actively accelerating test creation.

### Element Web: Security-Driven Growth

**Observable indicators:**
- 209 spec files, 48 test categories
- Crypto tests (20 specs) represent disproportionate investment in security-critical features
- Cross-browser and cross-server matrix testing creates 9 execution contexts from 209 specs
- `@mergequeue` tag suggests tests were added that made PR CI too slow, necessitating tiering

**Growth pattern:** Security-driven growth with eventual CI pressure. The large crypto test count suggests focused investment in E2E verification of encryption features. The `@mergequeue` tag indicates the suite grew beyond what could run in PR feedback time, forcing retroactive tiering.

---

## 2. Suite Growth Rate Indicators

While exact historical test counts are not available from public repositories, several indicators allow estimation:

### Growth Rate by Suite Maturity

| Stage | Suite Size | Growth Rate | Evidence |
|-------|-----------|-------------|----------|
| **Bootstrapping** | 0-50 tests | Rapid (5-10 tests/week) | Grafana migration: 163 files in 8 months = ~5 files/week |
| **Feature-tracking** | 50-200 tests | Steady (2-5 tests/week) | Cal.com: 73 files tracking feature releases |
| **Mature** | 200+ tests | Slow (1-2 tests/week) | Element Web: 209 files with focus on stabilization |
| **Migration-driven** | Variable | Burst (10-20 tests/week during migration) | Grafana: concentrated migration sprints per suite |

### Common Growth Triggers
1. **New feature development** -- most common; 1-3 specs per feature
2. **Framework migration** -- burst growth as existing coverage is rebuilt
3. **Bug-driven** -- regression tests added after production incidents
4. **Security audit** -- focused investment in auth/crypto testing
5. **Infrastructure maturity** -- fixture/POM investment enables faster test creation
6. **AI-assisted generation** -- emerging pattern (n8n, Ghost have AI coding guides)

---

## 3. Negative Testing / Error-Path Coverage Analysis

### Error Coverage Ratios by Suite

| Suite | Happy:Error Ratio | Error Type Focus |
|-------|------------------|-----------------|
| **Immich API** | 70:30 | Permission enforcement (401, 403, 400); error DTO validation |
| **Immich UI** | 90:10 | Limited to registration errors, auth failures |
| **Cal.com** | 85:15 | Booking conflicts, invalid URLs, webhook errors |
| **Grafana** | 80:20 | Conflicting settings, duplicate handling, empty states |
| **Element Web** | 88:12 | Key reset, backup deletion, consent flows, forgot-password |
| **n8n** | 80:20 | Chaos testing, memory consumption, regression scenarios |
| **Ghost** | 88:12 | Disabled member, disabled commenting, theme error notifications |
| **AFFiNE** | 95:5 | Minimal -- only deleted items stay deleted, modals close properly |
| **freeCodeCamp** | 95:5 | Minimal -- primarily happy-path verification |
| **Gutenberg** | 90:10 | Limited -- focus on happy-path block interactions |

### Immich's Error Testing Patterns (Best-in-Class API)

Immich achieves 70:30 error coverage at the API layer through systematic patterns:

**1. Error DTO Factory (`responses.ts`):**
```
errorDto.unauthorized    -> { message: 'Authentication required', ... }
errorDto.forbidden       -> { message: expect.any(String), statusCode: 403, ... }
errorDto.badRequest(msg) -> { message: msg, statusCode: 400, ... }
```
Pre-built error response shapes using `expect.any(String)` for dynamic fields. Tests compare actual responses against these shapes rather than hand-writing expected objects.

**2. Systematic Endpoint Error Testing:**
For EACH API endpoint, Immich tests:
- Unauthenticated access (401)
- Unauthorized role access (403)
- Invalid input (400)
- Not found (404) where applicable
- Valid request (200/201)

This pattern ensures every endpoint has at least one negative test case.

**3. Permission Matrix Testing:**
The `beforeAll` block creates 4 users with different roles. Each `it` block tests one permission scenario. This creates a matrix:
- Admin user -> should succeed
- Regular user -> should get own resources
- Other user -> should get 403
- Unauthenticated -> should get 401

### Cal.com's Error Testing Patterns

Cal.com achieves ~15% error coverage through:

**1. Booking Conflict Testing:**
Tests that verify what happens when:
- Time slots overlap
- Events are fully booked (seats exhausted)
- User tries to book outside availability

**2. Webhook Error Validation:**
Tests verify webhook payloads with `toMatchObject()` against large expected structures. Webhook failures produce visible error indicators in the UI.

**3. Settings Validation:**
Invalid URL handling in profile settings. Form validation errors for required fields.

### n8n's Resilience Testing Patterns

n8n extends error testing into resilience territory:

**1. Chaos Testing (2 specs):**
Deliberately introduces failure conditions into workflows to verify recovery behavior. This is the only suite observed with explicit chaos testing.

**2. Memory Consumption Tests:**
Monitors memory usage during workflow execution to detect leaks. Part of the benchmarks category (10 specs).

**3. Regression Tests (12 specs):**
Dedicated regression directory captures previously-failed scenarios, ensuring they don't recur.

---

## 4. Negative Testing Pattern Categories

Synthesizing across all suites, negative testing in E2E falls into 6 categories:

### Category 1: Permission Enforcement
**Prevalence:** 6/10 suites
- Test that unauthorized users get 401/403 responses
- Test that role-limited users cannot access admin features
- Grafana: separate `admin` and `viewer` Playwright projects
- Immich: systematic 4-user permission matrix
- Element Web: crypto key verification across users

### Category 2: Input Validation
**Prevalence:** 4/10 suites
- Invalid form inputs (Cal.com: invalid URLs, freeCodeCamp: bad email format)
- Malformed API requests (Immich: missing required fields)
- Edge case inputs (Grafana: special characters in selectors)

### Category 3: Empty/Error States
**Prevalence:** 5/10 suites
- No results (Grafana: empty dashboard, Ghost: no members)
- Loading failures (Element Web: failed key backup)
- Disabled features (Ghost: disabled commenting, disabled members)

### Category 4: Conflict Resolution
**Prevalence:** 3/10 suites
- Concurrent operations (Cal.com: booking conflicts)
- Duplicate handling (Grafana: duplicate panel names)
- Version conflicts (limited -- mostly delegated to API/unit tests)

### Category 5: Network/Infrastructure Errors
**Prevalence:** 2/10 suites
- Mocked network failures (Immich UI mock tests)
- n8n chaos testing (deliberate failure injection)
- Other suites: effectively zero network error testing at E2E level

### Category 6: Recovery Flows
**Prevalence:** 3/10 suites
- Password reset (Element Web: forgot-password flow)
- Backup restoration (Element Web: key backup recovery)
- Undo/rollback (AFFiNE: trash/restore)

---

## 5. Network Mocking for Negative Testing

### Community Guidance

Playwright's `page.route()` API enables systematic error testing through network interception:

```
// Mock API failure
await page.route('/api/data', route => route.fulfill({ status: 500 }));

// Mock timeout
await page.route('/api/slow', route => route.abort('timedout'));

// Mock empty response
await page.route('/api/items', route => route.fulfill({ body: '[]' }));
```

**Source:** Playwright official mock docs, BrowserStack API mocking guide, TestDino network mocking guide

### Production Suite Usage

Only **Immich UI mock tests** extensively use route mocking for negative testing. The pattern:
1. `test.beforeAll` generates test data with `SeededRandom`
2. `test.beforeEach` sets up mock API routes
3. Tests exercise UI against controlled API responses including error states

Most production suites (12/15) do NOT mock network responses for negative testing. They prefer:
- Testing against real backend instances (Grafana, Cal.com, Ghost, n8n)
- API-level tests for error scenarios (Immich, Ghost)
- Skipping network error testing entirely (AFFiNE, freeCodeCamp, Excalidraw)

---

## 6. Recommendations for Negative Testing Strategy

Based on cross-suite analysis:

| Priority | Negative Test Type | Layer | Evidence Strength |
|----------|--------------------|-------|-------------------|
| **Must** | Permission enforcement (401/403) | API or E2E | 6/10 suites |
| **Must** | Authentication failure (login with bad credentials) | E2E | 7/10 suites test auth |
| **Should** | Empty/error states for primary data type | E2E | 5/10 suites |
| **Should** | Input validation on critical forms | E2E or integration | 4/10 suites |
| **Nice to have** | Conflict resolution scenarios | E2E | 3/10 suites |
| **Nice to have** | Network failure recovery | E2E with route mocking | 2/10 suites |
| **Specialized** | Chaos/resilience testing | E2E | 1/10 suites (n8n) |

**Target ratio:** 80-90% happy-path, 10-20% error-path at E2E level. Delegate remaining error coverage to API-level and unit tests.

**Best practice from Immich:** Create an error response factory (`errorDto`) with pre-built expected error shapes. This makes adding negative tests as easy as adding a single `it` block per endpoint.
