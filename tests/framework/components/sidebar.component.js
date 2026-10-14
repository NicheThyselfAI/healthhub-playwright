// ============================================================================
// Sidebar Component — Navigation Sidebar
// ============================================================================
//
// Reusable component representing the app's sidebar navigation.
// Used by DashboardPage, AppointmentsPage, and other authenticated pages.
//
// Uses getByRole('link') since all nav items are <NavLink> elements
// with accessible text content.
//
// ============================================================================

import { test } from '@playwright/test';

export class SidebarComponent {
  constructor(page) {
    this.page = page;

    // Container — scoped root for all sidebar locators (no accessible role, use testid)
    this.container = page.getByTestId('sidebar');

    // Main menu links — scoped to sidebar to avoid matching dashboard quick-action links
    this.dashboardLink     = this.container.getByRole('link', { name: 'Dashboard' });
    this.appointmentsLink  = this.container.getByRole('link', { name: 'Appointments' });
    this.healthRecordsLink = this.container.getByRole('link', { name: 'Health Records' });
    this.medicationsLink   = this.container.getByRole('link', { name: 'Medications' });
    this.symptomCheckerLink = this.container.getByRole('link', { name: 'Symptom Checker' });
    this.notificationsLink = this.container.getByRole('link', { name: 'Notifications' });

    // Account links
    this.profileLink  = this.container.getByRole('link', { name: 'Profile' });
    this.settingsLink = this.container.getByRole('link', { name: 'Settings' });

    // Mobile close button
    this.closeButton = page.getByRole('button', { name: 'Close sidebar' });
  }

  /**
   * Navigate to a section via sidebar click (SPA client-side routing).
   * IMPORTANT: Use this instead of page.goto() to preserve auth state.
   * Scoped to sidebar container to avoid matching dashboard quick-action links.
   *
   * @param {string} section — Section name matching link text (e.g., 'Appointments')
   */
  async navigateTo(section) {
    await test.step(`Navigate to ${section}`, async () => {
      await this.container.getByRole('link', { name: section }).click();
    });
  }

  async isVisible() {
    return await this.container.isVisible();
  }

  async close() {
    await this.closeButton.click();
  }
}
