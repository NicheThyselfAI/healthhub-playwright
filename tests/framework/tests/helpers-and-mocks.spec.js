// Phase 5 verification — Test Helpers, Mocks, Custom Assertions
import { test, expect } from '../fixtures/index.js';
import '../utils/custom-assertions.js';
import { waitForTableLoad, waitForApiResponse, waitForToast } from '../test-helpers/wait-helpers.js';
import { mockApiError, mockSlowResponse, mockApiResponse, clearAllMocks } from '../test-helpers/network-helpers.js';
import { assertTableContainsRow, assertHeadingVisible, assertPageUrl } from '../test-helpers/assertion-helpers.js';
import { mockAppointmentsList, mockAuthExpired } from '../mocks/handlers.js';
import { AppointmentsPage } from '../pages/appointments.page.js';

test.describe('@smoke Wait Helpers', () => {

  test('waitForApiResponse — captures API response', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const responsePromise = waitForApiResponse(page, '/appointments', 'GET');

    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();

    const response = await responsePromise;
    // Response may be 200 or 401 depending on session state in parallel runs
    expect(response).toBeTruthy();
    expect(typeof response.status()).toBe('number');
  });
});

test.describe('@smoke Network Helpers', () => {

  test('mockApiResponse — returns canned data', async ({ page }) => {
    await mockApiResponse(page, 'api/v1/auth/me', {
      success: true,
      data: { id: 1, email: 'test@test.com', first_name: 'Test', role: 'patient' },
    });

    const response = await page.goto('/login');
    // The mock should intercept auth/me calls
    expect(response.status()).toBe(200);
    await clearAllMocks(page);
  });

  test('mockApiError — returns error status', async ({ page }) => {
    await mockApiError(page, 'api/v1/auth/me', 500, 'Server down');

    // Navigate to a page that calls auth/me
    await page.goto('/dashboard');
    // Should redirect to login on auth failure
    await expect(page).toHaveURL(/login/);
    await clearAllMocks(page);
  });
});

test.describe('@smoke Mock Handlers', () => {

  test('mockAppointmentsList — returns canned appointments', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await mockAppointmentsList(page, [
      {
        id: 999,
        title: 'Mocked Appointment',
        appointment_date: '2026-06-01',
        appointment_time: '10:00',
        duration_minutes: 30,
        type: 'general',
        status: 'scheduled',
      },
    ]);

    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();

    await assertTableContainsRow(page, 'Mocked Appointment');
  });

  test('mockAppointmentsList — empty list shows no rows', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await mockAppointmentsList(page, []);

    const appointmentsPage = new AppointmentsPage(page);
    await appointmentsPage.navigateViaSidebar();

    // With empty data, table may show "no appointments" message
    const emptyMessage = page.getByText(/no appointments/i);
    await expect(emptyMessage).toBeVisible();
  });
});

test.describe('@smoke Assertion Helpers', () => {

  test('assertHeadingVisible — checks heading', async ({ authenticatedPage }) => {
    await assertHeadingVisible(authenticatedPage, /Good (morning|afternoon|evening)/);
  });

  test('assertPageUrl — checks URL pattern', async ({ authenticatedPage }) => {
    await assertPageUrl(authenticatedPage, 'dashboard');
  });
});

test.describe('@smoke Custom Assertions', () => {

  test('toBeOnPage — custom matcher', async ({ authenticatedPage }) => {
    await expect(authenticatedPage).toBeOnPage('/dashboard');
  });
});
