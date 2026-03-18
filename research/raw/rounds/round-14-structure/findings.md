# Round 14 — Findings

**Phase:** Structure
**Focus:** Architecture deep dive — Immich, Microsoft Playwright

---

## Finding 1: Docker Compose as Playwright webServer is viable for containerized apps
Immich uses `docker compose up --build --renew-anon-volumes --force-recreate` as the Playwright webServer command, with health check URL for readiness. This integrates full-stack containerized infrastructure directly into Playwright's lifecycle.
- **Evidence:** Immich playwright.config.ts webServer configuration

## Finding 2: Mixed parallelism within a single config handles heterogeneous test needs
Immich runs UI tests in parallel (3 workers) but web and maintenance tests serially (1 worker). This per-project parallelism control prevents state collision in stateful tests while maximizing throughput for stateless ones.
- **Evidence:** Immich config — `ui` project (fullyParallel: true, 3 workers) vs. `web` project (1 worker)

## Finding 3: High retry counts compensate for infrastructure variability
Immich uses 4 retries in CI (highest observed), correlating with its Docker-based infrastructure. Container startup variability, network timing, and volume initialization add non-determinism that retries absorb.
- **Evidence:** Immich config (`retries: process.env.CI ? 4 : 0`), compared to Grafana (1), Cal.com (2), AFFiNE (3)

## Finding 4: The `.e2e-spec.ts` extension pattern differentiates test types
Immich uses `.e2e-spec.ts` (configured via `testMatch: '.*\\.e2e-spec\\.ts'`), distinguishing e2e tests from unit tests (`.spec.ts`) and integration tests. This three-tier naming convention is the most explicit test-type differentiation observed.
- **Evidence:** Immich config testMatch, file naming in e2e/src/ui/specs/

## Finding 5: Microsoft Playwright's own tests use a meta-testing architecture
Playwright tests create temporary Playwright projects as subprocesses, testing the framework's own behavior. This "tests testing tests" pattern produces 106+ spec files with minimal config (2 projects, no webServer).
- **Evidence:** Playwright tests/playwright-test/ (106 files), minimal config with subprocess execution

## Finding 6: Data fixture objects (DTOs) serve as an alternative to test.extend()
Immich uses plain TypeScript objects with factory methods (`createUserDto.create()`) rather than Playwright's `test.extend()` pattern. Data is composed through object references (`userDto.admin` references `signupDto.admin`). This is simpler but less integrated than Cal.com's fixture injection.
- **Evidence:** Immich e2e/src/fixtures.ts (DTO pattern)

## Finding 7: CPU-proportional worker formulas provide consistent local experience
Immich calculates local workers as `Math.round(os.cpus().length * 0.75)`, providing consistent performance across developer machines. AFFiNE uses `'50%'` in CI. Both avoid hardcoded counts that may under/over-utilize available resources.
- **Evidence:** Immich config worker calculation, AFFiNE config '50%' string

## Finding 8: Reporter strategy reflects deployment context
Immich: HTML only. Playwright: dot + JSON + blob (triple reporter). The reference implementation uses the most reporters because it tests reporter functionality. Production suites use fewer reporters, with blob (for sharding) being the CI differentiator.
- **Evidence:** Immich config (html), Playwright config (dot + JSON + blob in CI)
