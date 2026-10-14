# Module 3 — Trace a Test End to End

> Annotated walkthrough of `crud.spec.js`.
> Follow every line from the import to the assertion and understand *why* each decision was made.

---

## The test file in full (annotated)

```js
// ─────────────────────────────────────────────────────────────────────────────
// LINE 4
import { test, expect } from '../../fixtures/index.js';
// ─────────────────────────────────────────────────────────────────────────────
// WHY NOT @playwright/test?
//   Importing from index.js activates the full fixture chain:
//     base → auth → data → visual
//   If you import from @playwright/test directly:
//     ✗  No automatic login (authenticatedPage won't exist)
//     ✗  No console/network error capture
//     ✗  No Allure epic/feature/story labels
//     ✗  No testData fixture (no auto-cleanup)
//
// RULE: Always import from fixtures/index.js. No exceptions.


// LINE 5
import { AppointmentsPage } from '../../pages/appointments.page.js';
// The Page Object for the Appointments page.
// Contains all locators and interactions — the test never touches raw selectors.


// LINE 6
import { waitForTableLoad } from '../../test-helpers/wait-helpers.js';
// A reusable wait helper extracted into test-helpers/.
// WHY here instead of inline in the test?
//   Waiting for a table to load is a pattern used across multiple spec files.
//   Centralising it means one fix if the table loading indicator changes.


// ─────────────────────────────────────────────────────────────────────────────
// TEST 1 — "create a new appointment"
// ─────────────────────────────────────────────────────────────────────────────
test('create a new appointment', async ({ authenticatedPage }) => {
//                                        ^^^^^^^^^^^^^^^^
// WHERE DOES authenticatedPage COME FROM?
//   auth.fixture.js provides it — a Playwright Page that is already logged in.
//   The auth fixture logs in ONCE per worker (worker scope) using the JWT.
//   All tests in this worker share the same logged-in browser session.
//
// WHY NOT log in inside the test?
//   Login adds 1-2 seconds per test. With 100 tests, that's 2+ minutes wasted.
//   Worker-scoped auth means login happens once per CPU core, not once per test.

  const page = authenticatedPage;
  const appointmentsPage = new AppointmentsPage(page);
  // Instantiate the POM with the already-logged-in page.
  // WHY not a fixture for the page object?
  //   POMs are lightweight. Creating them inline keeps the test readable.
  //   Only shared state (auth token, API client) benefits from fixtures.

  await appointmentsPage.navigateViaSidebar();
  // WHY navigateViaSidebar() instead of page.goto('/appointments')?
  //   The sidebar IS part of the application. Testing navigation through it:
  //     1. Validates the nav link works
  //     2. Matches real user behaviour
  //     3. Ensures the sidebar component renders correctly
  //   Direct goto() bypasses this and can hide real bugs.

  const uniqueTitle = `CRUD Test ${Date.now()}`;
  // WHY Date.now()?
  //   Tests can run in parallel across multiple workers.
  //   A unique title ensures this test's data doesn't collide with another
  //   test's data in the same run.
  //   Pattern: always make test data unique to the test run.

  await appointmentsPage.createAppointment({
    title: uniqueTitle,
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '10:00',
    type: 'general',
    duration: '30',
  });
  // appointmentsPage.createAppointment() lives in the Page Object.
  // The test doesn't know HOW the appointment is created (which buttons to click,
  // which fields to fill) — it only says WHAT to create.
  // This is the core POM benefit: if the UI changes, fix it in ONE place.
  //864000000 milliseconds creates the appointment in future by one day(i.e. tomorrow). 

  await expect(page.getByRole('dialog')).toBeHidden();
  // WHY is the assertion in the test and not in createAppointment()?
  //   RULE: No assertions in Page Objects.
  //   The POM's job is to provide interactions. The test's job is to verify
  //   outcomes. This separation makes POMs reusable across different test
  //   scenarios (e.g., a test that expects the modal to stay open would break
  //   if the POM asserted it always closes).
});


// ─────────────────────────────────────────────────────────────────────────────
// TEST 2 — "view appointment in list after creation"
// ─────────────────────────────────────────────────────────────────────────────
test('view appointment in list after creation', async ({ authenticatedPage, testData }) => {
//                                                                             ^^^^^^^^
// NOTICE: This test uses testData in addition to authenticatedPage.
//   testData comes from data.fixture.js — Layer 3 of the fixture chain.
//   It provides API-based test data creation with automatic cleanup.

  const uniqueTitle = `View Test ${Date.now()}`;
  await testData.createAppointment({ title: uniqueTitle });
  // WHY create via API instead of via the UI (like Test 1)?
  //   Test 1 is testing the CREATE flow — it must go through the UI.
  //   Test 2 is testing the LIST/VIEW — it only needs the data to exist.
  //   Creating via API is:
  //     ✓  Faster (no UI interaction)
  //     ✓  More reliable (no UI flakiness risk)
  //     ✓  Focused — only tests what it claims to test
  //
  // ALSO: testData.createAppointment() registers the ID for auto-cleanup.
  // After this test finishes (pass or fail), the fixture deletes this appointment.
  // You don't write any cleanup code. It just happens.

  const page = authenticatedPage;
  const appointmentsPage = new AppointmentsPage(page);
  await appointmentsPage.navigateViaSidebar();
  await waitForTableLoad(page);

  await appointmentsPage.table.sortBy('created_at:desc');
  //                     ^^^^^
  // appointmentsPage.table is a TableComponent — a COMPOSED UI fragment.
  // WHY composition instead of methods directly on AppointmentsPage?
  //   TableComponent is reused across AppointmentsPage, MedicationsPage,
  //   HealthRecordsPage, etc. Writing table logic once and composing it
  //   means a fix to sortBy() fixes it everywhere.
  //
  // This is the COMPOSITION OVER INHERITANCE pattern:
  //   ✓  this.table = new TableComponent(page)
  //   ✗  class AppointmentsPage extends TablePage extends BasePage (fragile)

  await waitForTableLoad(page);

  const row = appointmentsPage.table.getRowByText(uniqueTitle);
  await expect(row).toBeVisible();
  // Again: assertion in the test. The POM returns the row locator,
  // the test decides what to assert about it.
});


// ─────────────────────────────────────────────────────────────────────────────
// TEST 3 — "delete appointment from list"
// ─────────────────────────────────────────────────────────────────────────────
test('delete appointment from list', async ({ authenticatedPage, testData }) => {
  const uniqueTitle = `Delete Test ${Date.now()}`;
  await testData.createAppointment({ title: uniqueTitle });
  // Create via API — we're testing DELETE, not CREATE.
  // testData still registers it for cleanup, but if the test succeeds,
  // the appointment will already be deleted by the test itself.
  // The cleanup in the fixture will try to delete it again and gracefully
  // handle the 404 (already gone) — see data.fixture.js cleanup block.

  const page = authenticatedPage;
  const appointmentsPage = new AppointmentsPage(page);
  await appointmentsPage.navigateViaSidebar();
  await waitForTableLoad(page);
  await appointmentsPage.table.sortBy('created_at:desc');
  await waitForTableLoad(page);

  await appointmentsPage.deleteAppointment(uniqueTitle);
  // The POM handles finding the row by title, clicking the delete button,
  // and confirming the deletion. The test doesn't know those steps.

  const row = appointmentsPage.table.getRowByText(uniqueTitle);
  await expect(row).toBeHidden();
  // Verify it's gone. The POM returned the locator, the test owns the assertion.
});
```

