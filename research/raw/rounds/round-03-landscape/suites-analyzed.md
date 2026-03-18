# Round 03 — Landscape: Suites Analyzed

**Focus:** Playwright in specific framework ecosystems (Next.js, React, NestJS, monorepos)
**Date:** 2026-03-18
**Search queries used:**
- "nextjs playwright e2e" github
- React projects with Playwright
- NestJS projects with Playwright API testing
- Monorepo setups (Turborepo, Nx) with Playwright
- Framework-specific Playwright configurations

---

## Suites Discovered

### Next.js Ecosystem

#### 1. vercel/next.js (with-playwright example)

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/vercel/next.js/tree/canary/examples/with-playwright |
| **Stars** | ~132,000 (parent repo) |
| **Last Commit** | Active daily (March 2026) |
| **Stack** | TypeScript, Next.js, React |
| **Playwright Usage** | E2E template for Next.js apps |
| **Framework Impact** | Config uses `webServer` directive to auto-start `npm run dev`; `baseURL` defaults to localhost:3000; test directory set to `e2e/`; uses `next/experimental/testmode` for network mocking |
| **Notable** | The canonical starting point for Playwright in Next.js. Created via `create-next-app --example with-playwright`. Demonstrates the webServer config pattern that auto-starts Next.js dev server before tests. |

#### 2. calcom/cal.com (Next.js + Turborepo)

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/calcom/cal.com |
| **Stars** | ~38,700 |
| **Last Commit** | Active daily (March 2026) |
| **Stack** | TypeScript, Next.js 14+, Turborepo |
| **Playwright Usage** | E2E across multiple Next.js apps in monorepo |
| **Framework Impact** | Uses `NEXT_PUBLIC_IS_E2E=1` environment variable to toggle test-specific behavior in Next.js; SQLite DB reset per test run; Playwright projects map to workspace packages |
| **Notable** | Demonstrates the complexity of E2E testing multiple Next.js applications within a Turborepo monorepo. Custom `goto` function for safer navigation. Checkly integration for production monitoring. |

#### 3. clerk/clerk-playwright-nextjs

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/clerk/clerk-playwright-nextjs |
| **Stars** | ~80 |
| **Last Commit** | 2024 |
| **Stack** | TypeScript, Next.js, Clerk auth |
| **Playwright Usage** | E2E (authentication flows in Next.js) |
| **Framework Impact** | Shows how to test Clerk authentication middleware in Next.js; handles session tokens and auth state in Playwright storage state |
| **Notable** | Demonstrates the specific challenge of testing third-party authentication providers in a Next.js app with Playwright. Uses Playwright's storage state for authenticated test sessions. |

#### 4. testdouble/nextjs-e2e-test-example

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/testdouble/nextjs-e2e-test-example |
| **Stars** | ~100 |
| **Last Commit** | 2024 |
| **Stack** | TypeScript, Next.js, Auth0 |
| **Playwright Usage** | E2E (Next.js with Auth0 authentication) |
| **Framework Impact** | Demonstrates Auth0 integration testing with Next.js; handles OAuth redirect flows in Playwright; manages auth tokens across test sessions |
| **Notable** | Shows how to handle OAuth/OIDC authentication flows in Playwright E2E tests for Next.js applications. Addresses the common challenge of testing apps behind identity providers. |

#### 5. mxschmitt/vercel-playwright-end-to-end-tests

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/mxschmitt/vercel-playwright-end-to-end-tests |
| **Stars** | ~200 |
| **Last Commit** | 2024 |
| **Stack** | TypeScript, Next.js, Vercel |
| **Playwright Usage** | E2E against Vercel preview deployments |
| **Framework Impact** | Runs Playwright tests against Vercel preview URLs in GitHub PR workflows; dynamically sets baseURL from Vercel deployment URL |
| **Notable** | Demonstrates the powerful pattern of testing Vercel preview deployments with Playwright in GitHub Actions. The baseURL is dynamically determined from the deployment URL, enabling PR-specific testing. |

### React Ecosystem

#### 6. excalidraw/excalidraw (React + Playwright a11y)

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/excalidraw/excalidraw |
| **Stars** | ~118,900 |
| **Last Commit** | Active daily (March 2026) |
| **Stack** | TypeScript, React |
| **Playwright Usage** | Accessibility testing, visual regression POC |
| **Framework Impact** | React component testing approach; uses Playwright's component testing library for visual regression; axe-core integration runs in GitHub Actions on every PR |
| **Notable** | Shows how Playwright can complement a vitest/jsdom unit test suite in a React project by adding browser-based accessibility and visual regression testing that jsdom cannot provide. |

#### 7. supabase/supabase (React dashboard)

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/supabase/supabase |
| **Stars** | ~99,000 |
| **Last Commit** | Active daily (March 2026) |
| **Stack** | TypeScript, Next.js (dashboard), React |
| **Playwright Usage** | E2E (dashboard UI, auth flows) |
| **Framework Impact** | Uses Playwright setup projects for authentication state; tests React dashboard components through E2E flows; local Supabase CLI for test environment |
| **Notable** | Demonstrates testing a complex React dashboard backed by a PostgreSQL API. Uses Supabase CLI for local test infrastructure and InBucket for email testing in CI. |

### Monorepo Setups

#### 8. Turborepo Official Playwright Guide

