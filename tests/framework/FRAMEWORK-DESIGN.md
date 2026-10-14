# Playwright Test Automation Framework — Design Document

## 1. Overview

### 1.1 Purpose

A production-grade Playwright/JavaScript test automation framework built on the HealthHub healthcare application. Designed as both a **teaching framework** for participants and a **reference implementation** of industry best practices.

### 1.2 Target Audience

- Mixed QA engineers and developers with some automation experience
- Participants learning to build scalable, maintainable test frameworks

### 1.3 Application Under Test

| Property | Value |
|----------|-------|
| App | HealthHub — healthcare appointment management |
| Frontend | React (Vite) at `localhost:5173` |
| Backend | Express + SQLite at `localhost:3001` |
| Auth | JWT tokens (`healthhub_token` in localStorage) |
| API | REST — `/api/v1/auth`, `/api/v1/appointments`, `/api/v1/patients` |

### 1.4 Testing Scope

| Type | Included |
|------|----------|
| UI (E2E) Testing | Yes |
| API Testing | Yes |
| Visual Regression | Yes |
| Performance Testing | Yes |
| Accessibility Testing | Yes |

---

## 2. Architecture

### 2.1 Pattern: Hybrid (Domain + Shared Layers)

The framework follows a **hybrid architecture** — test specs are organized by domain (feature area), while shared infrastructure (pages, components, fixtures, utilities) lives in dedicated layers.

**Why Hybrid:**
- Mirrors real-world enterprise frameworks
- Teaches both domain thinking and code reuse
- Scales naturally as tests grow

### 2.2 Dependency Graph

```
Tests (specs)
  │
  ▼
Fixtures (index.js — single import point)
  │
  ├──────────────────┬────────────────────┐
  ▼                  ▼                    ▼
Pages/            Components/          Data/
  │              (standalone)            │
  ▼                                     ▼
BasePage                           Factories / Builders
                                        │
                                        ▼
                                     Utils/
                                     ├── api-client.js
                                     ├── db-helper.js
                                     ├── errors.js
                                     └── logger.js
```

**Dependency Rules (strictly enforced):**
- Tests import ONLY from `fixtures/index.js` — never from `@playwright/test` directly
- Pages can use Components (composition)
- Pages and Components NEVER import from Fixtures
- Factories use API Client, never Pages
- Utils have ZERO dependencies on anything above them

### 2.3 Teaching Approach

Two parallel tracks that converge:

| Track | Location | Purpose |
|-------|----------|---------|
| **Progressive Specs** | `specs/01-*.spec.js` through `specs/30-*.spec.js` | Learn concepts incrementally |
| **Complete Framework** | `framework/` | Production-ready reference implementation |

---

## 3. Folder Structure

