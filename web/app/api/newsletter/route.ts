import type { NextRequest } from "next/server";
import { newsletterSchema } from "@/lib/schemas/newsletter";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendEmail } from "@/lib/email/zeptomail";
import { ok, err, fieldErrors } from "@/lib/api";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

/**
 * POST /api/newsletter (TECHNICAL-REQUIREMENTS.md §6.2)
 * Zod-validate → verify Turnstile (before any DB write, §9.6) → upsert subscriber
 * (reactivate on conflict) → welcome email to NEW subscribers only → { ok: true }.
 */
export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(json);
  if (!parsed.success) {
    return err("invalid_body", "Invalid request.", 400, fieldErrors(parsed.error.flatten().fieldErrors));
  }
  const { email, source, turnstile_token } = parsed.data;

  const passed = await verifyTurnstile(turnstile_token, request.headers.get("x-forwarded-for") ?? undefined);
  if (!passed) {
    return err("turnstile_failed", "Verification failed. Please try again.", 400);
  }

  const supabase = createServiceClient();

  // Distinguish a brand-new subscriber from a reactivation so we don't re-welcome.
  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  const isNew = !existing;

  const { error: upsertError } = await supabase
    .from("newsletter_subscribers")
    .upsert(
      { email, source, is_active: true, subscribed_at: new Date().toISOString() },
      { onConflict: "email" },
    );
  if (upsertError) {
    logError("newsletter.upsert_failed", { message: upsertError.message });
    return err("db_error", "Could not save your subscription. Please try again.", 500);
  }

  // Welcome email is best-effort: DB is source of truth (§6.2), so a send failure → 200.
  if (isNew) {
    try {
      await sendEmail({
        to: email,
        subject: "Welcome to foodnme — practical food-tech, weekly",
        html: `<p>Thanks for subscribing to foodnme.</p><p>Once a week you'll get practical guidance on food safety, quality control, and regulatory compliance. No spam — unsubscribe anytime.</p>`,
        text: "Thanks for subscribing to foodnme. One practical email a week. Unsubscribe anytime.",
      });
    } catch (e) {
      logError("newsletter.welcome_email_failed", { error: String(e) });
    }
  }

  return ok();
}
