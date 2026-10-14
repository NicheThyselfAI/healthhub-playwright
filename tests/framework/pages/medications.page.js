// ============================================================================
// Medications Page — Page Object
// ============================================================================
//
// LOCATOR STRATEGY — getByRole first:
//   - getByRole('heading')          — page title
//   - getByRole('button')           — Add Medication, Save, Cancel
//   - getByRole('textbox', { name })— form text inputs (Name, Dosage, etc.)
//   - getByRole('combobox', { name})— form selects (Frequency, Status)
//   - getByLabel()                  — date inputs (Start Date, End Date)
//   - getByTestId()                 — ONLY for per-item edit/delete buttons
//                                     (identified by dynamic ID)
//
// ============================================================================

import { test } from '@playwright/test';
import { BasePage } from './base.page.js';
import { SidebarComponent } from '../components/sidebar.component.js';
import { ModalComponent } from '../components/modal.component.js';

export class MedicationsPage extends BasePage {
  constructor(page) {
    super(page);

    // Composed components
    this.sidebar = new SidebarComponent(page);
    this.modal   = new ModalComponent(page);

    // Page-level elements
    this.pageHeading      = page.getByRole('heading', { name: 'Medications', exact: true });
    // Uses testid because "Add Medication" text appears on both the page
    // header button and the modal save button — getByRole would match 2
    this.addMedicationBtn = page.getByTestId('medications-new-btn');
  }

  async waitForPageReady() {
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async goto() {
    await test.step('Navigate to medications page', async () => {
      await this.page.goto('/medications');
      await this.waitForPageReady();
    });
  }

  /**
   * Navigate via sidebar (preserves auth state).
   */
  async navigateViaSidebar() {
    await this.sidebar.navigateTo('Medications');
    await this.waitForPageReady();
  }

  /**
   * Add a new medication via the UI form.
   * @param {object} data — Medication data
   * @param {string} data.name — Required
   * @param {string} data.dosage — Required (e.g., '10mg')
   * @param {string} data.frequency — Required (e.g., 'Once daily')
   * @param {string} data.startDate — Required (YYYY-MM-DD)
   * @param {string} [data.endDate]
   * @param {string} [data.prescriber]
   * @param {string} [data.pharmacy]
   * @param {string} [data.refills]
   * @param {string} [data.instructions]
   * @param {string} [data.sideEffects]
   */
  async addMedication(data) {
    await test.step(`Add medication: ${data.name}`, async () => {
      await this.addMedicationBtn.click();

      const dialog = this.page.getByRole('dialog');
      await dialog.waitFor({ state: 'visible' });

      // Required fields — all use getByRole/getByLabel
      await dialog.getByRole('textbox', { name: 'Medication Name' }).fill(data.name);
      await dialog.getByRole('textbox', { name: 'Dosage' }).fill(data.dosage);
      await dialog.getByRole('combobox', { name: 'Frequency' }).selectOption(data.frequency);
      await dialog.getByLabel('Start Date').fill(data.startDate);

      // Optional fields
      if (data.endDate)      await dialog.getByLabel('End Date').fill(data.endDate);
      if (data.prescriber)   await dialog.getByRole('textbox', { name: 'Prescriber' }).fill(data.prescriber);
      if (data.pharmacy)     await dialog.getByRole('textbox', { name: 'Pharmacy' }).fill(data.pharmacy);
      if (data.refills)      await dialog.getByRole('spinbutton', { name: 'Refills Remaining' }).fill(data.refills);
      if (data.instructions) await dialog.getByRole('textbox', { name: 'Instructions' }).fill(data.instructions);
      if (data.sideEffects)  await dialog.getByRole('textbox', { name: /Side Effects/i }).fill(data.sideEffects);

      // Save — scroll to button (form is tall), listen for API response
      const saveBtn = dialog.getByRole('button', { name: 'Add Medication' });
      await saveBtn.scrollIntoViewIfNeeded();

      const responsePromise = this.page.waitForResponse(
        (resp) =>
          resp.url().includes('/api') &&
          resp.url().includes('/medications') &&
          resp.request().method() === 'POST',
      );
      await saveBtn.click();
      await responsePromise;
    });
  }

  /**
   * Edit a medication by clicking its edit button.
   * Uses testid because each item's edit button is identified by dynamic ID.
   * @param {number} id — Medication ID
   */
  async editMedication(id) {
    await test.step(`Edit medication: ${id}`, async () => {
      await this.page.getByTestId(`medication-edit-${id}`).click();
      await this.page.getByRole('dialog').waitFor({ state: 'visible' });
    });
  }

  /**
   * Delete a medication by clicking its delete button and confirming.
   * @param {number} id — Medication ID
   */
  async deleteMedication(id) {
    await test.step(`Delete medication: ${id}`, async () => {
      await this.page.getByTestId(`medication-delete-${id}`).click();
      await this.modal.waitForOpen();
      await this.modal.confirm('Delete');
    });
  }

  /**
   * Check if a medication with given name is visible in the list.
   * @param {string} name
   */
  getMedicationByName(name) {
    return this.page.getByText(name);
  }
}
