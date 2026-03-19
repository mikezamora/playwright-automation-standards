# Round 68 Findings — E2E Boundary Analysis: What Gets Tested Where

## Phase
Coverage Strategy Deep Dive (Phase 2)

## Objective
Map what features have E2E tests versus what is left to unit/integration layers across 7+ production suites. Establish a cross-suite model of E2E boundary decisions.

---

## 1. E2E Boundary Mapping: Feature-by-Feature Analysis

### Grafana (163 Playwright spec files, ~400 tests)

**Tested at E2E (Playwright) layer:**
- Dashboard CRUD, browsing, search, templating, time zones, timepicker, public dashboards, sharing, snapshots, export, links, tabs, variables (7 types), repeating panels, import
- Panel rendering and interaction: 14 panel types (annotations, candlestick, canvas, gauge, geomap, heatmap, logs, state-timeline, status-history, table variants, timeseries)
- Dashboard new layouts: add/remove/move/group/duplicate panels, outlines, repeats, conditional rendering, keybindings
- Navigation, explore, keybindings, bookmarks, i18n verification
- 14 data source plugins (Elasticsearch, MySQL, MSSQL, PostgreSQL, CloudWatch, Azure Monitor, etc.)
- Smoke/acceptance: login -> create datasource -> create dashboard -> add panel -> verify render
- CUJs: dashboard view journey, navigation journey, ad-hoc filters, group-by, scopes
- Plugin extensions
- Accessibility (axe-core)
- Performance (single perf-test.spec.ts)

**NOT tested at E2E layer (gaps or delegated):**
- Alerting (1 file only -- alert rules, notification channels, silences still in legacy Cypress `e2e/` or untested)
- User management, org management, RBAC roles
- API keys, service accounts
- Correlations, SLO
- Reporting, PDF export
- OnCall, Incident integration
- Annotation CRUD (only filter tested)

**Key boundary decision:** Grafana explicitly documents preferring real interactions over stubs/mocks: "We generally do not use stubs or mocks as to fully simulate a real user." This pushes more testing to E2E than most suites.

### Cal.com (73 spec files, ~380 tests)

**Tested at E2E layer:**
- Booking flows (the core product): booking pages, event types, opt-in bookings, reschedule, cancel
- Authentication: login, signup, 2FA
- Settings: general, calendar, availability, teams, webhooks
- Organization features: creation, member management
- Team operations: round-robin, collective scheduling
- Embed rendering (core, React variants across browsers)
- OAuth integration
- Apps/integrations page
- Visual regression (icons, integrations snapshots)
- Booking questions/custom fields

**NOT tested at E2E layer:**
- Payment processing (Stripe checkout tested via fixtures, not real Stripe)
- Email delivery verification (mocked via `emails` fixture)
- Calendar sync accuracy (CalDAV, Google, Outlook integrations)
- Mobile-specific responsive behavior
- Admin console/superadmin features
- API endpoint behavior (no separate API E2E layer)
- Recurring event edge cases (complex recurrence rules)

**Key boundary decision:** Cal.com uses a hybrid approach where the `users` fixture creates fully configured test users with event types, schedules, and team memberships via API, then E2E tests verify the UI flows. This means the "arrangement" happens at the API/DB level while "assertion" happens at the UI level.

### Immich (45+ spec files, ~350 tests across API + UI)

**Tested at E2E -- API layer (vitest + supertest, 23 spec files):**
- Activity, albums, API keys, assets, downloads, jobs, libraries, maps, memories, OAuth, partners, persons/faces, search, server info, sessions, shared links, stacks, system config, system metadata, tags, trash, user admin, user self-service
- Error responses: 401 unauthorized, 403 forbidden, 400 bad request (systematic error DTO testing)
- Permission enforcement across user types

**Tested at E2E -- UI layer (Playwright, 14+ spec files):**
- Albums (web), auth/registration, photo viewer, shared links, user admin, websocket events
- UI mock tests: asset viewer (4 specs), memory viewer, search gallery, timeline
- Maintenance mode web tests

**NOT tested at E2E:**
- Mobile app interactions
- Performance/load testing
- Accessibility
- Internationalization
- Notification/email delivery
- Backup/restore workflows
- Offline sync behavior

