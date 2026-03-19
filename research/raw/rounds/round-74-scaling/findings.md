# Round 74 — Transition Patterns and Directory Restructuring Triggers

**Phase:** Scaling Organization Deep Dive
**Date:** 2026-03-19
**Focus:** When and how suites restructure as they grow — config evolution, directory splitting triggers, fixture segmentation

---

## 1. Config Complexity Across Scale Tiers

### Tier 1: Small (<50 tests)

**Exemplar:** Excalidraw (~30 specs), Slate (~25 specs)

**Config characteristics:**
- Single `playwright.config.ts` with 2-4 projects (browser variants)
- `fullyParallel: true` (default Playwright behavior is sufficient)
- Workers: default (half CPU cores) or explicitly 2-4
- No sharding
- No setup projects — auth handled in `beforeEach` or global setup
- `webServer` auto-start with `reuseExistingServer: !process.env.CI`
- Timeouts: single global value (30s typical)

**Config LOC:** ~30-60 lines

**Example structure:**
```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: { command: 'npm start', port: 3000 },
});
```

### Tier 2: Medium (50-200 tests)

**Exemplars:** Ghost (81 specs), Immich (90+ specs), freeCodeCamp (126 specs)

**Config changes from Tier 1:**
- Auth setup project appears (`setup` → `chromium` dependency chain)
- Storage state management (`playwright/.auth/<role>.json`)
- CI-conditional logic emerges (`process.env.CI ? ... : ...`)
- Worker count becomes explicit (freeCodeCamp: 1, Immich: default)
- Retry strategies differentiate CI vs local (Immich: 4 retries CI / 0 local)
- `maxFailures` appears for fail-fast behavior (freeCodeCamp: 6 in CI)
- Multiple reporter configurations (CI: github + blob; local: list + html)
- Feature directories start forming (Ghost: admin/, portal/)

**Config LOC:** ~60-120 lines

**Key transition trigger:** When the first auth-dependent test appears, the suite needs a setup project. This typically happens at 30-50 tests when auth scenarios diversify beyond a single role.

### Tier 3: Large (200-500 tests)

**Exemplars:** Grafana (163+ specs, 30 projects), n8n (174 specs, 5-7 dynamic projects), Rocket.Chat (170 specs), WordPress (278 specs)

**Config changes from Tier 2:**
- Multiple auth contexts (admin, viewer, unauthenticated)
- Feature-based projects replace browser-only projects
- Helper functions appear for config DRY (`withAuth()`, `baseConfig`)
- `testDir` per project points to different directories
- Dependency chains grow (auth → role-scoped → feature tests)
- Custom reporters emerge (flaky-test tracking, custom CI reporters)
- Global setup/teardown becomes necessary
- Config may be split into multiple files (n8n: `playwright-projects.ts` separate from `playwright.config.ts`)

**Config LOC:** ~120-400 lines (or split across files)

**Key transition triggers:**
1. When 3+ auth roles are needed → multi-auth setup projects
2. When a single `testDir` no longer works → per-project `testDir` with feature directories
3. When config exceeds ~150 lines → extract helper functions or separate project definitions

### Tier 4: Enterprise (500+ tests)

**Exemplars:** Next.js (550+ dirs), Grafana full ecosystem (31 projects in OSS + additional in enterprise)

**Config changes from Tier 3:**
- CI workflow becomes the primary orchestration layer (not config)
- Multiple config files possible (one per app in monorepo)
- Timing-based shard balancing
- Selective test execution (`--only-changed` or tag-based filtering)
- Cross-repo test infrastructure (published packages like `@wordpress/e2e-test-utils-playwright`)
- Dedicated flakiness tracking and quarantine systems
- Per-project reporter configurations

**Config LOC:** 400+ (if single file) or distributed across CI YAML

---

## 2. Directory Restructuring Triggers

### Trigger 1: Flat → Feature-Nested (~20-30 test files)

**Signal:** Developers struggle to find relevant test files. Naming conventions become strained (prefixing file names with feature area: `auth-login.spec.ts`, `auth-signup.spec.ts`, `auth-reset.spec.ts`).

**Evidence:**
- freeCodeCamp maintains flat structure at 126 files — but file names ARE the organizational system (`settings.spec.ts`, `flash-messages.spec.ts`, etc.)
- Grafana moved to `-suite/` directories when the test count grew beyond visual scanning
- Cal.com organizes by feature from the start (`auth/`, `eventType/`, `team/`)

**Recommended transition:**
```
BEFORE (flat):
  e2e/
    auth-login.spec.ts
    auth-signup.spec.ts
    auth-reset.spec.ts
    dashboard-create.spec.ts
    dashboard-edit.spec.ts

AFTER (nested):
  e2e/
    auth/
      login.spec.ts
      signup.spec.ts
      reset.spec.ts
    dashboard/
      create.spec.ts
      edit.spec.ts
```

**Cost of NOT transitioning:** Slower test discovery, harder code review (which tests are affected by a change?), CODEOWNERS becomes impractical.

### Trigger 2: Single Feature Dir → Sub-Feature Dirs (~10-15 specs per feature)

**Signal:** A feature directory accumulates 10+ spec files covering sub-features.

**Evidence:**
- Grafana's `dashboards-suite/` has sub-tests for creation, editing, variables, templating, permissions
- n8n's `tests/` has 28 categories in deep directory nesting
- Rocket.Chat's flat test dir has 75 spec files — a candidate for restructuring

