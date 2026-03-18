# Round 10 — Landscape: Findings (Gap-Filling)

**Focus:** Fill industry, capability, and scale gaps from rounds 1-9
**Date:** 2026-03-18

---

## Key Findings

### Finding 1: Network mocking in Playwright operates at three levels with distinct use cases

Playwright provides three levels of network interception, each with different scoping and use cases:

1. **`page.route()`** — Intercepts requests for a single page. Use for test-specific API mocking (e.g., simulating error responses for a specific test).
2. **`browserContext.route()`** — Intercepts requests across all pages in a browser context, including new tabs and popups. Use for shared concerns like authentication token injection.
3. **`page.routeFromHAR()`** — Replays pre-recorded HTTP Archive files. Use for deterministic API response replay, especially for complex multi-request flows.

The critical pattern is: register routes **before** navigation (`page.goto()`), otherwise early requests may not be intercepted. Every route handler must call exactly one of `route.fulfill()`, `route.continue()`, or `route.abort()` — failing to do so hangs the request and eventually times out the test.

**Evidence:** Playwright official mock docs, BrowserStack mocking guide (2026), TestDino network mocking guide

### Finding 2: HAR recording creates self-updating API fixtures that reduce maintenance

The `routeFromHAR()` method with `update: true` records real API responses into a HAR file. Subsequent test runs with `update: false` replay those responses deterministically. This creates a "record once, replay many" workflow where API fixtures auto-update when you explicitly re-record, eliminating the manual JSON fixture maintenance problem.

The recommended workflow is:
1. Set `update: true` and run tests to record real responses
2. Commit HAR files alongside tests
3. Set `update: false` for CI — tests replay recorded responses
4. Periodically re-record to capture API changes

**Evidence:** Playwright official mock docs (`routeFromHAR` API)

### Finding 3: Trace viewer is a Progressive Web App with CI-linkable URLs

Playwright's trace viewer (trace.playwright.dev) is a PWA that can be shared via URL. CI systems can generate direct links to trace analysis by passing trace file URLs as query parameters. This enables "click from CI failure to trace" workflows without downloading files locally.

The recommended trace retention strategy for enterprise CI:
- Feature branches: 7 days
- Main/production branches: 30 days
- Critical production failures: long-term archive

**Evidence:** Momentic trace viewer guide, TestDino trace viewer guide

### Finding 4: Healthcare enterprises achieve dramatic improvements migrating to Playwright

A Bloomington-based healthcare technology provider migrated 1,200 Cypress tests to Playwright with quantified results: suite runtime dropped from 90 minutes to 14 minutes (84% reduction), using 15 native Playwright parallels versus 5 paid Cypress parallels on the same CI compute budget. The original Cypress suite had a 6.5% flakiness rate primarily due to WebKit/Safari issues in the patient portal.

This case study confirms that Playwright's native parallelization and cross-browser support are particularly valuable in healthcare, where patient portals must work across Safari/WebKit (common on iOS devices used by patients).

**Evidence:** Devin Rosario, "Playwright vs Cypress: The 2026 Enterprise Testing Guide" (Medium)

### Finding 5: E-commerce Playwright testing follows standard POM patterns without industry-specific extensions

Unlike healthcare (which has compliance-specific needs) or fintech (which has regulatory audit requirements), e-commerce Playwright testing follows standard patterns: product browsing, cart management, checkout flows, and payment integration testing. No e-commerce-specific Playwright extensions or frameworks were found — the standard POM + fixture pattern suffices.

The key e-commerce-specific challenges are: testing payment provider integrations (Stripe, PayPal), handling dynamic pricing/inventory, and testing multi-step checkout flows with address validation.

**Evidence:** ovcharski/playwright-e2e, akhiltodecode/Playwright_Resource

### Finding 6: Fintech Playwright adoption is enterprise-driven but lacks open-source representation

Fintech companies adopt Playwright for its reliability in high-stakes environments where "downtime and failed releases carry massive financial and regulatory risk." However, no open-source fintech Playwright suites were found. This is expected — financial applications are proprietary, and compliance requirements (SOC 2, PCI-DSS) discourage open-sourcing test infrastructure.

The fintech-specific Playwright patterns documented in industry guides include: multi-factor authentication testing, session timeout validation, concurrent transaction testing, and audit trail verification.

**Evidence:** QAble fintech testing guide, Devin Rosario enterprise testing guide

### Finding 7: Enterprise-scale thresholds are 100-800 tests for optimal sharding performance

Community guidance identifies the "sweet spot" for Playwright test suites at 100-800 tests, depending on test duration and machine specifications. Below 100 tests, sharding adds more overhead than benefit. Above 800 tests, test organization and reporting become the bottleneck rather than execution speed. At the 100-200+ test threshold, teams need dedicated test dashboards (beyond basic HTML reports) for effective failure diagnosis.

Dynamic sharding (calculating shard count at runtime from test count) is recommended for suites above 200 tests to avoid manual maintenance as the suite grows.

**Evidence:** Currents.dev (sharding vs. workers), TestDino (reporting at scale), Danny Foster (dynamic sharding)

### Finding 8: The NestJS + Playwright gap persists — API testing defaults to supertest

Despite targeted searching, no high-quality NestJS project was found using Playwright for API-only testing. NestJS projects universally use `supertest` (bundled with `@nestjs/testing`) for API tests and, when E2E is needed, use Playwright only for browser-based testing of the frontend consuming the NestJS API. This gap is structural: NestJS's built-in testing tools are deeply integrated with the framework, making Playwright's `APIRequestContext` an unnecessary abstraction layer.

Immich remains the only Gold-standard suite with a NestJS backend, and its Playwright tests focus on the Svelte frontend, not the NestJS API directly.

**Evidence:** GitHub topic searches for NestJS + Playwright, Immich project structure

---

## Gap Status After Round 10

| Gap Area | Status | Assessment |
|---|---|---|
| Healthcare | Partially filled | Case study found; no OSS suites (expected — regulated industry) |
| Fintech | Partially filled | Patterns documented; no OSS suites (expected — proprietary) |
| E-commerce | Filled | 2 OSS repos found; standard POM patterns suffice |
| Network mocking/HAR | Filled | 3 sources analyzed; three-level interception model documented |
| Trace viewer | Filled | CI strategies, retention policies, PWA sharing documented |
| Enterprise scale | Filled | 100-800 test sweet spot; dynamic sharding thresholds |
| NestJS API testing | Confirmed gap | Structural — NestJS uses supertest natively |
| Component testing | Still thin | Remains experimental with limited production adoption |
