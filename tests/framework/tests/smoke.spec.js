// Smoke test to verify the fixture chain and page objects work
import { test, expect } from '../fixtures/index.js';
import { LoginPage } from '../pages/login.page.js';
import { DashboardPage } from '../pages/dashboard.page.js';
import { AppointmentsPage } from '../pages/appointments.page.js';
import { HealthRecordsPage } from '../pages/health-records.page.js';
import { ApiClient } from '../utils/api-client.js';
import { CREDENTIALS } from '../data/constants.js';

test.describe('@smoke Fixture Chain Verification', () => {

  test('base fixture — page with error capture works', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  test('auth fixture — authenticatedPage is logged in', async ({ authenticatedPage }) => {
    await expect(authenticatedPage.getByRole('heading', { name: /Good (morning|afternoon|evening)/ })).toBeVisible();
  });

  test('data fixture — ApiClient can fetch data', async () => {
    // Use a fresh API client to avoid session conflicts in parallel runs
    const client = await ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
    const data = await client.get('/appointments?limit=1');
    expect(data).toBeDefined();
  });

  test('data fixture — ApiClient creates and cleans appointment', async () => {
    const client = await ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
    const apt = await client.post('/appointments', {
      title: `Smoke Test Apt ${Date.now()}`,
      appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      appointment_time: '10:00',
      duration_minutes: 30,
      type: 'general',
      status: 'scheduled',
    });
    expect(apt.id).toBeDefined();
    expect(apt.title).toContain('Smoke Test Apt');
    // Clean up
    await client.delete(`/appointments/${apt.id}`);
  });
});

test.describe('@smoke Page Object Verification', () => {

  test('LoginPage — navigates and shows heading', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('LoginPage — login navigates to dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('patient@healthhub.test', 'Test123!');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('LoginPage — invalid login shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginExpectingError('bad@email.com', 'wrongpass');
    await expect(loginPage.errorAlert).toBeVisible();
  });

  test('DashboardPage — shows welcome and sections', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.waitForPageReady();
    await expect(dashboard.welcomeHeading).toBeVisible();
    await expect(dashboard.quickActionsHeading).toBeVisible();
  });

  test('AppointmentsPage — navigate via sidebar and show heading', async ({ authenticatedPage }) => {
    const appointmentsPage = new AppointmentsPage(authenticatedPage);
    await appointmentsPage.navigateViaSidebar();
    await expect(appointmentsPage.pageHeading).toBeVisible();
    await expect(appointmentsPage.newAppointmentButton).toBeVisible();
  });

  test('HealthRecordsPage — navigate via sidebar and show heading', async ({ authenticatedPage }) => {
    const healthRecordsPage = new HealthRecordsPage(authenticatedPage);
    await healthRecordsPage.navigateViaSidebar();
    await expect(healthRecordsPage.pageHeading).toBeVisible();
  });
});
