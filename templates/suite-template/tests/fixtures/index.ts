/**
 * Custom Fixtures
 *
 * Standards applied:
 * - S4.1: test.extend<T>() for custom fixtures
 * - S4.2: Fixture scoping based on resource lifecycle
 * - S4.4: storageState pattern for authentication
 * - S6.3: Fixture teardown for data cleanup
 * - S6.4: Worker isolation for parallel data safety
 * - N4.1: camelCase noun-centric fixture names
 * - N4.3: Verb prefix for factory fixtures
 */
import { test as base, Page } from '@playwright/test';

/**
 * Define typed fixture interfaces. [S4.1]
 * Provider fixtures use nouns; factory fixtures use verb prefixes. [N4.1, N4.3]
 */
type CustomFixtures = {
  /** Pre-authenticated page using storageState. */
  authenticatedPage: Page;
  /** Test data created via API with automatic teardown. */
  testData: { itemName: string; id: string };
};

type CustomWorkerFixtures = {
  /** Worker-scoped API base URL (shared across tests in one worker). */
  apiBaseURL: string;
};

export const test = base.extend<CustomFixtures, CustomWorkerFixtures>({
  /**
   * Authentication fixture using storageState pattern. [S4.4, SEC1.1]
   *
   * Creates a new browser context with pre-existing auth state,
   * then provides a page from that context.
   */
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  /**
   * Data fixture with API creation and guaranteed teardown. [S6.3]
   *
   * Pattern: create resource -> use(resource) -> cleanup (runs even on failure).
   * Uses workerInfo for parallel-safe naming. [S6.4]
   */
  testData: async ({ request }, use, workerInfo) => {
    // Create unique test data per worker to avoid conflicts [S6.4]
    const uniqueName = `Test Item ${workerInfo.workerIndex}-${Date.now()}`;

    const response = await request.post('/api/items', {
      data: { name: uniqueName },
    });
    const item = await response.json();

    // Provide the data to the test
    await use({ itemName: uniqueName, id: item.id });

    // Guaranteed cleanup — runs even if the test fails [S6.3]
    await request.delete(`/api/items/${item.id}`);
  },

  /**
   * Worker-scoped fixture for expensive shared resources. [S4.2]
   *
   * Worker scope: created once per worker process, shared across all
   * tests in that worker. Ideal for expensive setup like DB connections.
   */
  apiBaseURL: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const baseURL = process.env.API_BASE_URL || 'http://localhost:3001';
      await use(baseURL);
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
