import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Anonymous, cookie-free client for reading PUBLIC content (published articles, templates).
 * Because it never touches `cookies()`, pages that use it aren't forced into `no-store`
 * dynamic rendering — so listing pages remain CDN-cacheable (TECHNICAL-REQUIREMENTS.md §7).
 * RLS still applies: anon can only read published rows (§4.1).
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