```
healthhub-app/tests/
├── framework/
│   ├── config/
│   │   ├── playwright.config.js          # Single config — env-driven
│   │   └── environments.js               # Environment registry
│   │
│   ├── env/
│   │   ├── .env.local                    # Local dev (gitignored)
│   │   ├── .env.staging                  # Staging credentials
│   │   ├── .env.uat                      # UAT credentials
│   │   ├── .env.prod                     # Prod (read-only, smoke only)
│   │   └── .env.example                  # Template (committed to git)
│   │
│   ├── pages/
│   │   ├── base.page.js                  # Thin base — max 5 shared methods
│   │   ├── login.page.js
│   │   ├── dashboard.page.js
│   │   ├── appointments.page.js
│   │   └── patients.page.js
│   │
│   ├── components/
│   │   ├── sidebar.component.js
│   │   ├── modal.component.js
│   │   ├── table.component.js
│   │   ├── form.component.js
│   │   └── toast.component.js
│   │
│   ├── fixtures/
│   │   ├── base.fixture.js               # Logging, error capture
│   │   ├── auth.fixture.js               # authenticatedPage, storageState
│   │   ├── data.fixture.js               # testDataFactory, apiClient
│   │   ├── visual.fixture.js             # Visual comparison helpers
│   │   └── index.js                      # Composed single export
│   │
│   ├── data/
│   │   ├── factories/
│   │   │   ├── user.factory.js
│   │   │   ├── appointment.factory.js
│   │   │   └── patient.factory.js
│   │   ├── builders/
│   │   │   ├── appointment.builder.js
│   │   │   └── patient.builder.js
│   │   ├── seeds/
│   │   │   └── test-db-seed.js           # DB reset to known state
│   │   └── constants.js                  # Shared test constants
│   │
│   ├── utils/
│   │   ├── api-client.js                 # REST API wrapper
│   │   ├── db-helper.js                  # Direct SQLite access
│   │   ├── custom-assertions.js          # Custom expect matchers
│   │   ├── errors.js                     # Custom error classes
│   │   ├── error-handler.js              # Global error handling
│   │   ├── logger.js                     # Structured logging
│   │   ├── retry.js                      # Retry utilities
│   │   ├── performance.js                # Lighthouse / Web Vitals
│   │   └── accessibility.js              # axe-core helpers
│   │
│   ├── mocks/
│   │   ├── handlers.js                   # Route handler mocks
│   │   └── responses/
│   │       ├── appointments.json
│   │       └── auth.json
│   │
│   ├── test-helpers/
│   │   ├── wait-helpers.js               # Common wait patterns
│   │   ├── network-helpers.js            # Request interception
│   │   └── assertion-helpers.js          # Custom assertion wrappers
│   │
│   ├── reporters/
│   │   └── custom-reporter.js            # Custom Playwright Reporter
│   │
│   ├── tests/
│   │   ├── auth/
│   │   │   ├── login.spec.js
│   │   │   ├── logout.spec.js
│   │   │   └── session.spec.js
│   │   ├── appointments/
│   │   │   ├── crud.spec.js
│   │   │   ├── filters.spec.js
│   │   │   └── validation.spec.js
│   │   ├── dashboard/
│   │   │   └── overview.spec.js
│   │   ├── visual/
│   │   │   └── screenshots.spec.js
│   │   ├── performance/
│   │   │   └── web-vitals.spec.js
│   │   ├── accessibility/
│   │   │   └── a11y.spec.js
│   │   └── api/
│   │       ├── auth-api.spec.js
│   │       └── appointments-api.spec.js
│   │
│   ├── ci/
│   │   ├── .github/
│   │   │   └── workflows/
│   │   │       ├── playwright.yml
│   │   │       └── playwright-staging.yml
│   │   ├── .gitlab-ci.yml
│   │   └── Jenkinsfile
│   │
│   └── lint/
│       ├── .eslintrc.js
│       └── .prettierrc
│
├── specs/                                 # Progressive learning specs
│   ├── 01-basic-navigation.spec.js
│   ├── ...existing specs...
│   └── 30-framework-capstone.spec.js
│
└── FRAMEWORK-DESIGN.md                    # This document
```

---

## 4. Component Specifications

### 4.1 Page Object Model

**Philosophy:** Pages encapsulate selectors and actions. They are the interface between tests and the UI.

#### Base Page (Thin — max 5 methods)

```js
// pages/base.page.js
export class BasePage {
  constructor(page) {
    this.page = page;
  }

  // Override per page — wait for page-specific ready state
  async waitForPageReady() {
    throw new Error('Subclass must implement waitForPageReady()');
  }

  // Shared: toast/notification messages
  async getToastMessage() {
    return this.page.getByTestId('toast-message');
  }

  // Shared: loading spinner
  async waitForLoadingComplete() {
    await this.page.getByTestId('loading-spinner')
      .waitFor({ state: 'hidden', timeout: 10000 });
  }

  // Shared: current URL check
  async getCurrentPath() {
    return new URL(this.page.url()).pathname;
  }
}
```

**Rules:**
- No business logic in base page
- No selectors that belong to specific pages
- Only truly shared behaviors (toasts, loading states, error banners)

#### Page Example

```js
// pages/login.page.js
import { BasePage } from './base.page.js';
import { test } from '@playwright/test';

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.emailInput = page.getByTestId('auth-email-input');
    this.passwordInput = page.getByTestId('auth-password-input');
    this.submitButton = page.getByTestId('auth-submit-button');
    this.loginForm = page.getByTestId('login-form');
  }

  async waitForPageReady() {
    await this.loginForm.waitFor({ state: 'visible' });
  }

  async login(email, password) {
    await test.step(`Login as ${email}`, async () => {
      await this.emailInput.fill(email);
      await this.passwordInput.fill(password);
      await this.submitButton.click();
    });
  }

  async goto() {
    await this.page.goto('/login');
    await this.waitForPageReady();
  }
}
```

**Key pattern:** `test.step()` is used INSIDE page object methods — gives structured reporting without cluttering tests.

### 4.2 Component Objects

Components represent reusable UI elements that appear across multiple pages.

