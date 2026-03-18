# Round 22 — Findings

**Phase:** Structure
**Focus:** Finalize structure standards — definitive patterns with evidence citations

---

## Finding 1: The six-area structure standards framework is comprehensive and validated

After analyzing 22+ suites across Gold/Silver/Bronze tiers, the structure standards cleanly partition into six areas: (1) File Organization, (2) Configuration, (3) Page Object Model, (4) Fixtures, (5) Test Grouping, (6) Data Management. Every structural decision observed in production suites falls into one of these six categories. No seventh category emerged from the validation sweep.
- **Evidence:** All 22+ suites' structural patterns map to these 6 categories without remainder
- **Confidence:** Very high

## Finding 2: Configuration standards are the most universally consistent across suites

TypeScript-only config (22/22 production suites), `process.env.CI` ternary (12/12 deep-dived suites), and multi-project definitions (12/12) show the highest convergence. These are the safest "MUST" recommendations. Configuration is where Gold and Silver suites show the least variance.
- **Evidence:** Zero production suites deviate from TypeScript config; only Bronze templates use JS config or multi-env files
- **Confidence:** Very high — universal patterns

## Finding 3: POM standards have the most valid alternatives — one size does not fit all

Five POM variants are observed (Class-based, Fixture-based, Hybrid, Function helpers, No abstraction), and three of them (Hybrid, Fixture-based, Function helpers) are actively used by Gold production suites. The "right" POM approach depends on suite size and team maturity. Hybrid POM+Fixtures is the recommended default, but function helpers are valid for smaller suites.
- **Evidence:** Grafana (fixture-based), Cal.com (hybrid), AFFiNE (function helpers) — all Gold suites, all different POM approaches
- **Confidence:** High for recommendation, medium for prescriptiveness

## Finding 4: Feature-based test grouping is confirmed as superior to type-based grouping

Gold suites universally group by feature/domain (Grafana: `dashboards-suite/`, `alerting-suite/`; Cal.com: `auth/`, `eventType/`). Bronze templates group by test type (e2e/, ui/, api/). Feature-based grouping scales better because a single feature change touches related tests in one directory rather than scattered across type directories.
- **Evidence:** 5/5 Gold suites with 20+ tests use feature-based grouping; type-based grouping found only in community templates
- **Confidence:** Very high

## Finding 5: Fixture scoping rules have converged to a simple decision framework

Test scope for page objects and per-test state (default, no config needed). Worker scope for expensive shared resources (database connections, authenticated browser contexts). Auto fixtures for cross-cutting concerns (logging, metrics, cleanup). This three-rule framework covers all observed fixture usage patterns.
- **Evidence:** Cal.com (test-scoped factories, worker-scoped auth), Grafana (test-scoped page models, worker-scoped API clients), AFFiNE (auto fixtures for environment setup)
- **Confidence:** Very high — no exceptions observed

## Finding 6: Data management patterns split into API-first creation and fixture-based cleanup

Gold suites consistently prefer API-based data creation over UI-based setup (faster, more reliable). Cleanup uses either transactional deletion (Cal.com `prisma.$transaction()`) or fixture teardown (Grafana auto-cleanup via fixture `use()` pattern). UI-only data creation is an anti-pattern for test data.
- **Evidence:** Cal.com (API + Prisma factories), Immich (DTO factory methods + API), Grafana (API client fixtures)
- **Confidence:** High

## Finding 7: The preliminary standards required moderate revision — mostly additions, few corrections

Comparing preliminary (round 12) standards to final: zero standards were reversed, 3 were significantly expanded (POM, Fixtures, Data Management), 2 were refined with stronger evidence (Configuration, Directory Structure), and 3 new standard areas were added (Test Grouping, Fixture Scoping, Anti-patterns). The preliminary standards were directionally correct but lacked the specificity needed for actionable guidance.
- **Evidence:** Diff between preliminary and final standards documents
- **Confidence:** N/A — meta-finding

## Finding 8: Three open questions from round 20 are now resolved

(1) Timeout hierarchy: application type determines expect timeout (editor-heavy apps like Slate use higher thresholds), test timeout should be 2-4x the expect timeout. (2) Worker allocation: CPU percentage (AFFiNE `'50%'`) is most portable; fixed CI workers (Grafana `4`) are most deterministic. (3) Cross-browser testing: Chromium-only for development, full matrix in CI; Firefox runs ~34% slower requiring proportional CI allocation.
- **Evidence:** Slate (editor app: 20s test / 8s expect), Grafana (dashboard app: 30s test / 10s expect), community benchmarks (Firefox 34% slower)
- **Confidence:** High for timeout patterns, medium for performance numbers (environment-dependent)
