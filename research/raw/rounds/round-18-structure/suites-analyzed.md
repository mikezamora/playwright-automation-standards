# Round 18 — Suites Analyzed

**Phase:** Structure
**Focus:** Deep dive on Playwright configuration patterns (batch 2) — environment-aware config, webServer, global setup/teardown
**Date:** 2026-03-18

## Suites Re-Analyzed (config focus)

### 1. calcom/cal.com (config deep dive)
- **Config focus:** Triple webServer, environment-aware timeouts, multi-reporter stacking
- **Key config values:** `webServer: [port 3000, 3100, 3101]`, `reuseExistingServer: !process.env.CI`, `timeout: process.env.CI ? 60_000 : 240_000`
- **Analysis:** [research/raw/suite-analyses/calcom.md](../../suite-analyses/calcom.md)

### 2. toeverything/AFFiNE (config deep dive)
- **Config focus:** Monorepo workspace configs, GitHub reporter in CI, video capture
- **Key config values:** `reporter: process.env.CI ? 'github' : 'list'`, `video: 'on-first-retry'`, `timeout: process.env.CI ? 50_000 : 30_000`, `workers: '50%'`
- **Analysis:** [research/raw/suite-analyses/affine.md](../../suite-analyses/affine.md)

### 3. immich-app/immich (config deep dive)
- **Config focus:** Docker Compose webServer, CPU-based workers, highest retry count
- **Key config values:** `webServer: 'docker compose up'`, `workers: Math.round(os.cpus().length * 0.75)`, `retries: process.env.CI ? 4 : 0`
- **Analysis:** [research/raw/suite-analyses/immich.md](../../suite-analyses/immich.md)

### 4. Playwright official docs (global setup/teardown patterns)
- **Config focus:** Project dependencies vs globalSetup, teardown projects, setup file patterns
- **Key patterns:** Setup project with `testMatch: /.*\.setup\.ts/`, teardown project via `teardown` property, `dependencies` array
- **Source:** https://playwright.dev/docs/test-global-setup-teardown

## Method
- Re-analyzed config files with specific focus on environment branching logic
- Cataloged webServer configuration variants across suites
- Compared global setup approaches: project dependencies vs globalSetup files
- Extracted timeout hierarchy patterns and environment-specific overrides
