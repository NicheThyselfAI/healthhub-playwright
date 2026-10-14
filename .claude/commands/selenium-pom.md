---
description: Generate a Java Selenium Page Object (POM) for a page or component
---

Generate a Java Selenium Page Object for: **$ARGUMENTS**

Write it the way a senior automation engineer would — not a tutorial example, but production-ready code that a team would actually commit. No Thread.sleep(), no raw driver.findElement() scattered through action methods, no assertions hiding inside the page object.

---

**Rules to follow:**
- `@FindBy` annotations with `id` or `name` first, CSS selector if needed, XPath only as a last resort
- Constructor takes `WebDriver driver`, calls `PageFactory.initElements(driver, this)`, initialises a `WebDriverWait`
- Every action that touches the DOM waits explicitly with `ExpectedConditions` before interacting
- Action methods return `this` for chaining, or the next Page Object if the action causes navigation
- No assertions in the page object — that's the test's job, not the POM's

---

Generate the full class, then list any elements or interactions you had to assume (since you can't see the actual HTML). Flag them clearly so a developer knows what to verify against the real DOM.

If there are sub-components on this page that should be their own class (e.g., a modal, a table, a reusable form), note that at the end rather than cramming everything into one file.
