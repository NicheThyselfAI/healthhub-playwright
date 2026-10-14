// ============================================================================
// Appointments API Tests — Direct API-level CRUD Tests
// ============================================================================
import { test, expect } from '../../fixtures/index.js';
import { AppointmentBuilder } from '../../data/builders/appointment.builder.js';
import { AppointmentFactory } from '../../data/factories/appointment.factory.js';

test.describe('Appointments API', () => {

  test('GET /appointments — returns list', async ({ apiClient }) => {
    const data = await apiClient.get('/appointments?limit=100');
    expect(Array.isArray(data)).toBe(true);
  });

  test('POST /appointments — creates appointment', async ({ apiClient }) => {
    const factory = new AppointmentFactory(apiClient);
    const apt = await factory.create({ title: 'API Create Test' });

    expect(apt.id).toBeDefined();
    expect(apt.title).toContain('API Create Test');

    await factory.cleanupAll();
  });

  test('GET /appointments/:id — returns single appointment', async ({ apiClient }) => {
    const factory = new AppointmentFactory(apiClient);
    const created = await factory.create({ title: 'API Get Single' });

    const fetched = await apiClient.get(`/appointments/${created.id}`);
    expect(fetched.id).toBe(created.id);
    expect(fetched.title).toContain('API Get Single');

    await factory.cleanupAll();
  });

  test('PUT /appointments/:id — updates appointment', async ({ apiClient }) => {
    const factory = new AppointmentFactory(apiClient);
    const created = await factory.create({ title: 'API Update Test' });

    const updated = await apiClient.put(`/appointments/${created.id}`, {
      title: 'Updated Title',
    });
    expect(updated.title).toBe('Updated Title');

    await factory.cleanupAll();
  });

  test('DELETE /appointments/:id — deletes appointment', async ({ apiClient }) => {
    const data = new AppointmentBuilder().withTitle('API Delete Test').build();
    const created = await apiClient.post('/appointments', data);

    await apiClient.delete(`/appointments/${created.id}`);

    // Verify deletion — should throw or return error
    try {
      await apiClient.get(`/appointments/${created.id}`);
      // If we get here, it wasn't deleted (fail)
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain('failed');
    }
  });

  test('POST /appointments — uses builder for data', async ({ apiClient }) => {
    const factory = new AppointmentFactory(apiClient);
    const data = new AppointmentBuilder()
      .withTitle('Builder API Test')
      .withType('physical')
      .withDuration(60)
      .withProvider('Dr. Builder')
      .build();

    const apt = await factory.create(data);
    expect(apt.title).toContain('Builder API Test');
    expect(apt.type).toBe('physical');

    await factory.cleanupAll();
  });

  test('factory createMany — bulk creation', async ({ apiClient }) => {
    const factory = new AppointmentFactory(apiClient);
    const apts = await factory.createMany(3, { title: 'Bulk API' });

    expect(apts).toHaveLength(3);
    expect(apts[0].title).toContain('Bulk API 1');

    await factory.cleanupAll();
  });
});
