# Round 71 Findings — Coverage Measurement Approaches and Community Guidance

## Phase
Coverage Strategy Deep Dive (Phase 2)

## Objective
Evaluate the state of E2E coverage measurement: what tools exist, how they work, who uses them, and whether coverage measurement is worth standardizing for Playwright E2E suites.

---

## 1. Coverage Measurement Tool Landscape

### Approach A: V8 Coverage via Playwright's Built-in API

**How it works:** Playwright provides `page.coverage.startJSCoverage()` and `page.coverage.stopJSCoverage()` APIs that communicate directly with Chrome's V8 engine. These collect raw byte-offset execution data showing which functions and code ranges executed during test runs.

**Setup:**
1. Call `page.coverage.startJSCoverage()` before test actions
2. Call `page.coverage.stopJSCoverage()` after test actions
3. Process raw V8 data with `v8-to-istanbul` to convert to human-readable format
4. Generate reports via Istanbul CLI (`nyc report`)

**Limitations:**
- **Chromium only** -- Firefox and WebKit not supported
- Raw V8 output requires post-processing (byte offsets, not line numbers)
- Duplicated entries from bundled/dynamically-loaded scripts
- No support for 1:many source maps (minified bundles)
- Cached artifacts can produce mismatched results
- Performance overhead from coverage collection

**Source:** Currents.dev guide, Playwright official docs (class-coverage)

### Approach B: Istanbul Instrumentation via Build Plugins

**How it works:** Babel or Vite plugins (`babel-plugin-istanbul`, `vite-plugin-istanbul`) instrument source code at build time, injecting counters into every statement, branch, and function. During test execution, coverage data accumulates in `window.__coverage__`. After tests complete, the data is extracted and converted to Istanbul/NYC format.

**Setup:**
1. Add `babel-plugin-istanbul` or `vite-plugin-istanbul` to build config
2. Enable conditionally via environment variable (e.g., `E2E_TESTS=true`)
3. After each page navigation, extract `window.__coverage__` via `page.evaluate()`
4. Write coverage JSON to `.nyc_output/` directory
5. Run `nyc report` for HTML/LCOV output

**Limitations:**
- Requires modifying the build pipeline
- Instrumented code runs slower than uninstrumented code
- Coverage data is lost on page navigation unless manually collected
- Conditional compilation adds build complexity
- Only captures client-side JavaScript (not server-side)

**Source:** playwright.tech blog (outdated, 2020), Xriba Tech Blog, John Pourdanis real-world guide

### Approach C: Monocart Reporter with V8 Coverage

**How it works:** The monocart-reporter package integrates V8 coverage collection directly into Playwright's reporter lifecycle. It uses fixtures to start/stop JS and CSS coverage collection during test execution, then merges all coverage data into a global report after all tests complete.

**Setup:**
1. Install `monocart-reporter` and `monocart-coverage-reports`
2. Add monocart as a Playwright reporter in config
3. Create a coverage fixture that calls `page.coverage.startJSCoverage()` / `startCSSCoverage()`
4. On test completion, pass coverage data to `addCoverageReport()`
5. Reporter auto-merges all coverage data across shards

**Advantages over raw V8:**
- Automatic merging across shards
- CSS and HTML coverage support (not just JS)
- Integrated into Playwright reporter lifecycle
- Styled HTML reports with test/coverage cross-referencing
- Can merge E2E and unit test coverage from different sources

**Limitations:**
- Still Chromium only for V8 features
- Requires fixture setup
- 365+ stars on GitHub, 200+ npm weekly downloads -- moderate adoption

**Source:** cenfun/monocart-reporter GitHub, Playwright Adventures demos

### Approach D: Specialized Framework Coverage Tools

**@bgotink/playwright-coverage:**
- Uses V8 coverage without requiring code instrumentation
- Replaces `@playwright/test` imports with wrapped versions
- Converts V8 data to Istanbul format automatically
- **Status: "Very experimental"** -- proven on one Angular application only
- 50 GitHub stars, 20 forks

**nextcov (stevez/nextcov):**
- Specialized for Next.js + Playwright E2E coverage
- Collects both client (CDP) and server (NODE_V8_COVERAGE) coverage
- **Key feature:** Can merge Playwright E2E coverage with Vitest unit test coverage
- Example: ~80% unit + ~46% E2E = ~88% combined
- Supports Next.js 14+ and Vite 5+
- Auto-detects dev vs production mode
- 10 GitHub stars -- very early stage

**playwright-test-coverage (mxschmitt/playwright-test-coverage):**
- Demo project by Playwright core contributor Max Schmitt
- Shows Istanbul integration via `baseFixtures.ts`
- Uses `.nyc_output` directory for coverage files
- Reference implementation, not a production tool

---

## 2. Production Suite Coverage Measurement Adoption

