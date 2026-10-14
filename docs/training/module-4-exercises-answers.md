# Module 4 — Exercise Answers (Trainer's Guide)

> Reference answers for all six exercises.
> Use this to validate participant work and guide debrief discussions.

---

## Exercise 1 — Answers

**1.** Default `appointment_time` is `'10:00'`
— Line 31 of `appointment.builder.js`.

**2.** `this.createdIds.push(result.id)` stores the newly created appointment's ID in the factory's internal array.
It's important because `cleanupAll()` iterates over this array to delete each record via the API. Without tracking the ID, the factory would have no way to clean up what it created.

**3.** Reverse order handles **dependencies between records**. If Record B was created after Record A and depends on Record A (e.g., a comment on a post), deleting A first would cause B's deletion to fail with a foreign key error. Deleting in reverse (B first, then A) respects the creation order and avoids dependency conflicts.

**4.** `3` items — one per `createAppointment()` call. Each call pushes `{ type: 'appointment', id: result.id }` into `createdItems`.

**5.** The error is **caught and logged as a warning** — it does not fail the test:
```js
} catch (error) {
  logger.warn(`AppointmentFactory: cleanup failed for ${id}: ${error.message}`);
}
```
This is intentional. A 404 during cleanup means the item was already deleted (e.g., by the test itself in a delete test). Failing cleanup would mark a passing test as failed — that would be wrong.

---

## Exercise 2 — Answers

**Task A:**
```js
const data = new AppointmentBuilder()
  .withType('physical')
  .withDate('2026-04-01')
  .withTime('14:30')
  .withDuration(60)
  .build();
```

**Task B:**
```js
const data = new AppointmentBuilder()
  .withTitle('Annual Review')
  .build();
```

**Task C:**
```js
const apt1 = new AppointmentBuilder()
  .withTitle('Morning Checkup')
  .withProvider('Dr. Smith')
  .build();

const apt2 = new AppointmentBuilder()
  .withTitle('Follow-up Consultation')
  .withProvider('Dr. Smith')
  .build();
```

---

## Exercise 3 — Answer: `medication.builder.js`

**File location:** `tests/framework/data/builders/medication.builder.js`

```js
// ============================================================================
// Medication Builder — Fluent Builder Pattern
// ============================================================================
export class MedicationBuilder {
  constructor() {
    this.data = {
      name: `Test Med ${Date.now()}`,
      dosage: '10mg',
      frequency: 'Once daily',
      start_date: new Date().toISOString().split('T')[0],
      status: 'active',
    };
  }

  withName(name) {
    this.data.name = name;
    return this;
  }

  withDosage(dosage) {
    this.data.dosage = dosage;
    return this;
  }

  withFrequency(frequency) {
    this.data.frequency = frequency;
    return this;
  }

  withStatus(status) {
    this.data.status = status;
    return this;
  }

  withStartDate(date) {
    this.data.start_date = date;
    return this;
  }

  build() {
    return { ...this.data };
  }
}
```

**Common mistakes to watch for:**
- Forgetting `return this` in fluent methods — breaks the chain silently
- Returning `this.data` directly in `build()` instead of `{ ...this.data }` — mutations in the test would affect the builder's internal state

---

## Exercise 4 — Answer: `medication.factory.js`

**File location:** `tests/framework/data/factories/medication.factory.js`

```js
// ============================================================================
// Medication Factory — API-based Test Data Creation & Cleanup
// ============================================================================
import { MedicationBuilder } from '../builders/medication.builder.js';
import { logger } from '../../utils/logger.js';

export class MedicationFactory {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.createdIds = [];
  }

  async create(overrides = {}) {
    const builder = new MedicationBuilder();

    if (overrides.name)       builder.withName(overrides.name);
    if (overrides.dosage)     builder.withDosage(overrides.dosage);
    if (overrides.frequency)  builder.withFrequency(overrides.frequency);
    if (overrides.status)     builder.withStatus(overrides.status);
    if (overrides.start_date) builder.withStartDate(overrides.start_date);

    const data = builder.build();
    const result = await this.apiClient.post('/medications', data);
    this.createdIds.push(result.id);
    logger.debug('MedicationFactory: created', { id: result.id, name: data.name });
    return result;
  }

  async cleanupAll() {
    for (const id of this.createdIds.reverse()) {
      try {
        await this.apiClient.delete(`/medications/${id}`);
        logger.debug('MedicationFactory: cleaned up', { id });
      } catch (error) {
        logger.warn(`MedicationFactory: cleanup failed for ${id}: ${error.message}`);
      }
    }
    this.createdIds = [];
  }
}
```

**Common mistakes to watch for:**
- Not importing `MedicationBuilder` — constructing data inline defeats the purpose
- Forgetting `this.createdIds = []` at the end of `cleanupAll()` — the factory would try to delete the same IDs again if called twice

---

## Exercise 5 — Answer: updated `data.fixture.js`

**Add this import** at the top of `data.fixture.js` alongside existing imports:
```js
import { MedicationFactory } from '../data/factories/medication.factory.js';
```

**Replace `createMedication()`** with:
```js
async createMedication(overrides = {}) {
  const factory = new MedicationFactory(apiClient);
  const result = await factory.create(overrides);
  createdItems.push({ type: 'medication', id: result.id });
  logger.debug('Created medication', { id: result.id });
  return result;
},
```

**Common mistake to watch for:** Participants sometimes instantiate the factory outside the method at fixture setup time. Either approach works, but per-call instantiation is simpler and avoids shared state between tests.

---

## Exercise 6 — Answer: `medications/crud.spec.js`

**File location:** `tests/framework/tests/medications/crud.spec.js`

```js
import { test, expect } from '../../fixtures/index.js';

test.describe('Medications @smoke', () => {

  test('view medication in list after creation', async ({ authenticatedPage, testData }) => {
    const uniqueName = `Test Medication ${Date.now()}`;
    await testData.createMedication({ name: uniqueName });

    const page = authenticatedPage;
    await page.getByRole('link', { name: /medications/i }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(uniqueName)).toBeVisible();
  });

});
```

**Discussion point:** This test deliberately avoids a `MedicationsPage` POM because none exists yet. This is a valid temporary approach — get the test passing first, then extract the POM. The important thing is that the full data chain works end to end:
`MedicationBuilder → MedicationFactory → testData.createMedication() → test → auto-cleanup`

---

## Key things to check in participant code

| Check | What to look for |
|-------|-----------------|
| `build()` returns a copy | `{ ...this.data }` not `this.data` |
| Fluent methods return `this` | Every `withX()` ends with `return this` |
| Factory uses the builder | `new MedicationBuilder()` inside `create()` |
| Cleanup is non-fatal | `try/catch` with `logger.warn`, not `throw` |
| `createdIds` reset after cleanup | `this.createdIds = []` at end of `cleanupAll()` |
| Import is from `fixtures/index.js` | Not from `@playwright/test` |
| Test has a tag | `@smoke` on the describe or test |
