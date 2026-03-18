# Round 17 — Findings

**Phase:** Structure
**Focus:** Playwright configuration patterns — project definitions, reporters, timeouts

---

## Finding 1: The `withAuth()` helper function is the most scalable project definition pattern

Grafana's config defines a `withAuth(project)` function that injects `dependencies: ['authenticate']` and `storageState: 'playwright/.auth/admin.json'` into any project object. This eliminates repetition across 31 projects — each data source project (elasticsearch, mysql, mssql, etc.) simply wraps with `withAuth()` rather than duplicating auth configuration.
- **Evidence:** Grafana playwright.config.ts — `withAuth()` applied to 25+ projects, reducing each project definition to name + testDir + testMatch

## Finding 2: Conditional platform-based projects address cross-platform test gaps

Slate conditionally adds a WebKit project only on macOS systems, avoiding WebKit-related failures on Linux CI runners. This is the only observed pattern where project count varies by operating system.
- **Evidence:** Slate playwright.config.ts — `if (process.platform === 'darwin') projects.push(webkitProject)` for conditional Safari testing

## Finding 3: Retry counts of 5 indicate domain-specific flakiness acceptance

Slate uses 5 retries in CI — the highest observed across all analyzed suites. Rich text editor testing involves complex contenteditable interactions with inherent race conditions. This confirms that retry count reflects domain complexity, not just infrastructure instability.
- **Evidence:** Slate config (`retries: process.env.PLAYWRIGHT_RETRIES ? +process.env.PLAYWRIGHT_RETRIES : process.env.CI ? 5 : 2`), compared to Immich (4), AFFiNE (3), Cal.com (2), Grafana (1)

## Finding 4: Action timeout of zero (unlimited) is a valid strategy for editor-heavy UIs

Slate sets `actionTimeout: 0` (no limit) while keeping test timeout at 20s and expect timeout at 8s. This inverted hierarchy prioritizes individual action completion for complex editor operations while still bounding total test duration.
- **Evidence:** Slate config (`actionTimeout: 0`, `timeout: 20000`, `expect.timeout: 8000`)

## Finding 5: The timeout hierarchy has three tiers with distinct purposes

Across all analyzed suites, timeouts follow a consistent three-tier pattern: (1) test timeout — total ceiling for the entire test, (2) expect timeout — maximum wait for assertions/auto-waiting, (3) action timeout — individual user-action bound. The ratio between these tiers varies by application type but the hierarchy is universal.
- **Evidence:** Slate (20s/8s/unlimited), Grafana (30s/10s/default), Cal.com (60s CI or 240s local / default / default), freeCodeCamp (15s/default/default)

## Finding 6: Custom testIdAttribute values fragment the ecosystem

Three different `testIdAttribute` values observed: `data-testid` (default, most suites), `data-test-id` (Slate), `data-playwright-test-label` (freeCodeCamp), `qa-target` (playwright-ts template). Each custom value requires contributors to learn a non-standard convention and breaks compatibility with community examples.
- **Evidence:** Slate (`data-test-id`), freeCodeCamp (`data-playwright-test-label`), playwright-ts (`qa-target`), all others use default `data-testid`

## Finding 7: Reporter stacking follows a consistent three-slot pattern

Across mature suites, reporters occupy three logical slots: (1) progress reporter — dot/list/github for CI feedback, (2) artifact reporter — HTML for post-run analysis, (3) integration reporter — JUnit/JSON/blob for CI pipeline consumption. The number of slots filled indicates CI maturity.
- **Evidence:** Cal.com (blob+HTML+JUnit = 3 slots), Playwright official (dot+JSON+blob = 3 slots), Grafana (HTML+custom a11y = 2 slots), Slate (github/list+trace = 2 slots), freeCodeCamp (HTML = 1 slot)

## Finding 8: CloudFlare access headers in config reveal zero-trust testing patterns

The playwright-ts template includes `CF-Access-Client-Id` and `CF-Access-Client-Secret` as default HTTP headers. This demonstrates a pattern for testing applications behind zero-trust proxies — embedding auth tokens in the Playwright config's `extraHTTPHeaders` rather than handling them per-test.
- **Evidence:** playwright-ts config (`extraHTTPHeaders: { 'CF-Access-Client-Id': process.env.CF_CLIENT_ID, 'CF-Access-Client-Secret': process.env.CF_CLIENT_SECRET }`)
