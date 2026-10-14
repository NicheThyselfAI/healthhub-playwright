// ============================================================================
// User Factory — Multi-Role User Data & Auth Helpers
// ============================================================================
//
// Provides user data and API clients for different roles.
// Useful for testing role-based access and multi-user scenarios.
//
// Usage:
//   const userFactory = new UserFactory();
//   const patientClient = await userFactory.getApiClient('patient');
//   const adminClient = await userFactory.getApiClient('admin');
//
// ============================================================================

import { ApiClient } from '../../utils/api-client.js';
import { CREDENTIALS } from '../constants.js';
import { logger } from '../../utils/logger.js';

export class UserFactory {
  constructor() {
    this.cachedClients = new Map();
  }

  /**
   * Get credentials for a role.
   * @param {'patient' | 'admin' | 'secondary'} role
   * @returns {object} { email, password, firstName }
   */
  getCredentials(role) {
    const creds = CREDENTIALS[role];
    if (!creds) {
      throw new Error(`Unknown role: ${role}. Available: ${Object.keys(CREDENTIALS).join(', ')}`);
    }
    return { ...creds };
  }

  /**
   * Get an authenticated API client for a specific role.
   * Clients are cached per role to avoid redundant logins.
   *
   * @param {'patient' | 'admin' | 'secondary'} role
   * @returns {Promise<ApiClient>}
   */
  async getApiClient(role) {
    if (this.cachedClients.has(role)) {
      return this.cachedClients.get(role);
    }

    const { email, password } = this.getCredentials(role);
    const client = await ApiClient.login(email, password);
    this.cachedClients.set(role, client);
    logger.debug(`UserFactory: authenticated as ${role}`);
    return client;
  }

  /**
   * Get a fresh auth token for a role (not cached).
   * @param {'patient' | 'admin' | 'secondary'} role
   * @returns {Promise<string>} JWT token
   */
  async getToken(role) {
    const { email, password } = this.getCredentials(role);
    const client = await ApiClient.login(email, password);
    return client.token;
  }

  /**
   * Clear cached API clients (call between test suites if needed).
   */
  clearCache() {
    this.cachedClients.clear();
  }
}
