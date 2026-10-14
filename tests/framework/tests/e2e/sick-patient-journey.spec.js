// ============================================================================
// E2E: Sick Patient Journey
// ============================================================================
//
// Simulates a patient feeling unwell who uses the app to:
//   Login → Check symptoms → Get recommendation → Book appointment from
//   results → Add medication prescribed after visit
//
// ============================================================================

import { test, expect } from '../../fixtures/index.js';
import { LoginPage } from '../../pages/login.page.js';
import { DashboardPage } from '../../pages/dashboard.page.js';
import { SymptomsPage } from '../../pages/symptoms.page.js';
import { AppointmentsPage } from '../../pages/appointments.page.js';
import { MedicationsPage } from '../../pages/medications.page.js';
import { CREDENTIALS } from '../../data/constants.js';
import { ApiClient } from '../../utils/api-client.js';

test.describe('@e2e Sick Patient Journey', () => {
  test.setTimeout(60_000);

  const cleanupIds = { appointments: [], medications: [] };

  test.afterAll(async () => {
    const client = await ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
    for (const id of cleanupIds.appointments) {
      await client.delete(`/appointments/${id}`).catch(() => {});
    }
    for (const id of cleanupIds.medications) {
      await client.delete(`/medications/${id}`).catch(() => {});
    }
  });

  test('check symptoms, get recommendation, book appointment, add medication', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    const symptomsPage = new SymptomsPage(page);
    const appointmentsPage = new AppointmentsPage(page);
    const medicationsPage = new MedicationsPage(page);

    const uniqueSuffix = Date.now();
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    // ── Step 1: Login ────────────────────────────────────────────────
    await test.step('Login as patient', async () => {
      await loginPage.goto();
      await loginPage.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
      await expect(dashboard.welcomeHeading).toBeVisible();
    });

    // ── Step 2: Navigate to symptom checker ──────────────────────────
    await test.step('Navigate to symptom checker', async () => {
      await symptomsPage.navigateViaSidebar();
      await expect(symptomsPage.pageHeading).toBeVisible();
    });

    // ── Step 3: Complete symptom check wizard ────────────────────────
    await test.step('Complete symptom check — headache and fatigue', async () => {
      await symptomsPage.completeCheck({
        symptoms: ['Headache', 'Fatigue'],
        severity: 'Moderate',
        duration: '2_3_days',
        additionalInfo: { fever: true },
      });

      // Results should show recommendation
      await expect(symptomsPage.resultsContainer).toBeVisible();
    });

    // ── Step 4: Book appointment based on recommendation ─────────────
    await test.step('Navigate to appointments and book follow-up', async () => {
      await appointmentsPage.navigateViaSidebar();
      await expect(appointmentsPage.pageHeading).toBeVisible();

      await appointmentsPage.createAppointment({
        title: `Sick Visit ${uniqueSuffix}`,
        date: tomorrow,
        time: '10:00',
        type: 'general',
        duration: '30',
        provider: 'Dr. Johnson',
        description: 'Headache and fatigue for 2-3 days with fever',
      });
      await expect(page.getByRole('dialog')).toBeHidden();

      // Track for cleanup
      const client = await ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
      const appointments = await client.get('/appointments?sort=created_at:desc&limit=1');
      if (appointments.data?.length) {
        cleanupIds.appointments.push(appointments.data[0].id);
      }
    });

    // ── Step 5: Add medication prescribed after visit ─────────────────
    await test.step('Navigate to medications and add prescription', async () => {
      await medicationsPage.navigateViaSidebar();
      await expect(medicationsPage.pageHeading).toBeVisible();

      await medicationsPage.addMedication({
        name: `Ibuprofen ${uniqueSuffix}`,
        dosage: '400mg',
        frequency: 'Three times daily',
        startDate: today,
        prescriber: 'Dr. Johnson',
        instructions: 'Take with food. Do not exceed 1200mg per day.',
        sideEffects: 'Stomach upset, dizziness',
      });

      await expect(medicationsPage.getMedicationByName(`Ibuprofen ${uniqueSuffix}`)).toBeVisible();

      // Track for cleanup
      const client2 = await ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
      const meds = await client2.get('/medications');
      const created = meds.find((m) => m.name === `Ibuprofen ${uniqueSuffix}`);
      if (created) cleanupIds.medications.push(created.id);
    });

    // ── Step 6: Return to dashboard ──────────────────────────────────
    await test.step('Return to dashboard', async () => {
      await dashboard.sidebar.navigateTo('Dashboard');
      await expect(dashboard.welcomeHeading).toBeVisible();
      await expect(dashboard.upcomingAppointmentsHeading).toBeVisible();
    });
  });
});
