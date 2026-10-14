// ============================================================================
// Health Records Page — Page Object
// ============================================================================
//
// LOCATOR STRATEGY:
//   - getByRole('heading')    — page title, empty state, modal titles
//   - getByRole('button')     — Export, View record, Delete record (aria-labels)
//   - getByRole('checkbox')   — Select all (aria-label), per-row select
//   - getByRole('dialog')     — modal dialogs
//   - getByPlaceholder()      — search input (no label in app)
//   - getByTestId()           — ONLY for filter/sort selects (no labels)
//
// ============================================================================

import { test } from '@playwright/test';
import { BasePage } from './base.page.js';
import { SidebarComponent } from '../components/sidebar.component.js';
import { ModalComponent } from '../components/modal.component.js';
import { TableComponent } from '../components/table.component.js';

export class HealthRecordsPage extends BasePage {
  constructor(page) {
    super(page);

    // Composed components
    this.sidebar = new SidebarComponent(page);
    this.modal   = new ModalComponent(page);
    this.table   = new TableComponent(page, {
      searchPlaceholder: 'Search records...',
      testIdPrefix: 'records',
    });

    // Page-level elements
    this.pageHeading  = page.getByRole('heading', { name: 'Health Records' });
    this.exportButton = page.getByRole('button', { name: 'Export' });
    this.selectAll    = page.getByRole('checkbox', { name: 'Select all records' });
  }

  async waitForPageReady() {
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async goto() {
    await test.step('Navigate to health records page', async () => {
      await this.page.goto('/health-records');
      await this.waitForPageReady();
    });
  }

  /**
   * Navigate via sidebar (preserves auth state).
   */
  async navigateViaSidebar() {
    await this.sidebar.navigateTo('Health Records');
    await this.waitForPageReady();
  }

  /**
   * View a record by clicking the view button in its row.
   * @param {string} rowText — Text identifying the row (e.g., record title)
   */
  async viewRecord(rowText) {
    await test.step(`View record: ${rowText}`, async () => {
      await this.table.getRowByText(rowText)
        .getByRole('button', { name: 'View record' }).click();
      await this.modal.waitForOpen();
    });
  }

  /**
   * Delete a record by clicking the delete button in its row.
   * @param {string} rowText — Text identifying the row
   */
  async deleteRecord(rowText) {
    await test.step(`Delete record: ${rowText}`, async () => {
      await this.table.getRowByText(rowText)
        .getByRole('button', { name: 'Delete record' }).click();
      await this.modal.waitForOpen();
      await this.modal.confirm('Delete');
    });
  }

  /**
   * Select all records checkbox.
   */
  async selectAllRecords() {
    await test.step('Select all records', async () => {
      await this.selectAll.check();
    });
  }

  /**
   * Get the number of visible record rows.
   */
  async getRowCount() {
    return await this.table.getRowCount();
  }
}
