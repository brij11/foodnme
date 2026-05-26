import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { JOB_TYPES, EXPERIENCE_LEVELS } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { ok, err, fieldErrors } from "@/lib/api";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

// PATCH accepts a status change (close/reopen) and/or field edits — all optional.
const jobPatchSchema = z
  .object({
    status: z.enum(["active", "closed"]).optional(),
    title: z.string().trim().min(1).optional(),
    company_name: z.string().trim().min(1).optional(),
    location: z.string().trim().min(1).optional(),
    job_type: z.enum(JOB_TYPES).optional(),
    salary_min: z.coerce.number().int().min(0).nullable().optional(),
    salary_max: z.coerce.number().int().min(0).nullable().optional(),
    experience_level: z.enum(EXPERIENCE_LEVELS).optional(),
    description: z.string().trim().min(50).optional(),
    skills: z.array(z.string().trim().min(1)).max(20).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Nothing to update." });

/**
 * PATCH /api/jobs/:id (TECHNICAL-REQUIREMENTS.md §6.2, story-jobs-04). Owner or admin. Used for
 * the employer's "Close" action and profile edits. Service-role write after the in-route
 * ownership check; revalidates the board.
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const json = (await request.json().catch(() => null)) as unknown;
  const parsed = jobPatchSchema.safeParse(json);
  if (!parsed.success) {
    return err("invalid_body", "Invalid request.", 400, fieldErrors(parsed.error.flatten().fieldErrors));
  }

  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) return err("unauthorized", "Sign in to edit a job.", 401);

  const svc = createServiceClient();
  const { data: job, error: lookupError } = await svc
    .from("jobs")
    .select("id, employer_id")
    .eq("id", params.id)
    .maybeSingle();
  if (lookupError) {
    if (lookupError.code === "22P02") return err("not_found", "Job not found.", 404);
    return err("db_error", "Something went wrong.", 500);
  }
  if (!job) return err("not_found", "Job not found.", 404);

  if (job.employer_id !== user.id) {
    const { data: prof } = await svc.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
    if (!prof?.is_admin) return err("forbidden", "You can only edit your own jobs.", 403);
  }

  const { error: updateError } = await svc.from("jobs").update(parsed.data).eq("id", params.id);
  if (updateError) {
    logError("jobs.update_failed", { message: updateError.message });
    return err("db_error", "Could not save the change.", 500);
  }

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${params.id}`);
  return ok({ id: params.id, ...(parsed.data.status ? { status: parsed.data.status } : {}) });
}