**Key boundary decision:** Immich has the clearest two-layer E2E architecture: API-level E2E tests cover breadth (23 endpoints with both happy-path and error responses), while UI-level E2E tests cover depth on critical visual workflows. The API layer achieves ~70:30 happy-path to error-path ratio -- the best error coverage of any suite.

### Ghost CMS (199 total E2E files across 5 layers)

**Tested at E2E -- Browser layer (54 files):**
- Admin panel: posts, members, comments, analytics, settings, tags, billing, sidebar, 2FA
- Public site: homepage, comments, member signup, portal, Stripe checkout
- Visual regression

**Tested at E2E -- API layer (~60 files):**
- REST API endpoints (articles, members, settings, themes, webhooks)

**Tested at E2E -- Frontend layer (~14 files):**
- Server-side rendered page output

**Tested at E2E -- Server layer (~9 files):**
- Server startup, configuration behavior

**Tested at E2E -- Webhook layer (5 files):**
- Webhook delivery and payload verification

**NOT tested at E2E:**
- Theme development workflow
- Plugin/integration marketplace
- Multi-language content management
- Email campaign delivery
- RSS feed generation accuracy

**Key boundary decision:** Ghost has the most layered E2E architecture (5 distinct layers). This creates a natural testing pyramid _within_ the E2E category itself: many API tests (fast), moderate browser tests (slower), few server tests (infrastructure).

### Element Web (209 spec files)

**Tested at E2E layer:**
- Crypto/E2EE (20 specs -- the largest category, reflecting security-critical nature)
- Settings (33 specs)
- Read receipts (18 specs)
- Left panel, rooms, right panel, widgets, login, timeline
- Multi-homeserver compatibility (Synapse, Dendrite, Picone)
- Cross-browser (Chrome, Firefox, WebKit)

**NOT tested at E2E layer:**
- VoIP/voice calls
- Spaces management (limited)
- Server admin features
- Federation edge cases (beyond basic cross-server)
- Performance under load

**Key boundary decision:** Element Web's E2E boundary is driven by its security-critical nature. Crypto tests alone account for ~10% of the entire suite, reflecting that encryption correctness cannot be adequately verified at unit level -- it requires multi-client, multi-server integration.

### n8n (174 spec files)

**Tested at E2E layer:**
- AI/LLM workflows (14 specs)
- Workflow building blocks (5)
- Authentication (5)
- Settings (13)
- Nodes (12)
- Credentials (4)
- Sharing (4)
- Projects (6)
- Regression (12)
- Source control (2)
- Chat hub (7)
- Benchmarks (10)
- Chaos testing (2)

**NOT tested at E2E layer:**
- Email notification delivery
- Webhook payload verification (via integration tests)
- Detailed execution logs
- Billing/usage limits

**Key boundary decision:** n8n is notable for including chaos testing (2 specs) and memory consumption tests within the E2E suite. This extends E2E beyond functional correctness into resilience testing -- unique among analyzed suites.

### AFFiNE (120+ spec files across 7 projects)

**Tested at E2E layer:**
- Local: page CRUD, journal, quick search, navigation, settings, theme, properties, import, templates, workspace management, favorites, collections, trash/restore, export
- Cloud: collaboration, comments, login, migration, share page, storage, workspace management
- BlockSuite: paragraph editing, lists, code blocks, hotkeys, clipboard, bookmarks, databases, drag, format bar, images, LaTeX, links, slash menu, selections
- Desktop and mobile variants
- Copilot AI features

**NOT tested at E2E layer:**
- Error-path testing (network failures, corrupt data, permission denied)
- Performance budget enforcement
- Accessibility
- Internationalization (despite i18n support)
- Offline/sync-conflict resolution (despite CRDT architecture)

**Key boundary decision:** AFFiNE splits E2E testing by deployment context (local vs cloud vs desktop vs mobile) with separate Playwright projects. This means the same feature may be tested at E2E level in one context but not another.

---

## 2. Cross-Suite E2E Boundary Patterns

### Pattern EB1: "Core CRUD First"
All 7 suites prioritize E2E coverage for core CRUD operations on the primary data type: dashboards (Grafana), bookings (Cal.com), photos/albums (Immich), posts/members (Ghost), messages/rooms (Element Web), workflows (n8n), pages/documents (AFFiNE). This is the universal starting point for E2E coverage.