```js
// components/sidebar.component.js
export class SidebarComponent {
  constructor(page) {
    this.page = page;
    this.navAppointments = page.getByTestId('nav-appointments');
    this.navDashboard = page.getByTestId('nav-dashboard');
    this.navPatients = page.getByTestId('nav-patients');
    this.logoutButton = page.getByTestId('nav-logout');
  }

  // SPA navigation — uses client-side routing (not page.goto)
  async navigateTo(section) {
    await test.step(`Navigate to ${section}`, async () => {
      await this.page.getByTestId(`nav-${section}`).click();
    });
  }
}
```

**Composition pattern:** Pages use components, not inheritance.

```js
// pages/dashboard.page.js
import { BasePage } from './base.page.js';
import { SidebarComponent } from '../components/sidebar.component.js';

export class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.sidebar = new SidebarComponent(page);
    this.welcome = page.getByTestId('dashboard-welcome');
  }
}
```

### 4.3 Fixture System (Layered Composition)

Fixtures are the backbone of the framework. Each layer extends the previous.

#### Layer 1: Base Fixture

```js
// fixtures/base.fixture.js
import { test as base } from '@playwright/test';

export const test = base.extend({
  // Capture console errors as test info
  page: async ({ page }, use) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await use(page);

    // Attach console errors to test report if any occurred
    if (errors.length > 0) {
      test.info().attach('console-errors', {
        body: errors.join('\n'),
        contentType: 'text/plain',
      });
    }
  },
});
```

#### Layer 2: Auth Fixture

```js
// fixtures/auth.fixture.js
import { test as base } from './base.fixture.js';

export const test = base.extend({
  // Worker-scoped: create auth state once per worker
  authToken: [async ({ request }, use) => {
    const response = await request.post('http://localhost:3001/api/v1/auth/login', {
      data: {
        email: process.env.TEST_EMAIL || 'patient@healthhub.test',
        password: process.env.TEST_PASSWORD || 'Test123!',
      },
    });
    const body = await response.json();
    await use(body.data.token);
  }, { scope: 'worker' }],

  // Test-scoped: authenticated page
  authenticatedPage: async ({ page, authToken }, use) => {
    await page.goto('/login');
    await page.evaluate(
      (token) => localStorage.setItem('healthhub_token', token),
      authToken,
    );
    await page.goto('/dashboard');
    await page.getByTestId('dashboard-welcome').waitFor({ state: 'visible' });
    await use(page);
  },
});
```

#### Layer 3: Data Fixture

```js
// fixtures/data.fixture.js
import { test as base } from './auth.fixture.js';
import { ApiClient } from '../utils/api-client.js';
import { AppointmentFactory } from '../data/factories/appointment.factory.js';

export const test = base.extend({
  // Worker-scoped API client — shares auth token
  apiClient: [async ({ authToken }, use) => {
    const client = new ApiClient(authToken);
    await use(client);
  }, { scope: 'worker' }],

  // Test-scoped factory with auto-cleanup
  appointmentFactory: async ({ apiClient }, use) => {
    const factory = new AppointmentFactory(apiClient);
    await use(factory);
    // Cleanup: delete all appointments created during this test
    await factory.cleanup();
  },
});
```

#### Composed Export

```js
// fixtures/index.js
// Single import point for all tests
export { test } from './data.fixture.js';
export { expect } from '@playwright/test';
```

**Usage in tests:**

```js
// tests/appointments/crud.spec.js
import { test, expect } from '../../fixtures/index.js';

test('create appointment', async ({ authenticatedPage, appointmentFactory }) => {
  // authenticatedPage is already logged in
  // appointmentFactory has auto-cleanup
});
```

### 4.4 API Client

