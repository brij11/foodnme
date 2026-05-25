import { createPublicClient } from "@/lib/supabase/public";

/** A template/resource row as the listing + cards + in-article CTA need it. */
export type Resource = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  file_type: string;
  is_free: boolean;
  download_count: number;
};

const RESOURCE_COLUMNS = "id, title, slug, description, category, file_type, is_free, download_count";

/**
 * A single resource (template) by slug, or null if it does not exist. Used by the blog-05
 * in-article CTA box to resolve `articles.related_resource_slug` → `/templates/[slug]`,
 * and reused by the templates topic (templates-01/02/03).
 */
export async function getResourceBySlug(slug: string): Promise<Resource | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("resources")
    .select(RESOURCE_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getResourceBySlug failed: ${error.message}`);
  return (data as Resource | null) ?? null;
}

/**
 * Templates for the `/templates` listing, most-downloaded first, optionally filtered by
 * category (templates-01). `resources` is fully public (RLS allows anon read of every row),
 * so there is no `is_published` gate as the blog has.
 */
export async function listResources(opts: { category?: string } = {}): Promise<Resource[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from("resources")
    .select(RESOURCE_COLUMNS)
    .order("download_count", { ascending: false });

  if (opts.category && opts.category !== "all") {
    query = query.eq("category", opts.category);
  }

  const { data, error } = await query;
  if (error) throw new Error(`listResources failed: ${error.message}`);
  return (data as Resource[] | null) ?? [];
}

/** Template counts per category slug, plus `all` — for the sidebar counts. */
export async function getTemplateCategoryCounts(): Promise<Record<string, number>> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("resources").select("category");
  if (error) throw new Error(`getTemplateCategoryCounts failed: ${error.message}`);

  const counts: Record<string, number> = {};
  let all = 0;
  for (const row of (data as { category: string }[] | null) ?? []) {
    all += 1;
    counts[row.category] = (counts[row.category] ?? 0) + 1;
  }
  counts.all = all;
  return counts;
}
