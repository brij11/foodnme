import "server-only";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Server-side Cloudflare Turnstile verification (TECHNICAL-REQUIREMENTS.md §9.6).
 * Must run BEFORE any DB write on public-form routes.
 *
 * Locally the public always-pass test secret (`1x000...`) makes this return true.
 * If `TURNSTILE_SECRET_KEY` is unset entirely we fail closed (return false) — a missing
 * secret in production is a misconfiguration, not a reason to wave traffic through.
 */
export async function verifyTurnstile(
  token: string | undefined | null,
  remoteIp?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
