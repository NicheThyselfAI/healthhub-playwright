// ============================================================================
// Modal Component — Dialog Interactions
// ============================================================================
//
// Reusable component for modal dialog interactions.
// The app uses <dialog> with role="dialog" and aria-labelledby.
//
// ============================================================================

import { test } from '@playwright/test';

export class ModalComponent {
  constructor(page) {
    this.page = page;

    this.dialog      = page.getByRole('dialog');
    this.closeButton = page.getByRole('button', { name: 'Close modal' });
  }

  /**
   * Get the modal title heading.
   * @param {string} title — Expected title text
   */
  getTitle(title) {
    return this.dialog.getByRole('heading', { name: title });
  }

  async waitForOpen() {
    await test.step('Wait for modal to open', async () => {
      await this.dialog.waitFor({ state: 'visible' });
    });
  }

  async waitForClose() {
    await test.step('Wait for modal to close', async () => {
      await this.dialog.waitFor({ state: 'hidden' });
    });
  }

  async close() {
    await test.step('Close modal', async () => {
      await this.closeButton.click();
      await this.dialog.waitFor({ state: 'hidden' });
    });
  }

  async isOpen() {
    return await this.dialog.isVisible();
  }

  /**
   * Click the confirm button in a ConfirmModal (e.g., "Delete").
   * @param {string} [text='Confirm'] — Button text
   */
  async confirm(text = 'Confirm') {
    await test.step(`Confirm modal: ${text}`, async () => {
      await this.dialog.getByRole('button', { name: text }).click();
    });
  }

  /**
   * Click the cancel button in a ConfirmModal.
   */
  async cancel() {
    await test.step('Cancel modal', async () => {
      await this.dialog.getByRole('button', { name: 'Cancel' }).click();
    });
  }
}
