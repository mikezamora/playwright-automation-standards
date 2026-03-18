# Round 22 — Audit Notes (Structure Standards Finalization)

**Date:** 2026-03-18
**Purpose:** Document what changed from preliminary standards, what was confirmed, unresolved contradictions, and confidence levels

---

## What Changed from Preliminary Standards

### S1. Configuration
- **S1.1 (TypeScript config):** No change — confirmed at highest confidence
- **S1.2 (Environment-aware):** Expanded with specific examples of divergent timeout strategies (Cal.com shorter in CI vs AFFiNE longer in CI). Added explicit anti-pattern: multi-env config files
- **S1.3 (Multi-project):** Expanded with project count guidance by team size (2-5 small, 5-15 medium, 15-31 large). Added `withAuth()` helper pattern for large suites
- **S1.4 (webServer):** Added four architectural variants (app server, conditional server, infrastructure server, full-stack orchestration). Clarified this is SHOULD not MUST
- **NEW S1.5 (Timeout hierarchy):** Added — three-tier timeout architecture with application-type guidance
- **NEW S1.6 (Reporter stacking):** Added — three-slot reporter pattern (progress + artifact + integration)

### S2. Directory Structure
- **S2.1 (Dedicated test directory):** No change — confirmed. Added variant frequency data
- **S2.2 (Auth state directory):** No change — confirmed with additional evidence from PostHog and Supabase community
- **S2.3 (Page objects/fixtures alongside tests):** Expanded with specific directory naming conventions (`pages/` dominant, `page-models/` alternative)
- **NEW S2.4 (Feature-based grouping):** Added — explicitly recommends feature directories over type directories

### S3. Page Object Model
- **S3.1 (Hybrid POM + fixtures):** Significantly expanded to cover all 5 POM variants with clear decision framework
- **S3.2 (Focused POM):** Expanded with three-category method organization (navigation, action, state)
- **NEW S3.3 (Constructor pattern):** Added — canonical `constructor(page: Page)` with `readonly` locator properties
- **NEW S3.4 (No POM inheritance):** Added as explicit anti-pattern based on rounds 20-21 evidence
- **NEW S3.5 (Dynamic content handling):** Added — locator composition over explicit waits

### S4. Fixtures
- **S4.1 (test.extend):** No change — confirmed
- **S4.2 (Domain-specific abstractions):** Expanded with npm package publishing as highest maturity indicator
- **S4.3 (Factory functions):** Expanded with concrete patterns (scenario composition, DTO factories, transactional cleanup)
- **NEW S4.4 (Fixture scoping):** Added — test scope vs worker scope decision framework
- **NEW S4.5 (Fixture composition):** Added — `mergeTests()`/`mergeExpects()` for modular architecture
- **NEW S4.6 (Auto fixtures):** Added — cross-cutting concerns (logging, cleanup, metrics)

### S5. CI Integration Structure
- No structural changes — moved to validation standards scope (rounds 23-32)
- Retained artifact capture standards (trace, screenshot) as they relate to config structure

### NEW S6. Test Grouping
- Entirely new section — feature-based vs type-based vs capability-based grouping
- Added tagging strategies for filtering

### NEW S7. Data Management
- Entirely new section — API-first creation, fixture cleanup, factory patterns, worker isolation

## What Was Confirmed (No Changes Needed)

1. TypeScript-only configuration — 22/22 production suites
2. `process.env.CI` as the universal environment switch — 12/12 deep-dived suites
3. Dedicated test directory at project root — 22/22 suites
4. `.auth/` directory convention with `.gitignore` — all auth-using suites
5. `test.extend<T>()` as maturity indicator — 8/10 Gold suites
6. `trace: 'retain-on-failure'` as universal trace strategy — 10/10 Gold suites
7. `screenshot: 'only-on-failure'` — universal
8. Video OFF by default — only AFFiNE uses video

## Unresolved Contradictions

### 1. Timeout direction in CI vs local (Low impact)
- Cal.com: shorter timeout in CI (60s) vs local (240s) — rationale: "dev servers are slow locally"
- AFFiNE: longer timeout in CI (50s) vs local (30s) — rationale: "CI environments are less predictable"
- **Resolution:** Both are valid. The direction depends on application architecture (local dev server performance vs CI infrastructure variability). The standard recommends documenting the rationale rather than prescribing a direction.

### 2. Auth approach: setup projects vs auto fixtures (Medium impact)
- Gold standard: Setup projects with `storageState` (Grafana, freeCodeCamp)
- Emerging: Auto fixtures for auth (PostHog, community patterns)
- **Resolution:** Setup projects remain the recommended default (better HTML report visibility, official documentation). Auto fixtures are documented as a valid alternative for teams needing `--ui` mode compatibility.

### 3. webServer configuration: SHOULD vs MUST (Low impact)
- 7/12 deep-dived suites use `webServer` config
- 5/12 manage server start externally (Docker Compose, pre-existing servers)
- **Resolution:** SHOULD, not MUST. Applications with complex infrastructure (Docker Compose, multiple services) may require external orchestration.

### 4. POM approach: no single winner (Medium impact)
- Hybrid POM+Fixtures (Cal.com), Fixture-based (Grafana), Function helpers (AFFiNE) — all Gold suites
- **Resolution:** Recommend Hybrid as the default, document alternatives as valid for specific contexts. The key constraint is "no POM inheritance" which is the only universal negative.

## Confidence Levels by Standard Area

| Standard Area | Confidence | Basis | Risk |
|---|---|---|---|
| **S1. Configuration** | Very High | 22/22 production suites consistent | Minimal — these are infrastructure patterns |
| **S2. Directory Structure** | Very High | 22/22 suites follow conventions | Low — naming variants exist but choices are clear |
| **S3. Page Object Model** | High | 10 Gold + 5 Silver suites analyzed | Medium — multiple valid approaches exist |
| **S4. Fixtures** | High | 8/10 Gold suites use `test.extend()` | Low — the scope/composition framework is well-established |
| **S5. Test Grouping** | High | 5/5 Gold suites with 20+ tests confirm | Low — feature-based grouping is clearly superior |
| **S6. Data Management** | Medium-High | 3/10 Gold suites have visible data patterns | Medium — less observable than config/structure patterns |
| **S7. CI Integration** | Very High | 10/10 Gold suites have CI workflows | Minimal — patterns are convergent |

## Total Evidence Base

- **Gold suites analyzed:** 10
- **Silver suites analyzed:** 5 (Slate, PostHog, Actual Budget, Supabase community, playwright-ts)
- **Bronze/Community analyzed:** 7+ (validation sweep)
- **Documentation sources:** 25+ (official docs, guides, articles)
- **Total sources:** 107+ (from landscape phase) + 15 (rounds 13-22) = 122+
- **Deep-dive suite analyses:** 12 (rounds 13-20)
- **Quick structural scans:** 12 (round 21)