---

## The fixture chain — visualised for this test

```
fixtures/index.js
    │
    ├── imports from visual.fixture.js
    │       │
    │       └── imports from data.fixture.js
    │               │   provides: apiClient, testData
    │               │
    │               └── imports from auth.fixture.js
    │                       │   provides: authToken, authenticatedPage
    │                       │
    │                       └── imports from base.fixture.js
    │                               provides: page (with error capture + Allure labels)
    │
    └── re-exports test + expect
```

When your test requests `{ authenticatedPage, testData }`, Playwright:
1. Runs `base.fixture.js` → creates a page, sets up console/error listeners
2. Runs `auth.fixture.js` → gets/creates the JWT, returns a logged-in page
3. Runs `data.fixture.js` → creates the API client and `testData` helper
4. Runs your test
5. After the test: `data.fixture.js` cleanup (deletes created items)
6. After the test: `base.fixture.js` teardown (captures any errors)

---

## Discussion questions for participants

1. Why does Test 1 create via UI but Tests 2, 3, 4 create via API?
2. What would happen if you imported from `@playwright/test` instead of `fixtures/index.js`?
3. If the "Delete" button moved to a dropdown menu, which file would you change?
4. What happens to the test data if the test FAILS halfway through?
5. Why is `Date.now()` used in the title instead of a fixed string like `"My Test Apt"`?
