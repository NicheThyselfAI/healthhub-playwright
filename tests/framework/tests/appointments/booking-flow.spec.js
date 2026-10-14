// ============================================================================
// SCRUM-19 — Book New Appointment
//
// Acceptance criteria:
//   AC1: Open "New Appointment" form from the Appointments page
//   AC2: Form requires Title, Type, Date, Time
//   AC3: Optional fields: Duration, Provider Name, Location, Description, Notes
//   AC4: Type dropdown shows General, Physical, Mental Health, Follow-up
//   AC5: Duration options: 15 min, 30 min, 45 min, 1 hr, 1.5 hrs
//   AC6: Successful submission → appointment in list with status "Scheduled"
//   AC7: Validation errors shown inline for missing required fields
//   AC8: User can cancel the form without saving
// ============================================================================

import { test, expect } from '../../fixtures/index.js';
import { AppointmentsPage } from '../../pages/appointments.page.js';
import { waitForTableLoad } from '../../test-helpers/wait-helpers.js';

const TOMORROW = new Date(Date.now() + 86400000).toISOString().split('T')[0];

test.describe('Book New Appointment', () => {

  // AC1 — form is accessible from the Appointments page
  test('New Appointment button opens the booking form @smoke', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();

    await appointmentsPage.newAppointmentButton.click();
    await appointmentsPage.modal.waitForOpen();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'New Appointment' })).toBeVisible();
  });

  // AC4 — Type dropdown contains all required options
  test('Type dropdown shows General, Physical, Mental Health, and Follow-up @smoke', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();

    await appointmentsPage.newAppointmentButton.click();
    await appointmentsPage.modal.waitForOpen();

    const typeSelect = page.getByRole('dialog').getByRole('combobox', { name: 'Type' });
    await expect(typeSelect.getByRole('option', { name: 'General' })).toBeAttached();
    await expect(typeSelect.getByRole('option', { name: 'Physical' })).toBeAttached();
    await expect(typeSelect.getByRole('option', { name: 'Mental Health' })).toBeAttached();
    await expect(typeSelect.getByRole('option', { name: 'Follow-up' })).toBeAttached();
  });

  // AC5 — Duration dropdown contains all required options
  test('Duration dropdown shows 15 min, 30 min, 45 min, 1 hr, and 1.5 hrs options @smoke', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();

    await appointmentsPage.newAppointmentButton.click();
    await appointmentsPage.modal.waitForOpen();

    const durationSelect = page.getByRole('dialog').getByRole('combobox', { name: 'Duration' });
    await expect(durationSelect.getByRole('option', { name: '15 minutes' })).toBeAttached();
    await expect(durationSelect.getByRole('option', { name: '30 minutes' })).toBeAttached();
    await expect(durationSelect.getByRole('option', { name: '45 minutes' })).toBeAttached();
    await expect(durationSelect.getByRole('option', { name: '1 hour' })).toBeAttached();
    await expect(durationSelect.getByRole('option', { name: '1.5 hours' })).toBeAttached();
  });

  // AC7 — Submitting empty form keeps modal open and focuses first invalid field
  test('submitting without required fields keeps the form open @smoke', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();

    await appointmentsPage.newAppointmentButton.click();
    await appointmentsPage.modal.waitForOpen();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Create Appointment' }).click();

    // Form should not submit — modal stays open
    await expect(dialog).toBeVisible();
    // Browser focuses the first invalid field (Title)
    await expect(dialog.getByLabel('Title*')).toBeFocused();
  });

  // AC2 — Required fields are marked with the `required` attribute
  test('Title, Date and Time inputs are marked as required @smoke', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();

    await appointmentsPage.newAppointmentButton.click();
    await appointmentsPage.modal.waitForOpen();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByLabel('Title*')).toHaveAttribute('required', '');
    await expect(dialog.getByLabel('Date*')).toHaveAttribute('required', '');
    await expect(dialog.getByLabel('Time*')).toHaveAttribute('required', '');
  });

  // AC8 — Cancel discards the form without creating an appointment
  test('Cancel button closes the form without saving @smoke', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();

    await appointmentsPage.newAppointmentButton.click();
    await appointmentsPage.modal.waitForOpen();

    const dialog = page.getByRole('dialog');
    // Enter a title so we can confirm it was NOT saved
    await dialog.getByLabel('Title*').fill('Should Not Be Saved');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await appointmentsPage.modal.waitForClose();

    await expect(dialog).toBeHidden();
  });

  // AC2+AC3 — Minimum required fields only
  test('books an appointment with only the required fields @smoke', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();

    await appointmentsPage.createAppointment({
      title: `Required Only ${Date.now()}`,
      date: TOMORROW,
      time: '09:00',
    });

    await expect(page.getByRole('dialog')).toBeHidden();
  });

  // AC6 — Booked appointment appears in the list with status "Scheduled"
  test('newly booked appointment appears in the list with status Scheduled @e2e', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();

    const uniqueTitle = `Booking Flow ${Date.now()}`;
    await appointmentsPage.createAppointment({
      title: uniqueTitle,
      date: TOMORROW,
      time: '11:00',
      type: 'general',
    });

    // Sort by recently added so our new row is at the top
    await appointmentsPage.table.sortBy('created_at:desc');
    await waitForTableLoad(page);

    const row = appointmentsPage.table.getRowByText(uniqueTitle);
    await expect(row).toBeVisible();
    await expect(row.getByText('Scheduled')).toBeVisible();
  });

  // AC2+AC3 — All optional fields can be filled and submitted
  test('books an appointment with all optional fields populated @e2e', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();

    await appointmentsPage.createAppointment({
      title: `Full Form ${Date.now()}`,
      date: TOMORROW,
      time: '14:30',
      type: 'mental_health',
      duration: '45',
      provider: 'Dr. Test Provider',
      location: 'Test Clinic, Room 1',
      description: 'Routine mental health follow-up',
      notes: 'Bring referral letter',
    });

    await expect(page.getByRole('dialog')).toBeHidden();
  });

});
