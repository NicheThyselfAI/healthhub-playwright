// ============================================================================
// Dashboard Overview Tests
// ============================================================================
import { test, expect } from '../../fixtures/index.js';
import { DashboardPage } from '../../pages/dashboard.page.js';
import { CREDENTIALS } from '../../data/constants.js';

test.describe('Dashboard Overview', () => {

  test('shows welcome greeting with user name', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.waitForPageReady();

    const text = await dashboard.getWelcomeText();
    expect(text).toContain(CREDENTIALS.patient.firstName);
  });

  test('shows all dashboard sections', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.waitForPageReady();

    await expect(dashboard.upcomingAppointmentsHeading).toBeVisible();
    await expect(dashboard.quickActionsHeading).toBeVisible();
  });

  test('quick action links are visible', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.waitForPageReady();

    await expect(dashboard.bookAppointmentLink).toBeVisible();
    await expect(dashboard.viewRecordsLink).toBeVisible();
  });

  test('book appointment link navigates to appointments', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.waitForPageReady();

    await dashboard.bookAppointmentLink.click();
    await expect(authenticatedPage).toHaveURL(/appointments/);
  });

  test('view records link navigates to health records', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.waitForPageReady();

    await dashboard.viewRecordsLink.click();
    await expect(authenticatedPage).toHaveURL(/health-records/);
  });

  test('sidebar navigation to appointments', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.waitForPageReady();

    await dashboard.sidebar.navigateTo('Appointments');
    await expect(authenticatedPage).toHaveURL(/appointments/);
  });
});
