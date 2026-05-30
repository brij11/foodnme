import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/public", () => ({ createPublicClient: vi.fn() }));

import {
  listArticles,
  getCategoryCounts,
  getArticleBySlug,
  getPublishedSlugs,
  getRelatedArticles,
  getLatestArticles,
  clampPage,
  parseSort,
} from "./articles";
import { createPublicClient as createClient } from "@/lib/supabase/public";

type ChainResult = { data: unknown; count?: number; error: null };

function chain(result: ChainResult) {
  const obj: Record<string, unknown> = {};
  for (const m of ["select", "eq", "neq", "order", "range", "limit", "maybeSingle"]) {
    obj[m] = vi.fn(() => obj);
  }
  (obj as { then: unknown }).then = (resolve: (r: ChainResult) => unknown) => resolve(result);
  return obj;
}

/** A client whose successive `.from()` calls resolve the queued results in order. */
function clientWithQueue(results: ChainResult[]) {
  const chains = results.map(chain);
  let i = 0;
  return { from: vi.fn(() => chains[i++]) } as never;
}

describe("clampPage / parseSort", () => {
  it("clampPage floors to a valid 1-based page", () => {
    expect(clampPage(undefined)).toBe(1);
    expect(clampPage("3")).toBe(3);
    expect(clampPage("0")).toBe(1);
    expect(clampPage("-4")).toBe(1);
    expect(clampPage("abc")).toBe(1);
    expect(clampPage(["2"])).toBe(2);
  });
  it("parseSort defaults to newest", () => {
    expect(parseSort("oldest")).toBe("oldest");
    expect(parseSort(undefined)).toBe("newest");
    expect(parseSort("bogus")).toBe("newest");
  });
});

