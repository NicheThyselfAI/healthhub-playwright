---
paths:
  - "tests/framework/pages/**/*.js"
  - "tests/framework/components/**/*.js"
---

# Page Objects and Components

## Every page object

- Extends `BasePage`
- Must implement `waitForPageReady()` — this is how the framework knows the page is ready for interaction
- Composes reusable fragments rather than re-implementing them: `this.table = new TableComponent(page, { ... })`
- Defines all locators in the constructor, not inline inside action methods
- Wraps meaningful actions in `test.step()` so the Playwright trace is readable

```js
import { test } from '@playwright/test';  // test.step only — no fixture chain needed here
import { BasePage } from './base.page.js';
import { SidebarComponent } from '../components/sidebar.component.js';

export class FeaturePage extends BasePage {
  constructor(page) {
    super(page);
    this.sidebar = new SidebarComponent(page);
    this.pageHeading = page.getByRole('heading', { name: 'Feature', exact: true });
  }

  async waitForPageReady() {
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async navigateViaSidebar() {
    await this.sidebar.navigateTo('Feature');
    await this.waitForPageReady();
  }

  async doSomething(value) {
    await test.step(`Do something: ${value}`, async () => {
      // interact here
    });
  }
}
```

## Locator priority

Use the most semantically meaningful locator available. Work down this list:

1. `getByRole()` — preferred, mirrors how assistive technology sees the page
2. `getByLabel()` — for form inputs wired to a `<label>`
3. `getByPlaceholder()` — for inputs where the placeholder is the only label
4. `getByTestId()` — when the app provides `data-testid` attributes (or when a designer needs to add one)
5. `getByText()` — fine for reading, fragile for interactions
6. CSS selectors — last resort and only for stable structural attributes
7. XPath — avoid entirely

## What doesn't belong here

No assertions. Page objects interact; tests assert. If you need to verify something, return enough information for the test to assert — or let the test use the locators directly.

No navigation via `page.goto()` in production page objects. Use `navigateViaSidebar()` — it keeps the SPA's auth state intact. The `goto()` method exists as a fallback for auth tests that specifically need to test direct URL access.

## Race conditions to avoid

If an action triggers a network request, wait for the response *before* clicking the confirmation button — not after. See `createAppointment()` in `appointments.page.js` for the pattern: register `page.waitForResponse()` before the click, then await it.
