// ============================================================================
// Accessibility Utilities — axe-core Wrapper
// ============================================================================
//
// Wraps @axe-core/playwright for easy accessibility scanning.
// Provides configurable a11y checks with sensible defaults.
//
// Prerequisites:
//   npm install -D @axe-core/playwright
//
// Usage:
//   import { checkAccessibility } from '../utils/accessibility.js';
//
//   test('dashboard a11y', async ({ page }) => {
//     await page.goto('/dashboard');
//     const results = await checkAccessibility(page);
//     expect(results.violations).toHaveLength(0);
//   });
//
// ============================================================================

import AxeBuilder from '@axe-core/playwright';

/**
 * Run an accessibility scan on the current page.
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} [options]
 * @param {string[]} [options.include] — CSS selectors to include (default: whole page)
 * @param {string[]} [options.exclude] — CSS selectors to exclude
 * @param {string[]} [options.tags] — WCAG tags to check (default: ['wcag2a', 'wcag2aa'])
 * @param {string[]} [options.disableRules] — Rules to disable
 * @returns {Promise<import('axe-core').AxeResults>}
 */
export async function checkAccessibility(page, options = {}) {
  const {
    include = [],
    exclude = [],
    tags = ['wcag2a', 'wcag2aa'],
    disableRules = [],
  } = options;

  let builder = new AxeBuilder({ page }).withTags(tags);

  if (include.length > 0) {
    builder = builder.include(include);
  }

  if (exclude.length > 0) {
    for (const selector of exclude) {
      builder = builder.exclude(selector);
    }
  }

  if (disableRules.length > 0) {
    builder = builder.disableRules(disableRules);
  }

  return await builder.analyze();
}

/**
 * Format accessibility violations for readable test output.
 *
 * @param {import('axe-core').Result[]} violations
 * @returns {string} Human-readable violation report
 */
export function formatViolations(violations) {
  if (violations.length === 0) return 'No accessibility violations found.';

  return violations.map((v, i) => {
    const nodes = v.nodes.map(n => `  - ${n.html.substring(0, 80)}`).join('\n');
    return `${i + 1}. ${v.id}: ${v.help} (${v.impact})\n${nodes}`;
  }).join('\n\n');
}
