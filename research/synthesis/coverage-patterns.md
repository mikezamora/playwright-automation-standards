# Coverage Strategy Patterns

> Cross-round synthesis of coverage strategy patterns.
> Based on research rounds 56-62, covering 15 suites (10 Gold re-analyzed + 5 new large-scale) plus 30 community resources from round 61.

---

## E2E Boundary Observations

### What Features Gold Suites Test at E2E Level

Analysis of 15 suites reveals a consistent pattern: E2E tests cover **user-facing workflows** and **system integration points**, leaving implementation details to lower test layers.

**Universally tested at E2E (observed in 12+ suites):**
- Authentication flows (login, signup, logout, 2FA) -- 13/15 suites
- Core CRUD operations (create, read, update, delete of primary entities) -- 15/15 suites
- Navigation and page rendering (route loading, menu interaction) -- 15/15 suites
- Form submissions (data entry, validation feedback) -- 14/15 suites

**Commonly tested at E2E (observed in 6-11 suites):**
- Permission/role enforcement (admin vs viewer access) -- 8/15 suites (Grafana, Cal.com, Immich, Supabase, Rocket.Chat, Grafana plugin-e2e, n8n, Element Web)
- Search and filtering (query inputs, result display) -- 9/15 suites
- Settings and preferences (user configuration changes) -- 10/15 suites
- Data import/export (file upload, CSV export) -- 6/15 suites (Supabase, Grafana, Ghost, Shopware, Excalidraw, freeCodeCamp)
- Payment/billing flows -- 3/15 suites (Cal.com, Ghost, Shopware)

**Selectively tested at E2E (observed in 2-5 suites):**
- Accessibility (axe-core scanning) -- 4/15 suites (Grafana, Rocket.Chat, Mattermost, Shopware)
- Real-time/WebSocket interactions -- 3/15 suites (Immich, Element Web, Supabase)
- Visual regression (screenshot comparisons) -- 4/15 suites (Element Web, Shopware, Mattermost, Excalidraw)
- Performance budgets -- 2/15 suites (Grafana, Gutenberg)
- End-to-end encryption -- 2/15 suites (Element Web, Rocket.Chat)

**Rarely tested at E2E (observed in 0-1 suites):**
- Email delivery verification -- 1/15 (Cal.com via MailHog)
- Mobile-specific UI testing -- 1/15 (Cal.com embeds)
- Offline/sync-conflict scenarios -- 0/15 suites
- Third-party service integration (live external APIs) -- 0/15 (all mock external services)

### What Gold Suites Leave to Lower Test Levels

Consistent across suites -- these areas are absent from E2E but may exist in unit/integration tests:
- Pure computation/business logic (e.g., price calculation, date formatting)
- Component rendering in isolation (covered by component tests in Excalidraw, AFFiNE)
- API contract validation (covered by API-level tests in Immich, Ghost, Next.js)
- Database query correctness (covered by integration tests)
- CSS/styling correctness beyond visual regression (no suite tests CSS properties at E2E)

### Multi-Layer E2E Suites

Several suites maintain MULTIPLE e2e test layers, each with different scope:

| Suite | E2E Layers | Total E2E Files |
|-------|-----------|-----------------|
| Ghost CMS | Browser, API, Frontend, Server, Webhooks, per-app | ~199 |
| Immich | Server API (vitest), Web UI (Playwright), UI mock (Playwright) | ~45+ |
| Next.js | e2e, development, production, integration, unit | ~550+ dirs |
| n8n | Main e2e, Docker, Helm, Performance, Coverage, Infrastructure | 174 specs, 7 workflows |
| Grafana | Main suites, Plugin e2e, CUJ, Smoke, Storybook | 163+ specs |

**Key finding:** The most mature suites do not treat "E2E" as a single layer. They decompose E2E testing into sub-layers with different isolation levels, trigger conditions, and purposes.

---

## Coverage Tier Observations

### Tag vs Structural Approaches