| Field | Value |
|---|---|
| **GitHub URL** | https://turborepo.dev/docs/guides/tools/playwright |
| **Stars** | N/A (documentation) |
| **Last Commit** | Active (March 2026) |
| **Stack** | TypeScript, Turborepo |
| **Playwright Usage** | Monorepo integration pattern |
| **Framework Impact** | Recommends separate Playwright packages per test suite; requires `passThroughEnv` for Playwright environment variables in strict mode; test task depends on source code changes via turbo.json |
| **Notable** | The official guide for integrating Playwright in Turborepo monorepos. Key insight: Playwright requires specific environment variables (PLAYWRIGHT_BROWSERS_PATH, etc.) to be passed through Turborepo's strict environment variable mode. |

#### 9. Markkos89/turbo-monorepo-template

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/Markkos89/turbo-monorepo-template |
| **Stars** | ~200 |
| **Last Commit** | 2024 |
| **Stack** | TypeScript 5.0, Next.js 13, React 18, Turborepo |
| **Playwright Usage** | E2E within Turborepo monorepo |
| **Framework Impact** | Demonstrates Playwright alongside Jest, Storybook, and Testing Library in a Turborepo setup; uses pnpm workspaces; GitHub Actions CI matrix |
| **Notable** | Full-stack monorepo template showing how Playwright coexists with unit testing (Jest), component testing (Testing Library), and visual documentation (Storybook) in a Turborepo workspace. |

#### 10. Nx Monorepo with Playwright

| Field | Value |
|---|---|
| **GitHub URL** | https://nx.dev/recipes/playwright (documentation) |
| **Stars** | N/A (Nx documentation) |
| **Last Commit** | Active (March 2026) |
| **Stack** | TypeScript, Nx |
| **Playwright Usage** | E2E in Nx workspace |
| **Framework Impact** | Nx generator for Playwright setup; automatic caching of test runs; distributed test execution across machines; Nx-aware Playwright plugin for optimal parallelization |
| **Notable** | Nx provides first-class Playwright support with generator scaffolding, intelligent caching (only re-runs tests when affected code changes), and distributed task execution for enterprise-scale test suites. |

### API Testing

#### 11. Playwright Official API Testing Docs

| Field | Value |
|---|---|
| **GitHub URL** | https://playwright.dev/docs/api-testing |
| **Stars** | N/A (documentation) |
| **Last Commit** | Active (March 2026) |
| **Stack** | TypeScript |
| **Playwright Usage** | API-only testing without browser |
| **Framework Impact** | Uses `APIRequestContext` for HTTP requests; demonstrates GitHub API testing example; can seed data via API before browser tests |
| **Notable** | Playwright's API testing capabilities allow testing REST APIs without launching a browser. The TypeScript APIRequestContext supports all HTTP methods with typed request/response handling. This is particularly relevant for NestJS and backend testing. |

#### 12. toeverything/blocksuite

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/toeverything/blocksuite |
| **Stars** | ~5,700 |
| **Last Commit** | Active (March 2026) |
| **Stack** | TypeScript, React/Lit |
| **Playwright Usage** | E2E (editor user journey testing) |
| **Framework Impact** | Tests rich editing features at the editor level; prevents regression in editor behavior; supports multiple browsers via BROWSER env variable |
| **Notable** | Editor framework underlying AFFiNE. Tests represent "editor user journeys" (indenting lists, pasting paragraphs) rather than unit-level interactions. Demonstrates Playwright testing for collaborative editing applications. |

---

## Framework Impact Summary

### How Framework Choice Affects Suite Structure

| Framework | Config Pattern | Test Directory | Server Setup | Auth Pattern | Key Challenge |
|---|---|---|---|---|---|
| **Next.js** | `webServer: { command: 'npm run dev' }` | `e2e/` or `tests/` | Auto-start via webServer | Storage state + setup projects | Testing preview deployments, SSR vs. CSR |
| **React (plain)** | Standard baseURL | `tests/` | Manual dev server | Varies | Component testing vs. E2E boundary |
| **Turborepo** | Per-package playwright.config.ts | Per-package `e2e/` | Depends on app | Shared via workspace | passThroughEnv, cross-package deps |
| **Nx** | Generated via nx generator | `apps/*/e2e/` | Nx serve target | Per-project | Caching invalidation, distributed exec |
| **NestJS/API** | APIRequestContext only | `test/` | Programmatic server start | Token-based | No browser needed, but API types needed |

### Framework-Specific Observations

1. **Next.js suites** universally use the `webServer` config to auto-start the dev server. The `NEXT_PUBLIC_IS_E2E` pattern (from Cal.com) is a common way to toggle test-specific behavior in Next.js apps.

2. **Monorepo suites** (Turborepo, Nx) face the unique challenge of managing Playwright browser binaries across workspaces. Turborepo requires explicit `passThroughEnv` configuration, while Nx provides a dedicated plugin for intelligent test caching.

3. **React suites** tend to complement existing unit test suites (vitest, jest) rather than replace them. Playwright adds browser-based testing for scenarios that jsdom cannot cover (canvas rendering, accessibility, cross-browser behavior).

4. **API testing** with Playwright is underutilized. While `APIRequestContext` supports full HTTP testing, most projects still use separate tools (supertest, axios) for API testing. The pattern of using Playwright's API capabilities for test data seeding (before browser tests) is more common than pure API-only test suites.

---

## Summary Statistics

- **Total new suites/resources analyzed:** 12
- **Next.js ecosystem:** 5
- **React ecosystem:** 2
- **Monorepo setups:** 3
- **API testing:** 2
- **Framework with strongest Playwright integration:** Next.js (official with-playwright template, webServer pattern, Vercel deployment testing)
- **Monorepo tool with strongest Playwright support:** Nx (generator, caching, distributed execution)
