# Round 01 — Landscape: Findings

**Focus:** What types of projects use Playwright in production, initial quality observations
**Date:** 2026-03-18

---

## Key Findings

### 1. Playwright dominates the TypeScript-first testing landscape

Every production suite discovered in this round uses TypeScript as its primary language. This is not coincidental -- Playwright was built with TypeScript, and the `@playwright/test` runner provides first-class type safety for fixtures, configurations, and assertions. Projects that previously used Cypress (freeCodeCamp, Grafana) are actively migrating to Playwright, citing better cross-browser support and TypeScript integration.

**Evidence:** 12/12 suites analyzed use TypeScript. Grafana deprecated `@grafana/e2e` (Cypress-based) in Grafana 11.0.0, recommending Playwright migration. freeCodeCamp opened issue #51705 to migrate Cypress to Playwright.

### 2. High-star projects span diverse industries and domains

The production Playwright suites discovered cover a wide range of domains:
- **Developer tools/platforms:** Grafana (observability), Supabase (database platform), Next.js (framework)
- **Productivity/knowledge management:** AFFiNE (knowledge base), Excalidraw (whiteboarding), Slate (rich text editing)
- **Scheduling/SaaS:** Cal.com (scheduling infrastructure)
- **Education:** freeCodeCamp (learning platform)
- **Media management:** Immich (photo/video management)

**Evidence:** 8 distinct production applications across 6+ industry verticals, all with >30k GitHub stars.

### 3. Monorepo architectures are the norm for large Playwright suites

The majority of large production suites use monorepo tooling (Turborepo, Nx, or custom workspace configurations). This creates unique challenges and patterns for Playwright configuration, including consolidated config files, per-package test directories, and workspace-aware CI pipelines.

**Evidence:** Cal.com uses Turborepo with a unified playwright.config.ts managing multiple projects (@calcom/web, app-store, embed-core, embed-react). AFFiNE uses a monorepo with BlockSuite integration. Next.js uses a multi-package workspace structure. Supabase uses a monorepo with multiple apps.

### 4. CI sharding and parallelization are standard practice in mature suites

Well-maintained suites universally implement test sharding for CI execution. This includes splitting tests across multiple CI machines, using Playwright's built-in `--shard` flag, and configuring different timeout values for CI vs. local development.

**Evidence:** AFFiNE runs mobile E2E tests across 5 shards. Cal.com sets different timeouts for CI (30s) vs. local (120s). Grafana uses GitHub Actions with parallelization. freeCodeCamp uses dedicated e2e-playwright.yml workflow.

### 5. Migration from Cypress to Playwright is a major industry trend

Multiple high-profile projects have completed or are actively completing migrations from Cypress to Playwright. The primary drivers are cross-browser testing (Cypress historically only supported Chromium), better TypeScript support, and Playwright's auto-wait mechanisms.

**Evidence:** Grafana completed migration and deprecated Cypress in v11.0.0. freeCodeCamp is actively migrating (issue #51705). The Playwright ecosystem has grown to 84.5k stars vs. Cypress at ~48k stars, indicating a momentum shift.

### 6. The awesome-playwright ecosystem tracks notable production users

The official awesome-playwright list (maintained by Playwright core contributor Max Schmitt) documents production users including VS Code, TypeScript compiler, Elastic APM JS Agent, and xterm.js. This curated list serves as the canonical directory for the ecosystem and validates that Playwright is used by Microsoft's own flagship products.

**Evidence:** awesome-playwright lists 50+ integrations, tools, reporters, and language bindings. Production users include VS Code (cross-browser web testing), TypeScript (browser compatibility validation), and Elastic APM.

### 7. Well-maintained suites share common quality indicators

Across the 12 suites analyzed, well-maintained suites consistently exhibit:
- A `playwright.config.ts` file (not .js) with explicit project definitions
- CI workflow files (GitHub Actions) dedicated to Playwright
- Custom timeout configurations for CI vs. local
- Test result artifact capture (traces, screenshots, videos)
- Contributor documentation for writing tests

Abandoned or low-quality suites lack CI integration, use default configurations, and have no contributor guidelines.

**Evidence:** Cal.com, Grafana, AFFiNE, freeCodeCamp, and Immich all have dedicated CI workflows, custom configs, and contributor docs. Lower-quality boilerplate repos typically have default configs and no CI evidence.

### 8. Accessibility testing with Playwright is an emerging pattern

Projects like Excalidraw are integrating axe-core with Playwright for automated accessibility testing in CI. This represents a growing trend of using Playwright not just for functional E2E testing but as an accessibility assurance tool.

**Evidence:** Excalidraw PR #9088 adds automated accessibility testing with axe-core and Playwright, integrated into GitHub Actions on every PR. Grafana's plugin-e2e includes accessibility-related fixtures. The awesome-playwright list includes @axe-core/playwright and @guidepup/playwright for screen reader automation.

---

## Initial Quality Tier Observations

| Tier | Characteristics | Example Projects |
|---|---|---|
| **Tier 1 — Exemplary** | Custom fixtures, CI sharding, POM patterns, contributor docs, active flaky test management | Playwright itself, Cal.com, Grafana |
| **Tier 2 — Production Solid** | Working CI, TypeScript config, meaningful test coverage, regular updates | AFFiNE, freeCodeCamp, Immich, Supabase |
| **Tier 3 — Reference Value** | Good patterns but incomplete coverage, or niche usage | Excalidraw (a11y), Slate (editor testing), Next.js examples |
| **Tier 4 — Boilerplate** | Template repos, demo code, not battle-tested in production | Various GitHub template repos |

---

## Questions for Next Rounds

1. Which suites use custom Playwright fixtures (test.extend) most effectively?
2. How do monorepo setups share fixtures and page objects across packages?
3. What CI configurations yield the fastest feedback loops?
4. Are there production suites using Playwright for API-only testing (no browser)?
5. Which projects implement visual regression testing with Playwright?
