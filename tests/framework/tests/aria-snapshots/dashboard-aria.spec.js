// ============================================================================
// ARIA Snapshot Tests — Dashboard Page
// ============================================================================
//
// Captures the accessibility tree of the dashboard — sidebar nav, welcome
// section, stats, and quick actions. Detects structural regressions in the
// most-visited page of the app.
//
// ============================================================================

import { test, expect } from '../../fixtures/index.js';
import { DashboardPage } from '../../pages/dashboard.page.js';
import { assertAriaTree } from '../../test-helpers/aria-snapshot-helpers.js';

test.describe('@aria Dashboard ARIA Snapshots', () => {

  test('sidebar navigation — links and structure', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.waitForPageReady();

    // Scope to sidebar — stable structure regardless of dashboard content
    await assertAriaTree(authenticatedPage.getByTestId('sidebar'), `
      - complementary:
        - navigation:
          - paragraph: Main Menu
          - link "Dashboard"
          - link "Appointments"
          - link "Health Records"
          - link "Medications"
          - link "Symptom Checker"
          - link "Notifications"
          - paragraph: Account
          - link "Profile"
          - link "Settings"
    `, 'Sidebar has all expected navigation links');
  });

  test('welcome section — greeting and action buttons', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.waitForPageReady();

    // Welcome banner with dynamic greeting
    await assertAriaTree(authenticatedPage.getByTestId('dashboard-welcome').locator('..'), `
      - heading /Good (morning|afternoon|evening), \\w+/ [level=1]
      - paragraph
      - link "New Appointment"
      - link "View Records"
    `, 'Welcome section has greeting and action buttons');
  });

  test('dashboard — file-based quick actions snapshot', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.waitForPageReady();

    // File-based snapshot scoped to Quick Actions — stable across test data changes
    const quickActionsSection = authenticatedPage.getByRole('heading', { name: 'Quick Actions' }).locator('..');
    await expect(quickActionsSection).toMatchAriaSnapshot({
      name: 'dashboard-quick-actions.yml',
    });
  });

  test('quick actions section — links are accessible', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.waitForPageReady();

    // Verify quick action links exist and are accessible
    const quickActions = authenticatedPage.getByRole('heading', { name: 'Quick Actions' }).locator('..');
    await expect(quickActions.getByRole('link', { name: 'Book Appointment' })).toBeVisible();
    await expect(quickActions.getByRole('link', { name: 'View Records' })).toBeVisible();
  });
});
