---
description: Recommend the best Playwright locator strategy for a UI element
---

Recommend the best Playwright locator for: **$ARGUMENTS**

Give a direct recommendation, not a list of options ranked by preference. Pick one and explain why it's the right choice for this element. If there's a meaningful trade-off worth mentioning, say it once — don't hedge.

---

## Recommended locator

```js
// [One sentence on why this is the right approach]
page.getByRole('...', { name: '...' })
```

**Why this one:** [Explain the reasoning — is it accessible? Stable? Does it survive a frontend framework upgrade?]

---

## If that's not available

Sometimes the markup doesn't support role-based locators. Here's the fallback order, and when each makes sense:

```js
page.getByLabel('...')          // form inputs with a <label> — this is the next best thing
page.getByPlaceholder('...')    // inputs where the label is actually the placeholder
page.getByText('...')           // for static visible text — fine for assertions, risky for actions
page.getByTestId('...')         // if the team has added data-testid — ask them to if they haven't
```

---

## What to avoid

```js
page.locator('xpath=//div[3]/button')   // breaks every time someone touches the DOM
page.locator('.btn-primary')            // CSS classes change with design system updates
```

---

## Ready-to-use snippet

Show the locator being used in a realistic context — filling a field, clicking a button, or asserting visibility — whichever matches the element type.

```js
// example usage in a test
```

---

**Accessibility note:** Does this element have the right semantic markup to support this locator? If not, flag it — a fix here improves both the test and the app.
