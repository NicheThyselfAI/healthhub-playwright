# HealthHub Playwright — Reference Card

> Keep this open during your own project build.

---

## Critical rules — never break these

```js
// ✅ Always import from the fixture index
import { test, expect } from '../../fixtures/index.js';

// ❌ Never import directly from Playwright
import { test, expect } from '@playwright/test';  // bypasses auth, Allure, error capture
```

```js
// ✅ Always tag every test
test('create appointment @smoke', ...)
test.describe('Appointments CRUD @e2e', ...)

// ❌ Never leave a test untagged — it won't run in CI
```

```js
// ✅ Use testData — cleanup is automatic
const apt = await testData.createAppointment({ title: 'Checkup' });

// ❌ Never use raw apiClient.post() in tests — no cleanup
await apiClient.post('/appointments', data);
```

```js
// ✅ Assertions belong in tests
await expect(page.getByRole('dialog')).toBeVisible();

// ❌ Never put assertions inside page objects
```

---

## Tag reference

| Tag | Runs in | Use for |
|-----|---------|---------|
| `@smoke` | Every commit | Fast critical-path (login, key CRUD) |
| `@e2e` | Nightly | Full user journeys |
| `@api` | Every commit | API contract tests |
| `@visual` | Nightly | Screenshot regression |
| `@aria` | Nightly | ARIA snapshot tests |
| `@a11y` | Nightly | axe accessibility |
| `@performance` | Nightly | Web vitals |

---

## Fixture chain — what each layer provides

```
base          page, console/error capture, Allure labels (epic/feature/story)
  auth        authToken (worker), authenticatedPage (logged-in browser)
    data      apiClient (worker), testData (test-scoped + auto-cleanup)
      visual  takeScreenshot, maskDynamicContent
        index.js  ← import from here
```

**Scopes:**
- `worker` — shared across tests in the same worker (faster, one login per worker)
- `test` — fresh instance per test (isolated, cleaned up after each test)

---

## Page Object rules

```js
// Every POM must:
class MyPage extends BasePage {
  async waitForPageReady() { /* required */ }
}

// Navigate via sidebar, never goto()
await myPage.navigateViaSidebar();   // ✅
await page.goto('/my-page');         // ❌

// Compose UI fragments
this.table = new TableComponent(page);
this.modal = new ModalComponent(page);
```

---

## Test data pattern

```
Builder  →  plain object, no side effects, fluent API, sensible defaults
Factory  →  calls API, tracks IDs, cleans up via cleanupAll()
testData →  fixture wrapper that registers cleanup automatically
```

```js
// Builder alone — no API call
const data = new AppointmentBuilder().withTitle('Checkup').withType('physical').build();

// Factory via testData — API call + auto-cleanup
const apt = await testData.createAppointment({ title: 'Checkup' });
```

---

## Key commands

```bash
# Install (from tests/)
npm ci

# Run all tests
npx playwright test --config=framework/config/playwright.config.js

# Run by tag
npx playwright test --grep @smoke

# Run by tag + browser
npx playwright test --grep @smoke --project=chromium

# Run headed (see browser)
npx playwright test --grep @smoke --headed

# Update visual snapshots
npx playwright test --grep @visual --update-snapshots

# Open Playwright report
npx playwright show-report framework/playwright-report

# Open Allure report (must use server, not file://)
npx allure open /path/to/allure-report
```

---

## Key file locations

| What | Path |
|------|------|
| Playwright config | `tests/framework/config/playwright.config.js` |
| Global setup (Allure env) | `tests/framework/config/global-setup.js` |
| Fixture entry point | `tests/framework/fixtures/index.js` |
| Base fixture | `tests/framework/fixtures/base.fixture.js` |
| Auth fixture | `tests/framework/fixtures/auth.fixture.js` |
| Data fixture | `tests/framework/fixtures/data.fixture.js` |
| Base page | `tests/framework/pages/base.page.js` |
| Constants | `tests/framework/data/constants.js` |
| API client | `tests/framework/utils/api-client.js` |
| CI workflow | `.github/workflows/playwright-local-ci.yml` |

---

## Adding a new feature — checklist

- [ ] `data/builders/<feature>.builder.js` — defaults + fluent overrides
- [ ] `data/factories/<feature>.factory.js` — API calls + cleanup
- [ ] `fixtures/data.fixture.js` — add `create<Feature>()` method
- [ ] `pages/<feature>.page.js` — extends BasePage, implements `waitForPageReady()`
- [ ] `tests/<category>/<feature>.spec.js` — imports from `fixtures/index.js`, tagged

---

## CI — adding a new browser

1. Add to `playwright-local-ci.yml` inputs:
   ```yaml
   edge:
     description: 'Run on Edge'
     type: boolean
     default: false
   ```
2. Add env var in the run step:
   ```yaml
   BROWSER_EDGE: ${{ inputs.edge }}
   ```
3. Nothing else — `global-setup.js` discovers `BROWSER_*=true` automatically.
