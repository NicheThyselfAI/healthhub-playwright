// ============================================================================
// Login Tests — Authentication via UI
// ============================================================================
import { test, expect } from '../../fixtures/index.js';
import { LoginPage } from '../../pages/login.page.js';
import { DashboardPage } from '../../pages/dashboard.page.js';
import { CREDENTIALS } from '../../data/constants.js';

test.describe('Login', () => {

  test('successful login redirects to dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);

    const dashboard = new DashboardPage(page);
    await dashboard.waitForPageReady();
    const welcomeText = await dashboard.getWelcomeText();
    expect(welcomeText).toContain(CREDENTIALS.patient.firstName);
  });

  test('invalid email shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginExpectingError('invalid@email.com', 'Test123!');

    const error = await loginPage.getErrorText();
    expect(error).toBeTruthy();
  });

  test('invalid password shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginExpectingError(CREDENTIALS.patient.email, 'WrongPassword!');

    const error = await loginPage.getErrorText();
    expect(error).toBeTruthy();
  });

  test('empty form shows validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.submitButton.click();

    // HTML5 form validation should prevent submission
    // Check that we're still on login page
    await expect(page).toHaveURL(/login/);
  });

  test('login page shows all expected elements', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.rememberMeCheckbox).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
  });
});
