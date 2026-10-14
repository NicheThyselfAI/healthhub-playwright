---
name: managing-test-data
description: Create and manage test data for the HealthHub framework using builders and factories. Use when setting up test data, adding a new builder, extending a factory, or working with the testData fixture. TRIGGER on "create test data", "add a builder for X", "make a factory", "set up data for a test".
---

# Managing Test Data

## Two patterns — choose the right one

| Pattern | What it does | Use when |
|---------|-------------|----------|
| **Builder** | Builds a plain JS object with defaults + fluent overrides | Constructing data shape for UI forms or API payloads |
| **Factory** | Calls the API to create real data; registers auto-cleanup | Tests that need data already in the DB before assertions |

## Builder pattern

```js
// Construct data — no API calls, no side effects
const data = new AppointmentBuilder()
  .withTitle('Annual Checkup')
  .withType('physical')
  .withDate('2026-06-01')
  .build();
// → plain object ready for apiClient.post() or form filling
```

**Builder file location:** `tests/framework/data/builders/<entity>.builder.js`

```js
export class ThingBuilder {
  constructor() {
    this.data = {
      title: `Test Thing ${Date.now()}`,  // unique default
      status: 'active',
      // ...all required fields with sensible defaults
    };
  }

  withTitle(title)   { this.data.title = title; return this; }
  withStatus(status) { this.data.status = status; return this; }

  build() { return { ...this.data }; }
}
```

## Factory pattern (via testData fixture)

```js
// In a test — factory creates via API and registers cleanup automatically
test('...', async ({ authenticatedPage, testData }) => {
  const appt = await testData.createAppointment({ title: 'My Appt' });
  // appt.id is available; DELETE /appointments/:id is called after the test
});
```

**Factory file location:** `tests/framework/data/factories/<entity>.factory.js`

See full patterns in [references/patterns.md](references/patterns.md)

## Constants

Shared credentials and API config live in `tests/framework/data/constants.js`:
```js
import { CREDENTIALS, API } from '../data/constants.js';
// CREDENTIALS.patient.email / .password
// CREDENTIALS.admin.email / .password
// API.BASE_URL, API.ENDPOINTS.LOGIN, etc.
```
