// ============================================================================
// Health Record Builder — Fluent Builder Pattern
// ============================================================================
//
// Builds health record data objects with sensible defaults.
//
// Usage:
//   const data = new HealthRecordBuilder()
//     .withType('lab_result')
//     .withCategory('Cholesterol')
//     .withValue('200')
//     .withUnit('mg/dL')
//     .build();
//
// ============================================================================

export class HealthRecordBuilder {
  constructor() {
    const today = new Date().toISOString().split('T')[0];

    this.data = {
      record_type: 'vital',
      category: 'Blood Pressure',
      title: `Test Record ${Date.now()}`,
      value: '120/80',
      unit: 'mmHg',
      recorded_date: today,
    };
  }

  withType(recordType) {
    this.data.record_type = recordType;
    return this;
  }

  withCategory(category) {
    this.data.category = category;
    return this;
  }

  withTitle(title) {
    this.data.title = title;
    return this;
  }

  withValue(value) {
    this.data.value = value;
    return this;
  }

  withUnit(unit) {
    this.data.unit = unit;
    return this;
  }

  withDate(date) {
    this.data.recorded_date = date;
    return this;
  }

  withNotes(notes) {
    this.data.notes = notes;
    return this;
  }

  /**
   * Build the health record data object.
   * @returns {object} Health record data ready for API or UI creation
   */
  build() {
    return { ...this.data };
  }
}
