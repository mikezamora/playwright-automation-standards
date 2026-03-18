# Security Patterns

## Overview

This document consolidates security testing patterns observed during the landscape phase (rounds 1-11). Security patterns include authentication testing, session management, credential handling, role-based access control (RBAC) testing, and OWASP integration.

**Status:** Initial synthesis — Auth patterns are solid; broader security testing is THIN. To be expanded in security phase (rounds 37-40).

---

## Observed Patterns

### 1. Authentication State Management

**Pattern: Setup projects with storageState for auth persistence**
- Frequency: 4/10 Gold suites use setup projects for auth
- Convention: Auth runs once before dependent tests; storageState saved to `.auth/` directory
- Advantages over globalSetup: visible in HTML reports, debuggable in trace viewer, fixture-compatible
- Evidence: [grafana-e2e] (`dependencies: ['auth']`), [supabase-e2e] (setup project), [grafana-plugin-e2e] (storageState), [playwright-official] (canonical pattern)

**Pattern: REST API authentication over UI-based login**
- Frequency: 3/10 Gold suites offer or recommend REST API auth
- Rationale: One HTTP call vs. navigation + form fill + redirect wait; eliminates UI flakiness in auth step
- Evidence: [supabase-e2e] (REST API login, set session in localStorage), [grafana-plugin-e2e] (HTTP API user provisioning)

**Pattern: On-demand fixture auth with `globalCache.get()`**
- Authenticates only for roles actually used in each shard
- Reduces overhead compared to eagerly authenticating all roles in every shard
- Evidence: [devto-ondemand-auth] (Vitalets blog), [devto-global-cache]

### 2. Credential Security

**Pattern: Never hardcode credentials; use environment variables**
- Frequency: 10/10 Gold suites (universal)
- CI: Inject from GitHub Secrets or equivalent vault
- Local: `.env.e2e.example` template files (never `.env` in git)
- Evidence: [calcom-e2e] (`.env.e2e.example`), [grafana-e2e] (`GRAFANA_ADMIN_USER`, `GRAFANA_ADMIN_PASSWORD`), [immich-e2e] (devcontainer config)

**Pattern: `.auth/` directory in `.gitignore`**
- Frequency: 4/10 Gold suites (those using storageState)
- Convention: `playwright/.auth/<username>.json` never committed to git
- Playwright warning: "browser state file may contain sensitive cookies and headers"
- Evidence: [grafana-e2e], [grafana-plugin-e2e], [playwright-auth-docs]

**Pattern: Separate storageState files per role**
- Each user role (admin, viewer, editor) has its own JSON state file
- Enables proper RBAC testing without credential reuse
- Evidence: [grafana-e2e] (30+ role-based projects), [grafana-plugin-e2e] (`playwright/.auth/<username>.json`)

### 3. Role-Based Access Control (RBAC) Testing

**Pattern: Multi-project configuration for role-based testing**
- Each role defined as a separate Playwright project with its own auth state
- Tests run against each role's perspective
- Frequency: 2/10 Gold suites (Grafana exemplar)
- Evidence: [grafana-e2e] (30+ projects for admin, viewer, and plugin-specific roles), [grafana-plugin-e2e] (RBAC user provisioning via HTTP API)

**Pattern: Inline user definitions with automatic provisioning**
- Users defined in test config; provisioned via admin API during setup
- No manual user creation needed
- Evidence: [grafana-plugin-e2e] (Grafana HTTP API for user/role provisioning)

### 4. Session Management Testing

**Pattern: storageState captures cookies and localStorage**
- `page.context().storageState({ path: authFile })` saves full browser state
- Includes cookies, localStorage items, and origins
- **Does NOT include sessionStorage** — must be handled separately via `addInitScript()`
- Evidence: [playwright-official], [playwright-auth-docs]

**Pattern: Session timeout awareness in tests**
- Long-running test suites must account for session expiration
- Pattern: Re-authenticate when session expires; monitor session validity
- Evidence: [playwright-auth-security-guide] (session timeout validation)

### 5. OWASP Integration (Emerging)

**Pattern: Playwright + OWASP ZAP for automated security scanning**
- Configure Playwright browser to proxy through ZAP
- Run normal E2E tests; ZAP passively scans all traffic
- Post-test: ZAP performs active scanning on discovered endpoints
- Detects: XSS, SQLi, CSRF, insecure headers, OWASP Top 10 violations
- Evidence: [Arghajit47/Playwright-Security-Testing], [vijay-medium-zap-playwright]
- **Gold suite usage: 0/10** — Emerging pattern, not yet adopted by Gold suites

### 6. Application-Level Test Toggle

**Pattern: `NEXT_PUBLIC_IS_E2E=1` for test-specific behavior**
- Disables rate limiting, enables test endpoints, adjusts timeouts
- Minimizes divergence between test and production behavior
- Document every change the flag introduces
- Evidence: [calcom-e2e] (pioneered), [nextjs-e2e] (adopted)

---

## Emerging Themes

1. **Auth testing is the most mature security pattern** — storageState, setup projects, and REST API auth are well-established
2. **Credential security has clear best practices** — env vars, .gitignore, separate state files per role
3. **RBAC testing is only practiced by the most mature suites** — Grafana is the exemplar
4. **Broader security testing (OWASP) is emerging** — Playwright + ZAP integration exists but no Gold suite uses it
5. **The E2E toggle pattern has security implications** — test-specific behavior must be carefully scoped

---

## Gaps (to be addressed in Security Phase, Rounds 37-40)

1. No Gold suite demonstrates OWASP ZAP integration
2. No patterns for testing CSRF protection with Playwright
3. No patterns for testing Content Security Policy (CSP) compliance
4. No patterns for testing secure cookie attributes (HttpOnly, Secure, SameSite)
5. Session hijacking and fixation testing patterns not documented
6. Multi-factor authentication (MFA) testing patterns not deeply analyzed
7. No patterns for testing API authentication (JWT, API keys) beyond browser context

---

## Open Questions

1. Should security scanning (ZAP) be integrated into E2E tests or run as a separate CI job?
2. How do teams test MFA flows without accessing real authenticator apps?
3. What session management edge cases should E2E tests cover?
4. How do Gold suites prevent sensitive data exposure in test artifacts?
5. Should standards prescribe security testing, or leave it as an additive specialization?