describe("listArticles", () => {
  beforeEach(() => vi.clearAllMocks());

  it("derives totalPages from the exact count and page size 12", async () => {
    const c = chain({ data: [{ slug: "a" }], count: 25, error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);

    const res = await listArticles({ page: 2 });
    expect(res.total).toBe(25);
    expect(res.totalPages).toBe(3);
    expect(res.page).toBe(2);
    // page 2 → range(12, 23)
    expect(c.range).toHaveBeenCalledWith(12, 23);
  });

  it("applies the category filter when provided (not for 'all')", async () => {
    const c = chain({ data: [], count: 0, error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);

    await listArticles({ category: "food-safety", page: 1 });
    expect(c.eq).toHaveBeenCalledWith("is_published", true);
    expect(c.eq).toHaveBeenCalledWith("category", "food-safety");

    vi.clearAllMocks();
    const c2 = chain({ data: [], count: 0, error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c2 } as never);
    await listArticles({ category: "all" });
    expect(c2.eq).not.toHaveBeenCalledWith("category", "all");
  });
});

describe("getArticleBySlug / getPublishedSlugs (blog-02)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the published article row for a slug (no expert → fallback author, no count query)", async () => {
    const row = { slug: "haccp-rollout", title: "HACCP", is_published: true, expert: null };
    const c = chain({ data: row, error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);

    const article = await getArticleBySlug("haccp-rollout");
    expect(article?.slug).toBe("haccp-rollout");
    // expert is folded into author + a derived author_name; the raw `expert` key is dropped.
    expect(article).not.toHaveProperty("expert");
    expect(article?.author_name).toBe("foodnme");
    expect(article?.author_article_count).toBe(0);
    expect(c.eq).toHaveBeenCalledWith("slug", "haccp-rollout");
    expect(c.eq).toHaveBeenCalledWith("is_published", true);
  });

  it("joins the author expert and counts that expert's published articles (blog-06 AC#5)", async () => {
    const expert = {
      id: "11111111-1111-1111-1111-111111111111",
      full_name: "Dr. Aarti Menon",
      title: "FSSAI Lead Auditor",
      avatar_url: null,
      bio: "Twelve years auditing.",
      specializations: ["HACCP"],
      linkedin_url: "https://www.linkedin.com/in/aarti-menon",
      twitter_url: null,
    };
    const row = { slug: "haccp-rollout", title: "HACCP", is_published: true, expert };
    const client = clientWithQueue([
      { data: row, error: null }, // detail row
      { data: null, count: 4, error: null }, // per-expert published count
    ]);
    vi.mocked(createClient).mockReturnValue(client);

    const article = await getArticleBySlug("haccp-rollout");
    expect(article?.author).toEqual(expert);
    expect(article?.author_name).toBe("Dr. Aarti Menon");
    expect(article?.author.linkedin_url).toBe("https://www.linkedin.com/in/aarti-menon");
    expect(article?.author_article_count).toBe(4);
  });

  it("returns null when no published row matches (→ 404)", async () => {
    const c = chain({ data: null, error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);
    expect(await getArticleBySlug("missing")).toBeNull();
  });

  it("getPublishedSlugs maps to slug strings", async () => {
    const c = chain({ data: [{ slug: "a" }, { slug: "b" }], error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);
    expect(await getPublishedSlugs()).toEqual(["a", "b"]);
  });
});

describe("getRelatedArticles (blog-05)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns same-category articles (newest first), no fallback query when ≥ limit", async () => {
    const same = [{ slug: "b" }, { slug: "c" }, { slug: "d" }];
    const client = clientWithQueue([{ data: same, error: null }]);
    vi.mocked(createClient).mockReturnValue(client);

    const res = await getRelatedArticles("a", "food-safety", 3);
    expect(res.map((r) => r.slug)).toEqual(["b", "c", "d"]);
    // only the same-category query ran (no top-up needed)
    expect((client as unknown as { from: ReturnType<typeof vi.fn> }).from).toHaveBeenCalledTimes(1);
  });

  it("tops up from most-recent overall when the category yields < limit (dedup + exclude current)", async () => {
    const same = [{ slug: "b" }]; // 1 in-category match
    const overall = [{ slug: "a" }, { slug: "b" }, { slug: "x" }, { slug: "y" }]; // current + dup + new
    const client = clientWithQueue([
      { data: same, error: null },
      { data: overall, error: null },
    ]);
    vi.mocked(createClient).mockReturnValue(client);

    const res = await getRelatedArticles("a", "food-safety", 3);
    // keeps "b", skips current "a" and the duplicate "b", fills "x" then "y"
    expect(res.map((r) => r.slug)).toEqual(["b", "x", "y"]);
  });

  it("can return fewer than limit when the corpus is too small", async () => {
    const client = clientWithQueue([
      { data: [], error: null },
      { data: [{ slug: "a" }], error: null }, // only the current article exists
    ]);
    vi.mocked(createClient).mockReturnValue(client);

    expect(await getRelatedArticles("a", "food-safety", 3)).toEqual([]);
  });
});

describe("getCategoryCounts", () => {
  it("tallies published articles per category plus 'all'", async () => {
    const c = chain({
      data: [{ category: "food-safety" }, { category: "food-safety" }, { category: "regulatory" }],
      error: null,
    });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);

    const counts = await getCategoryCounts();
    expect(counts).toEqual({ all: 3, "food-safety": 2, regulatory: 1 });
  });
});

describe("getLatestArticles (story-homepage-04/05)", () => {
  it("returns the newest published articles, in order", async () => {
    const rows = [{ slug: "a" }, { slug: "b" }, { slug: "c" }, { slug: "d" }];
    vi.mocked(createClient).mockReturnValue(clientWithQueue([{ data: rows, error: null }]));

    const out = await getLatestArticles({ limit: 4 });
    expect(out.map((a) => a.slug)).toEqual(["a", "b", "c", "d"]);
    // each row is enriched with a derived author (fallback when no expert embedded).
    expect(out[0]).toHaveProperty("author");
    expect(out[0]).not.toHaveProperty("expert");
  });

  it("supports excluding the featured slug (rail never repeats the editorial feature)", async () => {
    vi.mocked(createClient).mockReturnValue(
      clientWithQueue([{ data: [{ slug: "b" }, { slug: "c" }], error: null }]),
    );

    const out = await getLatestArticles({ limit: 4, excludeSlug: "featured" });
    expect(out.map((a) => a.slug)).toEqual(["b", "c"]);
  });

  it("returns [] when there are no published articles", async () => {
    vi.mocked(createClient).mockReturnValue(clientWithQueue([{ data: null, error: null }]));
    expect(await getLatestArticles({ limit: 4 })).toEqual([]);
  });
});
