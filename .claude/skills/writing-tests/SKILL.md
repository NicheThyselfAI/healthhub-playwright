---
name: writing-tests
description: Write Playwright spec files for the HealthHub framework following established patterns. Use when creating new test files, adding tests to an existing suite, or testing a new feature/page/user journey. TRIGGER on "write a test", "add test coverage", "create a spec file", "test the X feature".
---

# Writing Tests

## Rules (non-negotiable)

1. Import from `../../fixtures/index.js` — never from `@playwright/test`
2. One `test.describe` per file, name starts with a tag: `'@smoke Feature Name'`
3. Arrange → Act → Assert structure in every test
4. Create test data via `testData` fixture — never hardcode seed IDs
5. All assertions stay in the test, never inside page objects

## File location

```
tests/framework/tests/<feature>/<kebab-name>.spec.js
```

Existing feature folders: `auth/`, `appointments/`, `dashboard/`, `api/`,
`e2e/`, `visual/`, `performance/`, `accessibility/`, `aria-snapshots/`

## Minimal spec template

```js
import { test, expect } from '../../fixtures/index.js';
import { FeaturePage } from '../../pages/feature.page.js';

test.describe('@smoke Feature Name', () => {

  test('does the thing successfully', async ({ authenticatedPage, testData }) => {
    // Arrange — API data creation with auto-cleanup
    await testData.createAppointment({ title: 'My Test' });

    // Act — Page Object for all UI interactions
    const featurePage = new FeaturePage(authenticatedPage);
    await featurePage.navigateViaSidebar();
    await featurePage.doSomething();

    // Assert
    await expect(authenticatedPage.getByRole('heading', { name: 'Success' })).toBeVisible();
  });

});
```

## Fixture selection

| Need | Use |
|------|-----|
| Unauthenticated page | `{ page }` |
| Logged-in page | `{ authenticatedPage }` |
| Create + auto-cleanup data | `{ testData }` |
| Raw API calls | `{ apiClient }` |
| Screenshot comparison | `{ authenticatedPage, takeScreenshot, maskDynamicContent }` |

## Tag reference

`@smoke` `@e2e` `@api` `@visual` `@aria` `@a11y` `@performance`

## More examples

See [references/examples.md](references/examples.md)