### Who Actually Measures E2E Coverage?

| Suite | Measures E2E Code Coverage? | Method |
|-------|---------------------------|--------|
| n8n | **Yes** (weekly CI workflow) | `test-e2e-coverage-weekly.yml` -- the ONLY suite with dedicated coverage CI |
| AFFiNE | **Partial** (fixture support) | Custom `test` export supports CDP throttling and coverage collection; not in CI |
| Grafana | No | |
| Cal.com | No | |
| Immich | No | |
| Element Web | No | |
| Ghost | No | |
| freeCodeCamp | No | |
| Gutenberg | No | |
| Rocket.Chat | No | Monocart reporter used for styled reports, but coverage feature not enabled |
| Excalidraw | No | Uses vitest coverage for unit/component tests, not E2E |
| Supabase | No | |
| Slate | No | |
| Next.js | **Partial** (manifest) | Per-test pass/fail/flake tracking via test manifests, not code coverage |

**Result: 1/15 suites measure E2E code coverage in CI. 2/15 have partial infrastructure for it.**

This is the single largest gap between community recommendation and actual practice in the entire research project.

---

## 3. Why Suites Don't Measure E2E Code Coverage

Based on cross-suite analysis and community evidence, several factors explain the adoption gap:

### Factor 1: Chromium-Only Limitation
V8 coverage only works in Chromium-based browsers. Suites testing across Firefox/WebKit (Element Web, Gutenberg, Slate) cannot collect coverage in cross-browser runs. This makes coverage data incomplete by definition for cross-browser suites.

### Factor 2: Build Pipeline Complexity
Istanbul instrumentation requires modifying the build pipeline, adding environment-conditional plugins, and managing coverage data across page navigations. For teams already struggling with E2E flakiness, this added complexity is a non-starter.

### Factor 3: "Coverage is Not Correctness"
The Currents.dev guide explicitly warns: "100% coverage does not equal perfect tests." A test could click every button without verifying results and still achieve high coverage. Teams recognize that coverage percentage is a misleading metric for E2E tests.

### Factor 4: Structural Coverage is Sufficient
Most teams achieve "coverage awareness" through structural completeness: one test directory per feature, one spec file per user flow. When a feature lacks tests, it's visible in the directory structure. Formal code coverage adds tooling overhead without adding insight beyond what directory inspection provides.

### Factor 5: Cost-Benefit at Scale
For suites with 200+ tests running across shards, adding coverage collection increases execution time and artifact size. n8n runs its coverage workflow weekly (not on every PR), suggesting even the one adopter considers the cost too high for per-PR execution.

---

## 4. Alternative Coverage Tracking Approaches

### Approach 1: Structural Completeness (Most Common)
**Used by:** 13/15 suites

Track coverage implicitly through directory structure:
- One directory per feature area
- PR review ensures new features include tests
- Gaps are visible as missing directories/files

**Advantages:** Zero tooling cost; works with any framework; visible in code review
**Disadvantages:** No quantitative metrics; relies on human judgment; can miss scenarios within tested features

### Approach 2: Test Manifest Tracking
**Used by:** Next.js (1/15 suites)

Maintain a manifest file listing all tests with pass/fail/flake status. The manifest serves as both a test inventory and a coverage indicator.

**Advantages:** Quantitative tracking without build instrumentation; tracks flakiness alongside coverage
**Disadvantages:** Manual maintenance; doesn't map to code lines; only tracks test existence, not what code they exercise

### Approach 3: Feature Spreadsheet / Scenario Matrix
**Recommended by:** Alphabin "Improving Playwright Test Coverage"

Maintain a spreadsheet mapping features to test status:
| Feature | Positive Scenarios | Negative Scenarios | Edge Cases | Status |
|---------|-------------------|-------------------|------------|--------|
| Login | 3 | 2 | 1 | Complete |
| Booking | 5 | 1 | 0 | Partial |

**Advantages:** Business-readable; tracks scenario coverage, not code coverage; easy to identify gaps
**Disadvantages:** Manual maintenance; can drift from reality; not automated

### Approach 4: Weekly Coverage CI (n8n Pattern)
**Used by:** n8n (1/15 suites)

Run coverage collection on a weekly schedule rather than every PR:
- Dedicated CI workflow triggered by cron
- Full suite execution with coverage instrumentation
- Coverage report published for team review
- Tracks trends over time without per-PR overhead

**Advantages:** Quantitative data; trend tracking; low impact on PR workflow
**Disadvantages:** Coverage data is 0-7 days stale; requires dedicated CI workflow; still Chromium-only

### Approach 5: Merged E2E + Unit Coverage
**Demonstrated by:** nextcov (experimental)

