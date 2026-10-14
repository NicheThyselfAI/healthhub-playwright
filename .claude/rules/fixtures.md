---
paths:
  - "tests/framework/fixtures/**/*.js"
---

# Fixtures

## The chain

```
base → auth → data → visual → index.js
```

Each layer extends the one before it. Tests import from `index.js` only — never from individual fixture files directly.

## Layer responsibilities

| Layer | What it adds | Scope |
|-------|-------------|-------|
| `base` | Console/error capture, Allure epic/feature/story labels | test |
| `auth` | `authToken` (JWT via API), `authenticatedPage` (pre-logged-in page) | `authToken` = worker, rest = test |
| `data` | `apiClient`, `testData` (factories with auto-cleanup) | test |
| `visual` | `takeScreenshot`, `maskDynamicContent` | test |

## Extending the chain

New fixtures go into the layer that makes sense for their dependencies. If the new fixture needs `authToken`, extend `auth.fixture.js`. If it needs `apiClient`, extend `data.fixture.js`.

Always extend from the previous layer — never from `@playwright/test` directly (that breaks the chain and loses error capture and Allure labels):

```js
// ✅ Extend the layer below you
import { test as dataTest } from './data.fixture.js';
export const test = dataTest.extend({ ... });

// ❌ Never bypass the chain
import { test } from '@playwright/test';
export const test = test.extend({ ... });
```

## Scope: worker vs test

Worker-scoped fixtures run once per worker process, not per test. Use worker scope for expensive setup that's safe to share: `authToken` is worker-scoped because re-authenticating for every test is slow and unnecessary.

Test-scoped fixtures (the default) run fresh for each test and clean up after themselves — right for anything that mutates state.

## Cleanup

Test-scoped fixtures that create resources must clean them up in the `finally` block (or the `use()` pattern's post-use section). The `testData` fixture handles this automatically for anything created through it. If you add a new resource-creating fixture, register cleanup the same way: track IDs, delete in reverse order.

## Adding a new shorthand to testData

Wire new factories into `data.fixture.js` as methods on the `testData` object. Tests should call `testData.createThing()`, not `new ThingFactory(apiClient).create()` — the fixture handles the factory lifecycle.
