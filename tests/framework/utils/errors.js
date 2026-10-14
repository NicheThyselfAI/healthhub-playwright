// ============================================================================
// Custom Error Classes for the Test Framework
// ============================================================================
//
// Hierarchy (3 levels max):
//
//   TestFrameworkError (base)
//   ├── PageNotLoadedError        — page.waitForPageReady() failed
//   ├── AuthenticationError       — login/token failures
//   ├── TestDataError             — factory/API setup failures
//   │   ├── DataCreationError     — couldn't create test data
//   │   └── DataCleanupError      — cleanup failed (non-fatal)
//   └── EnvironmentError          — env config missing/invalid
//
// Usage:
//   import { AuthenticationError } from '../utils/errors.js';
//   throw new AuthenticationError('patient@test.com', 'Invalid credentials');
//
// ============================================================================

export class TestFrameworkError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

export class PageNotLoadedError extends TestFrameworkError {
  constructor(pageName, url, cause) {
    super(`Page "${pageName}" failed to load at ${url}`, { pageName, url });
    this.cause = cause;
  }
}

export class AuthenticationError extends TestFrameworkError {
  constructor(email, reason) {
    super(`Authentication failed for ${email}: ${reason}`, { email });
  }
}

export class TestDataError extends TestFrameworkError {
  constructor(message, operation) {
    super(message, { operation });
  }
}

export class DataCreationError extends TestDataError {
  constructor(entity, data) {
    super(`Failed to create ${entity}`, 'create');
    this.entityData = data;
  }
}

export class DataCleanupError extends TestDataError {
  constructor(entity, id) {
    super(`Failed to cleanup ${entity} (id: ${id})`, 'cleanup');
  }
}

export class EnvironmentError extends TestFrameworkError {
  constructor(variable) {
    super(`Required environment variable "${variable}" is not set`, { variable });
  }
}
