// ============================================================================
// Mock Handlers — Pre-built Route Mocks for Common Scenarios
// ============================================================================
//
// Ready-to-use mock handlers for testing error states, loading states,
// and edge cases without needing a real backend.
//
// Usage:
//   import { mockAppointmentsList, mockAuthExpired } from './handlers.js';
//
//   test('empty state', async ({ page }) => {
//     await mockAppointmentsList(page, []);
//     await page.goto('/appointments');
//   });
//
// ============================================================================

import appointmentsResponse from './responses/appointments.json' with { type: 'json' };
import authResponse from './responses/auth.json' with { type: 'json' };

/**
 * Mock the appointments list endpoint.
 *
 * @param {import('@playwright/test').Page} page
 * @param {object[]} [appointments] — Custom list or defaults to canned data
 */
export async function mockAppointmentsList(page, appointments = null) {
  const data = appointments ?? appointmentsResponse.data;

  await page.route('**/api/v1/appointments*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data,
          pagination: { page: 1, limit: 10, total: data.length },
        }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Mock an expired auth session (401 on /auth/me).
 * Useful for testing session expiry redirects.
 *
 * @param {import('@playwright/test').Page} page
 */
export async function mockAuthExpired(page) {
  await page.route('**/api/v1/auth/me*', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify(authResponse.expired),
    });
  });
}

/**
 * Mock a successful auth check (GET /auth/me).
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} [user] — Custom user object or defaults to canned data
 */
export async function mockAuthSuccess(page, user = null) {
  const data = user ?? authResponse.success.data;

  await page.route('**/api/v1/auth/me*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data }),
    });
  });
}

/**
 * Mock a server error on any API endpoint.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} [urlFragment='api/v1'] — URL fragment to match
 */
export async function mockServerError(page, urlFragment = 'api/v1') {
  await page.route(`**/${urlFragment}*`, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        message: 'Internal Server Error (mocked)',
      }),
    });
  });
}

/**
 * Mock a network timeout by delaying response indefinitely.
 * Use with test timeout to verify timeout handling.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} urlFragment — URL fragment to match
 */
export async function mockNetworkTimeout(page, urlFragment) {
  await page.route(`**/${urlFragment}*`, async (route) => {
    // Never respond — triggers timeout
    await new Promise(() => {});
  });
}
