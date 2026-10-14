---
description: Analyse the current test file for flakiness patterns and suggest specific fixes
allowed-tools: Read, Bash
---

Read the most recently modified spec file under tests/framework/tests/ and analyse it for flakiness.

Don't produce a generic checklist — look at the actual code and tell me what's specifically wrong with *this* file. If it's clean, say so.

---

## Flakiness audit

For each issue found, show:
- the exact lines involved
- why it causes intermittent failures (not just "this is bad practice" — explain the race condition or failure mode)
- the specific fix with actual code, using Playwright's idiomatic patterns

Write the findings conversationally, the way a lead engineer would explain it in a code review. Not bullet points for bullet points' sake.

---

**Patterns to look for:**

`waitForTimeout` — hard waits are a flakiness magnet. Every millisecond of fixed sleep is a bet that the CI server is as fast as your laptop.

Race conditions — actions fired before the UI confirms it's ready. The classic: navigate to a page then immediately interact with an element that hasn't loaded yet.

Brittle selectors — anything relying on CSS classes, XPath, DOM position, or generated class names. These survive exactly until someone touches the stylesheet.

Shared state — tests that only pass if they run in a specific order, or that leave data behind for the next test to trip over.

Async gaps — missing `await`, fire-and-forget network calls, or assertions that don't wait for the right state.

---

After the findings, give a **flakiness risk rating** (low / medium / high) with one sentence of justification, and name the single change that would have the biggest impact on stability.