```js
// utils/api-client.js
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001/api/v1';

export class ApiClient {
  constructor(token) {
    this.token = token;
    this.baseURL = API_BASE;
  }

  async request(method, path, data = null) {
    const url = `${this.baseURL}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
    };
    if (data) options.body = JSON.stringify(data);

    const response = await fetch(url, options);
    const body = await response.json();

    if (!body.success) {
      throw new TestDataError(`API ${method} ${path} failed: ${body.message}`);
    }
    return body.data;
  }

  async get(path) { return this.request('GET', path); }
  async post(path, data) { return this.request('POST', path, data); }
  async put(path, data) { return this.request('PUT', path, data); }
  async delete(path) { return this.request('DELETE', path); }
}
```

### 4.5 Test Data Management

#### Strategy Overview

| Scope | Strategy | When |
|-------|----------|------|
| Per-test | Factory with unique data + auto-cleanup | Default for all tests |
| Per-worker | Worker-scoped auth fixture with `storageState` | Auth state sharing |
| Per-suite | DB seed before suite | Full reset scenarios |

#### Factory Pattern

```js
// data/factories/appointment.factory.js
export class AppointmentFactory {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.created = []; // Track for cleanup
  }

  async create(overrides = {}) {
    const data = {
      title: `Test Appointment ${Date.now()}`,
      appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      description: 'Auto-generated test appointment',
      status: 'scheduled',
      ...overrides,
    };

    const result = await this.apiClient.post('/appointments', data);
    this.created.push(result.id);
    return result;
  }

  async createMany(count, overrides = {}) {
    const results = [];
    for (let i = 0; i < count; i++) {
      results.push(await this.create({
        title: `Test Appointment ${i + 1} - ${Date.now()}`,
        ...overrides,
      }));
    }
    return results;
  }

  async cleanup() {
    for (const id of this.created) {
      try {
        await this.apiClient.delete(`/appointments/${id}`);
      } catch (e) {
        // Non-fatal — log but don't fail the test
        console.warn(`Cleanup failed for appointment ${id}: ${e.message}`);
      }
    }
    this.created = [];
  }
}
```

#### Builder Pattern

```js
// data/builders/appointment.builder.js
export class AppointmentBuilder {
  constructor() {
    this.data = {
      title: `Test Appointment ${Date.now()}`,
      appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      description: '',
      status: 'scheduled',
    };
  }

  withTitle(title) { this.data.title = title; return this; }
  withDate(date) { this.data.appointment_date = date; return this; }
  withDescription(desc) { this.data.description = desc; return this; }
  withStatus(status) { this.data.status = status; return this; }
  scheduled() { this.data.status = 'scheduled'; return this; }
  completed() { this.data.status = 'completed'; return this; }

  build() { return { ...this.data }; }
}

// Usage:
// const data = new AppointmentBuilder()
//   .withTitle('Cardiology Checkup')
//   .withDate('2026-03-15')
//   .completed()
//   .build();
```

### 4.6 Error Handling

#### Custom Error Classes

```js
// utils/errors.js
export class TestFrameworkError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;
  }
}

export class PageNotLoadedError extends TestFrameworkError {
  constructor(pageName, url, cause) {
    super(`Page "${pageName}" failed to load at ${url}`, { pageName, url });
    this.cause = cause;
  }
}

export class AuthenticationError extends TestFrameworkError {
  constructor(email, reason) {
    super(`Authentication failed for ${email}: ${reason}`, { email });
  }
}

export class TestDataError extends TestFrameworkError {
  constructor(message, operation) {
    super(message, { operation });
  }
}

export class DataCreationError extends TestDataError {
  constructor(entity, data) {
    super(`Failed to create ${entity}`, 'create');
    this.data = data;
  }
}

export class DataCleanupError extends TestDataError {
  constructor(entity, id) {
    super(`Failed to cleanup ${entity} (id: ${id})`, 'cleanup');
  }
}

export class EnvironmentError extends TestFrameworkError {
  constructor(variable) {
    super(`Required environment variable "${variable}" is not set`, { variable });
  }
}
```

**Hierarchy (3 levels max):**

```
TestFrameworkError
├── PageNotLoadedError
├── AuthenticationError
├── TestDataError
│   ├── DataCreationError
│   └── DataCleanupError
└── EnvironmentError
```

#### Global Error Handler

```js
// utils/error-handler.js
export function setupGlobalErrorHandling(page, testInfo) {
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({
        text: msg.text(),
        url: msg.location()?.url,
        timestamp: new Date().toISOString(),
      });
    }
  });

  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  });

  return {
    getConsoleErrors: () => consoleErrors,
    getPageErrors: () => pageErrors,
    hasErrors: () => consoleErrors.length > 0 || pageErrors.length > 0,
    attachToReport: async () => {
      if (consoleErrors.length > 0) {
        await testInfo.attach('console-errors', {
          body: JSON.stringify(consoleErrors, null, 2),
          contentType: 'application/json',
        });
      }
      if (pageErrors.length > 0) {
        await testInfo.attach('page-errors', {
          body: JSON.stringify(pageErrors, null, 2),
          contentType: 'application/json',
        });
      }
    },
  };
}
```

#### Retry Utilities

```js
// utils/retry.js
export async function retryAction(action, options = {}) {
  const { maxRetries = 3, delay = 1000, backoff = 2, onRetry } = options;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        if (onRetry) onRetry(attempt, error);
        await new Promise(r => setTimeout(r, delay * Math.pow(backoff, attempt - 1)));
      }
    }
  }
  throw lastError;
}
```

#### Graceful Degradation

```js
// In tests — skip when services are unavailable
test('external API integration', async ({ page }) => {
  const apiAvailable = process.env.API_AVAILABLE !== 'false';
  test.skip(!apiAvailable, 'External API unavailable — set API_AVAILABLE=true in .env');
  // ...test code
});

