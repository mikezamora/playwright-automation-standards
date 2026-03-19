# Round 69 Findings — Coverage Tier Patterns: Structural vs Tag, CI Differentiation

## Phase
Coverage Strategy Deep Dive (Phase 2)

## Objective
Analyze how production suites tier their test execution: structural organization vs tag-based categorization, CI workflow differentiation (PR vs merge vs nightly), and the gap between community recommendations and actual practice.

---

## 1. Grafana's Structural Tiering — Deep Dive

Grafana (`grafana/grafana`) represents the most mature structural tiering implementation among all 15+ suites analyzed.

### Tier Architecture

**Tier 1: Smoke/Acceptance** (`smoke-tests-suite/`, tag: `@acceptance`)
- 3 spec files: accessibility (axe), panels rendering, login-create-datasource-dashboard flow
- Purpose: "Does the application start and perform basic operations?"
- Execution: every PR and push to main
- Time budget: < 2 minutes

**Tier 2: Feature Suites** (7 suite directories, tags: `@dashboards`, `@panels`, `@various`, `@alerting`, `@cloud-plugins`)
- ~120 spec files covering dashboards (34), panels (27), dashboard-new-layouts (24), various (29), alerting (1), dashboards-search (1), cloud-plugins (1)
- Purpose: feature-level regression coverage
- Execution: every PR and push to main (gated by change detection)
- Time budget: 10-15 minutes across 8 shards

**Tier 3: Critical User Journeys** (`dashboard-cujs/`, tag: `@dashboard-cujs`)
- 8 spec files with setup/teardown projects (explicit project dependency chain)
- Purpose: end-to-end workflow verification of core user journeys
- Setup: `dashboard-cujs-setup` project imports dashboards via API
- Teardown: `dashboard-cujs-teardown` project cleans up
- Uses `test.step()` with numbered steps for multi-phase workflows
- Tests are longer (80-170 lines) with 15-25+ assertions per test

**Tier 4: Plugin/Integration** (`plugin-e2e/`, 14+ data source directories)
- 30+ spec files testing data source plugins with role-based access
- Per-datasource Playwright projects with authentication dependencies
- `admin` and `viewer` projects for RBAC verification

**Tier 5: Specialized** (unauthenticated, storybook, test-plugins, extensions)
- Tests for specific contexts: unauthenticated access, storybook component verification, internal plugin testing

### How Grafana Implements Tiering

1. **Directory = Suite:** Each `-suite` directory maps to a Playwright project in `playwright.config.ts`
2. **Project dependencies:** `withAuth()` helper function wraps projects with authentication requirements
3. **CUJ dependency chain:** `dashboard-cujs-setup` -> `dashboard-cujs` -> `dashboard-cujs-teardown`
4. **Change detection gating:** CI skips entire workflow if no relevant code changed
5. **Separate triggered workflows:** `run-dashboard-search-e2e.yml` and `run-schema-v2-e2e.yml` for on-demand execution

### What Grafana Does NOT Do
- No nightly-only test suite (all tests run on every PR/push)
- No `@slow` or `@regression` tags
- No percentage-based tier allocation
- Tags are suite-level identifiers, not priority markers

---

## 2. Element Web's CI Differentiation — The Two-Tier Model

Element Web (`element-hq/element-web`) implements the clearest two-tier CI differentiation observed.

### PR CI (Fast Feedback)
- **Browser:** Chromium only
- **Server:** Synapse only
- **Tests:** All 209 specs MINUS those tagged `@mergequeue`
- **Purpose:** Fast feedback on every PR
- **Estimated time:** ~10-15 minutes

### Merge Queue CI (Comprehensive)
- **Browsers:** Chromium + Firefox + WebKit (3x browser matrix)
- **Servers:** Synapse + Dendrite + Picone (3x server matrix)
- **Tests:** Full suite including `@mergequeue` tests
- **Purpose:** Comprehensive verification before merge
- **Estimated time:** ~30-45 minutes
- **Override:** `X-Run-All-Tests` label forces full matrix on PR

