/**
 * Mailpit (local Supabase email sink, :54324) helpers for E2E. The local stack captures every
 * outbound auth email; tests poll for the most recent message to a recipient and extract the
 * GoTrue action link so flows that depend on email (password reset, signup verification) can be
 * driven end-to-end.
 */
const MAILPIT = "http://127.0.0.1:54324";

type MailpitSummary = { ID: string; To: { Address: string }[]; Subject: string; Created: string };

async function latestMessageId(toEmail: string): Promise<string | null> {
  const res = await fetch(`${MAILPIT}/api/v1/messages?limit=50`);
  const body = (await res.json()) as { messages: MailpitSummary[] };
  const match = body.messages.find((m) =>
    m.To.some((t) => t.Address.toLowerCase() === toEmail.toLowerCase()),
  );
  return match?.ID ?? null;
}

async function messageHtml(id: string): Promise<string> {
  const res = await fetch(`${MAILPIT}/api/v1/message/${id}`);
  const body = (await res.json()) as { HTML?: string; Text?: string };
  return body.HTML || body.Text || "";
}

/** Clears the Mailpit inbox so a poll can't pick up a stale message from a previous test. */
export async function clearMailpit(): Promise<void> {
  await fetch(`${MAILPIT}/api/v1/messages`, { method: "DELETE" });
}

/**
 * Polls for the latest email to `toEmail` and extracts the first GoTrue verify/action link
 * (`.../auth/v1/verify?...` or any `redirect_to` confirmation URL). Throws if none arrives.
 */
export async function waitForActionLink(toEmail: string, timeoutMs = 15000): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const id = await latestMessageId(toEmail);
    if (id) {
      const html = await messageHtml(id);
      const m =
        /href="(https?:\/\/[^"]*\/auth\/v1\/verify[^"]*)"/i.exec(html) ||
        /href="(https?:\/\/[^"]*(?:code|token)=[^"]*)"/i.exec(html);
      if (m && m[1]) return m[1].replace(/&amp;/g, "&");
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`No action-link email arrived for ${toEmail} within ${timeoutMs}ms`);
}
