---
description: Write a professional bug report from a brief description
---

Write a bug report for: **$ARGUMENTS**

Write it the way a good QA engineer would — clear, factual, and giving the developer everything they need without making them chase you for details. Avoid robotic language. The title should describe what broke, not what was expected. Steps should be the minimum needed to reproduce it consistently.

---

**Title:** [Keep it under 80 characters. Format: what broke, where. Not "Button doesn't work".]

**Environment**
- App: HealthHub (http://localhost:5173)
- Browser + version:
- OS:
- Build / branch:

**Severity:** Critical / High / Medium / Low
**Priority:** P1 / P2 / P3

*(Add a one-sentence justification for the severity — "critical" means the user can't complete a core task, not just that it looks bad)*

---

**Steps to reproduce**

1. [Be specific enough that anyone on the team can follow without asking you questions]
2.
3.

**Expected behaviour**
[What a reasonable user would expect to happen — reference the AC or design spec if relevant]

**Actual behaviour**
[Exactly what happens instead — be precise, no vague language like "it doesn't work"]

---

**Evidence to attach**
- [ ] Screenshot or recording of the failure
- [ ] Console errors (DevTools → Console tab)
- [ ] Failing network request (DevTools → Network tab → look for 4xx/5xx)
- [ ] Playwright test output if this was caught by automation

**Notes**
[Anything that might help narrow it down — does it happen consistently or intermittently? Specific data that triggers it? A gut feeling about where in the code it might be? Include it here.]

---

After the report, add one line: the Playwright assertion that would catch this automatically if it were added as a regression test.