### Tag-Based CI Control
| Tag | Purpose |
|-----|---------|
| `@mergequeue` | Skip in PR CI, include in merge queue (slow/flaky tests) |
| `@screenshot` | Visual regression tests |
| `@no-firefox` | Service-worker-dependent tests |
| `@no-webkit` | WebKit-incompatible tests |

**Key insight:** Element Web's tags are exclusion-based (what to skip in certain contexts), NOT inclusion-based (what to run). This is the opposite of the community-recommended `@smoke` approach.

---

## 3. Cross-Suite CI Differentiation Analysis

### Tier A: Two-Tier CI (2/15 suites)

| Suite | PR Trigger | Merge/Queue Trigger | Nightly | Mechanism |
|-------|-----------|---------------------|---------|-----------|
| **Element Web** | Chrome+Synapse only | Full browser x server matrix | None | `@mergequeue` tag + project config |
| **Grafana** | All tests (change-gated) | Same as PR | None | Change detection skips irrelevant PRs entirely |

### Tier B: Multi-Workflow CI (2/15 suites)

| Suite | Workflows | Differentiation |
|-------|-----------|-----------------|
| **n8n** | 7 CI workflows | Separate workflows for main tests, coverage (weekly), Docker, Helm, infra, performance |
| **Immich** | 2 CI jobs | `e2e-tests-server-cli` (API) + `e2e-tests-web` (Playwright) with path-based filtering |

### Tier C: Single-Run CI (11/15 suites)

| Suite | Approach |
|-------|----------|
| Cal.com | All tests on every PR/push; no differentiation |
| AFFiNE | Same `build-test.yml` on push to canary/beta/stable and PRs |
| freeCodeCamp | All Playwright tests on relevant code changes |
| Excalidraw | All tests on every PR (vitest, not Playwright) |
| Supabase | All tests per project |
| Gutenberg | All specs in serial (1 worker) |
| Rocket.Chat | All tests with 2 workers |
| Ghost | All browser tests; separate API test runner |
| Slate | All tests on every PR |
| Next.js | Turbopack tests with manifest tracking |
| BlockSuite | All tests (5 shards) |

### Key Finding: CI Differentiation Adoption Gap

**Community recommendation:** "Run quick smoke tests on PRs, full regression on merge, slow E2E on nightly" (BrowserStack, Tim Deschryver, Playwright Solutions).

**Actual practice:** Only 2/15 production suites implement any form of CI differentiation. 11/15 run all tests on every trigger.

**Why the gap exists (hypothesized from evidence):**
1. **Simplicity wins:** Running all tests avoids the complexity of maintaining tier definitions
2. **Sharding makes it fast enough:** Grafana runs ~400 tests in 8 shards with 20-min timeout -- fast enough for PR feedback
3. **Change detection is an alternative:** Grafana and AFFiNE skip the entire workflow when no relevant code changes, achieving the same speed benefit without test tiering
4. **Small suites don't need tiers:** Suites under ~200 tests complete in <10 minutes, removing the need for PR-specific subsets

---

## 4. Structural vs Tag-Based Organization

### The Clear Winner: Structural Organization

| Approach | Suites Using | Evidence |
|----------|-------------|----------|
| **Structural only** (directories + Playwright projects) | 11/15 | Cal.com, AFFiNE, Immich, freeCodeCamp, Excalidraw, Supabase, Ghost, n8n, Gutenberg, Rocket.Chat, Slate |
| **Structural + execution-control tags** | 2/15 | Grafana (`@acceptance`, `@dashboards`, etc.), Element Web (`@mergequeue`, `@no-firefox`) |
| **Structural + cross-browser tags** | 1/15 | Gutenberg (`@webkit`, `@firefox`) |
| **Structural + fixture-control tags** | 1/15 | n8n (`@auth:none`) |
| **Priority tags** (`@smoke`, `@critical`, `@regression`) | 0/15 | None observed in production suites |

### Tag Usage Taxonomy

When tags ARE used, they serve one of four purposes:

1. **Suite identification** (Grafana): `@dashboards`, `@panels`, `@acceptance` -- mirrors directory structure, used for CLI filtering
2. **CI tier control** (Element Web): `@mergequeue` -- determines which CI pipeline runs the test
3. **Browser exclusion** (Element Web, Gutenberg): `@no-firefox`, `@no-webkit`, `@webkit` -- filters for browser compatibility
4. **Fixture modification** (n8n): `@auth:none` -- changes test setup behavior rather than selection

