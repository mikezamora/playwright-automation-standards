# Rhetoric Patterns

## Overview

This document consolidates rhetoric patterns — how Playwright suites communicate their purpose, usage, and conventions — observed during the landscape phase (rounds 1-11). Rhetoric patterns include README structures, test descriptions, documentation style, and contributor guidance.

**Status:** Initial synthesis — to be refined in later phases

---

## Observed Patterns

### 1. README Documentation Patterns

**Pattern: Dedicated testing section in project README or contributing guide**
- Frequency: 8/10 Gold suites have dedicated testing documentation
- Depth varies: from a "Running tests" section to full contributor guides
- Evidence: [freecodecamp-e2e] (dedicated contributor guide at contribute.freecodecamp.org), [grafana-plugin-e2e] (full docs at grafana.com/developers)

**Pattern: Contributor guide prescribes testing conventions**
- Gold suites accepting community contributions document:
  - How to set up the test environment
  - Locator priority hierarchy
  - How to add new tests
  - How to handle flaky tests
- Evidence: [freecodecamp-e2e] (locator priority: `getByRole` > `getByText` > `data-playwright-test-label`), [calcom-e2e] (`.env.e2e.example`)

**Pattern: Environment setup files as implicit documentation**
- `.env.e2e.example` files serve as both config templates and documentation
- Document required environment variables with sensible defaults
- Evidence: [calcom-e2e] (`.env.e2e.example`), [immich-e2e] (devcontainer config)

### 2. Test Description Style

**Pattern: User-centric test descriptions**
- Tests describe what the user does and sees, not implementation details
- Example: "should create a new booking" not "should call createBooking API and update Redux state"
- Evidence: [playwright-best-practices] (test user-visible behavior), [calcom-e2e], [freecodecamp-e2e]

**Pattern: Minimal comments in test code**
- Gold suites rely on descriptive test names and locator strategies rather than inline comments
- Comments appear primarily for: workaround explanations, TODO references, skip/fixme justifications
- Evidence: [calcom-e2e] (`test.skip()` with TODO comments), [grafana-e2e] (`test.fixme()` with issue references)

### 3. Configuration Documentation

**Pattern: Self-documenting configuration through naming**
- Project names, testDir paths, and environment variable names communicate purpose
- Example: `NEXT_PUBLIC_IS_E2E=1` is self-documenting about its scope and purpose
- Evidence: [calcom-e2e], [immich-e2e] (`PLAYWRIGHT_BASE_URL`, `PLAYWRIGHT_DISABLE_WEBSERVER`)

**Pattern: Layered env var documentation**
- Defaults in config → overrides via env vars → CI secrets for credentials
- The configuration itself documents the hierarchy
- Evidence: [grafana-e2e] (`process.env.GRAFANA_URL ?? DEFAULT_URL`), [immich-e2e] (default baseURL)

### 4. Community Communication Patterns

**Pattern: Conference talks as knowledge dissemination**
- 34+ conference talks (2021-2025) from Playwright team and community
- Key speakers: Debbie O'Brien (Developer Relations), Max Schmitt (core contributor)
- Evidence: [playwright-conference-videos], [playwright-users-event]

**Pattern: Blog posts validate and amplify official patterns**
- Third-party guides (BrowserStack, TestDino, Currents.dev) consistently echo official recommendations
- Convergence between official and community guidance indicates ecosystem maturity
- Evidence: [browserstack-best-practices], [currents-best-practices], [testdino-checklist]

**Pattern: Migration stories as social proof**
- Companies document their Cypress-to-Playwright migration with quantified improvements
- Format: problem → migration approach → measured results
- Evidence: [bigbinary-migration] (88.68% faster), [thisdot-migration] (migrated in hours)

### 5. Error Messaging and Debugging Communication

**Pattern: Trace viewer as the primary debugging communication tool**
- Rather than verbose logging, Gold suites rely on Playwright's trace viewer for post-failure analysis
- Traces communicate: DOM state, network activity, console output, and action timeline
- Evidence: All Gold suites configure traces; [momentic-trace-guide]

**Pattern: CI annotations for inline failure communication**
- GitHub reporter adds failure annotations directly to PR diffs
- Evidence: [affine-e2e] (switches to `github` reporter in CI)

---

## Emerging Themes

1. **Show, don't tell** — Gold suites communicate through well-named tests, self-documenting config, and trace artifacts rather than extensive prose
2. **Documentation targets contributors** — Testing docs are written for people adding tests, not for people reading them
3. **Ecosystem communication has matured** — Official docs, conference talks, blog posts, and OSS examples form a coherent knowledge base
4. **Migration stories drive adoption** — Quantified before/after comparisons are the most effective adoption rhetoric

---

## Open Questions

1. How detailed should test descriptions be? (verb + object vs. full user story)
2. What is the optimal balance between self-documenting code and explicit documentation?
3. How should error messages in custom matchers be worded?
4. What documentation do Gold suites provide for CI workflow maintenance?