**Structural tiering (directories/projects) is dominant:** 11/15 suites use directory structure or Playwright projects as their primary categorization mechanism. Zero suites use tags as their PRIMARY organization.

| Approach | Suites | Count |
|----------|--------|-------|
| **Structural only (directories/projects)** | AFFiNE, Cal.com, freeCodeCamp, Ghost, Grafana, Immich, n8n, Next.js, Rocket.Chat, Slate, Supabase | 11/15 |
| **Tags for cross-context exclusion** | Element Web (`@mergequeue`, `@no-firefox`, `@no-webkit`), Gutenberg (`@webkit`, `@firefox`) | 2/15 |
| **Tags for fixture control** | n8n (`@auth:none`) | 1/15 |
| **Tags for CI tiering** | Element Web (`@mergequeue`) | 1/15 |

**Contradiction with community guidance:** Community resources (round 61) universally recommend `@smoke`, `@regression`, `@critical` tags. But 13/15 production suites examined do not use priority/tier tags at all. The two suites using tags (Element Web, Gutenberg) use them for **execution context exclusion** (skip in Firefox, skip in merge queue), not for priority classification.

**Resolution:** Tags appear when suites need to exclude specific tests from specific browser/server contexts. Suites running only Chromium (11/15) have no need for tags. Tags are a **multi-context scaling mechanism**, not a general organizational tool.

### Structural Tier Examples

**Grafana (most mature structural tiering):**
- `smoke-tests-suite/` -- 3 specs, `@acceptance` tag, core health check
- `dashboard-cujs/` -- 8 specs, Critical User Journeys with setup/teardown projects
- `unauthenticated/` -- login flow without auth state
- `dashboards-suite/`, `panels-suite/`, `various-suite/` -- feature-scoped
- Per-datasource projects (elasticsearch, mysql, etc.)
- Role-based projects (admin, viewer)

**Ghost CMS (multi-config structural tiering):**
- `e2e/tests/admin/` -- admin panel tests
- `e2e/tests/public/` -- public site tests
- `e2e/visual-regression/` -- screenshot comparisons
- 6+ separate Playwright configs for different apps

**Next.js (directory-as-type tiering):**
- `test/e2e/` -- end-to-end tests
- `test/development/` -- dev-mode-specific tests
- `test/production/` -- production-build tests
- `test/integration/` -- legacy integration tests
- Manifest files track pass/fail/flake per bundler

### CI Tier Patterns

| Pattern | Suites | Implementation |
|---------|--------|----------------|
| **All tests on every PR** | Slate, Excalidraw, freeCodeCamp, Immich, AFFiNE | Single CI job, no differentiation |
| **Path-filtered triggering** | Supabase, n8n, Grafana, AFFiNE (copilot) | Only run when relevant code changes |
| **Label/gate-based triggering** | Cal.com (`ready-for-e2e` label) | Human approval required |
| **Separate workflows by feature area** | Cal.com (6 workflows), n8n (7 workflows), Ghost (6+ configs) | Workflow isolation |
| **Browser/server matrix in merge queue** | Element Web (3 browsers x 3 servers) | Full matrix only on merge |
| **Manifest-driven selection** | Next.js | JSON manifests list pass/fail/flake per bundler |
| **Multi-version matrix** | Grafana plugin-e2e (multiple Grafana versions) | Same tests, different targets |

**Emerging pattern (round 61 community evidence):** Two-tier CI:
1. **PR/commit:** Smoke or path-filtered subset (fast feedback, < 5 min)
2. **Merge/nightly:** Full suite including slow, cross-browser, visual regression

Only Grafana and Element Web fully implement this two-tier model among production suites. Most suites (9/15) run ALL tests on every trigger without differentiation.

---

## Prioritization Observations

### Which Features Get Tested First

Based on test file counts and coverage depth across suites:

**Highest priority (tested in every suite):**
1. Authentication (login, signup) -- always the first tests written
2. Core entity CRUD (posts in Ghost, dashboards in Grafana, workflows in n8n, bookings in Cal.com)
3. Navigation and routing

