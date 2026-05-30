import { createPublicClient } from "@/lib/supabase/public";

export const ARTICLES_PAGE_SIZE = 12;

/**
 * The article author is a linked expert (OQ#9 / story-blog-06): `articles.expert_id → experts(id)`.
 * These are the public author-display fields the chip + bio card render (UI-DESIGN-HANDOFF.md §3.7).
 */
export type AuthorExpert = {
  id: string;
  full_name: string;
  title: string;
  avatar_url: string | null;
  bio: string;
  specializations: string[];
  linkedin_url: string | null;
  twitter_url: string | null;
};

const AUTHOR_FIELDS =
  "id, full_name, title, avatar_url, bio, specializations, linkedin_url, twitter_url";

// Fallback when an article's author expert isn't publicly readable (e.g. not active).
const FALLBACK_AUTHOR: AuthorExpert = {
  id: "",
  full_name: "foodnme",
  title: "",
  avatar_url: null,
  bio: "",
  specializations: [],
  linkedin_url: null,
  twitter_url: null,
};

/** Fields the listing/cards need (a slim projection, not the full MDX body). */
export type ArticleListItem = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  cover_image_url: string | null;
  /** Derived from `author.full_name` — keeps the card/OG author footer working. */
  author_name: string;
  /** The linked author expert's public display fields (chip + bio card). */
  author: AuthorExpert;
  read_time_mins: number;
  published_at: string | null;
};

// supabase-js returns the embedded to-one expert under the `expert:` alias (object | null).
type RawListRow = Omit<ArticleListItem, "author_name" | "author"> & {
  expert: AuthorExpert | null;
};

const LIST_COLUMNS = `title, slug, excerpt, category, tags, cover_image_url, read_time_mins, published_at, expert:experts(${AUTHOR_FIELDS})`;

function mapListItem(row: RawListRow): ArticleListItem {
  const { expert, ...rest } = row;
  const author = expert ?? FALLBACK_AUTHOR;
  return { ...rest, author, author_name: author.full_name };
}

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
    articles: ((data as RawListRow[] | null) ?? []).map(mapListItem),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * The N most-recent published articles, newest first. Optionally excludes one slug
 * (the homepage editorial feature, so the "Latest from the blog" rail never repeats it —
 * story-homepage-04 / story-homepage-06). Also feeds the hero collage covers (story-homepage-05).
 */
export async function getLatestArticles(opts: {
  limit: number;
  excludeSlug?: string;
}): Promise<ArticleListItem[]> {
  const supabase = createPublicClient();
  let query = supabase.from("articles").select(LIST_COLUMNS).eq("is_published", true);
  if (opts.excludeSlug) query = query.neq("slug", opts.excludeSlug);

  const { data, error } = await query
    .order("published_at", { ascending: false })
    .limit(opts.limit);
  if (error) throw new Error(`getLatestArticles failed: ${error.message}`);
  return ((data as RawListRow[] | null) ?? []).map(mapListItem);
}

/**
 * Full article row (includes the MDX body) for the detail page. Carries the author expert's
 * display fields plus that expert's published-article count for the author bio card (blog-06/07).
 */
export type Article = ArticleListItem & {
  content_mdx: string;
  related_resource_slug: string | null;
  author_article_count: number;
};

type RawDetailRow = RawListRow & {
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
  if (!data) return null;

  const row = data as RawDetailRow;
  const base = mapListItem(row);

  // Per-expert published-article count (author bio card "N articles" — §3.7).
  let authorArticleCount = 0;
  if (base.author.id) {
    const { count, error: countError } = await supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("expert_id", base.author.id)
      .eq("is_published", true);
    if (countError) throw new Error(`getArticleBySlug author count failed: ${countError.message}`);
    authorArticleCount = count ?? 0;
  }

  return {
    ...base,
    content_mdx: row.content_mdx,
    related_resource_slug: row.related_resource_slug,
    author_article_count: authorArticleCount,
  };
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

  const chosen = ((sameCategory.data as RawListRow[] | null) ?? []).map(mapListItem);
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

  for (const a of ((fallback.data as RawListRow[] | null) ?? []).map(mapListItem)) {
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
