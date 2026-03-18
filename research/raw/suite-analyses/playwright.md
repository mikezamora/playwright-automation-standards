# Suite Analysis: microsoft/playwright

**Repository:** https://github.com/microsoft/playwright
**Suite Location:** `/tests/` (14 subdirectories)
**Tier:** Gold (Reference Implementation)
**Round:** 13-14 (Structure Deep Dive)

---

## 1. Architecture Analysis

### Directory Structure
```
/tests/
  android/                     # Mobile Android testing
  assets/                      # Test resources and fixtures
  bidi/                        # BiDi protocol tests
  components/                  # Component testing
  config/                      # Configuration tests
  electron/                    # Electron app testing
  image_tools/                 # Image comparison tests
  installation/                # Installation verification
  library/                     # Core library tests
  mcp/                         # Model Context Protocol tests
  page/                        # Page interaction tests
  playwright-test/             # Test runner framework tests (106 files)
  stress/                      # Performance/stress tests
  third_party/proxy/           # Third-party integration
  tsconfig.json
```

### playwright.config.ts (tests/playwright-test/)
- **2 projects**: `playwright-test` (main), `image_tools`
- `timeout: 30_000`
- `workers: process.env.CI ? 3 : undefined`
- `forbidOnly: !!process.env.CI`
- `snapshotPathTemplate: '__screenshots__/{testFilePath}/{arg}{ext}'`

### Reporters
- CI: `dot` + JSON (`test-results/report.json`) + `blob`
- Local: `list`

### POM / Fixtures
- **No POM** — tests exercise the framework itself, not a web application
- Tests create inline Playwright configs and test files, then run them as subprocesses
- "Meta-testing" pattern: tests validate Playwright's own behavior

### Data Management
- `assets/` directory contains HTML files, scripts, and resources for test scenarios
- Tests often create temporary test projects inline using string templates
- `PW_TAG` and `PW_CLOCK` env vars for conditional test configuration

## 2. Validation Analysis

### Assertion Patterns
- Tests validate Playwright CLI output, exit codes, and report contents
- Meta-assertions: testing that assertions work correctly
- JSON report parsing for structured validation

### Retry/Timeout Config
- No explicit retries configured (testing the retry mechanism itself)
- 30s timeout
- Focus on deterministic test execution

### Test Isolation
- Each test creates its own temporary project directory
- Subprocess execution provides process-level isolation
- `assets/` provides shared, immutable test resources

## 3. CI/CD Analysis

### Pipeline
- 3 workers in CI (conservative for stability)
- Triple reporter: dot (console), JSON (machine-readable), blob (for merging)
- No webServer (tests Playwright's own APIs)

### Artifacts
- JSON reports at `test-results/report.json`
- Blob reports for CI merge workflows
- Screenshot snapshots in `__screenshots__/` following `{testFilePath}/{arg}{ext}` template

## 4. Semantic Analysis

### Test Naming
- Files: `kebab-case.spec.ts` (e.g., `playwright-test-fixtures.spec.ts`, `reporter-html.spec.ts`)
- 106 files in `playwright-test/` alone
- Organized by feature area: reporters, fixtures, config, UI mode, components

### Coverage Domains
- Core: basic execution, parallel/serial, fixtures, hooks, expect
- Configuration: config loading, timeout overrides, snapshot templates
- Reporting: HTML, JSON, JUnit, Markdown, GitHub formats
- Advanced: tracing, screenshots, artifacts, web server integration
- UI mode: comprehensive coverage across metadata, filters, network, output

### Test Organization
- Functional domain directories (page, library, components)
- Platform directories (android, electron)
- Capability directories (stress, installation)

## 5. Key Patterns

1. **Meta-testing architecture** — tests create and execute Playwright projects as subprocesses, testing the framework's own behavior
2. **Reference implementation** — as the official Playwright test suite, patterns here define the canonical approach
3. **Triple reporter in CI** — dot + JSON + blob provides console output, machine-readable data, and merge support
4. **Screenshot path template** — `__screenshots__/{testFilePath}/{arg}{ext}` provides organized visual baselines
5. **Minimal config philosophy** — simple 2-project setup despite enormous test coverage (106+ files)
6. **No POM needed** — framework tests don't interact with a web app, demonstrating that POM is application-specific
7. **Asset-based test resources** — shared HTML/script files in `assets/` rather than inline content
8. **Platform-segmented directories** — android/, electron/, components/ demonstrate cross-platform testing structure
