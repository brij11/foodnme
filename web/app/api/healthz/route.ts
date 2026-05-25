import { createClient } from "@/lib/supabase/server";
import { ok, err } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * GET /api/healthz (TECHNICAL-REQUIREMENTS.md §6.2)
 * Runs `select 1 from articles limit 1` to verify the DB + RLS read path.
 */
export async function GET() {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("articles").select("id").limit(1);
    if (error) {
      return err("db_down", error.message, 503);
    }
    return ok({ db: "up", ts: new Date().toISOString() });
  } catch (e) {
    return err("db_down", String(e), 503);
  }
}
