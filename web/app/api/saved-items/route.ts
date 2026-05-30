import type { NextRequest } from "next/server";
import { savedItemSchema } from "@/lib/schemas/saved-item";
import { createClient } from "@/lib/supabase/server";
import { ok, err, fieldErrors } from "@/lib/api";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

/**
 * POST/DELETE /api/saved-items (TECHNICAL-REQUIREMENTS.md §6.2, story-jobs-15 / OQ#12).
 * Auth-required; the user-session client carries RLS so a caller can only touch their own rows.
 * POST is idempotent (unique-constraint upsert); DELETE removes the matching saved row.
 */
async function parse(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, response: err("unauthorized", "Sign in to save items.", 401) };
  }

  const json = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const parsed = savedItemSchema.safeParse(json);
  if (!parsed.success) {
    return {
      ok: false as const,
      response: err("invalid_body", "Invalid request.", 400, fieldErrors(parsed.error.flatten().fieldErrors)),
    };
  }
  return { ok: true as const, supabase, user, data: parsed.data };
}

export async function POST(request: NextRequest): Promise<Response> {
  const ctx = await parse(request);
  if (!ctx.ok) return ctx.response;
  const { supabase, user, data } = ctx;

  const { error } = await supabase
    .from("saved_items")
    .upsert(
      { user_id: user.id, item_type: data.item_type, item_id: data.item_id },
      { onConflict: "user_id,item_type,item_id", ignoreDuplicates: true },
    );
  if (error) {
    logError("saved_items.insert_failed", { message: error.message });
    return err("db_error", "Couldn't save that right now.", 500);
  }
  return ok();
}

export async function DELETE(request: NextRequest): Promise<Response> {
  const ctx = await parse(request);
  if (!ctx.ok) return ctx.response;
  const { supabase, user, data } = ctx;

  const { error } = await supabase
    .from("saved_items")
    .delete()
    .eq("user_id", user.id)
    .eq("item_type", data.item_type)
    .eq("item_id", data.item_id);
  if (error) {
    logError("saved_items.delete_failed", { message: error.message });
    return err("db_error", "Couldn't remove that right now.", 500);
  }
  return ok();
}
