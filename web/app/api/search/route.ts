import type { NextRequest } from "next/server";
import { searchQuerySchema } from "@/lib/schemas/search";
import { runSearch } from "@/lib/search";
import { ok, err, fieldErrors } from "@/lib/api";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

/**
 * GET /api/search?q=&type=articles|templates|experts|all (TECHNICAL-REQUIREMENTS.md §6.2,
 * story-search-01). Ranked Postgres FTS across articles/templates/experts. Short/empty `q`
 * returns a clean empty result, not an error.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const params = request.nextUrl.searchParams;
  const parsed = searchQuerySchema.safeParse({
    q: params.get("q") ?? "",
    type: params.get("type") ?? "all",
  });
  if (!parsed.success) {
    return err("invalid_query", "Invalid search.", 400, fieldErrors(parsed.error.flatten().fieldErrors));
  }

  try {
    const results = await runSearch(parsed.data.q, parsed.data.type);
    return ok({ results });
  } catch (e) {
    logError("search.failed", { error: String(e) });
    return err("search_error", "Search is unavailable right now.", 500);
  }
}