**Recommended transition:**
```
BEFORE:
  e2e/dashboard/
    create.spec.ts
    edit.spec.ts
    variables.spec.ts
    permissions.spec.ts
    sharing.spec.ts
    templating.spec.ts
    layout.spec.ts
    filters.spec.ts
    annotations.spec.ts
    versions.spec.ts
    export.spec.ts

AFTER:
  e2e/dashboard/
    crud/
      create.spec.ts
      edit.spec.ts
      export.spec.ts
      versions.spec.ts
    configuration/
      variables.spec.ts
      templating.spec.ts
      annotations.spec.ts
    access/
      permissions.spec.ts
      sharing.spec.ts
    display/
      layout.spec.ts
      filters.spec.ts
```

### Trigger 3: Spec Files Get Split (~200 lines or ~10 tests per file)

**Signal:** Individual spec files exceed 200 lines or contain 10+ tests spanning distinct sub-scenarios.

**Evidence:**
- Community consensus: files with 10+ tests indicate multiple concerns bundled together
- Sharding effectiveness drops with large files (sharding is file-level by default)
- Grafana keeps spec files focused: typically 3-8 tests per file
- n8n averages 4-6 tests per file

**Recommended threshold:** Split when a file exceeds 200 lines OR 10 tests OR covers more than 2 distinct user workflows.

### Trigger 4: Fixture Segmentation (~3+ auth roles or ~2+ environments)

**Signal:** The base fixture file grows beyond 100 lines, or fixtures include environment-specific logic.

**Evidence:**
- n8n splits into `base.ts` + `cloud-only.ts` when cloud-specific fixtures accumulated
- Grafana plugin-e2e splits fixtures by role (admin, viewer) and capability (feature flags)
- Supabase maintains a single fixture file — works at ~177 tests but approaching the split threshold

**Recommended segmentation:**
```
fixtures/
  base.ts          # Core fixtures (auth, navigation, DB)
  admin.ts         # Admin-role specific fixtures
  cloud.ts         # Cloud-environment specific fixtures
  performance.ts   # Performance test specific fixtures
```

---

## 3. Page Object Evolution

### Stage 1: No POMs (0-20 tests)
- Tests use raw Playwright locators inline
- Acceptable when tests are few and selectors are simple
- Evidence: Early-stage AFFiNE, small community suites

### Stage 2: Thin POMs (20-50 tests)
- Page objects as locator collections (getter-only)
- No action methods, just organized selectors
- Evidence: Supabase Studio POM files

### Stage 3: Action POMs (50-150 tests)
- Page objects with action methods (login, createItem, navigateTo)
- Constructor accepts `Page`, methods return `void` or assertions
- Evidence: Rocket.Chat (0.66 POM-to-spec ratio), Ghost

### Stage 4: Fixture-Injected POMs (150+ tests)
- Page objects injected via Playwright fixtures, not constructed in tests
- Composable patterns for multi-page workflows
- Evidence: n8n (fixture-based), Grafana plugin-e2e (25+ fixture-injected models)

### Stage 5: Published POM Package (Ecosystem scale)
- Page objects and utilities as versioned npm package
- Evidence: WordPress `@wordpress/e2e-test-utils-playwright`

---

## 4. Configuration File Evolution

### Stage 1: Minimal Config (~30 lines, <50 tests)
```
Single browser project, default workers, webServer auto-start
```

### Stage 2: Auth-Aware Config (~80 lines, 50-100 tests)
```
+ Setup project for auth
+ Storage state management
+ CI/local conditional logic
+ Retry differentiation
```

### Stage 3: Multi-Project Config (~150 lines, 100-200 tests)
```
+ Feature-based projects
+ Per-project testDir
+ Helper functions for config DRY
+ Multiple reporters
```

### Stage 4: Orchestrated Config (~300+ lines, 200+ tests)
```
+ Config helper functions (withAuth, baseConfig)
+ Dependency chains (auth → role → feature)
+ Separated project definitions file
+ Custom reporters (flakiness tracking)
+ Global setup/teardown
```

### Stage 5: CI-Distributed Config (500+ tests)
```
+ CI matrix replaces config-level orchestration
+ Multiple config files (per-app or per-domain)
+ Timing-based shard balancing in CI
+ Selective execution (--only-changed or tag-grep)
```

---

## Emerging Standards (S8-S9 Evidence)

### S8: Scale Tiers & Transition Triggers

**S8.1: Recognize four scale tiers with distinct organizational requirements.**
Small (<50), Medium (50-200), Large (200-500), Enterprise (500+). Each tier has a config pattern, directory pattern, fixture pattern, and execution pattern.

**S8.2: Directory restructuring triggers are predictable.**
Flat→nested at 20-30 files. Sub-feature splitting at 10-15 specs per feature. File splitting at 200 lines or 10 tests. Fixture segmentation at 3+ roles or 2+ environments.

### S9: Directory & File Scaling

**S9.1: Feature-based directory organization should begin before 30 test files.**
Evidence: Suites that delay restructuring (freeCodeCamp at 126 flat files, Rocket.Chat at 75 flat specs) accumulate organizational debt.

**S9.2: Spec files should stay under 200 lines and 10 tests.**
This maintains sharding effectiveness and file-level readability. Both Grafana (3-8 tests/file) and n8n (4-6 tests/file) stay well below this threshold.

**S9.3: Directory names should match Playwright project names.**
Grafana's 1:1 mapping of project names to directory names eliminates indirection. When `testDir` points to `dashboards-suite/`, the project name should be `dashboards`.
