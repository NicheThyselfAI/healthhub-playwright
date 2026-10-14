# Known Failure Patterns & Fixes

## visual-regression

**Symptom:** `A snapshot doesn't exist at ...linux.png, writing actual`
**Cause:** No baseline screenshot exists for the linux/CI environment.
**Fix:**
```bash
cd tests
npx playwright test --config=framework/config/playwright.config.js \
  --update-snapshots --grep @visual --project=chromium
git add tests/framework/tests/visual/screenshots.spec.js-snapshots/
git commit -m "Add linux visual baselines"
```

**Symptom:** `Screenshot comparison failed — Xpx difference, ratio Y exceeds maxDiffPixelRatio`
**Cause:** UI changed intentionally (new component, style update).
**Fix:** Same as above — update snapshots after confirming change is intentional.

---

## infrastructure

**Symptom:** `no such table: users` (or any table name)
**Cause:** `db/seed.js` ran before `db/init.js` created the schema.
**Fix:** In `playwright-local-ci.yml`, ensure the seed step reads:
```yaml
run: node db/init.js && node db/seed.js
```

**Symptom:** `ECONNREFUSED 127.0.0.1:3001` or `ECONNREFUSED 127.0.0.1:5173`
**Cause:** Backend or frontend server failed to start in the `webServer` timeout.
**Fix:** Check `playwright.config.js` webServer `timeout` (default 30 000 ms). Increase
if install/build takes longer. Also check that backend `npm ci` completed before tests.

---

## api-failure

**Symptom:** `401 Unauthorized` on API calls
**Cause:** `JWT_SECRET` in the test run doesn't match the secret the backend was seeded with.
**Fix:** Ensure `JWT_SECRET` env var is identical in the seed step and the run step in the workflow.

**Symptom:** `404 Not Found` during cleanup (e.g. `DELETE /appointments/14 failed`)
**Cause:** Test data was already deleted by a previous test or the test itself cleaned up.
**Fix:** Non-fatal — the `warn` log is expected. Not a test failure unless the assertion is wrong.

---

## selector-failure

**Symptom:** `locator.click: Target closed` or `strict mode violation`
**Cause:** Selector matches more than one element, or the element was removed from DOM mid-test.
**Fix:** Make the selector more specific (add `{ name: '...' }` or a `getByTestId`).

**Symptom:** `Timeout 30000ms exceeded waiting for locator`
**Cause:** Page didn't load in time, or a `data-testid` attribute was renamed in the frontend.
**Fix:** Check if the `data-testid` attribute still exists in the frontend source. Update the
selector in the page object if it changed.

---

## product-defect

**Symptom:** `Expected: "X" — Received: "Y"`
**Cause:** Application behaviour changed — either a real bug or the test expectation is outdated.
**Fix:**
1. Reproduce locally: `npx playwright test --headed --grep "<test name>"`
2. If it's a real bug — raise it in the issue tracker, mark test as `test.fixme()`
3. If the app intentionally changed — update the assertion in the spec file

---

## Allure report not loading (file:// blank page)

**Cause:** Browser blocks `fetch()` on `file://` URLs.
**Fix:**
```bash
cd tests && npx allure open /path/to/allure-report-local-ci
```

## Trend chart empty

**Cause:** First run — no `allure-history` artifact exists yet.
**Fix:** Normal. Trend populates from run 2 onwards (history is saved after each run).
