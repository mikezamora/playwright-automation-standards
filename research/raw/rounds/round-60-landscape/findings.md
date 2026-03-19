# Round 60 Findings — Discover New Large-Scale Playwright Suites

## Research Approach

Investigated 25+ candidate repositories across four categories: mega-scale suites (1000+ tests), large application suites (200-1000 tests), framework/SDK suites, and commerce/enterprise suites. For each candidate, verified Playwright usage via `playwright.config.ts` presence, counted spec/test files using the GitHub tree API, and assessed test organization and architecture.

---

## Mega-Scale Suites (1000+ tests)

### WordPress/Gutenberg — 235 spec files

**GitHub:** https://github.com/WordPress/gutenberg
**Stars:** ~11,600 | **Last active:** 2026-03-19 | **Language:** JavaScript/TypeScript

The largest Playwright E2E suite discovered in this round. Gutenberg migrated all browser-based tests from Puppeteer to Playwright, including performance tests. The suite is organized across 4 major areas:

- **Editor tests:** 183 spec files (blocks, collaboration, local, plugins, various)
- **Site editor tests:** 48 spec files
- **Admin tests:** 2 spec files
- **Widget tests:** 2 spec files

Additionally, Gutenberg publishes `@wordpress/e2e-test-utils-playwright` (67 files) — a reusable utility package that wraps Playwright with WordPress-specific helpers. This is a unique pattern: a published npm package of Playwright test utilities.

**Key architectural features:**
- 3 browser projects (Chromium, WebKit, Firefox) with grep-based browser-specific test filtering
- Global setup via `global-setup.ts`; web server started with `wp-env-test`
- Custom blob reporter for CI; GitHub Actions reporter; flaky-tests-reporter
- Storybook-Playwright integration (8 additional test files)
- Performance tests using Playwright (separate config)

**Why interesting:** Mega-scale; reusable test utility package; Puppeteer-to-Playwright migration; 3 separate Playwright configs for different test types; browser-specific grep filtering.

### Element Web (Matrix client) — 209 spec files

**GitHub:** https://github.com/element-hq/element-web
**Stars:** ~12,900 | **Last active:** 2026-03-19 | **Language:** TypeScript

The second-largest Playwright suite found. Element Web is a Matrix protocol client with comprehensive E2E coverage. Tests are in `apps/web/playwright/` and organized by feature area, with 138 functional e2e spec files plus 71 snapshot/visual regression files.

**Test areas (48 categories):** crypto (13), read-receipts (18), settings (18), login (8), left-panel (6), widgets (6), room (5), right-panel (4), integration-manager (4), links (3), knock (3), app-loading (3), timeline (3), polls (2), composer (2), invite (2), register (2), spaces (2), voip (2), devtools (2), and 28 more single-file areas.

**Key architectural features:**
- Visual regression snapshots organized separately from functional tests
- Crypto/encryption testing as major category (Matrix E2EE)
- Accessibility testing (keyboard navigation)
- Read-receipt testing (18 files) — unique domain-specific coverage depth
- Multi-platform testing (Chrome, WebKit, Firefox)

**Why interesting:** End-to-end encrypted messaging testing; massive visual regression suite; real-time protocol testing; crypto key verification flows; Matrix federation testing.

---

## Large Application Suites (200-1000 tests)

### Rocket.Chat — 159 spec files

**GitHub:** https://github.com/RocketChat/Rocket.Chat
**Stars:** ~44,955 | **Last active:** 2026-03-19 | **Language:** TypeScript

Enterprise communication platform with a comprehensive Playwright suite at `apps/meteor/tests/e2e/`. Tests are organized as flat files by feature area (not subdirectories), covering:

- Account management (login, profile, security, device management)
- Admin functionality (rooms, users, roles, custom fields)
- Messaging features (threads, mentions, quotes, read receipts)
- Advanced features (E2E encryption, federation, omnichannel, OAuth, SAML, video conferencing, voice calls)
- System operations (retention policies, exports, sidebar, notifications)

**Key architectural features:**
- Page Object pattern documented in wiki
- Role-based selector strategy (recommends `getByRole`)
- `TEST_MODE=true` environment flag for local testing
- Flat file organization (no subdirectories within e2e/)

