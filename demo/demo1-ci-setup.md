# Demo 1 — "CI is Red. AI fixes it." Setup Guide

Run these steps **before the session day** to verify the full demo flow end-to-end.

---

## What the demo shows

A pre-staged CI failure run with 8 failures across 3 categories:

| Category | Count | What it is | Agent action |
|----------|-------|------------|--------------|
| `api-failure` (flaky) | 6 | `?_flaky=0.3` network timeouts on appointments API | Classifies as flaky — no fix applied |
| `product-defect` | 1 | Assertion mismatch after status schema change | **Applies fix** — updates assertion |
| `infrastructure` | 1 | Missing `APPOINTMENTS_FEATURE_FLAG` env var | Flags env var name — no fix applied |

The "wow moment": agent output shows all 8 failures categorised correctly, applies the fix to the one real regression, re-runs to green — without a human reading a single log line.

---

## Pre-session setup

### 1. Verify the broken assertion exists

The deliberately-broken test is at:
`tests/framework/tests/appointments/status.spec.js`

It asserts `'Confirmed'` but the app returns `'Scheduled'`. Confirm this is still the case:

```bash
cd tests
npx playwright test --config=framework/config/playwright.config.js \
  --grep "should show correct status label" --project=chromium --reporter=line
```

Expected: test fails with `Expected: "Confirmed" Received: "Scheduled"`.

### 2. Trigger the CI workflow (GitHub Actions)

In the **Actions** tab → select `playwright-local-ci` → **Run workflow**:
- Filter by tag: `@smoke`
- Browser: Chromium

Wait for the run to complete (it will fail — that is expected).

### 3. Download the junit.xml artifact

Download `test-results-local-ci` from the failed run and unzip it.
Place the junit.xml at: `tests/framework/test-results/junit.xml`

> **Alternative (faster for rehearsal):** Use the pre-staged file:
> `demo/ci-failure-results/junit.xml`
> This simulates the same mixed failure scenario without needing a live CI run.

---

## Demo flow (live)

### Step 1 — Show the red CI run
Open GitHub Actions → show the failed `playwright-local-ci` run.
Click into the summary — show the failure count (8 failures across suites).

**Trainer line**: *"This is what your Monday morning looks like. 8 failures. You don't know which ones are real."*

### Step 2 — Trigger the agent
In Claude Code:
```
why did CI fail
```
Or if using the pre-staged junit.xml:
```
diagnose the failures in demo/ci-failure-results/junit.xml
```

### Step 3 — Watch the diagnosis
Agent runs `parse-junit.js`, categorises all 8 failures, outputs the structured diagnosis.

**Trainer line** (as the output appears): *"Six failures — flaky network timeouts. No code change needed, re-running will confirm they pass. One real regression — assertion mismatch. One environment issue — missing env var. The agent just did what takes a senior engineer two hours."*

### Step 4 — Agent asks for permission
Agent presents the proposed change and waits:

```
Proposed fix — awaiting approval

File:    tests/framework/tests/appointments/status.spec.js
Line:    27
Before:  await expect(row).toContainText('Confirmed')
After:   await expect(row).toContainText('Scheduled')
Reason:  Backend schema change — default appointment status is now 'Scheduled'

Shall I apply this fix? (yes / no / skip)
```

**Trainer line** (as the proposal appears): *"It's not just applying changes blindly — it's showing you exactly what it wants to do and asking permission. You stay in control."*

Type `yes` and press Enter.

### Step 5 — Fix applied and re-run
Agent applies the fix, adds the comment, re-runs the test.

**Trainer line** (as the fix is applied): *"It didn't just tell us what was wrong. It fixed it."*

### Step 5 — Re-run shows green
```
Re-run: PASSED ✅
```

---

## Expected agent output

```
CI Diagnosis — 8 failures across 4 suites

HIGH  api-failure (6 failures)
  Root cause: appointments API returning 503 intermittently — consistent with
              ?_flaky=0.3 simulation parameter. Non-deterministic network failures.
  Tests:
    - create a new appointment
    - update appointment title
    - filter by upcoming date range
    - filter by status shows only matching rows
    - shows error when date is in the past
    - shows error when time conflicts with existing appointment
  Fix:
    No code change needed. These are flaky network timeouts.
    Re-running will confirm they pass. Consider removing ?_flaky=0.3 from
    the endpoint if it was added accidentally.

CRITICAL  product-defect (1 failure)
  Root cause: assertion mismatch — test expects 'Confirmed' but app returns
              'Scheduled'. Status schema updated in backend routes.
  Tests:
    - should show correct status label after appointment is created
  Fix:
    Updating assertion in appointments/status.spec.js — see FIX APPLIED below.

MEDIUM  infrastructure (1 failure)
  Root cause: APPOINTMENTS_FEATURE_FLAG env var is not set. Booking journey
              test requires this flag at startup.
  Tests:
    - patient completes full appointment booking journey
  Fix:
    Add to .env and CI workflow secrets:
      APPOINTMENTS_FEATURE_FLAG=enabled

---
Re-run after fixes:
  cd tests && npx playwright test --config=framework/config/playwright.config.js \
    --grep @smoke --project=chromium

---
FIX APPLIED — product-defect (should show correct status label after appointment is created)
  File: tests/framework/tests/appointments/status.spec.js
  Change: assertion updated from 'Confirmed' to 'Scheduled'
  Re-run: PASSED ✅
```

---

## Rehearsal pass criteria

- [ ] Agent categorises all 8 failures correctly on first run
- [ ] Fix applied to `status.spec.js` without trainer intervention
- [ ] Re-run of the fixed test passes
- [ ] Full demo fits within 12 minutes
- [ ] Trainer can deliver all three trainer lines naturally

---

## Recovery lines

**If agent hesitates on the fix step:**
> "Let me give it more context — this is how you guide an AI agent when it needs a nudge."
Then add: `apply the fix to the product-defect failure`

**If re-run fails after fix:**
> "The test is now fixed — CI would pick this up on the next push. Let's move on and look at the full picture."
(The classification moment has already landed — the fix re-run is a bonus.)
