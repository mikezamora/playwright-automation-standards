# Suite Analysis: vasu31dev/playwright-ts

**Repository:** https://github.com/vasu31dev/playwright-ts
**Application type:** Framework template / boilerplate
**Test framework:** @playwright/test
**Quality tier:** Silver (demonstrates framework patterns, not production app)

---

## Configuration

| Setting | Value |
|---------|-------|
| Projects | 1 active (Chromium 1600x1000), 6+ commented out |
| Retries | 2 (CI) / 0 (local) |
| Workers | 3 (CI) / 6 (local) |
| Test timeout | Imported from constants module |
| Expect timeout | Imported from constants module |
| Action timeout | Imported from constants module |
| Navigation timeout | Imported from constants module |
| fullyParallel | false |
| forbidOnly | true (CI) |
| testIdAttribute | `qa-target` |
| Base URL | `process.env.BASE_URL` or `https://www.saucedemo.com/` |
| Test directory | `./tests` |
| Trace | `retain-on-failure` |
| Screenshot | `only-on-failure` |
| Video | Not enabled |
| HTTPS errors | Ignored |
| Web security | Disabled |

## Notable Patterns

### GlobalSetup and GlobalTeardown Files
Uses `require.resolve()` to reference dedicated setup/teardown modules — the traditional approach before setup projects became recommended. Shows the legacy globalSetup pattern still in active use.

### Custom Logger Reporter
Three-reporter stack: custom logger (`./src/vasu-playwright/setup/custom-logger.ts`) + HTML + dot. The custom logger provides real-time test progress output beyond what built-in reporters offer.

### Externalized Timeout Constants
All timeout values imported from a shared constants module rather than hardcoded in config. Enables single-source-of-truth for timeout tuning across the framework.

### CloudFlare Zero-Trust Headers
`extraHTTPHeaders` includes `CF-Access-Client-Id` and `CF-Access-Client-Secret` from environment variables — demonstrates testing behind zero-trust proxies.

### Conditional WebServer
WebServer config only activates when base URL contains `localhost` — avoids starting a dev server when testing against deployed environments.

### Inverted Worker Count
More workers locally (6) than in CI (3) — opposite of most suites. Assumes developer machines have more resources than CI runners.

### Load State Configuration
Uses `waitForLoadState: 'domcontentloaded'` — faster than default `load` which waits for all resources. Optimizes test speed for pages with heavy asset loading.

## Architecture Assessment

This is a framework template rather than a production test suite. It demonstrates "framework-first" patterns: externalized constants, custom reporters, global setup/teardown files, and CloudFlare integration. The commented-out projects (Firefox, WebKit, mobile, Edge, Chrome channel) serve as a menu of options for adopters. The `fullyParallel: false` default is conservative — appropriate for a template where adopters may not understand parallel execution implications.
