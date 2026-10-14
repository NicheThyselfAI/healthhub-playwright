---
description: Create a session-based exploratory testing charter for a feature or area
---

Create an exploratory testing charter for: **$ARGUMENTS**

Write it the way an experienced tester would brief themselves before a session — not a formal document, more like smart notes. Concrete, opinionated, and focused on where things tend to go wrong rather than a checklist of obvious stuff.

---

## Charter

**Mission:** Explore [area] to find [what kinds of problems]

**Time box:** [suggest 45 or 90 minutes based on scope — explain your reasoning in one sentence]

---

**What to poke at**

Don't script this section — write it as a list of angles and instincts, not step-by-step instructions. Think: what would a tester with 5 years on this kind of feature go looking for?

- [Start with the happy path — but do it with realistic data, not just the "demo data" everyone uses]
- [Then try the things developers assume won't happen: fast clicks, back button mid-flow, leaving tabs open, etc.]
- [Role and permission boundaries — who shouldn't be able to do this?]
- [What happens when something upstream has already gone wrong?]
- [Any specific data shapes or combinations that feel risky for this feature]

**Where bugs tend to hide in features like this**
[2–3 sentences — based on the feature type, where should this tester spend the most time? Be specific, not generic.]

**Oracles to use**
[How will you know something's wrong? e.g., compare against another role's view, check the API response matches the UI, verify the database state changed]

---

**Note-taking during the session**

```
Time:
What I tried:
What I saw:
Bug / question / gut feeling:
```

---

After the charter, give 2 specific scenarios that a less experienced tester would probably skip but that feel high-risk for this feature. One sentence each — just enough to send them in the right direction.
