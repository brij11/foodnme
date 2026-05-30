import { createPublicClient } from "@/lib/supabase/public";
import { type SearchResult, type SearchType, MIN_SEARCH_LEN } from "@/lib/schemas/search";

/**
 * Ranked cross-entity search (story-search-01) via the `search_all` Postgres FTS RPC. A query
 * shorter than `MIN_SEARCH_LEN` short-circuits to an empty result (no DB hit). Shared by the
 * `/api/search` route and the `/search` page so both rank identically.
 */
export async function runSearch(q: string, type: SearchType): Promise<SearchResult[]> {
  const query = q.trim();
  if (query.length < MIN_SEARCH_LEN) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("search_all", { p_query: query, p_type: type });
  if (error) throw new Error(`search failed: ${error.message}`);
  return (data as SearchResult[] | null) ?? [];
}
