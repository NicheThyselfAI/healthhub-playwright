// ============================================================================
// Appointment Builder — Fluent Builder Pattern
// ============================================================================
//
// Builds appointment data objects with sensible defaults. Use the fluent API
// to override specific fields while keeping defaults for the rest.
//
// Usage:
//   const data = new AppointmentBuilder()
//     .withTitle('My Checkup')
//     .withType('physical')
//     .withDate('2026-03-15')
//     .build();
//
// Why builder pattern?
//   - Readable test intent (each method describes what's special about the data)
//   - Consistent defaults (tomorrow, 10:00, 30 min, general)
//   - Easy to create variations without remembering all required fields
//
// ============================================================================

export class AppointmentBuilder {
  constructor() {
    // Tomorrow's date as default
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    this.data = {
      title: `Test Appointment ${Date.now()}`,
      appointment_date: tomorrow,
      appointment_time: '10:00',
      duration_minutes: 30,
      type: 'general',
      status: 'scheduled',
      description: 'Auto-generated test appointment',
    };
  }

  withTitle(title) {
    this.data.title = title;
    return this;
  }

  withDate(date) {
    this.data.appointment_date = date;
    return this;
  }

  withTime(time) {
    this.data.appointment_time = time;
    return this;
  }

  withDuration(minutes) {
    this.data.duration_minutes = minutes;
    return this;
  }

  withType(type) {
    this.data.type = type;
    return this;
  }

  withStatus(status) {
    this.data.status = status;
    return this;
  }

  withProvider(provider) {
    this.data.provider = provider;
    return this;
  }

  withLocation(location) {
    this.data.location = location;
    return this;
  }

  withDescription(description) {
    this.data.description = description;
    return this;
  }

  withNotes(notes) {
    this.data.notes = notes;
    return this;
  }

  /**
   * Build the appointment data object.
   * @returns {object} Appointment data ready for API or UI creation
   */
  build() {
    return { ...this.data };
  }
}
