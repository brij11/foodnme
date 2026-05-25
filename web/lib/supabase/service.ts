import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role client that bypasses RLS for admin/server operations
 * (TECHNICAL-REQUIREMENTS.md §4.1). The `server-only` import guarantees this module
 * — and therefore `SUPABASE_SERVICE_ROLE_KEY` — can never be pulled into a client bundle.
 * This and `app/api/**` are the only sanctioned places the service-role key is referenced.
 */
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
