# Round 37 — Suites & Sources Analyzed: Security Testing Patterns (Part 1)

## Scope

Search for Playwright security testing patterns: authentication flow testing, authorization testing, CSRF validation, XSS detection, HTTP security headers, cookie security attributes, and credential management in test suites.

## Sources Analyzed

| # | Source | Type | URL | Focus |
|---|--------|------|-----|-------|
| 1 | Playwright Official — Auth Docs | Docs | https://playwright.dev/docs/auth | storageState, setup projects, multiple roles |
| 2 | software-testing-tutorials — Auth Security | Blog | https://software-testing-tutorials-automation.com/2025/12/playwright-auth-security-testing.html | Brute-force, session timeout, MFA, RBAC verification |
| 3 | Arghajit47/Playwright-Security-Testing | Repo | https://github.com/Arghajit47/Playwright-Security-Testing | Playwright + ZAP integration; XSS, SQLi, CSRF detection |
| 4 | kston83/playwright-zap-dast | Repo | https://github.com/kston83/playwright-zap-dast | Authenticated DAST scanning; Playwright + ZAP CI/CD |
| 5 | Vijay K — ZAP + Playwright | Blog | https://medium.com/@sirigirivijay123/fortify-your-tests-automated-security-testing-with-playwright-owasp-zap-ef45342efd63 | Proxy-based passive scanning; functional tests as security guards |
| 6 | thanan — Passive Scanning | Blog | https://medium.com/@thananjayan1988/passive-scan-your-web-app-with-zap-and-playwright-c57504bd4ef5 | Turning functional tests into passive security scanners |
| 7 | Mohamed Said Ibrahim — ZAP Pentest | Blog | https://javascript.plainenglish.io/owasp-zap-playwright-automating-penetration-testing-for-modern-web-apps-e0e817bdc29c | Automated penetration testing orchestration |
| 8 | Neova Solutions — API Security | Blog | https://www.neovasolutions.com/2024/06/20/automating-api-security-vulnerability-testing-using-playwright-typescript/ | XSS payload injection, SQLi testing via Playwright |
| 9 | Team Merlin (SG GDS) — Token Testing | Blog | https://medium.com/singapore-gds/testing-tokens-in-playwright-e356b32b3213 | CSRF token validation, token lifecycle testing |
| 10 | Oscar Chou — CSRF CVE Fix | Blog | https://oscarchou.com/posts/troubleshoot/adjust-playwright-test-for-cve-2025-24358/ | Playwright tests after gorilla/csrf CVE update |
| 11 | Serhii Onishchenko — CSRF Auth | Blog | https://serhiionishchenko.medium.com/achieving-playwright-api-based-csrf-authentication-with-cookies-bdbccff3e244 | API-based CSRF token extraction and reuse |
| 12 | Aryadevi — Securing the App | Blog | https://medium.com/@athy1988/securing-the-app-with-playwright-integrating-security-into-functional-tests-067757726c4c | Security headers, CSP, cookie attributes in functional tests |
| 13 | BrowserStack — Cookies | Guide | https://www.browserstack.com/guide/playwright-cookies | Cookie management, attribute inspection |
| 14 | Playwright — BrowserContext API | Docs | https://playwright.dev/docs/api/class-browsercontext | context.cookies(), addCookies(), storageState() |
| 15 | Devika A — CSP in Playwright | Blog | https://medium.com/@devika.a93/unlocking-tips-tricks-for-content-security-policy-in-playwright-automation-00544df9140a | CSP bypass option, header inspection |

## Gold Suite Security Coverage Check

| Suite | Auth Testing | RBAC | Credential Security | Security Headers | OWASP Integration |
|-------|-------------|------|--------------------|-----------------|--------------------|
| grafana-e2e | Yes (30+ role projects) | Yes (exemplar) | Yes (env vars) | No | No |
| supabase-e2e | Yes (REST API login) | Partial | Yes (env vars) | No | No |
| calcom-e2e | Yes (setup project) | No | Yes (.env.e2e.example) | No | No |
| immich-e2e | Yes (devcontainer) | No | Yes (env vars) | No | No |
| grafana-plugin-e2e | Yes (HTTP API provisioning) | Yes (user provisioning) | Yes (env vars) | No | No |
| freecodecamp-e2e | Minimal | No | Yes (env vars) | No | No |
| excalidraw-e2e | No (no auth needed) | N/A | N/A | No | No |
| slate-e2e | No (no auth needed) | N/A | N/A | No | No |
| affine-e2e | Yes (basic) | No | Yes (env vars) | No | No |
| nextjs-e2e | Minimal (template) | No | Yes (env vars) | No | No |

**Key observation:** 0/10 Gold suites test security headers, CSP, cookie attributes, or integrate OWASP scanning. Security testing in Gold suites is limited to authentication flow management.
