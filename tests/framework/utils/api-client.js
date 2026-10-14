// ============================================================================
// API Client — REST API Wrapper for Test Setup & Teardown
// ============================================================================
//
// Provides a typed wrapper around the HealthHub API for creating,
// reading, updating, and deleting test data via API calls.
//
// Usage:
//   const client = new ApiClient(token);
//   const appointment = await client.post('/appointments', data);
//   await client.delete(`/appointments/${appointment.id}`);
//
// The client is typically injected via the apiClient fixture
// (worker-scoped to share the auth token across tests).
//
// ============================================================================

import { TestDataError } from './errors.js';
import { logger } from './logger.js';

const DEFAULT_API_BASE = 'http://localhost:3001/api/v1';

export class ApiClient {
  /**
   * @param {string} token — JWT auth token
   * @param {string} [baseURL] — API base URL (defaults to env var or localhost)
   */
  constructor(token, baseURL) {
    this.token = token;
    this.baseURL = baseURL || process.env.API_BASE_URL || DEFAULT_API_BASE;
  }

  /**
   * Make an authenticated API request.
   * @param {string} method — HTTP method
   * @param {string} path — API path (e.g., '/appointments')
   * @param {object|null} data — Request body (for POST/PUT)
   * @returns {Promise<object>} Response data
   * @throws {TestDataError} If the API returns success: false
   */
  async request(method, path, data = null) {
    const url = `${this.baseURL}${path}`;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    logger.debug(`API ${method} ${path}`, data ? { body: data } : {});

    const response = await fetch(url, options);

    // Handle empty responses (e.g., DELETE returns 204 or empty body)
    const text = await response.text();
    const body = text ? JSON.parse(text) : { success: true };

    if (!body.success) {
      const errorMsg = `API ${method} ${path} failed (${response.status}): ${body.message || JSON.stringify(body)}`;
      logger.error(errorMsg);
      throw new TestDataError(errorMsg, method.toLowerCase());
    }

    logger.debug(`API ${method} ${path} succeeded`, { status: response.status });
    return body.data;
  }

  async get(path) {
    return this.request('GET', path);
  }

  async post(path, data) {
    return this.request('POST', path, data);
  }

  async put(path, data) {
    return this.request('PUT', path, data);
  }

  async delete(path) {
    return this.request('DELETE', path);
  }

  /**
   * Login via API and return a new ApiClient with the received token.
   * Useful for creating clients for different user roles.
   *
   * @param {string} email
   * @param {string} password
   * @param {string} [baseURL]
   * @returns {Promise<ApiClient>}
   */
  static async login(email, password, baseURL) {
    const base = baseURL || process.env.API_BASE_URL || DEFAULT_API_BASE;
    const url = `${base}/auth/login`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const body = await response.json();

    if (!body.success || !body.data?.token) {
      throw new TestDataError(
        `API login failed for ${email}: ${body.message || response.status}`,
        'login'
      );
    }

    logger.info(`API login successful for ${email}`);
    return new ApiClient(body.data.token, base);
  }
}
