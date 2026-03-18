# Round 13 — Findings

**Phase:** Structure
**Focus:** Architecture deep dive — Grafana, Cal.com, AFFiNE

---

## Finding 1: Project count scales with application complexity
Grafana defines 28 projects (auth, data sources, feature suites, CUJS), Cal.com defines 7 (app + packages + cross-browser embeds), and AFFiNE uses 9 separate test packages with individual configs. The number of Playwright projects directly correlates with application surface area.
- **Evidence:** Grafana config (28 projects), Cal.com config (7 projects), AFFiNE tests/ directory (9 packages)

## Finding 2: Three distinct fixture patterns exist in Gold suites
- Grafana: Published npm package (`@grafana/plugin-e2e`) with models, matchers, selectors, fixtures
- Cal.com: Factory-based fixtures via `createUsersFixture()` with scenario composition
- AFFiNE: Shared kit package (`@affine-test/kit`) with function-based helpers (no classes)
- **Evidence:** Grafana plugin-e2e src/, Cal.com fixtures/users.ts, AFFiNE tests/kit/

## Finding 3: CI timeout strategies diverge significantly
Cal.com uses an inverted model: 60s CI / 240s local (shorter in CI, rationale: local dev servers are slow). AFFiNE uses 50s CI / 30s local (longer in CI, rationale: CI environments are less predictable). Grafana uses 10s expect timeout globally.
- **Evidence:** Cal.com config (timeout comments), AFFiNE config (CI conditional), Grafana config (expect.timeout)

## Finding 4: Suite-based directory grouping is the Gold standard for large suites
Grafana organizes tests into `*-suite/` directories (alerting-suite, dashboards-suite, panels-suite), with 34 spec files in dashboards-suite alone. Cal.com uses feature directories (auth/, eventType/, team/). AFFiNE segments by deployment target (affine-local, affine-cloud, affine-desktop).
- **Evidence:** Grafana e2e-playwright/ directory listing, Cal.com apps/web/playwright/ listing, AFFiNE tests/ listing

## Finding 5: Tag-based test filtering is emerging in Gold suites
Grafana uses `{ tag: ['@dashboards'] }` on describe blocks for selective execution. This enables running specific feature suites without modifying config. Not observed in Cal.com or AFFiNE.
- **Evidence:** Grafana dashboard-browse.spec.ts describe block

## Finding 6: Monorepo suites require multi-package test architectures
Cal.com tests across `apps/web`, `packages/app-store`, and `packages/embeds`. AFFiNE maintains 9 separate test packages with shared fixtures. Both demonstrate that monorepo architecture directly shapes test organization.
- **Evidence:** Cal.com 7 projects spanning apps/ and packages/, AFFiNE 9 test packages

## Finding 7: Auth state management uses dedicated setup projects
All three suites implement auth via Playwright project dependencies: Grafana has `authenticate` and `createUserAndAuthenticate` projects, Cal.com uses `storageState`, AFFiNE separates auth across packages. The pattern of auth-as-project is universal.
- **Evidence:** Grafana config (2 auth projects), Cal.com storageState path, AFFiNE cloud test packages
