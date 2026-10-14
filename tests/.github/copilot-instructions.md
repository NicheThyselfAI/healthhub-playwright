# GitHub Copilot Instructions for HealthHub Playwright Tests

## Project Overview
This is a comprehensive Playwright testing suite for the HealthHub application. The project demonstrates enterprise-grade testing patterns including authentication best practices, storageState management, and project dependencies.

## Project Structure

### Core Directories
```
tests/
├── specs/                    # Test specification files
│   ├── auth-best-practices/  # Authentication patterns & storageState demos
│   ├── 01-login.spec.js      # Basic login functionality
│   ├── 02-dashboard.spec.js  # Dashboard testing
│   └── ...                   # Other feature tests
├── framework/                # Testing framework (if present)
├── .auth/                    # Generated auth state files (gitignored)
└── playwright.config.js      # Main Playwright configuration
```

### Authentication Best Practices Module
Located in `specs/auth-best-practices/`:
- **README.js**: Comprehensive documentation of authentication patterns
- **playwright.config.auth-bp.js**: Dedicated config with project dependencies
- **setup/**: Authentication setup files that run first
- **tests/**: Test files using pre-authenticated states
- **fixtures/**: Custom authentication fixtures

## Key Concepts

### storageState Pattern
This project extensively uses Playwright's `storageState` feature for efficient authentication:

```javascript
// Setup file pattern (runs once)
await page.goto('/login');
await page.fill('#email', 'user@test.com');
await page.fill('#password', 'password');
await page.click('#submit');
await page.context().storageState({ path: '.auth/user.json' });

// Test file pattern (starts authenticated)
// Config: use: { storageState: '.auth/user.json' }
test('view dashboard', async ({ page }) => {
  await page.goto('/dashboard'); // Already logged in!
});
```

### Project Dependencies
Uses Playwright's project dependency system:
```javascript
projects: [
  { name: 'patient-setup', testMatch: /patient\.setup\.js/ },
  {
    name: 'patient-tests',
    use: { storageState: '.auth/patient.json' },
    dependencies: ['patient-setup'], // Waits for setup
  }
]
```

### HealthHub-Specific Auth Details
- **Auth Storage**: Uses `localStorage` (key: `healthhub_token`), not cookies
- **API Calls**: Requires manual Authorization headers in tests
- **Roles Available**: patient, doctor, admin
- **Test Accounts**: See README.js for credentials

## Coding Guidelines

### Authentication Patterns
When suggesting authentication code:

1. **Use storageState for most tests**:
   ```javascript
   // ✅ Good - uses storageState
   test.describe('Dashboard Tests', () => {
     test.use({ storageState: '.auth/patient.json' });
   });
   ```

2. **Use setup files for login logic**:
   ```javascript
   // ✅ Good - in setup/patient.setup.js
   test('setup patient auth', async ({ page }) => {
     await page.goto('/login');
     // Login logic here
     await page.context().storageState({ path: '.auth/patient.json' });
   });
   ```

3. **Avoid UI login in regular tests**:
   ```javascript
   // ❌ Bad - slow, repetitive
   test('view appointments', async ({ page }) => {
     await page.goto('/login');
     await page.fill('#email', 'user@test.com');
     // ... login logic in every test
   });
   ```

### localStorage Token Handling
For API calls in tests:
```javascript
// Get token from localStorage
const token = await page.evaluate(() => localStorage.getItem('healthhub_token'));

// Use in API requests
const response = await page.request.get('/api/appointments', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Test Organization Patterns

1. **Group by feature and auth state**:
   ```javascript
   test.describe('Appointments', () => {
     test.describe('Authenticated User', () => {
       test.use({ storageState: '.auth/patient.json' });
       // Tests here start logged in
     });

     test.describe('Unauthenticated', () => {
       test.use({ storageState: { cookies: [], origins: [] } });
       // Tests here start logged out
     });
   });
   ```

2. **Use descriptive test names**:
   ```javascript
   // ✅ Good
   test('should redirect unauthenticated user from appointments to login');
   
   // ❌ Bad
   test('test appointments page');
   ```

### Locator Strategies
Priority order for element selection:
1. `data-testid` attributes: `page.getByTestId('submit-button')`
2. Role-based: `page.getByRole('button', { name: 'Submit' })`
3. Label-based: `page.getByLabel('Email')`
4. Text-based: `page.getByText('Sign In')`
5. Placeholder: `page.getByPlaceholder('Enter email')`

### Configuration Patterns
When creating new configs:
```javascript
// ✅ Use project dependencies for auth
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.js/ },
    {
      name: 'authenticated-tests',
      use: { storageState: '.auth/user.json' },
      dependencies: ['setup'],
    }
  ]
});
```

## Common Patterns

### Multi-Role Testing
```javascript
test('admin and patient interaction', async ({ browser }) => {
  const adminContext = await browser.newContext({ 
    storageState: '.auth/admin.json' 
  });
  const patientContext = await browser.newContext({ 
    storageState: '.auth/patient.json' 
  });
  
  const adminPage = await adminContext.newPage();
  const patientPage = await patientContext.newPage();
  
  // Test interaction between roles
});
```

### Session Management Testing
```javascript
test('should handle expired token', async ({ page }) => {
  // Start authenticated
  await page.goto('/dashboard');
  
  // Simulate token expiration
  await page.evaluate(() => {
    localStorage.setItem('healthhub_token', 'expired-token');
  });
  
  await page.reload();
  await expect(page).toHaveURL(/login/);
});
```

### API + UI Testing
```javascript
test('create appointment via API, verify in UI', async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem('healthhub_token'));
  
  // Create via API
  await page.request.post('/api/appointments', {
    headers: { Authorization: `Bearer ${token}` },
    data: { date: '2024-01-15', time: '10:00' }
  });
  
  // Verify in UI
  await page.goto('/appointments');
  await expect(page.getByText('January 15, 2024')).toBeVisible();
});
```

## Running Tests

### Authentication Best Practices Tests
```bash
# All auth tests
npx playwright test --config=specs/auth-best-practices/playwright.config.auth-bp.js

# Specific test
npx playwright test --config=specs/auth-best-practices/playwright.config.auth-bp.js tests/authenticated.spec.js

# With UI mode
npx playwright test --config=specs/auth-best-practices/playwright.config.auth-bp.js --ui

# Specific project
npx playwright test --config=specs/auth-best-practices/playwright.config.auth-bp.js --project=patient-tests
```

### Regular Tests
```bash
# All tests
npx playwright test

# Specific test
npx playwright test specs/01-login.spec.js

# With headed mode
npx playwright test --headed
```

## Security Considerations

### .gitignore Requirements
Always exclude auth state files:
```gitignore
# Playwright auth state (contains real JWT tokens)
.auth/
test-results/
playwright-report/
```

### Test Data
- Use test-specific credentials, not production data
- Reset auth state between test runs
- Avoid hardcoding sensitive data in test files

## AI Assistant Guidelines

When suggesting code for this project:

1. **Always use existing auth patterns** from `auth-best-practices/`
2. **Reference the README.js** in auth-best-practices for comprehensive examples
3. **Use storageState** unless testing login functionality specifically
4. **Follow the project dependency pattern** for setup files
5. **Handle localStorage tokens correctly** for API calls
6. **Organize tests by feature and auth state**
7. **Use descriptive test names** that explain the scenario

### For authentication issues:
1. Check if `.auth/` files exist and are recent
2. Verify storageState configuration in playwright.config.js
3. Ensure setup files are running before test files
4. Check localStorage token handling for API calls

### For new features:
1. Follow the established patterns in `specs/auth-best-practices/`
2. Create setup files for new user roles if needed
3. Use project dependencies for proper execution order
4. Add appropriate storageState configuration

Remember: This project prioritizes realistic authentication patterns that mirror production applications. Always consider the security implications and maintainability of authentication code.
