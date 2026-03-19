# Round 65 Suites Analyzed

## Grafana (grafana/grafana)
- **Repository:** https://github.com/grafana/grafana
- **Test location:** `e2e-playwright/` (dashboard-cujs/, panels-suite/)
- **Framework:** Playwright via `@grafana/plugin-e2e` (published package)
- **Files analyzed:**
  - `dashboard-cujs/dashboard-view.spec.ts` (233 lines) — dashboard viewing CUJ with 6 steps
  - `dashboard-cujs/scope-cujs.spec.ts` (164 lines) — scope selection CUJ with 5 steps
  - `dashboard-cujs/adhoc-filters-cujs.spec.ts` (281 lines) — ad-hoc filtering CUJ with 6 steps
  - `dashboard-cujs/dashboard-navigation.spec.ts` (168 lines) — navigation CUJ with 4 steps
  - `panels-suite/heatmap.spec.ts` (148 lines) — heatmap rendering + x-axis panning
  - `panels-suite/canvas-icon-mappings.spec.ts` (105 lines) — canvas icon mapping validation
- **Quality tier:** Gold
- **Key patterns:** Numbered test.step() in CUJ tests, feature toggle configuration, conditional mocking, expect.soft()

## WordPress/Gutenberg (WordPress/gutenberg)
- **Repository:** https://github.com/WordPress/gutenberg
- **Test location:** `test/e2e/specs/editor/`
- **Framework:** Playwright via `@wordpress/e2e-test-utils-playwright` (published package)
- **Files analyzed:**
  - `various/writing-flow.spec.js` (1,318 lines, 40+ tests) — keyboard nav, line breaks, paragraphs
  - `blocks/heading.spec.js` (565 lines) — heading block creation, transforms, styling
  - `blocks/paragraph.spec.js` (464 lines) — paragraph rendering, drag-and-drop
  - `various/block-deletion.spec.js` (402 lines) — block removal via menu, keyboard, multi-select
  - `various/block-grouping.spec.js` (376 lines) — block grouping/ungrouping, attribute preservation
- **Quality tier:** Gold
- **Key patterns:** Published @wordpress/e2e-test-utils-playwright, expect.poll() for state, beforeEach/afterAll pattern, utility classes via test.use()

## Element Web (element-hq/element-web)
- **Repository:** https://github.com/element-hq/element-web
- **Test location:** `apps/web/playwright/e2e/`
- **Framework:** Playwright with custom fixtures and bot infrastructure
- **Files analyzed:**
  - `crypto/crypto.spec.ts` (230 lines) — cross-signing, key backup, E2EE DMs
  - `crypto/device-verification.spec.ts` (429 lines) — SAS, QR, recovery key verification
  - `one-to-one-chat/one-to-one-chat.spec.ts` (51 lines) — DM lifecycle
  - `settings/appearance-user-settings-tab.spec.ts` (97 lines) — font size, theme, emoji
  - `spaces/spaces.spec.ts` (453 lines) — space creation, room management, invites
  - `read-receipts/read-receipts.spec.ts` (~350 lines) — receipt handling across threads
- **Quality tier:** Gold
- **Key patterns:** Multi-server Matrix bot infrastructure, homeserver skip conditions, screenshot assertions, test.step() in helper functions, 40+ feature directories
