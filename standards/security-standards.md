# Security Standards

> **DEFINITIVE — validated in security phase (rounds 37-40)**
> Auth and credential patterns have strong Gold suite evidence (4-10/10). Security validation patterns (headers, cookies, CSRF) use stable Playwright APIs but lack Gold suite adoption — marked SHOULD/MAY accordingly.

---

## SEC1. Authentication Testing

### SEC1.1 Use setup projects with storageState for auth — MUST

Auth MUST be handled via Playwright setup projects, not `globalSetup`.

- storageState persists cookies and localStorage to `.auth/<username>.json`
- Setup projects appear in HTML reports, are debuggable in trace viewer, and participate in fixtures
- Each role (admin, viewer, editor) has its own setup file and storageState output

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'setup', testDir: './tests/auth', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: { storageState: 'playwright/.auth/user.json' },
    },
  ],
});
```

**Alternatives:**
- `globalCache.get()` for on-demand auth in sharded suites (see SEC1.3)
- `globalSetup` for single-role, simple apps (less debuggable)

**Anti-patterns:**
- Using `globalSetup` when setup projects are available (lose report visibility)
- Authenticating in `beforeEach` of every test (slow, flaky)

**Basis:** [grafana-e2e, supabase-e2e, grafana-plugin-e2e, playwright-auth-docs]; official recommendation since v1.31

### SEC1.2 Prefer REST API authentication over UI login — SHOULD

Auth setup SHOULD use REST API calls rather than navigating the login UI.

- One HTTP call vs. navigation + form fill + redirect; eliminates UI-dependent flakiness
- Extract session cookies/tokens from response; save in storageState

```typescript
// auth.setup.ts
const response = await request.post('/api/auth/login', {
  data: { email: process.env.TEST_USER, password: process.env.TEST_PASSWORD }
});
const { token } = await response.json();
// Store in context and save state
```

**Alternatives:**
- UI login when API endpoint is unavailable or auth flow is complex (OAuth)
- `httpCredentials` option for HTTP Basic Auth

**Anti-patterns:**
- Navigating the login page in setup when a REST endpoint exists
- Parsing login UI for CSRF tokens when the API handles it directly

**Basis:** [supabase-e2e (REST API login), grafana-plugin-e2e (HTTP API provisioning)]

### SEC1.3 Use on-demand auth with globalCache for sharded suites — SHOULD

In sharded execution, authenticate only for roles actually needed per shard.

- `globalCache.get()` caches auth state across workers within a shard
- Avoids eagerly authenticating all roles in every shard
- Worker-scoped fixture pattern

```typescript
const authFixture = base.extend<{}, { authState: string }>({
  authState: [async ({}, use) => {
    const state = await globalCache.get('admin-auth', async () => {
      // Perform auth, return storageState string
    });
    await use(state);
  }, { scope: 'worker' }],
});
```

**Alternatives:**
- Setup projects with dependencies (simpler but authenticates all roles per shard)

**Anti-patterns:**
- Authenticating every role in globalSetup when only some shards need them

**Basis:** [devto-ondemand-auth (Vitalets), devto-global-cache]

### SEC1.4 Validate logout completes session cleanup — SHOULD

Tests covering logout SHOULD verify that session state is fully cleared.

- Check session cookies are removed after logout
- Verify localStorage auth tokens are cleared
- Confirm navigation after logout redirects to login

```typescript
test('logout clears session', async ({ page, context }) => {
  await page.click('#logout');
  const cookies = await context.cookies();
  expect(cookies.find(c => c.name === 'session_id')).toBeUndefined();

  const token = await page.evaluate(() => localStorage.getItem('auth_token'));
  expect(token).toBeNull();

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});
```

**Anti-patterns:**
- Only checking redirect without verifying cookie/storage cleanup

**Basis:** [playwright-auth-security-guide], [aryadevi-securing-app]

### SEC1.5 Test API authorization boundaries — SHOULD

API tests SHOULD verify that endpoints enforce role-based access control.

- Use APIRequestContext with role-specific tokens
- Verify regular users receive 403 on admin endpoints
- Verify expired/missing tokens receive 401

```typescript
test('user cannot access admin endpoint', async ({ request }) => {
  const loginRes = await request.post('/api/auth/login', {
    data: { username: 'regular_user', password: process.env.USER_PASSWORD }
  });
  const { token } = await loginRes.json();

  const adminRes = await request.get('/api/admin/users', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  expect(adminRes.status()).toBe(403);
});
```

**Anti-patterns:**
- Only testing the happy path (authorized access succeeds) without testing rejection
- Using admin credentials for all API tests

**Basis:** [playwright-auth-security-guide], [aryadevi-securing-app], [neova-api-security]

### SEC1.6 MFA testing approaches — MAY

MFA testing MAY use TOTP generation from a shared secret stored in env vars or vault.

- Use `otplib` or similar to generate time-based codes
- Store TOTP shared secret securely (env var or vault, never in code)
- Alternative: bypass MFA in test environment via E2E toggle for non-MFA-specific tests
- Test MFA enrollment flow and backup code usage in dedicated tests

**Anti-patterns:**
- Hardcoding TOTP secrets in test files
- Disabling MFA in production-like environments

**Basis:** [playwright-auth-security-guide], [ministry-of-testing-auth-recipes], [calcom-e2e (toggle)]

### SEC1.7 Do NOT authenticate via UI in every test — MUST NOT

Each test MUST NOT perform full UI login.

- UI login is slow (3-10s per test) and introduces auth-unrelated flakiness
- Use storageState reuse or API auth for setup
- Exception: tests that specifically verify the login flow itself

**Basis:** [playwright-auth-docs], [playwright-best-practices], 4/10 Gold suites use storageState reuse

---

## SEC2. Credential Security

### SEC2.1 Never hardcode credentials — MUST

Credentials MUST be injected via environment variables, never hardcoded in config or test files.

- CI: use GitHub Secrets, AWS Secrets Manager, or equivalent vault
- Local: use `.env.e2e.example` as template (never commit `.env`)
- `process.env.VARIABLE_NAME` for all credential references

```typescript
// playwright.config.ts
use: {
  baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
  httpCredentials: {
    username: process.env.TEST_USER!,
    password: process.env.TEST_PASSWORD!,
  },
}
```

**Alternatives:**
- Vault integration for enterprise environments (HashiCorp Vault, Azure Key Vault, AWS Secrets Manager)

**Anti-patterns:**
- Credentials in playwright.config.ts values
- Credentials in test file constants
- Credentials in fixture code

**Basis:** 10/10 Gold suites; [calcom-e2e, grafana-e2e, immich-e2e]; universal practice

### SEC2.2 Protect storageState files — MUST

`.auth/` directory MUST be in `.gitignore`.

- storageState files contain session tokens, auth cookies, and user data
- Playwright docs warn: "browser state file may contain sensitive cookies and headers"
- Convention: `playwright/.auth/<username>.json`

```gitignore
# .gitignore
playwright/.auth/
```

**Anti-patterns:**
- Committing .auth/ directory to git
- Sharing storageState files between developers/environments

**Basis:** [playwright-auth-docs, grafana-e2e, grafana-plugin-e2e]

### SEC2.3 Use separate storageState per role — MUST

Each user role (admin, viewer, editor) MUST have its own storageState file.

- Prevents accidental privilege escalation in tests
- Enables proper RBAC testing with role isolation
- Convention: `.auth/admin.json`, `.auth/viewer.json`, `.auth/editor.json`

**Anti-patterns:**
- Sharing a single storageState across roles
- Re-authenticating as different roles within the same test without separate contexts

**Basis:** [grafana-e2e (30+ roles), grafana-plugin-e2e], [playwright-auth-docs]

### SEC2.4 Protect credentials in CI pipelines — SHOULD

CI pipelines SHOULD use native secret management (GitHub Secrets, GitLab CI Variables, Azure Pipelines Secret Variables).

```yaml
# .github/workflows/e2e.yml
env:
  TEST_USER: ${{ secrets.E2E_TEST_USER }}
  TEST_PASSWORD: ${{ secrets.E2E_TEST_PASSWORD }}
```

- Secrets auto-masked in CI logs
- Each environment (staging, production) has its own secret set
- Rotate secrets periodically

**Alternatives:**
- Vault integration (HashiCorp, AWS, Azure) for teams with existing vault infrastructure

**Anti-patterns:**
- Passing credentials as plain-text workflow inputs
- Sharing secret values across environments

**Basis:** [grafana-e2e], [calcom-e2e], all CI-enabled Gold suites; [sajith-credential-management]

### SEC2.5 Manage test users programmatically — SHOULD

Test users SHOULD be provisioned via API during test setup and cleaned up in teardown.

- No manual user creation; no shared test accounts between developers
- Each environment gets its own test users with appropriate permissions
- Users created in setup, optionally deleted in teardown

```typescript
// auth.setup.ts
const adminAPI = request.newContext({ baseURL: process.env.ADMIN_API_URL });
const user = await adminAPI.post('/api/admin/users', {
  data: { username: 'test-user', role: 'viewer', password: generatePassword() }
});
```

**Anti-patterns:**
- Manually creating test users in each environment
- Sharing test accounts between team members (concurrent runs conflict)

**Basis:** [grafana-plugin-e2e (Grafana HTTP API for user provisioning)]

### SEC2.6 Vault integration for enterprise credential management — MAY

Enterprise teams MAY integrate vault solutions for dynamic, short-lived test credentials.

| Vault | Integration Pattern |
|-------|-------------------|
| HashiCorp Vault | OIDC/JWT auth from CI; temporary secrets with TTL |
| AWS Secrets Manager | IAM Role auth; SDK fetch in globalSetup |
| Azure Key Vault | DefaultAzureCredential; Managed Identity in ADO |
| GitHub Secrets | Built-in; simplest; sufficient for most teams |

**Anti-patterns:**
- Using vault integration when GitHub Secrets is sufficient (over-engineering)
- Not setting secret TTL/expiration on vault-provided credentials

**Basis:** [hoop-vault-playwright], [hoop-aws-secrets-playwright], [dougan-azure-keyvault]

### SEC2.7 Do NOT commit .env or credential files — MUST NOT

`.env` files and any file containing credentials MUST NOT be committed to version control.

- Only `.env.example` or `.env.e2e.example` templates (with placeholder values) are committed
- Add to `.gitignore`: `.env`, `.env.local`, `.env.*.local`, `playwright/.auth/`
- Use git pre-commit hooks to detect accidental credential commits

**Anti-patterns:**
- Committing `.env` with real values (even temporarily)
- Committing storageState JSON files
- Using `git add .` without reviewing staged files

**Basis:** 10/10 Gold suites; [calcom-e2e (.env.e2e.example)]; universal security practice

---

## SEC3. Role-Based Access Control (RBAC)

### SEC3.1 Define roles as separate Playwright projects — MUST (for multi-role apps)

Applications with multiple user roles MUST define each role as a separate Playwright project with its own auth state.

- Each project has a dependency on its role-specific auth setup
- Tests verify permissions from each role's perspective
- Enables parallel execution per role

```typescript
// playwright.config.ts
projects: [
  { name: 'auth-admin', testMatch: /auth\.admin\.setup\.ts/ },
  { name: 'auth-viewer', testMatch: /auth\.viewer\.setup\.ts/ },
  {
    name: 'admin-tests',
    dependencies: ['auth-admin'],
    use: { storageState: '.auth/admin.json' },
  },
  {
    name: 'viewer-tests',
    dependencies: ['auth-viewer'],
    use: { storageState: '.auth/viewer.json' },
  },
]
```

**Alternatives:**
- Role-parameterized tests with `test.use()` for simpler setups
- On-demand auth fixtures for sharded execution

**Anti-patterns:**
- Running all tests as admin and assuming lower roles "would work too"
- Using a single project for all roles

**Basis:** [grafana-e2e (30+ role-based projects)], [grafana-plugin-e2e]

### SEC3.2 Provision test users via API — SHOULD

Test users SHOULD be created programmatically via admin API during setup.

- No manual user creation; no shared test accounts between environments
- User creation in setup project; optional cleanup in teardown
- Least-privilege principle: give test users only the permissions they need

**Anti-patterns:**
- Manually managing test accounts across environments
- Using a single "god mode" admin account for all tests

**Basis:** [grafana-plugin-e2e (Grafana HTTP API for user provisioning)], [awesome-testing-mcp-security]

### SEC3.3 Test broken access control — SHOULD

Tests SHOULD verify that access control boundaries are enforced.

- Test URL parameter manipulation (user A cannot access user B's resources)
- Verify unauthenticated users are redirected from protected routes
- Test API endpoints reject unauthorized role tokens

```typescript
test('user cannot access another user data', async ({ page }) => {
  // Logged in as user-1
  await page.goto('/profile/user-2-id');
  await expect(page.locator('text=Access Denied')).toBeVisible();
});

test('unauthenticated access redirects to login', async ({ browser }) => {
  const context = await browser.newContext(); // No storageState
  const page = await context.newPage();
  const response = await page.goto('/dashboard');
  expect(response?.url()).toContain('/login');
  await context.close();
});
```

**Anti-patterns:**
- Only testing that authorized users CAN access resources (not that unauthorized CANNOT)

**Basis:** [playwright-auth-security-guide], [aryadevi-securing-app]

### SEC3.4 Use multi-context testing for user interaction workflows — SHOULD

Tests involving multiple user roles interacting SHOULD use separate browser contexts.

```typescript
test('admin approves user request', async ({ browser }) => {
  const adminContext = await browser.newContext({ storageState: '.auth/admin.json' });
  const userContext = await browser.newContext({ storageState: '.auth/user.json' });
  const adminPage = await adminContext.newPage();
  const userPage = await userContext.newPage();

  // User submits, admin approves, user sees result
  // ...

  await adminContext.close();
  await userContext.close();
});
```

**Anti-patterns:**
- Switching users by logging in/out within the same context (slow, leaks state)

**Basis:** [playwright-auth-docs], [ministry-of-testing-discussions], [neova-multi-user]

### SEC3.5 Tag security tests for regression tracking — MAY

Security-critical tests MAY use the `@security` tag for targeted execution.

```typescript
test('admin route rejects viewer @security', async ({ page }) => { ... });
// Run: npx playwright test --grep @security
```

**Basis:** Community pattern; enables security regression tracking without additional tooling

---

## SEC4. Session Management

### SEC4.1 Handle storageState limitations — MUST

storageState captures cookies and localStorage but NOT sessionStorage.

- If your application uses sessionStorage for auth, persist/restore via `addInitScript()`
- Document which auth mechanism your application uses (cookies, localStorage, sessionStorage)

```typescript
// Restore sessionStorage
test.use({
  storageState: async ({}, use) => {
    // Load cookies/localStorage from file
    // Then add sessionStorage restoration
  },
});

// Or use addInitScript for sessionStorage
page.addInitScript(() => {
  window.sessionStorage.setItem('key', 'value');
});
```

**Anti-patterns:**
- Assuming storageState captures sessionStorage (it does not)
- Not documenting which storage mechanism your app uses

**Basis:** [playwright-official, playwright-auth-docs]

### SEC4.2 Account for session expiration in long suites — SHOULD

Long-running test suites SHOULD handle session expiration gracefully.

- Set test environment session TTL longer than expected suite duration
- Or implement re-auth middleware in beforeEach

```typescript
test.beforeEach(async ({ page }) => {
  const response = await page.goto('/dashboard');
  if (response?.url().includes('/login')) {
    // Session expired — re-authenticate
    await performLogin(page);
    await page.context().storageState({ path: authFile });
  }
});
```

**Alternatives:**
- Configure test environment with longer session TTL (preferred — simpler)

**Anti-patterns:**
- Ignoring session expiration (leads to unexplained failures mid-suite)

**Basis:** [playwright-auth-security-guide]

### SEC4.3 Validate token lifecycle — SHOULD

Tests for applications using JWT or session tokens SHOULD verify token behavior.

- Tokens are unique per session
- Old tokens are invalidated after logout or refresh
- Tokens cannot be reused across different users
- Expired tokens are properly rejected

**Anti-patterns:**
- Testing only that valid tokens work (not testing invalidation)

**Basis:** [team-merlin-token-testing], [mahtab-jwt-testing]

### SEC4.4 Test session storage cleanup on logout — MAY

If tests cover the logout flow, they MAY verify that all session storage mechanisms are cleared.

- Cookies, localStorage, and sessionStorage
- IndexedDB (if used for auth state)
- Service worker caches (if used for auth)

**Basis:** [playwright-auth-security-guide], [aryadevi-securing-app]

### SEC4.5 Do NOT use shared browser contexts across auth states — MUST NOT

Tests MUST NOT reuse a browser context across different authentication states.

- Each auth state requires its own context
- Switching users within a context can leak cookies, localStorage, and in-memory state
- Use `browser.newContext()` for each role

**Anti-patterns:**
- Clearing cookies manually and re-logging in the same context
- Using `page.goto('/logout')` followed by new login in the same context

**Basis:** [playwright-auth-docs (isolation)], [playwright-isolation-docs]

---

## SEC5. Security Validation

> **NOTE:** These standards use stable Playwright APIs (response.headers(), context.cookies()) but are NOT demonstrated in Gold-standard suites. They are recommended for security-critical applications.

### SEC5.1 Validate HTTP security headers on critical pages — SHOULD

Security-critical applications SHOULD test for the presence and correctness of HTTP security headers.

```typescript
test('homepage has security headers', async ({ page }) => {
  const response = await page.goto('/');
  const headers = response!.headers();

  expect(headers['strict-transport-security']).toContain('max-age=');
  expect(headers['x-frame-options']).toMatch(/DENY|SAMEORIGIN/);
  expect(headers['x-content-type-options']).toBe('nosniff');
});
```

**Which headers to test:**
| Header | Purpose | Recommendation |
|--------|---------|---------------|
| Strict-Transport-Security | Force HTTPS | Check max-age >= 31536000 |
| X-Frame-Options | Prevent clickjacking | DENY or SAMEORIGIN |
| X-Content-Type-Options | Prevent MIME sniffing | nosniff |
| Content-Security-Policy | Restrict resource loading | Present; no unsafe-inline |
| Referrer-Policy | Control referrer leakage | strict-origin-when-cross-origin |
| Permissions-Policy | Restrict browser features | Present (app-specific) |

**Alternatives:**
- Use OWASP ZAP for comprehensive header scanning (more thorough)
- Use a dedicated security header checker in CI (e.g., securityheaders.com API)

**Anti-patterns:**
- Testing headers only on the homepage (check API endpoints and error pages too)

**Basis:** [aryadevi-securing-app], [team-merlin-header-testing]; stable Playwright API

### SEC5.2 Validate cookie security attributes — SHOULD

Session cookies SHOULD be checked for proper security flags.

```typescript
test('session cookie has security attributes', async ({ page, context }) => {
  await page.goto('/login');
  // ... perform login ...
  const cookies = await context.cookies();
  const session = cookies.find(c => c.name === 'session_id');

  expect(session).toBeDefined();
  expect(session!.httpOnly).toBe(true);     // Not accessible to JavaScript
  expect(session!.secure).toBe(true);       // Only sent over HTTPS
  expect(session!.sameSite).toBe('Strict'); // Or 'Lax' depending on app needs
});
```

**Key rules:**
- httpOnly: MUST be true for session cookies (prevents XSS token theft)
- secure: MUST be true in production (HTTPS only)
- sameSite: Strict or Lax recommended; None requires Secure

**Anti-patterns:**
- Not checking cookies at all after login flow changes
- Accepting SameSite=None without Secure flag

**Basis:** [browserstack-cookies], [playwright-browsercontext-api], [aryadevi-securing-app]

### SEC5.3 Validate Content Security Policy — MAY

Applications with strict CSP policies MAY test that the CSP header is properly configured.

```typescript
test('CSP header is present and restrictive', async ({ page }) => {
  const response = await page.goto('/');
  const csp = response!.headers()['content-security-policy'];
  expect(csp).toBeDefined();
  expect(csp).toContain("default-src");
  // Assert no unsafe directives (if applicable)
  expect(csp).not.toContain("'unsafe-eval'");
});
```

**Important:** Use `bypassCSP: true` for test infrastructure scripts (e.g., injecting test helpers) but run CSP validation tests with `bypassCSP: false` (default).

**Anti-patterns:**
- Using bypassCSP globally and never testing CSP
- Testing CSP with bypassCSP: true (defeats the purpose)

**Basis:** [devika-csp-playwright], [aryadevi-securing-app]

### SEC5.4 Test CSRF token validation — MAY

Applications using CSRF tokens MAY verify that requests without valid tokens are rejected.

```typescript
test('request without CSRF token is rejected', async ({ request }) => {
  const response = await request.post('/api/action', {
    data: { key: 'value' }
    // Intentionally omit CSRF token
  });
  expect(response.status()).toBe(403);
});

test('CSRF token is present in forms', async ({ page }) => {
  await page.goto('/form-page');
  const csrfInput = page.locator('input[name="_csrf"]');
  await expect(csrfInput).toBeAttached();
  const value = await csrfInput.inputValue();
  expect(value).toBeTruthy();
});
```

**Anti-patterns:**
- Extracting CSRF tokens and hardcoding them in test data

**Basis:** [team-merlin-token-testing], [serhii-csrf-auth], [oscar-csrf-cve]

### SEC5.5 XSS payload testing — MAY (with caveats)

Applications MAY include basic XSS payload injection tests for critical input fields.

```typescript
const payloads = [
  '<script>alert("xss")</script>',
  '<img src=x onerror=alert(1)>',
  '"><script>alert(document.cookie)</script>',
];

for (const payload of payloads) {
  test(`sanitizes XSS: ${payload.slice(0, 20)}`, async ({ page }) => {
    await page.fill('#input', payload);
    await page.click('#submit');
    const html = await page.locator('#output').innerHTML();
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('onerror=');
  });
}
```

**Caveats:**
- Playwright XSS testing covers output encoding only — not comprehensive XSS scanning
- Dedicated scanners (OWASP ZAP, Burp Suite) are far more thorough
- Use Playwright for regression testing of known XSS fixes, not discovery

**Anti-patterns:**
- Relying on Playwright alone for XSS security coverage
- Testing only a few payloads and declaring the app "XSS-safe"

**Basis:** [neova-api-security], [arghajit47-playwright-security]

### SEC5.6 Do NOT use bypassCSP for security validation tests — MUST NOT

Security validation tests MUST NOT use `bypassCSP: true`.

- bypassCSP is meant for test infrastructure (injecting helpers, modifying DOM for test purposes)
- Security tests for CSP must run with CSP enforcement enabled
- Create a separate project or test.describe for security tests with `bypassCSP: false`

**Basis:** [playwright-test-options]; logical requirement for CSP testing validity

---

## SEC6. Security Scanning Integration

> **NOTE:** These patterns are observed in blog posts and small repos but NOT in Gold-standard suites. They are experimental.

### SEC6.1 Consider inline security assertions for common checks — SHOULD

The simplest security scanning approach is inline assertions in existing tests.

- Check response headers for security requirements
- Validate cookie attributes after login
- Assert CSRF tokens on form pages
- Zero additional tooling; uses stable Playwright APIs

**When to use:** Every security-critical application. Low overhead, high value.

**Basis:** All Tier 2 patterns in SEC5; stable Playwright APIs

### SEC6.2 Consider OWASP ZAP for comprehensive scanning — MAY

Teams with security requirements MAY integrate OWASP ZAP for passive or active scanning.

```typescript
// playwright.config.ts — ZAP proxy integration
use: {
  proxy: { server: 'http://localhost:8080' }, // ZAP proxy
  ignoreHTTPSErrors: true, // ZAP self-signed cert
}
```

**Integration models:**
1. **Proxy-based passive scan** — Route test traffic through ZAP; zero test changes
2. **Authenticated spider** — Playwright authenticates; ZAP spiders authenticated surface
3. **Separate CI job** — ZAP runs independently of E2E tests (recommended for most teams)

**Anti-patterns:**
- Making ZAP integration block every PR (too slow, too noisy for PR workflow)

**Basis:** [arghajit47-playwright-security], [kston83-playwright-zap-dast], [vijay-zap-playwright]

### SEC6.3 Consider security scanning as a separate CI job — MAY

Security scanning MAY run as an independent CI job rather than integrated into the E2E pipeline.

- Advantages: no E2E test slowdown; dedicated scanning configuration; separate failure tracking
- Run weekly or nightly, not on every PR
- Use OWASP ZAP, Burp Suite, or commercial DAST tools

**Basis:** [woocommerce-issue-44638], [kston83-playwright-zap-dast]; industry practice

### SEC6.4 Do NOT rely solely on Playwright for security testing — MUST NOT

Playwright is an automation tool, not a security scanner. It MUST NOT be the only security testing approach.

- Playwright can validate specific security behaviors (headers, cookies, access control)
- It cannot discover unknown vulnerabilities, perform fuzzing, or run comprehensive scans
- Combine with: DAST scanners, SAST tools, dependency auditing, penetration testing

**Basis:** Fundamental security testing principle; [aryadevi-securing-app]

---

## SEC7. Application Test Toggle

### SEC7.1 Minimize the scope of E2E toggles — MUST

If using a test toggle (e.g., `NEXT_PUBLIC_IS_E2E=1`), the toggle MUST have minimal scope.

- Toggle SHOULD only affect: rate limiting, test-specific endpoints, analytics tracking
- Document every behavior change the toggle introduces
- Toggle scope must be auditable

**Anti-patterns:**
- Undocumented toggle effects
- Toggle that changes 10+ behaviors without documentation

**Basis:** [calcom-e2e (pioneered), nextjs-e2e (adopted)]

### SEC7.2 Restrict what toggles can change — SHOULD

E2E toggles SHOULD NOT change security-related behavior.

- Toggle SHOULD NOT change: auth flows, data validation, permission checks, encryption
- If MFA bypass is needed, use a dedicated test-user flag, not a global toggle
- If rate limiting bypass is needed, increase limits rather than disabling

**Basis:** [calcom-e2e], security best practice

### SEC7.3 Do NOT use E2E toggles to bypass auth or security validation — MUST NOT

E2E toggles MUST NOT disable authentication, authorization, or data validation.

- Tests that bypass auth do not test the real application
- Security bypasses in test toggles create a false sense of test coverage
- Exception: MFA bypass for non-MFA-specific tests (SEC1.6), which should use user-level flags, not global toggles

**Basis:** Security fundamental; [calcom-e2e (toggle scope documentation)]

---

## Revision History

| Date | Change | Basis |
|---|---|---|
| 2026-03-18 | Initial draft from landscape rounds 1-12 | Auth: strong evidence (4/10 Gold); broader security: thin |
| 2026-03-18 | DEFINITIVE version from security rounds 37-40 | 37 standards; auth/credentials validated; security validation expanded; OWASP confirmed experimental |
