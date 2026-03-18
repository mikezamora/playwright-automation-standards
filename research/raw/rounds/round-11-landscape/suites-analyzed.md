# Round 11 — Landscape: Suites Analyzed (Gap-Filling Continued)

**Focus:** Fill remaining gaps — performance testing, security testing, advanced Playwright features
**Date:** 2026-03-18
**Method:** Targeted searches for Playwright + Lighthouse/performance, Playwright + OWASP/security, visual regression production patterns, and enterprise scaling patterns.

---

## New Sources Discovered

### Performance Testing Integration

#### 1. TestingPlus — Lighthouse + Playwright Integration Guide (2025)

| Field | Value |
|---|---|
| **URL** | https://testingplus.me/how-to-integrate-lighthouse-playwright-performance-testing-2025-guide/ |
| **Type** | Technical guide |
| **Notable** | Step-by-step integration of Google Lighthouse with Playwright for performance audits. Uses `playwright-lighthouse` package. Captures Core Web Vitals (LCP, CLS, INP) during E2E test runs. Enables performance budget enforcement in CI. |

#### 2. The Green Report — Frontend Performance Testing with Playwright and Lighthouse

| Field | Value |
|---|---|
| **URL** | https://www.thegreenreport.blog/articles/frontend-performance-testing-with-playwright-and-lighthouse/ |
| **Type** | Technical blog |
| **Notable** | Demonstrates running Lighthouse audits within Playwright test context. Performance scores captured as test assertions: `expect(lhReport.categories.performance.score).toBeGreaterThan(0.8)`. Integrates with existing CI pipelines. |

#### 3. Medium — Automated Performance Testing with Playwright and Chrome DevTools

| Field | Value |
|---|---|
| **URL** | https://medium.com/@aishahsofea/automated-performance-testing-with-playwright-and-chrome-devtools-a-deep-dive-52e8b240b00d |
| **Type** | Technical blog |
| **Notable** | Uses Chrome DevTools Protocol (CDP) via Playwright for performance metrics. Captures Performance API timings, Layout Shift scores, and resource loading data. More granular than Lighthouse but requires Chromium. |

#### 4. Codoid — Artillery Load Testing with Playwright

| Field | Value |
|---|---|
| **URL** | https://codoid.com/performance-testing/artillery-load-testing-complete-guide-to-performance-testing-with-playwright/ |
| **Type** | Technical guide |
| **Notable** | Combines Artillery for load testing with Playwright for user journey simulation under load. Artillery can drive Playwright scripts as virtual users, testing how the application performs with concurrent browser sessions. Production-ready pattern for combining functional and performance testing. |

### Security Testing Patterns

#### 5. Playwright Auth Security Testing Guide (2025)

| Field | Value |
|---|---|
| **URL** | https://software-testing-tutorials-automation.com/2025/12/playwright-auth-security-testing.html |
| **Type** | Technical guide |
| **Notable** | Covers authentication security testing with Playwright: brute-force protection testing, session timeout validation, MFA flow testing, role-based access control verification, and credential handling best practices. Uses `storageState` for role-based security testing. |

#### 6. Arghajit47/Playwright-Security-Testing (GitHub)

| Field | Value |
|---|---|
| **GitHub URL** | https://github.com/Arghajit47/Playwright-Security-Testing |
| **Type** | Open-source framework |
| **Stack** | TypeScript, Playwright, OWASP ZAP |
| **Notable** | Integrates Playwright with OWASP ZAP for automated security scanning. Playwright navigates the application while ZAP performs passive and active scans. Detects XSS, SQLi, CSRF, and other OWASP Top 10 vulnerabilities. Categorizes findings by severity (high, medium, low). |

#### 7. Medium — Playwright + OWASP ZAP Integration

| Field | Value |
|---|---|
| **URL** | https://medium.com/@sirigirivijay123/fortify-your-tests-automated-security-testing-with-playwright-owasp-zap-ef45342efd63 |
| **Type** | Technical blog |
| **Notable** | Demonstrates proxying Playwright browser through ZAP for comprehensive security scanning during E2E test execution. Pattern: Playwright drives user flows, ZAP intercepts and analyzes all traffic for vulnerabilities. |

#### 8. NareshIT — Secure Authentication in Playwright (2025)

| Field | Value |
|---|---|
| **URL** | https://nareshit.com/blogs/handling-authentication-in-playwright-securely |
| **Type** | Technical guide |
| **Notable** | Best practices for secure credential handling in Playwright tests: never hardcode credentials in scripts, use environment variables or CI secrets, separate storageState files per role, add `.auth/` directory to `.gitignore`. Warns that "browser state file may contain sensitive cookies and headers." |

### Visual Regression (Additional Patterns)

#### 9. Bug0 — Playwright Visual Regression Testing Guide (2026)

| Field | Value |
|---|---|
| **URL** | https://bug0.com/knowledge-base/playwright-visual-regression-testing |
| **Type** | Technical guide |
| **Notable** | Production patterns: use `animations: 'disabled'` to prevent flaky screenshots, mask dynamic elements aggressively, prefer component-level screenshots over full-page for precise failure diagnosis. Component-level screenshots produce smaller files and faster diffs. |

#### 10. TestDino — Playwright Visual Testing Guide

| Field | Value |
|---|---|
| **URL** | https://testdino.com/blog/playwright-visual-testing/ |
| **Type** | Industry guide |
| **Notable** | Threshold configuration for production: `maxDiffPixels` for small acceptable differences, `maxDiffPixelRatio` for percentage-based tolerance. Recommends starting with strict thresholds and loosening only for documented reasons. Baselines must be generated in CI, never locally. |

### Enterprise Scaling

#### 11. Currents.dev — Sharding vs. Workers Optimization

| Field | Value |
|---|---|
| **URL** | https://currents.dev/posts/optimizing-test-runtime-playwright-sharding-vs-workers |
| **Type** | Technical analysis |
| **Notable** | Workers perform best with 100-800 tests per suite. Sharding is for distributing across machines; workers parallelize within a machine. Optimal formula: shards for machine distribution, workers=1 per shard for stability. Beyond 800 tests, invest in test organization and selective execution (`--only-changed`). |

#### 12. Lewis Nelson — Dynamic Sharding in GitHub Actions

| Field | Value |
|---|---|
| **URL** | https://lewis-38728.medium.com/speeding-up-playwright-tests-with-dynamic-sharding-in-github-actions-91906aa9ed8f |
| **Type** | Technical blog |
| **Notable** | Confirms Danny Foster's dynamic sharding pattern with an independent implementation. Calculates shard count from test file count, applies min/max bounds. The pattern is gaining adoption as a standard CI optimization. |

---

## Summary Statistics

- **Total new sources analyzed:** 12
- **Performance testing:** 4 sources (Lighthouse integration, CDP metrics, Artillery load testing)
- **Security testing:** 4 sources (OWASP ZAP, auth security, credential handling)
- **Visual regression:** 2 sources (production patterns, threshold configuration)
- **Enterprise scaling:** 2 sources (sharding optimization, dynamic sharding)
