# Round 07 — Landscape: Key Findings

**Focus:** What distinguishes Gold from Silver from Bronze quality tiers
**Date:** 2026-03-18

---

## Key Findings

### Finding 1: The Gold-tier differentiator is environment-aware configuration

Gold-standard suites universally implement environment-aware Playwright configuration that adjusts behavior between local development and CI. Cal.com exemplifies this with timeouts that are 12x longer locally (120s) than in CI (10s), and retries that are only enabled in CI (`retries: 2` CI / `0` local). AFFiNE uses `workers: '50%'` in CI but 4 locally. Immich has `retries: 4` in CI but 0 locally. This dual-mode approach ensures fast local feedback while tolerating CI environment variability. Silver and Bronze suites typically use a single static configuration.

**Evidence:** Grafana (`retries: process.env.CI ? 1 : 0`), Cal.com (`retries: 2` CI), AFFiNE (`retries: 3` CI), Immich (`retries: 4` CI)

### Finding 2: Gold suites define multiple Playwright projects with different execution profiles

All Gold-tier suites use Playwright's `projects` feature to define distinct test execution profiles. Grafana has 30+ projects covering different auth roles and database plugins. Cal.com has 7 projects across web apps, embeds, and browsers. Immich has 3 projects with different parallelism settings (serial for web, parallel for UI). Silver suites typically have 1-2 projects or none at all.

**Evidence:** Grafana (30+ projects), Cal.com (7 projects), Immich (3 projects with per-project `fullyParallel` settings)

### Finding 3: CI reporter strategy is a Gold-tier hallmark

Gold suites use multi-reporter configurations tailored to their CI pipeline. Cal.com uses blob (CI) or list (local) + HTML + JUnit XML simultaneously. Grafana uses HTML + a custom axe-a11y reporter. AFFiNE switches to the `github` reporter in CI for inline annotations. Silver suites typically use a single default reporter.

**Evidence:** Cal.com (3 reporters: blob/list + HTML + JUnit), Grafana (HTML + a11y), AFFiNE (`github` reporter in CI)

### Finding 4: Gold suites have explicit failure containment strategies

Gold suites implement `maxFailures` to abort runs early when too many tests fail. Cal.com sets `maxFailures: 10` in headless mode. Immich uses `fullyParallel: false` for sequential web tests but enables it for UI tests. This prevents wasting CI minutes on cascading failures. Silver suites typically let all tests run regardless of failure count.

**Evidence:** Cal.com (`maxFailures: 10`), Immich (per-project parallelism control)

### Finding 5: Active maintenance and daily commits separate Gold from Silver

Every Gold-tier suite has daily commits as of March 2026. Silver suites often have their last significant update in 2024 or early 2025. The Clerk templates (both Silver) were last active in 2024. The testdouble Next.js example was last active in 2024. Active maintenance correlates strongly with modern Playwright patterns, as the framework evolves rapidly (monthly releases).

**Evidence:** All 10 Gold suites have daily/weekly commits in March 2026; 5/12 Silver suites last active in 2024

### Finding 6: Community adoption amplifies pattern quality through feedback loops

The Gold tier averages ~124,000 stars per project (median ~83,600). High star counts correlate with more contributors reporting issues, submitting fixes for flaky tests, and refining patterns through real-world usage. Grafana's flaky test PR (#23487 in Cal.com shows similar patterns) demonstrates this: community members identify flakiness causes and contribute scoped-locator fixes. Bronze-tier suites average under 100 stars and lack this feedback loop.

**Evidence:** Gold average: ~124,000 stars; Silver average: ~3,600 stars; Bronze average: ~90 stars

### Finding 7: Domain-specific extensions are the pinnacle of Playwright mastery

Two Gold suites (Grafana plugin-tools, Playwright core) publish reusable Playwright extensions. Grafana's `@grafana/plugin-e2e` provides custom fixtures (`expect(panel).toHaveNoDataError()`) and RBAC auth setup as an npm package. This represents the highest maturity level: not just using Playwright well, but extending it for an ecosystem. No Silver or Bronze suite achieves this level.

**Evidence:** `@grafana/plugin-e2e` (npm package), `eslint-plugin-playwright` (Silver, but also published)

### Finding 8: Documentation quality for contributors is a Gold predictor

Gold suites that accept community contributions have explicit Playwright testing documentation. freeCodeCamp has a dedicated contributor guide prescribing locator priority (`getByRole` > `getByText` > `data-playwright-test-label`). Grafana has full plugin-e2e developer docs. Cal.com has `.env.e2e.example` files. Silver suites may have good code but lack contributor-facing testing documentation.

**Evidence:** freeCodeCamp (contribute.freecodecamp.org/how-to-add-playwright-tests/), Grafana (grafana.com/developers/plugin-tools), Cal.com (`.env.e2e.example`)

---

## Tier Summary Matrix

| Dimension | Gold (10 suites) | Silver (12 suites) | Bronze (12+ resources) |
|---|---|---|---|
| Environment-aware config | Universal | Occasional | Rare |
| Multiple projects | 3-30+ per suite | 1-2 | 0-1 |
| Multi-reporter | 2-3 reporters | 1 reporter | Default |
| Failure containment | maxFailures, per-project parallel | None | None |
| Active maintenance | Daily commits 2026 | Mixed 2024-2026 | Often stale |
| Community adoption | >30,000 stars avg | <5,000 stars avg | <200 stars avg |
| Domain extensions | 2 publish npm packages | 1 (ESLint plugin) | None |
| Contributor docs | Dedicated testing guides | README only | Minimal |
