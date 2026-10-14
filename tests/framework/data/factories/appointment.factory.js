// ============================================================================
// Appointment Factory — API-based Test Data Creation & Cleanup
// ============================================================================
//
// Creates and manages appointment test data via the API.
// Tracks all created items for automatic cleanup.
//
// Usage via fixture (preferred):
//   test('example', async ({ testData }) => {
//     const apt = await testData.createAppointment({ title: 'Checkup' });
//   });
//
// Standalone usage:
//   const factory = new AppointmentFactory(apiClient);
//   const apt = await factory.create({ title: 'Checkup' });
//   await factory.cleanupAll();
//
// ============================================================================

import { AppointmentBuilder } from '../builders/appointment.builder.js';
import { logger } from '../../utils/logger.js';

export class AppointmentFactory {
  /**
   * @param {import('../../utils/api-client.js').ApiClient} apiClient
   */
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.createdIds = [];
  }

  /**
   * Create an appointment via API.
   * @param {object} [overrides] — Fields to override from defaults
   * @returns {Promise<object>} Created appointment with id
   */
  async create(overrides = {}) {
    const builder = new AppointmentBuilder();

    // Apply overrides via builder methods where available
    if (overrides.title) builder.withTitle(overrides.title);
    if (overrides.appointment_date) builder.withDate(overrides.appointment_date);
    if (overrides.appointment_time) builder.withTime(overrides.appointment_time);
    if (overrides.duration_minutes) builder.withDuration(overrides.duration_minutes);
    if (overrides.type) builder.withType(overrides.type);
    if (overrides.status) builder.withStatus(overrides.status);
    if (overrides.provider) builder.withProvider(overrides.provider);
    if (overrides.location) builder.withLocation(overrides.location);
    if (overrides.description) builder.withDescription(overrides.description);
    if (overrides.notes) builder.withNotes(overrides.notes);

    const data = builder.build();
    const result = await this.apiClient.post('/appointments', data);
    this.createdIds.push(result.id);
    logger.debug('AppointmentFactory: created', { id: result.id, title: data.title });
    return result;
  }

  /**
   * Create multiple appointments.
   * @param {number} count — Number of appointments to create
   * @param {object} [overrides] — Shared overrides for all
   * @returns {Promise<object[]>} Array of created appointments
   */
  async createMany(count, overrides = {}) {
    const results = [];
    for (let i = 0; i < count; i++) {
      const apt = await this.create({
        ...overrides,
        title: overrides.title
          ? `${overrides.title} ${i + 1}`
          : `Test Apt ${Date.now()}-${i + 1}`,
      });
      results.push(apt);
    }
    return results;
  }

  /**
   * Delete all appointments created by this factory instance.
   */
  async cleanupAll() {
    for (const id of this.createdIds.reverse()) {
      try {
        await this.apiClient.delete(`/appointments/${id}`);
        logger.debug('AppointmentFactory: cleaned up', { id });
      } catch (error) {
        logger.warn(`AppointmentFactory: cleanup failed for ${id}: ${error.message}`);
      }
    }
    this.createdIds = [];
  }
}
