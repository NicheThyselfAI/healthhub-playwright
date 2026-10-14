// ============================================================================
// Auth API Tests — Direct API-level Authentication Tests
// ============================================================================
import { test, expect } from '../../fixtures/index.js';
import { CREDENTIALS, API } from '../../data/constants.js';
import { ApiClient } from '../../utils/api-client.js';

const API_BASE = process.env.API_BASE_URL || API.BASE_URL;

test.describe('Auth API', () => {

  test('POST /auth/login — valid credentials returns token', async () => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: CREDENTIALS.patient.email,
        password: CREDENTIALS.patient.password,
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.token).toBeTruthy();
  });

  test('POST /auth/login — invalid credentials returns error', async () => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'wrong@email.com',
        password: 'wrong',
      }),
    });

    const body = await response.json();
    expect(body.success).toBe(false);
  });

  test('GET /auth/me — with valid token returns user', async () => {
    const client = await ApiClient.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);

    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${client.token}` },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.email).toBe(CREDENTIALS.patient.email);
  });

  test('GET /auth/me — without token returns 401', async () => {
    const response = await fetch(`${API_BASE}/auth/me`);
    expect(response.status).toBe(401);
  });

  test('ApiClient.login — creates authenticated client', async () => {
    const client = await ApiClient.login(
      CREDENTIALS.patient.email,
      CREDENTIALS.patient.password
    );
    expect(client.token).toBeTruthy();

    const data = await client.get('/appointments?limit=1');
    expect(data).toBeDefined();
  });
});
