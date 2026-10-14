---
paths:
  - "tests/framework/tests/**/*.spec.js"
---

# Writing Spec Files

## File location

One spec per feature area, filed under the matching folder:

```
tests/framework/tests/
  auth/            appointments/      dashboard/
  api/             e2e/               visual/
  accessibility/   aria-snapshots/    performance/
```

## Structure

One `test.describe` per file. The describe name is the tag + feature name — no nesting describes unless there's a meaningful sub-grouping that earns its own block.

```js
import { test, expect } from '../../fixtures/index.js';
import { AppointmentsPage } from '../../pages/appointments.page.js';

test.describe('@smoke Appointment Booking', () => {

  test('books an appointment successfully', async ({ authenticatedPage, testData }) => {
    // Arrange — create data via API
    // Act    — interact via page object
    // Assert — assert here, never inside the page object
  });

});
```

## Fixture selection

| Situation | Use |
|-----------|-----|
| No login needed | `{ page }` |
| Logged in, no data setup | `{ authenticatedPage }` |
| Need pre-existing records | `{ authenticatedPage, testData }` |
| API calls only | `{ apiClient }` |
| Screenshot comparison | `{ authenticatedPage, takeScreenshot, maskDynamicContent }` |

## A few things that trip people up

**Don't hardcode test data.** Use `testData.createAppointment({ title: 'Something' })` — the fixture registers cleanup automatically. Raw values you hardcode won't get cleaned up and will eventually collide.

**Don't navigate with `page.goto()`** in tests. Use the page object's `navigateViaSidebar()` method — it preserves the SPA's auth state and confirms the page is ready.

**Assertions live here, not in page objects.** If you find yourself writing `expect` inside a page object method, move it back to the test.

**Wrap multi-step actions in `test.step()`** when the intent isn't obvious from the code — but don't over-wrap; page objects already do this for their own actions.
