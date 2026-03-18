# Suite Analysis: ianstormtaylor/slate

**Repository:** https://github.com/ianstormtaylor/slate
**Application type:** Rich text editor framework
**Test framework:** @playwright/test
**Quality tier:** Silver (specialized editor testing)

---

## Configuration

| Setting | Value |
|---------|-------|
| Projects | 3-4 (Chromium, Firefox, Pixel 5 mobile + conditional WebKit on macOS) |
| Retries | 5 (CI) / 2 (local) — highest observed |
| Workers | Default (auto) |
| Test timeout | 20s |
| Expect timeout | 8s |
| Action timeout | 0 (unlimited) |
| fullyParallel | true (local) / false (CI) |
| forbidOnly | true (CI) |
| testIdAttribute | `data-test-id` |
| Base URL | `http://localhost:3000` (overridable via `PLAYWRIGHT_BASE_URL`) |
| Viewport | 1280x720 |
| Test directory | `./playwright` |
| Trace | `retain-on-first-retry` (CI only) |
| Screenshot | `only-on-failure` (CI only) |

## Notable Patterns

### Conditional Platform Projects
WebKit project added only on macOS — prevents CI failures on Linux runners where WebKit may behave differently.

### Environment Variable Override for Retries
`PLAYWRIGHT_RETRIES` env var allows runtime override of retry count, useful for debugging specific flaky tests.

### Inverted Parallelism
`fullyParallel: true` locally but `false` in CI — opposite of most suites. Likely because rich text editor tests have ordering dependencies that surface under parallel execution in resource-constrained CI.

### Mobile Viewport Testing
Pixel 5 device emulation included as a standard project alongside desktop browsers, addressing responsive editor behavior.

### Clipboard Permission Grant
Chromium project includes `permissions: ['clipboard-read', 'clipboard-write']` — domain-specific requirement for editor copy/paste testing.

### Scrollbar Visibility
Chromium launch args include `--enable-features=OverlayScrollbar` for consistent scrollbar rendering in screenshots.

## Architecture Assessment

Slate uses a flat test directory (`./playwright`) without POM classes. Tests directly interact with the editor using locators. The high retry count (5) and unlimited action timeout compensate for contenteditable complexity rather than abstracting it away. This is a pragmatic approach for a library that tests the editor framework itself.
