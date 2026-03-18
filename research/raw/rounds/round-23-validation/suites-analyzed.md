# Round 23 — Suites Analyzed

**Phase:** Validation
**Focus:** Deep dive on assertion strategies — assertion types, web-first vs generic, custom matchers
**Date:** 2026-03-18

## Suites and Sources Analyzed

### Gold-Standard Suites — Assertion Pattern Evidence

1. **grafana/grafana** — Web-first assertions throughout; custom matchers via `@grafana/plugin-e2e` npm package; locator assertions dominate over page assertions
2. **calcom/cal.com** — Heavy use of `toBeVisible()`, `toHaveURL()`, `toHaveCount()`; visibility assertions before interactions (flaky-fix pattern); multiple assertions per test with hard assertions
3. **toeverything/AFFiNE** — `toHaveScreenshot()` for visual regression; web-first assertions with extended timeouts for editor-heavy operations
4. **immich-app/immich** — API-centric assertions (`toBeOK()`, status code checks); mixed UI + API assertions in integration flows
5. **microsoft/playwright** — Canonical assertion patterns; self-tests demonstrate every matcher; defines the web-first vs generic distinction
6. **excalidraw/excalidraw** — Visual regression via `toHaveScreenshot()` with `maxDiffPixels` configuration; accessibility assertions

### Custom Matcher Deep Dives

7. **grafana/plugin-tools** (`@grafana/plugin-e2e`) — 8 custom matchers: `toBeChecked`, `toBeOK`, `toDisplayPreviews`, `toHaveAlert`, `toHaveChecked`, `toHaveColor`, `toHaveNoA11yViolations`, `toHaveSelected`

### Documentation and Community Sources

8. **Playwright official docs** — Assertions page: 30+ locator matchers, 3 page matchers, 1 API response matcher; web-first vs generic categorization; soft assertions; custom matcher API (`expect.extend`)
9. **Checkly docs** — Assertion categorization (auto-retrying vs non-retrying vs negation); assertion granularity guidance; soft assertion patterns
10. **BrowserStack guide** — Assertion types and best practices; expect timeout configuration; custom error messages
11. **TestDino** — Assertion guide with practical patterns; API response validation patterns
12. **Momentic blog** — Comprehensive expect guide; locator assertion priority hierarchy

## Method

- Searched Playwright official docs for complete assertion matcher taxonomy
- Analyzed Gold suite test files for assertion frequency and type distribution
- Deep-dived Grafana's custom matcher package for extension patterns
- Cross-referenced community guides for assertion granularity best practices
- Documented soft assertion usage patterns and limitations
