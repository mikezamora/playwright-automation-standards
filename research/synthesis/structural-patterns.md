# Structural Patterns

## Overview

This document consolidates structural patterns observed across 10 Gold-standard Playwright suites and 12 Silver suites during the landscape phase (rounds 1-11), refined with deep-dive analysis from the structure phase (rounds 13-16).

**Status:** Updated with structure phase findings — confirmed patterns with frequencies across 10 deep-dive suites

---

## Confirmed Patterns (Rounds 13-16 Deep Dives)

### 1. Configuration File Patterns

**Pattern: TypeScript-only configuration**
- Frequency: 10/10 Gold suites use `playwright.config.ts` (never `.js`)
- Confirmed across all 10 deep-dive suites
- Evidence: [grafana-e2e], [calcom-e2e], [affine-e2e], [immich-e2e], [playwright-official], [freecodecamp-e2e], [grafana-plugin-e2e]

**Pattern: Environment-aware configuration**
- Frequency: 10/10 Gold suites implement CI vs. local conditional logic
- Implementation: `process.env.CI ? ciValue : localValue` for timeouts, retries, workers, reporters
- **Confirmed divergent strategies:**
  - Cal.com: 60s CI / 240s local (shorter in CI — "dev servers are slow locally")
  - AFFiNE: 50s CI / 30s local (longer in CI — "CI environments are less predictable")
  - Grafana: 10s expect timeout globally (no CI/local split for timeouts)
  - Immich: 4 retries CI / 0 local (highest retry count — Docker variability)
  - freeCodeCamp: 15s flat timeout, `maxFailures: 6` in CI

**Pattern: Multi-project configuration**
- Frequency: 10/10 Gold suites define multiple Playwright projects
- **Confirmed range:** 2 projects (Playwright) to 28 projects (Grafana)
- **Project count correlates with application complexity:**
  - Grafana: 28 (auth + 16 data sources + 9 features + 3 CUJS)
  - Cal.com: 7 (app + packages + cross-browser embeds)
  - freeCodeCamp: 6 (setup + 5 browsers)
  - Grafana plugin-e2e: 5 (auth + admin + admin-wide + viewer)
  - Immich: 3 (web + ui + maintenance)
  - Playwright: 2 (playwright-test + image_tools)

**Pattern: `webServer` auto-start**
- Frequency: 6/10 Gold suites
- Convention: `reuseExistingServer: !process.env.CI` (fresh in CI, reuse locally)
- **Confirmed variants:**
  - Cal.com: 3 servers (ports 3000, 3100, 3101) — monorepo multi-app
  - AFFiNE: yarn workspace dev command, 120s startup
  - Immich: Docker Compose full-stack (`--renew-anon-volumes --force-recreate`)
  - freeCodeCamp: Mailpit Docker container for email testing (infrastructure, not app)
  - Grafana: conditional (only when `GRAFANA_URL` not set)

### 2. Directory Structure Patterns

**Pattern: Dedicated test directory at project root**
- Frequency: 10/10 Gold suites
- **Confirmed variants with frequencies:**
  - `e2e/` — Cal.com, Immich, freeCodeCamp (3/10)
  - `e2e-playwright/` — Grafana (1/10)
  - `tests/` — AFFiNE, Playwright, Supabase (3/10)
  - `packages/plugin-e2e/` — Grafana plugin-tools (1/10)

**Pattern: Suite-based directory grouping (Gold standard for large suites)**
- Frequency: 3/5 Gold suites with 20+ tests
- Grafana: `*-suite/` directories (alerting-suite, dashboards-suite, panels-suite)
- Cal.com: Feature directories (auth/, eventType/, team/, organization/)
- AFFiNE: Deployment-target packages (affine-local, affine-cloud, affine-desktop)
- **Contrast:** freeCodeCamp uses flat file organization (126 files, no subdirectories)

**Pattern: Auth state in dedicated directory**
- Frequency: 5/10 deep-dive suites
- Convention: `playwright/.auth/<role>.json` added to `.gitignore`
- Evidence: [grafana-e2e], [grafana-plugin-e2e], [freecodecamp-e2e] (`certified-user.json`)

### 3. Page Object Model Variants

**Variant A: Class-based POM (Traditional/Historical)**
- Page objects as TypeScript classes with constructor accepting `Page`
- Evidence: [clerk-e2e-template] (archived, represents pre-2023 approach)
- **Status:** Superseded by Variants B and C

**Variant B: Fixture-based POM (Modern)**
- Page objects registered as fixtures via `test.extend<T>()`
- Injected into tests via dependency injection
- Evidence: [grafana-plugin-e2e] (models + fixtures + matchers + selectors)
- **Highest maturity:** Published as npm package for ecosystem consumption

**Variant C: Hybrid POM + Fixtures**
- Class-based page objects created inside fixture definitions
- Combines encapsulation (classes) with dependency injection (fixtures)
- Evidence: [calcom-e2e] (factory fixtures with scenario composition)
- **Dominant pattern in active Gold suites**

**Variant D: Function-based helpers (No POM)**
- Standalone utility functions, no class abstraction
- Evidence: [affine-e2e] (`openHomePage()`, `clickNewPageButton()` from `@affine-test/kit`)
- Evidence: [freecodecamp-e2e] (utils/ directory with helper functions)
- **Viable for suites that prioritize simplicity over abstraction**

**Variant E: No abstraction (Data fixtures only)**
- Plain TypeScript DTO objects with factory methods, no page interaction abstraction
- Evidence: [immich-e2e] (`fixtures.ts` with `createUserDto.create()`)
- **Suitable for API-heavy testing with minimal UI interaction**

