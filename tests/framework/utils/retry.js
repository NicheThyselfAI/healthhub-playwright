// ============================================================================
// Retry Utility — Retry Actions with Exponential Backoff
// ============================================================================
//
// Retries an async action with configurable attempts, delay, and backoff.
// Useful for flaky API calls, eventual consistency, or polling patterns.
//
// Usage:
//   import { retryAction } from '../utils/retry.js';
//
//   const result = await retryAction(
//     async () => {
//       const resp = await fetch('/api/data');
//       if (!resp.ok) throw new Error('Not ready');
//       return resp.json();
//     },
//     { maxRetries: 3, delay: 1000, backoff: 2 }
//   );
//
// ============================================================================

import { logger } from './logger.js';

/**
 * Retry an async action with exponential backoff.
 *
 * @param {Function} action — Async function to retry
 * @param {object} options
 * @param {number} [options.maxRetries=3] — Maximum number of attempts
 * @param {number} [options.delay=1000] — Initial delay in ms between retries
 * @param {number} [options.backoff=2] — Backoff multiplier
 * @param {Function} [options.onRetry] — Callback on each retry (attempt, error)
 * @returns {Promise<*>} Result of the action
 * @throws {Error} Last error after all retries exhausted
 */
export async function retryAction(action, options = {}) {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    onRetry,
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        logger.warn(`Retry ${attempt}/${maxRetries} failed, waiting ${waitTime}ms`, {
          error: error.message,
        });
        if (onRetry) onRetry(attempt, error);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  logger.error(`All ${maxRetries} retries exhausted`, { error: lastError.message });
  throw lastError;
}
