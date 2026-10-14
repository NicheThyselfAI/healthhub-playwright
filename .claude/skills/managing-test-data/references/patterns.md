# Test Data Patterns

## Factory — full annotated example

```js
// tests/framework/data/factories/appointment.factory.js
export class AppointmentFactory {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.created = [];             // track for cleanup
  }

  async create(overrides = {}) {
    const data = new AppointmentBuilder().build();
    const merged = { ...data, ...overrides };
    const appointment = await this.apiClient.post('/appointments', merged);
    this.created.push(appointment.id);
    return appointment;
  }

  async createMany(count, overrides = {}) {
    return Promise.all(
      Array.from({ length: count }, () => this.create(overrides))
    );
  }

  async cleanup() {
    for (const id of this.created) {
      try { await this.apiClient.delete(`/appointments/${id}`); }
      catch { /* already gone */ }
    }
    this.created = [];
  }
}
```

## testData fixture — how cleanup is wired

The `data.fixture.js` creates factory instances per test and calls `cleanup()`
in the `after` phase automatically:

```js
// Usage in test (cleanup is implicit):
test('...', async ({ testData }) => {
  const appt = await testData.createAppointment({ title: 'X' });
  // DELETE /appointments/<appt.id> fires after test, pass or fail
});
```

## Adding a new entity to testData

1. Create `tests/framework/data/builders/<entity>.builder.js`
2. Create `tests/framework/data/factories/<entity>.factory.js`
3. Expose `testData.create<Entity>()` in `data.fixture.js`

## Builder defaults checklist

- Every required API field must have a default value
- Use `Date.now()` in title/name defaults to ensure uniqueness
- `build()` must return a shallow copy (`{ ...this.data }`) — never the internal ref
- Each fluent method returns `this` for chaining
