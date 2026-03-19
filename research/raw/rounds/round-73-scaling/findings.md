# Round 73 — Utility Packages and Fixture Scaling

**Phase:** Scaling Organization Deep Dive
**Date:** 2026-03-19
**Focus:** How suites scale their shared test infrastructure — published packages, fixture architectures, page object layering

---

## 1. WordPress/Gutenberg: Published Test Utilities Package

**Package:** `@wordpress/e2e-test-utils-playwright` (62 source files)
**Published to:** npm (consumed by WordPress plugin ecosystem)

### Package Architecture

```
packages/e2e-test-utils-playwright/src/
  admin/           # Admin panel navigation and interaction utilities
  editor/          # Block editor operations (insert, select, transform)
  lighthouse/      # Lighthouse performance audit integration
  metrics/         # Performance metrics collection
  page-utils/      # General page interaction helpers
  request-utils/   # HTTP request and API testing utilities
  config.ts        # Configuration constants
  index.ts         # Barrel export file
  test.ts          # Custom test fixture definitions
  types.ts         # TypeScript type definitions
```

### Export Surface

The `index.ts` barrel file exports 8 modules:
1. **Admin** — Admin panel navigation (login, sidebar, settings)
2. **Editor** — Block editor operations (the core abstraction)
3. **PageUtils** — General page interactions (click, fill, wait patterns)
4. **RequestUtils** — API-level test data creation and cleanup
5. **Metrics** — Performance measurement utilities
6. **Lighthouse** — Lighthouse integration for performance budgets
7. **test & expect** — Custom Playwright test and expect instances with fixtures pre-wired
8. **Types** — Full TypeScript type surface

### Scaling Implications

**The published-package pattern** is the most extreme form of test infrastructure scaling:
- Test utilities become a versioned, documented API
- Breaking changes require semver-aware releases
- Consumers (WordPress plugins) can write Playwright tests using WordPress-specific abstractions without understanding internal implementation
- The `test.ts` file pre-wires all fixtures so consumers write `test('...', ({ admin, editor, requestUtils }) => { ... })` — zero boilerplate

**Cost:** Maintaining a published test utilities package requires:
- API stability (breaking changes affect external consumers)
- Documentation (62 files need usage guides)
- Versioning discipline (tied to `@wordpress/scripts` release cycle)
- Test coverage of the utilities themselves

**When justified:** Only when the test infrastructure serves an ecosystem (plugins, themes, extensions) — NOT for single-product test suites.

---

## 2. n8n: Layered Fixture and Service Architecture

**Location:** `packages/testing/playwright/`
**Scale:** 174 specs, 7 CI workflows

### Directory Architecture

```
packages/testing/playwright/
  composables/     # Multi-page interaction patterns (workflow execution)
  config/          # Test setup, constants, test user definitions
  fixtures/        # Custom Playwright fixtures
    base.ts        # Core fixture set (n8n page, auth, DB)
    cloud-only.ts  # Cloud-specific fixture extensions
  pages/           # Page Object Models
  services/        # API helpers (e2e-controller, REST, workflow CRUD)
  utils/           # Pure utility functions
  workflows/       # JSON workflow fixtures for import
  expectations/    # Recorded HTTP request/response mocks
  reporters/       # Custom test reporters
  scripts/         # Infrastructure scripts
  docs/            # Documentation
  tests/           # Test specifications
  playwright.config.ts
  playwright-projects.ts    # Separated project definitions
  global-setup.ts
  global-teardown.ts
```

### Layered Abstraction Model

n8n implements a **5-layer fixture/service architecture:**

| Layer | Directory | Purpose | Example |
|-------|-----------|---------|---------|
| 1. Infrastructure | `config/`, `global-setup.ts` | Environment bootstrap, DB setup | DB reset per worker |
| 2. Services | `services/` | API-level operations | Workflow CRUD via REST |
| 3. Fixtures | `fixtures/` | Playwright fixture injection | `n8n` composite fixture |
| 4. Page Objects | `pages/` | UI interaction encapsulation | Canvas, Sidebar, Modal |
| 5. Composables | `composables/` | Cross-page workflow patterns | Execute-and-verify workflow |

**Key insight: The composables layer.** This is unique to n8n — it sits above page objects and orchestrates multi-page interactions. A composable like "execute workflow and verify output" might touch the canvas page, the execution panel page, and the output viewer page. This prevents tests from containing multi-page orchestration logic.

### Dynamic Project Generation

The `playwright-projects.ts` file (separated from main config) generates 5-7 projects dynamically:

**Local mode** (when `BACKEND_URL` is set):
- `e2e`: Single project, excludes container-only tests via `grepInvert`

**Container mode** (CI):
- `{name}:e2e` × 4 variants: sqlite, postgres, queue, multi-main
- `{name}:infrastructure` × 4 variants (same backends)
- `benchmark-{name}:infrastructure` × 3 variants: direct, queue, queue-tuned
- `cli-workflows`, `performance`

**Insight:** Projects are generated based on **infrastructure topology**, not features. This is the opposite of Grafana (feature-based projects). n8n tests the same features across different backends (sqlite vs postgres) and deployment modes (single vs multi-main).

### Fixture Segmentation

n8n splits fixtures into two files:
- `base.ts`: Core fixtures (n8n page, auth, DB, worker isolation)
- `cloud-only.ts`: Cloud-specific fixtures that extend base

This is a **fixture tier pattern** — base fixtures for all tests, extended fixtures for specific environments. Tests opt into the fixture tier they need.

---

## 3. Ghost CMS: Multi-App Test Distribution

