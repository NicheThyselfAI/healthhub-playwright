// ============================================================================
// Login Page — Page Object
// ============================================================================
//
// LOCATOR STRATEGY — getByRole exclusively:
//   - getByRole('textbox', { name: 'Email address' })
//   - getByRole('textbox', { name: 'Password' })     — Note: password field
//   - getByRole('button',  { name: 'Sign in' })
//   - getByRole('checkbox',{ name: 'Remember me' })
//   - getByRole('link',    { name: 'Forgot password?' })
//   - getByRole('heading', { name: 'Welcome back' })
//   - getByRole('alert')                              — error messages
//
// ============================================================================

import { test } from '@playwright/test';
import { BasePage } from './base.page.js';

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    // All locators use getByRole — matches how users interact with the form
    this.heading           = page.getByRole('heading', { name: 'Welcome back' });
    this.emailInput        = page.getByRole('textbox', { name: 'Email address' });
    this.passwordInput     = page.getByPlaceholder('Enter your password');
    this.submitButton      = page.getByRole('button', { name: 'Sign in' });
    this.rememberMeCheckbox = page.getByRole('checkbox', { name: 'Remember me' });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });
    this.errorAlert        = page.getByRole('alert');
  }

  async waitForPageReady() {
    await this.heading.waitFor({ state: 'visible' });
  }

  async goto() {
    await test.step('Navigate to login page', async () => {
      await this.page.goto('/login');
      await this.waitForPageReady();
    });
  }

  /**
   * Login with email and password. Waits for dashboard redirect.
   */
  async login(email, password) {
    await test.step(`Login as ${email}`, async () => {
      await this.emailInput.fill(email);
      await this.passwordInput.fill(password);
      await this.submitButton.click();
      await this.page.waitForURL(/dashboard/, { timeout: 10000 });
    });
  }

  /**
   * Attempt login expecting an error (does not wait for redirect).
   */
  async loginExpectingError(email, password) {
    await test.step(`Login expecting error for ${email}`, async () => {
      await this.emailInput.fill(email);
      await this.passwordInput.fill(password);
      await this.submitButton.click();
      await this.errorAlert.waitFor({ state: 'visible', timeout: 5000 });
    });
  }

  /**
   * Get the error message text.
   * @returns {Promise<string>}
   */
  async getErrorText() {
    return await this.errorAlert.textContent();
  }

  async toggleRememberMe() {
    await this.rememberMeCheckbox.click();
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }
}
