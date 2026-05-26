import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { availabilitySchema } from "@/lib/schemas/availability";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { ok, err } from "@/lib/api";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/experts/:id/availability (TECHNICAL-REQUIREMENTS.md §6.2, story-experts-06).
 * Narrow surface: the owner toggles `is_available` only — never `status` (no re-approval). A call
 * with the current value is a no-op (no write, no revalidate). Returns the resolved boolean.
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const json = (await request.json().catch(() => null)) as unknown;
  const parsed = availabilitySchema.safeParse(json);
  if (!parsed.success) return err("invalid_body", "Expected { is_available: boolean }.", 400);

  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) return err("unauthorized", "Sign in to update availability.", 401);

  const svc = createServiceClient();
  const { data: current, error: lookupError } = await svc
    .from("experts")
    .select("id, user_id, is_available")
    .eq("id", params.id)
    .maybeSingle();
  if (lookupError) {
    if (lookupError.code === "22P02") return err("not_found", "Profile not found.", 404);
    return err("db_error", "Something went wrong. Please try again.", 500);
  }
  if (!current) return err("not_found", "Profile not found.", 404);
  if (current.user_id !== user.id) {
    return err("forbidden", "You can only change your own availability.", 403);
  }

  // Idempotent: no toast spam / no DB write when nothing changes.
  if (current.is_available === parsed.data.is_available) {
    return ok({ is_available: current.is_available });
  }

  const { error: updateError } = await svc
    .from("experts")
    .update({ is_available: parsed.data.is_available })
    .eq("id", params.id);
  if (updateError) {
    logError("experts.availability_failed", { message: updateError.message });
    return err("db_error", "Could not update availability. Please try again.", 500);
  }

  revalidatePath("/experts");
  revalidatePath(`/experts/${params.id}`);
  return ok({ is_available: parsed.data.is_available });
}
