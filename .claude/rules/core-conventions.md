# Core Conventions

These two rules apply everywhere in the framework. They're non-negotiable and worth knowing even when working outside test files.

## Fixture import

Always import `test` and `expect` from `../../fixtures/index.js`, never directly from `@playwright/test`.

```js
// ✅
import { test, expect } from '../../fixtures/index.js';

// ❌ — bypasses error capturing, auth, Allure labels, the whole fixture chain
import { test, expect } from '@playwright/test';
```

The one legitimate exception: page objects import `test` from `@playwright/test` for `test.step()` only — they don't need the full fixture chain.

## Test tags

Every `test.describe` block must open with a tag. No untagged describes.

```js
test.describe('@smoke Appointment Booking', () => { ... })
test.describe('@e2e New Patient Journey', () => { ... })
test.describe('@api Appointments API', () => { ... })
```

Tags control which tests run in CI. A describe without a tag is invisible to the tag filter and may never run in the right pipeline.
