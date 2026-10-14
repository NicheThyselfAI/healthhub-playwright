// ============================================================================
// Network Helpers — Request Interception Utilities
// ============================================================================
//
// Provides utilities for mocking API responses, simulating errors, and
// testing network-related scenarios (slow responses, failures, etc.).
//
// Usage:
//   import { mockApiError, mockSlowResponse, interceptAndModify } from './network-helpers.js';
//
//   await mockApiError(page, '/appointments', 500);
//   await mockSlowResponse(page, '/appointments', 3000);
//
// IMPORTANT: Always call these BEFORE navigating to the page that triggers
// the API call. Routes persist for the lifetime of the page context.
//
// ============================================================================

/**
 * Mock an API endpoint to return an error response.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} urlFragment — URL substring to match
 * @param {number} [status=500] — HTTP status code
 * @param {string} [message='Internal Server Error'] — Error message
 */
export async function mockApiError(page, urlFragment, status = 500, message = 'Internal Server Error') {
  await page.route(`**/${urlFragment}*`, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        message,
      }),
    });
  });
}

/**
 * Mock an API endpoint to respond slowly (simulates network latency).
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} urlFragment — URL substring to match
 * @param {number} [delayMs=3000] — Delay in milliseconds before responding
 * @param {object} [responseBody] — Response body (defaults to empty success)
 */
export async function mockSlowResponse(page, urlFragment, delayMs = 3000, responseBody = null) {
  await page.route(`**/${urlFragment}*`, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responseBody || { success: true, data: [] }),
    });
  });
}

/**
 * Intercept an API request and modify the response body.
 * The original request is made; only the response is altered.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} urlFragment — URL substring to match
 * @param {function} modifier — Function that receives and returns the response body
 *
 * @example
 *   await interceptAndModify(page, '/appointments', (body) => {
 *     body.data = body.data.slice(0, 2); // Only return first 2
 *     return body;
 *   });
 */
export async function interceptAndModify(page, urlFragment, modifier) {
  await page.route(`**/${urlFragment}*`, async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    const modified = modifier(body);

    await route.fulfill({
      status: response.status(),
      contentType: 'application/json',
      body: JSON.stringify(modified),
    });
  });
}

/**
 * Block all requests matching a URL pattern.
 * Useful for testing offline scenarios or missing resources.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} urlFragment — URL substring to match
 */
export async function blockRequests(page, urlFragment) {
  await page.route(`**/${urlFragment}*`, async (route) => {
    await route.abort('connectionrefused');
  });
}

/**
 * Mock an API endpoint with a canned JSON response.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} urlFragment — URL substring to match
 * @param {object} responseBody — The response body to return
 * @param {number} [status=200]
 */
export async function mockApiResponse(page, urlFragment, responseBody, status = 200) {
  await page.route(`**/${urlFragment}*`, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(responseBody),
    });
  });
}

/**
 * Remove all route handlers (reset mocks).
 * Call in afterEach or when switching mock scenarios.
 *
 * @param {import('@playwright/test').Page} page
 */
export async function clearAllMocks(page) {
  await page.unrouteAll({ behavior: 'wait' });
}
