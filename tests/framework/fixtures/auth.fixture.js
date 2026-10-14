// ============================================================================
// Auth Fixture — Layer 2
// ============================================================================
//
// Extends the base fixture with authentication capabilities:
//
//   authToken           — Worker-scoped JWT token (shared across tests in a worker)
//   authenticatedPage   — Test-scoped page that is already logged in
//
// Chain: base → auth → data → visual → index.js
//
// Usage in tests:
//   test('dashboard loads', async ({ authenticatedPage }) => {
//     await expect(authenticatedPage.getByTestId('dashboard-welcome')).toBeVisible();
//   });
//
// ============================================================================

import { test as base } from './base.fixture.js';
import { CREDENTIALS, API } from '../data/constants.js';
import { logger } from '../utils/logger.js';
import { AuthenticationError } from '../utils/errors.js';

export const test = base.extend({
  // ── Worker-scoped: authenticate once per worker ──────────────────
  // This avoids redundant login API calls when running tests in parallel.
  // Each parallel worker gets its own token.
  authToken: [async ({ playwright }, use) => {
    const apiContext = await playwright.request.newContext();

    try {
      const response = await apiContext.post(
        `${API.BASE_URL}${API.ENDPOINTS.LOGIN}`,
        {
          data: {
            email: CREDENTIALS.patient.email,
            password: CREDENTIALS.patient.password,
          },
        }
      );

      const body = await response.json();

      if (!body.success || !body.data?.token) {
        throw new AuthenticationError(
          CREDENTIALS.patient.email,
          body.message || `Status ${response.status()}`
        );
      }

      logger.info(`Auth fixture: token acquired for ${CREDENTIALS.patient.email}`);
      await use(body.data.token);
    } finally {
      await apiContext.dispose();
    }
  }, { scope: 'worker' }],

  // ── Test-scoped: page that is already logged in ──────────────────
  // Each test gets a fresh page with auth state pre-injected.
  // Uses API login (fast) instead of UI login (slow).
  authenticatedPage: async ({ page, authToken }, use) => {
    // Must visit the origin first — localStorage is origin-scoped
    await page.goto('/login');

    // Inject JWT token into localStorage
    await page.evaluate(
      (token) => localStorage.setItem('healthhub_token', token),
      authToken
    );

    // Navigate to dashboard and wait for it to load
    await page.goto('/dashboard');
    await page.getByTestId('dashboard-welcome').waitFor({
      state: 'visible',
      timeout: 10000,
    });

    logger.debug('Auth fixture: authenticated page ready');
    await use(page);
  },
});