// test.fixme() for known issues
test.fixme('broken feature — tracked in JIRA-1234', async ({ page }) => {
  // This test is known to fail — will be fixed in next sprint
});
```

---

## 5. Environment Configuration

### 5.1 Single Config File (Environment-Driven)

```js
// config/playwright.config.js
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEnvironment } from './environments.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envName = process.env.TEST_ENV || 'local';
const env = getEnvironment(envName);

// Load the correct .env file for this environment
dotenv.config({ path: path.resolve(__dirname, '..', 'env', env.envFile) });

export default defineConfig({
  testDir: '../tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: env.retries,
  workers: env.workers,
  timeout: env.timeout,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright', { resultsDir: 'allure-results', detail: true }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  // Tag filtering — e.g., prod only runs @smoke tests
  grep: env.tags ? new RegExp(env.tags) : undefined,

  use: {
    baseURL: env.baseURL,
    trace: env.trace || 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
  ],

  webServer: envName === 'local' ? [
    {
      command: 'cd ../../backend && npm run dev',
      url: 'http://localhost:3001/api/health',
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: 'cd ../../frontend && npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 30000,
    },
  ] : undefined,  // No webServer for remote environments
});
```

### 5.2 Environment Registry

```js
// config/environments.js
const environments = {
  local: {
    baseURL: 'http://localhost:5173',
    apiURL: 'http://localhost:3001/api/v1',
    envFile: '.env.local',
    timeout: 30000,
    retries: 0,
    workers: undefined,        // Use all available
    tags: null,                // Run all tests
    trace: 'on-first-retry',
  },
  staging: {
    baseURL: 'https://staging.healthhub.test',
    apiURL: 'https://staging-api.healthhub.test/api/v1',
    envFile: '.env.staging',
    timeout: 60000,            // Staging is slower
    retries: 2,
    workers: 4,
    tags: '@smoke|@regression',
    trace: 'on-first-retry',
  },
  uat: {
    baseURL: 'https://uat.healthhub.test',
    apiURL: 'https://uat-api.healthhub.test/api/v1',
    envFile: '.env.uat',
    timeout: 60000,
    retries: 2,
    workers: 2,                // Conservative on shared env
    tags: '@smoke|@regression|@visual',
    trace: 'retain-on-failure',
  },
  prod: {
    baseURL: 'https://app.healthhub.test',
    apiURL: 'https://api.healthhub.test/api/v1',
    envFile: '.env.prod',
    timeout: 45000,
    retries: 1,
    workers: 1,                // Sequential in prod
    tags: '@smoke',            // Smoke only
    trace: 'off',
    readOnly: true,            // No create/delete operations
  },
};

export function getEnvironment(name) {
  const env = environments[name];
  if (!env) {
    const valid = Object.keys(environments).join(', ');
    throw new Error(`Unknown environment "${name}". Valid: ${valid}`);
  }
  return env;
}
```

### 5.3 Running Against Different Environments

```bash
# Local (default)
npx playwright test

# Staging
TEST_ENV=staging npx playwright test

# UAT
TEST_ENV=uat npx playwright test

# Production (smoke only)
TEST_ENV=prod npx playwright test
```

---

## 6. Test Tagging & Selective Execution

### 6.1 Tag Convention

```js
// Use test.describe or test annotations for tagging
test.describe('@smoke Login', () => {
  test('successful login', async ({ page }) => { /* ... */ });
});

test.describe('@regression Appointments', () => {
  test('@critical create appointment', async ({ page }) => { /* ... */ });
  test('filter by date', async ({ page }) => { /* ... */ });
});

test.describe('@visual Dashboard', () => {
  test('dashboard screenshot', async ({ page }) => { /* ... */ });
});

test.describe('@perf Performance', () => {
  test('page load time', async ({ page }) => { /* ... */ });
});
```

### 6.2 Running by Tag

```bash
# Run only smoke tests
npx playwright test --grep "@smoke"

# Run regression but exclude visual
npx playwright test --grep "@regression" --grep-invert "@visual"

