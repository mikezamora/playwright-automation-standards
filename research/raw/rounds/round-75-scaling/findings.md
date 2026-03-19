# Round 75 — Execution Strategy Evolution and Transition Hurdles

**Phase:** Scaling Organization Deep Dive (Audit Checkpoint)
**Date:** 2026-03-19
**Focus:** How execution strategies evolve with suite scale, what breaks at each transition, and audit of S8-S12 evidence quality

---

## 1. Execution Strategy Evolution

### Stage 1: Default Parallel (0-50 tests, <5 min CI)

**Pattern:** `fullyParallel: true`, default workers (half CPU cores), no sharding

**What works:**
- Playwright's default parallelism is sufficient
- Single CI job completes in <5 minutes
- No explicit execution strategy needed

**Evidence:** Excalidraw, Slate — both run all tests in a single CI job with default parallelism.

**Metrics to watch:** Total CI duration. When it approaches 5 minutes, consider tuning.

### Stage 2: Tuned Parallelism (50-100 tests, 5-10 min CI)

**Pattern:** Explicit worker count, `fullyParallel: true`, CI-specific worker tuning

**What changes from Stage 1:**
- Workers explicitly set: `workers: process.env.CI ? 4 : undefined`
- `maxFailures` appears for fail-fast: `maxFailures: process.env.CI ? 6 : 0`
- Retry strategies differentiate: `retries: process.env.CI ? 2 : 0`

**Evidence:** Ghost (1 worker — conservative), Immich (default workers + 4 retries CI)

**The false economy of workers:1.** WordPress (278 specs, 1 worker) and Rocket.Chat (170 specs, 1 worker) demonstrate that serial execution at scale is an anti-pattern. Both have CI run times of 30+ minutes that could be cut by 60-75% with parallel execution. The 1-worker choice is typically driven by shared state between tests — the correct fix is test isolation, not serialization.

### Stage 3: Sharding (100-200 tests, 10-20 min CI)

**Pattern:** `--shard=N/M` with CI matrix strategy, continued `fullyParallel: true`

**What changes from Stage 2:**
- CI workflow adds matrix strategy: `matrix: { shard: [1/4, 2/4, 3/4, 4/4] }`
- Blob reporter in CI for merged reporting: `reporter: process.env.CI ? 'blob' : 'html'`
- Merge step after all shards complete: `npx playwright merge-reports`
- Shard count calculation: ~1 shard per 40-50 tests (community consensus)

**Evidence:**
- Supabase: 177 tests, 2 shards
- Element Web: 209 specs, CI matrix sharding
- Community guidance: Start sharding when CI exceeds 5 minutes on a single agent

**Shard sizing formula:**
```
shardCount = Math.ceil(testCount / 40)
```
Target: 40 tests per shard. Adjust based on test duration variance — if tests have wildly different durations, timing-based assignment is needed.

**Key requirement:** `fullyParallel: true` is essential for balanced sharding. Without it, Playwright shards at file level, causing imbalanced distribution when file sizes vary.

### Stage 4: Tiered Execution (200-500 tests, 20-40 min CI)

**Pattern:** Smoke tests on PR, full suite on merge. Tag or project-based tier selection.

**What changes from Stage 3:**
- Dedicated `smoke` project or `@smoke` tag
- PR triggers run smoke subset; merge triggers run full suite
- Scheduled nightly/weekly runs for full cross-browser coverage
- Flakiness tracking begins (custom reporters)

**Evidence:**
- Grafana: `smoke` as a dedicated project (not just a tag) — structural tier
- Element Web: Two-tier CI (fast on PR, comprehensive on merge)
- Only 2/15 analyzed suites implement true tiered execution — adoption lags behind need

**Tiered execution approaches:**
| Approach | Mechanism | Evidence |
|----------|-----------|---------|
| Project-based | Dedicated `smoke` project in config | Grafana |
| Tag-based | `@smoke` tag + `--grep` filter | Community guidance (not seen in Gold suites) |
| Directory-based | `smoke-tests-suite/` directory | Grafana (directory maps to project) |
| CI-trigger-based | Different workflows for PR vs merge | Element Web |

**Insight:** Production suites prefer project/directory-based tiering over tag-based tiering. This aligns with COV1 (structural over tag-based organization).

### Stage 5: Orchestrated Execution (500+ tests, 40+ min CI)

**Pattern:** CI-level orchestration with timing optimization, selective execution, multi-dimension matrix.

