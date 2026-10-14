// ============================================================================
// Dashboard Page — Page Object
// ============================================================================
//
// LOCATOR STRATEGY — getByRole for headings, buttons, links:
//   - getByRole('heading', { name: /Good (morning|afternoon|evening)/ })
//   - getByRole('heading', { name: 'Upcoming Appointments' })
//   - getByRole('link',    { name: 'Book Appointment' })
//   - getByRole('button',  { name: 'User menu' })
//   - getByRole('button',  { name: 'Logout' })
//
// ============================================================================

import { test } from '@playwright/test';
import { BasePage } from './base.page.js';
import { SidebarComponent } from '../components/sidebar.component.js';

export class DashboardPage extends BasePage {
  constructor(page) {
    super(page);

    // Composed components
    this.sidebar = new SidebarComponent(page);

    // Dashboard headings — use regex for time-of-day greeting
    this.welcomeHeading = page.getByRole('heading', { name: /Good (morning|afternoon|evening)/ });

    // Section headings
    this.upcomingAppointmentsHeading = page.getByRole('heading', { name: 'Upcoming Appointments' });
    this.recentNotificationsHeading  = page.getByRole('heading', { name: 'Recent Notifications' });
    this.quickActionsHeading         = page.getByRole('heading', { name: 'Quick Actions' });

    // Welcome section action buttons (have testids to distinguish from quick-action cards)
    this.newAppointmentBtn = page.getByTestId('dashboard-log-activity-btn');
    this.viewRecordsBtn    = page.getByTestId('dashboard-view-records-btn');

    // Quick action card links (use .first() since duplicates exist in welcome section)
    this.checkSymptomsLink     = page.getByRole('link', { name: 'Check Symptoms' });
    this.bookAppointmentLink   = page.getByRole('link', { name: 'Book Appointment' }).first();
    this.manageMedicationsLink = page.getByRole('link', { name: 'Manage Medications' });
    this.viewRecordsLink       = page.getByRole('link', { name: 'View Records' }).first();

    // Header actions
    this.userMenuButton      = page.getByRole('button', { name: 'User menu' });
    this.notificationsButton = page.getByRole('button', { name: 'Notifications' });
    this.logoutButton        = page.getByRole('button', { name: 'Logout' });
  }

  async waitForPageReady() {
    await this.welcomeHeading.waitFor({ state: 'visible', timeout: 10000 });
  }

  async goto() {
    await test.step('Navigate to dashboard', async () => {
      await this.page.goto('/dashboard');
      await this.waitForPageReady();
    });
  }

  /**
   * Get the welcome greeting text (e.g., "Good morning, John!")
   * @returns {Promise<string>}
   */
  async getWelcomeText() {
    return await this.welcomeHeading.textContent();
  }

  /**
   * Open user menu dropdown.
   */
  async openUserMenu() {
    await test.step('Open user menu', async () => {
      await this.userMenuButton.click();
    });
  }

  /**
   * Logout via user menu.
   */
  async logout() {
    await test.step('Logout', async () => {
      await this.openUserMenu();
      await this.logoutButton.click();
    });
  }
}
