# Test Examples

## UI test with authenticated page

```js
import { test, expect } from '../../fixtures/index.js';
import { AppointmentsPage } from '../../pages/appointments.page.js';
import { waitForTableLoad } from '../../test-helpers/wait-helpers.js';

test.describe('@smoke Appointments', () => {

  test('newly created appointment appears in list', async ({ authenticatedPage, testData }) => {
    const uniqueTitle = `Test ${Date.now()}`;
    await testData.createAppointment({ title: uniqueTitle });

    const apptPage = new AppointmentsPage(authenticatedPage);
    await apptPage.navigateViaSidebar();
    await waitForTableLoad(authenticatedPage);

    await apptPage.table.sortBy('created_at:desc');
    await expect(apptPage.table.getRowByText(uniqueTitle)).toBeVisible();
  });

});
```

## API-only test

```js
import { test, expect } from '../../fixtures/index.js';

test.describe('@api Health Records API', () => {

  test('GET /health-records returns list', async ({ apiClient }) => {
    const records = await apiClient.get('/health-records');
    expect(records).toBeInstanceOf(Array);
    expect(records.length).toBeGreaterThan(0);
  });

});
```

## E2E journey test

```js
import { test, expect } from '../../fixtures/index.js';
import { AppointmentsPage } from '../../pages/appointments.page.js';
import { MedicationsPage } from '../../pages/medications.page.js';

test.describe('@e2e New Patient Journey', () => {

  test('book appointment then add medication', async ({ authenticatedPage }) => {
    // Step 1 — Book appointment
    const apptPage = new AppointmentsPage(authenticatedPage);
    await apptPage.navigateViaSidebar();
    await apptPage.createAppointment({ title: 'First Visit', type: 'general' });
    await expect(authenticatedPage.getByRole('dialog')).toBeHidden();

    // Step 2 — Add medication
    const medsPage = new MedicationsPage(authenticatedPage);
    await medsPage.navigateViaSidebar();
    await medsPage.addMedication({ name: 'Vitamin D', dosage: '1000 IU' });
    await expect(authenticatedPage.getByText('Vitamin D')).toBeVisible();
  });

});
```

## Unauthenticated / session test

```js
import { test, expect } from '../../fixtures/index.js';

test.describe('@smoke Session', () => {

  test('unauthenticated user redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

});
```

## Visual regression test

```js
import { test, expect } from '../../fixtures/index.js';
import { LoginPage } from '../../pages/login.page.js';

test.describe('@visual Login Page', () => {

  test('login page screenshot', async ({ page, maskDynamicContent }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(page).toHaveScreenshot('login-page.png', {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    });
  });

});
```
