import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * "Keep me signed in for 30 days" — the persistent-session lifetime (story-auth-09).
 *
 * What `@supabase/ssr` actually exposes: the access token is always short-lived (~1h)
 * and refresh-token rotation is on (TECHNICAL-REQUIREMENTS.md §5.3) — there is no
 * server-side "session length" knob. The one supported control is the browser cookie's
 * `maxAge`: it decides how long the auth cookies (which carry the rotating refresh token)
 * survive in the browser, i.e. whether the session outlives a browser restart.
 *
 *  - persistent → cookies expire after 30 days, so a returning user stays signed in.
 *  - standard   → no `maxAge`, so Supabase writes session cookies that are cleared when
 *                 the browser closes.
 */
export const KEEP_SIGNED_IN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type ClientOptions = {
  /** When true, persist auth cookies for {@link KEEP_SIGNED_IN_MAX_AGE_SECONDS}. */
  persistent?: boolean;
};

/** RLS-bound client for Client Components. */
export function createClient(options: ClientOptions = {}) {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options.persistent
      ? { cookieOptions: { maxAge: KEEP_SIGNED_IN_MAX_AGE_SECONDS } }
      : undefined,
  );
}
