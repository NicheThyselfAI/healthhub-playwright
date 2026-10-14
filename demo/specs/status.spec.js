import { test, expect } from '../../tests/framework/fixtures/index.js';
import { AppointmentsPage } from '../../tests/framework/pages/appointments.page.js';
import { waitForTableLoad } from '../../tests/framework/test-helpers/wait-helpers.js';

// @smoke
test.describe('Appointment Status @smoke', () => {

  test('should show correct status label after appointment is created', async ({ authenticatedPage, testData }) => {
    await testData.createAppointment({
      title: 'Status Check Appointment',
      appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      appointment_time: '09:00',
      type: 'general',
    });

    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();
    await waitForTableLoad(page);
    await appointmentsPage.table.sortBy('created_at:desc');
    await waitForTableLoad(page);

    const row = page.locator('tr', { hasText: 'Status Check Appointment' });
    await expect(row).toBeVisible();

    // Fixed: assertion updated after schema change — previously expected 'Confirmed', app now returns 'Scheduled'
    await expect(row).toContainText('Scheduled');
  });

});