Merge Playwright E2E coverage with Vitest/Jest unit test coverage to produce a unified coverage report:
- E2E covers flows that unit tests miss (server-side rendering, full integration paths)
- Unit tests cover logic that E2E cannot efficiently reach
- Combined report shows true application coverage

**Example result:** ~80% unit + ~46% E2E = ~88% combined (nextcov demo)

**Advantages:** Complete picture; justifies E2E investment; identifies redundant testing
**Disadvantages:** Requires both V8 and Istanbul pipelines; complex merge logic; experimental tooling

---

## 5. Community Guidance on Coverage Strategy

### Kent C. Dodds: "Test Use Cases, Not Code"
- Code coverage identifies which lines execute but not whether important functionality is tested
- Use case coverage (no automated tool exists) is the real goal
- "Code coverage can be a useful tool in identifying what parts of our codebase are missing use case coverage"
- Don't aim for 100% code coverage through E2E tests
- **Source:** kentcdodds.com/blog/how-to-know-what-to-test

### Currents.dev: Risk-Based Prioritization
- Focus coverage measurement on frequently-changed or business-critical code
- Exclude generated files, configs, and test utilities from coverage metrics
- Integrate coverage diffs into code review (review WHY lines lack tests, not just the percentage)
- "Coverage reveals which lines executed, not whether they behaved correctly"
- **Source:** currents.dev/posts/how-to-measure-code-coverage-in-playwright-tests

### BugBug: "Money Paths" Over Percentage Targets
- Track "% of business-critical flows covered" instead of code coverage %
- Risk-based formula: `High Risk = High Impact x High Likelihood`
- Reject 100% coverage as a goal
- Track: regression detection time post-deploy, ratio of automated vs manual checks
- **Source:** bugbug.io (round 61 findings)

### Alphabin: 80% Scenario Coverage Target
- Recommends 80% scenario coverage target (not code coverage)
- Distinguishes positive scenarios, negative scenarios, and edge cases
- Coverage multipliers: same tests across browsers AND environments
- **Source:** alphabin.co (round 61 findings)

### Playwright Official: Focus on User-Visible Behavior
- "Test user-visible behavior" -- not implementation details
- Don't test third-party services; mock them
- Tests should be completely independent
- **Source:** playwright.dev/docs/best-practices

---

## 6. Recommendations for Coverage Measurement Standard

### Recommendation COV-M1: Do NOT Require Code Coverage for E2E Tests
**Evidence:** 13/15 production suites operate successfully without E2E code coverage measurement. The tooling is immature (Chromium-only, experimental libraries), adds build complexity, and the metric itself is misleading for E2E tests.

### Recommendation COV-M2: Track Coverage Through Structural Completeness
**Evidence:** 13/15 suites. Maintain one test directory per feature area. Use PR review to ensure new features include tests. Use directory structure as the coverage map.

### Recommendation COV-M3: Use Scenario Matrix for Gap Analysis
**Evidence:** Community guidance (Alphabin, BugBug). Maintain a feature-to-scenario mapping that identifies which user flows have E2E tests and which don't. Target 80% scenario coverage for critical paths.

### Recommendation COV-M4: If Measuring Code Coverage, Use Weekly CI
**Evidence:** n8n pattern. Run coverage collection on a weekly schedule to track trends without impacting PR workflow. Use monocart-reporter or v8-to-istanbul for data collection.

### Recommendation COV-M5: Prefer Merged Coverage When Available
**Evidence:** nextcov demo. When both E2E and unit test coverage are collected, merge them for a complete picture. This is the most meaningful use of E2E code coverage -- identifying code paths that neither unit tests nor E2E tests exercise.

### Recommendation COV-M6: Define "Money Paths" as the Primary Coverage Unit
**Evidence:** Community consensus (BugBug, Kent C. Dodds, Makerkit). E2E coverage should be measured in "business-critical user journeys covered" rather than "lines of code executed." Identify 5-10 critical user journeys and ensure each has at least one E2E test.

---

## 7. Coverage Measurement Maturity Model

| Level | Description | Evidence |
|-------|-------------|----------|
| **0: None** | No coverage tracking | AFFiNE (error paths), freeCodeCamp |
| **1: Structural** | Directory = feature coverage; gaps visible in file tree | 13/15 suites |
| **2: Scenario tracking** | Feature-to-scenario mapping maintained | Community guidance; 0/15 suites (none found in practice) |
| **3: Quantitative** | Code coverage collected and reported (weekly or per-PR) | n8n (weekly) |
| **4: Merged** | E2E + unit coverage merged for unified report | nextcov (experimental; 0/15 suites in production) |

**Current state of the industry:** Level 1 (structural completeness) is the universal floor. Level 3-4 are aspirational. The gap between community guidance (which recommends Level 2-3) and practice (which stops at Level 1) remains the largest finding of this research phase.
