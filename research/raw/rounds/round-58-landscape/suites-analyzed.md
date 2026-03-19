# Round 58 — Suites Analyzed

## Summary Table

| Suite | Lens | Key Finding |
|-------|------|-------------|
| Excalidraw | Anatomy | Vitest+RTL suite with ~85% AAA compliance; zero test.step() usage; rich helper classes (Keyboard, Pointer, UI, API) simulate E2E-like interactions at component level |
| Excalidraw | Anatomy | beforeEach resets all state (localStorage, mocks, random seed); inline setup via `API.createElement()`/`API.setElements()`; GlobalTestState singleton for shared render context |
| Excalidraw | Anatomy | Average ~5 assertions/test; range 1-25+; longest tests (history undo/redo) interleave assertions throughout rather than grouping at end |
| Excalidraw | Coverage | ~300+ tests across ~33 files; no tags, no CI differentiation; ~90% happy-path; deep on interaction mechanics (history: 40+, flip: 42, selection: 19) |
| Excalidraw | Coverage | Missing: collaboration sync, error handling/recovery, accessibility, mobile-specific, authentication |
| Excalidraw | Scaling | No sharding; single CI job on master-only; 7+ helper files; 11 fixture files; 13 snapshot files; organic growth pattern (colocated + directory tests) |
| Slate | Anatomy | Playwright suite with ~90% AAA compliance; zero test.step(); beforeEach navigation-only setup; average ~8 lines/test; uniformly 2-level nesting |
| Slate | Anatomy | Simplest setup of all three: every file uses `beforeEach(page.goto())` and nothing else; no fixtures, no factories, no API setup, no cleanup |
| Slate | Anatomy | Average ~3.3 assertions/test; many single-assertion existence checks; data-test-id attribute; pressSequentially() for rich text input |
| Slate | Coverage | 22 test files mapping 1:1 to examples; only ~35 total tests (~1.6 per file); broad but extremely shallow coverage |
| Slate | Coverage | ~95% happy-path; zero tags; CI runs same tests for push and PR; no browser differentiation in CI despite 4 configured projects |
| Slate | Coverage | Missing: error handling, collaborative editing, mobile/touch, accessibility, undo/redo depth, RTL, copy/paste edge cases |
| Slate | Scaling | Smallest suite: 35 tests, 22 files, 0 fixtures, 0 utilities; Docker setup for containerized execution; no sharding needed |
| Slate | Scaling | 4 browser projects (chromium, firefox, Pixel 5, webkit/macOS); 5 CI retries; config testIdAttribute customization |
| Supabase | Anatomy | Playwright suite with ~70% AAA compliance; zero test.step(); most sophisticated setup infrastructure of the three |
| Supabase | Anatomy | `withSetupCleanup()` async disposable pattern (TC39 Explicit Resource Management) is dominant setup mechanism; guarantees cleanup via Symbol.asyncDispose |
| Supabase | Anatomy | Five distinct setup layers: global auth project, withFileOnceSetup, withSetupCleanup, beforeEach navigation, inline API waiters |
| Supabase | Anatomy | Average ~5 assertions/test; range 1-25; longest tests reach 180 lines; assertion messages used for debugging |
| Supabase | Coverage | ~177 tests across 18 spec files; filter-bar (39) and storage (22) are largest; auth-users has only 2 tests despite criticality |
| Supabase | Coverage | ~85% happy-path, ~15% edge cases (highest ratio); SQL safety blocks, cancel operations, nullable booleans, stale filters |
| Supabase | Coverage | Zero tags; path filtering in CI (only runs when studio files change); 2 shards with fail-fast:false |
| Supabase | Scaling | 2 CI shards for ~177 tests; 15 utility files; 5 test data files; 2 Playwright projects (setup + features) |
| Supabase | Scaling | Conditional serial/parallel based on environment; testRunner() wrapper; uniqueNames() with parallelIndex for isolation |
| Supabase | Scaling | Documented testing guidelines in README; playwright.merge.config.ts for shard report merging; PR comment automation |

## Cross-Suite Key Findings

| Finding | Evidence |
|---------|----------|
| test.step() is absent from all three Gold suites | 0 instances across 73 test files and ~500+ tests |
| No tag systems anywhere | Zero @smoke/@critical/@regression in any suite |
| Setup complexity scales with product complexity | Slate: nav-only; Excalidraw: component+mock; Supabase: auth+DB+cleanup |
| Error-path coverage remains 5-15% of total tests | Behavioral edge cases exist but error-handling tests are absent |
| Sharding appears at ~100+ Playwright E2E tests | Supabase (177 tests, 2 shards) vs Slate (35 tests, 0 shards) |
| Async disposable pattern (`await using`) is a novel finding | Supabase uses TC39 Explicit Resource Management for guaranteed cleanup |
| Suite organization mirrors product architecture | Example-per-file (Slate), interaction-per-file (Excalidraw), feature-per-file (Supabase) |
| Tests-per-file varies dramatically | Slate: 1.6 avg; Excalidraw: ~9 avg; Supabase: ~9.8 avg |
| AAA compliance inversely correlates with test length | Short tests (Slate ~8 lines): 90% AAA; Long tests (Supabase ~40 lines): 70% AAA |

## Suite Metadata

