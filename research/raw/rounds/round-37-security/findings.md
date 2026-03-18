# Round 37 — Findings: Security Testing Patterns (Part 1)

## Executive Summary

Playwright security testing splits into two maturity tiers: (1) **authentication and credential management**, which is well-established with clear patterns from Gold suites, and (2) **vulnerability scanning, header validation, and OWASP integration**, which exists in blog posts and small repos but has zero adoption in Gold-standard suites. This round catalogs the patterns found for auth flows, CSRF, XSS, headers, cookies, and OWASP ZAP integration.

---

## 1. Authentication Flow Testing Patterns

### 1.1 Login Flow Testing

**Pattern: REST API login over UI login for test setup**
- Use `request.post()` to hit the login endpoint directly
- Extract session cookies/tokens from response
- Store in storageState for reuse across tests
- Evidence: [supabase-e2e], [grafana-plugin-e2e], [playwright-auth-docs]

**Pattern: Validate login error states**
- Test invalid credentials return appropriate error messages
- Test account lockout after N failed attempts (brute-force protection)
- Test rate limiting on login endpoints
- Evidence: [playwright-auth-security-guide], [neova-api-security]

### 1.2 Logout and Session Invalidation

**Pattern: Verify complete session cleanup on logout**
```typescript
// After logout action
const cookies = await context.cookies();
const sessionCookie = cookies.find(c => c.name === 'session_id');
expect(sessionCookie).toBeUndefined();

// Verify localStorage cleared
const storageValue = await page.evaluate(() => localStorage.getItem('auth_token'));
expect(storageValue).toBeNull();
```
- Evidence: [playwright-auth-security-guide], [aryadevi-securing-app]

### 1.3 Session Timeout Testing

**Pattern: Validate session expiration behavior**
- Set short session TTL in test environment
- Wait for expiration, attempt action
- Verify redirect to login or appropriate error
- Evidence: [playwright-auth-security-guide], [nareshit-secure-auth]

### 1.4 OAuth / SSO Flow Testing

**Pattern: Mock or bypass OAuth for E2E tests**
- Use test-specific auth endpoints that skip OAuth redirect
- Or intercept OAuth callback with `page.route()` to inject tokens
- Store resulting session in storageState
- Evidence: [clerk-e2e-template], [testdouble-nextjs-e2e], [bekapod-supabase-magic]

---

## 2. CSRF Token Validation Testing

### 2.1 Token Extraction and Reuse

**Pattern: Extract CSRF token from HTML or API response**
```typescript
// Extract CSRF token from page
const csrfToken = await page.locator('meta[name="csrf-token"]').getAttribute('content');
// Or from hidden form field
const csrfToken = await page.locator('input[name="_csrf"]').inputValue();

// Include in subsequent API requests
const response = await request.post('/api/action', {
  headers: { 'X-CSRF-Token': csrfToken },
  data: { ... }
});
```
- Evidence: [team-merlin-token-testing], [serhii-csrf-auth]

### 2.2 CSRF Validation Testing

**Pattern: Verify requests without CSRF token are rejected**
```typescript
// Intentionally omit CSRF token
const response = await request.post('/api/action', {
  data: { ... }
  // No CSRF header
});
expect(response.status()).toBe(403); // Forbidden
```
- Evidence: [team-merlin-token-testing], [oscar-csrf-cve], [neova-api-security]

### 2.3 Token Lifecycle Testing

**Pattern: Verify token uniqueness and invalidation**
- Each session should get a unique CSRF token
- Tokens from previous sessions should not be accepted
- Tokens should not be reusable across different users
- Evidence: [team-merlin-token-testing]

---

## 3. XSS Detection Patterns

### 3.1 Input Payload Injection

**Pattern: Inject XSS payloads into form fields and verify sanitization**
```typescript
const xssPayloads = [
  '<script>alert("xss")</script>',
  '<img src=x onerror=alert(1)>',
  '"><script>alert(document.cookie)</script>',
  "javascript:alert('XSS')",
];

for (const payload of xssPayloads) {
  await page.fill('#comment-field', payload);
  await page.click('#submit');
  // Verify payload is sanitized in output
  const content = await page.locator('#comment-display').innerHTML();
  expect(content).not.toContain('<script>');
  expect(content).not.toContain('onerror=');
}
```
- Evidence: [neova-api-security], [arghajit47-playwright-security]

### 3.2 Reflected XSS via URL Parameters

**Pattern: Test URL parameter injection**
```typescript
await page.goto('/search?q=<script>alert(1)</script>');
const content = await page.content();
expect(content).not.toContain('<script>alert(1)</script>');
```
- Evidence: [neova-api-security]

### 3.3 OWASP ZAP for Automated XSS Detection

**Pattern: Proxy Playwright traffic through ZAP for passive XSS detection**
- ZAP passively scans all traffic for XSS indicators
- More comprehensive than manual payload testing
- Detects stored, reflected, and DOM-based XSS patterns
- Evidence: [arghajit47-playwright-security], [vijay-zap-playwright]