**Why interesting:** Enterprise messaging platform; federation testing; omnichannel/customer-support testing; VoIP/video testing; SAML/OAuth enterprise auth patterns; massive star count (45k).

### n8n — 157 spec files

**GitHub:** https://github.com/n8n-io/n8n
**Stars:** ~180,000 | **Last active:** 2026-03-19 | **Language:** TypeScript

Workflow automation platform with an exceptionally well-architected Playwright suite at `packages/testing/playwright/`. Most sophisticated test infrastructure found in this round.

**Test categories (21 areas):** workflows (51), ai (14), regression (12), nodes (12), settings (13), chat-hub (7), projects (6), node-creator (6), auth (5), building-blocks (5), app-config (5), credentials (4), sharing (4), capabilities (2), data-tables (2), dynamic-credentials (2), api (2), source-control (2), cloud (1), mcp (1), sentry (1).

**Key architectural features:**
- **Tag-based test filtering:** `@mode:X` (postgres, queue, multi-main), `@capability:X` (email, proxy, oidc), `@licensed`, `@cloud:X`, `@chaostest`, `@db:reset`, `@auth:X`
- **Composables:** Multi-page interaction helpers (e.g., `WorkflowComposer.executeWorkflowAndWaitForNotification()`)
- **Two fixture modes:** `base.ts` (worker-scoped containers) vs `cloud-only.ts` (test-scoped containers with guaranteed isolation)
- **Docker container-based isolation:** Fresh containers with clean databases triggered automatically
- **Custom reporters**
- **Recorded HTTP request mocks** for proxy testing
- **Chaos engineering tests** (`@chaostest` tag)

**Why interesting:** Most sophisticated fixture architecture; tag-based infrastructure selection; chaos engineering; container-scoped isolation; workflow-as-data testing (51 workflow specs); 180k stars.

### Shopware — 94 spec files

**GitHub:** https://github.com/shopware/shopware
**Stars:** ~3,290 | **Last active:** 2026-03-19 | **Language:** PHP (but TypeScript tests)

E-commerce platform with Playwright acceptance tests at `tests/acceptance/`. Organized into 16 categories:

- Visual regression (24), Settings (22), Product (11), Account (10), Forms (7), Checkout (5), Categories (4), SalesChannels (2), ProductAnalytics (2), and 7 more areas (Accessibility, BulkEdit, Install, Pagespeed, Search, Setup, Update — 1 each).

Also maintains a separate `shopware/acceptance-test-suite` repo (28 stars) for the core acceptance test framework.

**Key architectural features:**
- Visual regression as largest test category (24 files)
- Pagespeed testing as a test category
- Installation and update testing
- Separate acceptance-test-suite package (reusable across plugins)

**Why interesting:** E-commerce domain; visual regression emphasis; pagespeed/performance testing; installation/update testing; reusable test suite package pattern.

### Mattermost — 89 spec files

**GitHub:** https://github.com/mattermost/mattermost
**Stars:** ~35,887 | **Last active:** 2026-03-19 | **Language:** TypeScript

Enterprise messaging platform migrating from Cypress to Playwright. The Playwright suite at `e2e-tests/playwright/` is well-structured:

- Functional tests (65), Accessibility tests (17), Visual tests (6), Client tests (1)

**Key architectural features:**
- **Accessibility-first locator strategy** — prefers a11y selectors over test IDs
- **WCAG 2.1 AA compliance** testing as a major category (17 files)
- **Percy integration** for visual testing (`.percy.yml`)
- **Shared library** pattern: `lib/src/ui` for page and component abstractions
- **Docker container** required for screenshot updates (pinned to `v1.58.0-noble`)
- **Multi-browser projects:** Chrome, Firefox, iPhone, iPad
- **CLAUDE.OPTIONAL.md** — AI agent guidance for test development

**Why interesting:** Cypress-to-Playwright migration in progress; accessibility-first testing (17 files); Percy visual testing integration; mobile device projects (iPhone, iPad); AI agent guidance file.

### Documenso — 82 spec files

**GitHub:** https://github.com/documenso/documenso
**Stars:** ~12,516 | **Last active:** 2026-03-19 | **Language:** TypeScript

