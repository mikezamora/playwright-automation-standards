/**
 * Example Test Suite
 *
 * Standards applied:
 * - S1.1: .spec.ts file extension
 * - N1.2: File named by feature area
 * - N1.3: kebab-case file naming
 * - N2.1: Action-oriented "should" test descriptions
 * - N2.2: test.describe() grouped by feature
 * - N2.3: test.step() for multi-step journeys
 * - S5.3: test.describe() for logical grouping
 * - S5.4: test.step() for complex test documentation
 * - V1.1: Web-first assertions
 * - V1.2: Guard assertions between actions
 */
import { test, expect } from './fixtures';
import { ExamplePage } from './pages/example.page';

test.describe('Example Feature', () => {
  /**
   * Simple test demonstrating web-first assertions. [V1.1]
   * "should" phrasing per N2.1.
   */
  test('should display the main heading', async ({ page }) => {
    const examplePage = new ExamplePage(page);
    await examplePage.goto();

    await expect(examplePage.heading).toBeVisible();
    await expect(examplePage.heading).toHaveText('Welcome');
  });

  /**
   * Test using custom fixtures for authenticated context. [S4.1]
   */
  test('should show user dashboard when authenticated', async ({
    authenticatedPage,
  }) => {
    const examplePage = new ExamplePage(authenticatedPage);
    await examplePage.goto();

    await expect(examplePage.dashboardSection).toBeVisible();
    await expect(examplePage.userGreeting).toContainText('Hello');
  });

  /**
   * Multi-step test using test.step() for readable reporting. [S5.4, N2.3]
   * Steps appear in trace viewer and HTML report.
   */
  test('should complete a full create-edit-delete workflow', async ({
    page,
    testData,
  }) => {
    const examplePage = new ExamplePage(page);

    await test.step('Navigate to the items page', async () => {
      await examplePage.goto();
      await expect(examplePage.heading).toBeVisible(); // Guard assertion [V1.2]
    });

    await test.step('Create a new item', async () => {
      await examplePage.createItem(testData.itemName);
      await expect(
        page.getByRole('listitem', { name: testData.itemName })
      ).toBeVisible();
    });

    await test.step('Edit the item', async () => {
      await examplePage.editItem(testData.itemName, 'Updated Name');
      await expect(
        page.getByRole('listitem', { name: 'Updated Name' })
      ).toBeVisible();
    });

    await test.step('Delete the item', async () => {
      await examplePage.deleteItem('Updated Name');
      await expect(
        page.getByRole('listitem', { name: 'Updated Name' })
      ).not.toBeVisible();
    });
  });

  /**
   * Test demonstrating guard assertions between actions. [V1.2]
   */
  test('should submit a form with valid data', async ({ page }) => {
    const examplePage = new ExamplePage(page);
    await examplePage.goto();

    // Guard assertion: ensure form is visible before interacting [V1.2]
    await expect(examplePage.nameInput).toBeVisible();

    await examplePage.nameInput.fill('Test User');
    await examplePage.emailInput.fill('test@example.com');

    // Guard assertion before submit [V1.2]
    await expect(examplePage.submitButton).toBeEnabled();

    await examplePage.submitButton.click();
    await expect(page.getByText('Form submitted successfully')).toBeVisible();
  });
});