### Pattern EB2: "Authentication is Always E2E"
Login/auth flows are E2E-tested in 7/7 suites. Even when auth is handled via fixtures for other tests, the auth flow itself has dedicated E2E tests. This aligns with community guidance that auth is a "money path."

### Pattern EB3: "API Layer for Breadth, UI Layer for Depth"
Suites with both API and UI E2E layers (Immich, Ghost) consistently cover MORE endpoints at the API layer. Immich: 23 API spec files vs 14 UI spec files. Ghost: 60+ API files vs 54 browser files. The API layer provides broad coverage cheaply; the UI layer validates critical visual workflows.

### Pattern EB4: "Security-Critical Features Get Disproportionate E2E Coverage"
Element Web devotes 20/209 specs (10%) to crypto alone. Grafana's auth setup is a multi-project Playwright configuration. Cal.com's auth directory is one of the largest. When a feature has security implications, it gets more E2E testing than its user-facing complexity would suggest.

### Pattern EB5: "Integration Points Stay at E2E"
Third-party integrations (Grafana data sources, Cal.com calendar sync, Ghost Stripe, n8n node connections) are consistently tested at E2E level even when mocked. The rationale: integration failure modes are inherently multi-system and cannot be caught at unit level, even with mocks.

### Pattern EB6: "Admin Features Get Less E2E"
User management, org admin, RBAC configuration, and system settings consistently have lower E2E coverage across all suites. These are considered lower-risk (internal users, infrequent changes) and are often delegated to API-level testing or manual verification.

---

## 3. Community Guidance on E2E Boundaries

### Kent C. Dodds' Testing Trophy
- "Write a single E2E test to cover the 'happy path' that most of your users go through for a particular use case"
- "E2E tests won't give you 100% use case coverage (and shouldn't)"
- "Test use cases, not code" -- focus on what users actually do
- Integration tests should carry the bulk of the testing load
- **Source:** kentcdodds.com/blog/how-to-know-what-to-test

### web.dev Testing Strategies Article
- Six testing strategy shapes documented: Pyramid, Diamond, Honeycomb, Trophy, Ice Cone, Crab
- E2E occupies the top tier in all shapes except Ice Cone (anti-pattern) and Crab (UI-centric)
- Core principle across all strategies: "the more high level you get, the fewer tests you should have"
- Strategy selection depends on team composition and application type
- **Source:** web.dev/articles/ta-strategies

### Leading EDJE "Playwright Pitfalls"
- "You should not use Playwright to test functionality that can be tested at a unit testing layer"
- The "hourglass" test shape (too many E2E tests) indicates insufficient lower-level testing
- "Focus on critical user journeys and test edge cases at lower levels of the testing pyramid"
- **Source:** blog.leadingedje.com

### Makerkit Smoke Testing Guide
- Smoke tests: 10-20% of functionality; full E2E: 70-90%
- Three essential smoke categories: Authentication, Payment Integration, Core Feature CRUD
- Goal: "early warning system" -- not comprehensive validation
- Keep smoke suite under 5 minutes
- **Source:** makerkit.dev

---

## 4. Synthesized E2E Boundary Decision Framework

Based on cross-referencing 7 suites with community guidance, a production E2E suite should cover:

| Priority | Category | Evidence |
|----------|----------|----------|
| **Must have** | Core CRUD on primary data type | 7/7 suites |
| **Must have** | Authentication flows (login, signup, logout) | 7/7 suites |
| **Must have** | Critical user journeys / "money paths" | 7/7 suites (Grafana CUJs, Cal.com bookings, etc.) |
| **Should have** | Third-party integration touchpoints | 5/7 suites (data sources, payment, calendar) |
| **Should have** | Permission/role enforcement | 4/7 suites (Grafana admin/viewer, Immich, Element Web, Rocket.Chat) |
| **Should have** | Navigation and core layout | 6/7 suites |
| **Nice to have** | Admin/settings features | 4/7 suites (often sparse) |
| **Nice to have** | Error/empty states | 3/7 suites (Immich API best) |
| **Rarely at E2E** | Business logic rules | 0/7 suites (delegated to unit) |
| **Rarely at E2E** | Data transformation/formatting | 0/7 suites (delegated to unit) |
| **Rarely at E2E** | Third-party service internals | 0/7 suites (mocked, not tested) |
