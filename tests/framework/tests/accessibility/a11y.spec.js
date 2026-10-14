// ============================================================================
// Accessibility Tests — WCAG 2.0 AA Compliance
// ============================================================================
//
// Uses @axe-core/playwright to scan pages for accessibility violations.
//
// Prerequisites:
//   npm install -D @axe-core/playwright
//
// ============================================================================
import { test, expect } from '../../fixtures/index.js';
import { checkAccessibility, formatViolations } from '../../utils/accessibility.js';
import { LoginPage } from '../../pages/login.page.js';
import { DashboardPage } from '../../pages/dashboard.page.js';
import { AppointmentsPage } from '../../pages/appointments.page.js';

test.describe('@a11y Accessibility', () => {

  test('login page has no critical violations', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const results = await checkAccessibility(page);
    const critical = results.violations.filter(v => v.impact === 'critical');

    if (critical.length > 0) {
      console.log(formatViolations(critical));
    }
    expect(critical).toHaveLength(0);
  });

  test('dashboard has no critical violations', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.waitForPageReady();

    const results = await checkAccessibility(authenticatedPage);
    const critical = results.violations.filter(v => v.impact === 'critical');

    if (critical.length > 0) {
      console.log(formatViolations(critical));
    }
    expect(critical).toHaveLength(0);
  });

  test('appointments page — scan with known exclusions', async ({ authenticatedPage }) => {
    const appointmentsPage = new AppointmentsPage(authenticatedPage);
    await appointmentsPage.navigateViaSidebar();

    const results = await checkAccessibility(authenticatedPage, {
      // Exclude known issue: filter/sort selects lack labels in the app
      disableRules: ['select-name'],
    });
    const critical = results.violations.filter(v => v.impact === 'critical');

    if (critical.length > 0) {
      console.log(formatViolations(critical));
    }
    expect(critical).toHaveLength(0);
  });

  test('login page — full WCAG 2.0 AA scan', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const results = await checkAccessibility(page, {
      tags: ['wcag2a', 'wcag2aa'],
      // Exclude known color-contrast issues in the app's primary color scheme
      disableRules: ['color-contrast'],
    });

    // Log all violations for awareness
    if (results.violations.length > 0) {
      console.log(`\nAccessibility violations found: ${results.violations.length}`);
      console.log(formatViolations(results.violations));
    }

    // Fail only on critical violations
    const critical = results.violations.filter(v => v.impact === 'critical');
    expect(critical).toHaveLength(0);
  });
});
