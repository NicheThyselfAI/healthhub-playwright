// ============================================================================
// Visual Fixture — Layer 4
// ============================================================================
//
// Extends the data fixture with visual regression testing helpers:
//
//   takeScreenshot     — Capture and compare screenshots with options
//   maskDynamicContent — Helper to mask timestamps, avatars, etc.
//
// Chain: base → auth → data → visual → index.js
//
// Usage in tests:
//   test('@visual dashboard', async ({ authenticatedPage, takeScreenshot }) => {
//     await takeScreenshot(authenticatedPage, 'dashboard', {
//       mask: [authenticatedPage.locator('.timestamp')],
//     });
//   });
//
// ============================================================================

import { test as base } from './data.fixture.js';
import { expect } from '@playwright/test';

export const test = base.extend({
  /**
   * Take a screenshot and compare against baseline.
   * Wraps Playwright's toHaveScreenshot with sensible defaults.
   */
  takeScreenshot: async ({}, use) => {
    /**
     * @param {import('@playwright/test').Page} page
     * @param {string} name — Screenshot name (without extension)
     * @param {object} [options] — toHaveScreenshot options
     */
    async function takeScreenshot(page, name, options = {}) {
      const defaults = {
        maxDiffPixelRatio: 0.01,  // Allow 1% difference
        animations: 'disabled',   // Disable CSS animations for consistency
        ...options,
      };

      await expect(page).toHaveScreenshot(`${name}.png`, defaults);
    }

    await use(takeScreenshot);
  },

  /**
   * Get common dynamic content locators to mask in screenshots.
   * Prevents false positives from timestamps, avatars, etc.
   */
  maskDynamicContent: async ({}, use) => {
    /**
     * @param {import('@playwright/test').Page} page
     * @returns {import('@playwright/test').Locator[]} Array of locators to mask
     */
    function getMasks(page) {
      return [
        page.locator('[data-testid*="timestamp"]'),
        page.locator('[data-testid*="date"]'),
        page.locator('[data-testid*="avatar"]'),
        page.locator('time'),
      ];
    }

    await use(getMasks);
  },
});

export { expect };
