// ============================================================================
// Custom Assertions — Extend Playwright's expect()
// ============================================================================
//
// Adds domain-specific matchers to Playwright's expect API.
// Import once in your fixture chain or test setup.
//
// Usage:
//   import '../utils/custom-assertions.js';
//
//   await expect(page).toHaveToast('Appointment created');
//   await expect(page).toBeOnPage('/appointments');
//   await expect(locator).toHaveRowCount(5);
//
// ============================================================================

import { expect } from '@playwright/test';

expect.extend({
  /**
   * Assert a toast notification with specific text is visible.
   *
   * @example await expect(page).toHaveToast('created successfully');
   */
  async toHaveToast(page, expectedText) {
    const assertionName = 'toHaveToast';

    try {
      const toast = page.getByRole('alert').filter({ hasText: expectedText });
      await toast.waitFor({ state: 'visible', timeout: 5000 });

      return {
        message: () => `expected page to have toast with text "${expectedText}"`,
        pass: true,
      };
    } catch {
      return {
        message: () =>
          `expected page to have toast with text "${expectedText}", but no matching toast was found`,
        pass: false,
        name: assertionName,
      };
    }
  },

  /**
   * Assert the page URL contains a specific path.
   *
   * @example await expect(page).toBeOnPage('/appointments');
   */
  async toBeOnPage(page, expectedPath) {
    const assertionName = 'toBeOnPage';
    const url = page.url();
    const currentPath = new URL(url).pathname;
    const pass = currentPath.includes(expectedPath);

    return {
      message: () =>
        pass
          ? `expected page NOT to be on "${expectedPath}", but URL is "${currentPath}"`
          : `expected page to be on "${expectedPath}", but URL is "${currentPath}"`,
      pass,
      name: assertionName,
    };
  },

  /**
   * Assert a table has a specific number of data rows (excluding header).
   *
   * @example await expect(page.getByRole('table')).toHaveRowCount(5);
   */
  async toHaveRowCount(table, expectedCount) {
    const assertionName = 'toHaveRowCount';

    try {
      const rows = table.getByRole('row');
      // First row is the header
      await expect(rows).toHaveCount(expectedCount + 1);

      return {
        message: () => `expected table to have ${expectedCount} data rows`,
        pass: true,
      };
    } catch {
      const rows = await table.getByRole('row').count();
      const actual = rows - 1;

      return {
        message: () =>
          `expected table to have ${expectedCount} data rows, but found ${actual}`,
        pass: false,
        name: assertionName,
      };
    }
  },
});
