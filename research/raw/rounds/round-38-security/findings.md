# Round 38 — Findings: Credential Management, API Security, and MFA Patterns

## Executive Summary

Credential management in Playwright test suites follows a clear maturity ladder: environment variables (universal), CI secret injection (standard), vault integration (enterprise). API security testing via Playwright's `APIRequestContext` is well-supported for token injection but under-adopted for security validation. MFA testing remains an unsolved problem with only workarounds documented.

---

## 1. Credential Management — The Maturity Ladder

### Tier 1: Environment Variables (Universal)

**Pattern: `process.env` for all credentials**
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
- Every Gold suite uses this pattern
- `.env` file for local development (never committed)
- `.env.example` or `.env.e2e.example` as template
- Evidence: 10/10 Gold suites

### Tier 2: CI Secret Injection (Standard)

**Pattern: GitHub Secrets -> env vars in workflow**
```yaml
# .github/workflows/e2e.yml
env:
  TEST_USER: ${{ secrets.E2E_TEST_USER }}
  TEST_PASSWORD: ${{ secrets.E2E_TEST_PASSWORD }}
  BASE_URL: ${{ secrets.E2E_BASE_URL }}
```
- Secrets never appear in logs (GitHub auto-masks)
- Each environment (staging, production) has its own secret set
- Evidence: [grafana-e2e], [calcom-e2e], all CI-enabled Gold suites

### Tier 3: Vault Integration (Enterprise)

**Pattern: Fetch secrets from vault at runtime**
```typescript
// globalSetup.ts
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

async function globalSetup() {
  const client = new SecretsManager({ region: 'us-east-1' });
  const secret = await client.getSecretValue({ SecretId: 'e2e/credentials' });
  const creds = JSON.parse(secret.SecretString!);
  process.env.TEST_USER = creds.username;
  process.env.TEST_PASSWORD = creds.password;
}
```

**Vault options documented:**
| Vault | Auth Method | Key Feature |
|-------|------------|-------------|
| HashiCorp Vault | OIDC, GitHub Actions JWT | Temporary secrets with TTL |
| AWS Secrets Manager | IAM Role, OIDC | SDK integration, auto-rotation |
| Azure Key Vault | DefaultAzureCredential, Managed Identity | ADO pipeline integration |
| GitHub Secrets | Built-in | Simplest; no external dependency |

- Gold suite evidence: 0/10 use vault integration (all use CI-native secrets)
- Enterprise evidence: KPMG UK Engineering (Azure Key Vault), blog patterns
- Verdict: Vault integration is justified for enterprises with existing vault infrastructure; overkill for most teams

---

## 2. API Security Testing with Playwright

### 2.1 Request Context Configuration

**Pattern: Global auth headers via APIRequestContext**
```typescript
// playwright.config.ts
use: {
  extraHTTPHeaders: {
    'Authorization': `Bearer ${process.env.API_TOKEN}`,
    'X-API-Key': process.env.API_KEY!,
  },
}
```
- All API requests automatically include auth headers
- Evidence: [playwright-api-testing-docs], [browserstack-api-testing]

### 2.2 JWT Token Testing

**Pattern: Extract, decode, and validate JWT claims**
```typescript
import { decode } from 'jsonwebtoken'; // or manual base64 decode

test('JWT contains expected claims', async ({ request }) => {
  const response = await request.post('/api/auth/login', {
    data: { username: 'test', password: 'test' }
  });
  const { token } = await response.json();
  const decoded = decode(token) as any;

  expect(decoded.sub).toBeDefined();
  expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
  expect(decoded.role).toBe('user');
});
```
- Evidence: [mahtab-jwt-testing], [emir-jwt-capture]

**Pattern: Intercept JWT from network responses**
```typescript
// Capture token from login response
let authToken: string;
page.on('response', async (response) => {
  if (response.url().includes('/api/auth')) {
    const body = await response.json();
    authToken = body.access_token;
  }
});
```
- Evidence: [emir-jwt-capture], [momentic-api-guide]

### 2.3 API Authorization Testing

