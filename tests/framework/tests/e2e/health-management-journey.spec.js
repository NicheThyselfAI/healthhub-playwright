// ============================================================================
// E2E: Health Management Journey
// ============================================================================
//
// Simulates a patient managing their ongoing health:
//   Login → Review health records → Add new vital signs → Check medications →
//   Update medication → Review dashboard stats
//
// ============================================================================

import { test, expect } from '../../fixtures/index.js';
import { LoginPage } from '../../pages/login.page.js';
import { DashboardPage } from '../../pages/dashboard.page.js';
import { HealthRecordsPage } from '../../pages/health-records.page.js';
import { MedicationsPage } from '../../pages/medications.page.js';
import { CREDENTIALS } from '../../data/constants.js';
import { ApiClient } from '../../utils/api-client.js';

test.describe('@e2e Health Management Journey', () => {
  test.setTimeout(60_000);

  const cleanupIds = { healthRecords: [], medications: [] };

  test.afterAll(async () => {
    const client = await ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
    for (const id of cleanupIds.healthRecords) {
      await client.delete(`/health-records/${id}`).catch(() => {});
    }
    for (const id of cleanupIds.medications) {
      await client.delete(`/medications/${id}`).catch(() => {});
    }
  });

  test('review records, log vitals, manage medications, check dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    const healthRecordsPage = new HealthRecordsPage(page);
    const medicationsPage = new MedicationsPage(page);

    const uniqueSuffix = Date.now();
    const today = new Date().toISOString().split('T')[0];

    // ── Step 1: Login ────────────────────────────────────────────────
    await test.step('Login as patient', async () => {
      await loginPage.goto();
      await loginPage.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
      await expect(dashboard.welcomeHeading).toBeVisible();
    });

    // ── Step 2: Review existing health records ───────────────────────
    await test.step('Navigate to health records and review list', async () => {
      await healthRecordsPage.navigateViaSidebar();
      await expect(healthRecordsPage.pageHeading).toBeVisible();
    });

    // ── Step 3: Add multiple vital signs via API (simulating daily logging)
    await test.step('Log blood pressure and heart rate readings', async () => {
      const client = await ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
      const bp = await client.post('/health-records', {
        record_type: 'vital',
        category: 'Blood Pressure',
        title: `Morning BP ${uniqueSuffix}`,
        value: '118/76',
        unit: 'mmHg',
        recorded_date: today,
        notes: 'Morning reading — fasting',
      });
      cleanupIds.healthRecords.push(bp.id);

      const hr = await client.post('/health-records', {
        record_type: 'vital',
        category: 'Heart Rate',
        title: `Resting HR ${uniqueSuffix}`,
        value: '72',
        unit: 'bpm',
        recorded_date: today,
        notes: 'Resting heart rate',
      });
      cleanupIds.healthRecords.push(hr.id);

      // Refresh page to see new records
      await page.reload();
      await healthRecordsPage.waitForPageReady();
    });

    // ── Step 4: Navigate to medications ──────────────────────────────
    await test.step('Navigate to medications and add a new prescription', async () => {
      await medicationsPage.navigateViaSidebar();
      await expect(medicationsPage.pageHeading).toBeVisible();

      await medicationsPage.addMedication({
        name: `Metformin ${uniqueSuffix}`,
        dosage: '500mg',
        frequency: 'Twice daily',
        startDate: today,
        prescriber: 'Dr. Patel',
        pharmacy: 'Walgreens',
        refills: '5',
        instructions: 'Take with meals',
      });

      await expect(medicationsPage.getMedicationByName(`Metformin ${uniqueSuffix}`)).toBeVisible();

      const client2 = await ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
      const meds = await client2.get('/medications');
      const created = meds.find((m) => m.name === `Metformin ${uniqueSuffix}`);
      if (created) cleanupIds.medications.push(created.id);
    });

    // ── Step 5: Return to dashboard and verify ───────────────────────
    await test.step('Return to dashboard and verify overview', async () => {
      await dashboard.sidebar.navigateTo('Dashboard');
      await expect(dashboard.welcomeHeading).toBeVisible();
      await expect(dashboard.upcomingAppointmentsHeading).toBeVisible();
      await expect(dashboard.recentNotificationsHeading).toBeVisible();
    });
  });
});