| Suite | GitHub | Stars | Framework | Test Count | File Count | Shards |
|-------|--------|-------|-----------|-----------|------------|--------|
| Excalidraw | excalidraw/excalidraw | ~118,900 | Vitest + React Testing Library | ~300+ | ~33 | 0 |
| Slate | ianstormtaylor/slate | ~30,800 | Playwright Test | ~35 | 22 | 0 |
| Supabase | supabase/supabase | ~99,000 | Playwright Test (extended) | ~177 | 18 | 2 |

## Key Files Analyzed

### Excalidraw
- `packages/excalidraw/tests/selection.test.tsx` — 19 tests, selection mechanics
- `packages/excalidraw/tests/arrowBinding.test.tsx` — 24 tests, binding toggle logic
- `packages/excalidraw/tests/history.test.tsx` — 40+ tests, singleplayer + multiplayer undo/redo
- `packages/excalidraw/tests/dragCreate.test.tsx` — 11 tests, shape creation
- `packages/excalidraw/tests/move.test.tsx` — 3 tests, element movement
- `packages/excalidraw/tests/flip.test.tsx` — 42 tests (14 skipped), transform operations
- `packages/excalidraw/tests/shortcuts.test.tsx` — 1 test, keyboard shortcuts
- `packages/excalidraw/tests/contextmenu.test.tsx` — 21 tests, context menu
- `packages/excalidraw/tests/library.test.tsx` — 7 tests, library management
- `packages/excalidraw/tests/excalidraw.test.tsx` — 24 tests, component rendering
- `packages/excalidraw/tests/regressionTests.test.tsx` — ~60+ tests, regression coverage
- `packages/excalidraw/tests/helpers/api.ts` — API helper class
- `packages/excalidraw/tests/helpers/ui.ts` — Keyboard, Pointer, UI helper classes
- `packages/excalidraw/tests/test-utils.ts` — Render helpers, custom matchers
- `.github/workflows/test.yml` — CI config

### Slate
- `playwright/integration/examples/richtext.test.ts` — 3 tests
- `playwright/integration/examples/tables.test.ts` — 1 test
- `playwright/integration/examples/inlines.test.ts` — 2 tests (1 skipped)
- `playwright/integration/examples/check-lists.test.ts` — 1 test
- `playwright/integration/examples/mentions.test.ts` — 3 tests
- `playwright/integration/examples/markdown-shortcuts.test.ts` — 3 tests
- `playwright/integration/examples/hovering-toolbar.test.ts` — 2 tests
- `playwright/integration/examples/images.test.ts` — 1 test
- `playwright/integration/examples/plaintext.test.ts` — 1 test
- `playwright/integration/examples/code-highlighting.test.ts` — 3 parameterized tests
- `playwright/integration/examples/editable-voids.test.ts` — 3 tests
- `playwright/integration/examples/embeds.test.ts` — 1 test
- `playwright/integration/examples/huge-document.test.ts` — 1 test
- `playwright/integration/examples/placeholder.test.ts` — 2 tests
- `playwright/integration/examples/read-only.test.ts` — 1 test
- `playwright/integration/examples/shadow-dom.test.ts` — 3 tests
- `playwright/integration/examples/iframe.test.ts` — 1 test
- `playwright/integration/examples/styling.test.ts` — 2 tests
- `playwright/integration/examples/forced-layout.test.ts` — 2 tests
- `playwright/integration/examples/select.test.ts` — 1 test
- `playwright.config.ts` — Playwright config (4 projects)
- `.github/workflows/ci.yml` — CI config

### Supabase
- `e2e/studio/features/table-editor.spec.ts` — 18 tests
- `e2e/studio/features/sql-editor.spec.ts` — 10 tests
- `e2e/studio/features/storage.spec.ts` — 22 tests
- `e2e/studio/features/database.spec.ts` — 19 tests
- `e2e/studio/features/rls-policies.spec.ts` — 9 tests
- `e2e/studio/features/auth-users.spec.ts` — 2 tests
- `e2e/studio/features/filter-bar.spec.ts` — 39 tests
- `e2e/studio/features/cron-jobs.spec.ts` — 11 tests
- `e2e/studio/features/realtime-inspector.spec.ts` — 8 tests
- `e2e/studio/features/home.spec.ts` — 1 test
- `e2e/studio/features/connect.spec.ts` — 3 tests
- `e2e/studio/features/logs.spec.ts` — 2 tests
- `e2e/studio/features/database-webhooks.spec.ts` — 4 tests
- `e2e/studio/features/queue-table-operations.spec.ts` — 17 tests
- `e2e/studio/features/api-access-toggle.spec.ts` — 4 tests
- `e2e/studio/features/index-advisor.spec.ts` — 2 tests
- `e2e/studio/features/assistant.spec.ts` — 1 test
- `e2e/studio/features/status-page-banner.spec.ts` — 1 test
- `e2e/studio/features/log-drains.spec.ts` — 4 tests
- `e2e/studio/features/_global.setup.ts` — Global setup project
- `e2e/studio/playwright.config.ts` — Playwright config (2 projects)
- `e2e/studio/playwright.merge.config.ts` — Shard report merge config
- `e2e/studio/utils/test.ts` — Custom test fixture
- `e2e/studio/utils/table-helpers.ts` — Table interaction helpers
- `e2e/studio/README.md` — Testing guidelines
- `.github/workflows/studio-e2e-test.yml` — CI config (2 shards)