# Run critical tests only
npx playwright test --grep "@critical"
```

---

## 7. Test Isolation Strategy

### 7.1 Core Principle

Every test must be **independently runnable** — no test depends on another test's output or side effects.

### 7.2 Isolation Layers

| Layer | Mechanism | Scope |
|-------|-----------|-------|
| **Data** | Unique names via `Date.now()` / UUID | Per-test |
| **Auth** | Worker-scoped `storageState` | Per-worker |
| **State** | Factory auto-cleanup in fixture teardown | Per-test |
| **DB** | Seed script for full reset | Per-suite (optional) |

### 7.3 Parallel Execution

```js
// Default: fully parallel
test.describe.configure({ mode: 'parallel' }); // default

// Serial: when tests MUST run in order (rare)
test.describe.configure({ mode: 'serial' });

// Example: serial for a multi-step workflow
test.describe('@regression Appointment Workflow', () => {
  test.describe.configure({ mode: 'serial' });

  test('step 1: create appointment', async ({ page }) => { /* ... */ });
  test('step 2: edit appointment', async ({ page }) => { /* ... */ });
  test('step 3: cancel appointment', async ({ page }) => { /* ... */ });
});
```

### 7.4 CI Sharding

```bash
# Split across 4 CI machines
npx playwright test --shard=1/4  # Machine 1
npx playwright test --shard=2/4  # Machine 2
npx playwright test --shard=3/4  # Machine 3
npx playwright test --shard=4/4  # Machine 4
```

---

## 8. Reporting Architecture

### 8.1 Three-Tier Approach

| Tier | Tool | Purpose |
|------|------|---------|
| **Built-in** | Playwright HTML + List + JUnit | Local dev, CI artifacts, basic visibility |
| **Custom** | Custom Reporter (Reporter API) | Teach the pattern, Slack/Teams notifications |
| **Advanced** | Allure | History, trends, categories, team dashboards |

### 8.2 `test.step()` — In Page Objects, Not Tests

```js
// GOOD — step inside page object method
async createAppointment(data) {
  await test.step(`Create appointment: ${data.title}`, async () => {
    await this.titleInput.fill(data.title);
    await this.dateInput.fill(data.appointment_date);
    await this.saveButton.click();
  });
}

// BAD — step in test (clutters test file)
test('create appointment', async ({ page }) => {
  await test.step('fill title', async () => {     // Don't do this
    await page.getByTestId('title').fill('Test');
  });
});
```

### 8.3 Custom Reporter Example

```js
// reporters/custom-reporter.js
class HealthHubReporter {
  onBegin(config, suite) {
    console.log(`Running ${suite.allTests().length} tests`);
  }

  onTestEnd(test, result) {
    if (result.status === 'failed') {
      // Could send Slack/Teams notification here
      console.error(`FAILED: ${test.title} — ${result.error?.message}`);
    }
  }

  onEnd(result) {
    console.log(`Finished: ${result.status}`);
    console.log(`Duration: ${(result.duration / 1000).toFixed(1)}s`);
  }
}

export default HealthHubReporter;
```

### 8.4 Allure Integration

```js
// In tests — add metadata for Allure
import { allure } from 'allure-js-commons';

test.describe('@smoke Login', () => {
  test('successful login', async ({ page }) => {
    await allure.severity('critical');
    await allure.feature('Authentication');
    await allure.story('Login Flow');

    // ...test steps
  });
});
```

### 8.5 SaaS Platforms (Reference Only)

For enterprise teams, consider:
- **Currents** — Purpose-built for Playwright, CI orchestration, real-time dashboards
- **ReportPortal** — Open-source, AI defect classification, multi-framework
- **Testomat** — Test case management + reporting combined

These are mentioned for awareness but not implemented in the framework.

---

## 9. Flaky Test Prevention

### 9.1 Common Causes & Fixes

| Cause | Fix |
|-------|-----|
| Race conditions (React useEffect) | Wait for initial data load before acting |
| Shared test data between parallel tests | Unique data per test (`Date.now()`) |
| `page.goto()` in SPA causing session loss | Use sidebar click for client-side navigation |
| Hardcoded `waitForTimeout()` | Use `waitFor()`, `waitForURL()`, `waitForResponse()` |
| Stale closures in debounced search | Avoid `fill()` + search; use sort/filter instead |
| Network timing | Use `waitForResponse()` to sync with API calls |

### 9.2 Detection in CI

```yaml
# GitHub Actions — run with retries to identify flaky tests
- name: Run Playwright tests
  run: npx playwright test --retries=2

