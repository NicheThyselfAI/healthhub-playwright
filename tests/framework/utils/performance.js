// ============================================================================
// Performance Utilities — Web Vitals Capture
// ============================================================================
//
// Captures Core Web Vitals and custom performance metrics from the browser.
// Uses the Performance API and PerformanceObserver.
//
// Usage:
//   import { getWebVitals, getNavigationTiming } from '../utils/performance.js';
//
//   test('page load performance', async ({ page }) => {
//     await page.goto('/dashboard');
//     const vitals = await getWebVitals(page);
//     expect(vitals.lcp).toBeLessThan(2500);
//   });
//
// ============================================================================

/**
 * Get Core Web Vitals metrics from the page.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<{ lcp: number, fcp: number, cls: number, ttfb: number }>}
 */
export async function getWebVitals(page) {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      const vitals = { lcp: 0, fcp: 0, cls: 0, ttfb: 0 };

      // Get FCP and TTFB from PerformancePaintTiming
      const paintEntries = performance.getEntriesByType('paint');
      for (const entry of paintEntries) {
        if (entry.name === 'first-contentful-paint') {
          vitals.fcp = entry.startTime;
        }
      }

      // Get TTFB from navigation timing
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length > 0) {
        vitals.ttfb = navEntries[0].responseStart - navEntries[0].requestStart;
      }

      // Get LCP via PerformanceObserver (may need a small delay)
      try {
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
          vitals.lcp = lcpEntries[lcpEntries.length - 1].startTime;
        }
      } catch {
        // LCP may not be available in all browsers
      }

      // Get CLS from layout-shift entries
      try {
        const layoutShiftEntries = performance.getEntriesByType('layout-shift');
        for (const entry of layoutShiftEntries) {
          if (!entry.hadRecentInput) {
            vitals.cls += entry.value;
          }
        }
      } catch {
        // CLS may not be available
      }

      resolve(vitals);
    });
  });
}

/**
 * Get detailed navigation timing.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<object>} Navigation timing breakdown
 */
export async function getNavigationTiming(page) {
  return await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    if (!nav) return null;

    return {
      dns: nav.domainLookupEnd - nav.domainLookupStart,
      tcp: nav.connectEnd - nav.connectStart,
      ttfb: nav.responseStart - nav.requestStart,
      download: nav.responseEnd - nav.responseStart,
      domParsing: nav.domInteractive - nav.responseEnd,
      domReady: nav.domContentLoadedEventEnd - nav.navigationStart,
      totalLoad: nav.loadEventEnd - nav.navigationStart,
    };
  });
}

/**
 * Get resource timing for a specific resource type.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} [resourceType] — e.g., 'script', 'stylesheet', 'img'
 * @returns {Promise<Array<{ name: string, duration: number, size: number }>>}
 */
export async function getResourceTiming(page, resourceType = null) {
  return await page.evaluate((type) => {
    const entries = performance.getEntriesByType('resource');
    const filtered = type
      ? entries.filter(e => e.initiatorType === type)
      : entries;

    return filtered.map(e => ({
      name: e.name.split('/').pop(),
      duration: Math.round(e.duration),
      size: e.transferSize || 0,
    }));
  }, resourceType);
}
