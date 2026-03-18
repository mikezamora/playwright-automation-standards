# Security Patterns

## Overview

This document consolidates security testing patterns observed across all research phases: landscape (rounds 1-11) and security deep-dive (rounds 37-40). Security patterns include authentication testing, session management, credential handling, role-based access control (RBAC) testing, security validation (headers, cookies, CSRF, CSP), and OWASP integration.

**Status:** FINAL — Expanded in security phase (rounds 37-40). All landscape gaps addressed.

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
- Worker-scoped fixture; caches across workers within a shard
- Evidence: [devto-ondemand-auth] (Vitalets blog), [devto-global-cache]

**Pattern: Session expiration re-authentication**
- Long-running suites (>30 min) risk session expiration
- beforeEach checks for login redirect; re-authenticates and refreshes storageState
- Alternative: set test environment session TTL longer than suite duration
- Evidence: [playwright-auth-security-guide], [ministry-of-testing-auth-recipes]

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
- Prevents accidental privilege escalation in tests
- Evidence: [grafana-e2e] (30+ role-based projects), [grafana-plugin-e2e] (`playwright/.auth/<username>.json`)

**Pattern: Vault integration for enterprise credential management**
- HashiCorp Vault: OIDC/JWT auth, temporary secrets with TTL
- AWS Secrets Manager: IAM Role auth, SDK integration, auto-rotation
- Azure Key Vault: DefaultAzureCredential, Managed Identity in ADO pipelines
- Gold suite evidence: 0/10 (enterprise pattern, not needed for most teams)
- Evidence: [hoop-vault-playwright], [hoop-aws-secrets-playwright], [dougan-azure-keyvault], [habib-vault-playwright]

### 3. Role-Based Access Control (RBAC) Testing

**Pattern: Multi-project configuration for role-based testing**
- Each role defined as a separate Playwright project with its own auth state
- Tests run against each role's perspective
- Frequency: 2/10 Gold suites (Grafana exemplar)
- Evidence: [grafana-e2e] (30+ projects for admin, viewer, and plugin-specific roles), [grafana-plugin-e2e] (RBAC user provisioning via HTTP API)

**Pattern: Multi-context testing for user interactions**
- Multiple browser contexts in a single test, each with different storageState
- Tests real multi-user workflows (e.g., admin approves user request)
- Both users active simultaneously in same test
- Evidence: [playwright-auth-docs], [ministry-of-testing-discussions], [neova-multi-user]

**Pattern: Role-parameterized tests**
- Same test logic executed across multiple roles using loop or test.describe
- Conditional assertions based on expected permissions per role
- DRY approach for permission boundary testing
- Evidence: [testleaf-storage-state], [divya-multi-user]

**Pattern: Inline user definitions with automatic provisioning**
- Users defined in test config; provisioned via admin API during setup
- No manual user creation needed; isolated per environment
- Evidence: [grafana-plugin-e2e] (Grafana HTTP API for user/role provisioning)

