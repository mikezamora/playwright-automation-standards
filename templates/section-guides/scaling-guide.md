# Scaling Guide

> Section guide for evolving suite organization as it grows. References: [structure-standards.md](../../standards/structure-standards.md) S8.1-S8.4, S9.1-S9.6, S10.1-S10.5, S11.1-S11.5, S12.1-S12.6.

---

## Purpose and Goals

A 10-test suite and a 500-test suite require fundamentally different organizational strategies. This guide covers how to recognize when your suite has outgrown its current structure, what to change at each scale boundary, and how to avoid common pitfalls of scaling too early or too late. Well-scaled suites:
- Match organizational complexity to suite size (not over-engineer and not under-invest)
- Transition proactively at measurable thresholds rather than waiting for pain
- Use structural patterns (directories, projects, fixtures) rather than ad-hoc workarounds
- Scale execution strategy alongside organizational strategy

---

## Key Standards

### S8 — Scale Tier Self-Assessment

Playwright suites fall into four scale tiers, each requiring different strategies [S8.1].

| Tier | Test Count | CI Duration | Config LOC | Characteristics |
|---|---|---|---|---|
| **Small** | 1-50 | < 5 min | 30-60 | Default parallelism, 2-4 browser projects, single CI job |
| **Medium** | 50-200 | 5-20 min | 60-120 | Auth setup project, CI/local differentiation, feature directories |
| **Large** | 200-1000 | 20-40 min | 120-400 | Multi-project config, sharding, fixture segmentation, tiered execution |
| **Enterprise** | 1000+ | 40+ min | 400+ | CI-level orchestration, timing-based distribution, selective execution |

**Quick self-assessment** [S8.4]:

```
Do you have >50 tests?
  NO  → Small tier. Default patterns are fine.
  YES → Is CI duration >5 min?
    NO  → Monitor, but defer restructuring.
    YES → Medium tier. Start auth setup, feature directories.

Do you have >200 tests?
  YES → Is CI duration >20 min?
    YES → Large tier. Add sharding, multi-project config, fixture split.
    NO  → Monitor within Medium patterns.

Do you have >500 tests?
  YES → Are multiple teams writing tests?
    YES → Enterprise tier. Add ownership, selective execution.
    NO  → Scale within Large tier patterns.
```

**Production examples:**

| Tier | Suites | Test Count |
|---|---|---|
| Small | Excalidraw (~30), Slate (~25) | 1-50 |
| Medium | Ghost (81), Immich (90+), freeCodeCamp (126) | 50-200 |
| Large | Grafana (163+), n8n (174), Rocket.Chat (170), Gutenberg (278) | 200-1000 |
| Enterprise | Next.js (550+ dirs, 84 shards) | 1000+ |

---

### Transition Playbook: Small to Medium (~50 tests)

**Triggers** [S8.2]: CI approaching 5 min, 20+ test files, first auth-dependent test, first flaky test.

**Actions:**

| Area | What to Change | Standard |
|---|---|---|
| Auth | Add auth setup project with `storageState` — eliminates 2-3s login per test | [S4.4] |
| Directories | Move from flat to feature-nested at 20-30 files | [S9.1] |
| Data | Use unique test data per test (timestamps, UUIDs) to avoid parallel collisions | [S6.4] |
| Reporters | Switch CI reporter from `list` to `github` + `html` for local | [S2.6] |
| Retries | Add `retries: 2` in CI for flake resilience | [V4] |

```
BEFORE (flat, Small tier):            AFTER (nested, Medium tier):
  e2e/                                  e2e/
    auth-login.spec.ts                    auth/
    auth-signup.spec.ts                     login.spec.ts
    dashboard-create.spec.ts                signup.spec.ts
    dashboard-edit.spec.ts                dashboard/
    settings.spec.ts                        create.spec.ts
                                            edit.spec.ts
                                          settings/
                                            preferences.spec.ts
```

```typescript
// playwright.config.ts — Medium tier additions
export default defineConfig({
  projects: [
    { name: 'setup', testDir: './e2e', testMatch: /global\.setup\.ts/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',  // ← auth setup
      },
      dependencies: ['setup'],
    },
  ],
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]  // ← CI reporters
    : [['html']],
  retries: process.env.CI ? 2 : 0,  // ← flake resilience
});
```

---

### Transition Playbook: Medium to Large (~200 tests)

**Triggers** [S8.2]: CI exceeding 15-20 min, config exceeding 150 LOC, 3+ auth roles, 10+ specs per feature directory.

**Actions:**

| Area | What to Change | Standard |
|---|---|---|
| Sharding | Add `--shard=N/M` with CI matrix; target ~40 tests per shard | [S12.2] |
| Config | Use multi-project config with helper functions (`withAuth()`, `baseConfig`) | [S10.1, S10.4] |
| Directories | Split feature directories into sub-feature dirs at 10-15 specs | [S9.2] |
| Fixtures | Split monolithic fixture file at 100 lines; segment by environment scope | [S11.2] |
| Page objects | Create POM directories mirroring feature directories | [S1.3] |
| Tiering | Add dedicated `smoke/` directory or project for fast PR feedback | [S12.4] |

