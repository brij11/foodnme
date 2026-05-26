import type { NextRequest } from "next/server";
import { applicationSchema } from "@/lib/schemas/application";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendEmail } from "@/lib/email/zeptomail";
import { ok, err, fieldErrors } from "@/lib/api";
import { getCachedResponse, cacheResponse } from "@/lib/idempotency";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

/**
 * POST /api/applications (TECHNICAL-REQUIREMENTS.md §6.2, story-jobs-06).
 * Authenticated seeker → Zod → Turnstile (§9.6) → idempotency → job must be active (400) →
 * insert (unique (job_id, applicant_id); 409 on conflict) → notify the employer. status='submitted'.
 */
export async function POST(request: NextRequest) {
  const json = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const parsed = applicationSchema.safeParse(json);
  if (!parsed.success) {
    return err("invalid_body", "Invalid request.", 400, fieldErrors(parsed.error.flatten().fieldErrors));
  }

  const auth = createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return err("unauthorized", "Sign in to apply.", 401);
  const { data: prof } = await auth.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (prof?.role !== "seeker") return err("forbidden", "Only seeker accounts can apply.", 403);

  const passed = await verifyTurnstile(parsed.data.turnstile_token, request.headers.get("x-forwarded-for") ?? undefined);
  if (!passed) return err("turnstile_failed", "Verification failed. Please try again.", 400);

  const idemKey = request.headers.get("idempotency-key");
  if (await getCachedResponse<{ ok: true }>(idemKey)) return ok();

  const svc = createServiceClient();
  const { data: job } = await svc
    .from("jobs")
    .select("id, status, title, employer_id")
    .eq("id", parsed.data.job_id)
    .maybeSingle();
  if (!job) return err("not_found", "That job no longer exists.", 404);
  if (job.status !== "active") return err("job_closed", "This job is no longer accepting applications.", 400);

  const { error: insertError } = await svc.from("applications").insert({
    job_id: parsed.data.job_id,
    applicant_id: user.id,
    resume_url: parsed.data.resume_url,
    cover_note: parsed.data.cover_note,
    status: "submitted",
    applied_at: new Date().toISOString(),
  });
  if (insertError) {
    if (insertError.code === "23505") {
      return err("already_applied", "You've already applied to this job.", 409);
    }
    logError("applications.insert_failed", { message: insertError.message });
    return err("db_error", "Could not submit your application. Please try again.", 500);
  }

  // Notify the employer (best-effort).
  if (job.employer_id) {
    const { data: emp } = await svc.from("profiles").select("email, full_name").eq("id", job.employer_id).maybeSingle();
    if (emp?.email) {
      await sendEmail({
        to: emp.email,
        toName: emp.full_name ?? undefined,
        subject: `New application for ${job.title}`,
        html: `<p>You have a new application for <strong>${job.title}</strong>. Review it in your dashboard.</p>`,
        text: `You have a new application for ${job.title}. Review it in your dashboard.`,
      }).catch((e) => logError("applications.notify_failed", { error: String(e) }));
    }
  }

  await cacheResponse<{ ok: true }>(idemKey, { ok: true });
  return ok();
}
