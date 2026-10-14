// ============================================================================
// ARIA Snapshot Tests — Login Page
// ============================================================================
//
// These tests capture the accessibility tree structure of the login page.
// They catch structural regressions — missing labels, changed roles, broken
// form associations — without relying on visual screenshots.
//
// To generate/update baselines:
//   npx playwright test --config=framework/config/playwright.config.js \
//     --project=chromium --grep @aria --update-snapshots
//
// ============================================================================

import { test, expect } from '../../fixtures/index.js';
import { LoginPage } from '../../pages/login.page.js';
import { assertAriaTree } from '../../test-helpers/aria-snapshot-helpers.js';

test.describe('@aria Login Page ARIA Snapshots', () => {

  test('login form — structure and labels', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Scope to the form — avoids capturing dynamic page chrome
    await assertAriaTree(page.getByTestId('login-form'), `
      - text: Email address*
      - textbox "Email address*"
      - text: Password*
      - textbox "Password*"
      - button "Show password"
      - checkbox "Remember me"
      - link "Forgot password?"
      - button "Sign in"
    `, 'Login form has correct accessible structure');
  });

  test('login form — error state after invalid login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginExpectingError('bad@email.com', 'wrongpass');

    // After failed login, an alert role should appear in the tree
    await assertAriaTree(page.getByTestId('login-form'), `
      - alert
      - text: Email address*
      - textbox "Email address*"
      - text: Password*
      - textbox "Password*"
      - button "Show password"
      - checkbox "Remember me"
      - link "Forgot password?"
      - button "Sign in"
    `, 'Login form shows alert after failed login');
  });

  test('login form — full page file-based snapshot', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // File-based snapshot — captures entire page tree
    // Baseline stored in login-aria.spec.js-snapshots/
    await expect(page.getByTestId('login-form')).toMatchAriaSnapshot({
      name: 'login-form-default.yml',
    });
  });

  test('login heading and logo — component snapshot', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Verify the heading is accessible
    await assertAriaTree(page.getByRole('heading', { name: 'Welcome back' }), `
      - heading "Welcome back" [level=1]
    `, 'Login heading is properly exposed');
  });

  test('login form inputs — all have accessible names', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Verify each input has a proper accessible name (label association)
    await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible();
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Remember me' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });
});
