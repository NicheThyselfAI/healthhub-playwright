// ============================================================================
// Structured Logger for Test Framework
// ============================================================================
//
// Provides consistent, structured logging with severity levels.
// Logs include timestamps and optional context for debugging.
//
// Usage:
//   import { logger } from '../utils/logger.js';
//   logger.info('Test started', { testName: 'login' });
//   logger.error('API call failed', { status: 500, url: '/api/auth' });
//
// ============================================================================

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Set via LOG_LEVEL env var; defaults to 'info'
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'info'] ?? LOG_LEVELS.info;

function formatMessage(level, message, context) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (context && Object.keys(context).length > 0) {
    return `${prefix} ${message} ${JSON.stringify(context)}`;
  }
  return `${prefix} ${message}`;
}

export const logger = {
  debug(message, context = {}) {
    if (currentLevel <= LOG_LEVELS.debug) {
      console.log(formatMessage('debug', message, context));
    }
  },

  info(message, context = {}) {
    if (currentLevel <= LOG_LEVELS.info) {
      console.log(formatMessage('info', message, context));
    }
  },

  warn(message, context = {}) {
    if (currentLevel <= LOG_LEVELS.warn) {
      console.warn(formatMessage('warn', message, context));
    }
  },

  error(message, context = {}) {
    if (currentLevel <= LOG_LEVELS.error) {
      console.error(formatMessage('error', message, context));
    }
  },
};
