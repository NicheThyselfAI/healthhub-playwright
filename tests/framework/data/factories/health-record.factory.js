// ============================================================================
// Health Record Factory — API-based Test Data Creation & Cleanup
// ============================================================================
//
// Creates and manages health record test data via the API.
// Tracks all created items for automatic cleanup.
//
// Usage:
//   const factory = new HealthRecordFactory(apiClient);
//   const record = await factory.create({ category: 'Heart Rate', value: '72' });
//   await factory.cleanupAll();
//
// ============================================================================

import { HealthRecordBuilder } from '../builders/health-record.builder.js';
import { logger } from '../../utils/logger.js';

export class HealthRecordFactory {
  /**
   * @param {import('../../utils/api-client.js').ApiClient} apiClient
   */
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.createdIds = [];
  }

  /**
   * Create a health record via API.
   * @param {object} [overrides] — Fields to override from defaults
   * @returns {Promise<object>} Created health record with id
   */
  async create(overrides = {}) {
    const builder = new HealthRecordBuilder();

    if (overrides.record_type) builder.withType(overrides.record_type);
    if (overrides.category) builder.withCategory(overrides.category);
    if (overrides.title) builder.withTitle(overrides.title);
    if (overrides.value) builder.withValue(overrides.value);
    if (overrides.unit) builder.withUnit(overrides.unit);
    if (overrides.recorded_date) builder.withDate(overrides.recorded_date);
    if (overrides.notes) builder.withNotes(overrides.notes);

    const data = builder.build();
    const result = await this.apiClient.post('/health-records', data);
    this.createdIds.push(result.id);
    logger.debug('HealthRecordFactory: created', { id: result.id, title: data.title });
    return result;
  }

  /**
   * Create multiple health records.
   * @param {number} count
   * @param {object} [overrides]
   * @returns {Promise<object[]>}
   */
  async createMany(count, overrides = {}) {
    const results = [];
    for (let i = 0; i < count; i++) {
      const record = await this.create({
        ...overrides,
        title: overrides.title
          ? `${overrides.title} ${i + 1}`
          : `Test Record ${Date.now()}-${i + 1}`,
      });
      results.push(record);
    }
    return results;
  }

  /**
   * Delete all health records created by this factory instance.
   */
  async cleanupAll() {
    for (const id of this.createdIds.reverse()) {
      try {
        await this.apiClient.delete(`/health-records/${id}`);
        logger.debug('HealthRecordFactory: cleaned up', { id });
      } catch (error) {
        logger.warn(`HealthRecordFactory: cleanup failed for ${id}: ${error.message}`);
      }
    }
    this.createdIds = [];
  }
}
