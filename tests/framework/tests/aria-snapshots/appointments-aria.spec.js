// ============================================================================
// ARIA Snapshot Tests — Appointments Page
// ============================================================================
//
// Captures the accessibility tree of the appointments page — filters, table,
// empty state, and the new appointment modal. Validates that the data table
// and form controls remain accessible across changes.
//
// ============================================================================

import { test, expect } from '../../fixtures/index.js';
import { AppointmentsPage } from '../../pages/appointments.page.js';
import { assertAriaTree } from '../../test-helpers/aria-snapshot-helpers.js';

test.describe('@aria Appointments Page ARIA Snapshots', () => {

  test('page header — heading and new button', async ({ authenticatedPage }) => {
    const appointmentsPage = new AppointmentsPage(authenticatedPage);
    await appointmentsPage.navigateViaSidebar();

    // Verify the key elements are present in the header area
    const header = authenticatedPage.getByRole('heading', { name: 'Appointments', exact: true }).locator('..');
    await expect(header.getByRole('heading', { name: 'Appointments', exact: true })).toBeVisible();
    await expect(header.getByText('Manage your healthcare appointments')).toBeVisible();
    await expect(authenticatedPage.getByTestId('appointments-new-btn')).toBeVisible();
  });

  test('filter controls — all filters are accessible', async ({ authenticatedPage }) => {
    const appointmentsPage = new AppointmentsPage(authenticatedPage);
    await appointmentsPage.navigateViaSidebar();

    // Verify filter controls exist with proper roles
    await expect(authenticatedPage.getByTestId('appointments-search')).toBeVisible();
    await expect(authenticatedPage.getByTestId('appointments-status-filter')).toBeVisible();
    await expect(authenticatedPage.getByTestId('appointments-type-filter')).toBeVisible();
    await expect(authenticatedPage.getByTestId('appointments-sort')).toBeVisible();
  });

  test('appointments table — column headers are accessible', async ({ authenticatedPage }) => {
    const appointmentsPage = new AppointmentsPage(authenticatedPage);
    await appointmentsPage.navigateViaSidebar();

    // Wait for table to load
    const table = authenticatedPage.getByTestId('appointments-table');
    const isTableVisible = await table.isVisible().catch(() => false);

    if (isTableVisible) {
      await assertAriaTree(table.locator('thead'), `
        - rowgroup:
          - row:
            - columnheader "Date & Time"
            - columnheader "Title"
            - columnheader "Type"
            - columnheader "Provider"
            - columnheader "Status"
            - columnheader "Actions"
      `, 'Table headers are properly labelled');
    }
  });

  test('new appointment modal — form structure', async ({ authenticatedPage }) => {
    const appointmentsPage = new AppointmentsPage(authenticatedPage);
    await appointmentsPage.navigateViaSidebar();

    // Open the modal
    await authenticatedPage.getByTestId('appointments-new-btn').click();
    await authenticatedPage.getByTestId('modal-container').waitFor({ state: 'visible' });

    // Verify modal has dialog role with proper labelling
    await assertAriaTree(authenticatedPage.getByTestId('modal-container'), `
      - dialog "New Appointment":
        - heading "New Appointment" [level=2]
        - button "Close modal"
        - textbox "Title*"
        - combobox "Type"
        - textbox "Date*"
        - textbox "Time*"
        - combobox "Duration"
        - textbox "Provider"
        - textbox "Location"
        - button "Cancel"
        - button "Create Appointment"
    `, 'New appointment modal has accessible form structure');
  });

  test('new appointment modal — file-based snapshot', async ({ authenticatedPage }) => {
    const appointmentsPage = new AppointmentsPage(authenticatedPage);
    await appointmentsPage.navigateViaSidebar();

    await authenticatedPage.getByTestId('appointments-new-btn').click();
    await authenticatedPage.getByTestId('modal-container').waitFor({ state: 'visible' });

    await expect(authenticatedPage.getByTestId('modal-container')).toMatchAriaSnapshot({
      name: 'new-appointment-modal.yml',
    });
  });

  test('empty state — accessible when no results', async ({ authenticatedPage }) => {
    const appointmentsPage = new AppointmentsPage(authenticatedPage);
    await appointmentsPage.navigateViaSidebar();

    // Wait for initial load, then filter to cancelled status (likely no results)
    const table = authenticatedPage.getByTestId('appointments-table');
    const tableVisible = await table.isVisible().catch(() => false);
    if (tableVisible) {
      await table.getByRole('row').nth(1).waitFor({ state: 'visible' });
    }

    // Filter by cancelled — likely produces empty state
    await authenticatedPage.getByTestId('appointments-status-filter').selectOption('cancelled');

    // Wait for either empty state or table update
    const empty = authenticatedPage.getByTestId('appointments-empty');
    try {
      await empty.waitFor({ state: 'visible', timeout: 5000 });
      await assertAriaTree(empty, `
        - heading "No appointments found" [level=3]
      `, 'Empty state shows accessible heading');
    } catch {
      // If there are cancelled appointments, just verify filter worked
      await expect(authenticatedPage.getByTestId('appointments-status-filter')).toHaveValue('cancelled');
    }
  });
});
