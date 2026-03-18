# Round 39 — Findings: Deep Dive — Auth State, Multi-Role, Secrets, Security Regression

## Executive Summary

Auth state management in Playwright is a solved problem with multiple production-ready patterns. Multi-role testing is well-demonstrated by Grafana but under-adopted elsewhere. Secret management follows industry-standard practices (env vars + CI secrets). Security regression testing is an emerging practice with no standardized framework.

---

## 1. Auth State Management Across Tests — Detailed Analysis

### 1.1 The Canonical Pattern: Setup Projects

```typescript
// playwright.config.ts — Official recommendation
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

**How storageState works internally:**
- `page.context().storageState({ path })` serializes cookies + localStorage to JSON
- On test start, Playwright creates a new context and restores from the JSON file
- Each worker gets its own context but shares the same storageState file
- storageState does NOT include sessionStorage (must use `addInitScript()`)

**Evidence:** [playwright-auth-docs] (canonical), [grafana-e2e], [supabase-e2e], [calcom-e2e]

### 1.2 On-Demand Auth with globalCache

```typescript
// auth.fixture.ts — Shard-efficient pattern
const authFixture = base.extend<{}, { authState: string }>({
  authState: [async ({}, use) => {
    const state = await globalCache.get('admin-auth', async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      // Perform login...
      return await context.storageState();
    });
    await use(state);
  }, { scope: 'worker' }],
});
```

**Advantages over setup projects:**
- Authenticates only for roles actually used in each shard
- Caches across workers within a shard
- No wasted auth for unused roles

**Trade-offs:**
- Less visible in HTML reports than setup projects
- Newer pattern, less documented
- Evidence: [devto-ondemand-auth], [devto-global-cache]

### 1.3 Session Expiration Handling

**Pattern: Re-auth middleware**
```typescript
// Detect session expiration and re-authenticate
test.beforeEach(async ({ page }) => {
  const response = await page.goto('/dashboard');
  if (response?.url().includes('/login')) {
    // Session expired — re-authenticate
    await performLogin(page);
    await page.context().storageState({ path: authFile });
  }
});
```

**Consideration:** Long-running suites (>30 min) risk session expiration. Teams should:
- Set test environment session TTL longer than suite duration
- Or implement re-auth middleware as shown above
- Evidence: [playwright-auth-security-guide]

---

## 2. Multi-Role Testing Strategies

### 2.1 Strategy A: Separate Projects per Role (Grafana Model)

```typescript
// playwright.config.ts — Grafana-style
export default defineConfig({
  projects: [
    // Auth setup for each role
    { name: 'auth-admin', testMatch: /auth\.admin\.setup\.ts/ },
    { name: 'auth-viewer', testMatch: /auth\.viewer\.setup\.ts/ },
    { name: 'auth-editor', testMatch: /auth\.editor\.setup\.ts/ },

    // Test projects per role
    {
      name: 'admin-tests',
      dependencies: ['auth-admin'],
      use: { storageState: '.auth/admin.json' },
      testMatch: /.*admin.*\.spec\.ts/,
    },
    {
      name: 'viewer-tests',
      dependencies: ['auth-viewer'],
      use: { storageState: '.auth/viewer.json' },
      testMatch: /.*viewer.*\.spec\.ts/,
    },
  ],
});
```

**Pros:** Clean separation; each role has dedicated tests; parallelizable
**Cons:** Config complexity grows with roles; many projects to manage
**Best for:** Applications with 3+ distinct roles
**Evidence:** [grafana-e2e] (30+ projects), [grafana-plugin-e2e]

### 2.2 Strategy B: Multi-Context in Single Test

```typescript
// Test admin-user interaction in one test
test('admin approves user request', async ({ browser }) => {
  // Create admin context
  const adminContext = await browser.newContext({
    storageState: '.auth/admin.json'
  });
  const adminPage = await adminContext.newPage();

  // Create user context
  const userContext = await browser.newContext({
    storageState: '.auth/user.json'
  });
  const userPage = await userContext.newPage();

  // User submits request
  await userPage.goto('/requests/new');
  await userPage.fill('#request-title', 'Access request');
  await userPage.click('#submit');

  // Admin approves
  await adminPage.goto('/admin/requests');
  await adminPage.click('text=Access request >> button:has-text("Approve")');

  // User sees approval
  await userPage.reload();
  await expect(userPage.locator('#status')).toHaveText('Approved');

  await adminContext.close();
  await userContext.close();
});
```

**Pros:** Tests real multi-user interactions; both users active simultaneously
**Cons:** More complex test code; resource-intensive (multiple contexts)
**Best for:** Workflow tests involving multiple users
**Evidence: [playwright-auth-docs], [ministry-of-testing-discussions], [neova-multi-user]**

### 2.3 Strategy C: Role-Parameterized Tests

```typescript
// Test the same page from multiple role perspectives
const roles = ['admin', 'editor', 'viewer'];
for (const role of roles) {
  test.describe(`${role} permissions`, () => {
    test.use({ storageState: `.auth/${role}.json` });

    test('can view dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.locator('h1')).toBeVisible();
    });

    test('edit button visibility', async ({ page }) => {
      await page.goto('/dashboard');
      if (role === 'viewer') {
        await expect(page.locator('#edit-btn')).toBeHidden();
      } else {
        await expect(page.locator('#edit-btn')).toBeVisible();
      }
    });
  });
}
```

**Pros:** DRY test code; systematic role coverage
**Cons:** Conditional logic in tests; harder to read
**Best for:** Permission boundary testing
**Evidence:** [testleaf-storage-state], [divya-multi-user]

---

## 3. Secret Management Patterns

### 3.1 The Non-Negotiable Rules

1. **NEVER hardcode credentials** in test files, config files, or fixture code
2. **NEVER commit `.env` files** — only `.env.example` templates
3. **NEVER commit `.auth/` directory** — always in `.gitignore`
4. **NEVER log credentials** — even in debug mode
5. **NEVER share test accounts** across environments (staging vs. production)

### 3.2 Secret Hierarchy

```
Environment Variables (process.env)
   ├── Local: .env file (gitignored) loaded via dotenv
   ├── CI: GitHub Secrets / GitLab CI Variables / Azure Pipelines
   └── Enterprise: Vault → env vars at runtime
