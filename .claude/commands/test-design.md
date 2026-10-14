---
description: Apply test design techniques (EP, BVA, decision tables) to a feature's inputs
---

Apply test design techniques to: **$ARGUMENTS**

Work through this like a tester who actually knows why these techniques exist — not a textbook exercise. The goal is to end up with a small, non-redundant set of test values that would catch real bugs. Skip sections that don't apply rather than padding them out.

---

## Inputs and conditions

List every input, parameter, or condition that affects how this feature behaves. Include the ones that are invisible to the user (system state, user role, existing data).

---

## Equivalence partitioning

Group inputs into classes where the system is expected to behave the same way. Don't list every possible value — that's the whole point of EP.

| Input | Valid classes | Invalid classes | Why this split makes sense |
|-------|--------------|----------------|---------------------------|

---

## Boundary value analysis

Only apply this to inputs that have numeric, date, or length constraints. For each one, test at, just below, and just above the boundary — that's where developers make off-by-one mistakes.

| Input | Just below min | At min | Normal | At max | Just above max |
|-------|---------------|--------|--------|--------|---------------|

---

## Decision table (only if needed)

If the feature has multiple conditions that combine in different ways (e.g., role + status + feature flag), map them out. If it's a simple single-input scenario, skip this section.

| [Condition 1] | [Condition 2] | Expected outcome |
|--------------|--------------|-----------------|

---

## Derived test values

Translate the above into actual test cases — real values, not abstract class names. These should be ready to hand to an automator.

| Test | Input values | Expected result | Priority |
|------|-------------|----------------|---------|

---

**Minimum viable set:** If you could only run 3 of these before a release, which 3 and why? Write it as a sentence, not another table.
