# HealthHub Playwright

Production-grade Playwright E2E framework for the HealthHub healthcare app.
Used as a training reference demonstrating enterprise patterns.

## Quick start

The HealthHub app this framework targets runs against a deployed
environment (`TEST_ENV`, see `tests/framework/env/`) — nothing to start
locally, no backend/frontend in this repo.

```bash
cd tests && npm install

# Run tests
npx playwright test --config=framework/config/playwright.config.js
```

## Directory structure

```
└── tests/
    └── framework/
        ├── config/        Playwright config, environments, global-setup (Allure)
        ├── fixtures/      4-layer chain: base → auth → data → visual → index.js
        ├── pages/         Page Objects — all extend BasePage
        ├── components/    Reusable UI fragments (table, modal, form, toast, sidebar)
        ├── tests/         Spec files organised by feature folder
        ├── data/          constants.js, builders/ (data objects), factories/ (API)
        ├── utils/         api-client, logger, error-handler, retry
        └── test-helpers/  wait, network, assertion, aria-snapshot helpers
```

## Critical conventions

### 1. Always import from the fixture index
```js
// ✅ Correct — activates the full fixture chain
import { test, expect } from '../../fixtures/index.js';

// ❌ Wrong — bypasses error capture, auth, Allure labels
import { test, expect } from '@playwright/test';
```

### 2. Fixture chain
```
base        → page with console/error capture + Allure epic/feature/story labels
  auth      → authToken (worker-scoped JWT), authenticatedPage
    data    → apiClient, testData (creates via API + auto-cleanup)
      visual → takeScreenshot, maskDynamicContent
        index.js  ← tests import from here
```

### 3. Test tags — always tag every test or describe block
| Tag | Runs in | Purpose |
|-----|---------|---------|
| `@smoke` | Every commit | Fast critical-path sanity |
| `@e2e` | Nightly | Full user journeys |
| `@api` | Every commit | API contract tests |
| `@visual` | Nightly | Screenshot regression |
| `@aria` | Nightly | ARIA snapshot |
| `@a11y` | Nightly | axe accessibility |
| `@performance` | Nightly | Web vitals |

### 4. Page Objects
- Extend `BasePage` — every POM must implement `waitForPageReady()`
- Use **composition** for UI fragments (`this.table = new TableComponent(page)`)
- **No assertions inside page objects** — tests own assertions
- Navigate via sidebar methods, not direct `page.goto()`

### 5. Test data
- **Builder** → constructs a plain data object with fluent overrides, no side effects
- **Factory** → calls the API, registers cleanup on `testData` fixture automatically
- Prefer `testData.createAppointment()` over raw `apiClient.post()` so cleanup is guaranteed

## CI workflows

One workflow in `.github/workflows/`:

| File | Trigger | Purpose |
|------|---------|---------|
| `playwright-staging.yml` | Manual dispatch | Tests against a deployed staging URL — backend/frontend aren't checked out or started, this repo doesn't contain them |

## Reporting

One artifact per CI run: `staging-report` (Playwright HTML report,
`tests/framework/playwright-report/`), downloadable from the Actions run
summary page.

## Skills

Four Claude Code skills live in `.claude/skills/`. Invoke them by describing the task.
See `.claude/README.md` for a full explanation of how skills and agents differ.

### Individual skills
| Skill | Trigger phrases |
|-------|----------------|
| `writing-tests` | "write a test for X", "add test coverage", "create a spec" |
| `writing-page-objects` | "create a page object", "add a POM for X" |
| `managing-test-data` | "add a builder for X", "create test data" |
| `running-tests` | "run the smoke tests", "filter by tag", "run in CI" |

### Agents (isolated context — visible in `/agents`)
| Agent | Trigger phrases |
|-------|----------------|
| `generating-tests` | "generate tests for X", "scaffold test coverage for X", "build a full test suite for X" |
| `diagnosing-ci-failures` | "why did CI fail", "diagnose the failures", "what broke in CI", "fix the failing tests" |
| `diagnosing-ci-failures-live` | "fetch CI results from GitHub", "auto-download the junit from the last run" |
| `qa-reviewer` | "review this test", "QA review the PR", "check test quality", "review the diff" |

Agents live in `.claude/agents/` and run in isolated context windows.
