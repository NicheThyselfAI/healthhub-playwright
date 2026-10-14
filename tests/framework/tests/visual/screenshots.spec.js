// ============================================================================
// Visual Regression Tests — Screenshot Comparisons
// ============================================================================
//
// Uses Playwright's built-in toHaveScreenshot() for visual regression testing.
// First run creates baseline screenshots; subsequent runs compare against them.
//
// Run with --update-snapshots to update baselines:
//   npx playwright test visual/ --update-snapshots
//
// ============================================================================
import { test, expect } from '../../fixtures/index.js';
import { LoginPage } from '../../pages/login.page.js';
import { DashboardPage } from '../../pages/dashboard.page.js';

test.describe('@visual Visual Regression', () => {

  test('login page screenshot', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(page).toHaveScreenshot('login-page.png', {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    });
  });

  test('dashboard screenshot', async ({ authenticatedPage, maskDynamicContent }) => {
    const page = authenticatedPage;
    const dashboard = new DashboardPage(page);
    await dashboard.waitForPageReady();

    // Mask dynamic content (timestamps, greeting time of day)
    const masks = maskDynamicContent(page);

    await expect(page).toHaveScreenshot('dashboard.png', {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
      mask: masks,
    });
  });

  test('login page — mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(page).toHaveScreenshot('login-page-mobile.png', {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    });
  });
});
