# Round 19 — Findings

**Phase:** Structure
**Focus:** Fixture composition, scoping, auth patterns, data fixtures

---

## Finding 1: Cal.com's factory fixture is the most sophisticated data creation pattern observed

Cal.com's `createUsersFixture()` returns a chainable factory with methods: `buildForSignup()`, `create(opts, scenario)`, `trackEmail()`, `get()`, `deleteAll()`. The `create()` method accepts a scenario object with `hasTeam`, `numberOfTeams`, `teammates`, `schedulingType`, `teamFeatureFlags` — creating cascading resources (user -> event types -> workflows -> team memberships -> routing forms) in a single call. This is dependency injection without `test.extend()`.
- **Evidence:** Cal.com `fixtures/users.ts` — scenario composition creates 5 default event types (30-min, Paid, Opt-in, Seated, Multiple-duration) per user, optional team structures with configurable scheduling types

## Finding 2: Fixture scoping has two levels with distinct lifecycle semantics

Test-scoped fixtures (`{ scope: 'test' }`, the default) run setup before each test and teardown after — suitable for page objects and test-specific state. Worker-scoped fixtures (`{ scope: 'worker' }`) run once per worker process — suitable for expensive resources like database connections, server instances, and shared auth state. The `workerInfo.workerIndex` provides unique identity for parallel isolation.
- **Evidence:** Official Playwright docs — worker fixture example creates unique username per worker via `'user' + workerInfo.workerIndex`, persists across all tests in that worker

## Finding 3: Automatic fixtures (`{ auto: true }`) replace beforeEach/afterEach hooks

Auto fixtures execute for every test without being listed in the test signature. Primary use cases: (1) debug log collection that attaches on failure, (2) screenshot/trace capture, (3) analytics/metrics collection. They replace `test.beforeEach()`/`test.afterEach()` with a more composable pattern that participates in fixture dependency ordering.
- **Evidence:** Playwright docs — `saveLogs` auto fixture collects logs, checks `testInfo.status !== testInfo.expectedStatus`, attaches log file to test report on failure

## Finding 4: Two competing auth architectures — project dependencies vs fixture-based on-demand

**Project dependencies** (Grafana approach): Setup project authenticates upfront, all dependent projects reuse `storageState` file. Pros: simple, visible in HTML report. Cons: all roles authenticate even if unused, each shard repeats setup.
**Fixture-based on-demand** (community pattern): `globalCache.get()` wraps auth in a cache — first test needing auth triggers login, subsequent tests reuse cached state. Pros: only required roles authenticate, shard-efficient. Cons: cache warming adds latency to first test.
- **Evidence:** Grafana (`dependencies: ['authenticate']` on 25+ projects), community pattern (`globalCache.get('auth-state-admin', async () => { /* login */ })`)

## Finding 5: `mergeTests()` and `mergeExpects()` enable modular fixture composition

Introduced in Playwright v1.39.0, `mergeTests()` combines fixture sets from multiple modules into a single test object. This enables domain-based fixture organization: database fixtures in one file, accessibility fixtures in another, auth fixtures in a third — merged at the test level. Known limitation: name conflicts between merged fixture sets produce incorrect types.
- **Evidence:** Playwright docs — `const test = mergeTests(dbTest, a11yTest)` combines fixtures from `database-test-utils` and `a11y-test-utils`; GitHub issue #29178 documents type conflicts

## Finding 6: Fixture-level timeouts decouple slow setup from fast test expectations

Fixtures can specify independent timeouts via `{ timeout: 60000 }` in the tuple syntax. This allows expensive fixtures (database seeding, Docker container startup, complex auth flows) to have generous timeouts without inflating the overall test timeout. The fixture timeout runs independently of the test timeout.
- **Evidence:** Playwright docs — `slowFixture: [async ({}, use) => { /* slow op */ await use('value'); }, { timeout: 60000 }]`

## Finding 7: Parameterized fixtures via `{ option: true }` enable project-level configuration

Fixtures marked with `{ option: true }` become configurable from `playwright.config.ts` project definitions. Pattern: define `person: ['John', { option: true }]` in fixture, then `projects: [{ name: 'alice', use: { person: 'Alice' } }]` in config. This bridges the fixture system and the project system, enabling fixture behavior to vary by project.
- **Evidence:** Playwright docs — `test.extend<TestOptions>({ person: ['John', { option: true }] })` with project-level `use: { person: 'Alice' }` override

## Finding 8: Cal.com's transactional cleanup prevents "lock ordering deadlocks" in parallel execution

Cal.com wraps all test data cleanup in a single Prisma `$transaction()` block, deleting resources in dependency order (secondary emails -> users -> teams). This prevents deadlocks when multiple workers clean up simultaneously. The `retryOnNetworkError()` wrapper adds exponential backoff for transient failures (ECONNRESET, ETIMEDOUT).
- **Evidence:** Cal.com `fixtures/users.ts` — `prisma.$transaction(async (tx) => { tx.secondaryEmail.deleteMany(...), tx.user.deleteMany(...), tx.team.deleteMany(...) })` with `retryOnNetworkError(fn, maxRetries=3)`
