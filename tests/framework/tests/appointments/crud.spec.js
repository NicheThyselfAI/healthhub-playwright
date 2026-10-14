// ============================================================================
// Appointments CRUD Tests — Create, Read, Update, Delete via UI
// ============================================================================
import { test, expect } from '../../fixtures/index.js';
import { AppointmentsPage } from '../../pages/appointments.page.js';
import { waitForTableLoad } from '../../test-helpers/wait-helpers.js';

test.describe('Appointments CRUD', () => {

  test('create a new appointment', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();

    const uniqueTitle = `CRUD Test ${Date.now()}`;
    await appointmentsPage.createAppointment({
      title: uniqueTitle,
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '10:00',
      type: 'general',
      duration: '30',
    });

    // Verify modal closed (createAppointment waits for this)
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('view appointment in list after creation', async ({ authenticatedPage, testData }) => {
    const uniqueTitle = `View Test ${Date.now()}`;
    await testData.createAppointment({ title: uniqueTitle });

    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();
    await waitForTableLoad(page);

    // Sort by "Recently Added" to find our new appointment
    await appointmentsPage.table.sortBy('created_at:desc');
    await waitForTableLoad(page);

    // Verify the appointment appears in the table
    const row = appointmentsPage.table.getRowByText(uniqueTitle);
    await expect(row).toBeVisible();
  });

  test('delete appointment from list', async ({ authenticatedPage, testData }) => {
    const uniqueTitle = `Delete Test ${Date.now()}`;
    await testData.createAppointment({ title: uniqueTitle });

    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();
    await waitForTableLoad(page);

    // Sort by "Recently Added" to find it
    await appointmentsPage.table.sortBy('created_at:desc');
    await waitForTableLoad(page);

    await appointmentsPage.deleteAppointment(uniqueTitle);

    // Verify the appointment is no longer in the table
    const row = appointmentsPage.table.getRowByText(uniqueTitle);
    await expect(row).toBeHidden();
  });

  test('edit appointment opens modal', async ({ authenticatedPage, testData }) => {
    const uniqueTitle = `Edit Test ${Date.now()}`;
    await testData.createAppointment({ title: uniqueTitle });

    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();
    await waitForTableLoad(page);

    await appointmentsPage.table.sortBy('created_at:desc');
    await waitForTableLoad(page);

    await appointmentsPage.editAppointment(uniqueTitle);

    // Modal should be open with the appointment title
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('textbox', { name: 'Title' })).toHaveValue(uniqueTitle);
  });
});
