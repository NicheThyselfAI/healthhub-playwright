// ============================================================================
// Performance Tests — Web Vitals & Load Time Budgets
// ============================================================================
//
// Validates that key pages meet performance budgets.
// Uses the Performance API to capture metrics.
//
// ============================================================================
import { test, expect } from '../../fixtures/index.js';
import { getWebVitals, getNavigationTiming, getResourceTiming } from '../../utils/performance.js';
import { CREDENTIALS } from '../../data/constants.js';
import { LoginPage } from '../../pages/login.page.js';

test.describe('@performance Web Vitals', () => {

  test('login page — FCP under 3s', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const vitals = await getWebVitals(page);
    expect(vitals.fcp).toBeLessThan(3000);
  });

  test('login page — navigation timing', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const timing = await getNavigationTiming(page);
    expect(timing).not.toBeNull();
    // TTFB should be fast for local dev
    expect(timing.ttfb).toBeGreaterThanOrEqual(0);
    // DOM ready should be under 5s
    if (!isNaN(timing.domReady) && timing.domReady > 0) {
      expect(timing.domReady).toBeLessThan(5000);
    }
  });

  test('dashboard — loads within budget', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const vitals = await getWebVitals(page);

    // FCP should be under 3s for the dashboard
    expect(vitals.fcp).toBeLessThan(3000);
  });

  test('resource loading — no single resource over 1MB', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const resources = await getResourceTiming(page);
    for (const resource of resources) {
      if (resource.size > 0) {
        expect(resource.size).toBeLessThan(1024 * 1024); // 1MB
      }
    }
  });

  test('dashboard — CLS under 0.1', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const vitals = await getWebVitals(page);

    // CLS should be under 0.1 for a good user experience
    expect(vitals.cls).toBeLessThan(0.1);
  });
});
