# Round 72 — Enterprise-Scale Configuration Analysis

**Phase:** Scaling Organization Deep Dive
**Date:** 2026-03-19
**Focus:** How enterprise-scale suites (30+ projects, 200+ CI jobs) structure their Playwright configurations

---

## 1. Grafana: 30-Project Configuration Anatomy

**Source:** `grafana/grafana` — `playwright.config.ts` (main branch)
**Scale:** 30 Playwright projects, single config file, Chrome-only

### Project Taxonomy (5 tiers)

Grafana's 30 projects decompose into five distinct tiers, each with a different purpose:

**Tier 1 — Authentication Setup (2 projects)**
- `authenticate`: Admin login, stores cookies to `playwright/.auth/admin.json`
- `createUserAndAuthenticate`: Creates viewer-role user, stores to `playwright/.auth/viewer.json`
- Pattern: These are dependency-only projects — no user-facing tests, only state creation

**Tier 2 — Role-Scoped Plugin API Tests (2 projects)**
- `admin`: Plugin API tests with admin privileges, depends on `authenticate`
- `viewer`: Plugin API tests with viewer role, depends on `createUserAndAuthenticate`
- Pattern: Same test code, different auth context — role-based project splitting

**Tier 3 — Data Source Plugin Suites (12 projects)**
- `elasticsearch`, `mysql`, `mssql`, `cloudwatch`, `azuremonitor`, `cloudmonitoring`, `graphite`, `influxdb`, `opentsdb`, `jaeger`, `grafana-postgresql-datasource`, `zipkin`
- Pattern: One project per data source plugin. Each has `testDir` pointing to `path.join(pluginDirRoot, '/<plugin-name>')`. All depend on `authenticate`.
- Insight: This is **feature-based project splitting** where each data source is an independent test domain with its own directory.

**Tier 4 — Core Feature Suites (11 projects)**
- `loki`, `unauthenticated`, `various`, `panels`, `smoke`, `dashboards`, `cloud-plugins`, `alerting`, `dashboard-new-layouts`, `extensions-test-app`, `grafana-e2etest-datasource`, `grafana-e2etest-panel`
- Pattern: Feature-domain directories (`*-suite/` or `*-test-*`). Each uses `withAuth()` helper to inject storage state.
- Notable: `unauthenticated` has NO auth dependency — tests pre-login flows
- Notable: `smoke` is a dedicated project, not a tag filter — suggests structural tiering over tag-based tiering

**Tier 5 — CUJ Chain (3 projects)**
- `dashboard-cujs-setup`: Runs only `global-setup.spec.ts` via `testMatch`
- `dashboard-cujs`: Main CUJ tests, depends on setup, excludes setup/teardown files
- `dashboard-cujs-teardown`: Runs only `global-teardown.spec.ts`, depends on main tests
- Pattern: **Sequential dependency chain** using Playwright's `dependencies` array. This is the only suite using the setup→test→teardown project chain pattern.

### Configuration Patterns

| Pattern | Implementation |
|---------|---------------|
| Config file count | **1** — single `playwright.config.ts` at repo root |
| Project count | **30** |
| Browser | Chrome only (`devices['Desktop Chrome']`) |
| Workers | 4 on CI, default locally |
| Base config | `baseConfig` object spread into all projects via `withAuth()` helper |
| Auth injection | `withAuth(config)` function adds `storageState` and `authenticate` dependency |
| Test root variables | `testDirRoot` and `pluginDirRoot` — all `testDir` paths are relative to these |
| Config DRY pattern | Helper functions (`withAuth()`, base config spreading) prevent duplication across 30 projects |

### Key Insight: The 30-Project Mega-Config

Grafana proves that a **single config file with 30 projects is maintainable** when:
1. Helper functions (`withAuth()`) eliminate per-project boilerplate
2. Directory conventions are strict (each project = one directory)
3. Project naming mirrors directory names (no aliasing/indirection)
4. Dependency graphs are shallow (max depth 2: auth → test, or 3 for CUJ chain)

**Anti-pattern avoided:** Grafana does NOT use multiple config files. Despite 30 projects, everything lives in one file with good helper functions.

---

## 2. Next.js: 200+ CI Job Matrix Architecture

**Source:** `vercel/next.js` — `.github/workflows/build_and_test.yml` (1,207 lines)
**Scale:** 33 workflow files, 80+ shards across multiple test matrices

### CI Matrix Decomposition

Next.js does NOT use a single Playwright config with many projects. Instead, it uses **CI-level sharding** across multiple test runners:

**Test Runner Groups (with shard counts):**
| Group | Shards | Framework |
|-------|--------|-----------|
| Turbopack dev tests | 7 | Custom runner |
| Turbopack integration tests | 13 | Custom runner |
| Turbopack production tests | 7 | Custom runner |
| Rspack dev tests | 5 | Custom runner |
| Rspack integration tests | 6 | Custom runner |
| Rspack production tests | 7 | Custom runner |
| Standard (webpack) dev tests | 10 | Custom runner |
| Standard production tests | 10 | Custom runner |
| Standard integration tests | 13 | Custom runner |
| Cache components tests | 6-7 | Custom runner |
| **Total shards** | **~84-85** | |

### Key Architecture Patterns

