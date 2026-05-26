import type { NextRequest } from "next/server";
import { inquirySchema, consultationSchema, CONSULTATION_SERVICE } from "@/lib/schemas/inquiry";
import { serviceName } from "@/lib/services";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendEmail } from "@/lib/email/zeptomail";
import { ok, err, fieldErrors } from "@/lib/api";
import { getCachedResponse, cacheResponse } from "@/lib/idempotency";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

const KNOWN_SOURCES = new Set(["services_page", "consultation_modal"]);

/**
 * POST /api/inquiry (TECHNICAL-REQUIREMENTS.md §6.2, blueprint §9).
 * Zod-validate → verify Turnstile (before any DB write, §9.6) → (idempotency replay) →
 * insert into `service_inquiries` (incl. `source`) → dual ZeptoMail (founder notification +
 * user confirmation, best-effort) → { ok: true }. Shared by the services form
 * (`source='services_page'`) and the consultation modal (`source='consultation_modal'`).
 */
export async function POST(request: NextRequest) {
  const json = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const rawSource = typeof json?.source === "string" ? json.source : "";
  const isModal = rawSource === "consultation_modal";

  // The full services-page form validates strictly (enum service + company); the slim modal
  // (services-04) reuses the picked schema and the API supplies service_needed/company_name.
  let full_name: string;
  let email: string;
  let company_name: string;
  let service_needed: string;
  let message: string;
  let turnstile_token: string;

  if (isModal) {
    const parsed = consultationSchema.safeParse(json);
    if (!parsed.success) {
      return err("invalid_body", "Invalid request.", 400, fieldErrors(parsed.error.flatten().fieldErrors));
    }
    ({ full_name, email, message, turnstile_token } = parsed.data);
    company_name = "";
    service_needed = CONSULTATION_SERVICE;
  } else {
    const parsed = inquirySchema.safeParse(json);
    if (!parsed.success) {
      return err("invalid_body", "Invalid request.", 400, fieldErrors(parsed.error.flatten().fieldErrors));
    }
    ({ full_name, email, company_name, service_needed, message, turnstile_token } = parsed.data);
  }

  // §9.6 — verify the human-check before touching the DB.
  const passed = await verifyTurnstile(turnstile_token, request.headers.get("x-forwarded-for") ?? undefined);
  if (!passed) {
    return err("turnstile_failed", "Verification failed. Please try again.", 400);
  }

  // Idempotency: an accidental double-submit with the same key replays the success (no second
  // insert / no second pair of emails). No-ops without Upstash (best-effort, §6.1).
  const idemKey = request.headers.get("idempotency-key");
  const cached = await getCachedResponse<{ ok: true }>(idemKey);
  if (cached) return ok();

  const source = KNOWN_SOURCES.has(rawSource) ? rawSource : "services_page";

  const supabase = createServiceClient();
  const { error: insertError } = await supabase.from("service_inquiries").insert({
    full_name,
    email,
    company_name,
    service_needed,
    message,
    source,
    submitted_at: new Date().toISOString(),
  });
  if (insertError) {
    logError("inquiry.insert_failed", { message: insertError.message });
    return err("db_error", "Could not send your inquiry. Please try again.", 500);
  }

  // Emails are best-effort: the DB row is the source of truth, so a send failure → 200 + log
  // (Sentry in prod) rather than a user-facing error (AC#7).
  const label = serviceName(service_needed);
  const adminEmail = process.env.ADMIN_EMAIL;
  try {
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `New inquiry: ${label}`,
        html: `<p><strong>${full_name}</strong> (${email}) at <strong>${company_name}</strong> asked about <strong>${label}</strong>.</p><p>${message}</p>`,
        text: `${full_name} (${email}) at ${company_name} — ${label}\n\n${message}`,
      });
    }
    await sendEmail({
      to: email,
      toName: full_name,
      subject: "We received your inquiry — here's what's next",
      html: `<p>Thanks for reaching out, ${full_name}.</p><p>We've received your note about <strong>${label}</strong> and will respond within 24 hours. Next: a short, free scoping call — no commitment.</p>`,
      text: `Thanks for reaching out, ${full_name}. We received your note about ${label} and will respond within 24 hours.`,
    });
  } catch (e) {
    logError("inquiry.email_failed", { error: String(e) });
  }

  await cacheResponse<{ ok: true }>(idemKey, { ok: true });
  return ok();
}
