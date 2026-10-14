// ============================================================================
// Assertion Helpers — Domain-Specific Assertion Wrappers
// ============================================================================
//
// Provides readable, domain-specific assertion functions that combine
// multiple Playwright assertions into meaningful checks.
//
// Usage:
//   import { assertTableHasRows, assertFormValidationError } from './assertion-helpers.js';
//
//   await assertTableHasRows(page, 5);
//   await assertFormValidationError(page, 'Title is required');
//
// ============================================================================

import { expect } from '@playwright/test';

/**
 * Assert that a table has an exact number of data rows.
 *
 * @param {import('@playwright/test').Page} page
 * @param {number} expectedCount
 */
export async function assertTableHasRows(page, expectedCount) {
  const table = page.getByRole('table');
  // Subtract 1 for the header row
  const rows = table.getByRole('row');
  await expect(rows).toHaveCount(expectedCount + 1);
}

/**
 * Assert that a table contains a row with specific text.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} text — Text that should appear in a row
 */
export async function assertTableContainsRow(page, text) {
  const row = page.getByRole('table').getByRole('row').filter({ hasText: text });
  await expect(row).toBeVisible();
}

/**
 * Assert that a table does NOT contain a row with specific text.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} text
 */
export async function assertTableDoesNotContainRow(page, text) {
  const row = page.getByRole('table').getByRole('row').filter({ hasText: text });
  await expect(row).toHaveCount(0);
}

/**
 * Assert that a toast notification is visible with specific text.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} text — Expected text in the toast
 */
export async function assertToastVisible(page, text) {
  const toast = page.getByRole('alert').filter({ hasText: text });
  await expect(toast).toBeVisible();
}

/**
 * Assert that the page URL matches a pattern.
 *
 * @param {import('@playwright/test').Page} page
 * @param {RegExp|string} pattern
 */
export async function assertPageUrl(page, pattern) {
  if (typeof pattern === 'string') {
    await expect(page).toHaveURL(new RegExp(pattern));
  } else {
    await expect(page).toHaveURL(pattern);
  }
}

/**
 * Assert that a form validation error is shown.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} errorText — The validation error message
 */
export async function assertFormValidationError(page, errorText) {
  const error = page.getByText(errorText);
  await expect(error).toBeVisible();
}

/**
 * Assert that a heading with specific text is visible.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string|RegExp} text
 */
export async function assertHeadingVisible(page, text) {
  await expect(page.getByRole('heading', { name: text })).toBeVisible();
}

/**
 * Assert that the page has a specific title.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string|RegExp} title
 */
export async function assertPageTitle(page, title) {
  await expect(page).toHaveTitle(title);
}

/**
 * Assert that an element is enabled/disabled.
 *
 * @param {import('@playwright/test').Locator} locator
 * @param {boolean} enabled
 */
export async function assertEnabled(locator, enabled = true) {
  if (enabled) {
    await expect(locator).toBeEnabled();
  } else {
    await expect(locator).toBeDisabled();
  }
}