**Pattern: Verify endpoints enforce authorization**
```typescript
test('regular user cannot access admin endpoints', async ({ request }) => {
  // Login as regular user
  const loginResponse = await request.post('/api/auth/login', {
    data: { username: 'user', password: 'user_pass' }
  });
  const { token } = await loginResponse.json();

  // Attempt admin action
  const adminResponse = await request.get('/api/admin/users', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  expect(adminResponse.status()).toBe(403);
});
```
- Evidence: [playwright-auth-security-guide], [aryadevi-securing-app]

---

## 3. MFA Testing Approaches

### 3.1 The MFA Problem

MFA (Multi-Factor Authentication) is inherently difficult to test in automation because:
- TOTP codes change every 30 seconds
- SMS/email codes require external service access
- Hardware keys cannot be programmatically operated

### 3.2 Documented Workarounds

**Pattern: TOTP generation from shared secret**
```typescript
import { authenticator } from 'otplib';

test('login with MFA', async ({ page }) => {
  await page.fill('#email', process.env.MFA_USER!);
  await page.fill('#password', process.env.MFA_PASSWORD!);
  await page.click('#login');

  // Generate TOTP from shared secret stored in env
  const totp = authenticator.generate(process.env.MFA_TOTP_SECRET!);
  await page.fill('#mfa-code', totp);
  await page.click('#verify');
});
```
- Requires access to the TOTP shared secret (stored securely)
- Evidence: [playwright-auth-security-guide], [ministry-of-testing-recipes]

**Pattern: Bypass MFA in test environment**
- Configure test environment to skip MFA for test user accounts
- Use `IS_E2E=1` toggle to disable MFA (must be test-only)
- Evidence: [calcom-e2e] (E2E toggle pattern)

**Pattern: Test MFA enrollment separately from MFA login**
- Enrollment: Test the setup flow (QR code display, backup codes)
- Login: Use TOTP generation from known secret
- Recovery: Test backup code usage
- Evidence: [playwright-auth-security-guide]

### 3.3 MFA Maturity Assessment

| Approach | Feasibility | Production-Ready |
|----------|------------|-----------------|
| TOTP from shared secret | High | Yes (if secret stored in vault) |
| MFA bypass in test env | High | Conditional (test env only) |
| SMS interception | Low | No (requires carrier integration) |
| Email code extraction | Medium | Yes (with Mailosaur/Mailtrap) |
| Hardware key simulation | Very Low | No |

---

## 4. Sensitive Data in Test Artifacts

### 4.1 The Artifact Exposure Risk

Playwright artifacts (traces, screenshots, videos, HAR files) can contain:
- Auth tokens in network requests
- Session cookies in trace files
- User data in screenshots
- API keys in request headers

### 4.2 Mitigation Patterns

**Pattern: Filter sensitive headers from traces**
- Use `trace: 'on-first-retry'` (not `'on'`) to limit trace generation
- Review trace files before publishing to external services
- Evidence: [playwright-auth-docs] (warning about storageState sensitivity)

**Pattern: Mask sensitive data in screenshots**
- Use `page.locator('.sensitive-data').evaluate(el => el.textContent = '***')` before screenshot
- Or use CSS: `await page.addStyleTag({ content: '.pii { filter: blur(5px) }' })`
- Evidence: Community patterns; no Gold suite evidence

**Pattern: HAR file sanitization**
- HAR files contain full request/response bodies
- Filter auth headers and tokens before storing as artifacts
- Evidence: Community patterns

---

## 5. Cross-Cutting Finding: Security Testing Divide

| Category | Maturity | Standard Recommendation |
|----------|---------|------------------------|
| Auth state management (storageState) | Production | MUST |
| Credential security (env vars, .gitignore) | Production | MUST |
| RBAC testing (multi-role projects) | Production | SHOULD |
| API auth testing (Bearer tokens, JWT) | Established | SHOULD |
| MFA testing (TOTP generation) | Documented | MAY |
| Cookie attribute validation | Documented | SHOULD (for security-critical apps) |
| HTTP security header testing | Documented | SHOULD (for security-critical apps) |
| CSP validation | Documented | MAY |
| CSRF testing | Documented | MAY |
| XSS payload testing | Experimental | MAY (prefer OWASP ZAP) |
| OWASP ZAP integration | Experimental | MAY |
| Vault integration | Enterprise | MAY |