**Second priority (deep coverage in mature suites):**
4. Search and filtering (Supabase filter-bar: 39 tests; Element Web read-receipts: 18 files)
5. Settings and configuration
6. Permission enforcement

**Third priority (added as suites mature):**
7. Import/export workflows
8. Edge cases and error recovery
9. Accessibility
10. Visual regression

### Critical User Journey Patterns

Only 2/15 suites explicitly name CUJ tests:
- **Grafana:** Dedicated `dashboard-cujs/` directory with numbered step tests, separate setup/teardown projects
- **Ghost:** Data factory enables rapid CUJ construction; `posts.test.ts` covers full publish flow

Other suites have implicit CUJs without the label:
- **Cal.com:** Booking flow tests (booking-pages.e2e.ts) are de facto CUJs
- **Element Web:** Crypto verification flows span multiple users and servers
- **n8n:** Workflow execution tests are implicit CUJs

**Community evidence (round 61):** "Critical User Journeys" (Grafana's term) and "Money Paths" (BugBug's term) are the consensus unit of E2E coverage. Risk-based prioritization (`Impact x Likelihood`) is universally recommended over percentage targets.

### Coverage Depth vs Breadth Trade-offs

| Strategy | Suites | Description |
|----------|--------|-------------|
| **Broad-shallow** | Slate (1.6 tests/feature), freeCodeCamp, AFFiNE | Many features covered minimally; "does each feature work at all?" |
| **Narrow-deep** | Excalidraw (history: 40+ tests), Supabase (filter-bar: 39 tests) | Core interactions tested exhaustively |
| **Balanced** | Grafana, Cal.com, n8n, Ghost, Element Web, Gutenberg, Rocket.Chat | Moderate breadth with deeper coverage on critical paths |

---

## Negative/Edge Case Observations

### Error-Path Ratios

| Suite | Happy:Edge Ratio | Notable Edge Cases |
|-------|-----------------|-------------------|
| Slate | 95:5 | Forced layout persistence after deletion |
| AFFiNE | 95:5 | Deleted items stay deleted, modals close properly |
| Excalidraw | 90:10 | "Element too small" noop, history noop after undo |
| freeCodeCamp | 90:10 | 404 pages, invalid URLs, blocked user pages |
| Next.js | 92-95:5-8 | Error boundaries, not-found, 404/500 pages |
| Grafana | 80:20 | Special characters, duplicates, empty states, conflicting settings |
| Supabase | 85:15 | SQL safety blocks, cancel operations, nullable booleans, stale filters |
| Cal.com | 70:30 | Race conditions, concurrent contexts, special characters, disabled features |
| Immich (API) | 70:30 | 401/403/400 responses, permission enforcement |
| Grafana plugin-e2e | 70:30 | Missing API key, invalid queries, unsuccessful annotations |
| Ghost CMS | 88:12 | Disabled member, disabled commenting, theme error notifications |
| Element Web | 88:12 | Key reset, backup deletion, device dehydration |
| Rocket.Chat | 90:10 | Invalid URLs, permission enforcement, a11y violations |
| n8n | 80-85:15-20 | Chaos testing, memory consumption, retention, regression |
| Gutenberg | ~85:15 | Invalid input, broken blocks (sparse based on naming) |

**Cross-suite average: 85:15 happy-path to edge-case ratio.**

### Where Negative Testing Happens

Error-path coverage varies by test layer:
- **API-level E2E tests** (Immich, Ghost): ~30% error coverage (401, 403, 400 status codes)
- **SDK/framework test suites** (Grafana plugin-e2e): ~30% error coverage (explicit "should fail when..." tests)
- **UI-level E2E tests** (all suites): ~5-15% error coverage (mostly empty states and permission redirects)

