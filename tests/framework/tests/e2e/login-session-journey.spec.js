// ============================================================================
// E2E: Login & Session Lifecycle Journey
// ============================================================================
//
// Tests the complete authentication lifecycle:
//   Visit protected page → Redirected to login → Login → Redirected back →
//   Navigate across features → Logout → Verify session ended
//
// ============================================================================

import { test, expect } from '../../fixtures/index.js';
import { LoginPage } from '../../pages/login.page.js';
import { DashboardPage } from '../../pages/dashboard.page.js';
import { AppointmentsPage } from '../../pages/appointments.page.js';
import { HealthRecordsPage } from '../../pages/health-records.page.js';
import { MedicationsPage } from '../../pages/medications.page.js';
import { CREDENTIALS } from '../../data/constants.js';

test.describe('@e2e Login & Session Lifecycle', () => {
  test.setTimeout(60_000);

  test('protected redirect, login, navigate features, logout, verify protection', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    const appointmentsPage = new AppointmentsPage(page);
    const healthRecordsPage = new HealthRecordsPage(page);
    const medicationsPage = new MedicationsPage(page);

    // ── Step 1: Visit protected page — should redirect to login ──────
    await test.step('Visit dashboard unauthenticated — redirected to login', async () => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/login/);
      await expect(loginPage.heading).toBeVisible();
    });

    // ── Step 2: Login ────────────────────────────────────────────────
    await test.step('Login with valid credentials', async () => {
      await loginPage.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
      await expect(dashboard.welcomeHeading).toBeVisible();
    });

    // ── Step 3: Navigate across multiple features ────────────────────
    await test.step('Navigate to appointments', async () => {
      await appointmentsPage.navigateViaSidebar();
      await expect(appointmentsPage.pageHeading).toBeVisible();
    });

    await test.step('Navigate to health records', async () => {
      await healthRecordsPage.navigateViaSidebar();
      await expect(healthRecordsPage.pageHeading).toBeVisible();
    });

    await test.step('Navigate to medications', async () => {
      await medicationsPage.navigateViaSidebar();
      await expect(medicationsPage.pageHeading).toBeVisible();
    });

    await test.step('Return to dashboard', async () => {
      await dashboard.sidebar.navigateTo('Dashboard');
      await expect(dashboard.welcomeHeading).toBeVisible();
    });

    // ── Step 4: Logout ───────────────────────────────────────────────
    await test.step('Logout from dashboard', async () => {
      await dashboard.logout();
      await expect(page).toHaveURL(/login/);
      await expect(loginPage.heading).toBeVisible();
    });

    // ── Step 5: Verify session ended — protected pages redirect ──────
    await test.step('Verify protected pages redirect after logout', async () => {
      await page.goto('/appointments');
      await expect(page).toHaveURL(/login/);

      await page.goto('/health-records');
      await expect(page).toHaveURL(/login/);

      await page.goto('/medications');
      await expect(page).toHaveURL(/login/);
    });
  });
});
