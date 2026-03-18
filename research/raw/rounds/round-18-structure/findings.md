# Round 18 — Findings

**Phase:** Structure
**Focus:** Environment-aware config, webServer patterns, global setup/teardown architecture

---

## Finding 1: Two competing global setup architectures — project dependencies are winning

Playwright offers two approaches: (1) `globalSetup` file — a single function that runs before all tests, and (2) setup projects — dedicated projects with `dependencies` that run first. Setup projects provide HTML report visibility, trace recording, and fixture access. The `globalSetup` file approach is legacy but persists in template projects.
- **Evidence:** Grafana uses setup projects (`authenticate`, `createUserAndAuthenticate`). playwright-ts template uses `globalSetup: require.resolve('./global-setup.ts')`. Official docs recommend setup projects for new code.

## Finding 2: The `process.env.CI` ternary is the universal environment switch

Every analyzed suite uses `process.env.CI ? ciValue : localValue` for at least one config property. The specific properties that branch on CI vary, but the mechanism is identical. No suite uses `.env` files, environment-specific config files, or dotenv for the CI/local split.
- **Evidence:** Grafana (retries, workers), Cal.com (timeout, retries, reporter), AFFiNE (timeout, reporter, workers), Immich (retries, workers), freeCodeCamp (maxFailures, reporter), Slate (retries, fullyParallel, forbidOnly, trace, screenshot)

## Finding 3: webServer configuration spans four distinct architectural patterns

Pattern A — **App server** (most common): Start the web application under test. Cal.com starts 3 servers on different ports. AFFiNE uses `yarn workspace dev`.
Pattern B — **Conditional server**: Only start when URL is not already available. Grafana checks `!process.env.GRAFANA_URL`.
Pattern C — **Infrastructure server**: Start supporting services, not the app. freeCodeCamp starts Mailpit Docker container for email testing.
Pattern D — **Full-stack orchestration**: Start entire environment. Immich runs `docker compose up --renew-anon-volumes --force-recreate`.
- **Evidence:** Cal.com (Pattern A, 3 ports), Grafana (Pattern B), freeCodeCamp (Pattern C), Immich (Pattern D)

## Finding 4: Multi-webServer configs require explicit port assignment

Cal.com's triple webServer configuration assigns explicit ports (3000, 3100, 3101) to each server. The `url` property is used for health-checking, not for baseURL assignment. This distinction is critical — `webServer.url` determines readiness, while `use.baseURL` determines where tests navigate.
- **Evidence:** Cal.com config — `webServer: [{ command: '...', port: 3000, url: 'http://localhost:3000' }, { port: 3100 }, { port: 3101 }]`

## Finding 5: Worker allocation strategies encode resource philosophy

Five distinct worker strategies observed:
1. **CPU percentage**: AFFiNE `workers: '50%'` — portable across machines
2. **CPU formula**: Immich `Math.round(os.cpus().length * 0.75)` — explicit 75% reservation
3. **Fixed CI + auto local**: Grafana `workers: process.env.CI ? 4 : undefined` — deterministic CI, optimized local
4. **Fixed both**: playwright-ts `workers: process.env.CI ? 3 : 6` — full control, assumes hardware
5. **Serial**: freeCodeCamp `workers: 1` — eliminates parallelism concerns
- **Evidence:** All five suites' playwright.config.ts worker configurations

## Finding 6: Setup-teardown project chains enable database lifecycle management

Grafana's `dashboard-cujs-setup` -> `dashboard-cujs` -> `dashboard-cujs-teardown` chain demonstrates the three-phase project dependency pattern: prepare state, execute tests, clean up state. The `teardown` property on setup projects links the cleanup project automatically.
- **Evidence:** Grafana config — `{ name: 'dashboard-cujs-setup', teardown: 'dashboard-cujs-teardown' }`, `{ name: 'dashboard-cujs', dependencies: ['dashboard-cujs-setup'] }`

## Finding 7: The `reuseExistingServer` convention is near-universal

Every suite with a webServer config uses `reuseExistingServer: !process.env.CI` — fresh server in CI, reuse locally. This prevents port conflicts from stale processes in CI while avoiding unnecessary server restarts during local development iteration.
- **Evidence:** Cal.com, AFFiNE, Grafana (conditional webServer), playwright-ts template — all use `!process.env.CI` pattern

## Finding 8: Trace and screenshot capture follow a "failure-only" consensus

Across all analyzed suites, the dominant artifact capture strategy is:
- **Trace:** `'retain-on-failure'` or `'on-first-retry'` (never `'on'` in CI)
- **Screenshot:** `'only-on-failure'` (universal)
- **Video:** Off by default; AFFiNE is the sole exception with `'on-first-retry'`
This consensus minimizes storage costs while preserving diagnostic value.
- **Evidence:** Grafana (`trace: 'retain-on-failure'`), Cal.com (`trace: 'retain-on-failure'`), AFFiNE (`trace: 'on-first-retry'`, `video: 'on-first-retry'`), Slate (`trace: 'retain-on-first-retry'` CI only)