```typescript
// playwright.config.ts — Large tier with helper functions
const testDirRoot = path.join(__dirname, 'e2e');

function withAuth(project: Project): Project {
  return {
    ...project,
    use: { ...project.use, storageState: '.auth/user.json' },
    dependencies: ['setup', ...(project.dependencies ?? [])],
  };
}

const baseConfig = {
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: process.env.BASE_URL ?? 'http://localhost:3000' },
};

export default defineConfig({
  ...baseConfig,
  projects: [
    { name: 'setup', testDir: testDirRoot, testMatch: /global\.setup\.ts/ },
    withAuth({ name: 'smoke', testDir: path.join(testDirRoot, 'smoke') }),
    withAuth({ name: 'dashboard', testDir: path.join(testDirRoot, 'dashboard') }),
    withAuth({ name: 'auth', testDir: path.join(testDirRoot, 'auth') }),
    withAuth({ name: 'bookings', testDir: path.join(testDirRoot, 'bookings') }),
  ],
});
```

**CI sharding setup:**

```yaml
# .github/workflows/playwright.yml
strategy:
  matrix:
    shard: [1/4, 2/4, 3/4, 4/4]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}
    env:
      CI: true

  # Merge reports after all shards
  - uses: actions/upload-artifact@v4
    with:
      name: blob-report-${{ strategy.job-index }}
      path: blob-report/
```

**Fixture segmentation:**

```
fixtures/
  base.ts          # Core: auth, navigation, common POMs
  admin.ts         # Admin-role specific fixtures
  cloud.ts         # Cloud-environment specific fixtures
  performance.ts   # Performance test fixtures
```

```typescript
// Tests opt into the fixture tier they need
import { test } from '../fixtures/base';     // Base tests
import { test } from '../fixtures/admin';    // Admin-only tests
import { test } from '../fixtures/cloud';    // Cloud-specific tests
```

---

### Transition Playbook: Large to Enterprise (~500 tests)

**Triggers** [S8.2]: CI exceeding 40 min, multiple teams writing tests, shard imbalance > 2x, full-suite-on-PR fatigue.

**Actions:**

| Area | What to Change | Standard |
|---|---|---|
| Execution | Add selective test execution (`--only-changed`) | [S12.5] |
| Config | Move orchestration to CI-level (simple per-dir configs + CI YAML) | [S10.2] |
| Ownership | Set up CODEOWNERS for test directories | [S12.6] |
| Sharding | Switch to timing-based shard distribution | [S12.5] |
| Fixtures | Consider composables layer above page objects for multi-page workflows | [S11.3] |
| Packages | Evaluate published utility packages only for ecosystem platforms | [S11.4] |

```yaml
# Enterprise CI: two-stage execution
# Stage 1: PR — selective execution (fast feedback)
pr-tests:
  steps:
    - run: npx playwright test --only-changed=main
      # Requires fetch-depth: 0 for full git history

# Stage 2: Merge — full suite (comprehensive coverage)
merge-tests:
  steps:
    - run: npx playwright test --shard=${{ matrix.shard }}
  strategy:
    matrix:
      shard: [1/8, 2/8, 3/8, 4/8, 5/8, 6/8, 7/8, 8/8]
```

```
# .github/CODEOWNERS — test directory ownership
/e2e/auth/              @team-identity
/e2e/dashboard/         @team-dashboards
/e2e/alerting/          @team-alerting
/e2e/workflows/         @team-platform
/playwright.config.ts   @test-infra-team
/fixtures/              @test-infra-team
```

**Fixture architecture at Enterprise scale** [S11.1]:

```
Infrastructure (config, global setup)
  → Services (API helpers, REST clients)
    → Fixtures (Playwright fixture injection)
      → Page Objects (single-page UI encapsulation)
        → Composables (multi-page workflow orchestration)
```

Each layer imports only from the layer below it. Use ESLint `import/no-cycle` to enforce [S11.5].

---

## Directory Restructuring Patterns

### Pattern 1: Flat to Nested [S9.1]

**When:** 20-30 test files in a flat directory.

```
BEFORE:                          AFTER:
  e2e/                             e2e/
    auth-login.spec.ts               auth/
    auth-signup.spec.ts                login.spec.ts
    dashboard-create.spec.ts           signup.spec.ts
    dashboard-edit.spec.ts           dashboard/
    dashboard-share.spec.ts            create.spec.ts
    settings-prefs.spec.ts             edit.spec.ts
    settings-profile.spec.ts           share.spec.ts
                                     settings/
                                       preferences.spec.ts
                                       profile.spec.ts
```

### Pattern 2: Feature to Sub-Feature [S9.2]

**When:** 10-15 spec files in one feature directory.