### Where Priority Tags Appear (Not in Production Suites)
Priority tags (`@smoke`, `@critical`, `@regression`, `@slow`, `@sanity`) are found exclusively in:
- **QA-engineer-authored frameworks** (RocketChat/Monocart, aeshamangukiya/playwright-test-automation-framework, OmonUrkinbaev/playwright-qa-automation)
- **Tutorial/template projects**
- **Community guides** (Tim Deschryver, BrowserStack, TestDino)

This confirms the round 61 finding: priority tags are a QA-discipline practice that product teams replace with directory structure.

---

## 5. CI Workflow Differentiation Mechanisms

### Mechanism 1: Playwright Projects (Most Mature)
Separate Playwright projects in `playwright.config.ts` map to different test directories. CI workflows select projects by name or directory.

**Used by:** Grafana (31 projects), Element Web (9 projects), Cal.com (7 projects), Immich (3 projects)

**Advantages:**
- Each project can have its own browser, timeout, retry, and dependency configuration
- Project-level parallelism and sharding
- Clear config-as-code documentation

### Mechanism 2: Separate CI Workflows
Multiple `.github/workflows/` files target different test subsets.

**Used by:** n8n (7 workflows), Immich (2 jobs), Grafana (main + 2 triggered)

**Advantages:**
- Different trigger conditions (push, PR, schedule, manual)
- Different runner configurations and resource allocation
- Independent failure isolation

### Mechanism 3: Change Detection Gating
`git diff` analysis determines whether to run tests at all.

**Used by:** Grafana (skip if no relevant code changed), AFFiNE (copilot tests only on copilot path changes), Immich (e2e only on e2e/server/web changes)

**Advantages:**
- Zero-cost for unrelated changes
- No test tier maintenance
- Works with any CI system

### Mechanism 4: Tag-Based Filtering
CLI `--grep` or config `grep` filters tests by tag.

**Used by:** Element Web (`@mergequeue` exclusion)

**Advantages:**
- Fine-grained per-test control
- No directory restructuring needed
- Composable with other mechanisms

### Recommended Approach (From Evidence)
The most effective pattern combines mechanisms:
1. **Structural organization** via directories and Playwright projects (universal)
2. **Change detection** to skip irrelevant test runs (Grafana, AFFiNE, Immich)
3. **Tag-based exclusion** for slow/flaky tests in fast CI (Element Web)
4. **Separate workflows** for specialized runs (n8n weekly coverage, Grafana triggered searches)

---

## 6. Coverage Tier Model (Synthesized from Evidence)

### Recommended Tier Structure

| Tier | Purpose | Size | Trigger | Time Budget |
|------|---------|------|---------|-------------|
| **Smoke** | Core CRUD + auth + critical path | 5-10% of tests | Every commit/deploy | < 5 min |
| **PR Regression** | Feature-scoped tests for changed areas | 60-80% of tests | PR + push to main | < 15 min |
| **Full Regression** | Complete suite including slow/flaky | 100% of tests | Merge queue or nightly | < 45 min |
| **Specialized** | Performance, chaos, visual | Variable | Scheduled or manual | Variable |

### Implementation Guidance by Suite Size

| Suite Size | Tier Strategy |
|------------|---------------|
| < 50 tests | No tiering needed. Run everything on every PR. |
| 50-200 tests | Change detection gating. Skip irrelevant runs. Optional smoke subset. |
| 200-500 tests | Structural tiering (smoke directory + feature directories). Sharding. |
| 500+ tests | Full tiered CI with merge queue. Tag-based exclusions. Multiple workflows. |

### Evidence for Thresholds
- Cal.com (~380 tests, 73 files): no tiering, runs all tests on every PR
- Grafana (~400 tests, 163 files, 8 shards): change detection gating, 20-min timeout
- Element Web (~500+ tests, 209 files): two-tier CI with merge queue
- n8n (~500+ tests, 174 files, 8 shards): 7 separate CI workflows
- AFFiNE (~500+ tests, 120+ files, 5 shards per project): change detection, no tiering within projects
