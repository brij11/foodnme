import type { NextRequest } from "next/server";
import { expertProfileSchema } from "@/lib/schemas/expert-profile";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email/zeptomail";
import { ok, err, fieldErrors } from "@/lib/api";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

/**
 * POST /api/experts (TECHNICAL-REQUIREMENTS.md §6.2, story-experts-04).
 * Authenticated expert self-create: inserts the profile with `status='pending'` and notifies the
 * admin. One profile per user (409 otherwise → edit via PATCH). The insert runs with the service
 * role after the in-route auth check (§4.1 — anon/authenticated writes are impossible by policy).
 */
export async function POST(request: NextRequest) {
  const json = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const parsed = expertProfileSchema.safeParse(json);
  if (!parsed.success) {
    return err("invalid_body", "Invalid request.", 400, fieldErrors(parsed.error.flatten().fieldErrors));
  }

  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) return err("unauthorized", "Sign in to create a profile.", 401);

  const svc = createServiceClient();
  const { data: existing } = await svc
    .from("experts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) {
    return err("already_exists", "You already have a profile. Edit it instead.", 409);
  }

  const { data: inserted, error } = await svc
    .from("experts")
    .insert({ ...parsed.data, hourly_rate: parsed.data.hourly_rate ?? null, user_id: user.id, status: "pending" })
    .select("id")
    .single();
  if (error) {
    logError("experts.create_failed", { message: error.message });
    return err("db_error", "Could not create your profile. Please try again.", 500);
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: "New expert profile pending review",
      html: `<p><strong>${parsed.data.full_name}</strong> (${parsed.data.title}) submitted an expert profile for approval.</p>`,
      text: `${parsed.data.full_name} (${parsed.data.title}) submitted an expert profile for approval.`,
    }).catch((e) => logError("experts.create_notify_failed", { error: String(e) }));
  }

  return ok({ id: inserted.id, status: "pending" });
}
