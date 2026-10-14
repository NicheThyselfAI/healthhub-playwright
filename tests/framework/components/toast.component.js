// ============================================================================
// Toast Component — Toast Notification Handling
// ============================================================================
//
// Reusable component for interacting with toast notifications.
//
// LOCATOR STRATEGY:
//   - getByRole('alert')   — toast notifications render as alerts
//   - getByText()          — find toasts by their message content
//   - getByRole('button')  — dismiss button
//
// ============================================================================

import { test } from '@playwright/test';

export class ToastComponent {
  constructor(page) {
    this.page = page;
  }

  /**
   * Get all visible toast alerts.
   */
  get alerts() {
    return this.page.getByRole('alert');
  }

  /**
   * Get the toast message text locator.
   */
  get message() {
    return this.page.getByTestId('toast-message');
  }

  /**
   * Wait for a toast to appear containing specific text.
   * @param {string} text — Expected text in the toast
   * @param {number} [timeout=5000]
   */
  async waitForMessage(text, timeout = 5000) {
    await test.step(`Wait for toast: "${text}"`, async () => {
      await this.page.getByText(text).waitFor({ state: 'visible', timeout });
    });
  }

  /**
   * Wait for any toast alert to appear.
   * @param {number} [timeout=5000]
   */
  async waitForAny(timeout = 5000) {
    await test.step('Wait for toast notification', async () => {
      await this.alerts.first().waitFor({ state: 'visible', timeout });
    });
  }

  /**
   * Get the text content of the current toast message.
   * @returns {Promise<string>}
   */
  async getText() {
    return await this.message.textContent();
  }

  /**
   * Dismiss the current toast by clicking its close button.
   */
  async dismiss() {
    await test.step('Dismiss toast', async () => {
      // The dismiss button is inside the alert
      await this.alerts.first().getByRole('button').click();
    });
  }

  /**
   * Check if a toast containing specific text is visible.
   * @param {string} text — Text to look for
   * @returns {Promise<boolean>}
   */
  async hasMessage(text) {
    return await this.page.getByText(text).isVisible();
  }
}
