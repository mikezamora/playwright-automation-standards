# Round 11 — Landscape: Findings (Gap-Filling Continued)

**Focus:** Performance testing, security testing, and remaining landscape gaps
**Date:** 2026-03-18

---

## Key Findings

### Finding 1: Playwright + Lighthouse enables performance budget enforcement in CI

The `playwright-lighthouse` npm package bridges Playwright and Google Lighthouse, enabling Core Web Vitals measurement within E2E test runs. The pattern: Playwright navigates to a page, Lighthouse audits it, and test assertions enforce performance budgets. Example: `expect(lhReport.categories.performance.score).toBeGreaterThan(0.8)`.

This is the most production-ready approach to combining Playwright with performance testing. It operates at the page level (not component level), measures real browser rendering metrics (LCP, CLS, INP), and integrates with existing CI pipelines. The limitation: it requires Chromium (Lighthouse depends on Chrome DevTools Protocol).

**Evidence:** TestingPlus integration guide, The Green Report blog, BrowserStack Lighthouse integration docs

### Finding 2: Chrome DevTools Protocol via Playwright provides granular performance metrics

For teams needing deeper performance data than Lighthouse provides, Playwright's CDP integration (`page.evaluate(() => performance.getEntries())`) captures raw Performance API timings, individual resource loading metrics, and Layout Shift contribution scores. This approach is more granular than Lighthouse but requires custom metric collection and threshold definition.

The pattern: use Lighthouse for high-level performance scoring in CI gates, and CDP for detailed performance investigation in dedicated performance test suites.

**Evidence:** Aishah Sofea Medium blog on CDP + Playwright

### Finding 3: Artillery + Playwright enables realistic load testing with browser-based virtual users

Artillery can drive Playwright scripts as virtual users, simulating concurrent browser sessions rather than simple HTTP requests. This tests how applications perform under realistic multi-user load — including JavaScript execution, CSS rendering, and DOM manipulation under contention. The pattern bridges the gap between synthetic E2E tests (one user) and production load (many users).

This is the most sophisticated performance testing pattern found: Artillery orchestrates the load profile (ramp-up, steady state, spike), while Playwright scripts define the user behavior. Results include both performance metrics (response times, error rates) and functional validation (assertions pass under load).

**Evidence:** Codoid Artillery + Playwright guide

### Finding 4: Playwright + OWASP ZAP creates an automated security scanning pipeline

The integration pattern: configure Playwright to proxy through OWASP ZAP, then run normal E2E tests. ZAP passively analyzes all HTTP traffic for vulnerabilities (XSS, SQLi, CSRF, insecure headers, etc.). After passive scanning, ZAP can perform active scanning on discovered endpoints. Results are categorized by severity and mapped to OWASP Top 10.

This approach leverages existing E2E tests as "crawlers" for security scanning — no separate security-specific scripts needed. The integration requires: (1) ZAP running as a proxy, (2) Playwright configured with proxy settings, (3) a post-test step to generate ZAP reports.

**Evidence:** Arghajit47/Playwright-Security-Testing GitHub repo, Vijay K Medium blog on Playwright + ZAP

### Finding 5: Secure credential handling in Playwright has a clear best-practice chain

The credential security chain for Playwright tests:
1. **Never** hardcode credentials in test scripts or config files
2. Use environment variables for all credentials (`ADMIN_USER`, `ADMIN_PASSWORD`)
3. In CI, inject credentials from GitHub Secrets or equivalent vault
4. Save storageState files to `.auth/` directory
5. Add `.auth/` to `.gitignore` — never commit session state files
6. Playwright warns: "browser state file may contain sensitive cookies and headers"
7. Use separate storageState files per role for proper RBAC testing

This chain is already practiced by Gold suites (Grafana: `playwright/.auth/<username>.json`, Cal.com: `.env.e2e.example`), but has not been explicitly documented as a standard.

**Evidence:** NareshIT secure auth guide, Playwright official auth docs, Grafana plugin-e2e auth docs

### Finding 6: Visual regression thresholds should start strict and loosen with documentation

The production pattern for visual regression thresholds:
- Start with `maxDiffPixels: 0` (strict) for new tests
- When flakiness appears, investigate the root cause first
- If the cause is acceptable variance (font rendering, anti-aliasing), loosen with `maxDiffPixels` or `maxDiffPixelRatio`
- Document every threshold loosening with a comment explaining why
- Use `animations: 'disabled'` and element masking before loosening pixel thresholds

Component-level screenshots are preferred over full-page: smaller files, faster diffs, and more precise failure messages. Masking dynamic elements (timestamps, avatars, ads) is "the single most important technique for reducing flaky visual tests."

**Evidence:** Bug0 visual regression guide (2026), TestDino visual testing guide

### Finding 7: The optimal CI architecture is shards x 1 worker with dynamic shard calculation

The community consensus for CI architecture at scale:
- **Workers per shard:** 1 (for stability and reproducibility)
- **Shard count:** Dynamically calculated from test count
- **Formula:** `shards = max(MIN, min(MAX, ceil(test_count * projects / tests_per_shard)))`
- **Sweet spot:** 100-800 tests per suite; below 100, sharding adds overhead; above 800, invest in test organization
- **Beyond 800 tests:** Use `--only-changed` for PR feedback, full suite on merge to main

This architecture has converged from multiple independent sources (Playwright docs, Danny Foster, Lewis Nelson, Currents.dev) into a stable recommendation.

**Evidence:** Currents.dev sharding analysis, Lewis Nelson dynamic sharding, Danny Foster dynamic sharding

### Finding 8: The landscape phase is complete — remaining gaps are structural, not discoverable

After 11 rounds of landscape research, the remaining gaps fall into two categories:

1. **Structural gaps** (will be filled in later phases): Fixture hierarchies, POM variants, config organization — these require deep-dive analysis of Gold suite code, not more discovery.
2. **Inherent gaps** (cannot be filled): Fintech/healthcare OSS suites (regulated industries don't open-source tests), production component testing patterns (Playwright CT is still experimental).

The landscape phase has successfully mapped the Playwright ecosystem with 97 sources across all quality tiers and capability areas. The synthesis checkpoint (Round 12) should consolidate these findings into actionable patterns.

**Evidence:** Cumulative gap analysis across rounds 1-11

---

## Updated Cumulative Statistics

| Metric | Value |
|---|---|
| Total unique sources | ~97 |
| Gold-standard suites | 10 |
| Silver suites | 12 |
| Bronze suites/resources | 33 |
| Documentation/blog sources | ~42 |
| Industries covered | 8 (dev tools, productivity, scheduling, education, media, healthcare*, fintech*, e-commerce) |
| Capabilities mapped | 11 (E2E, CI/CD, auth, a11y, visual, network mock, trace, API, component*, performance*, security*) |

*Partially covered — asterisked items have limited production evidence
