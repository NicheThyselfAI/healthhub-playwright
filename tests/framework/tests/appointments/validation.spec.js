// ============================================================================
// Appointments Form Validation Tests
// ============================================================================
import { test, expect } from '../../fixtures/index.js';
import { AppointmentsPage } from '../../pages/appointments.page.js';

test.describe('Appointments Form Validation', () => {

  test('new appointment button opens create modal', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();

    await appointmentsPage.newAppointmentButton.click();
    await appointmentsPage.modal.waitForOpen();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading')).toBeVisible();
  });

  test('modal can be closed with close button', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();

    await appointmentsPage.newAppointmentButton.click();
    await appointmentsPage.modal.waitForOpen();

    await appointmentsPage.modal.close();
    await appointmentsPage.modal.waitForClose();

    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('create appointment with all fields', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();

    await appointmentsPage.createAppointment({
      title: `Full Form ${Date.now()}`,
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '14:00',
      type: 'physical',
      duration: '60',
      provider: 'Dr. Test',
      location: 'Test Clinic',
      description: 'Full form test description',
      notes: 'Test notes for this appointment',
    });

    // Modal should close after creation
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});