# Playwright's built-in flaky detection:
# Tests that fail then pass on retry are marked as "flaky" in the HTML report
```

### 9.3 Serial Mode for Order-Dependent Tests

```js
test.describe.configure({ mode: 'serial' });
```

Use sparingly — only when tests genuinely depend on shared state within a describe block.

---

## 10. Visual Regression Testing

### 10.1 Screenshot Comparison

```js
// tests/visual/screenshots.spec.js
test('dashboard matches baseline', async ({ authenticatedPage }) => {
  await expect(authenticatedPage).toHaveScreenshot('dashboard.png', {
    maxDiffPixelRatio: 0.01,  // Allow 1% difference
  });
});

test('login page matches baseline', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveScreenshot('login.png', {
    mask: [page.locator('.dynamic-timestamp')],  // Mask dynamic content
  });
});
```

### 10.2 Baseline Management

```bash
# Generate/update baselines
npx playwright test --update-snapshots

# OS-specific baselines are stored in:
# tests/visual/screenshots.spec.js-snapshots/
#   ├── dashboard-chromium-darwin.png
#   ├── dashboard-chromium-linux.png
#   └── dashboard-chromium-win32.png
```

---

## 11. Performance Testing

### 11.1 Web Vitals Capture

```js
// utils/performance.js
export async function captureWebVitals(page) {
  return page.evaluate(() => {
    return new Promise((resolve) => {
      const vitals = {};
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          vitals[entry.name] = entry.value || entry.duration;
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // Capture navigation timing
      const nav = performance.getEntriesByType('navigation')[0];
      vitals.domContentLoaded = nav.domContentLoadedEventEnd;
      vitals.loadComplete = nav.loadEventEnd;
      vitals.ttfb = nav.responseStart - nav.requestStart;

      setTimeout(() => resolve(vitals), 1000);
    });
  });
}
```

### 11.2 Performance Budget Tests

```js
test('@perf dashboard loads within budget', async ({ authenticatedPage }) => {
  const vitals = await captureWebVitals(authenticatedPage);

  // Use percentile thresholds, not absolute values
  expect(vitals.domContentLoaded).toBeLessThan(3000); // < 3s
  expect(vitals.ttfb).toBeLessThan(500);              // < 500ms
});
```

---

## 12. Accessibility Testing

### 12.1 axe-core Integration

```js
// utils/accessibility.js
import AxeBuilder from '@axe-core/playwright';

export async function checkAccessibility(page, options = {}) {
  const results = await new AxeBuilder({ page })
    .withTags(options.tags || ['wcag2a', 'wcag2aa'])
    .exclude(options.exclude || [])
    .analyze();

  return results;
}
```

### 12.2 Accessibility Tests

```js
test('@a11y login page meets WCAG 2.0 AA', async ({ page }) => {
  await page.goto('/login');
  const results = await checkAccessibility(page);

  expect(results.violations).toEqual([]);
});
```

---

## 13. API Mocking

### 13.1 Route Mocking

```js
// mocks/handlers.js
export async function mockAppointmentsList(page, appointments) {
  await page.route('**/api/v1/appointments*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { appointments, total: appointments.length },
      }),
    });
  });
}

export async function mockApiError(page, path, statusCode = 500) {
  await page.route(`**${path}`, async (route) => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, message: 'Mocked error' }),
    });
  });
}
```

---

## 14. CI/CD Pipeline Examples

### 14.1 GitHub Actions

```yaml
# ci/.github/workflows/playwright.yml
name: Playwright Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci
        working-directory: healthhub-app/tests

      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        working-directory: healthhub-app/tests

      - name: Run tests
        run: npx playwright test --shard=${{ matrix.shard }} --retries=2
        working-directory: healthhub-app/tests/framework
        env:
          TEST_ENV: local
          CI: true

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ strategy.job-index }}
          path: healthhub-app/tests/framework/playwright-report/
```

### 14.2 GitLab CI

```yaml
# ci/.gitlab-ci.yml
playwright-tests:
  image: mcr.microsoft.com/playwright:v1.50.0-jammy
  stage: test
  parallel: 4
  script:
    - cd healthhub-app/tests && npm ci
    - cd framework && npx playwright test --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL --retries=2
  artifacts:
    when: always
    paths:
      - healthhub-app/tests/framework/playwright-report/
      - healthhub-app/tests/framework/test-results/
    expire_in: 7 days
  variables:
    TEST_ENV: staging
    CI: "true"
