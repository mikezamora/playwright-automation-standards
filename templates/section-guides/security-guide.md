# Security Guide

> Section guide for security testing standards. References: [security-standards.md](../../standards/security-standards.md) SEC1-SEC7.

---

## Purpose and Goals

Security testing in Playwright focuses on authentication, credential management, role-based access, and session handling. Goals:
- Authenticate via setup projects with `storageState`, never via UI in every test
- Keep credentials in environment variables, never in source code
- Test role-based access control by defining separate projects per role
- Validate session cleanup, cookie attributes, and security headers

---

## Key Standards

### SEC1.1 Setup Projects for Auth (MUST)

Auth MUST use setup projects, not `globalSetup`. Setup projects appear in reports, support traces, and participate in fixtures.

```typescript
// playwright.config.ts
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  {
    name: 'chromium',
    dependencies: ['setup'],
    use: { storageState: 'playwright/.auth/user.json' },
  },
],
```

```typescript
// auth.setup.ts
import { test as setup, expect } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.TEST_USER!);
  await page.getByLabel('Password').fill(process.env.TEST_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
```

### SEC1.2 Prefer API Auth (SHOULD)

When a REST endpoint exists, use it instead of navigating the login UI:

```typescript
const response = await request.post('/api/auth/login', {
  data: { email: process.env.TEST_USER!, password: process.env.TEST_PASSWORD! },
});
```

### SEC2.1 Never Hardcode Credentials (MUST)

```typescript
// Correct: environment variables
use: { baseURL: process.env.BASE_URL ?? 'http://localhost:3000' },

// Wrong: hardcoded
use: { httpCredentials: { username: 'admin', password: 'secret123' } },
```

### SEC2.2 Protect storageState Files (MUST)

`.auth/` directory MUST be in `.gitignore`:

```gitignore
playwright/.auth/
```

### SEC2.3 Separate storageState Per Role (MUST)

Each user role gets its own file: `.auth/admin.json`, `.auth/viewer.json`, `.auth/editor.json`.

### SEC3.1 Roles as Separate Projects (MUST for multi-role apps)

```typescript
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
],
```

### SEC3.3 Test Broken Access Control (SHOULD)

```typescript
test('user cannot access another user data', async ({ page }) => {
  await page.goto('/profile/user-2-id');
  await expect(page.locator('text=Access Denied')).toBeVisible();
});

test('unauthenticated access redirects to login', async ({ browser }) => {
  const context = await browser.newContext(); // No storageState
  const page = await context.newPage();
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
  await context.close();
});
```

---

## Code Example: Security Header Validation

```typescript
test('homepage has security headers', async ({ page }) => {
  const response = await page.goto('/');
  const headers = response!.headers();

  expect(headers['strict-transport-security']).toContain('max-age=');
  expect(headers['x-frame-options']).toMatch(/DENY|SAMEORIGIN/);
  expect(headers['x-content-type-options']).toBe('nosniff');
});

test('session cookie has security attributes', async ({ page, context }) => {
  // After login...
  const cookies = await context.cookies();
  const session = cookies.find(c => c.name === 'session_id');

  expect(session).toBeDefined();
  expect(session!.httpOnly).toBe(true);
  expect(session!.secure).toBe(true);
  expect(session!.sameSite).toBe('Strict');
});
```

---

## Common Pitfalls

| Pitfall | Why It Fails | Fix |
|---|---|---|
| `globalSetup` for auth | Loses report visibility, trace files, fixture access | Setup projects [SEC1.1] |
| Authenticating via UI in every test | 3-10s per test, auth-unrelated flakiness | `storageState` reuse [SEC1.7] |
| Hardcoded credentials in test files | Security risk if committed | Environment variables [SEC2.1] |
| Committing `.auth/` directory | Contains session tokens | Add to `.gitignore` [SEC2.2] |
| Single storageState for all roles | Prevents proper RBAC testing | Per-role files [SEC2.3] |
| Only testing authorized access | Misses access control boundaries | Test rejection of unauthorized access [SEC3.3] |
| `bypassCSP: true` for security tests | Defeats the purpose of CSP testing | `bypassCSP: false` for security tests [SEC5.6] |
| Relying solely on Playwright for security | Playwright is automation, not a scanner | Complement with DAST scanners [SEC6.4] |
| Undocumented E2E toggle effects | Toggle scope becomes unauditable | Document every behavior change [SEC7.1] |

---

## When to Deviate

- **UI login in setup:** Required when no API auth endpoint exists or for complex OAuth flows [SEC1.2].
- **MFA bypass:** Acceptable for non-MFA-specific tests via user-level flag, not global toggle [SEC1.6].
- **`globalSetup` for infrastructure:** Acceptable for Docker, database migration tasks that are truly global [SEC1.1].
- **Skip security header testing:** If your application is behind a reverse proxy that sets headers (Nginx, Cloudflare), test headers at the proxy level instead [SEC5.1].
- **No OWASP ZAP integration:** Most teams do not need it. Inline security assertions (headers, cookies, RBAC) provide high value with zero additional tooling [SEC6.1].