```

### 3.3 Secure Test User Management

**Pattern: Isolated test user per environment**
- Test users should be automatically provisioned, not manually created
- Each environment (dev, staging, QA) should have its own test users
- Test users should have minimal required permissions
- Evidence: [grafana-plugin-e2e] (HTTP API provisioning), [awesome-testing-mcp-security]

**Pattern: Test user cleanup**
```typescript
// globalTeardown.ts
async function globalTeardown() {
  // Clean up test users created during test run
  await adminAPI.delete(`/api/users/${testUserId}`);
}
```

---

## 4. Security Regression Testing Patterns

### 4.1 What "Security Regression" Means for E2E

Security regression tests verify that previously fixed security issues remain fixed. In the context of Playwright E2E tests, this means:

1. **Access control regressions** — Admin-only routes stay admin-only after refactoring
2. **Auth flow regressions** — Login security measures persist after UI changes
3. **Header regressions** — Security headers remain present after server updates
4. **Cookie regressions** — Session cookie flags stay correct after dependency updates

### 4.2 Pattern: Security Test Tag

```typescript
// Tag security-critical tests for regression tracking
test('admin route rejects viewer @security', async ({ page }) => {
  test.use({ storageState: '.auth/viewer.json' });
  const response = await page.goto('/admin/settings');
  expect(response?.status()).toBe(403);
});

// Run security regression suite specifically
// npx playwright test --grep @security
```

**Evidence:** Community pattern; no Gold suite evidence of dedicated security tags

### 4.3 Pattern: Broken Access Control Detection

```typescript
test.describe('Broken Access Control @security', () => {
  test('user cannot access other user data via URL manipulation', async ({ page }) => {
    // Logged in as user-1
    test.use({ storageState: '.auth/user-1.json' });
    await page.goto('/profile/user-2');
    // Should see access denied, not user-2's data
    await expect(page.locator('text=Access Denied')).toBeVisible();
  });

  test('unauthenticated user cannot access protected routes', async ({ browser }) => {
    const context = await browser.newContext(); // No storageState
    const page = await context.newPage();
    const response = await page.goto('/dashboard');
    expect(response?.url()).toContain('/login'); // Redirected
    await context.close();
  });
});
```

**Evidence:** [playwright-auth-security-guide], [aryadevi-securing-app]

---

## 5. Integration with Security Scanning Tools

### 5.1 Integration Models

| Model | How It Works | Overhead | Coverage |
|-------|-------------|---------|----------|
| Proxy-based (ZAP) | Playwright traffic routed through ZAP proxy | Medium | Passive: all traffic scanned |
| Post-hoc (ZAP Spider) | Playwright generates URL list; ZAP spiders/scans each | High | Active: deep vulnerability scan |
| Inline assertions | response.headers() checked in test code | Low | Targeted: only what you assert |
| Separate CI job | Security scanner runs independently of E2E | None for E2E | Independent: full scan scope |

### 5.2 Recommendation

For most teams, **inline assertions** (checking headers, cookies, CSRF in regular tests) + a **separate security scanning CI job** is more practical than integrating ZAP into the E2E pipeline. The ZAP proxy approach is viable for security-focused teams but adds complexity without clear ROI for typical applications.

---

## 6. Production-Ready Assessment Summary

| Pattern | Production-Ready | Basis |
|---------|-----------------|-------|
| storageState + setup projects | Yes | Official docs; 4/10 Gold suites |
| globalCache on-demand auth | Yes | Official API; documented |
| REST API auth | Yes | 3/10 Gold suites |
| Multi-role projects | Yes | Grafana exemplar (production) |
| Multi-context role testing | Yes | Official docs; stable API |
| Environment variable secrets | Yes | Universal (10/10 Gold suites) |
| CI secret injection | Yes | Universal for CI-enabled suites |
| Cookie attribute validation | Yes | Stable Playwright API |
| HTTP header validation | Yes | Stable Playwright API |
| CSRF token testing | Yes | Stable Playwright API |
| Security regression tagging | Yes (pattern) | No tooling dependency |
| TOTP MFA generation | Conditional | Requires otplib + secret storage |
| OWASP ZAP integration | Experimental | Low adoption; not standardized |
| Vault integration | Conditional | Requires enterprise infra |
| XSS payload testing | Limited | Better handled by dedicated scanners |
