# Rhetoric Patterns

## Overview

This document consolidates rhetoric patterns — how Playwright suites communicate their purpose, usage, and conventions — observed during the landscape phase (rounds 1-11) and refined with deep-dive analysis from the structure phase (rounds 13-16).

**Status:** FINAL — Updated with structure phase findings, confirmed in cross-validation (rounds 47-55). Patterns reflected in `standards/semantic-conventions.md` (FINAL).

---

## Confirmed Patterns (Rounds 13-16 Deep Dives)

### 1. Test Description Style

**Pattern: User-centric test descriptions**
- Frequency: 8/10 deep-dive suites
- Tests describe what the user does and sees, not implementation details
- **Confirmed examples:**
  - Cal.com: `'can reschedule a booking'`, `'Cannot book same slot multiple times'`
  - AFFiNE: `'all page can create new page'`, `'enable selection and use ESC to disable selection'`
  - Grafana: `'Manage Dashboards tests'` (within `@dashboards` tag scope)
- **Flat vs. nested naming:**
  - AFFiNE uses flat test names without describe blocks — names are self-contained
  - Cal.com uses describe blocks for user-type scoping (`'free user'`, `'pro user'`)
  - Grafana uses tagged describe blocks (`{ tag: ['@dashboards'] }`)

**Pattern: Minimal comments in test code**
- Confirmed across all deep-dive suites
- Comments appear for: workaround explanations, TODO references, skip/fixme justifications
- Cal.com: `test.skip()` with TODO comments
- Grafana: `test.fixme()` with issue references

### 2. File Naming Conventions (NEW — Confirmed)

**Pattern: Three distinct file naming conventions coexist**
- `.spec.ts` — Grafana, AFFiNE, freeCodeCamp, Playwright (4/7 Playwright-using suites)
- `.e2e.ts` — Cal.com (1/7)
- `.e2e-spec.ts` — Immich (1/7)
- `.test.tsx` — Excalidraw, Supabase (Vitest suites, not Playwright)
- **Observation:** `.spec.ts` is the plurality convention, but no single standard dominates

**Pattern: kebab-case file names are universal in Playwright suites**
- `dashboard-browse.spec.ts` (Grafana)
- `booking-pages.e2e.ts` (Cal.com)
- `all-page.spec.ts` (AFFiNE)
- `shared-link.e2e-spec.ts` (Immich)
- `challenge.spec.ts` (freeCodeCamp)
- **Contrast:** Vitest suites use camelCase (`arrowBinding.test.tsx` in Excalidraw)

### 3. Configuration as Documentation

**Pattern: Self-documenting configuration through naming**
- Frequency: 10/10 deep-dive suites
- **Confirmed examples:**
  - Cal.com: `NEXT_PUBLIC_IS_E2E=1` — self-documenting scope flag
  - Immich: `PLAYWRIGHT_BASE_URL`, `PLAYWRIGHT_DISABLE_WEBSERVER`, `PLAYWRIGHT_SLOW_MO` — all prefixed
  - Grafana: `GRAFANA_URL`, `PROV_DIR` — purpose-clear naming
  - freeCodeCamp: `HOME_LOCATION` — maps to deployment concept
  - AFFiNE: yarn workspace commands in webServer — documents build graph

**Pattern: Layered env var documentation**
- Defaults in config > overrides via env vars > CI secrets for credentials
- The configuration itself documents the hierarchy
- **Confirmed examples:**
  - Grafana: `process.env.GRAFANA_URL ?? 'http://localhost:3001'`
  - Immich: `process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:2285'`
  - freeCodeCamp: `process.env.HOME_LOCATION ?? 'http://127.0.0.1:8000'`

**Pattern: Code comments explain non-obvious configuration choices**
- Cal.com: `"Dev Server on local can be slow to start up and process requests"` — explains inverted timeout model
- This practice is rare (1/10 suites) but highly valuable for communicating intent

### 4. Tag-Based Test Communication (NEW — Round 13)

**Pattern: Tags communicate test domain and enable selective execution**
- Frequency: 1/7 Playwright suites (Grafana only, but influential)
- Grafana: `{ tag: ['@dashboards'] }` on describe blocks
- Enables: `npx playwright test --grep @dashboards`
- **Communication value:** Tags make test organization visible in reports and CI

### 5. Directory Structure as Communication

