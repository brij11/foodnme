import "server-only";
import { logError } from "@/lib/log";

const ZEPTO_URL = "https://api.zeptomail.in/v1.1/email";

export type EmailMessage = {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  /** Reply-To address (e.g. the visitor's email on an expert-inquiry relay, story-experts-03). */
  replyTo?: string;
  replyToName?: string;
};

export type SendResult = { sent: boolean; skipped?: boolean };

/**
 * Transactional email via ZeptoMail (TECHNICAL-REQUIREMENTS.md §2, §6.2).
 *
 * When `ZEPTOMAIL_API_KEY` is unset (local dev, preview without secrets) this no-ops and
 * returns `{ sent: false, skipped: true }` rather than throwing — callers treat a failed
 * send as non-fatal (DB is source of truth; Sentry-log + 200) per the inquiry/newsletter ACs.
 */
export async function sendEmail(msg: EmailMessage): Promise<SendResult> {
  const apiKey = process.env.ZEPTOMAIL_API_KEY;
  const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL;
  const fromName = process.env.ZEPTOMAIL_FROM_NAME ?? "foodnme";

  if (!apiKey || !fromEmail) {
    return { sent: false, skipped: true };
  }

  try {
    const res = await fetch(ZEPTO_URL, {
      method: "POST",
      headers: {
        Authorization: `Zoho-enczapikey ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        from: { address: fromEmail, name: fromName },
        to: [{ email_address: { address: msg.to, name: msg.toName ?? msg.to } }],
        ...(msg.replyTo
          ? { reply_to: [{ address: msg.replyTo, name: msg.replyToName ?? msg.replyTo }] }
          : {}),
        subject: msg.subject,
        htmlbody: msg.html,
        ...(msg.text ? { textbody: msg.text } : {}),
      }),
    });
    if (!res.ok) {
      logError("zeptomail.send_failed", { status: res.status, to: msg.to });
      return { sent: false };
    }
    return { sent: true };
  } catch (e) {
    logError("zeptomail.send_error", { error: String(e), to: msg.to });
    return { sent: false };
  }
}
