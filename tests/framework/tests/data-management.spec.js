// Phase 4 verification — Test Data Management (factories, builders, seeds)
import { test, expect } from '../fixtures/index.js';
import { AppointmentBuilder } from '../data/builders/appointment.builder.js';
import { HealthRecordBuilder } from '../data/builders/health-record.builder.js';
import { AppointmentFactory } from '../data/factories/appointment.factory.js';
import { HealthRecordFactory } from '../data/factories/health-record.factory.js';
import { UserFactory } from '../data/factories/user.factory.js';
import { ApiClient } from '../utils/api-client.js';
import { CREDENTIALS } from '../data/constants.js';

test.describe('@smoke Builder Pattern', () => {

  test('AppointmentBuilder — creates appointment with defaults', async () => {
    const data = new AppointmentBuilder().build();
    expect(data.title).toContain('Test Appointment');
    expect(data.appointment_time).toBe('10:00');
    expect(data.type).toBe('general');
    expect(data.status).toBe('scheduled');
  });

  test('AppointmentBuilder — fluent overrides', async () => {
    const data = new AppointmentBuilder()
      .withTitle('Custom Checkup')
      .withType('physical')
      .withDuration(60)
      .withProvider('Dr. Smith')
      .build();

    expect(data.title).toBe('Custom Checkup');
    expect(data.type).toBe('physical');
    expect(data.duration_minutes).toBe(60);
    expect(data.provider).toBe('Dr. Smith');
  });

  test('HealthRecordBuilder — creates record with defaults', async () => {
    const data = new HealthRecordBuilder().build();
    expect(data.record_type).toBe('vital');
    expect(data.category).toBe('Blood Pressure');
    expect(data.value).toBe('120/80');
    expect(data.unit).toBe('mmHg');
  });

  test('HealthRecordBuilder — fluent overrides', async () => {
    const data = new HealthRecordBuilder()
      .withType('lab_result')
      .withCategory('Cholesterol')
      .withValue('200')
      .withUnit('mg/dL')
      .build();

    expect(data.record_type).toBe('lab_result');
    expect(data.category).toBe('Cholesterol');
    expect(data.value).toBe('200');
  });
});

test.describe('@smoke Factory Pattern', () => {

  test('AppointmentFactory — create and cleanup', async () => {
    // Use a fresh API client to avoid session conflicts with worker-scoped tokens
    const client = await ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
    const factory = new AppointmentFactory(client);

    const apt = await factory.create({ title: 'Factory Test Apt' });
    expect(apt.id).toBeDefined();
    expect(apt.title).toContain('Factory Test Apt');

    // Verify it exists
    const fetched = await client.get(`/appointments/${apt.id}`);
    expect(fetched.title).toContain('Factory Test Apt');

    // Cleanup
    await factory.cleanupAll();
  });

  test('AppointmentFactory — createMany', async () => {
    const client = await ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
    const factory = new AppointmentFactory(client);

    const apts = await factory.createMany(3, { title: 'Batch Apt' });
    expect(apts).toHaveLength(3);
    expect(apts[0].title).toContain('Batch Apt 1');
    expect(apts[2].title).toContain('Batch Apt 3');

    await factory.cleanupAll();
  });

  test('HealthRecordFactory — create and cleanup', async () => {
    const client = await ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
    const factory = new HealthRecordFactory(client);

    const record = await factory.create({ category: 'Heart Rate', value: '72', unit: 'bpm' });
    expect(record.id).toBeDefined();

    await factory.cleanupAll();
  });

  test('UserFactory — get credentials for roles', async () => {
    const userFactory = new UserFactory();

    const patient = userFactory.getCredentials('patient');
    expect(patient.email).toContain('patient');

    const admin = userFactory.getCredentials('admin');
    expect(admin.email).toContain('admin');

    expect(() => userFactory.getCredentials('nonexistent')).toThrow('Unknown role');
  });

  test('UserFactory — get API client for different role', async () => {
    const userFactory = new UserFactory();
    const client = await userFactory.getApiClient('patient');

    const data = await client.get('/appointments?limit=1');
    expect(data).toBeDefined();

    userFactory.clearCache();
  });
});