```
BEFORE:                          AFTER:
  e2e/dashboard/                   e2e/dashboard/
    create.spec.ts                   crud/
    edit.spec.ts                       create.spec.ts
    variables.spec.ts                  edit.spec.ts
    permissions.spec.ts                export.spec.ts
    sharing.spec.ts                  configuration/
    templating.spec.ts                 variables.spec.ts
    annotations.spec.ts                templating.spec.ts
    export.spec.ts                   access/
                                       permissions.spec.ts
                                       sharing.spec.ts
```

### Pattern 3: Monorepo Per-Package [S9.6]

| Variant | When to Use | Example |
|---|---|---|
| Package-scoped | Packages are independently deployable | `packages/app-a/e2e/`, `packages/app-b/e2e/` |
| Centralized | E2E tests cross package boundaries | `packages/e2e-tests/` |
| Shared infrastructure | Utilities shared across packages | `packages/testing/playwright/` |

---

## Config Composition Patterns

### Pattern 1: Helper Functions [S10.4]

```typescript
// playwright-helpers.ts — extracted helpers
export function withAuth(project: Project): Project {
  return {
    ...project,
    use: { ...project.use, storageState: '.auth/user.json' },
    dependencies: ['setup', ...(project.dependencies ?? [])],
  };
}

export const baseConfig = {
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: process.env.BASE_URL ?? 'http://localhost:3000' },
};
```

### Pattern 2: Separate Projects File [S10.4]

```typescript
// playwright-projects.ts — extracted project definitions (n8n pattern)
export function generateProjects(env: string): Project[] {
  if (env === 'local') return [{ name: 'e2e', testDir: './tests' }];
  return backends.flatMap(backend => [
    { name: `${backend}:e2e`, testDir: './tests', ... },
    { name: `${backend}:infrastructure`, testDir: './tests/infra', ... },
  ]);
}
```

### Config Split Thresholds [S10.5]

| Config LOC | Action |
|---|---|
| < 150 | No action needed |
| 150 | Extract helper functions to `playwright-helpers.ts` |
| 300 | Extract project definitions to `playwright-projects.ts` |
| 400+ | Evaluate CI-level orchestration or multi-config approach |

---

## Execution Strategy by Tier

| Stage | Test Count | Strategy | Key Actions | Standard |
|---|---|---|---|---|
| 1 | 0-50 | Default parallel | `fullyParallel: true`, default workers | [S12.1] |
| 2 | 50-100 | Tuned parallelism | Explicit workers, `maxFailures`, CI retries | [S12.1] |
| 3 | 100-200 | Sharding | `--shard=N/M`, blob reporter, merge step | [S12.2] |
| 4 | 200-500 | Tiered execution | Smoke on PR, full on merge | [S12.4] |
| 5 | 500+ | Orchestrated | Timing-based sharding, `--only-changed`, multi-dimension matrix | [S12.5] |

**Sharding formula:** `shardCount = Math.ceil(testCount / 40)` — target ~40 tests per shard [S12.2].

**Serial execution at 50+ tests is an anti-pattern** [S12.3]. Root cause is always shared state. Resolution: identify shared state, implement per-worker isolation, gradually increase workers to `fullyParallel: true`.

---

## Common Pitfalls

| Pitfall | Why It Fails | Fix | Standard |
|---|---|---|---|
| Flat directory at 75+ files | Discovery friction, impractical CODEOWNERS | Feature-based directories | [S9.1] |
| `workers: 1` at 50+ tests | 60-75% CI time wasted | Fix test isolation, enable parallelism | [S12.3] |
| No sharding at 100+ tests | Single-machine bottleneck | Shard with `ceil(N/40)` formula | [S12.2] |
| Full suite on every PR at 500+ tests | Slow feedback, CI waste, developer frustration | `--only-changed` on PR; full suite on merge | [S12.5] |
| Tag-based smoke without discipline | Tags rot over time; 0/15 suites use this | Structural tiering (project/directory) | [S12.4] |
| 30+ inline project definitions | Config duplication, maintenance burden | `withAuth()` helper + config DRY patterns | [S10.4] |
| Shallow fixtures (2 layers) at 200+ tests | Long, duplicative tests (30-80 lines avg) | Invest in 3-4+ fixture layers | [S11.1] |
| Single config at 400+ LOC | Unmaintainable without helpers | Extract helpers, then projects, then split | [S10.5] |
| Published test package for single product | Unnecessary overhead of API stability + docs | Keep fixtures internal | [S11.4] |

---

## When to Deviate

- **Proactive higher-tier patterns:** Teams with clear growth trajectory may adopt higher-tier patterns early — Cal.com used feature directories from inception [S8.4].
- **Flat organization for stable suites:** Viable for suites that will not grow beyond ~50 files (freeCodeCamp pattern) [S9.1].
- **Single worker for environment limitations:** Acceptable when the application genuinely cannot support parallel access (WordPress: shared state by design), but should be treated as a known limitation, not a choice [S12.3].
- **Running all tests on every PR:** This is what 11/15 production suites actually do. Tiering and selective execution are optimizations [S12.4].
- **Composables layer:** Emerging practice based on a single suite (n8n). Evaluate whether your multi-page workflow complexity justifies the additional abstraction [S11.3].