**Key finding (round 61 confirmation):** The 5-15% error-path ratio at the UI E2E layer is the pragmatic norm across all production suites, not an outlier. Community guides aspire to more error coverage but real teams delegate most error-path testing to unit/integration layers.

### Types of Edge Cases Tested at E2E

Ranked by frequency across suites:
1. **Permission enforcement** (8/15 suites): Admin vs viewer access, redirect on unauthorized
2. **Empty/error states** (6/15 suites): No results, deleted items, disabled features
3. **Input validation** (5/15 suites): Special characters, invalid URLs, missing required fields
4. **Concurrent/race conditions** (3/15 suites): Cal.com concurrent slot reservation, n8n chaos testing, Cal.com duplicate API calls
5. **Recovery flows** (2/15 suites): Element Web key reset, Cal.com retry after failure
6. **Session/auth edge cases** (2/15 suites): freeCodeCamp blocked user, Cal.com disabled rescheduling

---

## Coverage Measurement Observations

### Tools and Approaches

| Approach | Adoption | Maturity |
|----------|----------|----------|
| **No formal coverage measurement** | 13/15 suites | This is the norm |
| **V8 Coverage API** (Chromium-only) | Referenced in community; AFFiNE has CDP support | Low adoption; Chromium-only limitation |
| **Istanbul instrumentation** (babel/vite plugin) | Referenced in community; mxschmitt demo repo | Low adoption; requires build modification |
| **Feature/scenario tracking** (feature-map, spreadsheets) | Referenced in community; no suite uses in practice | Very low adoption |
| **Test management platforms** (Testomat.io, Currents) | Referenced in community | External tooling, not in-repo |
| **Custom flaky-test tracking** | Gutenberg (custom flaky-tests-reporter), Next.js (manifest-based) | 2/15 suites track flakiness systematically |
| **Coverage CI workflow** | n8n (`test-e2e-coverage-weekly.yml`) | 1/15 suites has dedicated coverage workflow |

### Maturity Levels

**Level 0 -- No measurement (11/15 suites):** Slate, Excalidraw, AFFiNE, Immich, freeCodeCamp, Cal.com, Supabase, Rocket.Chat, Ghost, Element Web, Grafana plugin-e2e. These suites rely on implicit coverage (feature directory completeness, PR review) rather than explicit measurement.

**Level 1 -- Structural proxy (2/15 suites):** Grafana uses structural tiering (smoke vs CUJ vs full) as an implicit coverage model. Next.js uses manifest files tracking pass/fail/flake status per test suite as an explicit coverage proxy.

**Level 2 -- Dedicated coverage workflow (1/15 suites):** n8n has a weekly `test-e2e-coverage-weekly.yml` workflow, suggesting periodic coverage assessment.

**Level 3 -- Integrated coverage tooling (0/15 suites):** No suite examined uses code coverage tools (V8, Istanbul) or feature-map tools in their CI pipeline.

### Community Guidance vs Practice Gap

Round 61 community resources recommend:
- Code coverage as a "guide, not a goal" (Currents)
- 80% scenario coverage of high-priority workflows (Alphabin)
- Feature-map YAML tracking (Playwright Solutions)
- Risk-based prioritization over percentage targets (BugBug)

**Reality:** No production suite implements any formal coverage measurement at the E2E layer. The gap between community recommendation and practice is the largest of any area studied. Teams appear to use structural completeness (directory per feature) and PR review as their coverage heuristic.

### Two Coverage Philosophies (from round 61)

1. **Code coverage (instrumentation-based):** Measures lines executed. V8 (Chromium-only) or Istanbul (build modification required). Used as sanity check, not target. No production suite adopts this for E2E.

2. **Feature/scenario coverage (tracking-based):** Measures which user-facing features have tests. More meaningful for E2E but requires manual maintenance. The `feature-map` npm package is the closest tool but has limitations (binary, manual, no depth). No production suite adopts this either.

**Conclusion:** Coverage measurement for E2E testing is an unsolved problem in practice. The industry relies on structural organization and human judgment rather than automated metrics.
