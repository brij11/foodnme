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
  /** ISO-8601 date of upload / last revision. Rendered as "Last updated" on the detail page. */
  created_at?: string;
};

const RESOURCE_COLUMNS = "id, title, slug, description, category, file_type, is_free, download_count, created_at";

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
 * Sort options for the templates listing (story-templates-05 AC#1).
 * "shortest" (by pages) is intentionally excluded — the `resources` table has no page-count
 * column (TECHNICAL-REQUIREMENTS.md §3.5 / DEVIATIONS C7).
 */
export type TemplateSort = "popular" | "recent";

/**
 * Templates for the `/templates` listing, most-downloaded first, optionally filtered by
 * category (templates-01). `resources` is fully public (RLS allows anon read of every row),
 * so there is no `is_published` gate as the blog has.
 *
 * `sort` defaults to `"popular"` (download_count DESC). Use `"recent"` for created_at DESC
 * (story-templates-05 AC#1, AC#4). "shortest" is excluded — no pages column (DEVIATIONS C7).
 */
export async function listResources(
  opts: { category?: string; formats?: string[]; sort?: TemplateSort } = {},
): Promise<Resource[]> {
  const supabase = createPublicClient();

  // Sort column/direction: popular → download_count DESC; recent → created_at DESC.
  const ascending = false;
  const orderColumn: string = opts.sort === "recent" ? "created_at" : "download_count";

  let query = supabase
    .from("resources")
    .select(RESOURCE_COLUMNS)
    .order(orderColumn, { ascending });

  if (opts.category && opts.category !== "all") {
    query = query.eq("category", opts.category);
  }
  // File-format filter (story-templates-04) — multiple formats union via IN.
  if (opts.formats && opts.formats.length > 0) {
    query = query.in("file_type", opts.formats);
  }

  const { data, error } = await query;
  if (error) throw new Error(`listResources failed: ${error.message}`);
  return (data as Resource[] | null) ?? [];
}

/**
 * A featured template. `created_at` is optional in Resource; this alias narrows it to
 * required for the homepage "Featured this week" block (story-homepage-07).
 */
export type FeaturedTemplate = Omit<Resource, "created_at"> & { created_at: string };

/**
 * The single most-downloaded template for the homepage "Featured this week" block
 * (story-homepage-07): `ORDER BY download_count desc LIMIT 1`. Returns null when there are no
 * resources. Note: the `resources` table has no page-count column (a production decision from
 * templates-01), so the card shows "Updated {created_at}" rather than a page count.
 */
export async function getFeaturedTemplate(): Promise<FeaturedTemplate | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("resources")
    .select(RESOURCE_COLUMNS)
    .order("download_count", { ascending: false })
    .limit(1);
  if (error) throw new Error(`getFeaturedTemplate failed: ${error.message}`);
  return ((data as FeaturedTemplate[] | null) ?? [])[0] ?? null;
}

/** All template slugs — for `generateStaticParams` on the detail page (templates-02). */
export async function getAllTemplateSlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("resources").select("slug");
  if (error) throw new Error(`getAllTemplateSlugs failed: ${error.message}`);
  return ((data as { slug: string }[] | null) ?? []).map((r) => r.slug);
}

/** Templates by id (for search results — story-search-02), as template cards. */
export async function getTemplatesByIds(ids: string[]): Promise<Resource[]> {
  if (ids.length === 0) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("resources").select(RESOURCE_COLUMNS).in("id", ids);
  if (error) throw new Error(`getTemplatesByIds failed: ${error.message}`);
  return (data as Resource[] | null) ?? [];
}

/**
 * Similar templates for the detail-page footer (templates-02): same category first, excluding
 * the current template; if the category yields fewer than `limit`, top up with the
 * most-downloaded overall (dedup + exclude current). Mirrors `getRelatedArticles`.
 */
export async function getSimilarTemplates(
  currentSlug: string,
  category: string,
  limit = 3,
): Promise<Resource[]> {
  const supabase = createPublicClient();

  const sameCategory = await supabase
    .from("resources")
    .select(RESOURCE_COLUMNS)
    .eq("category", category)
    .neq("slug", currentSlug)
    .order("download_count", { ascending: false })
    .limit(limit);
  if (sameCategory.error) throw new Error(`getSimilarTemplates failed: ${sameCategory.error.message}`);

  const chosen = (sameCategory.data as Resource[] | null) ?? [];
  if (chosen.length >= limit) return chosen.slice(0, limit);

  const taken = new Set([currentSlug, ...chosen.map((t) => t.slug)]);
  const fallback = await supabase
    .from("resources")
    .select(RESOURCE_COLUMNS)
    .neq("slug", currentSlug)
    .order("download_count", { ascending: false })
    .limit(limit + chosen.length + 1);
  if (fallback.error) throw new Error(`getSimilarTemplates failed: ${fallback.error.message}`);

  for (const t of (fallback.data as Resource[] | null) ?? []) {
    if (chosen.length >= limit) break;
    if (taken.has(t.slug)) continue;
    taken.add(t.slug);
    chosen.push(t);
  }
  return chosen.slice(0, limit);
}

/**
 * "What's Included" parser (templates-02 AC#5): split markdown-style bullet lines (`- ` / `* `)
 * out of `resources.description`. Text before the first bullet becomes the intro paragraph; if
 * there are no bullet lines, the whole description is returned as the paragraph (fallback).
 */
export function parseWhatsIncluded(description: string): { intro: string | null; bullets: string[] } {
  const lines = description.split("\n").map((l) => l.trim());
  const bullets: string[] = [];
  const introLines: string[] = [];
  for (const line of lines) {
    const m = /^[-*]\s+(.*)$/.exec(line);
    if (m && m[1]) bullets.push(m[1].trim());
    else if (line) introLines.push(line);
  }
  if (bullets.length === 0) return { intro: description.trim() || null, bullets: [] };
  return { intro: introLines.length > 0 ? introLines.join(" ") : null, bullets };
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