**Pattern: Directory names communicate test scope and audience**
- Grafana: `as-admin-user/`, `as-viewer-user/` — role-based directories
- AFFiNE: `affine-local/`, `affine-cloud/`, `affine-desktop/` — deployment target
- Cal.com: `auth/`, `eventType/`, `team/` — feature domain
- freeCodeCamp: flat files with descriptive names — no hierarchy needed
- **Principle:** The directory tree itself serves as a table of contents

**Pattern: Suite suffixes organize large test collections**
- Grafana: `*-suite/` directories (dashboards-suite, alerting-suite)
- Communicates that each directory is a self-contained test suite with shared fixtures

### 6. Locator Strategy Communication (Confirmed)

**Pattern: Locator priority hierarchies are documented**
- freeCodeCamp: contributor guide prescribes `getByRole` > `getByText` > `data-playwright-test-label`
- Grafana: primarily `getByTestId`, `getByLabel`, `getByRole`, `getByText`
- Cal.com: `data-testid` primary, text matchers secondary
- AFFiNE: `data-testid` primary, `getByRole` and `getByText` secondary
- **Observation:** `getByRole` is recommended in guides but `data-testid` is more commonly used in practice

### 7. Community Communication Patterns

**Pattern: Conference talks as knowledge dissemination**
- 34+ conference talks (2021-2025) from Playwright team and community
- Key speakers: Debbie O'Brien (Developer Relations), Max Schmitt (core contributor)

**Pattern: Blog posts validate and amplify official patterns**
- Third-party guides consistently echo official recommendations
- Convergence between official and community guidance indicates ecosystem maturity

**Pattern: Migration stories as social proof**
- Companies document Cypress-to-Playwright migration with quantified improvements

### 8. Error Messaging and Debugging Communication

**Pattern: Trace viewer as primary debugging communication**
- `trace: 'retain-on-failure'` (Grafana, Immich) or `'on-first-retry'` (Cal.com, AFFiNE, freeCodeCamp, Grafana plugin-e2e)
- Traces communicate: DOM state, network activity, console output, action timeline

**Pattern: CI annotations for inline failure communication**
- AFFiNE: `github` reporter in CI adds failure annotations directly to PR diffs
- Unique among analyzed suites — most rely on HTML/blob reports

---

## Maturity Spectrum for Rhetoric

| Level | Communication Style | Example |
|-------|-------------------|---------|
| **1. Implicit** | Self-documenting code, no external docs | Immich, Excalidraw |
| **2. Guided** | Contributor guide with testing section | freeCodeCamp |
| **3. Structured** | Tags, directory semantics, env var naming | Grafana, Cal.com, AFFiNE |
| **4. Published** | API docs, npm package, cross-project standards | Grafana plugin-e2e |

---

## Confirmed Themes

1. **Show, don't tell** — Gold suites communicate through well-named tests, self-documenting config, and trace artifacts rather than extensive prose
2. **Documentation targets contributors** — Testing docs are written for people adding tests, not for people reading them
3. **Ecosystem communication has matured** — Official docs, conference talks, blog posts, and OSS examples form a coherent knowledge base
4. **NEW: File naming conventions have not converged** — `.spec.ts`, `.e2e.ts`, and `.e2e-spec.ts` all coexist without a dominant standard
5. **NEW: kebab-case is the universal file naming convention** — all Playwright suites use kebab-case, distinguishing from Vitest's camelCase
6. **NEW: Tags add a communication layer** — `@dashboards` tags make test organization visible and filterable
7. **NEW: There is a gap between locator guidance and practice** — `getByRole` is recommended but `data-testid` dominates in Gold suites

---

## Resolved Questions (from Landscape Phase)

1. **How detailed should test descriptions be?** — Verb + object is sufficient (e.g., `'can reschedule a booking'`). Full user stories are not used.
2. **What is the optimal balance between self-documenting code and documentation?** — Code comments for non-obvious choices (Cal.com timeout rationale), external guides for contributor onboarding (freeCodeCamp).
3. **How should error messages in custom matchers be worded?** — Domain-specific (e.g., `toHaveNoDataError()` rather than generic assertions). Only Grafana plugin-e2e implements this.
4. **What documentation do Gold suites provide for CI workflow maintenance?** — Minimal explicit documentation; CI config itself serves as documentation.

## Open Questions (for Later Phases)

1. Should tags be standardized (e.g., `@smoke`, `@regression`, `@feature-name`)?
2. How should custom matchers document their expected behavior?
3. What level of inline comments is optimal for long-term maintenance?
