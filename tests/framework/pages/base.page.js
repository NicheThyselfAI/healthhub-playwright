// ============================================================================
// Base Page — Thin Abstract Base Class
// ============================================================================
//
// Provides shared behaviors that appear on ALL pages.
// Keep this THIN — max 5 methods. No business logic.
// Only truly cross-cutting concerns: toasts, loading, navigation.
//
// RULES:
//   - Subclasses MUST implement waitForPageReady()
//   - No page-specific selectors belong here
//   - Uses composition (ToastComponent) not inheritance for UI fragments
//
// ============================================================================

import { ToastComponent } from '../components/toast.component.js';

export class BasePage {
  constructor(page) {
    this.page = page;
    this.toast = new ToastComponent(page);
  }

  /**
   * Wait for the page to be fully loaded and ready for interaction.
   * Each page subclass MUST override this with page-specific ready checks.
   */
  async waitForPageReady() {
    throw new Error(`${this.constructor.name} must implement waitForPageReady()`);
  }

  /**
   * Wait for the loading spinner to disappear.
   */
  async waitForLoadingComplete() {
    const spinner = this.page.getByTestId('loading-spinner');
    // Only wait if spinner is currently visible
    if (await spinner.isVisible()) {
      await spinner.waitFor({ state: 'hidden', timeout: 10000 });
    }
  }

  /**
   * Get the current page path (without origin).
   * @returns {Promise<string>}
   */
  async getCurrentPath() {
    return new URL(this.page.url()).pathname;
  }
}
