# Round 64 Suites Analyzed

## Ghost CMS (TryGhost/Ghost)
- **Repository:** https://github.com/TryGhost/Ghost
- **Test location:** `ghost/core/test/e2e-browser/`
- **Framework:** Playwright with custom `ghost-test` fixture
- **Files analyzed:**
  - `admin/publishing.spec.js` (546 lines) — post/page publish workflows
  - `admin/tiers.spec.js` (189 lines) — membership tier management
  - `admin/site-settings.spec.js` (46 lines) — subscription access controls
  - `admin/announcement-bar-settings.spec.js` (68 lines) — announcement bar UI
  - `portal/donations.spec.js` (67 lines) — donation payment flows
  - `portal/offers.spec.js` (432 lines) — promotional offer creation/redemption
- **Quality tier:** Gold
- **Key patterns:** File-local factory helpers, 2-level describe nesting, iframe frameLocator, sharedPage fixture

## n8n (n8n-io/n8n)
- **Repository:** https://github.com/n8n-io/n8n
- **Test location:** `packages/testing/playwright/tests/e2e/`
- **Framework:** Playwright with composite `n8n` fixture
- **Files analyzed:**
  - `node-creator/actions.spec.ts` (57 lines) — node creation via actions panel
  - `node-creator/categories.spec.ts` (99 lines) — node creator category UI
  - `auth/signin.spec.ts` (22 lines) — authentication login/logout
  - `workflows/editor/editor-after-route-changes.spec.ts` (33 lines) — zoom persistence across routes
- **Quality tier:** Gold
- **Key patterns:** Rich composite fixture (n8n.canvas.nodeCreator...), team ownership annotations, 1-level describe nesting, 21 feature directories
