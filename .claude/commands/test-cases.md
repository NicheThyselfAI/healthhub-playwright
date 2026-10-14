---
description: Generate test cases (positive, negative, edge) from a feature or user story
---

Generate test cases for: **$ARGUMENTS**

Write them the way a senior tester would, not like a template was filled in. That means:
- Scenario names should read like real sentences, not "TC_001_ValidInput_ExpectedBehaviour"
- Steps should be concise — if it takes more than 4 steps to describe, you're over-explaining
- Expected results should describe what the *user* sees or experiences, not what the system does internally
- Don't generate padding. A tight set of 8 meaningful cases beats 20 that say the same thing differently

Apply equivalence partitioning and boundary value analysis where inputs exist, but don't announce that you're doing it — just use it to make sure the cases are complete.

---

## Test Cases — [Feature Name]

### Happy Path
The core scenarios that should always work.

| # | What you're testing | Setup needed | Steps | What should happen |
|---|--------------------|----|-------|-------------------|

### When things go wrong
Validation failures, permission blocks, server errors — the cases developers forget to handle.

| # | What you're testing | Setup needed | Steps | What should happen |
|---|--------------------|----|-------|-------------------|

### Edge cases worth checking
Not every edge case is worth automating, but a good tester spots them. List the ones that have bitten teams before or that feel risky for this feature.

| # | What you're testing | Setup needed | Steps | What should happen |
|---|--------------------|----|-------|-------------------|

---

**Quick take:** After the table, write 2–3 sentences as if you're briefing a colleague — which 3 test cases matter most, and is there anything about this feature that feels undertested or risky that isn't captured above?
