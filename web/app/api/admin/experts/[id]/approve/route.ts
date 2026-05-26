import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminActor, writeAudit } from "@/lib/admin";
import { sendEmail } from "@/lib/email/zeptomail";
import { ok, err } from "@/lib/api";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/experts/:id/approve (TECHNICAL-REQUIREMENTS.md §6.2, story-experts-07).
 * Admin-only. Transitions a `pending` expert → `active` (409 otherwise); `{ feature: true }` also
 * sets `is_featured`. Writes an admin_audit_log row, revalidates the directory, and emails the
 * expert. No reject flow (Phase 2, manual).
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const body = (await request.json().catch(() => ({}))) as { feature?: boolean } | null;
  const feature = body?.feature === true;

  const svc = createServiceClient();
  const actor = await getAdminActor(svc);
  if ("error" in actor) {
    return actor.error === 401
      ? err("unauthorized", "Sign in as an admin.", 401)
      : err("forbidden", "Admin only.", 403);
  }

  const { data: expert, error: lookupError } = await svc
    .from("experts")
    .select("id, status, full_name, contact_email, is_featured")
    .eq("id", params.id)
    .maybeSingle();
  if (lookupError) {
    if (lookupError.code === "22P02") return err("not_found", "Expert not found.", 404);
    return err("db_error", "Something went wrong.", 500);
  }
  if (!expert) return err("not_found", "Expert not found.", 404);
  if (expert.status !== "pending") {
    return err("conflict", "This expert is not pending approval.", 409);
  }

  const nextFeatured = feature ? true : expert.is_featured;
  const { error: updateError } = await svc
    .from("experts")
    .update({ status: "active", is_featured: nextFeatured })
    .eq("id", params.id);
  if (updateError) {
    logError("experts.approve_failed", { message: updateError.message });
    return err("db_error", "Could not approve the expert.", 500);
  }

  await writeAudit(svc, {
    actorId: actor.userId,
    action: "approve_expert",
    targetTable: "experts",
    targetId: params.id,
    before: { status: expert.status, is_featured: expert.is_featured },
    after: { status: "active", is_featured: nextFeatured },
  }).catch((e) => logError("experts.approve_audit_failed", { error: String(e) }));

  revalidatePath("/experts");
  revalidatePath(`/experts/${params.id}`);

  await sendEmail({
    to: expert.contact_email,
    toName: expert.full_name,
    subject: "Your profile is live on foodnme",
    html: `<p>Good news, ${expert.full_name} — your expert profile is now live in the foodnme directory.</p>`,
    text: `Good news, ${expert.full_name} — your expert profile is now live in the foodnme directory.`,
  }).catch((e) => logError("experts.approve_notify_failed", { error: String(e) }));

  return ok({ status: "active", is_featured: nextFeatured });
}
