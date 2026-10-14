// ============================================================================
// Global Error Handler — Capture Console & Page Errors
// ============================================================================
//
// Attaches listeners to a Playwright page to capture:
//   - Console errors (console.error in the app)
//   - Page errors (unhandled exceptions in the app)
//
// Captured errors are attached to the test report for debugging.
//
// Usage (typically used inside a fixture):
//
//   import { setupGlobalErrorHandling } from '../utils/error-handler.js';
//
//   const errorHandler = setupGlobalErrorHandling(page);
//   await use(page);
//   await errorHandler.attachToReport(testInfo);
//
// ============================================================================

import { logger } from './logger.js';

/**
 * Set up global error listeners on a Playwright page.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {object} Error handler with getters and report attachment
 */
export function setupGlobalErrorHandling(page) {
  const consoleErrors = [];
  const pageErrors = [];

  // Capture console.error messages from the app
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push({
        text: msg.text(),
        url: msg.location()?.url || 'unknown',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Capture unhandled exceptions from the app
  page.on('pageerror', (error) => {
    pageErrors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    logger.error('Page error captured', { message: error.message });
  });

  return {
    /** @returns {Array} Console errors captured during the test */
    getConsoleErrors() {
      return consoleErrors;
    },

    /** @returns {Array} Page errors captured during the test */
    getPageErrors() {
      return pageErrors;
    },

    /** @returns {boolean} Whether any errors were captured */
    hasErrors() {
      return consoleErrors.length > 0 || pageErrors.length > 0;
    },

    /**
     * Attach captured errors to the Playwright test report.
     * Call this in fixture teardown (after `await use(page)`).
     *
     * @param {import('@playwright/test').TestInfo} testInfo
     */
    async attachToReport(testInfo) {
      if (consoleErrors.length > 0) {
        await testInfo.attach('console-errors', {
          body: JSON.stringify(consoleErrors, null, 2),
          contentType: 'application/json',
        });
      }
      if (pageErrors.length > 0) {
        await testInfo.attach('page-errors', {
          body: JSON.stringify(pageErrors, null, 2),
          contentType: 'application/json',
        });
      }
    },
  };
}
