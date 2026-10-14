// ============================================================================
// Base Fixture — Layer 1
// ============================================================================
//
// Extends Playwright's base test with global error handling.
// Every test automatically captures console errors and page errors,
// and attaches them to the test report on failure.
//
// Also applies Allure epic/feature/story labels derived from the test file
// path — this populates the Behaviors tab with a meaningful hierarchy:
//   Epic    → HealthHub (always)
//   Feature → Auth | Appointments | Dashboard | API | E2E | Visual | ...
//   Story   → spec file name (e.g. login, crud, web-vitals)
//
// Chain: base → auth → data → visual → index.js
//
// ============================================================================

import { test as playwrightTest } from '@playwright/test';
import { epic, feature, story } from 'allure-js-commons';
import path from 'path';
import { setupGlobalErrorHandling } from '../utils/error-handler.js';

// Maps the test sub-folder to a human-readable Feature name.
const FEATURE_MAP = {
  auth:            'Authentication',
  appointments:    'Appointments',
  dashboard:       'Dashboard',
  api:             'API',
  e2e:             'End-to-End Journeys',
  visual:          'Visual Regression',
  performance:     'Performance',
  accessibility:   'Accessibility',
  'aria-snapshots': 'ARIA Snapshots',
};

function getFeatureAndStory(filePath) {
  const parts = filePath.replace(/\\/g, '/').split('/');
  const testsIdx = parts.lastIndexOf('tests');
  const folder = testsIdx !== -1 ? parts[testsIdx + 1] : null;
  const feature = FEATURE_MAP[folder] ?? 'Framework';
  const story = path.basename(filePath, '.spec.js');
  return { feature, story };
}

export const test = playwrightTest.extend({
  // Override the default page fixture to add error capturing and Allure labels
  page: async ({ page }, use, testInfo) => {
    // Set up global error listeners before the test runs
    const errorHandler = setupGlobalErrorHandling(page);

    // Tag every test with Allure epic/feature/story for the Behaviors tab
    const { feature: featureName, story: storyName } = getFeatureAndStory(testInfo.file);
    await epic('HealthHub');
    await feature(featureName);
    await story(storyName);

    // Hand the page to the test
    await use(page);

    // After the test: attach captured errors to the report
    await errorHandler.attachToReport(testInfo);
  },
});
