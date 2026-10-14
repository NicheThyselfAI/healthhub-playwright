// ============================================================================
// ARIA Snapshot Helpers — Accessibility Tree Assertions
// ============================================================================
//
// Playwright's toMatchAriaSnapshot() captures the accessibility tree as a
// YAML-like text format. It validates that roles, names, and structure match
// an expected template — catching structural and semantic regressions without
// relying on pixel-level visual diffs.
//
// Key concepts:
//   - Snapshots capture the **accessibility tree**, not the DOM
//   - Template strings use YAML indentation to express tree hierarchy
//   - Use regex (/pattern/) for dynamic content (dates, IDs, counts)
//   - Scope to a locator (component) for focused, stable snapshots
//   - Run with --update-snapshots to generate/update baselines
//
// Usage:
//   import { verifyAriaSnapshot, verifyComponentAria } from './aria-snapshot-helpers.js';
//
//   // Full page snapshot (broad — good for smoke tests)
//   await verifyAriaSnapshot(page, 'login-page');
//
//   // Component-scoped snapshot (focused — good for regression tests)
//   await verifyComponentAria(page.getByRole('form'), 'login-form');
//
// ============================================================================

import { expect, test } from '@playwright/test';

/**
 * Assert that a page or locator matches its ARIA snapshot baseline.
 * Wraps the assertion in a test.step for readable trace output.
 *
 * On first run (no baseline), use --update-snapshots to create:
 *   npx playwright test --update-snapshots
 *
 * @param {import('@playwright/test').Page | import('@playwright/test').Locator} target
 * @param {string} snapshotName — descriptive name for the snapshot file
 */
export async function verifyAriaSnapshot(target, snapshotName) {
  await test.step(`Verify ARIA snapshot: ${snapshotName}`, async () => {
    await expect(target).toMatchAriaSnapshot({ name: `${snapshotName}.yml` });
  });
}

/**
 * Assert that a component locator matches its ARIA snapshot.
 * Alias for verifyAriaSnapshot — makes intent clearer when scoping to components.
 *
 * @param {import('@playwright/test').Locator} locator — component locator
 * @param {string} snapshotName — descriptive name for the snapshot
 */
export async function verifyComponentAria(locator, snapshotName) {
  await verifyAriaSnapshot(locator, snapshotName);
}

/**
 * Assert that an inline ARIA template matches the target's accessibility tree.
 * Use this for focused assertions where you don't need a file-based baseline.
 *
 * Template syntax (YAML-like):
 *   - Indentation = nesting in the tree
 *   - "- role 'accessible name'" to match a node
 *   - /regex/ for dynamic text
 *   - Omit children you don't care about — partial matching by default
 *
 * @param {import('@playwright/test').Page | import('@playwright/test').Locator} target
 * @param {string} template — inline ARIA template string
 * @param {string} [description] — optional step description
 *
 * @example
 *   await assertAriaTree(page.getByRole('navigation'), `
 *     - navigation:
 *       - link "Dashboard"
 *       - link "Appointments"
 *       - link "Health Records"
 *   `);
 */
export async function assertAriaTree(target, template, description) {
  const stepName = description || 'Assert ARIA tree structure';
  await test.step(stepName, async () => {
    await expect(target).toMatchAriaSnapshot(template);
  });
}