**What changes from Stage 4:**
- Timing-based shard assignment (fetch historical test durations)
- Selective execution for PRs (`--only-changed` or tag-grep mapping)
- Multi-dimension CI matrix (framework × browser × Node version)
- Custom test runners for non-standard distribution
- Dynamic shard count calculation

**Evidence:** Next.js (84 shards, timing-based assignment, `fetch-test-timings` job, React version matrix)

**Selective execution implementation patterns:**

**Pattern A: Playwright-native (v1.46+)**
```bash
npx playwright test --only-changed=main
```
- Analyzes import graph to find affected test files
- Requires `fetch-depth: 0` in CI for full git history
- Two-stage: `--only-changed` first, full suite second

**Pattern B: Tag-grep mapping (manual)**
```bash
# CI step 1: Detect changed modules
changed_paths=$(git diff --name-only origin/main)
# CI step 2: Map paths to tags
tags=$(echo "$changed_paths" | extract_module_tags)
# CI step 3: Run matching tests
npx playwright test --grep "$tags"
```
- More control over mapping logic
- Works with pre-v1.46 Playwright
- Requires disciplined test tagging

**Pattern C: File-path filtering**
```bash
changed_specs=$(git diff --name-only origin/main -- '*.spec.ts')
npx playwright test $changed_specs
```
- Simplest approach
- Only catches changes to test files themselves, misses changes to helpers/fixtures
- Adequate for most PR-level feedback

---

## 2. Transition Hurdles

### Small → Medium (crossing ~50 tests)

**What breaks:**
1. **Auth management.** Tests that manually log in become slow (2-3s per test × 50 = 2+ minutes wasted). The fix: auth setup project with storage state.
2. **Test data collisions.** With parallel workers, tests creating/reading the same data conflict. The fix: unique test data per test (timestamps, UUIDs in names).
3. **Reporter noise.** Default `list` reporter becomes unreadable at 50+ tests in CI. The fix: `github` reporter for CI, `html` for local.
4. **Flaky test awareness.** At 50+ tests, the first flaky test appears (~2% flake rate = 1 flaky test per run). The fix: CI retries (`retries: 2` in CI) and flake monitoring.

**What must change:**
- Add auth setup project + storage state
- Implement per-test data isolation (unique names, API-based cleanup)
- Differentiate CI vs local config (reporters, retries, workers)
- Start organizing tests into feature directories

**Cost of not transitioning:** CI slowdown (2-5× slower than needed), intermittent failures from data collisions, developer frustration with unreadable CI output.

### Medium → Large (crossing ~200 tests)

**What breaks:**
1. **CI duration.** Single-job execution exceeds 15-20 minutes. Developer feedback loop becomes unacceptable. The fix: sharding.
2. **Config complexity.** Single project with `testDir` pointing to a big directory loses organization. The fix: multi-project config with per-project `testDir`.
3. **Fixture monolith.** Single fixture file exceeds 100+ lines with unrelated concerns. The fix: fixture segmentation (base + role-specific + env-specific).
4. **Page object proliferation.** POM files multiply without clear ownership. The fix: POM directories mirroring feature directories.
5. **Flaky test accumulation.** At 200+ tests, flake rate compounds (~4+ flaky tests per run at 2%). The fix: flakiness reporter, quarantine process.

**What must change:**
- Implement CI sharding (start with `ceil(testCount / 40)` shards)
- Split config into multi-project with feature-based projects
- Segment fixtures by tier/scope
- Establish flakiness monitoring and quarantine process
- Consider tiered execution (smoke on PR, full on merge)

**Cost of not transitioning:** CI wait times >20 minutes, developer bypass ("I'll skip E2E"), flaky test accumulation leading to green-is-meaningless syndrome.

### Large → Enterprise (crossing ~500 tests)

**What breaks:**
1. **Shard imbalance.** Static shard allocation leads to wildly uneven durations. The fix: timing-based shard assignment.
2. **Full-suite-on-every-PR fatigue.** Running 500+ tests on every PR is wasteful and slow. The fix: selective execution (affected tests only on PR, full on merge).
3. **Config monolith.** Single mega-config exceeds 400 lines and becomes hard to maintain. The fix: either extract project definitions to separate files OR move to CI-level orchestration.
4. **Test infrastructure ownership.** At 500+ tests, the test framework itself needs dedicated ownership (fixtures, utilities, reporters, CI config). The fix: test infrastructure team or rotation.
5. **Cross-team coordination.** Multiple teams write tests against the same infrastructure. The fix: published utilities package or shared fixture library with clear API contracts.

