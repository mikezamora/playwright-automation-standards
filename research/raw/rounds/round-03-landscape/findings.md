# Round 03 — Landscape: Findings

**Focus:** How framework choice affects Playwright suite structure and conventions
**Date:** 2026-03-18

---

## Key Findings

### 1. Next.js has the strongest first-party Playwright integration of any framework

Next.js provides an official `with-playwright` template via `create-next-app`, built-in `webServer` configuration support, and an experimental test mode (`next/experimental/testmode`) for network mocking. No other framework offers this level of out-of-the-box Playwright support.

**Evidence:** The `vercel/next.js` repository includes a dedicated `examples/with-playwright` directory. Next.js documentation has a full page dedicated to Playwright setup. The `webServer` config pattern (auto-starting the dev server) originated from Next.js usage and is now the standard approach across frameworks. Cal.com's 38.7k-star production suite runs on Next.js with Playwright.

### 2. Monorepo Playwright configuration requires explicit environment variable management

Both Turborepo and Nx require special handling for Playwright's environment variables (PLAYWRIGHT_BROWSERS_PATH, CI, PWDEBUG, etc.). In Turborepo's strict mode, failing to pass through these variables causes silent test failures. This is a common pitfall that is not well-documented outside of Turborepo's official Playwright guide.

**Evidence:** Turborepo's official Playwright guide explicitly requires `passThroughEnv` configuration in `turbo.json` for Playwright variables. Cal.com (Turborepo) uses `NEXT_PUBLIC_IS_E2E=1` passed through the environment. Nx provides a Playwright plugin that handles environment variable management automatically. GitHub discussions on `vercel/turborepo` (#8987) show teams struggling with e2e suite scaling in monorepos.

### 3. Authentication testing is the most framework-dependent Playwright pattern

How you test authentication in Playwright varies dramatically by framework and auth provider. Next.js with Clerk, Next.js with Auth0, and Supabase-based apps each require fundamentally different approaches to auth state management in tests.

**Evidence:** Clerk provides a dedicated `clerk-playwright-nextjs` template for testing auth flows. TestDouble's `nextjs-e2e-test-example` shows Auth0/OIDC handling. Supabase uses Playwright setup projects with InBucket for email testing. Cal.com uses custom auth fixtures. The common thread is Playwright's `storageState` feature for persisting auth across tests, but the setup varies by provider.

### 4. Vercel preview deployment testing is a powerful Next.js-specific pattern

Testing against Vercel preview deployments (unique URLs generated per PR) represents a Next.js-specific Playwright pattern that provides real deployment testing without a dedicated staging environment. The Playwright `baseURL` is dynamically set from the Vercel deployment URL in GitHub Actions.

**Evidence:** mxschmitt/vercel-playwright-end-to-end-tests (maintained by Playwright core contributor) demonstrates this pattern with ~200 stars. Multiple guides from Cushion, DylanTS, and ThisDot Labs document the pattern. It leverages Vercel's Git integration + GitHub Actions + Playwright in a workflow that triggers after deployment completion.

### 5. Monorepo suites should create separate Playwright packages per test suite

Both Turborepo and Nx documentation recommend creating dedicated packages/projects for Playwright tests rather than embedding tests in application packages. This enables independent caching, parallel execution, and clean dependency management.

**Evidence:** Turborepo docs state: "We recommend creating a Playwright package for each test suite, which may mean suites broken up per-application, per-domain, or some other scheme." Nx uses dedicated `e2e` projects generated alongside app projects. Cal.com organizes tests per workspace package (web, app-store, embed-core, embed-react) with a consolidated config.

### 6. React projects use Playwright to complement (not replace) unit testing

In React ecosystems, Playwright E2E tests coexist with unit tests (vitest/jest + Testing Library). The division of responsibility is clear: unit tests cover component logic and rendering, while Playwright covers cross-browser behavior, accessibility, and end-to-end user journeys.

**Evidence:** Excalidraw uses vitest with jsdom for unit tests but Playwright for accessibility testing (axe-core) and visual regression. The turbo-monorepo-template includes Jest, Testing Library, AND Playwright as separate testing layers. Kent C. Dodds' site uses Playwright for E2E alongside the component testing philosophy he popularized.

