import type { NextRequest } from "next/server";
import { jobSchema } from "@/lib/schemas/job";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendEmail } from "@/lib/email/zeptomail";
import { ok, err, fieldErrors } from "@/lib/api";
import { getCachedResponse, cacheResponse } from "@/lib/idempotency";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

/**
 * POST /api/jobs (TECHNICAL-REQUIREMENTS.md §6.2, story-jobs-03).
 * Authenticated employer → Zod → Turnstile (§9.6) → idempotency replay → service-role insert
 * (`status='pending'`, `employer_id`) → founder notification. Returns the new job id.
 */
export async function POST(request: NextRequest) {
  const json = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const parsed = jobSchema.safeParse(json);
  if (!parsed.success) {
    return err("invalid_body", "Invalid request.", 400, fieldErrors(parsed.error.flatten().fieldErrors));
  }

  const auth = createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return err("unauthorized", "Sign in to post a job.", 401);

  const { data: prof } = await auth.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (prof?.role !== "employer") {
    return err("forbidden", "Only employer accounts can post jobs.", 403);
  }

  // §9.6 — verify before any DB write.
  const passed = await verifyTurnstile(parsed.data.turnstile_token, request.headers.get("x-forwarded-for") ?? undefined);
  if (!passed) return err("turnstile_failed", "Verification failed. Please try again.", 400);

  // Idempotency: replay the success for a duplicate submit (§6.1).
  const idemKey = request.headers.get("idempotency-key");
  const cached = await getCachedResponse<{ id: string }>(idemKey);
  if (cached) return ok(cached);

  const svc = createServiceClient();
  const { data: inserted, error } = await svc
    .from("jobs")
    .insert({
      title: parsed.data.title,
      company_name: parsed.data.company_name,
      location: parsed.data.location,
      job_type: parsed.data.job_type,
      salary_min: parsed.data.salary_min ?? null,
      salary_max: parsed.data.salary_max ?? null,
      experience_level: parsed.data.experience_level,
      description: parsed.data.description,
      skills: parsed.data.skills,
      expires_at: parsed.data.expires_at.toISOString(),
      status: "pending",
      employer_id: user.id,
    })
    .select("id")
    .single();
  if (error) {
    logError("jobs.create_failed", { message: error.message });
    return err("db_error", "Could not post your job. Please try again.", 500);
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: "New job pending review",
      html: `<p><strong>${parsed.data.title}</strong> at <strong>${parsed.data.company_name}</strong> was submitted and is awaiting approval.</p>`,
      text: `${parsed.data.title} at ${parsed.data.company_name} was submitted and is awaiting approval.`,
    }).catch((e) => logError("jobs.create_notify_failed", { error: String(e) }));
  }

  await cacheResponse<{ id: string }>(idemKey, { id: inserted.id });
  return ok({ id: inserted.id });
}