Open-source document signing platform with Playwright E2E tests at `packages/app-tests/e2e/`. Organized into 21 feature areas:

- API tests (16: v1, v2, trpc), Document flow (9), Envelope editor v2 (9), Templates (6), Templates flow (6), User (5), Teams (6), Envelopes (5), Documents (4), Document auth (3), License (2), Organisations (2), and 9 more areas.

**Key architectural features:**
- **API-level + UI-level** E2E testing combined
- Versioned API testing (v1, v2, trpc)
- License/feature-flag-based test organization
- Webhook testing as a test category
- PDF viewer testing

**Why interesting:** Document workflow testing; combined API + UI E2E; versioned API testing; license/feature-flag testing; webhook testing.

### Ghost CMS — 53 Playwright test files + 10 browser spec files

**GitHub:** https://github.com/TryGhost/Ghost
**Stars:** ~52,098 | **Last active:** 2026-03-19 | **Language:** JavaScript

Major CMS platform with a dedicated `e2e/` directory containing Playwright browser tests. Organized as:

- Admin tests (39): `e2e/tests/admin/`
- Public tests (13): `e2e/tests/public/`
- Browser spec files (10): `ghost/core/test/e2e-browser/` (admin + portal)
- Comments UI tests (15): `apps/comments-ui/test/e2e/`
- Visual regression (1): `e2e/visual-regression/`

**Key architectural features:**
- **Smart isolation modes:** Per-file (default, reuses Ghost environment) vs per-test (`usePerTestIsolation()`)
- **Database snapshots:** Global setup creates base DB, starts Ghost, waits for health, snapshots
- **Dual operating modes:** Dev mode (source code mounted, hot-reload) vs Build mode (prebuilt images)
- **Data factory pattern** with dedicated `data-factory/` directory
- **Docker infrastructure:** MySQL, Redis, Mailpit (email), Tinybird
- **Environment recycling:** Config/labs flags trigger environment recycling when they change
- **Escape hatch:** `resetEnvironment()` callable in `beforeEach` hooks

**Why interesting:** Sophisticated environment isolation; database snapshot pattern; data factory; dual dev/build modes; environment recycling based on config identity; massive star count (52k).

---

## Framework/SDK Suites

### SvelteKit — 21 Playwright configs, 18 test files

**GitHub:** https://github.com/sveltejs/kit
**Stars:** ~20,364 | **Last active:** 2026-03-19 | **Language:** JavaScript/TypeScript

SvelteKit uses Playwright for integration testing across multiple test apps. Unlike application suites, SvelteKit has 21 separate `playwright.config.js` files — one per test app (basics, amp, embed, async, options, no-ssr, writes, dev-only, hash-based-routing, etc.). Additionally, adapter packages (static, vercel, netlify, cloudflare) each have their own Playwright test apps.

**Why interesting:** Multi-config pattern for framework testing; per-adapter test apps; tests framework behavior rather than application behavior; 21 isolated test contexts.

### React Router (Remix) — 1 Playwright config

**GitHub:** https://github.com/remix-run/react-router
**Stars:** ~56,317 | **Last active:** 2026-03-19 | **Language:** TypeScript

React Router (which now includes Remix) has Playwright at `integration/playwright.config.ts`. Uses Playwright for integration testing of the framework itself.

**Why interesting:** Framework integration testing; React ecosystem; but relatively small Playwright footprint.

### Nuxt — 1 Playwright config

**GitHub:** https://github.com/nuxt/nuxt
**Stars:** ~59,879 | **Last active:** 2026-03-19 | **Language:** TypeScript

Nuxt has a Playwright config at the root level. Uses Playwright for framework-level integration testing.

**Why interesting:** Vue ecosystem framework; but would need deeper investigation to determine test file count.

### SolidStart — 1 Playwright config, ~5 test files

**GitHub:** https://github.com/solidjs/solid-start
**Stars:** ~5,828 | **Last active:** 2026-03-19 | **Language:** TypeScript

SolidStart has Playwright at `apps/tests/playwright.config.ts` with approximately 5 test files. Too small for deep analysis.

---

## Commerce/Enterprise Suites

### Saleor Dashboard — 38 spec files

