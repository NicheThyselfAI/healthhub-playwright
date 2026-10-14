// ============================================================================
// Wait Helpers — Common Wait Patterns
// ============================================================================
//
// Reusable wait patterns for common async scenarios in the HealthHub app.
// Prevents test flakiness by waiting for the right signals.
//
// Usage:
//   import { waitForTableLoad, waitForApiResponse, waitForToast } from './wait-helpers.js';
//
//   await waitForTableLoad(page);
//   const response = await waitForApiResponse(page, '/appointments', 'GET');
//   await waitForToast(page, 'created');
//
// ============================================================================

/**
 * Wait for a table to finish loading (rows visible).
 * IMPORTANT: Call this BEFORE changing sort/filter to avoid React race conditions.
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} [options]
 * @param {number} [options.timeout=10000]
 */
export async function waitForTableLoad(page, options = {}) {
  const { timeout = 10000 } = options;
  const rows = page.getByRole('table').getByRole('row');

  // Wait for at least one data row (beyond the header row)
  await rows.nth(1).waitFor({ state: 'visible', timeout });
}

/**
 * Set up a listener for an API response BEFORE triggering the action.
 * Returns a promise that resolves with the response body.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} urlFragment — URL substring to match (e.g., '/appointments')
 * @param {string} [method='GET'] — HTTP method to match
 * @param {number} [timeout=10000]
 * @returns {Promise<Response>} Playwright Response object
 *
 * @example
 *   const responsePromise = waitForApiResponse(page, '/appointments', 'POST');
 *   await page.getByRole('button', { name: 'Save' }).click();
 *   const response = await responsePromise;
 */
export function waitForApiResponse(page, urlFragment, method = 'GET', timeout = 10000) {
  return page.waitForResponse(
    (resp) =>
      resp.url().includes('/api') &&
      resp.url().includes(urlFragment) &&
      resp.request().method() === method,
    { timeout }
  );
}

/**
 * Wait for a toast notification containing specific text.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} text — Text substring to look for in the toast
 * @param {number} [timeout=5000]
 */
export async function waitForToast(page, text, timeout = 5000) {
  await page.getByRole('alert').filter({ hasText: text })
    .waitFor({ state: 'visible', timeout });
}

/**
 * Wait for a toast to disappear (after verifying it appeared).
 *
 * @param {import('@playwright/test').Page} page
 * @param {number} [timeout=10000]
 */
export async function waitForToastDismiss(page, timeout = 10000) {
  await page.getByRole('alert').waitFor({ state: 'hidden', timeout });
}

/**
 * Wait for navigation to a specific URL pattern.
 *
 * @param {import('@playwright/test').Page} page
 * @param {RegExp|string} urlPattern
 * @param {number} [timeout=10000]
 */
export async function waitForNavigation(page, urlPattern, timeout = 10000) {
  if (typeof urlPattern === 'string') {
    urlPattern = new RegExp(urlPattern);
  }
  await page.waitForURL(urlPattern, { timeout });
}

/**
 * Wait for the loading spinner to disappear.
 *
 * @param {import('@playwright/test').Page} page
 * @param {number} [timeout=10000]
 */
export async function waitForLoadingComplete(page, timeout = 10000) {
  const spinner = page.getByTestId('loading-spinner');
  if (await spinner.isVisible()) {
    await spinner.waitFor({ state: 'hidden', timeout });
  }
}