**1. Static Shard Allocation with Timing Optimization**
- Shard count is hardcoded per group (e.g., `matrix.group: [1/13, 2/13, ..., 13/13]`)
- A `fetch-test-timings` job retrieves historical execution data
- The `run-tests.js` script uses `--timings --require-timings` flags for intelligent distribution
- **Insight:** Static shard count + dynamic test assignment within shards

**2. Multi-Dimension Matrix**
- React version dimension: `['', '18.3.1']` (default + React 18)
- Node version dimension: `[20, 22]` (maintenance + LTS)
- Platform dimension: Linux + Windows (separate job definitions)
- React 18 tests skip on PRs unless labeled `'run-react-18-tests'`

**3. Conditional Execution**
- Documentation-only changes skip all test jobs
- PR labels gate expensive test dimensions
- Concurrency groups prevent duplicate runs per PR

**4. NOT Playwright-Native Sharding**
Next.js uses a custom `run-tests.js` script, not `npx playwright test --shard=N/M`. This is because Next.js runs a mix of Jest and Playwright tests through a unified runner that predates Playwright's built-in sharding.

### Scaling Philosophy: CI-Level Orchestration

Next.js represents the **CI-orchestrated scaling** philosophy:
- Config files are simple (per-test-dir configs)
- Complexity lives in CI workflow YAML
- Sharding is a CI concern, not a Playwright concern
- Test assignment is timing-aware (historical data drives distribution)

This contrasts with Grafana's **config-level orchestration** (30 projects in one config).

---

## 3. Community Guidance on Large Suite Organization

### Scaling Thresholds (synthesized from 6 sources)

| Suite Size | CI Duration Threshold | Recommended Action |
|------------|----------------------|-------------------|
| <50 tests | <5 min | Single config, single shard, tune workers only |
| 50-100 tests | 5-10 min | Add fullyParallel, consider feature directories |
| 100-200 tests | 10-20 min | Begin sharding (1 shard per 50-100 tests), add projects |
| 200-500 tests | 20-40 min | Multi-project config, dedicated CI jobs per project |
| 500-1000 tests | 40+ min | Tiered execution (smoke/full), timing-based shard balancing |
| 1000+ tests | Hours | Multi-config or CI-orchestrated, selective execution |

### Two Confirmed Scaling Philosophies

**Philosophy A: Config-Level Orchestration (Grafana model)**
- Single mega-config with many projects
- Complexity managed through config helper functions
- Projects map 1:1 to directories
- Best for: Monolith applications with many feature domains

**Philosophy B: CI-Level Orchestration (Next.js model)**
- Simple per-directory configs
- Complexity managed through CI matrix YAML
- Custom test runners handle distribution
- Best for: Monorepo frameworks with independent test directories

### Dynamic Sharding Pattern

Community guidance (Lewis Nelson, GitHub Actions pattern):
- Calculate shard count: `ceil(test_count / 40)` — target 40 tests per shard
- Use `fullyParallel: true` for test-level (not file-level) shard distribution
- Combine sharding (cross-machine) with workers (within-machine) for maximum parallelism
- Monitor shard duration imbalance — split slow test files when one shard takes 2x+ longer

### Selective Test Execution

**Playwright v1.46+ `--only-changed` flag:**
- Compares against HEAD or specified revision (`--only-changed=main`)
- Analyzes import dependencies to find affected test files
- Two-stage CI: `--only-changed` first (fast), full suite second (complete)

**Tag-based selective execution (manual approach):**
- Tag tests with module paths: `test('...', { tag: '@apps/microservice1' })`
- CI detects changed modules via `git diff`
- Maps changed paths to tags, runs `--grep "@apps/microservice1|@apps/microservice4"`
- Untagged tests only run in full suite

---

## Cross-Suite Configuration Comparison

| Dimension | Grafana | Next.js | n8n | WordPress | Rocket.Chat |
|-----------|---------|---------|-----|-----------|-------------|
| Config files | 1 | Many (per-dir) | 1 + projects file | 1 (extends base) | 1 |
| Projects | 30 | ~10 per config | 5-7 (dynamic) | 3 (browsers) | 1 |
| Sharding | Not in config | CI-level (84 shards) | Not visible | Not in config | Not visible |
| Workers | 4 (CI) | Per-shard | fullyParallel | 1 (serial) | 1 (serial) |
| Scaling model | Config orchestration | CI orchestration | Hybrid (dynamic projects) | Abstraction (npm package) | Not scaled (anti-pattern) |
| Browser matrix | Chrome only | N/A (custom runner) | Chrome only | 3 browsers | Chrome only |

---

## Emerging Standards (S8-S10 Evidence)

### S8: Scale Tiers
Evidence supports 4 tiers: Small (<50), Medium (50-200), Large (200-500), Enterprise (500+). Tier boundaries correlate with structural changes (see Round 74).

### S9: Directory Scaling
Grafana's 30-project/30-directory 1:1 mapping is the enterprise pattern. The `-suite/` suffix convention aids discovery. freeCodeCamp's 126-file flat structure is the anti-pattern at scale.

### S10: Configuration Scaling
Two viable strategies confirmed: mega-config with helpers (Grafana) vs CI-orchestrated multi-config (Next.js). Helper functions (`withAuth()`, `baseConfig` spreading) are essential for mega-config maintainability. Dynamic project generation (n8n) is a third hybrid approach for infrastructure-variant testing.