```

### 14.3 Jenkins (Declarative Pipeline)

```groovy
// ci/Jenkinsfile
pipeline {
    agent any

    environment {
        TEST_ENV = 'staging'
        CI = 'true'
    }

    stages {
        stage('Install') {
            steps {
                dir('healthhub-app/tests') {
                    sh 'npm ci'
                    sh 'npx playwright install --with-deps'
                }
            }
        }
        stage('Test') {
            steps {
                dir('healthhub-app/tests/framework') {
                    sh 'npx playwright test --retries=2'
                }
            }
        }
    }

    post {
        always {
            publishHTML(target: [
                reportDir: 'healthhub-app/tests/framework/playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])
            archiveArtifacts artifacts: 'healthhub-app/tests/framework/test-results/**', allowEmptyArchive: true
        }
    }
}
```

---

## 15. Linting & Code Quality

### 15.1 ESLint for Tests

```js
// lint/.eslintrc.js
module.exports = {
  extends: ['eslint:recommended'],
  env: { node: true, es2022: true },
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

---

## 16. Learning Path (Module Sequence)

| # | Module | Key Topics | Spec Range |
|---|--------|------------|------------|
| 1 | Foundations | Selectors, actions, assertions, navigation | 01-05 |
| 2 | Waits & Reliability | Auto-wait, explicit waits, race condition prevention | 06-08 |
| 3 | API Testing | Request/response, API-based test setup | 09-11 |
| 4 | Authentication | Fixtures, storageState, token management | 12-13 |
| 5 | Page Object Model | POM, component objects, base page, composition | 14-16 |
| 6 | Test Data Management | Factories, builders, seeds, isolation | 17-18 |
| 7 | Error Handling | Custom errors, retries, global handlers, degradation | 19-20 |
| 8 | Reporting & Debugging | test.step(), Allure, traces, HTML report, custom reporter | 21-22 |
| 9 | Environment & Config | dotenv, multi-env, tagging, selective execution | 23-24 |
| 10 | Visual Regression | Screenshots, baselines, threshold tuning | 25 |
| 11 | Accessibility | axe-core, WCAG checks | 26 |
| 12 | Performance | Lighthouse, Web Vitals, budgets | 27 |
| 13 | CI/CD | GitHub Actions, GitLab CI, Jenkins, sharding | 28 |
| 14 | Linting & Code Quality | ESLint, Prettier, pre-commit hooks | 29 |
| 15 | Framework Capstone | Complete framework, anti-patterns review | 30 |

---

## 17. Anti-Patterns to Teach

| Anti-Pattern | Correct Pattern |
|-------------|----------------|
| `page.waitForTimeout(3000)` | `waitFor()`, `waitForURL()`, `waitForResponse()` |
| Hardcoded credentials in tests | Environment variables + fixtures |
| Shared mutable state between tests | Unique data per test (`Date.now()`) |
| `page.goto()` for SPA navigation | Sidebar click for client-side routing |
| Giant page objects with 50+ methods | Component composition |
| `force: true` everywhere | Fix the underlying actionability issue |
| No cleanup after test | `afterEach` / fixture teardown |
| Catching errors to hide failures | Let tests fail, use retries for flakiness |
| `test.setTimeout(60000)` on every test | Fix the slow test, don't mask it |
| Copy-paste test setup | Extract to fixtures and factories |

---

## 18. File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Pages | `{name}.page.js` | `login.page.js` |
| Components | `{name}.component.js` | `sidebar.component.js` |
| Fixtures | `{name}.fixture.js` | `auth.fixture.js` |
| Factories | `{name}.factory.js` | `appointment.factory.js` |
| Builders | `{name}.builder.js` | `appointment.builder.js` |
| Tests | `{name}.spec.js` | `login.spec.js` |
| Utils | `{name}.js` (no suffix) | `api-client.js` |
| CI configs | Provider-specific | `.github/workflows/playwright.yml` |
| Env files | `.env.{environment}` | `.env.staging` |

---

## 19. Review Sign-Off

| Reviewer | Role | Verdict |
|----------|------|---------|
| Mary (Analyst) | Brainstorm & Requirements | Approved — all 15 components, hybrid arch |
| Quinn (QA) | Test Coverage & Patterns | Concerns Addressed — isolation, tagging, flaky prevention added |
| Winston (Architect) | Structure & Scalability | Approved — single config, layered fixtures, dependency graph |

---

## 20. Next Steps

1. Build the framework folder structure
2. Implement core utilities (errors, api-client, logger)
3. Implement fixtures (base → auth → data)
4. Implement page objects and components
5. Implement test data factories and builders
6. Write framework tests (auth, appointments, dashboard)
7. Add reporting (custom reporter, Allure config)
8. Add visual, accessibility, performance tests
9. Add CI/CD pipeline configs
10. Add linting and code quality setup
