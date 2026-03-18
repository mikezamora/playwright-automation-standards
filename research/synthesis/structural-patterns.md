# Structural Patterns

## Overview

This document consolidates structural patterns observed across 10 Gold-standard Playwright suites and 12 Silver suites during the landscape phase (rounds 1-11). Structural patterns include file layouts, configuration approaches, Page Object Model variants, fixture patterns, and project organization.

**Status:** Initial synthesis — to be refined in structure phase (rounds 13-22)

---

## Observed Patterns

### 1. Configuration File Patterns

**Pattern: TypeScript-only configuration**
- Frequency: 10/10 Gold suites use `playwright.config.ts` (never `.js`)
- Evidence: [grafana-e2e], [calcom-e2e], [affine-e2e], [immich-e2e], [playwright-official], [freecodecamp-e2e], [supabase-e2e], [excalidraw-e2e], [grafana-plugin-e2e], [nextjs-e2e]

**Pattern: Environment-aware configuration**
- Frequency: 10/10 Gold suites implement CI vs. local conditional logic
- Implementation: `process.env.CI ? ciValue : localValue` for timeouts, retries, workers, reporters
- Evidence: [calcom-e2e] (10s CI / 120s local timeouts), [affine-e2e] (50s CI / 30s local), [grafana-e2e] (`retries: process.env.CI ? 1 : 0`), [immich-e2e] (`retries: 4` CI / `0` local)

**Pattern: Multi-project configuration**
- Frequency: 10/10 Gold suites define multiple Playwright projects
- Range: 3 projects (Immich) to 30+ projects (Grafana)
- Common project types: browser targets, auth roles, app areas, test categories
- Evidence: [grafana-e2e] (30+ projects), [calcom-e2e] (7 projects), [immich-e2e] (3 projects)

**Pattern: `webServer` auto-start**
- Frequency: 6/10 Gold suites
- Convention: `reuseExistingServer: !process.env.CI` (fresh in CI, reuse locally)
- Evidence: [calcom-e2e] (3 servers on ports 3000, 3100, 3101), [affine-e2e] (120s startup timeout), [immich-e2e] (Docker Compose as webServer)

### 2. Directory Structure Patterns

**Pattern: Dedicated test directory at project root**
- Frequency: 10/10 Gold suites
- Variants observed:
  - `e2e/` — Cal.com, Immich, AFFiNE
  - `tests/` — Grafana, freeCodeCamp
  - `playwright/` — Less common, used by some Silver suites
- Evidence: [calcom-e2e], [immich-e2e], [grafana-e2e]

**Pattern: Auth state in `.auth/` directory**
- Frequency: 4/10 Gold suites (those using storageState)
- Convention: `playwright/.auth/<username>.json` added to `.gitignore`
- Evidence: [grafana-e2e], [grafana-plugin-e2e], [supabase-e2e]

**Pattern: Page objects alongside or within test directory**
- Frequency: 8/10 Gold suites use POM or similar abstraction
- Variants: `pages/`, `models/`, `fixtures/` subdirectories
- Evidence: [grafana-plugin-e2e] (models/), [calcom-e2e] (fixtures/)

### 3. Page Object Model Variants

**Variant A: Class-based POM (Traditional)**
- Page objects as TypeScript classes with constructor accepting `Page`
- Methods encapsulate interactions and locators
- Evidence: [clerk-e2e-template], [boilerplate-playwright-ts]

**Variant B: Fixture-based POM (Modern)**
- Page objects registered as fixtures via `test.extend<T>()`
- Injected into tests via dependency injection
- Evidence: [grafana-plugin-e2e] (domain-specific fixtures), [grafana-e2e]

**Variant C: Hybrid POM + Fixtures**
- Class-based page objects created inside fixture definitions
- Combines encapsulation (classes) with dependency injection (fixtures)
- Evidence: [calcom-e2e], [playwright-ts-framework]
- This is the emerging dominant pattern

### 4. Fixture Patterns

**Pattern: `test.extend<T>()` for custom fixtures**
- Frequency: 8/10 Gold suites
- Key indicator: separates mature suites from basic implementations
- Evidence: [grafana-e2e], [calcom-e2e], [affine-e2e], [immich-e2e], [playwright-official], [supabase-e2e], [grafana-plugin-e2e], [nextjs-e2e]

**Pattern: Domain-specific custom matchers**
- Frequency: 2/10 Gold suites (highest maturity)
- Example: `expect(panel).toHaveNoDataError()` in Grafana
- Evidence: [grafana-plugin-e2e] (published npm package with custom matchers)

**Pattern: Factory functions for test data**
- Frequency: Moderate across Gold/Silver
- Uses Faker.js for randomized typed data
- Evidence: [clerk-e2e-template] (`createSignupAttributes()`), [playwrightsolutions-datafactory]

### 5. CI Integration Structure

**Pattern: Dedicated CI workflow files**
- Frequency: 10/10 Gold suites
- Convention: `.github/workflows/e2e-playwright.yml` or similar
- Evidence: All Gold suites

**Pattern: Multi-reporter configuration**
- Frequency: 8/10 Gold suites use 2+ reporters
- Common combination: blob (CI) + HTML + JUnit XML
- Evidence: [calcom-e2e] (3 reporters), [grafana-e2e] (HTML + a11y), [affine-e2e] (github reporter in CI)

**Pattern: Conditional artifact capture**
- Frequency: 10/10 Gold suites
- Standard: `trace: 'retain-on-failure'`, `screenshot: 'only-on-failure'`, video off
- Evidence: All Gold suites (with minor variations)

---

## Emerging Themes

1. **Fixture-based architecture is replacing pure POM** — The trend moves from class-only POM toward fixtures that compose page objects with test setup
2. **Configuration complexity scales with project size** — Grafana's 30+ projects vs. Excalidraw's minimal config reflects the spectrum
3. **Monorepo structure drives config organization** — Turborepo and Nx impose specific patterns for Playwright integration
4. **Auth structure is standardizing** — `.auth/` directory convention with storageState is becoming universal

---

## Open Questions (for Structure Phase)

1. How do Gold suites compose fixtures from multiple sources? (`mergeTests`, `mergeExpect`)
2. What is the maximum practical depth for fixture hierarchies?
3. How do monorepo suites share page objects across packages?
4. What naming conventions are used for test files? (`*.spec.ts` vs `*.test.ts` vs `*.e2e.ts`)
5. How are test utilities (helpers, constants, types) organized relative to tests?
