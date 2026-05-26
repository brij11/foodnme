import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminActor, writeAudit } from "@/lib/admin";
import { sendEmail } from "@/lib/email/zeptomail";
import { ok, err } from "@/lib/api";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/jobs/:id/approve (TECHNICAL-REQUIREMENTS.md §6.2, story-jobs-08).
 * Admin-only. Transitions a `pending` job → `active` (409 otherwise), audits, revalidates the
 * board, and emails the employer. Reuses `lib/admin` + the `admin_audit_log` table (story-experts-07).
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const svc = createServiceClient();
  const actor = await getAdminActor(svc);
  if ("error" in actor) {
    return actor.error === 401
      ? err("unauthorized", "Sign in as an admin.", 401)
      : err("forbidden", "Admin only.", 403);
  }

  const { data: job, error: lookupError } = await svc
    .from("jobs")
    .select("id, status, title, employer_id")
    .eq("id", params.id)
    .maybeSingle();
  if (lookupError) {
    if (lookupError.code === "22P02") return err("not_found", "Job not found.", 404);
    return err("db_error", "Something went wrong.", 500);
  }
  if (!job) return err("not_found", "Job not found.", 404);
  if (job.status !== "pending") return err("conflict", "This job is not pending approval.", 409);

  const { error: updateError } = await svc.from("jobs").update({ status: "active" }).eq("id", params.id);
  if (updateError) {
    logError("jobs.approve_failed", { message: updateError.message });
    return err("db_error", "Could not approve the job.", 500);
  }

  await writeAudit(svc, {
    actorId: actor.userId,
    action: "approve_job",
    targetTable: "jobs",
    targetId: params.id,
    before: { status: "pending" },
    after: { status: "active" },
  }).catch((e) => logError("jobs.approve_audit_failed", { error: String(e) }));

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${params.id}`);

  if (job.employer_id) {
    const { data: emp } = await svc.from("profiles").select("email, full_name").eq("id", job.employer_id).maybeSingle();
    if (emp?.email) {
      await sendEmail({
        to: emp.email,
        toName: emp.full_name ?? undefined,
        subject: "Your job is live on foodnme",
        html: `<p>Your posting <strong>${job.title}</strong> is now live on the foodnme job board.</p>`,
        text: `Your posting ${job.title} is now live on the foodnme job board.`,
      }).catch((e) => logError("jobs.approve_notify_failed", { error: String(e) }));
    }
  }

  return ok({ status: "active" });
}
