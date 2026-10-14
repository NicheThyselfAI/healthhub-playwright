---
description: Turn a user story into testable acceptance criteria with edge cases and testability flags
---

Write acceptance criteria for: **$ARGUMENTS**

Write these the way a QA engineer would after a good refinement session — clear enough that a tester can verify them without asking follow-up questions, specific enough that there's no ambiguity about pass/fail.

Use Given/When/Then for the main scenarios. Don't write Given/When/Then for things that are obviously just implementation notes.

---

## Acceptance Criteria

Cover these in roughly this order:
1. The main success case — the thing the story was written for
2. Any meaningful variations on success (different roles, optional inputs, alternate paths)
3. What happens when inputs fail validation
4. What the user sees when something goes wrong on the backend
5. Permission boundaries — who can and can't do this

---

```gherkin
Scenario: [Name it like a test case — describe the outcome, not the action]
  Given [the starting state that matters]
  When  [the specific thing the user does]
  Then  [what they should see or experience — observable, not internal]
```

---

## Testability check

After writing the criteria, go through them and flag any that have problems:

**Ambiguous** — a tester and developer could read this differently. It needs a conversation before anyone writes a test.

**Untestable as written** — no observable outcome, or it depends on internal system state that the UI doesn't expose.

**Missing** — gaps a tester would spot in 5 minutes of thinking about it. Name them specifically, not generically.

Be direct here. If something is vague, say it's vague and suggest what the clarifying question should be.
