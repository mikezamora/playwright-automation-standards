# Round 15 — Suites Analyzed

**Phase:** Structure
**Focus:** Deep dive on contrasting suites (batch 1)
**Date:** 2026-03-18

## Suites Analyzed

### 1. freeCodeCamp/freeCodeCamp
- **Config:** 6 projects (5 browsers + setup), single worker, serial execution
- **Key files examined:** `e2e/playwright.config.ts`, `e2e/` directory structure, `.github/workflows/e2e-playwright.yml`
- **Analysis:** [research/raw/suite-analyses/freecodecamp.md](../../suite-analyses/freecodecamp.md)

### 2. supabase/supabase
- **Config:** Vitest-primary, community Playwright e2e, MSW-based mocking
- **Key files examined:** `apps/studio/tests/` directory, README, fixture and helper files
- **Analysis:** [research/raw/suite-analyses/supabase.md](../../suite-analyses/supabase.md)

### 3. excalidraw/excalidraw
- **Config:** Vitest + React Testing Library, Playwright POC only
- **Key files examined:** `packages/excalidraw/tests/` directory, `excalidraw-app/tests/`, PR #9419 (visual regression POC)
- **Analysis:** [research/raw/suite-analyses/excalidraw.md](../../suite-analyses/excalidraw.md)

## Method
- Fetched config files and directory structures
- Examined CI workflows for pipeline architecture
- Compared patterns against Round 13-14 gold standard findings
- Documented divergences and rationales
