# Page Object Model Guide

> Section guide for Page Object Model standards. References: [structure-standards.md](../../standards/structure-standards.md) S3.1-S3.5, [semantic-conventions.md](../../standards/semantic-conventions.md) N3.1-N3.4, N7.1-N7.3.

---

## Purpose and Goals

The Page Object Model (POM) pattern encapsulates page-specific locators and actions into reusable classes. A well-designed POM:
- Isolates selector changes to one file when UI changes
- Provides a readable API for test authors
- Enables composition via fixtures rather than inheritance hierarchies
- Uses Playwright's semantic locator API for resilient selectors

---

## Key Standards

### S3.1 Architecture Decision Framework

Choose the POM approach that matches your suite's characteristics:

| Suite Characteristics | Approach | Example |
|---|---|---|
| Large suite, many pages, team collaboration | **Hybrid POM + Fixtures** | Cal.com |
| Framework/SDK for external consumers | **Fixture-based POM** | Grafana plugin-e2e |
| Small-medium suite, simplicity prioritized | **Function helpers** | AFFiNE |
| API-heavy with minimal UI | **Data fixtures only** | Immich |
| Multi-role workflows, dual-frontend | **Actor-based POM** | Shopware |

### S3.2 Canonical Constructor Pattern

POM classes MUST accept `Page` as the sole constructor argument. Locators MUST be `readonly` properties using Playwright's locator API.

```typescript
class DashboardPage {
  readonly heading: Locator;
  readonly saveButton: Locator;

  constructor(public readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }
}
```

### S3.3 Three Method Categories

- **Navigation:** `goto()`, `navigateTo()` -- reach the page
- **Action:** `fillForm()`, `submit()`, `selectDate()` -- perform interactions
- **Assertion:** `verifyLoaded()`, `expectPanelVisible()` -- verify state

Embedding assertions in action methods is a valid pattern for built-in verification.

### S3.4 No POM Inheritance

POM classes MUST NOT use `extends BasePage`. This pattern is found only in Bronze community templates, never in production suites. Use composition via fixtures instead.

### N7.3 Locator Priority Hierarchy

1. `getByRole()` -- semantic, accessibility-aligned (preferred)
2. `getByText()` -- user-visible text
3. `getByLabel()` -- form labels
4. `getByPlaceholder()` -- input placeholders
5. `getByTestId()` -- test attribute (last resort)

---

## Code Example

```typescript
import { type Locator, type Page, expect } from '@playwright/test';

export class BookingPage {
  readonly dateInput: Locator;
  readonly timeSlotList: Locator;
  readonly confirmButton: Locator;
  readonly successMessage: Locator;

  constructor(public readonly page: Page) {
    this.dateInput = page.getByLabel('Date');
    this.timeSlotList = page.getByRole('list', { name: 'Available times' });
    this.confirmButton = page.getByRole('button', { name: 'Confirm booking' });
    this.successMessage = page.getByText('Booking confirmed');
  }

  // Navigation
  async goto() {
    await this.page.goto('/booking');
  }

  // Action -- uses locator composition for dynamic content [S3.5]
  async selectTimeSlot(time: string) {
    await this.timeSlotList
      .getByRole('listitem')
      .filter({ hasText: time })
      .click();
  }

  // Action with embedded assertion [S3.3]
  async confirmBooking() {
    await this.confirmButton.click();
    await expect(this.successMessage).toBeVisible();
  }

  // Assertion helper
  async verifyTimeSlotCount(count: number) {
    await expect(this.timeSlotList.getByRole('listitem')).toHaveCount(count);
  }
}
```

### Injecting via Fixtures (N3.4)

```typescript
import { test as base } from '@playwright/test';
import { BookingPage } from './pages/booking.page';

const test = base.extend<{ bookingPage: BookingPage }>({
  bookingPage: async ({ page }, use) => {
    await use(new BookingPage(page));
  },
});
```

---

## Common Pitfalls

| Pitfall | Why It Fails | Fix |
|---|---|---|
| `extends BasePage` inheritance | Tight coupling, fragile hierarchies; 0/22 production suites use it | Composition via fixtures [S3.4] |
| Storing selectors as strings (`'#submit-btn'`) | Loses auto-waiting, type safety, locator composition | Use Playwright's locator API [S3.2] |
| `waitForSelector()` before interaction | Redundant with Playwright's auto-waiting | Remove explicit waits [S3.5] |
| `waitForTimeout()` for dynamic content | Arbitrary delays cause flakiness | Use `.filter()`, `.nth()`, locator chains [S3.5] |
| Defaulting to `data-testid` | Misses semantic locator benefits | Follow locator priority hierarchy [N7.3] |
| Inlining POM classes in test files | Breaks reuse across tests | Separate `pages/` directory [S1.3] |
| Generic method names (`doAction()`) | Poor readability | verb+target pattern [N3.2] |

---

## When to Deviate

- **Function helpers instead of classes:** Acceptable for small-medium suites where POM classes add unnecessary ceremony. AFFiNE and freeCodeCamp use this approach successfully [S3.1].
- **Actor-based POM:** Valid when user roles are the primary organizational unit (e.g., Shopware: `ShopAdmin`, `ShopCustomer`) [S3.1].
- **No POM at all:** Acceptable for API-heavy suites with minimal UI interaction. Immich uses data fixtures without page objects [S3.1].
- **Computed locator methods:** Use `getPanel(index: number)` instead of static properties for truly dynamic element sets [N3.3].
