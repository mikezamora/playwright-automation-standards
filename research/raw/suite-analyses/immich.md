# Suite Analysis: immich-app/immich

**Repository:** https://github.com/immich-app/immich
**Suite Location:** `/e2e/` (config + source)
**Tier:** Gold
**Round:** 13-14 (Structure Deep Dive)

---

## 1. Architecture Analysis

### Directory Structure
```
/e2e/
  playwright.config.ts
  src/
    specs/
      server/                  # API/server-level specs
      web/                     # Web UI specs
      maintenance/
        web/                   # Maintenance mode web tests
    ui/
      specs/                   # UI-focused specs
    docker-compose.ts          # Docker orchestration helpers
    fixtures.ts                # Data fixtures (DTOs, not test.extend)
    generators.ts              # Test data generators
    responses.ts               # Expected response shapes
    utils.ts                   # Shared utilities
```

### playwright.config.ts
- **3 projects**: `web` (serial, 1 worker), `ui` (parallel, 3 CI workers), `maintenance` (serial, 1 worker)
- `fullyParallel: false` (global default — overridden per project)
- `retries: process.env.CI ? 4 : 0` — highest retry count observed
- Test match: `.*\.e2e-spec\.ts`
- `forbidOnly: !!process.env.CI`

### Worker Configuration
- Global: `process.env.CI ? 4 : Math.max(1, Math.round(os.cpus().length * 0.75))`
- UI project: 3 workers in CI, dynamic locally
- Web/maintenance: 1 worker (serial execution)

### POM / Fixtures
- **Data fixtures only** — `fixtures.ts` exports DTOs (`uuidDto`, `loginDto`, `signupDto`, `createUserDto`, `userDto`)
- Factory method: `createUserDto.create()` for dynamic user generation
- Composed through reference: `userDto.admin` references values from `signupDto.admin`
- **No class-based POM or test.extend fixtures** — uses traditional data objects

### Web Server
- Docker Compose: `docker compose up --build --renew-anon-volumes --force-recreate --remove-orphans`
- Health check URL: `http://127.0.0.1:2285`
- Reuse enabled by default
- Disable via `PLAYWRIGHT_DISABLE_WEBSERVER` env var

### Environment Config
- `PLAYWRIGHT_BASE_URL` — defaults to `http://127.0.0.1:2285`
- `PLAYWRIGHT_SLOW_MO` — configurable slow motion for debugging
- `PLAYWRIGHT_DISABLE_WEBSERVER` — skip Docker Compose startup

## 2. Validation Analysis

### Assertion Patterns
- Standard Playwright assertions (`toBeVisible()`, `toHaveText()`)
- HTTP status code validation via response objects
- DTO-based expected values from `responses.ts`

### Retry/Timeout Config
- **4 retries in CI** — highest observed, reflecting Docker-based infrastructure complexity
- 0 retries locally
- `trace: 'on-first-retry'`
- `screenshot: 'only-on-failure'`

### Test Isolation
- Docker Compose `--renew-anon-volumes --force-recreate` ensures clean state
- Serial execution for web/maintenance projects prevents state collision
- UI project runs in parallel (stateless visual tests)

### Flakiness Handling
- High retry count (4) compensates for Docker infrastructure variability
- Serial execution for state-dependent tests
- Anonymous volume renewal prevents data leakage between runs

## 3. CI/CD Analysis

### Pipeline
- Docker Compose as webServer (full stack in containers)
- HTML reporter
- Trace on first retry

### Infrastructure
- Containerized test environment (Immich server + dependencies)
- Health check-based server readiness
- Force-recreate ensures clean containers per run

## 4. Semantic Analysis

### Test Naming
- Files: `kebab-case.e2e-spec.ts` (e.g., `shared-link.e2e-spec.ts`, `photo-viewer.e2e-spec.ts`)
- **Unique `.e2e-spec.ts` extension** — distinguishes from unit tests
- Test match pattern configured explicitly in config

### Directory Semantics
- `specs/server/` vs `specs/web/` vs `ui/specs/` — separation by test target
- `maintenance/web/` — nested feature context

### Helper Files
- `generators.ts` — test data generation
- `responses.ts` — expected API response shapes
- `docker-compose.ts` — infrastructure helpers

## 5. Key Patterns

1. **Docker Compose as webServer** — full application stack containerized for testing, using Playwright's `webServer` config to orchestrate Docker
2. **Highest retry count (4)** — compensates for container infrastructure variability
3. **Mixed parallelism** — serial for state-dependent tests (web, maintenance), parallel for stateless UI tests
4. **Data fixture objects (not test.extend)** — uses plain TypeScript objects with factory methods rather than Playwright fixture injection
5. **Unique file extension** — `.e2e-spec.ts` pattern differentiates e2e from other test types
6. **Three-tier test organization** — `specs/server/`, `specs/web/`, `ui/specs/` separates by test target
7. **Environment-based webServer disable** — `PLAYWRIGHT_DISABLE_WEBSERVER` allows pre-started infrastructure
8. **CPU-proportional workers** — `Math.round(os.cpus().length * 0.75)` formula for local worker count
