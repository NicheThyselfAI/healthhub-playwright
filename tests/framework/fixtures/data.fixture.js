// ============================================================================
// Data Fixture — Layer 3
// ============================================================================
//
// Extends the auth fixture with test data management:
//
//   apiClient           — Worker-scoped API client (shares auth token)
//   testData            — Test-scoped data helper with auto-cleanup
//
// Chain: base → auth → data → visual → index.js
//
// Usage in tests:
//   test('create appointment', async ({ authenticatedPage, testData }) => {
//     const apt = await testData.createAppointment({ title: 'Checkup' });
//     // ... test logic
//     // Cleanup happens automatically after the test
//   });
//
// ============================================================================

import { test as base } from './auth.fixture.js';
import { ApiClient } from '../utils/api-client.js';
import { CREDENTIALS } from '../data/constants.js';
import { logger } from '../utils/logger.js';

export const test = base.extend({
  // ── Worker-scoped API client ─────────────────────────────────────
  // Created once per worker, shares the auth token.
  apiClient: [async ({ authToken }, use) => {
    const client = new ApiClient(authToken);
    logger.debug('Data fixture: API client created');
    await use(client);
  }, { scope: 'worker' }],

  // ── Test-scoped data helper with auto-cleanup ────────────────────
  // Tracks all created entities and deletes them after the test.
  testData: async ({ apiClient }, use) => {
    const createdItems = [];

    const helper = {
      /**
       * Create an appointment via API.
       * Automatically tracked for cleanup.
       */
      async createAppointment(overrides = {}) {
        const data = {
          title: `Test Apt ${Date.now()}`,
          appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          appointment_time: '10:00',
          duration_minutes: 30,
          type: 'general',
          status: 'scheduled',
          description: 'Auto-generated test appointment',
          ...overrides,
        };

        const result = await apiClient.post('/appointments', data);
        createdItems.push({ type: 'appointment', id: result.id });
        logger.debug('Created appointment', { id: result.id, title: data.title });
        return result;
      },

      /**
       * Create a health record via API.
       * Automatically tracked for cleanup.
       */
      async createHealthRecord(overrides = {}) {
        const data = {
          record_type: 'vital',
          category: 'Blood Pressure',
          title: `Test Record ${Date.now()}`,
          value: '120/80',
          unit: 'mmHg',
          recorded_date: new Date().toISOString().split('T')[0],
          ...overrides,
        };

        const result = await apiClient.post('/health-records', data);
        createdItems.push({ type: 'health-record', id: result.id });
        logger.debug('Created health record', { id: result.id, title: data.title });
        return result;
      },

      /**
       * Create a medication via API.
       * Automatically tracked for cleanup.
       */
      async createMedication(overrides = {}) {
        const data = {
          name: `Test Med ${Date.now()}`,
          dosage: '10mg',
          frequency: 'Once daily',
          start_date: new Date().toISOString().split('T')[0],
          status: 'active',
          ...overrides,
        };

        const result = await apiClient.post('/medications', data);
        createdItems.push({ type: 'medication', id: result.id });
        logger.debug('Created medication', { id: result.id, name: data.name });
        return result;
      },

      /**
       * Get all created items (for assertions).
       */
      getCreatedItems() {
        return [...createdItems];
      },
    };

    await use(helper);

    // ── Cleanup: delete all created items in reverse order ──────────
    for (const item of createdItems.reverse()) {
      try {
        const endpoint = item.type === 'health-record' ? 'health-records' : `${item.type}s`;
        await apiClient.delete(`/${endpoint}/${item.id}`);
        logger.debug(`Cleaned up ${item.type}`, { id: item.id });
      } catch (error) {
        // Non-fatal — log but don't fail the test
        logger.warn(`Cleanup failed for ${item.type} ${item.id}: ${error.message}`);
      }
    }
  },
});
