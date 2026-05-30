import type { NextRequest } from "next/server";
import { expertInquirySchema } from "@/lib/schemas/expert-inquiry";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendEmail } from "@/lib/email/zeptomail";
import { ok, err, fieldErrors } from "@/lib/api";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

/**
 * POST /api/expert-inquiry (TECHNICAL-REQUIREMENTS.md §6.2, story-experts-03).
 * Zod-validate → verify Turnstile (§9.6) → look up the active expert (service role) → relay the
 * visitor's message to the expert's `contact_email` (Reply-To = visitor) + send the visitor a
 * confirmation. No DB row (transient relay). `contact_email` is never returned in any response.
 */
export async function POST(request: NextRequest) {
  const json = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  const parsed = expertInquirySchema.safeParse(json);
  if (!parsed.success) {
    return err("invalid_body", "Invalid request.", 400, fieldErrors(parsed.error.flatten().fieldErrors));
  }
  const { expert_id, full_name, email, company_name, engagement_type, message, turnstile_token } =
    parsed.data;

  // §9.6 — verify the human-check before any lookup/relay.
  const passed = await verifyTurnstile(turnstile_token, request.headers.get("x-forwarded-for") ?? undefined);
  if (!passed) {
    return err("turnstile_failed", "Verification failed. Please try again.", 400);
  }

  // Resolve the expert (service role) — contact_email stays server-side, never returned.
  const supabase = createServiceClient();
  const { data: expert, error: lookupError } = await supabase
    .from("experts")
    .select("full_name, contact_email, status")
    .eq("id", expert_id)
    .maybeSingle();
  if (lookupError) {
    logError("expert_inquiry.lookup_failed", { message: lookupError.message });
    return err("db_error", "Something went wrong. Please try again.", 500);
  }
  if (!expert || expert.status !== "active") {
    return err("not_found", "That expert is no longer available.", 404);
  }

  // Persist the inquiry before notifying (story-experts-11) so it surfaces in the expert's
  // dashboard inbox. A storage failure must not drop the message — log and still relay.
  const { error: insertError } = await supabase.from("expert_inquiries").insert({
    expert_id,
    sender_name: full_name,
    sender_email: email,
    company_name: company_name || null,
    engagement_type: engagement_type || null,
    message,
  });
  if (insertError) {
    logError("expert_inquiry.persist_failed", { message: insertError.message });
  }

  // Relay to the expert — Reply-To is the visitor so the expert can respond directly.
  const relay = await sendEmail({
    to: expert.contact_email,
    toName: expert.full_name,
    replyTo: email,
    replyToName: full_name,
    subject: `New inquiry via foodnme — ${full_name}`,
    html: `<p>You have a new inquiry via your foodnme profile.</p><p><strong>${full_name}</strong> (${email}) wrote:</p><blockquote>${message}</blockquote><p>Reply directly to this email to respond.</p>`,
    text: `New inquiry via foodnme from ${full_name} (${email}):\n\n${message}\n\nReply directly to this email to respond.`,
  });

  // A genuine send failure (not the local no-key skip) must not be swallowed (AC#9).
  if (!relay.sent && !relay.skipped) {
    return err(
      "relay_failed",
      "We couldn't deliver your message right now. Please try again in a few minutes.",
      502,
    );
  }

  // Confirmation to the visitor — best-effort; never fail the request on this.
  try {
    await sendEmail({
      to: email,
      toName: full_name,
      subject: `Your message to ${expert.full_name} has been delivered`,
      html: `<p>Thanks, ${full_name}.</p><p>We've delivered your message to ${expert.full_name}. They typically respond within 24 hours, directly to this email address.</p>`,
      text: `Thanks, ${full_name}. We've delivered your message to ${expert.full_name}. They typically respond within 24 hours, directly to this email address.`,
    });
  } catch (e) {
    logError("expert_inquiry.confirmation_failed", { error: String(e) });
  }

  return ok();
}
