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
