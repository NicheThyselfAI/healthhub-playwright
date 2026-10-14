// ============================================================================
// Appointments Filter & Sort Tests
// ============================================================================
import { test, expect } from '../../fixtures/index.js';
import { AppointmentsPage } from '../../pages/appointments.page.js';
import { waitForTableLoad } from '../../test-helpers/wait-helpers.js';

test.describe('Appointments Filters & Sort', () => {

  test('sort by date ascending', async ({ authenticatedPage, testData }) => {
    // Create appointments to ensure we have data
    await testData.createAppointment({ title: `Sort Test ${Date.now()}` });

    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();
    await waitForTableLoad(page);

    await appointmentsPage.table.sortBy('appointment_date:asc');
    await waitForTableLoad(page);

    const rowCount = await appointmentsPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('sort by date descending', async ({ authenticatedPage, testData }) => {
    await testData.createAppointment({ title: `Sort Desc ${Date.now()}` });

    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();
    await waitForTableLoad(page);

    await appointmentsPage.table.sortBy('appointment_date:desc');
    await waitForTableLoad(page);

    const rowCount = await appointmentsPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('sort by title ascending', async ({ authenticatedPage, testData }) => {
    await testData.createAppointment({ title: `Title Sort ${Date.now()}` });

    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();
    await waitForTableLoad(page);

    await appointmentsPage.table.sortBy('title:asc');
    await waitForTableLoad(page);

    const rowCount = await appointmentsPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('sort by recently added', async ({ authenticatedPage, testData }) => {
    await testData.createAppointment({ title: `Recent Sort ${Date.now()}` });

    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();
    await waitForTableLoad(page);

    await appointmentsPage.table.sortBy('created_at:desc');
    await waitForTableLoad(page);

    const rowCount = await appointmentsPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('filter by type', async ({ authenticatedPage, testData }) => {
    await testData.createAppointment({ title: `Filter Type ${Date.now()}`, type: 'physical' });

    const page = authenticatedPage;
    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();
    await waitForTableLoad(page);

    await appointmentsPage.table.filterBy('type-filter', 'physical');
    await waitForTableLoad(page);

    const rowCount = await appointmentsPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });
});
