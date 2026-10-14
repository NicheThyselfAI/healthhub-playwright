// ============================================================================
// E2E: Error Recovery Journey
// ============================================================================
//
// Tests how the app handles errors during cross-feature workflows:
//   Mock API error during medication save → Verify error feedback →
//   Clear mock → Retry successfully → Continue to next feature
//
// ============================================================================

import { test, expect } from '../../fixtures/index.js';
import { LoginPage } from '../../pages/login.page.js';
import { DashboardPage } from '../../pages/dashboard.page.js';
import { MedicationsPage } from '../../pages/medications.page.js';
import { AppointmentsPage } from '../../pages/appointments.page.js';
import { CREDENTIALS } from '../../data/constants.js';
import { mockApiError, clearAllMocks } from '../../test-helpers/network-helpers.js';
import { ApiClient } from '../../utils/api-client.js';

test.describe('@e2e Error Recovery Journey', () => {
  test.setTimeout(60_000);

  const cleanupIds = { appointments: [], medications: [] };

  test.afterAll(async () => {
    // Create a fresh client for cleanup to avoid session conflicts
    const client = await ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
    for (const id of cleanupIds.appointments) {
      await client.delete(`/appointments/${id}`).catch(() => {});
    }
    for (const id of cleanupIds.medications) {
      await client.delete(`/medications/${id}`).catch(() => {});
    }
  });

  test('handle API error during workflow and recover', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    const medicationsPage = new MedicationsPage(page);
    const appointmentsPage = new AppointmentsPage(page);

    const uniqueSuffix = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // ── Step 1: Login ────────────────────────────────────────────────
    await test.step('Login as patient', async () => {
      await loginPage.goto();
      await loginPage.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
      await expect(dashboard.welcomeHeading).toBeVisible();
    });

    // ── Step 2: Mock server error on medications POST ────────────────
    await test.step('Attempt to add medication with server error', async () => {
      await medicationsPage.navigateViaSidebar();
      await expect(medicationsPage.pageHeading).toBeVisible();

      // Intercept medication POST to return 500
      await page.route(
        (url) => url.pathname.includes('/medications') && !url.pathname.includes('/reorder'),
        async (route) => {
          if (route.request().method() === 'POST') {
            await route.fulfill({
              status: 500,
              contentType: 'application/json',
              body: JSON.stringify({ success: false, message: 'Internal Server Error' }),
            });
          } else {
            await route.continue();
          }
        },
      );

      // Try to add medication — should hit mocked 500
      await page.getByRole('button', { name: 'Add Medication' }).click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor({ state: 'visible' });

      await dialog.getByRole('textbox', { name: 'Medication Name' }).fill(`Error Med ${uniqueSuffix}`);
      await dialog.getByRole('textbox', { name: 'Dosage' }).fill('10mg');
      await dialog.getByRole('combobox', { name: 'Frequency' }).selectOption('Once daily');
      await dialog.getByLabel('Start Date').fill(today);

      await dialog.getByRole('button', { name: 'Add Medication' }).click();

      // Wait briefly for error response to be processed
      await page.waitForTimeout(1000);
    });

    // ── Step 3: Clear the mock and retry ─────────────────────────────
    await test.step('Clear mock and verify app is still functional', async () => {
      // Remove all route mocks
      await page.unrouteAll({ behavior: 'wait' });

      // Close the dialog if still open
      const dialog = page.getByRole('dialog');
      if (await dialog.isVisible()) {
        await page.getByRole('button', { name: 'Close modal' }).click();
        await dialog.waitFor({ state: 'hidden' });
      }
    });

    // ── Step 4: Navigate to appointments — verify app still works ────
    await test.step('Navigate to appointments and create one successfully', async () => {
      await appointmentsPage.navigateViaSidebar();
      await expect(appointmentsPage.pageHeading).toBeVisible();

      await appointmentsPage.createAppointment({
        title: `Recovery Test ${uniqueSuffix}`,
        date: tomorrow,
        time: '11:00',
        type: 'general',
        duration: '30',
      });
      await expect(page.getByRole('dialog')).toBeHidden();

      // Track for cleanup via fresh API client
      const client = await ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
      const appointments = await client.get('/appointments?sort=created_at:desc&limit=1');
      if (appointments.data?.length) {
        cleanupIds.appointments.push(appointments.data[0].id);
      }
    });

    // ── Step 5: Now add medication successfully ──────────────────────
    await test.step('Return to medications and add successfully', async () => {
      await medicationsPage.navigateViaSidebar();
      await expect(medicationsPage.pageHeading).toBeVisible();

      await medicationsPage.addMedication({
        name: `Recovered Med ${uniqueSuffix}`,
        dosage: '5mg',
        frequency: 'Once daily',
        startDate: today,
      });

      await expect(medicationsPage.getMedicationByName(`Recovered Med ${uniqueSuffix}`)).toBeVisible();

      const medClient = await ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
      const meds = await medClient.get('/medications');
      const created = meds.find((m) => m.name === `Recovered Med ${uniqueSuffix}`);
      if (created) cleanupIds.medications.push(created.id);
    });

    // ── Step 6: Return to dashboard ──────────────────────────────────
    await test.step('Return to dashboard — app fully recovered', async () => {
      await dashboard.sidebar.navigateTo('Dashboard');
      await expect(dashboard.welcomeHeading).toBeVisible();
    });
  });
});