### 4. Fixture Patterns

**Pattern: `test.extend<T>()` for custom fixtures**
- Frequency: 5/10 deep-dive suites (Gold suites with Playwright-native patterns)
- Key indicator: separates mature suites from basic implementations
- Evidence: [grafana-e2e], [calcom-e2e], [grafana-plugin-e2e]

**Pattern: Shared kit/utility packages in monorepos**
- Frequency: 2/10 (AFFiNE `@affine-test/kit`, Grafana `@grafana/plugin-e2e`)
- Centralizes test utilities for consumption across multiple test packages
- **Highest maturity variant:** Published npm package (Grafana)

**Pattern: Domain-specific custom matchers**
- Frequency: 1/10 deep-dive suites (highest maturity)
- Example: `expect(panel).toHaveNoDataError()` in Grafana
- Evidence: [grafana-plugin-e2e] (published npm package with custom matchers)

**Pattern: Factory functions for test data**
- Frequency: 3/10 deep-dive suites
- Cal.com: `createUsersFixture()` with scenario composition (teams, orgs, feature flags)
- Immich: `createUserDto.create()` factory method on DTO objects
- Clerk: `createSignupAttributes()` (historical template)

### 5. CI Integration Structure

**Pattern: Dedicated CI workflow files**
- Frequency: 8/10 deep-dive suites (excluding Supabase Vitest and Excalidraw non-Playwright)
- Convention: `.github/workflows/e2e-playwright.yml` or similar

**Pattern: Multi-reporter configuration**
- Frequency: 6/10 deep-dive suites use 2+ reporters
- **Confirmed reporter combinations:**
  - Cal.com: blob (CI) + HTML + JUnit XML (3 reporters)
  - Playwright: dot + JSON + blob (3 reporters, CI only)
  - AFFiNE: github (CI) / list (local) — context-switched
  - Grafana: HTML + custom a11y reporter (2 reporters)
  - freeCodeCamp: HTML only
  - Immich: HTML only

**Pattern: Conditional artifact capture**
- Frequency: 8/10 deep-dive suites
- **Standard confirmed:** `trace: 'retain-on-failure'` or `'on-first-retry'`
- Screenshot: `'only-on-failure'` universal
- Video: AFFiNE only (`'on-first-retry'`) — unique among analyzed suites

### 6. Retry Configuration Spectrum (NEW — Round 14)

**Pattern: Retry count correlates with infrastructure complexity**
- Immich: 4 retries (Docker Compose full-stack)
- AFFiNE: 3 retries (yarn workspace dev server)
- Cal.com: 2 retries (3 web servers)
- freeCodeCamp: 2 retries (Docker API + external app)
- Grafana: 1 retry (plugin build + local server)
- Grafana plugin-e2e: 2 retries
- Playwright: 0 retries (no webServer, testing framework itself)

### 7. Worker Configuration Patterns (NEW — Round 14)

**Pattern: Dynamic worker allocation**
- Fixed in CI, dynamic locally
- Immich: `Math.round(os.cpus().length * 0.75)` — 75% CPU formula
- AFFiNE: `'50%'` string — percentage-based
- Cal.com: CPU count or 1 (debug mode)
- freeCodeCamp: `1` always — serial execution
- Grafana: 4 in CI, undefined (auto) locally

---

## Maturity Spectrum (Confirmed)

Based on deep-dive analysis, suites fall on a maturity spectrum:

| Level | Pattern | Example |
|-------|---------|---------|
| **1. Basic** | Flat files, no POM, serial execution | freeCodeCamp |
| **2. Structured** | Feature directories, function helpers | AFFiNE |
| **3. Fixture-based** | test.extend(), factory data, parallel | Cal.com, Immich |
| **4. Framework** | Published package, custom matchers | Grafana plugin-e2e |

Each level is valid — maturity should match project needs, not be pursued for its own sake.

---

## Confirmed Themes

1. **Fixture-based architecture is replacing pure POM** — Hybrid (Variant C) is the dominant modern pattern
2. **Configuration complexity scales with project size** — Grafana's 28 projects vs. Playwright's 2 reflects the spectrum
3. **Monorepo structure drives config organization** — Cal.com and AFFiNE both demonstrate monorepo-specific patterns
4. **Auth structure is standardizing** — `.auth/` directory with storageState + setup projects
5. **NEW: Retry counts encode infrastructure confidence** — Higher retries = more infrastructure variability
6. **NEW: Serial execution is a valid strategy** — freeCodeCamp proves 126 tests work with 1 worker
7. **NEW: Not all apps need Playwright** — Supabase and Excalidraw show Vitest fills the gap for component-heavy apps

---

## Resolved Questions (from Landscape Phase)

1. **How do Gold suites compose fixtures?** — Cal.com uses factory composition, Grafana publishes via npm, AFFiNE uses shared kit package
2. **What is the maximum practical depth for fixture hierarchies?** — 2 levels observed (factory → scenario → user), not deeper
3. **How do monorepo suites share page objects?** — Via workspace packages (@affine-test/kit, @grafana/plugin-e2e)
4. **Test file naming conventions:** `.spec.ts` (Grafana, AFFiNE, freeCodeCamp, Playwright), `.e2e.ts` (Cal.com), `.e2e-spec.ts` (Immich)
5. **Test utility organization:** `utils/` or `lib/` alongside tests, or shared workspace packages

## Open Questions (for Rounds 17-22)

1. What specific fixture composition patterns (mergeTests, mergeExpect) are used in practice?
2. How do suites handle test data cleanup across parallel workers?
3. What is the optimal project structure for teams of different sizes?
