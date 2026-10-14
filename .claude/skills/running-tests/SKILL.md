---
name: running-tests
description: Run, filter, and configure Playwright tests locally and in CI for the HealthHub framework. Use when asked to run specific tests, filter by tag, change browser or environment, view reports, or trigger CI workflows. TRIGGER on "run the tests", "run smoke tests", "test on firefox", "trigger CI", "show me the report".
---

# Running Tests

## Local — from the `tests/` directory

```bash
# All tests (all browsers defined in config)
npx playwright test --config=framework/config/playwright.config.js

# Single browser
npx playwright test --config=framework/config/playwright.config.js --project=chromium

# Filter by tag
npx playwright test --config=framework/config/playwright.config.js --grep @smoke
npx playwright test --config=framework/config/playwright.config.js --grep @e2e

# Single spec file
npx playwright test --config=framework/config/playwright.config.js tests/auth/login.spec.js

# Headed (watch the browser)
npx playwright test --config=framework/config/playwright.config.js --headed

# Debug mode
npx playwright test --config=framework/config/playwright.config.js --debug
```

## Environment targeting

Set `TEST_ENV` before running:

```bash
TEST_ENV=local   npx playwright test ...   # default — starts servers via webServer
TEST_ENV=staging npx playwright test ...   # points at staging URL
```

Environments are defined in `tests/framework/config/environments.js`.

## CI — GitHub Actions

**Workflow:** `playwright-local-ci.yml` (Actions tab → Run workflow)

| Input | Values | Notes |
|-------|--------|-------|
| Filter by tag | `@smoke`, `@e2e`, blank | Leave blank to run all |
| Chromium | checkbox | Ticked by default |
| Firefox | checkbox | |
| WebKit | checkbox | |

Multiple browsers can be ticked simultaneously — each adds a `--project` flag.

## Viewing reports

```bash
# Playwright HTML report (can open index.html directly)
npx playwright show-report tests/framework/playwright-report

# Allure report (MUST use a server — file:// won't work)
cd tests && npx allure open /path/to/downloaded/allure-report-local-ci
```

## Update visual baselines

When visual regression tests fail due to intentional UI changes:

```bash
npx playwright test --config=framework/config/playwright.config.js \
  --update-snapshots --grep @visual
```

Then commit the updated `*-snapshots/` files.
