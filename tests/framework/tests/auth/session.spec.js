// ============================================================================
// Session Management Tests — Auth State & Session Handling
// ============================================================================
import { test, expect } from '../../fixtures/index.js';
import { LoginPage } from '../../pages/login.page.js';
import { mockAuthExpired } from '../../mocks/handlers.js';

test.describe('Session Management', () => {

  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('unauthenticated user cannot access appointments', async ({ page }) => {
    await page.goto('/appointments');
    await expect(page).toHaveURL(/login/);
  });

  test('unauthenticated user cannot access health records', async ({ page }) => {
    await page.goto('/health-records');
    await expect(page).toHaveURL(/login/);
  });

  test('expired session redirects to login', async ({ authenticatedPage }) => {
    // First verify we're logged in
    await expect(authenticatedPage).toHaveURL(/dashboard/);

    // Mock expired session for future auth/me calls
    await mockAuthExpired(authenticatedPage);

    // Trigger a full page reload which calls auth/me
    await authenticatedPage.goto('/dashboard');
    await expect(authenticatedPage).toHaveURL(/login/);
  });

  test('login page is accessible without auth', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(loginPage.heading).toBeVisible();
  });
});
