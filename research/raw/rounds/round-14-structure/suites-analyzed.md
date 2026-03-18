# Round 14 — Suites Analyzed

**Phase:** Structure
**Focus:** Deep dive on gold-standard suites (batch 2)
**Date:** 2026-03-18

## Suites Analyzed

### 1. immich-app/immich
- **Config:** 3 projects, Docker Compose webServer, mixed parallelism
- **Key files examined:** `e2e/playwright.config.ts`, `e2e/src/` directory structure, `e2e/src/fixtures.ts`
- **Analysis:** [research/raw/suite-analyses/immich.md](../../suite-analyses/immich.md)

### 2. microsoft/playwright
- **Config:** 2 projects, meta-testing architecture, triple CI reporter
- **Key files examined:** `tests/playwright-test/playwright.config.ts`, `tests/` directory structure, `tests/playwright-test/` file listing (106 files)
- **Analysis:** [research/raw/suite-analyses/playwright.md](../../suite-analyses/playwright.md)

## Method
- Fetched playwright.config.ts for each suite
- Examined directory structures for architecture patterns
- Analyzed test file naming and organization patterns
- Cross-referenced fixture patterns with Round 13 findings
