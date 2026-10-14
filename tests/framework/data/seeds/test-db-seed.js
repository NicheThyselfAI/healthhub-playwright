// ============================================================================
// Test DB Seed — Database Reset & Seed Utility
// ============================================================================
//
// Resets the test database to a known state via the dev API endpoint.
// Use this in globalSetup or before test suites that need a clean DB.
//
// The HealthHub backend provides POST /api/v1/_dev/reset which:
//   1. Drops and recreates all tables
//   2. Re-seeds with default test data (patient, admin users)
//
// Usage:
//   import { resetDatabase, seedTestData } from './test-db-seed.js';
//
//   // In globalSetup or beforeAll:
//   await resetDatabase();
//
//   // Or seed specific data for a test suite:
//   await seedTestData(apiClient, { appointments: 5 });
//
// ============================================================================

import { logger } from '../../utils/logger.js';
import { API } from '../constants.js';

const API_BASE = process.env.API_BASE_URL || API.BASE_URL;

/**
 * Reset the test database to its default state.
 * Calls POST /_dev/reset on the backend.
 *
 * @returns {Promise<void>}
 */
export async function resetDatabase() {
  const url = `${API_BASE}${API.ENDPOINTS.DEV_RESET}`;
  logger.info('Resetting test database...');

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Database reset failed: ${response.status} ${response.statusText}`);
  }

  logger.info('Database reset complete');
}

/**
 * Seed test data for a test suite.
 * Creates a specified number of each entity type.
 *
 * @param {import('../../utils/api-client.js').ApiClient} apiClient — Authenticated client
 * @param {object} counts — Entity counts to create
 * @param {number} [counts.appointments=0]
 * @param {number} [counts.healthRecords=0]
 * @param {number} [counts.medications=0]
 * @returns {Promise<{ appointments: object[], healthRecords: object[], medications: object[] }>}
 */
export async function seedTestData(apiClient, counts = {}) {
  const { appointments = 0, healthRecords = 0, medications = 0 } = counts;
  const seeded = { appointments: [], healthRecords: [], medications: [] };

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];

  for (let i = 0; i < appointments; i++) {
    const result = await apiClient.post('/appointments', {
      title: `Seed Appointment ${i + 1}`,
      appointment_date: tomorrow,
      appointment_time: `${9 + (i % 8)}:00`,
      duration_minutes: 30,
      type: 'general',
      status: 'scheduled',
    });
    seeded.appointments.push(result);
  }

  for (let i = 0; i < healthRecords; i++) {
    const result = await apiClient.post('/health-records', {
      record_type: 'vital',
      category: 'Blood Pressure',
      title: `Seed Record ${i + 1}`,
      value: `${110 + i * 5}/${70 + i * 2}`,
      unit: 'mmHg',
      recorded_date: today,
    });
    seeded.healthRecords.push(result);
  }

  for (let i = 0; i < medications; i++) {
    const result = await apiClient.post('/medications', {
      name: `Seed Medication ${i + 1}`,
      dosage: `${(i + 1) * 10}mg`,
      frequency: 'Once daily',
      start_date: today,
      status: 'active',
    });
    seeded.medications.push(result);
  }

  logger.info('Seeded test data', {
    appointments: seeded.appointments.length,
    healthRecords: seeded.healthRecords.length,
    medications: seeded.medications.length,
  });

  return seeded;
}
