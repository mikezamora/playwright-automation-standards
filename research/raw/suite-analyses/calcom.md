# Suite Analysis: calcom/cal.com

**Repository:** https://github.com/calcom/cal.com
**Suite Location:** `/apps/web/playwright/` (tests) + `/playwright.config.ts` (root config)
**Tier:** Gold
**Round:** 13-14 (Structure Deep Dive)

---

## 1. Architecture Analysis

### Directory Structure
```
/playwright.config.ts              # Root config, 7 projects
/apps/web/playwright/
  apps/                            # App-specific tests
  auth/                            # Authentication flows
  eventType/                       # Event type CRUD
  fixtures/                        # users.ts, emails.ts, etc.
  lib/                             # Helper functions
  oauth/                           # OAuth integration
  organization/                    # Org features
  settings/                        # Settings pages
  team/                            # Team features
  icons.e2e.ts-snapshots/          # Visual regression baselines
  integrations.e2e.ts-snapshots/
  booking-pages.e2e.ts             # + 73 total test files
  ...
```

### playwright.config.ts
- **7 projects**: `@calcom/web`, `@calcom/app-store`, `@calcom/embed-core`, `@calcom/embed-react`, plus Firefox/WebKit/mobile variants for embeds
- `fullyParallel: true`
- `retries: process.env.CI ? 2 : 0`
- Workers: dynamic based on CPU count (or 1 when `PWDEBUG`)
- `maxFailures: process.env.CI && !headless ? 10 : undefined`

### Timeout Architecture (CI vs. Local)
- Test timeout: **60s CI / 240s local**
- Navigation timeout: **10s CI / 120s local**
- Action timeout: **10s CI / 120s local**
- Expect timeout: **10s CI / 120s local**
- Rationale in code: "Dev Server on local can be slow to start up"

### POM / Fixtures
- **Hybrid POM + Fixtures pattern** — factory-based user fixture via `createUsersFixture()`
- `fixtures/users.ts` exports rich factory with methods: `create()`, `get()`, `set()`, `delete()`, `deleteAll()`, `logout()`, `apiLogin()`, `buildForSignup()`
- Scenario-based configuration: team/org creation, feature flags, event types, routing forms
- Internal store pattern for centralized cleanup across parallel workers

### Web Servers (3 in parallel)
1. Main app (`@calcom/web`) on port 3000
2. Embed-core on port 3100 (conditional)
3. Embed-react on port 3101 (conditional)
- All use `reuseExistingServer: !process.env.CI`
- 60s startup timeout

### Environment Config
- `NEXT_PUBLIC_WEBAPP_URL` for baseURL
- `NEXT_PUBLIC_IS_E2E=1` — self-documenting env flag
- Chrome defaults: timezone `Europe/London`, locale `en-US`, clipboard permissions

## 2. Validation Analysis

### Assertion Patterns
- `expect(page).toHaveURL()` — URL state validation
- `expect(element).toBeVisible()` / `toHaveText()` — DOM assertions
- `expect(response?.status()).not.toBe(404)` — HTTP response validation
- `expect(count).toBeGreaterThanOrEqual(2)` — count-based assertions

### Locator Strategies
- Primary: `data-testid` selectors (e.g., `'[data-testid="event-type-link"]'`)
- Secondary: `[name="email"]`, meta tag selectors
- Content matching: `:has-text("Opt in")`
- Nth selection for lists: `.nth(0)`, `.nth(1)`

### Flakiness Handling
- `test.skip()` with TODO comments for known issues
- `test.setTimeout()` for individual slow tests
- `test.describe.configure({ mode: "parallel" })` for explicit parallelism

### Test Isolation
- User factory creates unique users per test with auto-cleanup
- `test.afterEach(() => users.deleteAll())` pattern
- Separate browser contexts for embed tests

## 3. CI/CD Analysis

### Reporters
- **Blob** reporter in CI (for merge/sharding support)
- **HTML** reporter with `open: 'never'`
- **JUnit XML** for CI integration
- **List** reporter locally

### Artifacts
- Screenshots on failure
- Trace on first retry

### Multi-Package Testing
- Monorepo-aware projects test across `apps/web`, `packages/app-store`, `packages/embeds`
- Each embed variant tested on Firefox, WebKit, and iPhone 13 (mobile)

## 4. Semantic Analysis

### Test Naming
- Files: `kebab-case.e2e.ts` (e.g., `booking-pages.e2e.ts`)
- Describe blocks: domain-scoped (e.g., `'free user'`, `'pro user'`, `'Booking round robin event'`)
- Test names: user-centric phrases (e.g., `'can reschedule a booking'`, `'Cannot book same slot multiple times'`)

### Test Steps
- `test.step()` used for complex multi-phase tests
- `test.describe.configure()` for execution mode control

### Helper Functions
- Domain-specific: `bookFirstEvent()`, `bookTimeSlot()`, `confirmBooking()`, `selectFirstAvailableTimeSlotNextMonth()`
- Imported from `./lib/fixtures` and `./lib/testUtils`

## 5. Key Patterns

1. **Most sophisticated fixture factory observed** — `createUsersFixture()` supports scenario-based creation with teams, orgs, feature flags, event types, and routing forms
2. **Inverted timeout model** — longer timeouts locally (240s), shorter in CI (60s), explicitly rationalized in code comments
3. **Triple web server** — runs 3 independent servers for main app + embed variants
4. **Monorepo-aware projects** — 7 projects spanning `apps/` and `packages/` directories
5. **Cross-browser embed testing** — embed components tested on Chromium, Firefox, WebKit, and mobile
6. **Visual regression snapshots** — `-snapshots/` directories alongside test files for icon/integration screenshots
7. **Cookie-based configuration** — `calcom-timezone-dialog=1` set via cookies to suppress UI prompts
