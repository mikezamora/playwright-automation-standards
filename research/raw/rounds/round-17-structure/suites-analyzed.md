# Round 17 — Suites Analyzed

**Phase:** Structure
**Focus:** Deep dive on Playwright configuration patterns (batch 1)
**Date:** 2026-03-18

## Suites Analyzed

### 1. grafana/grafana (config deep dive)
- **Config:** 31 projects, `withAuth()` helper function, setup/teardown project chains
- **Key files examined:** `playwright.config.ts` (root-level), project definitions, reporter config, webServer conditional
- **Key config values:** `fullyParallel: true`, `retries: 1` (CI) / `0` (local), `workers: 4` (CI) / `undefined` (local), `expect.timeout: 10_000`
- **Analysis:** [research/raw/suite-analyses/grafana.md](../../suite-analyses/grafana.md)

### 2. ianstormtaylor/slate (new suite)
- **Config:** 3-4 projects, conditional platform projects, rich editor testing
- **Key files examined:** `playwright.config.ts`, project definitions for Chromium/Firefox/Mobile + conditional WebKit
- **Key config values:** `retries: 5` (CI) / `2` (local), `test timeout: 20s`, `expect timeout: 8s`, `action timeout: 0` (unlimited), `testIdAttribute: 'data-test-id'`
- **Analysis:** [research/raw/suite-analyses/slate.md](../../suite-analyses/slate.md)

### 3. vasu31dev/playwright-ts (framework template)
- **Config:** Single active project (Chromium), globalSetup/globalTeardown files, custom logger reporter
- **Key files examined:** `playwright.config.ts`, global setup/teardown paths, custom reporter setup
- **Key config values:** `fullyParallel: false`, `retries: 2` (CI) / `0` (local), `workers: 3` (CI) / `6` (local), custom CloudFlare headers, `testIdAttribute: 'qa-target'`
- **Analysis:** [research/raw/suite-analyses/playwright-ts-template.md](../../suite-analyses/playwright-ts-template.md)

## Method
- Fetched playwright.config.ts for each suite
- Compared project definition strategies across different scales
- Analyzed reporter, timeout, and retry configurations
- Cross-referenced with prior round findings for configuration pattern catalog
