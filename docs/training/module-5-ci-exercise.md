# Module 5 — CI Exercise: Add Edge Browser Support

> Time: 10 minutes
> Goal: Demonstrate how the extensibility design makes adding a new browser a 2-line change.

---

## Background

The CI workflow uses a naming convention for browser inputs:

```yaml
# Each browser is a boolean checkbox input
chromium:
  type: boolean
  default: true
firefox:
  type: boolean
  default: false
webkit:
  type: boolean
  default: false
```

When a checkbox is ticked, the corresponding `BROWSER_*` env var is set to `true`:

```yaml
env:
  BROWSER_CHROMIUM: ${{ inputs.chromium }}
  BROWSER_FIREFOX:  ${{ inputs.firefox }}
  BROWSER_WEBKIT:   ${{ inputs.webkit }}
```

`global-setup.js` scans all env vars that start with `BROWSER_` and have the value `true`:

```js
// global-setup.js (simplified)
const browsers = Object.entries(process.env)
  .filter(([key, val]) => key.startsWith('BROWSER_') && val === 'true')
  .map(([key]) => key.replace('BROWSER_', '').toLowerCase());
// e.g. ['chromium', 'firefox']
```

**This means `global-setup.js` never needs to change when you add a new browser.**

---

## Your task

Add **Microsoft Edge** as a fourth browser option to the CI workflow.

Open `.github/workflows/playwright-local-ci.yml` and make exactly **3 changes**:

### Change 1 — Add the input checkbox (in the `inputs:` block)

```yaml
edge:
  description: 'Run on Edge'
  type: boolean
  default: false
```

### Change 2 — Install Edge when selected (in the "Install Playwright browsers" step)

```bash
[ "${{ inputs.edge }}" = "true" ] && BROWSERS="$BROWSERS msedge"
```

### Change 3 — Pass the env var and add the project flag (two lines in the "Run Playwright tests" step)

In the `PROJECTS` block:
```bash
[ "${{ inputs.edge }}" = "true" ] && PROJECTS="$PROJECTS --project=msedge"
```

In the `env:` block:
```yaml
BROWSER_EDGE: ${{ inputs.edge }}
```

---

## Verify your understanding

After making the changes, answer these questions:

1. How many files did you change?

2. Did you need to touch `global-setup.js`? Why not?

3. If you trigger the workflow now and tick only the Edge checkbox, what value will `BROWSER_EDGE` have in the environment?

4. What will `global-setup.js` write to `environment.properties` for the browser field?

5. What would happen if you forgot Change 3 (the env var) but kept Changes 1 and 2?

---

## Expected answers

1. **1 file** — only `playwright-local-ci.yml`

2. **No** — because `global-setup.js` scans `BROWSER_*=true` dynamically. It doesn't have a hardcoded list of browsers.

3. `"true"` (as a string — GitHub Actions boolean inputs are passed as strings)

4. `Browser=edge` (env var key `BROWSER_EDGE` → strips prefix → lowercase)

5. Edge tests would run but `global-setup.js` would not include `edge` in the Allure environment report — the Allure report's Environment tab would show the wrong browsers.

---

## Extension challenge (if time allows)

The `playwright.config.js` defines projects for `chromium`, `firefox`, and `webkit`.
Edge would need a project defined there too for `--project=msedge` to work.

Open `tests/framework/config/playwright.config.js` and find the `projects` array.
What would an Edge project entry look like?

```js
{
  name: 'msedge',
  use: { ...devices['Desktop Edge'], channel: 'msedge' },
},
```

This is the only other file you'd need to touch — and only because Playwright needs to know about the browser configuration. The CI workflow and global-setup remain unchanged regardless of how many browsers you add.
