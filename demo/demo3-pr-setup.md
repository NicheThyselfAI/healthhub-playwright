# Demo 3 — PR Setup Guide

Run these steps **before the session day** to prepare the bad-spec PR that the `qa-reviewer` agent will review live.

---

## What gets reviewed

`demo/specs/appointment-cancellation.spec.js`

This file contains deliberately-bad patterns mapped to the 4 agent review dimensions:

| Finding | Line | Dimension | Severity |
|---------|------|-----------|----------|
| Wrong import (`@playwright/test`) | 2 | Fixture Import | 🔴 Critical |
| No `@smoke` or `@e2e` tag on either test | 4 | Naming Convention | 🔴 Critical |
| `page.waitForTimeout()` × 6 | 14,19,25,29,34,42 | Wait Strategy | 🟡 Warning |
| Assertion checks status code only, not body | 37 | Assertion Quality | 🟡 Warning |
| Vague test names ("cancel appointment", "check cancelled status") | 6, 40 | Naming Convention | 💡 Suggestion |

---

## Setup steps

```bash
# 1. Create a branch for the bad spec
cd healthhub-playwright
git checkout -b demo/bad-appointment-spec

# 2. Stage only the bad spec file
git add demo/specs/appointment-cancellation.spec.js

# 3. Commit
git commit -m "Add appointment cancellation tests"

# 4. Push
git push origin demo/bad-appointment-spec

# 5. Raise a PR on GitHub
#    Title: "Add appointment cancellation tests"
#    Base: main
#    Note the PR number — you'll need it during the demo
```

---

## Reset between rehearsals

```bash
bash demo/reset-demo3.sh
```

This removes the `qa-reviewer` agent so it can be rebuilt live, and restores `appointment-cancellation.spec.js` to its broken state.

---

## During Demo 3

When the `qa-reviewer` agent is built and ready, trigger it with:

```
Review PR #1 in ketanvj/AIInTestingTrainingMaterial
```

The agent fetches the diff via GitHub MCP and produces the Critical / Warnings / Suggestions report.

---

## Expected agent output

```
QA Review: PR #1 — appointment-cancellation.spec.js

Verdict: Critical issues — do not merge

---
Critical

[C1] Wrong fixture import (line 2)
test/expect are imported from @playwright/test instead of ../../fixtures/index.js.
This bypasses the full 4-layer fixture chain — no error capture, no JWT auth,
no Allure labels, no auto-cleanup.

// Fix:
import { test, expect } from '../../fixtures/index.js';

---
Warnings

W1 | 14  | waitForTimeout(2000) after Sign In — replace with
         | await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
W2 | 19  | waitForTimeout(1500) for appointments list — replace with assertion on first table row being visible
W3 | 25  | waitForTimeout(1000) for modal — replace with assertion on modal element being visible
W4 | 29  | waitForTimeout(500) after radio click — remove entirely; Playwright auto-waits
W5 | 34  | waitForTimeout(2000) after save — replace with waitForResponse on the API call or assert the success toast
W6 | 43  | waitForTimeout(2000) at start of second test — same issue, plus the test navigates without auth
W7 | 37  | Only asserts response.status() === 200 — doesn't verify the appointment is actually cancelled in the response body
W8 | 6-38| No UI assertions at all in the first test — a silent UI failure would go undetected

---
Suggestions

- [S1] Test name 'cancel appointment' should describe a business outcome:
  e.g. 'should mark appointment as cancelled when patient selects cancelled status and saves'
- [S2] 'check cancelled status' is vague — rename to something like
  'should display cancelled status in the appointments list after cancellation'
- [S3] No test tags (@smoke, @e2e, etc.) on either test or the describe block —
  tests will be excluded from all CI tag filters
- [S4] Second test depends on state from the first — use testData.createAppointment()
  for isolated, self-cleaning data
- [S5] Credentials hardcoded in the test body — use constants.js or the auth fixture instead

Re-run this review after fixes are applied.
```

---

## Note on S3 (missing tags)

The agent places missing tags in **Suggestions** rather than Critical. During the demo,
use this as a teaching moment:

> "In our framework, missing tags is actually Critical — the test won't run in any CI
> pipeline. This is how you tune an agent: one line change in the agent definition
> bumps it to the right severity. The prompt is the interface."

---

## Trainer recovery line (if agent output varies)

> "Let me refine that instruction — this is actually a useful moment, because it shows
> how you tune an agent's output. The prompt is the interface; changing it changes the
> behaviour."

Then paste the expected output from this guide to keep the session moving.
