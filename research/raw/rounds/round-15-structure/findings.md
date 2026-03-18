# Round 15 — Findings

**Phase:** Structure
**Focus:** Contrasting suites — freeCodeCamp, Supabase, Excalidraw

---

## Finding 1: Serial single-worker execution is viable for large suites
freeCodeCamp runs 126 test files with `workers: 1` and `fullyParallel: false`. This sacrifices speed for determinism — no state collision, no flaky parallelism issues. The tradeoff is acceptable when CI time is less critical than reliability.
- **Evidence:** freeCodeCamp playwright.config.ts (`workers: 1`, `fullyParallel: false`, 126 spec files)

## Finding 2: Custom test ID attributes break ecosystem conventions
freeCodeCamp uses `testIdAttribute: 'data-playwright-test-label'` instead of the default `data-testid`. This requires all contributors to know the custom attribute and diverges from community examples. It is the only suite among 10 analyzed that customizes this setting.
- **Evidence:** freeCodeCamp config (`testIdAttribute: 'data-playwright-test-label'`)

## Finding 3: maxFailures provides CI cost control
freeCodeCamp uses `maxFailures: process.env.CI ? 6 : undefined` to abort test runs after 6 failures. This prevents wasting CI minutes on a clearly broken build. Not observed in any Gold suite, suggesting it is a resource-optimization pattern.
- **Evidence:** freeCodeCamp config (`maxFailures: process.env.CI ? 6 : undefined`)

## Finding 4: Not all projects need Playwright — Vitest fills the gap for component-heavy apps
Supabase and Excalidraw both use Vitest + React Testing Library as their primary testing strategy. Supabase uses MSW for API mocking. Excalidraw uses snapshot testing for canvas rendering. Playwright is supplementary or absent.
- **Evidence:** Supabase tests/ (vitestSetup.ts, MSW), Excalidraw tests/ (33 .test.tsx files, __snapshots__/)

## Finding 5: Canvas-based applications challenge traditional E2E approaches
Excalidraw's canvas-based UI makes DOM-based assertions difficult. Their Playwright adoption is limited to experimental visual regression (screenshot comparison) and accessibility testing (Axe-core). Component testing provides more value than browser automation for this application type.
- **Evidence:** Excalidraw PR #9419 (visual regression POC), PR #9088 (accessibility), 0 merged Playwright tests

## Finding 6: Community-maintained E2E suites indicate organizational testing maturity gaps
Supabase's Playwright E2E tests live in `supabase-community/e2e`, separate from the main repo. This separation suggests the organization has not yet prioritized E2E testing as a first-class concern, despite having comprehensive component tests.
- **Evidence:** supabase-community/e2e repo, supabase/supabase PR #37770 (e2e cleanup)

## Finding 7: Mailpit integration demonstrates email testing patterns
freeCodeCamp uses Docker-based Mailpit as a Playwright webServer for email testing. This is the only suite that uses Playwright's webServer config for test infrastructure (email) rather than the application under test.
- **Evidence:** freeCodeCamp config webServer (`docker run ... axllent/mailpit`, port 1025, 180s timeout)

## Finding 8: Full cross-browser testing is rare in practice
freeCodeCamp tests on 5 browsers/devices (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari). Most Gold suites test only on Chromium. Cross-browser testing adds CI time but catches rendering/behavior differences.
- **Evidence:** freeCodeCamp config (5 browser projects), compared to Grafana/Cal.com/AFFiNE/Immich (Chromium only)
