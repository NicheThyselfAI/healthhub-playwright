// ============================================================================
// Fixture Index — Single Import Point for All Tests
// ============================================================================
//
// Tests import from here — NEVER directly from '@playwright/test'.
// This ensures all fixtures (error handling, auth, data, visual) are active.
//
// Chain: base → auth → data → visual → THIS FILE
//
// Available fixtures:
//   page                — Enhanced with global error capture (from base)
//   authToken           — Worker-scoped JWT token (from auth)
//   authenticatedPage   — Pre-authenticated page (from auth)
//   apiClient           — Worker-scoped API client (from data)
//   testData            — Test data helper with auto-cleanup (from data)
//   takeScreenshot      — Visual regression helper (from visual)
//   maskDynamicContent  — Dynamic content masking helper (from visual)
//
// Usage:
//   import { test, expect } from '../../fixtures/index.js';
//
//   test('my test', async ({ authenticatedPage, testData }) => {
//     const apt = await testData.createAppointment({ title: 'Checkup' });
//     // ...assertions...
//     // Cleanup happens automatically
//   });
//
// ============================================================================

export { test } from './visual.fixture.js';
export { expect } from '@playwright/test';