**GitHub:** https://github.com/saleor/saleor-dashboard
**Stars:** ~988 | **Last active:** 2026-03-19 | **Language:** TypeScript

E-commerce dashboard with Playwright tests at `playwright/tests/`. Organized as 26 flat spec files plus a `singlePermissions/` subdirectory, with a setup file for auth. Covers:

Products, orders, discounts, channels, customers, categories, collections, gift cards, vouchers, shipping methods, taxes, warehouses, staff members, permissions, translations, navigation, site settings, apps, and more.

**Key architectural features:**
- 3 Playwright projects: setup, e2e, apps-e2e
- Flat file organization by domain
- Auth setup project pattern

**Why interesting:** E-commerce dashboard testing; auth setup project; permission testing; headless commerce admin patterns.

### Shopware (covered above under Large Application Suites)

---

## Suites That Were Investigated But Don't Use Playwright (or minimal)

| Project | Stars | Finding |
|---------|-------|---------|
| VS Code (microsoft/vscode) | 182,842 | No playwright.config found; uses custom test framework |
| Directus | 34,523 | No playwright.config found |
| Strapi | 71,657 | No playwright.config found |
| Outline | 37,703 | No playwright.config found |
| Plane | 46,758 | No playwright.config found |
| Hoppscotch | 78,535 | No playwright.config found |
| Appwrite | N/A | No playwright.config found (PHP backend) |
| Budibase | N/A | No playwright.config found |
| AppFlowy | N/A | No playwright.config found (Rust/Dart) |
| NocoDB | 62,476 | Playwright tests appear to have been removed from develop branch |
| Twenty CRM | 40,564 | Only 8 spec files; too small |
| SigNoz | 26,164 | Has playwright.config but only 9 spec files |
| Logto | 11,724 | Has 0 matching Playwright test files |
| Infisical | N/A | No playwright.config found |
| Medusa | 32,383 | Uses Playwright via QAComet integration but no in-repo tests found |
| GitLab | N/A | Self-hosted on GitLab, not accessible via GitHub API |

---

## Discovery Summary

- **Total new suites found:** 10 (meeting minimum threshold of 25+ Playwright test files)
- **By scale tier:**
  - **Mega (200+ spec files):** 2 — Gutenberg (235), Element Web (209)
  - **Large (80-200 spec files):** 5 — Rocket.Chat (159), n8n (157), Shopware (94), Mattermost (89), Documenso (82)
  - **Medium (25-80 spec files):** 2 — Ghost (53+), Saleor Dashboard (38)
  - **Framework (multi-config):** 1 — SvelteKit (21 configs, 18 test files)

- **Most promising for deep analysis (top 8):**
  1. **n8n** — Most sophisticated fixture architecture; tag-based infrastructure; chaos testing; 157 files, 180k stars
  2. **WordPress/Gutenberg** — Largest suite; reusable test utils package; multi-config; 235 files
  3. **Element Web** — E2EE testing; visual regression; real-time protocol testing; 209 files
  4. **Rocket.Chat** — Enterprise messaging; federation; omnichannel; 159 files, 45k stars
  5. **Ghost CMS** — Smart isolation; DB snapshots; data factory; environment recycling; 53+ files, 52k stars
  6. **Mattermost** — Accessibility-first testing; Cypress migration; Percy integration; 89 files
  7. **Shopware** — E-commerce; visual regression emphasis; pagespeed testing; 94 files
  8. **Documenso** — API + UI E2E; versioned API testing; document workflows; 82 files

- **Key cross-cutting themes discovered:**
  - Multiple suites migrating from Cypress to Playwright (Gutenberg from Puppeteer, Mattermost from Cypress, NocoDB removed Playwright)
  - Tag-based test filtering emerging as a pattern (n8n, Mattermost)
  - Database snapshot/reset patterns for isolation (Ghost, n8n)
  - Visual regression as a first-class test category (Element Web, Shopware, Mattermost)
  - Accessibility testing emerging as dedicated test category (Mattermost 17 files, Shopware, Element Web)
  - Data factory pattern appearing in multiple suites (Ghost, n8n)
  - Container-based test isolation (n8n, Ghost, Mattermost)
