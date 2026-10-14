// ============================================================================
// Table Component — Generic Table Interactions
// ============================================================================
//
// Reusable component for table interactions: rows, sorting, filtering,
// searching, and pagination.
//
// LOCATOR STRATEGY:
//   - getByRole('table')           — table element
//   - getByRole('row')             — table rows
//   - getByRole('columnheader')    — column headers
//   - getByPlaceholder()           — search inputs
//   - getByRole('button', { name }) — action buttons with aria-labels
//   - getByTestId() — ONLY for filter/sort selects that lack <label> in the app
//
// ============================================================================

import { test } from '@playwright/test';

export class TableComponent {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {object} options
   * @param {string} options.searchPlaceholder — Placeholder text for search input
   * @param {string} options.testIdPrefix — Prefix for testid fallbacks (e.g., 'appointments')
   */
  constructor(page, { searchPlaceholder, testIdPrefix }) {
    this.page = page;
    this.testIdPrefix = testIdPrefix;

    // Accessible locators
    this.table       = page.getByRole('table');
    this.searchInput = page.getByPlaceholder(searchPlaceholder);

    // Sort/filter selects — these have NO <label> in the app markup,
    // so getByRole('combobox') can't identify them by name.
    // testid is the only reliable option here.
    this.sortSelect = page.getByTestId(`${testIdPrefix}-sort`);

    // Empty state
    this.emptyState = page.getByTestId(`${testIdPrefix}-empty`);
  }

  /**
   * Get a filter select by its testid suffix.
   * NOTE: Filter selects lack labels in the app — testid is required.
   * @param {string} filterName — e.g., 'status-filter', 'type-filter'
   */
  getFilter(filterName) {
    return this.page.getByTestId(`${this.testIdPrefix}-${filterName}`);
  }

  /**
   * Get all data rows in the table (excludes header row).
   */
  getRows() {
    return this.table.getByRole('row').filter({
      has: this.page.locator('td'),
    });
  }

  /**
   * Get the count of visible data rows.
   */
  async getRowCount() {
    return await this.getRows().count();
  }

  /**
   * Get a row containing specific text.
   * @param {string} text — Text to search for in the row
   */
  getRowByText(text) {
    return this.table.getByRole('row').filter({ hasText: text });
  }

  /**
   * Get the edit button within a specific row.
   * @param {string} rowText — Text identifying the row
   * @param {string} [ariaLabel='Edit appointment'] — aria-label on the button
   */
  getEditButton(rowText, ariaLabel = 'Edit appointment') {
    return this.getRowByText(rowText).getByRole('button', { name: ariaLabel });
  }

  /**
   * Get the delete button within a specific row.
   * @param {string} rowText — Text identifying the row
   * @param {string} [ariaLabel='Delete appointment'] — aria-label on the button
   */
  getDeleteButton(rowText, ariaLabel = 'Delete appointment') {
    return this.getRowByText(rowText).getByRole('button', { name: ariaLabel });
  }

  /**
   * Wait for table data to load (at least one data row visible).
   * IMPORTANT: Call this before changing sort/filter to avoid race conditions.
   */
  async waitForData() {
    await test.step('Wait for table data to load', async () => {
      await this.getRows().first().waitFor({ state: 'visible', timeout: 10000 });
    });
  }

  /**
   * Search the table.
   * @param {string} query
   */
  async search(query) {
    await test.step(`Search: "${query}"`, async () => {
      await this.searchInput.fill(query);
    });
  }

  /**
   * Sort the table by selecting a sort option.
   * Waits for initial data load first to avoid race conditions.
   * @param {string} value — Sort value (e.g., 'appointment_date:asc')
   */
  async sortBy(value) {
    await test.step(`Sort by: ${value}`, async () => {
      await this.waitForData();
      await this.sortSelect.selectOption(value);
    });
  }

  /**
   * Filter by selecting an option from a filter select.
   * @param {string} filterName — Filter testid suffix (e.g., 'status-filter')
   * @param {string} value — Option value
   */
  async filterBy(filterName, value) {
    await test.step(`Filter ${filterName}: ${value}`, async () => {
      await this.waitForData();
      await this.getFilter(filterName).selectOption(value);
    });
  }

  /**
   * Get a column header by text.
   * @param {string} name — Column header text (e.g., 'Title', 'Status')
   */
  getColumnHeader(name) {
    return this.table.getByRole('columnheader', { name });
  }

  /**
   * Check if the table is in empty state.
   */
  async isEmpty() {
    return await this.emptyState.isVisible();
  }
}
