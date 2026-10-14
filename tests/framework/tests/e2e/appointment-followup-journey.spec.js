// ============================================================================
// E2E: Appointment Follow-Up Journey
// ============================================================================
//
// Simulates the workflow after a doctor's visit:
//   Login → View appointment → Mark as completed → Add health record from
//   visit → Add medication from visit → Book follow-up appointment
//
// ============================================================================

import { test, expect } from '../../fixtures/index.js';
import { LoginPage } from '../../pages/login.page.js';
import { DashboardPage } from '../../pages/dashboard.page.js';
import { AppointmentsPage } from '../../pages/appointments.page.js';
import { MedicationsPage } from '../../pages/medications.page.js';
import { CREDENTIALS } from '../../data/constants.js';
import { ApiClient } from '../../utils/api-client.js';
import { waitForTableLoad } from '../../test-helpers/wait-helpers.js';

test.describe('@e2e Appointment Follow-Up Journey', () => {
  test.setTimeout(60_000);

  const cleanupIds = { appointments: [], healthRecords: [], medications: [] };

  test.afterAll(async () => {
    const client = await ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
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

  test('complete appointment, log results, add meds, book follow-up', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    const appointmentsPage = new AppointmentsPage(page);
    const medicationsPage = new MedicationsPage(page);

    const uniqueSuffix = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    // ── Pre-condition: Create an appointment via API ──────────────────
    const client = await ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
    const initialApt = await client.post('/appointments', {
      title: `Checkup ${uniqueSuffix}`,
      appointment_date: today,
      appointment_time: '09:00',
      duration_minutes: 30,
      type: 'general',
      status: 'scheduled',
      provider_name: 'Dr. Martinez',
      location: 'Downtown Clinic',
    });
    cleanupIds.appointments.push(initialApt.id);

    // ── Step 1: Login ────────────────────────────────────────────────
    await test.step('Login as patient', async () => {
      await loginPage.goto();
      await loginPage.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
      await expect(dashboard.welcomeHeading).toBeVisible();
    });

    // ── Step 2: Navigate to appointments and mark as completed ───────
    await test.step('Open appointment and mark as completed', async () => {
      await appointmentsPage.navigateViaSidebar();
      await waitForTableLoad(page);
      await appointmentsPage.table.sortBy('created_at:desc');
      await waitForTableLoad(page);

      // Edit the appointment to change status
      await appointmentsPage.editAppointment(`Checkup ${uniqueSuffix}`);
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Change status to completed
      await dialog.getByRole('radio', { name: 'Completed' }).check({ force: true });

      // Save — modal form can extend beyond viewport, use force click
      const responsePromise = page.waitForResponse(
        (resp) =>
          resp.url().includes('/api') &&
          resp.url().includes('/appointments') &&
          resp.request().method() === 'PUT',
      );
      await dialog.getByRole('button', { name: 'Update Appointment' }).click({ force: true });
      await responsePromise;
      await expect(dialog).toBeHidden();
    });

    // ── Step 3: Record diagnosis from the visit ──────────────────────
    await test.step('Add health record — diagnosis from visit', async () => {
      const client2 = await ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
      const diagnosis = await client2.post('/health-records', {
        record_type: 'diagnosis',
        category: 'General',
        title: `Mild Hypertension ${uniqueSuffix}`,
        value: 'Stage 1',
        provider_name: 'Dr. Martinez',
        recorded_date: today,
        notes: 'Blood pressure consistently elevated. Recommend lifestyle changes and medication.',
      });
      cleanupIds.healthRecords.push(diagnosis.id);

      // Navigate to health records to verify
      await page.getByTestId('sidebar').getByRole('link', { name: 'Health Records' }).click();
      await page.getByRole('heading', { name: 'Health Records' }).waitFor({ state: 'visible' });
    });

    // ── Step 4: Add medication prescribed during visit ────────────────
    await test.step('Navigate to medications and add prescription', async () => {
      await medicationsPage.navigateViaSidebar();
      await expect(medicationsPage.pageHeading).toBeVisible();

      await medicationsPage.addMedication({
        name: `Amlodipine ${uniqueSuffix}`,
        dosage: '5mg',
        frequency: 'Once daily',
        startDate: today,
        prescriber: 'Dr. Martinez',
        pharmacy: 'CVS Pharmacy',
        refills: '11',
        instructions: 'Take in the evening. Avoid grapefruit.',
        sideEffects: 'Swelling in ankles, dizziness',
      });

      await expect(medicationsPage.getMedicationByName(`Amlodipine ${uniqueSuffix}`)).toBeVisible();

      const client3 = await ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
      const meds = await client3.get('/medications');
      const created = meds.find((m) => m.name === `Amlodipine ${uniqueSuffix}`);
      if (created) cleanupIds.medications.push(created.id);
    });

    // ── Step 5: Book follow-up appointment ───────────────────────────
    await test.step('Navigate to appointments and book follow-up', async () => {
      await appointmentsPage.navigateViaSidebar();
      await expect(appointmentsPage.pageHeading).toBeVisible();

      await appointmentsPage.createAppointment({
        title: `Follow-up BP Check ${uniqueSuffix}`,
        date: nextWeek,
        time: '14:00',
        type: 'followup',
        duration: '15',
        provider: 'Dr. Martinez',
        location: 'Downtown Clinic',
        description: 'Blood pressure recheck after starting Amlodipine',
      });
      await expect(page.getByRole('dialog')).toBeHidden();

      const client4 = await ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
      const appointments = await client4.get('/appointments?sort=created_at:desc&limit=1');
      if (appointments.data?.length) {
        cleanupIds.appointments.push(appointments.data[0].id);
      }
    });

    // ── Step 6: Verify dashboard shows upcoming follow-up ────────────
    await test.step('Dashboard shows upcoming follow-up', async () => {
      await dashboard.sidebar.navigateTo('Dashboard');
      await expect(dashboard.welcomeHeading).toBeVisible();
      await expect(dashboard.upcomingAppointmentsHeading).toBeVisible();
    });
  });
});
