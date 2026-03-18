import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 *
 * Standards applied:
 * - S2.1: TypeScript configuration exclusively
 * - S2.2: Environment-aware config via process.env.CI
 * - S2.3: Multiple Playwright projects (setup + chromium)
 * - S2.4: webServer with reuseExistingServer
 * - S2.5: Three-tier timeout hierarchy
 * - S2.6: Multi-reporter (three-slot pattern)
 * - S2.7: Conditional artifact capture
 * - C1.2: forbidOnly + process.env.CI switches
 * - V2.2: Retries by environment
 * - V2.3: Four-layer timeout hierarchy
 * - V2.5: maxFailures for CI cost control
 */
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',

  /* Fail the build on CI if test.only() was accidentally left in source code. [C1.2] */
  forbidOnly: !!process.env.CI,

  /* Retry: 0 locally (fail fast), 2 in CI (infrastructure variability). [V2.2, S2.2] */
  retries: process.env.CI ? 2 : 0,

  /* Workers: 1 per shard in CI for stability, unlimited locally. [C2.1] */
  workers: process.env.CI ? 1 : undefined,

  /* Prevent CI cost overrun on cascading failures. [V2.5] */
  maxFailures: process.env.CI ? 10 : 0,

  /* Test timeout: 60s CI / 30s local. Expect timeout: 10s CI / 5s local. [S2.5, V2.3] */
  timeout: process.env.CI ? 60_000 : 30_000,
  expect: {
    timeout: process.env.CI ? 10_000 : 5_000,
  },

  /* Run tests in files in parallel. */
  fullyParallel: true,

  /**
   * Reporter configuration (three-slot pattern). [S2.6, C4.1]
   *
   * CI:    blob (artifact/merge) + github (inline PR annotations)
   * Local: html (interactive debugging) + list (terminal output)
   */
  reporter: process.env.CI
    ? [['blob'], ['github']]
    : [['html', { open: 'never' }], ['list']],

  use: {
    /* Base URL for relative navigation — override via BASE_URL env var. [C6.2] */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    /* Conditional artifact capture — only on failure. [S2.7, C5.1] */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',

    /* Action and navigation timeouts. [V2.3] */
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    /* Auth setup project — runs before tests, writes storageState. [S4.4, SEC1.1] */
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    /* Main test project — depends on setup, uses stored auth state. [S2.3] */
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  /**
   * Auto-start the application under test. [S2.4, C6.3]
   *
   * - Conditionally omit when BASE_URL is set (external server).
   * - reuseExistingServer: locally reuse running server; CI starts fresh.
   */
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: 'pipe',
        stderr: 'pipe',
      },
});
