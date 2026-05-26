import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// (No `server-only` guard: imported only by `/app/api/**` route handlers — inherently
// server-side — and keeping it importable lets the route unit tests exercise the real
// admin-check + audit logic against a mocked Supabase client.)

/**
 * Resolves the calling admin for an admin API route. Returns the actor id, or an `error` status
 * (401 unauthenticated, 403 non-admin). `is_admin` is read via the passed service-role client.
 * Shared by the admin approve endpoints (story-experts-07, story-jobs-08).
 */
export async function getAdminActor(
  svc: SupabaseClient,
): Promise<{ userId: string } | { error: 401 | 403 }> {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) return { error: 401 };
  const { data: prof } = await svc
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!prof?.is_admin) return { error: 403 };
  return { userId: user.id };
}

/** Appends an admin_audit_log row (service role; append-only). Best-effort callers may ignore. */
export async function writeAudit(
  svc: SupabaseClient,
  entry: {
    actorId: string;
    action: string;
    targetTable: string;
    targetId: string;
    before: Record<string, unknown>;
    after: Record<string, unknown>;
  },
): Promise<void> {
  await svc.from("admin_audit_log").insert({
    actor_id: entry.actorId,
    action: entry.action,
    target_table: entry.targetTable,
    target_id: entry.targetId,
    before: entry.before,
    after: entry.after,
  });
}
