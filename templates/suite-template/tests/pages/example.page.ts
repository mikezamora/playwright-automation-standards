/**
 * Example Page Object Model
 *
 * Standards applied:
 * - S3.1: Hybrid POM + Fixtures architecture
 * - S3.2: Canonical POM constructor pattern (Page as sole arg, readonly locators)
 * - S3.3: Three POM method categories (navigation, action, assertion)
 * - S3.4: No POM inheritance (no extends BasePage)
 * - S3.5: Locator composition, not explicit waits
 * - N3.1: PascalCase + Page suffix
 * - N3.2: verb+target method naming
 * - N3.3: Descriptive locator variable names
 * - N7.3: Semantic locators preferred over data-testid
 */
import { type Locator, type Page, expect } from '@playwright/test';

export class ExamplePage {
  /* ----- Locators (readonly, initialized in constructor) [S3.2] ----- */

  /** Main heading element. [N3.3: purpose-oriented naming] */
  readonly heading: Locator;

  /** Dashboard content section visible to authenticated users. */
  readonly dashboardSection: Locator;

  /** Greeting text displaying the user's name. */
  readonly userGreeting: Locator;

  /** Name input field in the create/edit form. */
  readonly nameInput: Locator;

  /** Email input field in the create/edit form. */
  readonly emailInput: Locator;

  /** Submit button for the form. */
  readonly submitButton: Locator;

  /** Item list container. */
  readonly itemList: Locator;

  /**
   * Canonical constructor: Page as sole argument. [S3.2]
   *
   * Locators use Playwright's semantic locator API (getByRole, getByLabel,
   * getByText) rather than raw CSS/XPath selectors. [N7.3]
   */
  constructor(public readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Welcome' });
    this.dashboardSection = page.getByTestId('dashboard-section');
    this.userGreeting = page.getByTestId('user-greeting');
    this.nameInput = page.getByLabel('Name');
    this.emailInput = page.getByLabel('Email');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.itemList = page.getByRole('list', { name: 'Items' });
  }

  /* ----- Navigation methods [S3.3] ----- */

  /** Navigate to the example page. [N3.2: goto()] */
  async goto() {
    await this.page.goto('/');
  }

  /* ----- Action methods [S3.3] ----- */

  /** Create a new item by filling the form and submitting. [N3.2: verb+target] */
  async createItem(name: string) {
    await this.page.getByRole('button', { name: 'New Item' }).click();
    await this.page.getByLabel('Item name').fill(name);
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  /**
   * Edit an existing item's name.
   *
   * Uses locator composition (.filter, .locator) for dynamic content. [S3.5]
   */
  async editItem(currentName: string, newName: string) {
    const itemRow = this.itemList
      .getByRole('listitem')
      .filter({ hasText: currentName });
    await itemRow.getByRole('button', { name: 'Edit' }).click();
    await this.page.getByLabel('Item name').fill(newName);
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  /** Delete an item by name. */
  async deleteItem(name: string) {
    const itemRow = this.itemList
      .getByRole('listitem')
      .filter({ hasText: name });
    await itemRow.getByRole('button', { name: 'Delete' }).click();
    await this.page.getByRole('button', { name: 'Confirm' }).click();
  }

  /* ----- Assertion helper methods [S3.3] ----- */

  /**
   * Verify the page has loaded successfully.
   *
   * Embedding assertions in POM methods is a valid pattern per S3.3.
   */
  async verifyPageLoaded() {
    await expect(this.heading).toBeVisible();
  }

  /** Verify a specific item exists in the list. */
  async verifyItemExists(name: string) {
    await expect(
      this.itemList.getByRole('listitem').filter({ hasText: name })
    ).toBeVisible();
  }

  /** Verify the item count matches the expected number. [V1.1: toHaveCount] */
  async verifyItemCount(count: number) {
    await expect(this.itemList.getByRole('listitem')).toHaveCount(count);
  }
}