### 7. Nx provides the most sophisticated monorepo Playwright integration

Nx offers intelligent test caching (only re-runs affected tests), distributed execution across machines, and generator-based scaffolding for Playwright projects. This represents the most enterprise-ready monorepo Playwright integration available.

**Evidence:** Nx documentation describes automatic detection of Playwright projects, task caching based on source code changes, and distributed task execution for CI. The Nx Playwright plugin provides `nx run app-e2e:e2e` commands with automatic dependency resolution. Nx's 2023 highlights blog featured Playwright integration as a key improvement.

### 8. API-only Playwright testing is underexplored despite strong capabilities

Playwright's `APIRequestContext` supports full HTTP testing (all methods, headers, auth, JSON body parsing) without launching a browser, yet very few projects use it for standalone API test suites. Most usage is limited to test data seeding before browser tests.

**Evidence:** Playwright's official API testing documentation shows a GitHub API testing example but notes it as a supplementary feature. No major NestJS project was found using Playwright for API-only testing. The ecosystem defaults to supertest, axios, or framework-specific testing tools for API testing. This represents an underexplored opportunity, especially for TypeScript projects that could share types between API and E2E tests.

---

## Framework Ecosystem Maturity Matrix

| Framework | Playwright Support Level | Official Template | CI Integration | Auth Patterns | Community Examples |
|---|---|---|---|---|---|
| **Next.js** | Excellent | Yes (`with-playwright`) | GitHub Actions + Vercel | Storage state, setup projects | Many (Cal.com, Clerk, TestDouble) |
| **React** | Good | No official template | Standard GitHub Actions | Varies by auth provider | Moderate (Excalidraw, various) |
| **Turborepo** | Good | Official docs | turbo.json + GH Actions | Shared across packages | Growing (Cal.com, templates) |
| **Nx** | Excellent | Yes (generator) | Nx Cloud + GH Actions | Per-project config | Good (enterprise adoption) |
| **NestJS** | Minimal | None | Manual setup | Token-based API auth | Very few Playwright examples |
| **Remix** | Good | No official template | Standard GitHub Actions | Session-based | Few (kentcdodds.com) |

---

## Cross-Round Synthesis (Rounds 1-3)

### Total Suites Discovered: 28 unique projects/resources

| Round | Focus | New Suites | Cumulative |
|---|---|---|---|
| Round 1 | General landscape | 12 | 12 |
| Round 2 | TypeScript-first | 10 | 22 |
| Round 3 | Framework ecosystems | 12 | 28* |

*Some suites (Cal.com, Supabase, Excalidraw) were analyzed from different angles across rounds.

### Top Patterns Identified Across All Rounds

1. **TypeScript is universal** — 100% of quality suites use TypeScript
2. **CI integration is mandatory** — Every production suite has GitHub Actions workflows
3. **Custom fixtures are the quality divider** — `test.extend<T>()` separates mature suites from boilerplate
4. **Monorepos dominate** — The majority of large production apps are monorepos
5. **Cypress migration is ongoing** — Multiple high-profile projects switching to Playwright
6. **Next.js is the dominant framework** — More Playwright examples than any other framework
7. **Accessibility testing is growing** — axe-core + Playwright is an emerging standard
8. **Monitoring-as-code bridges testing and ops** — Checkly pattern gaining traction

### Key Projects for Deep Dive in Later Rounds

| Priority | Project | Why |
|---|---|---|
| 1 | microsoft/playwright | Canonical reference for all patterns |
| 2 | calcom/cal.com | Best production monorepo example |
| 3 | grafana/plugin-e2e | Best custom fixture/matcher extension |
| 4 | freeCodeCamp/freeCodeCamp | Largest community-driven test suite |
| 5 | toeverything/AFFiNE | Multi-platform (web/desktop/mobile) testing |
| 6 | excalidraw/excalidraw | Accessibility + visual regression pioneer |
| 7 | clerk/playwright-e2e-template | Auth testing reference |
| 8 | eslint-plugin-playwright | Quality enforcement tooling |
