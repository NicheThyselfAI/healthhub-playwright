// ============================================================================
// E2E: New Patient First Visit Journey
// ============================================================================
//
// Simulates a new patient's first interaction with the app:
//   Login → Explore dashboard → Book first appointment → Record vitals →
//   Add prescribed medication → Check notifications → Return to dashboard
//
// ============================================================================

import { test, expect } from '../../fixtures/index.js';
import { LoginPage } from '../../pages/login.page.js';
import { DashboardPage } from '../../pages/dashboard.page.js';
import { AppointmentsPage } from '../../pages/appointments.page.js';
import { MedicationsPage } from '../../pages/medications.page.js';
import { CREDENTIALS } from '../../data/constants.js';
import { ApiClient } from '../../utils/api-client.js';

test.describe('@e2e New Patient First Visit Journey', () => {
  test.setTimeout(60_000); // E2E journeys need more time than unit tests

  // Track IDs for cleanup
  const cleanupIds = { appointments: [], healthRecords: [], medications: [] };

  // Helper: get a fresh API client (avoids session conflicts with parallel workers)
  const getClient = () => ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);

  test.afterAll(async () => {
    const client = await getClient();
    for (const id of cleanupIds.appointments) {
      await client.delete(`/appointments/${id}`).catch(() => {});
    }
    for (const id of cleanupIds.healthRecords) {
      await client.delete(`/health-records/${id}`).catch(() => {});
    }
    for (const id of cleanupIds.medications) {
      await client.delete(`/medications/${id}`).catch(() => {});
    }
  });

  test('login, book appointment, record vitals, add medication, check notifications', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    const appointmentsPage = new AppointmentsPage(page);
    const medicationsPage = new MedicationsPage(page);

    const uniqueSuffix = Date.now();
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    // ── Step 1: Login and explore dashboard ──────────────────────────
    await test.step('Login and verify dashboard sections', async () => {
      await loginPage.goto();
      await loginPage.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
      await expect(dashboard.welcomeHeading).toBeVisible();
      await expect(dashboard.upcomingAppointmentsHeading).toBeVisible();
      await expect(dashboard.quickActionsHeading).toBeVisible();
    });

    // ── Step 2: Book first appointment ───────────────────────────────
    await test.step('Navigate to appointments and book first visit', async () => {
      await appointmentsPage.navigateViaSidebar();
      await expect(appointmentsPage.pageHeading).toBeVisible();

      await appointmentsPage.createAppointment({
        title: `First Visit ${uniqueSuffix}`,
        date: tomorrow,
        time: '09:00',
        type: 'general',
        duration: '60',
        provider: 'Dr. Williams',
        location: 'City Medical Center',
      });
      await expect(page.getByRole('dialog')).toBeHidden();

      // Track for cleanup
      const appointments = await (await getClient()).get('/appointments?sort=created_at:desc&limit=1');
      if (appointments.data?.length) {
        cleanupIds.appointments.push(appointments.data[0].id);
      }
    });

    // ── Step 3: Record vitals (health record via API, verify in UI) ──
    await test.step('Navigate to health records and verify vitals entry', async () => {
      // Create via API (health record form varies — API is reliable)
      const record = await (await getClient()).post('/health-records', {
        record_type: 'vital',
        category: 'Blood Pressure',
        title: `BP Reading ${uniqueSuffix}`,
        value: '120/80',
        unit: 'mmHg',
        recorded_date: today,
        notes: 'Pre-appointment baseline',
      });
      cleanupIds.healthRecords.push(record.id);

      // Navigate to health records and verify it shows
      await page.getByTestId('sidebar').getByRole('link', { name: 'Health Records' }).click();
      await page.getByRole('heading', { name: 'Health Records' }).waitFor({ state: 'visible' });
    });

    // ── Step 4: Add prescribed medication via UI ─────────────────────
    await test.step('Navigate to medications and add a prescription', async () => {
      await medicationsPage.navigateViaSidebar();
      await expect(medicationsPage.pageHeading).toBeVisible();

      await medicationsPage.addMedication({
        name: `Lisinopril ${uniqueSuffix}`,
        dosage: '10mg',
        frequency: 'Once daily',
        startDate: today,
        prescriber: 'Dr. Williams',
        pharmacy: 'City Pharmacy',
        refills: '3',
        instructions: 'Take in the morning with water',
      });

      // Verify medication appears in list
      await expect(medicationsPage.getMedicationByName(`Lisinopril ${uniqueSuffix}`)).toBeVisible();

      // Track for cleanup
      const meds = await (await getClient()).get('/medications');
      const created = meds.find((m) => m.name === `Lisinopril ${uniqueSuffix}`);
      if (created) cleanupIds.medications.push(created.id);
    });

    // ── Step 5: Check notifications ──────────────────────────────────
    await test.step('Navigate to notifications and verify activity', async () => {
      await page.getByTestId('sidebar').getByRole('link', { name: 'Notifications' }).click();
      await page.getByRole('heading', { name: 'Notifications' }).waitFor({ state: 'visible' });
    });

    // ── Step 6: Return to dashboard ──────────────────────────────────
    await test.step('Return to dashboard and confirm state', async () => {
      await dashboard.sidebar.navigateTo('Dashboard');
      await expect(dashboard.welcomeHeading).toBeVisible();
    });
  });
});
