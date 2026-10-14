// ============================================================================
// Environment Configuration Registry
// ============================================================================
//
// Defines settings for each environment (local, staging, UAT, prod).
// The playwright.config.js reads the active environment via TEST_ENV.
//
// Usage:
//   TEST_ENV=staging npx playwright test
//   TEST_ENV=uat npx playwright test
//   TEST_ENV=prod npx playwright test        (smoke only)
//   npx playwright test                       (defaults to 'local')
//
// ============================================================================

const environments = {
  local: {
    name: 'local',
    baseURL: 'http://localhost:5173',
    apiURL: 'http://localhost:3001/api/v1',
    envFile: '.env.local',
    timeout: 30000,
    retries: 0,
    workers: 4,                // Limit to avoid session conflicts with same-user auth
    tags: null,                // Run all tests
    trace: 'on-first-retry',
  },

  staging: {
    name: 'staging',
    baseURL: 'https://staging.healthhub.test',
    apiURL: 'https://staging-api.healthhub.test/api/v1',
    envFile: '.env.staging',
    timeout: 60000,            // Staging is slower
    retries: 2,
    workers: 4,
    tags: '@smoke|@regression',
    trace: 'on-first-retry',
  },

  uat: {
    name: 'uat',
    baseURL: 'https://uat.healthhub.test',
    apiURL: 'https://uat-api.healthhub.test/api/v1',
    envFile: '.env.uat',
    timeout: 60000,
    retries: 2,
    workers: 2,                // Conservative on shared env
    tags: '@smoke|@regression|@visual',
    trace: 'retain-on-failure',
  },

  prod: {
    name: 'prod',
    baseURL: 'https://app.healthhub.test',
    apiURL: 'https://api.healthhub.test/api/v1',
    envFile: '.env.prod',
    timeout: 45000,
    retries: 1,
    workers: 1,                // Sequential in prod
    tags: '@smoke',            // Smoke tests only
    trace: 'off',
    readOnly: true,            // No create/delete operations
  },
};

/**
 * Get environment configuration by name.
 * @param {string} name - Environment name (local, staging, uat, prod)
 * @returns {object} Environment configuration
 * @throws {Error} If environment name is not recognized
 */
export function getEnvironment(name) {
  const env = environments[name];
  if (!env) {
    const valid = Object.keys(environments).join(', ');
    throw new Error(`Unknown environment "${name}". Valid environments: ${valid}`);
  }
  return env;
}

export { environments };
