# Round 07 — Landscape: Suites Analyzed

**Focus:** Apply quality criteria to rank all suites from rounds 1-6 into Gold, Silver, and Bronze tiers
**Date:** 2026-03-18
**Method:** Evaluated each suite/resource discovered in rounds 1-6 against seven quality criteria: test count/coverage breadth, active maintenance, TypeScript usage, POM/fixture patterns, CI/CD integration, documentation quality, and community adoption.

---

## Quality Criteria Definitions

| Criterion | Weight | Description |
|---|---|---|
| **Test Count & Coverage** | High | Number of E2E tests and breadth of features covered |
| **Active Maintenance** | High | Commits in last 6 months; actively maintained as of March 2026 |
| **TypeScript Usage** | Medium | TypeScript with proper typing; strict mode preferred |
| **POM/Fixture Patterns** | High | Uses Page Object Model, `test.extend<T>()`, custom fixtures |
| **CI/CD Integration** | High | GitHub Actions, sharding, reporters, Docker integration |
| **Documentation Quality** | Medium | Contributing guides, inline docs, README coverage of testing |
| **Community Adoption** | Medium | Stars, forks, mentions in blogs/talks, downstream users |

---

## Tier Assignments

### Gold Tier (Deep Dive Candidates) — 10 Suites

These are best-in-class Playwright test suites that demonstrate production-grade patterns worth studying in depth.

#### 1. grafana/grafana

| Criterion | Score | Evidence |
|---|---|---|
| Test Count & Coverage | Excellent | 30+ named test projects; covers admin, viewer roles, database plugins (MySQL, PostgreSQL, Elasticsearch), dashboards |
| Active Maintenance | Excellent | Daily commits, March 2026 |
| TypeScript Usage | Excellent | Strict TypeScript; typed fixtures with `test.extend<T>()` |
| POM/Fixture Patterns | Excellent | Setup projects with `withAuth()`, storageState at `playwright/.auth/<username>.json`; role-based auth fixtures |
| CI/CD Integration | Excellent | `retries: 1` in CI, `workers: 4`, `fullyParallel: true`, `trace: 'retain-on-failure'`, HTML + custom a11y reporter |
| Documentation Quality | Excellent | Dedicated plugin-e2e docs at grafana.com/developers |
| Community Adoption | Excellent | ~72,700 stars; @grafana/plugin-e2e used across plugin ecosystem |
| **Tier** | **GOLD** | Best example of extending Playwright with domain-specific fixtures, custom matchers, and multi-role auth |

#### 2. calcom/cal.com

| Criterion | Score | Evidence |
|---|---|---|
| Test Count & Coverage | Excellent | 7 Playwright projects covering web, app-store, embed-core, embed-react, Firefox, WebKit, mobile |
| Active Maintenance | Excellent | Daily commits, March 2026 |
| TypeScript Usage | Excellent | TypeScript throughout; Next.js + Turborepo |
| POM/Fixture Patterns | Good | Custom `goto` function; fixtures for workflows and schedules; factory-style seed data via Prisma |
| CI/CD Integration | Excellent | `retries: 2` CI / 0 local; env-aware timeouts (10s CI / 120s local); blob + HTML + JUnit reporters; `maxFailures: 10` |
| Documentation Quality | Good | `.env.e2e.example`; contributing docs reference test setup |
| Community Adoption | Excellent | ~38,700 stars; frequently cited in monorepo testing discussions |
| **Tier** | **GOLD** | Best example of environment-aware config, multi-project monorepo testing, and CI-optimized timeouts |

#### 3. toeverything/AFFiNE

| Criterion | Score | Evidence |
|---|---|---|
| Test Count & Coverage | Excellent | Multi-platform: web, desktop (Electron), mobile viewports; 5-shard CI |
| Active Maintenance | Excellent | Daily commits, March 2026 |
| TypeScript Usage | Excellent | TypeScript throughout |
| POM/Fixture Patterns | Good | Separate config per test target (affine-local, affine-cloud) |
| CI/CD Integration | Excellent | `retries: 3` CI / 1 local; `workers: '50%'` CI / 4 local; `timeout: 50s` CI / 30s local; `trace: 'retain-on-failure'`; `video: 'retain-on-failure'`; github reporter in CI |
| Documentation Quality | Good | BUILDING.md with test setup instructions |
| Community Adoption | Excellent | ~66,100 stars; multi-platform E2E is a rare and valuable pattern |
| **Tier** | **GOLD** | Best example of multi-platform E2E (web + desktop + mobile) with aggressive CI retry and video capture |

#### 4. immich-app/immich