**Location:** `ghost/core/test/e2e-browser/`
**Scale:** 81 specs, 6+ configs across the monorepo

### Directory Structure

```
ghost/core/test/e2e-browser/
  admin/       # Admin interface tests
  portal/      # Portal (membership) feature tests
  fixtures/    # Test data and setup
  utils/       # Testing utilities
  global-setup.js
  README.md
```

### Multi-App Distribution Pattern

Ghost is a monorepo with multiple applications:
- `ghost/admin` — Admin interface (Ember.js)
- `ghost/core` — Backend + E2E browser tests
- `ghost/i18n` — Internationalization
- Other packages

E2E tests live in `ghost/core/test/e2e-browser/` but test across multiple Ghost applications. The test runner must build all Ghost apps from local source before running (`yarn test:browser` from repo root).

**Setup pattern:** `beforeAll`/`afterAll` manage Ghost instances. Each `describe` block starts a new Ghost instance with specific fixtures — no test-level isolation, but describe-level isolation.

**Scaling insight:** Ghost uses **describe-level instance creation** rather than per-test or per-worker isolation. Each `describe` block is effectively an isolated test environment. This is coarser-grained than n8n's per-worker container isolation but simpler to implement.

---

## 4. Element Web: Container-Per-Worker Isolation at Scale

**Source:** `element-hq/element-web` + `element-hq/matrix-react-sdk`
**Scale:** 209 specs, multi-browser matrix

### Configuration Pattern

Element Web's Playwright setup uses:
- **Crypto implementation projects:** `Rust Crypto` project for testing Rust-based encryption
- **Container management:** Docker containers for Matrix homeserver (Synapse) managed per-test
- **CI reporters:** GitHub reporter in CI, default locally
- **Base URL:** `http://localhost:8080` with `webServer` command differing CI vs local

### Multi-Browser Matrix (CI-Level)

Element Web achieves multi-browser coverage not through Playwright projects but through **CI matrix strategy**:
- GitHub Actions matrix defines browser variants
- Each CI job runs a different browser
- Playwright config stays simple (single project per run)

This is a hybrid of the Grafana (config-level) and Next.js (CI-level) approaches.

### Container Isolation Innovation

Element Web's most notable scaling pattern is container-per-worker for the Matrix homeserver:
- Each Playwright worker gets a fresh Synapse container
- Containers are ephemeral (created on test start, destroyed on finish)
- This eliminates state leakage between parallel test workers
- Docker Compose orchestrates the full stack (Synapse + Element Web)

---

## 5. Fixture Scaling Patterns (Cross-Suite Synthesis)

### Fixture Complexity Correlates with Suite Scale

| Suite | Specs | Fixture Files | Fixture Layers | Avg Test Length |
|-------|-------|---------------|----------------|----------------|
| n8n | 174 | 2 (base + cloud) | 5 (infra→service→fixture→POM→composable) | 10-30 lines |
| Grafana | 163+ | 25+ (plugin-e2e) | 3 (auth→config→test) | 15-40 lines |
| Ghost | 81 | Factories + utils | 3 (factory→util→test) | 20-50 lines |
| WordPress | 278 | 62 (published pkg) | 4 (admin→editor→page→request) | 15-80 lines |
| Rocket.Chat | 170 | POM-heavy | 2 (POM→test) | 30-80 lines |

**Key correlation:** Suites with deeper fixture layering (n8n: 5 layers, WordPress: 4 layers) achieve shorter average test length. Rocket.Chat's shallow fixture investment (POM-only) correlates with the longest tests.

### Four Fixture Scaling Strategies

**Strategy 1: Published Package (WordPress)**
- Fixtures as npm package with versioned API
- Best for: Ecosystem platforms (plugins, extensions)
- Cost: API stability, documentation, versioning
- Scale: Any size, but only justified at ecosystem scale

**Strategy 2: Layered Fixtures (n8n)**
- Multiple fixture tiers (base → cloud-only)
- Composables layer above page objects
- Best for: Products with infrastructure variants (multi-DB, multi-deployment)
- Cost: Layer management, import complexity
- Scale: 100+ tests

**Strategy 3: Factory Pattern (Ghost)**
- Data factories with dual persistence adapters
- `beforeAll`/`afterAll` manage environment per describe block
- Best for: Content-heavy applications with complex test data
- Cost: Factory maintenance, slower describe-level isolation
- Scale: 50-200 tests

**Strategy 4: Config Helpers (Grafana)**
- `withAuth()` and `baseConfig` spreading
- Project-level fixture injection via Playwright projects
- Best for: Large suites with many independent feature domains
- Cost: Config file complexity
- Scale: 200+ tests

---

## Emerging Standards (S11 Evidence)

### S11: Fixture & Dependency Scaling

**S11.1: Fixture investment should be proportional to suite scale.**
Evidence from 5 suites shows fixture depth inversely correlates with test length. At 100+ tests, 3+ fixture layers are justified. At 200+ tests, 4+ layers or a composables pattern is beneficial.

**S11.2: Separate fixture tiers by environment scope.**
n8n's `base.ts` + `cloud-only.ts` pattern. Tests opt into the fixture tier they need. Prevents cloud-specific dependencies from contaminating base test runs.

**S11.3: Published test utilities packages are justified only for ecosystem platforms.**
WordPress is the only suite where published utilities make sense — because external consumers (plugins) need standardized test abstractions. Single-product suites should keep fixtures internal.

**S11.4: The composables layer (above POMs) reduces test complexity at scale.**
n8n's composables pattern encapsulates multi-page workflows. This is the missing layer in most suites — tests often contain cross-page orchestration that should be abstracted.