**Pattern: Broken access control detection**
- Test URL parameter manipulation (access other user's data via ID)
- Verify unauthenticated users are redirected from protected routes
- Test horizontal privilege escalation (user A accessing user B's resources)
- Evidence: [playwright-auth-security-guide], [aryadevi-securing-app]

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

**Pattern: Logout verification — complete session cleanup**
- After logout, verify session cookie is removed
- Verify localStorage auth tokens are cleared
- Verify subsequent navigation redirects to login
- Evidence: [playwright-auth-security-guide], [aryadevi-securing-app]

**Pattern: Token lifecycle testing**
- Verify tokens are unique per session
- Verify old tokens are invalidated after logout/refresh
- Verify tokens from one user cannot be used for another
- Evidence: [team-merlin-token-testing], [mahtab-jwt-testing]

### 5. Security Validation Testing

**Pattern: HTTP security header validation**
- Assert presence and correctness of security headers on responses
- Headers: Strict-Transport-Security (HSTS), X-Frame-Options, X-Content-Type-Options, Content-Security-Policy
- Uses `response.headers()` — stable Playwright API, zero dependencies
- Gold suite evidence: 0/10; documented in blogs and guides
- Evidence: [aryadevi-securing-app], [team-merlin-header-testing]

**Pattern: Cookie security attribute validation**
- Inspect session cookies for httpOnly, secure, sameSite attributes
- `context.cookies()` returns full cookie objects with all security flags
- Verify SameSite=None always paired with Secure flag
- Gold suite evidence: 0/10; documented in blogs and guides
- Evidence: [browserstack-cookies], [playwright-browsercontext-api], [aryadevi-securing-app]

**Pattern: Content Security Policy (CSP) validation**
- Verify CSP header is present and properly configured
- Check for absence of unsafe-inline, unsafe-eval where applicable
- Note: `bypassCSP: true` is for test infrastructure, not for security tests
- Evidence: [devika-csp-playwright], [aryadevi-securing-app]

**Pattern: CSRF token validation**
- Extract CSRF tokens from meta tags, hidden form fields, or API responses
- Verify requests without valid CSRF tokens are rejected (403)
- Verify token uniqueness per session
- Evidence: [team-merlin-token-testing], [serhii-csrf-auth], [oscar-csrf-cve]

**Pattern: XSS payload injection testing**
- Inject common XSS payloads into form fields and URL parameters
- Verify payloads are sanitized/escaped in rendered output
- Limited scope: Playwright can test output encoding but not comprehensive XSS scanning
- Prefer OWASP ZAP or dedicated scanners for thorough XSS detection
- Evidence: [neova-api-security], [arghajit47-playwright-security]

### 6. OWASP Integration

**Pattern: Playwright + OWASP ZAP for automated security scanning**
- Configure Playwright browser to proxy through ZAP
- Run normal E2E tests; ZAP passively scans all traffic
- Post-test: ZAP performs active scanning on discovered endpoints
- Detects: XSS, SQLi, CSRF, insecure headers, OWASP Top 10 violations
- Evidence: [Arghajit47/Playwright-Security-Testing], [vijay-medium-zap-playwright], [kston83-playwright-zap-dast]
- **Gold suite usage: 0/10** — Experimental pattern, not adopted by Gold suites

**Pattern: Authenticated DAST scanning with storageState**
- Playwright authenticates and exports storageState.json
- ZAP receives authenticated session context for authenticated surface scanning
- Generates HTML reports per URL and unified CSV/Excel summary
- CI/CD integration via GitHub Actions (Docker-based ZAP)
- Evidence: [kston83-playwright-zap-dast]

**Pattern: Functional tests as passive security scanners**
- Route existing E2E test traffic through ZAP proxy
- No new test scripts needed; security scanning piggybacks on functional tests
- Passive scan only (no active probing) — safe for staging environments
- Evidence: [thanan-passive-scanning], [vijay-zap-playwright]

### 7. Application-Level Test Toggle

**Pattern: `NEXT_PUBLIC_IS_E2E=1` for test-specific behavior**
- Disables rate limiting, enables test endpoints, adjusts timeouts
- Minimizes divergence between test and production behavior
- Document every change the flag introduces
- MUST NOT change: auth flows, data validation, security boundaries
- Evidence: [calcom-e2e] (pioneered), [nextjs-e2e] (adopted)

### 8. API Security Testing

**Pattern: APIRequestContext with Bearer tokens**
- `extraHTTPHeaders` in config for global auth header injection
- All API requests automatically include Authorization header
- Supports Bearer tokens, API keys, custom auth headers
- Evidence: [playwright-api-testing-docs], [browserstack-api-testing-2026]

**Pattern: JWT token validation in tests**
- Extract JWT from login response; decode and validate claims
- Verify token expiry, subject, role claims
- Intercept tokens from network responses for validation
- Evidence: [mahtab-jwt-testing], [emir-jwt-capture]

**Pattern: API authorization boundary testing**
- Verify endpoints enforce role-based access control
- Test with user tokens against admin endpoints (expect 403)
- Test expired tokens (expect 401)
- Test missing tokens (expect 401)
- Evidence: [playwright-auth-security-guide], [aryadevi-securing-app], [neova-api-security]

### 9. MFA Testing

**Pattern: TOTP generation from shared secret**
- Store TOTP shared secret in environment variable / vault
- Use `otplib` or similar library to generate time-based codes
- Generate code at test time; enter into MFA prompt
- Feasible but requires secure storage of shared secret
- Evidence: [playwright-auth-security-guide], [ministry-of-testing-recipes]

**Pattern: MFA bypass in test environment**
- Configure test environment to skip MFA for designated test accounts
- Use E2E toggle flag to conditionally disable MFA
- Document clearly; test MFA flow separately in dedicated tests
- Evidence: [calcom-e2e] (E2E toggle pattern)

---

## Emerging Themes (Updated)

1. **Auth testing is the most mature security pattern** — storageState, setup projects, and REST API auth are well-established with Gold suite evidence
2. **Credential security has clear universal practices** — env vars, .gitignore, separate state files per role (10/10 Gold suites)
3. **RBAC testing is demonstrated at scale but under-adopted** — Grafana is the exemplar; most suites do not test permissions systematically
4. **Security validation (headers, cookies, CSRF) uses stable APIs** — All patterns use production-ready Playwright APIs, but no Gold suite implements them
5. **OWASP ZAP integration remains experimental** — Low adoption, low-star repos, better as a separate CI job
6. **MFA testing has no universal solution** — TOTP generation works; SMS/hardware keys remain unsolved
7. **Vault integration is enterprise-specific** — CI-native secrets (GitHub Secrets) are sufficient for most teams
8. **Security regression testing has no framework** — Teams must implement their own tagging (@security) and tracking

---

## Gaps Remaining After Security Phase

1. **No Gold suite demonstrates security validation testing** — All header/cookie/CSRF patterns come from blogs
2. **No standardized security regression framework** — No built-in way to track security test coverage
3. **OWASP ZAP integration lacks a maintained library** — Scattered scripts, not a polished tool
4. **MFA testing for SMS/hardware keys is unsolved** — Only TOTP from shared secret is feasible
5. **Artifact sanitization is undocumented** — No standard way to strip secrets from traces/HAR files
6. **SSO/OAuth testing is provider-specific** — Clerk, Auth0, Supabase each have their own patterns

---

## Open Questions (Updated)

1. ~~Should security scanning (ZAP) be integrated into E2E tests or run as a separate CI job?~~ **ANSWERED: Separate CI job is more practical; inline scanning is MAY.**
2. ~~How do teams test MFA flows without accessing real authenticator apps?~~ **ANSWERED: TOTP from shared secret, or MFA bypass in test env.**
3. ~~What session management edge cases should E2E tests cover?~~ **ANSWERED: Expiration, logout cleanup, sessionStorage, token lifecycle.**
4. ~~How do Gold suites prevent sensitive data exposure in test artifacts?~~ **PARTIALLY ANSWERED: .auth/ in .gitignore; artifact sanitization undocumented.**
5. ~~Should standards prescribe security testing, or leave it as an additive specialization?~~ **ANSWERED: Auth/credentials are MUST; validation is SHOULD/MAY.**
