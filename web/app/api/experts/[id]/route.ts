import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { expertProfileSchema, hasMaterialChange } from "@/lib/schemas/expert-profile";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email/zeptomail";
import { ok, err, fieldErrors } from "@/lib/api";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/experts/:id (TECHNICAL-REQUIREMENTS.md §6.2, story-experts-04).
 * Owner (or admin) edit. Changing a material field (name/title/bio/specializations/certifications)
 * re-bounces the profile to `status='pending'` + notifies admin; cosmetic edits keep the current
 * status. Ownership is enforced in-route on the service-role client (Sprint-1 convention).
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const json = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const parsed = expertProfileSchema.safeParse(json);
  if (!parsed.success) {
    return err("invalid_body", "Invalid request.", 400, fieldErrors(parsed.error.flatten().fieldErrors));
  }

  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) return err("unauthorized", "Sign in to edit your profile.", 401);

  const svc = createServiceClient();
  const { data: current, error: lookupError } = await svc
    .from("experts")
    .select("id, user_id, status, full_name, title, bio, specializations, certifications")
    .eq("id", params.id)
    .maybeSingle();
  if (lookupError) {
    if (lookupError.code === "22P02") return err("not_found", "Profile not found.", 404);
    return err("db_error", "Something went wrong. Please try again.", 500);
  }
  if (!current) return err("not_found", "Profile not found.", 404);

  // Owner or admin only.
  if (current.user_id !== user.id) {
    const { data: prof } = await svc.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
    if (!prof?.is_admin) return err("forbidden", "You can only edit your own profile.", 403);
  }

  const material = hasMaterialChange(current, parsed.data);
  const update = {
    full_name: parsed.data.full_name,
    title: parsed.data.title,
    bio: parsed.data.bio,
    specializations: parsed.data.specializations,
    experience_years: parsed.data.experience_years,
    hourly_rate: parsed.data.hourly_rate ?? null,
    certifications: parsed.data.certifications,
    location: parsed.data.location,
    contact_email: parsed.data.contact_email,
    ...(material ? { status: "pending" as const } : {}),
  };

  const { error: updateError } = await svc.from("experts").update(update).eq("id", params.id);
  if (updateError) {
    logError("experts.update_failed", { message: updateError.message });
    return err("db_error", "Could not save your changes. Please try again.", 500);
  }

  revalidatePath("/experts");
  revalidatePath(`/experts/${params.id}`);

  if (material) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: "Expert profile edited — re-approval needed",
        html: `<p><strong>${parsed.data.full_name}</strong> edited material profile fields. Status reset to pending.</p>`,
        text: `${parsed.data.full_name} edited material profile fields. Status reset to pending.`,
      }).catch((e) => logError("experts.update_notify_failed", { error: String(e) }));
    }
  }

  return ok({ status: material ? "pending" : current.status });
}
