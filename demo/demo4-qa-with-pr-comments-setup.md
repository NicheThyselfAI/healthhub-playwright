# Demo 4 — QA Reviewer with GitHub PR Comments

Same spec as Demo 3, but the agent posts findings directly to GitHub as an inline PR review.
The audience sees Claude Code open a `REQUEST_CHANGES` review on the PR in real time.

---

## Pre-requisites

- PR #1 is open: https://github.com/ketanvj/AIInTestingTrainingMaterial/pull/1
- GitHub MCP server is connected (`/mcp` shows `github`)
- `qa-reviewer-with-comments` agent is in `.claude/agents/`

---

## Reset between rehearsals

```bash
bash demo/reset-demo4.sh
```

---

## Trigger prompt

```
Review PR #1 in ketanvj/AIInTestingTrainingMaterial and post the findings as a GitHub review
```

---

## What happens

1. Agent fetches the PR diff via GitHub MCP
2. Reviews `appointment-cancellation.spec.js` across 4 dimensions
3. Outputs the full report in the conversation
4. Posts a `REQUEST_CHANGES` review to PR #1 with:
   - Overall summary table in the review body
   - One inline comment per finding at the exact line

---

## Expected output (conversation)

```
QA Review: PR #1 — appointment-cancellation.spec.js

Verdict: 🔴 Critical issues — do not merge

---
Critical
[C1] Fixture Import (line 2) — imports from @playwright/test, bypasses the 4-layer
     fixture chain (no JWT auth, no error capture, no Allure labels, no auto-cleanup)
     Fix: import { test, expect } from '../../tests/framework/fixtures/index.js';

---
Warnings
[W1] Wait Strategy (line 14)  — waitForTimeout(2000); replace with toBeVisible()
[W2] Wait Strategy (line 19)  — waitForTimeout(1500); replace with table row assertion
[W3] Wait Strategy (line 25)  — waitForTimeout(1000); replace with modal visible assertion
[W4] Wait Strategy (line 29)  — waitForTimeout(500); remove — Playwright auto-waits
[W5] Wait Strategy (line 34)  — waitForTimeout(2000); replace with waitForResponse
[W6] Wait Strategy (line 43)  — waitForTimeout(2000) + no auth in second test
[W7] Assertion Quality (line 37) — status code only; verify response body
[W8] Assertion Quality (lines 6-38) — no UI assertions in first test

---
Suggestions
[S1] Naming — 'cancel appointment' → describe business outcome
[S2] Naming — 'check cancelled status' → describe business outcome
[S3] Tags  — missing @smoke/@e2e; tests excluded from CI filters
[S4] Data  — second test depends on first; use testData.createAppointment()
[S5] Auth  — hardcoded credentials; use constants.js or auth fixture

---
Posting findings to GitHub PR #1...

✅ Review posted to PR #1
   Event          : COMMENT
   Inline comments: 13
   View at        : https://github.com/ketanvj/AIInTestingTrainingMaterial/pull/1
```

---

## Note on review event

GitHub does not allow `REQUEST_CHANGES` when the reviewer is the PR author.
The agent uses `COMMENT` — inline comments still appear on the exact lines,
but the PR won't show a "Changes requested" badge.

In a real team setup (reviewer ≠ author), the agent would use `REQUEST_CHANGES`
and block the merge until fixes are applied. Worth mentioning to the audience.

---

## Trainer talking points

- **"The agent just opened a review on GitHub — no copy-paste, no context switching."**
- **"Every finding is pinned to the exact line the developer needs to fix."**
- **"This is the same output as Demo 3, but now it lives in the PR permanently."**
- **"The developer gets a notification. The review shows in the PR timeline. It's part of the normal code review workflow."**

---

## Trainer recovery line (if GitHub MCP fails)

> "The MCP connection dropped — let me show you the review that was posted in a previous
> rehearsal."

Open https://github.com/ketanvj/AIInTestingTrainingMaterial/pull/1 to show a pre-posted review.
