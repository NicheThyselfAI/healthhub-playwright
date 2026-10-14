---
paths:
  - "tests/framework/data/**/*.js"
---

# Test Data: Builders and Factories

## The split

**Builders** (`data/builders/`) construct plain data objects. No API calls, no side effects, just a fluent interface over a set of sensible defaults.

**Factories** (`data/factories/`) call the API to create records and track the IDs for cleanup. They depend on `apiClient` and should always be used through the `testData` fixture — not instantiated directly in tests.

## Builder rules

- Constructor sets realistic defaults (not `'test'`, `'foo'`, `1` — use values a real user would enter)
- Every `withX()` method returns `this` for chaining
- `build()` returns a spread copy: `return { ...this.data }` — never the original reference
- No `async`, no imports other than what the data shape needs

```js
export class AppointmentBuilder {
  constructor() {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    this.data = {
      title: `Test Appointment ${Date.now()}`,
      appointment_date: tomorrow,
      appointment_time: '10:00',
      duration_minutes: 30,
      type: 'general',
      status: 'scheduled',
    };
  }

  withTitle(title)    { this.data.title = title; return this; }
  withType(type)      { this.data.type = type;   return this; }

  build() { return { ...this.data }; }
}
```

## Factory rules

- Constructor takes `apiClient` and initialises `this.createdIds = []`
- Every `create()` call pushes the returned ID to `this.createdIds`
- `cleanupAll()` deletes in reverse order (LIFO — respects FK constraints) and silently logs failures rather than throwing
- Use the builder internally: `new EntityBuilder().withX(x).build()`
- `createMany(count, overrides)` should generate unique titles to avoid collisions

## What to never do

- Hardcode IDs (`userId: 1`) — they change between environments
- Hardcode credentials — use `constants.js` or pass them in
- Skip cleanup registration — tests that leave data behind cause unpredictable failures in parallel runs
- Put assertions or logging concerns in builders — they're data factories, not test logic

## Adding a new entity

Create both files as a pair: `entity.builder.js` and `entity.factory.js`. Wire the factory into `data.fixture.js` via a `testData.createEntity()` shorthand so every consumer gets automatic cleanup without thinking about it.
