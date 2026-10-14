// ============================================================================
// Appointments Page — Page Object
// ============================================================================
//
// LOCATOR STRATEGY:
//   - getByRole('heading')   — page title
//   - getByRole('button')    — New Appointment, Edit, Delete (via aria-label)
//   - getByRole('textbox')   — form inputs with labels
//   - getByRole('combobox')  — form selects with labels
//   - getByRole('radio')     — status radio buttons
//   - getByRole('dialog')    — modal
//   - getByLabel()           — date/time inputs
//   - getByPlaceholder()     — description/notes textareas (no label wiring)
//   - getByTestId()          — ONLY for filter selects (no labels in app markup)
//
// ============================================================================

import { test } from '@playwright/test';
import { BasePage } from './base.page.js';
import { SidebarComponent } from '../components/sidebar.component.js';
import { ModalComponent } from '../components/modal.component.js';
import { TableComponent } from '../components/table.component.js';
import { FormComponent } from '../components/form.component.js';

export class AppointmentsPage extends BasePage {
  constructor(page) {
    super(page);

    // Composed components
    this.sidebar = new SidebarComponent(page);
    this.modal   = new ModalComponent(page);
    this.table   = new TableComponent(page, {
      searchPlaceholder: 'Search appointments...',
      testIdPrefix: 'appointments',
    });

    // Page-level elements
    this.pageHeading         = page.getByRole('heading', { name: 'Appointments', exact: true });
    this.newAppointmentButton = page.getByTestId('appointments-new-btn');
  }

  async waitForPageReady() {
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async goto() {
    await test.step('Navigate to appointments page', async () => {
      await this.page.goto('/appointments');
      await this.waitForPageReady();
    });
  }

  /**
   * Navigate to appointments via sidebar (preserves auth state in SPA).
   */
  async navigateViaSidebar() {
    await this.sidebar.navigateTo('Appointments');
    await this.waitForPageReady();
  }

  /**
   * Create a new appointment via the UI form.
   * @param {object} data — Appointment data
   * @param {string} data.title — Required
   * @param {string} data.date — Required (YYYY-MM-DD)
   * @param {string} data.time — Required (HH:MM)
   * @param {string} [data.type] — 'general', 'physical', 'mental_health', 'followup'
   * @param {string} [data.duration] — '15', '30', '45', '60', '90'
   * @param {string} [data.provider]
   * @param {string} [data.location]
   * @param {string} [data.description]
   * @param {string} [data.notes]
   * @returns {Promise<void>}
   */
  async createAppointment(data) {
    await test.step(`Create appointment: ${data.title}`, async () => {
      await this.newAppointmentButton.click();
      await this.modal.waitForOpen();

      // Get the form inside the modal dialog
      const dialog = this.page.getByRole('dialog');
      const form = new FormComponent(this.page, dialog);

      // Required fields
      await form.fill('Title', data.title);
      await form.fill('Date', data.date);
      await form.fill('Time', data.time);

      // Optional fields
      if (data.type)     await form.select('Type', data.type);
      if (data.duration) await form.select('Duration', data.duration);
      if (data.provider) await form.fill('Provider', data.provider);
      if (data.location) await form.fill('Location', data.location);
      if (data.description) {
        await form.fillByPlaceholder('Additional details about this appointment...', data.description);
      }
      if (data.notes) {
        await form.fillByPlaceholder('Personal notes or reminders...', data.notes);
      }

      // Listen for API response BEFORE clicking save (avoids race condition)
      const responsePromise = this.page.waitForResponse(
        (resp) =>
          resp.url().includes('/api') &&
          resp.url().includes('/appointments') &&
          resp.request().method() === 'POST'
      );

      await dialog.getByRole('button', { name: 'Create Appointment' }).click();
      await responsePromise;
      await this.modal.waitForClose();
    });
  }

  /**
   * Edit an existing appointment by clicking the edit button in its row.
   * @param {string} rowText — Text identifying the row (e.g., appointment title)
   */
  async editAppointment(rowText) {
    await test.step(`Edit appointment: ${rowText}`, async () => {
      await this.table.getEditButton(rowText, 'Edit appointment').click();
      await this.modal.waitForOpen();
    });
  }

  /**
   * Delete an appointment by clicking the delete button in its row.
   * @param {string} rowText — Text identifying the row
   */
  async deleteAppointment(rowText) {
    await test.step(`Delete appointment: ${rowText}`, async () => {
      await this.table.getDeleteButton(rowText, 'Delete appointment').click();
      await this.modal.waitForOpen();
      await this.modal.confirm('Delete');
    });
  }

  /**
   * Get the number of visible appointment rows.
   */
  async getRowCount() {
    return await this.table.getRowCount();
  }
}
