# Suite Analysis: toeverything/AFFiNE

**Repository:** https://github.com/toeverything/AFFiNE
**Suite Location:** `/tests/affine-local/` (and 8 sibling test packages)
**Tier:** Gold
**Round:** 13-14 (Structure Deep Dive)

---

## 1. Architecture Analysis

### Directory Structure
```
/tests/
  affine-cloud-copilot/        # Cloud AI feature tests
  affine-cloud/                # Cloud-specific tests
  affine-desktop-cloud/        # Desktop + cloud integration
  affine-desktop/              # Desktop app tests
  affine-local/                # Local-only feature tests (38 specs)
    e2e/                       # Test spec files
      blocksuite/              # Editor component tests
    playwright.config.ts       # Per-package config
  affine-mobile/               # Mobile app tests
  blocksuite/                  # BlockSuite component tests
  fixtures/                    # Shared test data
  kit/                         # Shared test utilities (@affine-test/kit)
```

### playwright.config.ts (affine-local)
- `testDir: './e2e'`
- `fullyParallel: true`
- `workers: process.env.CI ? '50%' : 4`
- `retries: process.env.CI ? 3 : 1`
- `timeout: process.env.CI ? 50_000 : 30_000`
- `actionTimeout: 5_000`
- `viewport: { width: 1440, height: 800 }`
- `locale: 'en-US'`
- `permissions: ['clipboard-read', 'clipboard-write']`
- `trace: 'retain-on-failure'`
- `video: 'on-first-retry'`

### POM / Fixtures
- **Shared kit package** (`@affine-test/kit/playwright`) — centralized test utilities
- Helper functions imported: `openHomePage()`, `clickNewPageButton()`, `getAllPage()`, `waitForEditorLoad()`
- No class-based POM — uses function-based page interactions

### Web Server
- Command: `yarn run -T affine dev -p @affine/web`
- URL: `http://localhost:8080`
- Startup timeout: 120s
- `reuseExistingServer: !process.env.CI`
- Coverage env var defaults to false

### Multi-Package Test Organization
- 9 test packages covering: local, cloud, desktop, mobile, cloud+copilot, desktop+cloud, blocksuite, kit
- Each package has its own `playwright.config.ts`
- Shared fixtures in `/tests/fixtures/`
- Shared utilities in `/tests/kit/`

## 2. Validation Analysis

### Assertion Patterns
- `expect(element).toBeVisible()` — primary visibility check
- `expect(count).toBe(0)` / `toBeGreaterThan(0)` — count validation
- `expect(element).toHaveText('2 doc(s) selected')` — text content
- `expect(page).toBeURL(url => url.pathname.endsWith('tag'))` — URL predicate matching

### Locator Strategies
- `data-testid`: primary (e.g., `'doc-list-item'`, `'floating-toolbar'`, `'edit-tag-input'`)
- `getByRole('cell')`, `getByRole('button')` — semantic role selectors
- `getByText('Delete 2 docs?')` — text content selectors
- CSS attribute: `[data-select-mode="true"]` — state-based selectors

### Retry/Timeout Config
- 3 retries in CI, 1 locally (more aggressive than most)
- 50s timeout in CI, 30s locally (inverted from cal.com pattern)
- 5s action timeout (tight)
- Video on first retry (additional diagnostic)

### Flakiness Handling
- Higher retry count (3 in CI) suggests acceptance of some flakiness
- Video capture on retry provides diagnostic evidence

## 3. CI/CD Analysis

### Reporter
- `github` reporter in CI (inline PR annotations)
- `list` reporter locally

### Artifacts
- Trace: retain-on-failure
- Video: on-first-retry
- Screenshots: not explicitly configured (Playwright default)

### Worker Scaling
- CI: `'50%'` of available CPUs (string percentage)
- Local: 4 workers (fixed)

## 4. Semantic Analysis

### Test Naming
- Files: `kebab-case.spec.ts` (e.g., `all-page.spec.ts`, `local-first-new-page.spec.ts`)
- No describe blocks — flat test structure
- Test names: feature-oriented phrases (e.g., `'all page can create new page'`, `'enable selection and use ESC to disable selection'`)

### Naming Conventions
- `local-first-` prefix on many files — communicates offline-first architecture
- `blocksuite/` subdirectory — editor component namespace

### Documentation
- Self-documenting through package names (`affine-local`, `affine-cloud`, `affine-desktop`)
- Test utility naming: `openHomePage()`, `clickSideBarAllPageButton()` — verb+target pattern

## 5. Key Patterns

1. **Multi-package test architecture** — 9 separate test packages organized by deployment target (local/cloud/desktop/mobile), each with its own playwright config
2. **Shared kit pattern** — `@affine-test/kit` provides centralized test utilities imported across all packages
3. **No POM classes** — uses function-based helpers instead of class-based page objects
4. **GitHub reporter in CI** — inline failure annotations on PRs (unique among analyzed suites)
5. **Percentage-based worker scaling** — `'50%'` string format for CPU-proportional allocation
6. **Video on retry** — captures video only on retried tests for diagnostic efficiency
7. **Flat test structure** — no `describe` nesting, just flat `test()` calls with descriptive names
8. **Deployment-target segmentation** — test packages mirror application deployment topology
