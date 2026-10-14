// ============================================================================
// Logout Tests — Session Termination
// ============================================================================
import { test, expect } from '../../fixtures/index.js';
import { DashboardPage } from '../../pages/dashboard.page.js';

test.describe('Logout', () => {

  test('logout from dashboard redirects to login', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.waitForPageReady();
    await dashboard.logout();

    await expect(authenticatedPage).toHaveURL(/login/);
  });

  test('after logout, visiting dashboard redirects to login', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.waitForPageReady();
    await dashboard.logout();

    await expect(authenticatedPage).toHaveURL(/login/);

    // Try to visit a protected page
    await authenticatedPage.goto('/dashboard');
    await expect(authenticatedPage).toHaveURL(/login/);
  });
});
