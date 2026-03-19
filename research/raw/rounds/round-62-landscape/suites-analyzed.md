# Round 62 — Suites Analyzed

**Phase:** Landscape (continued discovery)
**Date:** 2026-03-19

## Summary Table

| Suite | Repo | Spec Files | POM Files | POM:Spec Ratio | test.step() | Tags | CI Workflows | Avg Test Length | Fixture Sophistication | Data Strategy |
|-------|------|-----------|-----------|----------------|-------------|------|-------------|----------------|----------------------|---------------|
| WordPress/Gutenberg | `wordpress/gutenberg` | 278 | 62 (utils pkg) | 0.22 | 0% | `@webkit`, `@firefox` | 1 (3 browser projects) | 15-80 lines | High (published npm package) | API utils (requestUtils) |
| n8n | `n8n-io/n8n` | 174 | 69 | 0.40 | 0% | `@auth:none` (fixture ctrl) | 7 | 10-30 lines | Very high (containers per worker) | JSON fixtures + API helpers |
| Rocket.Chat | `RocketChat/Rocket.Chat` | 170 | 112 | 0.66 | <5% | None | 1+ | 10-50 lines | Medium (storage state + POM) | faker + API utils |
| Ghost CMS | `TryGhost/Ghost` | 81 (browser) / 199 (all e2e) | ~30 | 0.56 | 0% | None | 6+ configs | 10-20 lines | Very high (env manager + data factories) | Data factory with dual persistence |
| Element Web | `element-hq/element-web` | 209 | 9 | 0.04 | <5% | `@mergequeue`, `@screenshot`, `@no-firefox`, `@no-webkit` | 1 (9 project contexts) | 20-60 lines | High (homeserver plugins + bot) | Bot + REST API |

## Key Metrics

### Scale Rankings (by spec file count)
1. WordPress/Gutenberg — 278 specs
2. Element Web — 209 specs
3. n8n — 174 specs
4. Rocket.Chat — 170 specs
5. Ghost CMS — 81 browser specs (199 total e2e)

### Architecture Differentiation

| Suite | Primary Architecture Pattern | Standout Innovation |
|-------|------------------------------|---------------------|
| Gutenberg | Published test utils package (npm) | Ecosystem-shareable test infrastructure |
| n8n | Container-managed worker isolation | 7 CI workflows, @auth tags for fixture control |
| Rocket.Chat | Fragment-maximalist POM (112 files) | Highest POM density of any suite; a11y scanning |
| Ghost CMS | Data factory with persistence adapters | API + DB dual-persistence factories; AI test guides |
| Element Web | Plugin-based backend multiplexing | 3 browsers x 3 homeservers = 9 CI contexts |

### Browser Coverage

| Suite | Chromium | Firefox | WebKit | Multi-Server |
|-------|----------|---------|--------|-------------|
| Gutenberg | Primary | @firefox tag | @webkit tag | No |
| n8n | Only | No | No | No |
| Rocket.Chat | Only | No | No | No |
| Ghost CMS | Only | No | No | No |
| Element Web | Primary | Merge queue | Merge queue | Yes (Synapse, Dendrite, Picone) |

### Test Isolation Strategy

| Suite | Isolation Level | Mechanism |
|-------|----------------|-----------|
| Gutenberg | Per-test | Fresh post via API in beforeEach |
| n8n | Per-worker | Container + DB reset per worker |
| Rocket.Chat | Per-describe (serial) | Shared channel within serial block |
| Ghost CMS | Per-file (default) / Per-test (Stripe) | Ghost instance + MySQL per file |
| Element Web | Per-worker | Homeserver container per worker |

## Sources

- WordPress/Gutenberg: https://github.com/WordPress/gutenberg (trunk branch)
- n8n: https://github.com/n8n-io/n8n (master branch)
- Rocket.Chat: https://github.com/RocketChat/Rocket.Chat (develop branch)
- Ghost CMS: https://github.com/TryGhost/Ghost (main branch)
- Element Web: https://github.com/element-hq/element-web (develop branch)
- Element Web testing docs: https://web-docs.element.dev/Element%20Web/playwright.html
- Gutenberg E2E docs: https://developer.wordpress.org/block-editor/contributors/code/testing-overview/e2e/
- Gutenberg e2e-test-utils-playwright: https://developer.wordpress.org/block-editor/reference-guides/packages/packages-e2e-test-utils-playwright/
