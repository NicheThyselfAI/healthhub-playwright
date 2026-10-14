// ============================================================================
// Playwright Configuration — Single Config, Environment-Driven
// ============================================================================
//
// This config reads TEST_ENV to determine which environment to target.
// It loads the corresponding .env file via dotenv and applies env-specific
// settings (timeout, retries, workers, tags, etc.).
//
// Usage:
//   npx playwright test --config=framework/config/playwright.config.js
//   TEST_ENV=staging npx playwright test --config=framework/config/playwright.config.js
//
// ============================================================================

import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEnvironment } from './environments.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envName = process.env.TEST_ENV || 'local';
const env = getEnvironment(envName);

// Load the correct .env file for this environment
dotenv.config({ path: path.resolve(__dirname, '..', 'env', env.envFile) });

export default defineConfig({
  testDir: path.resolve(__dirname, '..', 'tests'),
  globalSetup: path.resolve(__dirname, 'global-setup.js'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: env.retries,
  workers: env.workers,
  timeout: env.timeout,

  reporter: [
    // Built-in reporters
    ['list'],
    ['html', { open: 'never', outputFolder: path.resolve(__dirname, '..', 'playwright-report') }],
    ['junit', { outputFile: path.resolve(__dirname, '..', 'test-results', 'junit.xml') }],
    ['allure-playwright', { resultsDir: path.resolve(__dirname, '..', 'allure-results') }],

    // Custom reporter — shows real-time pass/fail icons, a run summary, and
    // flags slow tests that exceed slowThreshold ms.
    // This is an example of how to wire in a project-local reporter class.
    // See: framework/reporters/custom-reporter.js
    [path.resolve(__dirname, '..', 'reporters', 'custom-reporter.js'), { slowThreshold: 5000 }],
  ],

  // Tag filtering — e.g., prod only runs @smoke tests
  grep: env.tags ? new RegExp(env.tags) : undefined,

  use: {
    baseURL: process.env.BASE_URL || env.baseURL,
    trace: env.trace || 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Only start local servers when running locally
  webServer: envName === 'local' ? [
    {
      command: 'cd ../../../backend && npm run dev',
      url: 'http://localhost:3001/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
    {
      command: 'cd ../../../frontend && npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
  ] : undefined,
});
