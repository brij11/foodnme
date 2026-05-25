import { createPublicClient } from "@/lib/supabase/public";

export const ARTICLES_PAGE_SIZE = 12;

/** Fields the listing/cards need (a slim projection, not the full MDX body). */
export type ArticleListItem = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  cover_image_url: string | null;
  author_name: string;
  read_time_mins: number;
  published_at: string | null;
};

const LIST_COLUMNS =
  "title, slug, excerpt, category, tags, cover_image_url, author_name, read_time_mins, published_at";

export type ArticleListResult = {
  articles: ArticleListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/** 1-based page clamp helper — keeps `?page=` within bounds. */
export function clampPage(raw: string | string[] | undefined): number {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

/**
 * Published articles, newest first, optionally filtered by category, paginated.
 * Mirrors the §-blog-01 query: `where is_published [and category=?] order by published_at desc`.
 */
export type ArticleSort = "newest" | "oldest";

export function parseSort(raw: string | string[] | undefined): ArticleSort {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === "oldest" ? "oldest" : "newest";
}

export async function listArticles(opts: {
  category?: string;
  page?: number;
  sort?: ArticleSort;
}): Promise<ArticleListResult> {
  const page = opts.page && opts.page >= 1 ? opts.page : 1;
  const pageSize = ARTICLES_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = createPublicClient();
  let query = supabase
    .from("articles")
    .select(LIST_COLUMNS, { count: "exact" })
    .eq("is_published", true)
    .order("published_at", { ascending: opts.sort === "oldest" })
    .range(from, to);

  if (opts.category && opts.category !== "all") {
    query = query.eq("category", opts.category);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(`listArticles failed: ${error.message}`);

  const total = count ?? 0;
  return {
    articles: (data as ArticleListItem[] | null) ?? [],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Full article row (includes the MDX body) for the detail page. */
export type Article = ArticleListItem & {
  content_mdx: string;
  related_resource_slug: string | null;
};

const DETAIL_COLUMNS = `${LIST_COLUMNS}, content_mdx, related_resource_slug`;

/** A single published article by slug, or null (404) if missing/unpublished. */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("articles")
    .select(DETAIL_COLUMNS)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(`getArticleBySlug failed: ${error.message}`);
  return (data as Article | null) ?? null;
}

/**
 * Related articles for the article-detail footer (blog-05): same category, most-recent first,
 * excluding the current article and anything unpublished. If the category yields fewer than
 * `limit`, top up with the most-recent published articles overall (still excluding the current
 * one and any already chosen) so the row always shows `limit` cards when enough exist.
 */
export async function getRelatedArticles(
  currentSlug: string,
  category: string,
  limit = 3,
): Promise<ArticleListItem[]> {
  const supabase = createPublicClient();

  const sameCategory = await supabase
    .from("articles")
    .select(LIST_COLUMNS)
    .eq("is_published", true)
    .eq("category", category)
    .neq("slug", currentSlug)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (sameCategory.error) throw new Error(`getRelatedArticles failed: ${sameCategory.error.message}`);

  const chosen = (sameCategory.data as ArticleListItem[] | null) ?? [];
  if (chosen.length >= limit) return chosen.slice(0, limit);

  // Fall back to most-recent overall, skipping the current article and anything already chosen.
  const taken = new Set([currentSlug, ...chosen.map((a) => a.slug)]);
  const fallback = await supabase
    .from("articles")
    .select(LIST_COLUMNS)
    .eq("is_published", true)
    .neq("slug", currentSlug)
    .order("published_at", { ascending: false })
    .limit(limit + chosen.length + 1);
  if (fallback.error) throw new Error(`getRelatedArticles failed: ${fallback.error.message}`);

  for (const a of (fallback.data as ArticleListItem[] | null) ?? []) {
    if (chosen.length >= limit) break;
    if (taken.has(a.slug)) continue;
    taken.add(a.slug);
    chosen.push(a);
  }
  return chosen.slice(0, limit);
}

/** All published slugs — for `generateStaticParams`. */
export async function getPublishedSlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("articles")
    .select("slug")
    .eq("is_published", true);
  if (error) throw new Error(`getPublishedSlugs failed: ${error.message}`);
  return ((data as { slug: string }[] | null) ?? []).map((r) => r.slug);
}

/** Published-article counts per category slug, plus `all` (used by the sidebar). */
export async function getCategoryCounts(): Promise<Record<string, number>> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("articles")
    .select("category")
    .eq("is_published", true);
  if (error) throw new Error(`getCategoryCounts failed: ${error.message}`);

  const counts: Record<string, number> = {};
  let all = 0;
  for (const row of (data as { category: string }[] | null) ?? []) {
    all += 1;
    counts[row.category] = (counts[row.category] ?? 0) + 1;
  }
  counts.all = all;
  return counts;
}