| Criterion | Score | Evidence |
|---|---|---|
| Test Count & Coverage | Good | 3 projects: web (UI), ui (parallel), maintenance; covers auth, media, scanning |
| Active Maintenance | Excellent | Daily commits, March 2026 |
| TypeScript Usage | Excellent | TypeScript; Svelte + NestJS |
| POM/Fixture Patterns | Good | Project-based test isolation with different worker counts per project |
| CI/CD Integration | Excellent | `retries: 4` CI; `workers: 4` CI; `fullyParallel: false` by default (serial web, parallel UI); Docker Compose webServer; `trace: 'on-first-retry'`; `screenshot: 'only-on-failure'` |
| Documentation Quality | Good | Developer docs at docs.immich.app/developer/testing/ |
| Community Adoption | Excellent | ~90,000 stars; fastest-growing self-hosted photo project |
| **Tier** | **GOLD** | Best example of Docker Compose-based E2E with per-project parallelism control and high retry count |

#### 5. microsoft/playwright (self-tests)

| Criterion | Score | Evidence |
|---|---|---|
| Test Count & Coverage | Excellent | Thousands of tests covering every API surface |
| Active Maintenance | Excellent | Daily commits by core team, March 2026 |
| TypeScript Usage | Excellent | Strict TypeScript; defines the `test.extend<T>()` pattern |
| POM/Fixture Patterns | Excellent | Canonical source for fixture patterns, custom matchers |
| CI/CD Integration | Excellent | Multi-browser CI across all engines |
| Documentation Quality | Excellent | The most documented testing framework in the ecosystem |
| Community Adoption | Excellent | ~84,500 stars; the canonical reference |
| **Tier** | **GOLD** | Canonical reference for all Playwright patterns; defines the patterns others follow |

#### 6. freeCodeCamp/freeCodeCamp

| Criterion | Score | Evidence |
|---|---|---|
| Test Count & Coverage | Good | E2E covering curriculum, user flows, modals; cross-browser matrix |
| Active Maintenance | Excellent | Daily commits, March 2026 |
| TypeScript Usage | Good | TypeScript with Playwright |
| POM/Fixture Patterns | Moderate | Contributor guidelines prescribe `getByRole`, `getByText`, `data-playwright-test-label` priority; DRY patterns |
| CI/CD Integration | Good | GitHub Actions workflow with browser matrix; `seed:certified-user` for data setup |
| Documentation Quality | Excellent | Dedicated contributor guide at contribute.freecodecamp.org with Playwright-specific instructions |
| Community Adoption | Excellent | ~435,000 stars; largest OSS learning platform |
| **Tier** | **GOLD** | Best example of community-scale contributor guidelines for Playwright; locator priority documentation |

#### 7. supabase/supabase

| Criterion | Score | Evidence |
|---|---|---|
| Test Count & Coverage | Good | Dashboard E2E; auth flows; community E2E suite |
| Active Maintenance | Excellent | Daily commits, March 2026 |
| TypeScript Usage | Excellent | TypeScript + Next.js |
| POM/Fixture Patterns | Good | Setup projects for auth; storageState for session reuse; REST API login alternative |
| CI/CD Integration | Good | globalSetup pattern; InBucket for email testing in CI |
| Documentation Quality | Good | Growing community testing resources |
| Community Adoption | Excellent | ~99,000 stars; auth patterns widely referenced |
| **Tier** | **GOLD** | Best example of auth session handling with storageState; REST API authentication bypass for speed |

#### 8. excalidraw/excalidraw

| Criterion | Score | Evidence |
|---|---|---|
| Test Count & Coverage | Moderate | Accessibility testing with axe-core; visual regression POC |
| Active Maintenance | Excellent | Daily commits, March 2026 |
| TypeScript Usage | Excellent | TypeScript + React |
| POM/Fixture Patterns | Moderate | axe-core integration; Playwright CT exploration |
| CI/CD Integration | Good | axe-core runs in GitHub Actions on every PR |
| Documentation Quality | Good | React component testing approach documented |
| Community Adoption | Excellent | ~118,900 stars |
| **Tier** | **GOLD** | Best example of accessibility testing integration with axe-core in Playwright |

#### 9. grafana/plugin-tools (@grafana/plugin-e2e)

| Criterion | Score | Evidence |
|---|---|---|
| Test Count & Coverage | Good | Covers Grafana plugin testing: datasources, panels, dashboards |
| Active Maintenance | Excellent | Active, March 2026 |
| TypeScript Usage | Excellent | Strict TypeScript; typed custom fixtures; typed expect matchers |
| POM/Fixture Patterns | Excellent | Domain-specific fixtures (`expect(panel).toHaveNoDataError()`); RBAC auth with user roles |
| CI/CD Integration | Good | Published npm package; setup project pattern with storageState |
| Documentation Quality | Excellent | Full docs at grafana.com/developers/plugin-tools |
| Community Adoption | Good | ~400 stars but high impact across Grafana plugin ecosystem |
| **Tier** | **GOLD** | Best example of domain-specific Playwright extensions published as an npm package |

#### 10. vercel/next.js

