# Module 4 — Test Data Exercises

> Hands-on tasks to cement the Builder → Factory → testData pattern.
> Complete these in order. Each builds on the previous.

---

## Concept recap before you start

```
Builder   Pure JavaScript class. No API calls. No side effects.
          Holds defaults. Fluent methods to override fields. Returns a plain object.

Factory   Uses a Builder internally. Makes the API call. Tracks created IDs.
          Cleans up via cleanupAll(). Used directly in non-fixture contexts.

testData  Fixture wrapper around factories. Auto-registers cleanup.
          Used in tests — you never call cleanupAll() manually.
```

**The golden rule:**
> If your test needs data to exist before assertions, create it via `testData`.
> If your test is testing the creation itself, create it via the UI.

---

## Exercise 1 — Read and understand the existing pattern (10 min)

Open these files side by side:
- `tests/framework/data/builders/appointment.builder.js`
- `tests/framework/data/factories/appointment.factory.js`
- `tests/framework/fixtures/data.fixture.js`

Answer these questions **without running code**:

1. In `AppointmentBuilder`, what is the default value for `appointment_time`?

2. In `AppointmentFactory.create()`, what does `this.createdIds.push(result.id)` do and why is it important?

3. In `data.fixture.js`, the cleanup runs `createdItems.reverse()` before deleting. Why reverse order?

4. If you called `testData.createAppointment()` three times in one test, how many items would be in `createdItems` when cleanup runs?

5. What happens in `AppointmentFactory.cleanupAll()` if the API returns a 404 (item already deleted)?

---

## Exercise 2 — Use the builder fluently (5 min)

In the browser console or a scratch file, write builder calls to produce these data objects:

**Task A:** An appointment for a physical exam, scheduled for `2026-04-01` at `14:30`, lasting 60 minutes.

**Task B:** An appointment with only the title overridden to `"Annual Review"`, everything else default.

**Task C:** Two different appointments for the same provider `"Dr. Smith"` but different titles.

Expected pattern:
```js
const data = new AppointmentBuilder()
  .with___(___)
  .build();
```

---

## Exercise 3 — Write a Medication builder (20 min)

The `testData` fixture already has `createMedication()` in `data.fixture.js`.
But there is no `MedicationBuilder` yet.

Look at `data.fixture.js` lines 88–102 to see what fields a medication has.

**Your task:** Create `tests/framework/data/builders/medication.builder.js`.

Requirements:
- Class name: `MedicationBuilder`
- Sensible defaults for all fields (use the same field names as `createMedication()`)
- Fluent methods: `withName()`, `withDosage()`, `withFrequency()`, `withStatus()`
- A `build()` method that returns a plain object copy

**Verify your work:**
```js
import { MedicationBuilder } from '../builders/medication.builder.js';

const med = new MedicationBuilder().withName('Aspirin').withDosage('100mg').build();
console.log(med);
// Should print an object with all fields, name='Aspirin', dosage='100mg'

const med2 = new MedicationBuilder().build();
console.log(med2.name); // Should be a default string, not undefined
```

---

## Exercise 4 — Write a Medication factory (15 min)

Now create `tests/framework/data/factories/medication.factory.js`.

**Your task:** Follow the exact same pattern as `AppointmentFactory`:
- Constructor takes `apiClient`
- `create(overrides = {})` — uses `MedicationBuilder`, calls `apiClient.post('/medications', data)`, tracks the ID
- `cleanupAll()` — deletes all tracked IDs via `apiClient.delete('/medications/{id}')`

**Do not** add `createMany()` — keep it minimal for now.

**Check:** Does your factory import and use `MedicationBuilder`? If not, revise — the factory should ALWAYS delegate data construction to the builder.

---

## Exercise 5 — Wire it into data.fixture.js (10 min)

`data.fixture.js` already has `createMedication()` but it constructs the data inline (lines 88–102). Now that you have a `MedicationBuilder`, refactor it.

**Your task:** In `data.fixture.js`, update `createMedication()` to:
1. Import `MedicationFactory` at the top of the file
2. Instantiate `new MedicationFactory(apiClient)`
3. Delegate to `factory.create(overrides)` instead of the inline construction
4. Remove the inline data object

**Before:**
```js
async createMedication(overrides = {}) {
  const data = { name: `Test Med ${Date.now()}`, ...inline fields..., ...overrides };
  const result = await apiClient.post('/medications', data);
  createdItems.push({ type: 'medication', id: result.id });
  return result;
}
```

**After:**
```js
async createMedication(overrides = {}) {
  const factory = new MedicationFactory(apiClient);
  const result = await factory.create(overrides);
  createdItems.push({ type: 'medication', id: result.id });
  return result;
}
```

---

## Exercise 6 — Use it in a test (10 min)

Write a new spec file at `tests/framework/tests/medications/crud.spec.js` with ONE test:

```
test: "view medication in list after creation @smoke"
  - Create a medication via testData with a unique name
  - Navigate to the Medications page via the sidebar
  - Assert the medication name appears in the page
```

Don't worry about the exact locator — use `page.getByText(uniqueName)` if no MedicationsPage POM exists yet.

The goal is to verify the full chain works:
`MedicationBuilder → MedicationFactory → testData.createMedication() → test → cleanup`

---

## Debrief — key takeaways

After completing the exercises, discuss:

1. **Why separate Builder from Factory?**
   — You can use a Builder in UI-based tests (filling forms) without making an API call.
   — You can unit-test the Builder independently with no network dependency.

2. **Why does testData wrap the factory instead of using it directly?**
   — `testData` is test-scoped: it cleans up automatically after each test.
   — The factory's `cleanupAll()` must be called manually — easy to forget.

3. **What's the risk if you skip the builder and hardcode data in the factory?**
   — Defaults are scattered across the codebase.
   — A field rename requires changes in multiple files.
   — Different tests might use inconsistent defaults, making failures hard to diagnose.