**What must change:**
- Implement timing-based shard balancing
- Add selective test execution for PRs
- Establish test infrastructure ownership
- Consider splitting config or moving orchestration to CI
- Implement comprehensive flakiness tracking with auto-quarantine
- Establish test writing guidelines and review process

**Cost of not transitioning:** CI pipeline becomes a bottleneck, test suite credibility erodes, teams write duplicate infrastructure, merge queue backs up.

---

## 3. Execution Anti-Patterns at Scale

### Anti-Pattern 1: Serial Execution at Scale
**Observed in:** Rocket.Chat (170 specs, 1 worker), WordPress (278 specs, 1 worker)
**Impact:** 30-60 minute CI runs that could be 8-15 minutes with parallelism
**Root cause:** Tests share state (database, session, global variables)
**Fix:** Invest in test isolation (per-worker DB setup, per-test data creation)

### Anti-Pattern 2: No Sharding Beyond 100 Tests
**Observed in:** Suites that add workers but not shards
**Impact:** Single machine bottleneck — workers help within a machine but can't exceed core count
**Root cause:** Perceived complexity of shard setup and report merging
**Fix:** Add sharding at ~100 tests. Playwright's `--shard` + blob reporter + merge step is straightforward.

### Anti-Pattern 3: Full Suite on Every PR
**Observed in:** 9/15 analyzed suites
**Impact:** Slow PR feedback, CI resource waste, developer frustration
**Root cause:** Fear of missing regressions
**Fix:** Tiered execution — smoke on PR (2-5 min), full on merge (10-20 min), cross-browser weekly

### Anti-Pattern 4: Tag-Based Smoke Selection Without Discipline
**Observed in:** Community guidance recommends `@smoke` tags, but 0/15 production suites use them
**Impact:** Tags rot as tests change; smoke suite drifts from critical path
**Root cause:** Tags require manual maintenance; no tooling enforces tag accuracy
**Fix:** Structural smoke (dedicated project/directory) over tag-based smoke

---

## 4. Scaling Decision Tree

```
START: How many Playwright tests?

├── <50 tests
│   └── Default config, default workers, no sharding
│       └── Monitor: CI duration approaching 5 min?
│           └── YES → Move to Medium tier
│
├── 50-200 tests
│   ├── Auth setup project needed? → YES → Add setup project + storage state
│   ├── CI >10 min? → YES → Begin sharding (ceil(N/40) shards)
│   ├── >20 spec files? → YES → Feature-based directories
│   └── >2 auth roles? → YES → Segment fixtures
│
├── 200-500 tests
│   ├── CI >20 min? → YES → Increase shards + add tiered execution
│   ├── Config >150 lines? → YES → Extract project definitions or helpers
│   ├── Fixture file >100 lines? → YES → Split by tier (base/role/env)
│   ├── >10 specs per feature dir? → YES → Sub-feature directories
│   └── Flake rate >2%? → YES → Flakiness reporter + quarantine
│
└── 500+ tests
    ├── Shard imbalance >2×? → YES → Timing-based assignment
    ├── Full suite on PR >15 min? → YES → Selective execution
    ├── Config >400 lines? → YES → Multi-config or CI orchestration
    ├── Multiple teams writing tests? → YES → Shared utilities package
    └── Flake rate >1%? → YES → Auto-quarantine + dedicated ownership
```

---

## Emerging Standards (S12 Evidence)

### S12: Execution Strategy at Scale

**S12.1: Begin sharding when CI duration exceeds 5 minutes on a single agent.**
Evidence: Community consensus + Supabase (177 tests, 2 shards), Element Web (209 specs, CI matrix sharding). Formula: `ceil(testCount / 40)` shards as starting point.

**S12.2: Use `fullyParallel: true` when sharding.**
Without it, Playwright shards at file level, causing imbalanced distribution. Test-level distribution ensures even shard durations.

**S12.3: Implement tiered execution at 200+ tests.**
Smoke project/directory on PR, full suite on merge. Structural tiering (project/directory) preferred over tag-based tiering. Evidence: Grafana (smoke project), Element Web (CI-trigger tiering). Only 2/15 suites implement this — significant adoption gap.

**S12.4: Add selective test execution at 500+ tests.**
Playwright v1.46+ `--only-changed` for import-graph-aware selection. Tag-grep mapping for explicit module-to-test mapping. Two-stage CI: selective on PR, full on merge/nightly.

**S12.5: Serial execution with 50+ tests is an anti-pattern.**
Rocket.Chat and WordPress demonstrate the cost. Root cause is always shared state. The fix is test isolation, not serialization.
