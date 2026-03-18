# Security Standards

> **PRELIMINARY — to be validated in phases 2-7 (rounds 13-55)**
> This document contains initial standards based on landscape observations from rounds 1-12.
> Auth testing patterns are solid; broader security testing is THIN and needs expansion in security phase (rounds 37-40).

---

## SEC1. Authentication Testing

### SEC1.1 Use setup projects with storageState for auth
- Auth SHOULD be handled via Playwright setup projects, not `globalSetup`
- storageState persists cookies and localStorage to `.auth/<username>.json`
- Setup projects appear in HTML reports, are debuggable in trace viewer, and participate in fixtures
- **Basis:** [grafana-e2e, supabase-e2e, grafana-plugin-e2e, playwright-auth-docs]; official recommendation

### SEC1.2 Prefer REST API authentication over UI login
- Auth setup SHOULD use REST API calls rather than navigating the login UI
- Rationale: one HTTP call vs. navigation + form fill + redirect; eliminates UI-dependent flakiness
- **Basis:** [supabase-e2e (REST API login), grafana-plugin-e2e (HTTP API provisioning)]

### SEC1.3 Use on-demand auth with `globalCache.get()` for sharded suites
- In sharded execution, authenticate only for roles actually needed per shard
- `globalCache.get()` caches auth state across workers within a shard
- **Basis:** [devto-ondemand-auth (Vitalets), devto-global-cache]

---

## SEC2. Credential Security

### SEC2.1 Never hardcode credentials
- Credentials MUST be injected via environment variables, never hardcoded in config or test files
- CI: use GitHub Secrets, AWS Secrets Manager, or equivalent vault
- Local: use `.env.e2e.example` as template (never commit `.env`)
- **Basis:** 10/10 Gold suites; [calcom-e2e, grafana-e2e, immich-e2e]

### SEC2.2 Protect storageState files
- `.auth/` directory MUST be in `.gitignore`
- Playwright warning: "browser state file may contain sensitive cookies and headers"
- storageState files may contain session tokens, auth cookies, and user data
- **Basis:** [playwright-auth-docs, grafana-e2e, grafana-plugin-e2e]

### SEC2.3 Use separate storageState per role
- Each user role (admin, viewer, editor) SHOULD have its own storageState file
- Prevents accidental privilege escalation in tests
- Enables proper RBAC testing
- **Basis:** [grafana-e2e (30+ roles), grafana-plugin-e2e]

---

## SEC3. Role-Based Access Control (RBAC)

### SEC3.1 Define roles as separate Playwright projects
- Each role SHOULD be a separate Playwright project with its own auth state
- Tests verify permissions from each role's perspective
- **Basis:** [grafana-e2e (30+ role-based projects)]

### SEC3.2 Provision test users via API
- Test users SHOULD be created programmatically via admin API during setup
- No manual user creation; no shared test accounts between environments
- **Basis:** [grafana-plugin-e2e (Grafana HTTP API for user provisioning)]

---

## SEC4. Session Management

### SEC4.1 Handle storageState limitations
- storageState captures cookies and localStorage but NOT sessionStorage
- If your application uses sessionStorage, persist/restore manually via `addInitScript()`
- **Basis:** [playwright-official, playwright-auth-docs]

### SEC4.2 Account for session expiration in long suites
- Long-running test suites SHOULD re-authenticate when sessions expire
- Consider session lifetime when configuring test timeouts
- **Basis:** [playwright-auth-security-guide]

---

## SEC5. Application Test Toggle

### SEC5.1 Minimize the scope of E2E toggles
- If using a test toggle (e.g., `NEXT_PUBLIC_IS_E2E=1`), minimize what it changes
- Document every behavior change the toggle introduces
- Toggle SHOULD only affect: rate limiting, test-specific endpoints, analytics
- Toggle MUST NOT change: business logic, auth flows, data validation
- **Basis:** [calcom-e2e (pioneered), nextjs-e2e (adopted)]

---

## SEC6. Security Scanning (Emerging)

> **NOTE:** These patterns are observed in blog posts and small repos but NOT in Gold-standard suites.

### SEC6.1 Consider OWASP ZAP integration for security scanning
- Playwright can proxy through OWASP ZAP for passive security analysis
- ZAP scans all HTTP traffic during E2E test execution
- Detects: XSS, SQLi, CSRF, insecure headers, OWASP Top 10
- **Basis:** [Arghajit47/Playwright-Security-Testing, vijay-medium-zap-playwright]
- **Gold suite evidence: None**

---

## Gaps and Future Work

- No Gold suite demonstrates OWASP ZAP integration
- CSRF protection testing patterns not documented
- CSP compliance testing not explored
- Secure cookie attribute testing not documented
- MFA testing patterns need deep analysis
- API auth testing (JWT, API keys) beyond browser context not covered

---

## Revision History

| Date | Change | Basis |
|---|---|---|
| 2026-03-18 | Initial draft from landscape rounds 1-12 | Auth: strong evidence (4/10 Gold); broader security: thin |
