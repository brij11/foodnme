/**
 * Thin error-reporting indirection. In production this forwards to Sentry
 * (TECHNICAL-REQUIREMENTS.md §2); locally / without a DSN it logs to the server console.
 * Kept dependency-light so route handlers can record non-fatal failures (e.g. an email send
 * that fails after a successful DB write) without coupling to a specific SDK.
 */
export function logError(event: string, context?: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.error(`[error] ${event}`, context ?? {});
}
