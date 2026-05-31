import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/public", () => ({ createPublicClient: vi.fn() }));

import {
  listResources,
  getResourceBySlug,
  getTemplateCategoryCounts,
  getSimilarTemplates,
  getFeaturedTemplate,
  parseWhatsIncluded,
} from "./resources";
import { createPublicClient as createClient } from "@/lib/supabase/public";

type ChainResult = { data: unknown; error: null };

function chain(result: ChainResult) {
  const obj: Record<string, unknown> = {};
  for (const m of ["select", "eq", "neq", "order", "limit", "maybeSingle", "in"]) {
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

describe("listResources (templates-01 / story-templates-05)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("orders by download_count desc and applies the category filter (not for 'all')", async () => {
    const c = chain({ data: [{ slug: "a" }, { slug: "b" }], error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);

    const rows = await listResources({ category: "haccp" });
    expect(rows).toHaveLength(2);
    expect(c.order).toHaveBeenCalledWith("download_count", { ascending: false });
    expect(c.eq).toHaveBeenCalledWith("category", "haccp");

    vi.clearAllMocks();
    const c2 = chain({ data: [], error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c2 } as never);
    await listResources({ category: "all" });
    expect(c2.eq).not.toHaveBeenCalledWith("category", "all");
  });

  it("returns [] when the query yields no rows", async () => {
    const c = chain({ data: null, error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);
    expect(await listResources()).toEqual([]);
  });

  // story-templates-05 AC#1: sort dropdown re-orders the grid
  it("sorts by download_count DESC when sort='popular' or omitted (AC#1 — default)", async () => {
    const c = chain({ data: [{ slug: "a" }], error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);
    await listResources({ sort: "popular" });
    expect(c.order).toHaveBeenCalledWith("download_count", { ascending: false });
  });

  it("sorts by created_at DESC when sort='recent' (AC#1 — Most recent)", async () => {
    const c = chain({ data: [{ slug: "b" }], error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);
    await listResources({ sort: "recent" });
    expect(c.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  // story-templates-05 AC#2: excludes page-count ordering (DEVIATIONS C7 — no pages column)
  it("never calls order with a 'pages' column — no such schema column (AC#2)", async () => {
    const c = chain({ data: [], error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);
    await listResources({ sort: "popular" });
    const orderSpy = c.order as ReturnType<typeof vi.fn>;
    const cols = orderSpy.mock.calls.map((args: unknown[]) => args[0] as string);
    expect(cols.includes("pages")).toBe(false);
  });

  // story-templates-05 AC#4: sort composes with category and format filters
  it("applies category + format filters together with sort (AC#4 — composes with existing filters)", async () => {
    const c = chain({ data: [{ slug: "x" }], error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);
    await listResources({ category: "sop-templates", formats: ["pdf"], sort: "recent" });
    expect(c.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(c.eq).toHaveBeenCalledWith("category", "sop-templates");
    expect(c.in).toHaveBeenCalledWith("file_type", ["pdf"]);
  });

  describe("getFeaturedTemplate (story-homepage-07)", () => {
    it("returns the single most-downloaded template", async () => {
      const c = chain({ data: [{ slug: "top", download_count: 1840 }], error: null });
      vi.mocked(createClient).mockReturnValue({ from: () => c } as never);
      const out = await getFeaturedTemplate();
      expect(out?.slug).toBe("top");
      expect(c.order).toHaveBeenCalledWith("download_count", { ascending: false });
      expect(c.limit).toHaveBeenCalledWith(1);
    });

    it("returns null when there are no resources", async () => {
      const c = chain({ data: [], error: null });
      vi.mocked(createClient).mockReturnValue({ from: () => c } as never);
      expect(await getFeaturedTemplate()).toBeNull();
    });
  });
});

describe("getResourceBySlug (blog-05/templates)", () => {
  it("returns the resource row for a slug, or null", async () => {
    const row = { slug: "haccp-team-charter", title: "Charter" };
    const c = chain({ data: row, error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);
    expect(await getResourceBySlug("haccp-team-charter")).toEqual(row);

    const c2 = chain({ data: null, error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c2 } as never);
    expect(await getResourceBySlug("missing")).toBeNull();
  });
});

describe("getTemplateCategoryCounts (templates-01)", () => {
  it("tallies templates per category plus 'all'", async () => {
    const c = chain({
      data: [{ category: "haccp" }, { category: "haccp" }, { category: "sop-templates" }],
      error: null,
    });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);
    expect(await getTemplateCategoryCounts()).toEqual({ all: 3, haccp: 2, "sop-templates": 1 });
  });
});

describe("parseWhatsIncluded (templates-02 AC#5)", () => {
  it("splits markdown bullets out, keeping the leading text as the intro", () => {
    const { intro, bullets } = parseWhatsIncluded(
      "Complete HACCP plan.\n- Hazard worksheet\n- CCP decision tree\n* Monitoring forms",
    );
    expect(intro).toBe("Complete HACCP plan.");
    expect(bullets).toEqual(["Hazard worksheet", "CCP decision tree", "Monitoring forms"]);
  });

  it("falls back to the whole description as the paragraph when there are no bullets", () => {
    const { intro, bullets } = parseWhatsIncluded("A 200-point supplier audit checklist.");
    expect(bullets).toEqual([]);
    expect(intro).toBe("A 200-point supplier audit checklist.");
  });
});

describe("getSimilarTemplates (templates-02)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns same-category templates, no fallback query when ≥ limit", async () => {
    const same = [{ slug: "b" }, { slug: "c" }, { slug: "d" }];
    const client = clientWithQueue([{ data: same, error: null }]);
    vi.mocked(createClient).mockReturnValue(client);

    const res = await getSimilarTemplates("a", "haccp", 3);
    expect(res.map((r) => r.slug)).toEqual(["b", "c", "d"]);
    expect((client as unknown as { from: ReturnType<typeof vi.fn> }).from).toHaveBeenCalledTimes(1);
  });

  it("tops up from most-downloaded overall when the category yields < limit (dedup + exclude current)", async () => {
    const same = [{ slug: "b" }];
    const overall = [{ slug: "a" }, { slug: "b" }, { slug: "x" }, { slug: "y" }];
    const client = clientWithQueue([
      { data: same, error: null },
      { data: overall, error: null },
    ]);
    vi.mocked(createClient).mockReturnValue(client);

    const res = await getSimilarTemplates("a", "haccp", 3);
    expect(res.map((r) => r.slug)).toEqual(["b", "x", "y"]);
  });
});