---

## 4. HTTP Security Header Testing

### 4.1 Response Header Validation

**Pattern: Assert security headers on responses**
```typescript
const response = await page.goto('/');
const headers = response.headers();

// HSTS
expect(headers['strict-transport-security']).toContain('max-age=');
expect(headers['strict-transport-security']).toContain('includeSubDomains');

// Clickjacking protection
expect(headers['x-frame-options']).toBe('DENY');
// Or: expect(headers['x-frame-options']).toBe('SAMEORIGIN');

// MIME sniffing protection
expect(headers['x-content-type-options']).toBe('nosniff');

// XSS protection (legacy but still checked)
expect(headers['x-xss-protection']).toBeDefined();
```
- Evidence: [aryadevi-securing-app], [team-merlin-header-testing]

### 4.2 Content Security Policy Validation

**Pattern: Verify CSP header is present and well-formed**
```typescript
const response = await page.goto('/');
const csp = response.headers()['content-security-policy'];
expect(csp).toBeDefined();
expect(csp).toContain("default-src");
expect(csp).not.toContain("'unsafe-inline'"); // If applicable
expect(csp).not.toContain("'unsafe-eval'");   // If applicable
```
- Evidence: [aryadevi-securing-app], [devika-csp-playwright]

### 4.3 Playwright bypassCSP for Test Infrastructure

**Pattern: Use bypassCSP for test scripts, but test CSP separately**
- `bypassCSP: true` lets test scripts run despite strict CSP
- This is for test infrastructure, NOT a security test
- Dedicated CSP tests should verify the header with bypassCSP off
- Evidence: [playwright-test-options], [devika-csp-playwright]

---

## 5. Cookie Security Attribute Testing

### 5.1 Inspect Cookie Flags

**Pattern: Validate security attributes on session cookies**
```typescript
await page.goto('/login');
// Perform login...
const cookies = await context.cookies();
const sessionCookie = cookies.find(c => c.name === 'session_id');

expect(sessionCookie).toBeDefined();
expect(sessionCookie.httpOnly).toBe(true);
expect(sessionCookie.secure).toBe(true);
expect(sessionCookie.sameSite).toBe('Strict'); // or 'Lax'
```
- Evidence: [browserstack-cookies], [playwright-browsercontext-api], [aryadevi-securing-app]

### 5.2 SameSite Attribute Validation

**Pattern: Verify SameSite=None requires Secure flag**
```typescript
const cookies = await context.cookies();
for (const cookie of cookies) {
  if (cookie.sameSite === 'None') {
    expect(cookie.secure).toBe(true);
    // SameSite=None without Secure is rejected by modern browsers
  }
}
```
- Evidence: [playwright-issue-36225], [browserstack-cookies]

---

## 6. OWASP ZAP + Playwright Integration

### 6.1 Proxy-Based Integration

**Pattern: Route Playwright traffic through ZAP proxy**
```typescript
// playwright.config.ts for ZAP integration
export default defineConfig({
  use: {
    proxy: {
      server: 'http://localhost:8080', // ZAP proxy
    },
    ignoreHTTPSErrors: true, // ZAP uses self-signed cert
  },
});
```
- Evidence: [arghajit47-playwright-security], [vijay-zap-playwright], [kston83-playwright-zap-dast]

### 6.2 Authenticated DAST Scanning

**Pattern: Use Playwright for auth, ZAP for scanning**
- Playwright runs global-setup to authenticate
- Exports storageState.json with session cookies
- ZAP receives authenticated session context
- ZAP performs spider + active scan on authenticated surface
- Evidence: [kston83-playwright-zap-dast]

### 6.3 CI/CD Integration

**Pattern: ZAP scanning in GitHub Actions**
- Start ZAP as Docker container in CI
- Run Playwright tests proxied through ZAP
- ZAP generates HTML report as CI artifact
- Fail pipeline on high/critical severity findings
- Evidence: [kston83-playwright-zap-dast], [arghajit47-playwright-security]

### 6.4 Maturity Assessment

| Aspect | Status |
|--------|--------|
| Community repos exist | Yes (2-3 active repos) |
| Blog coverage | Moderate (5+ articles in 2025) |
| Gold suite adoption | 0/10 |
| Production-grade tooling | Early — scripts, not libraries |
| CI/CD patterns | Basic (GitHub Actions examples) |
| Active maintenance | Low — most repos have <50 stars |

**Verdict:** OWASP ZAP integration is **viable but experimental**. Use for security audits, not as part of the standard E2E pipeline.

---

## Key Insight

The divide is clear: **auth testing is a first-class Playwright concern** (official docs, Gold suites, fixtures, storageState). **Everything else in security testing** (headers, cookies, CSRF, XSS, OWASP) **is a secondary concern** handled by intercepting responses, inspecting cookies, or integrating external tools. Standards should reflect this divide.