| Criterion | Score | Evidence |
|---|---|---|
| Test Count & Coverage | Excellent | Tests the Next.js framework across dev, production, and deployed modes |
| Active Maintenance | Excellent | Daily commits, March 2026 |
| TypeScript Usage | Excellent | TypeScript |
| POM/Fixture Patterns | Good | `webServer` pattern; `with-playwright` template for community |
| CI/CD Integration | Excellent | Tests against multiple deployment modes; Vercel preview deployment testing |
| Documentation Quality | Excellent | Official template and docs |
| Community Adoption | Excellent | ~132,000 stars; the reference for Next.js + Playwright |
| **Tier** | **GOLD** | Canonical reference for Next.js + Playwright integration; webServer pattern |

---

### Silver Tier (Pattern Extraction) — 12 Suites/Resources

Good suites with useful patterns but not exemplary across all criteria.

| # | Suite | Stars | Key Pattern | Reason for Silver (not Gold) |
|---|---|---|---|---|
| 1 | ianstormtaylor/slate | ~30,800 | Cross-browser rich text interaction testing | Narrowly focused on contenteditable; limited CI visibility |
| 2 | playwright-community/eslint-plugin-playwright | ~371 | ESLint rules for Playwright best practices | Tooling, not a test suite; but essential for quality enforcement |
| 3 | Tallyb/cucumber-playwright | ~500 | BDD + Playwright integration; typed step definitions | Niche BDD pattern; last active 2025 |
| 4 | vasu31dev/playwright-ts | ~350 | Production framework template; utility abstraction layer | Good boilerplate but lower community adoption |
| 5 | clerk/playwright-e2e-template | ~150 | Auth testing POM; factory pattern with Faker.js | Useful auth pattern but last active 2024; narrow scope |
| 6 | toeverything/blocksuite | ~5,700 | Editor user journey testing | Related to AFFiNE; good but subordinate to parent project |
| 7 | checkly/playwright-check-suite-examples | ~50 | Monitoring-as-code; Playwright as synthetic monitors | Valuable pattern but small scope |
| 8 | kentcdodds/kentcdodds.com | ~2,600 | Testing Library creator's Playwright usage; Remix patterns | Small test suite; personal site |
| 9 | nenad992/boilerplate-playwright-ts | ~30 | Enterprise boilerplate; advanced fixtures; Docker + CI | Good patterns but minimal adoption |
| 10 | mxschmitt/vercel-playwright-end-to-end-tests | ~200 | Vercel preview deployment testing with dynamic baseURL | Valuable CI pattern but narrow scope; last active 2024 |
| 11 | testdouble/nextjs-e2e-test-example | ~100 | Auth0 + Next.js OAuth flow testing | Useful auth pattern but last active 2024 |
| 12 | clerk/clerk-playwright-nextjs | ~80 | Clerk + Next.js auth with storageState | Narrow auth focus; last active 2024 |

---

### Bronze Tier (Reference Only) — 12 Suites/Resources

Basic or incomplete implementations, or resources rather than test suites.

| # | Suite/Resource | Stars | Type | Reason for Bronze |
|---|---|---|---|---|
| 1 | mxschmitt/awesome-playwright | ~4,000 | Curated list | Directory, not a test suite |
| 2 | microsoft/playwright-examples | ~200 | Demo repo | Last active 2023; reference only |
| 3 | DyHex/POMWright | ~50 | POM framework | Niche tool; limited adoption |
| 4 | Markkos89/turbo-monorepo-template | ~200 | Template | Template, not production suite; last active 2024 |
| 5 | supabase-community/e2e | ~30 | Community tests | Minimal scope; subordinate to main project |
| 6 | sudharsan-selvaraj/playshot | ~50 | Screenshot library | Narrow utility |
| 7 | akhileshskl/Playwright_AccessibilityTests | ~20 | A11y kit | Small project; limited TypeScript patterns |
| 8 | Widen/expect-axe-playwright | ~100 | Custom matchers | Useful library but narrow scope |
| 9 | Playwright official docs (8 entries) | N/A | Documentation | Reference material, not test suites |
| 10 | Blog posts and guides (15+ entries) | N/A | Industry content | Informational; pattern validation only |
| 11 | cy2pw.com | N/A | Migration tool | Tooling, not patterns |
| 12 | Chromatic/playwright | N/A | Commercial tool | Commercial integration; reference only |

---

## Summary Statistics

- **Total suites/resources evaluated:** 55 (from rounds 1-6)
- **Gold tier:** 10 suites (deep dive candidates)
- **Silver tier:** 12 suites (pattern extraction)
- **Bronze tier:** 12 suites/resources + ~21 documentation/blog entries (reference only)
- **TypeScript-first in Gold tier:** 10/10 (100%)
- **Active maintenance (2026) in Gold tier:** 10/10 (100%)
- **Custom fixtures or POM in Gold tier:** 8/10 (80%)
- **CI/CD integration confirmed in Gold tier:** 10/10 (100%)
