# Round 01 — Landscape: Suites Analyzed

**Focus:** Discover well-known Playwright test suites in production projects
**Date:** 2026-03-18
**Search queries used:**
- "playwright e2e tests" site:github.com
- "playwright test suite production" best practices
- awesome-playwright curated lists
- Playwright official examples and demo repos
- "playwright.config.ts" in popular open-source projects

---

## Suites Discovered

### 1. microsoft/playwright (Playwright's Own Test Suite)

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/microsoft/playwright |
| **Stars** | ~84,500 |
| **Last Commit** | Active daily (March 2026) |
| **Contributors** | 500+ |
| **Stack** | TypeScript, Node.js |
| **Playwright Usage** | E2E, unit, integration — tests Playwright itself |
| **Notable** | The canonical reference for Playwright testing patterns; thousands of tests written by the core team covering every browser engine and API surface |

### 2. calcom/cal.com

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/calcom/cal.com |
| **Stars** | ~38,700 |
| **Last Commit** | Active daily (March 2026) |
| **Contributors** | 700+ |
| **Stack** | TypeScript, Next.js, Turborepo monorepo |
| **Playwright Usage** | E2E (booking flows, event types, embed, app store) |
| **Notable** | Production-grade monorepo with consolidated playwright.config.ts across multiple workspace packages; demonstrates real-world flaky test management and CI-optimized timeouts |

### 3. freeCodeCamp/freeCodeCamp

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/freeCodeCamp/freeCodeCamp |
| **Stars** | ~435,000 |
| **Last Commit** | Active daily (March 2026) |
| **Contributors** | 5,000+ |
| **Stack** | TypeScript, React, Node.js |
| **Playwright Usage** | E2E (curriculum, user flows, modals) |
| **Notable** | Largest open-source learning platform; migrating from Cypress to Playwright with dedicated contributor guidelines for writing Playwright tests; massive community contribution model |

### 4. grafana/grafana

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/grafana/grafana |
| **Stars** | ~72,700 |
| **Last Commit** | Active daily (March 2026) |
| **Contributors** | 3,000+ |
| **Stack** | TypeScript, React, Go (backend) |
| **Playwright Usage** | E2E, plugin testing (@grafana/plugin-e2e) |
| **Notable** | Migrated from Cypress to Playwright; built a dedicated @grafana/plugin-e2e package that extends Playwright with custom fixtures, models, and expect matchers for the Grafana ecosystem |

### 5. toeverything/AFFiNE

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/toeverything/AFFiNE |
| **Stars** | ~66,100 |
| **Last Commit** | Active daily (March 2026) |
| **Contributors** | 500+ |
| **Stack** | TypeScript, React, BlockSuite |
| **Playwright Usage** | E2E (web, desktop, mobile viewport emulation) |
| **Notable** | Multi-platform E2E testing with test sharding across 5 shards; tests web, desktop Electron, and mobile viewports; monorepo with BlockSuite integration tests |

### 6. immich-app/immich

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/immich-app/immich |
| **Stars** | ~90,000 |
| **Last Commit** | Active daily (March 2026) |
| **Contributors** | 1,889 |
| **Stack** | TypeScript, Svelte (web), NestJS (API) |
| **Playwright Usage** | E2E (web interface testing with Docker) |
| **Notable** | Self-hosted photo management; Playwright e2e directory with Docker log capture; demonstrates testing a complex multi-service application with containerized infrastructure |

### 7. excalidraw/excalidraw

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/excalidraw/excalidraw |
| **Stars** | ~118,900 |
| **Last Commit** | Active daily (March 2026) |
| **Contributors** | 335 |
| **Stack** | TypeScript, React |
| **Playwright Usage** | Accessibility testing (axe-core), visual regression POC |
| **Notable** | Uses Playwright for automated accessibility testing with axe-core integrated into GitHub Actions; exploring visual regression testing with Playwright component testing library |

### 8. ianstormtaylor/slate

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/ianstormtaylor/slate |
| **Stars** | ~30,800 |
| **Last Commit** | Active (March 2026) |
| **Contributors** | 600+ |
| **Stack** | TypeScript, React |
| **Playwright Usage** | E2E (rich text editor interaction testing) |
| **Notable** | Rich text editor framework using Playwright for cross-browser interaction tests; addresses the challenge of testing contenteditable behavior across browsers |

### 9. supabase/supabase

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/supabase/supabase |
| **Stars** | ~99,000 |
| **Last Commit** | Active daily (March 2026) |
| **Contributors** | 11,800+ |
| **Stack** | TypeScript, Next.js, PostgreSQL |
| **Playwright Usage** | E2E (dashboard, auth flows) |
| **Notable** | Postgres development platform with community E2E tests; demonstrates auth session handling in Playwright through setup projects and storage state patterns |

### 10. mxschmitt/awesome-playwright

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/mxschmitt/awesome-playwright |
| **Stars** | ~4,000 |
| **Last Commit** | Active (2026) |
| **Contributors** | 80+ |
| **Stack** | Markdown (curated list) |
| **Playwright Usage** | Ecosystem directory |
| **Notable** | Maintained by Playwright core contributor; canonical index of Playwright tools, integrations, reporters, and production users (VS Code, TypeScript, Elastic APM) |

### 11. microsoft/playwright-examples

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/microsoft/playwright-examples |
| **Stars** | ~200 |
| **Last Commit** | 2023 |
| **Contributors** | 10+ |
| **Stack** | TypeScript, JavaScript |
| **Playwright Usage** | Demo/reference patterns |
| **Notable** | Official Microsoft examples repo showing various testing scenarios; good reference but less actively maintained than the main repo's tests |

### 12. vercel/next.js (E2E testing infrastructure)

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/vercel/next.js |
| **Stars** | ~132,000 |
| **Last Commit** | Active daily (March 2026) |
| **Contributors** | 3,000+ |
| **Stack** | TypeScript, React, Next.js |
| **Playwright Usage** | E2E (framework testing against dev, start, and Vercel deployments) |
| **Notable** | Tests the Next.js framework itself against multiple modes (dev, production, deployed); includes with-playwright example template for community use |

---

## Summary Statistics

- **Total suites analyzed:** 12
- **Production applications:** 8 (Cal.com, freeCodeCamp, Grafana, AFFiNE, Immich, Excalidraw, Slate, Supabase)
- **Framework/tool projects:** 3 (Playwright itself, Next.js, playwright-examples)
- **Ecosystem resources:** 1 (awesome-playwright)
- **TypeScript-first projects:** 12/12 (100%)
- **Actively maintained (2026):** 11/12 (92%)
