# Configuration Guide

> Section guide for Playwright configuration standards. References: [structure-standards.md](../../standards/structure-standards.md) S2.1-S2.7, [cicd-standards.md](../../standards/cicd-standards.md) C1.2, C6.1-C6.3.

---

## Purpose and Goals

Configuration is the foundation of a Playwright test suite. A well-configured suite:
- Differentiates CI from local execution automatically
- Defines timeout hierarchies matched to application complexity
- Captures artifacts only when needed (failure debugging)
- Scales via projects and reporters without code changes

---

## Key Standards

### S2.1 TypeScript Configuration

All Playwright configuration MUST use `playwright.config.ts`. TypeScript config provides type safety for project definitions, reporter options, and `use` options.

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // TypeScript provides autocomplete and type checking
});
```

### S2.2 Environment-Aware Configuration

Configuration MUST differentiate CI and local via `process.env.CI`. This variable is set automatically by all major CI platforms.

```typescript
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['blob'], ['github']]
    : [['html', { open: 'never' }], ['list']],
});
```

### S2.5 Timeout Hierarchy

Define a three-tier timeout hierarchy matched to your application type:

| Application Type | Test Timeout | Expect Timeout | Action Timeout |
|---|---|---|---|
| Standard web apps | 30s | 5s | 15s |
| Complex apps (editors, dashboards) | 30s | 10s | 15s |
| Infrastructure-heavy (Docker, multi-service) | 60s | 10s | 15s |

Rule of thumb: test timeout = 3-5x expect timeout.

### S2.6 Multi-Reporter (Three-Slot Pattern)

| Slot | Purpose | CI | Local |
|---|---|---|---|
| Progress | Real-time feedback | `github` or `dot` | `list` |
| Artifact | Post-run debugging | `html` (via merge) | `html` |
| Integration | Pipeline consumption | `blob` or `junit` | -- |

### C1.2 `forbidOnly`

```typescript
forbidOnly: !!process.env.CI,
```

This MUST be set. Without it, a committed `test.only()` causes CI to silently pass on just one test.

---

## Code Example

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  maxFailures: process.env.CI ? 10 : 0,
  timeout: process.env.CI ? 60_000 : 30_000,
  expect: { timeout: process.env.CI ? 10_000 : 5_000 },
  reporter: process.env.CI
    ? [['blob'], ['github']]
    : [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
  webServer: process.env.BASE_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

---

## Common Pitfalls

| Pitfall | Why It Fails | Fix |
|---|---|---|
| JavaScript config (`.config.js`) | Loses type safety for projects, reporters, use options | Use `playwright.config.ts` [S2.1] |
| Multiple env config files (dev.env.js, qa.env.js) | Unnecessary complexity; no Gold suite uses this | Single file with `process.env.CI` ternary [S2.2] |
| Missing `forbidOnly` | Committed `.only()` silently skips all other tests in CI | `forbidOnly: !!process.env.CI` [C1.2] |
| `trace: 'on'` in CI | Generates traces for every test, wasting storage | `trace: 'retain-on-failure'` [S2.7] |
| Hardcoded absolute URLs in tests | Prevents multi-environment execution | `baseURL` from env var [C6.2] |
| `reuseExistingServer: true` in CI | May connect to stale server | `reuseExistingServer: !process.env.CI` [C6.3] |

---

## When to Deviate

- **Single project:** Acceptable for focused suites targeting one browser and one auth context [S2.3].
- **Longer timeouts in CI:** Some applications have slower CI infrastructure. Document the rationale. Cal.com uses 60s CI / 240s local [S2.5].
- **Video recording:** Enable `video: 'on-first-retry'` only if traces alone are insufficient for debugging your specific failure modes [S2.7].
- **No `webServer`:** Applications requiring Docker Compose or multi-service orchestration that exceeds `webServer` capabilities [S2.4].
