/**
 * Open-redirect mitigation (TECHNICAL-REQUIREMENTS.md §9.3, story-auth-01).
 * A `?redirect=` value is only honored when it is an *internal* absolute path.
 * Everything else — absolute URLs, protocol-relative `//host`, backslash tricks,
 * scheme-bearing values, and non-leading-slash inputs — falls back to `/dashboard`.
 *
 * Shared by the login page (story-auth-01) and `middleware.ts` (story-auth-06).
 */
export function safeRedirect(
  target: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (typeof target !== "string" || target.length === 0) return fallback;

  // Must be an absolute internal path.
  if (target[0] !== "/") return fallback;

  // Reject protocol-relative (`//evil.com`) and backslash-escaped (`/\evil.com`) forms —
  // browsers treat both as network-path references to an external origin.
  if (target[1] === "/" || target[1] === "\\") return fallback;

  // Reject anything carrying control characters or whitespace that could be used to
  // smuggle a second target past naive parsers.
  if (/[\x00-\x1f\x7f\s]/.test(target)) return fallback;

  return target;
}
