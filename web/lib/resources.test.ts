import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/public", () => ({ createPublicClient: vi.fn() }));

import { listResources, getResourceBySlug, getTemplateCategoryCounts } from "./resources";
import { createPublicClient as createClient } from "@/lib/supabase/public";

type ChainResult = { data: unknown; error: null };

function chain(result: ChainResult) {
  const obj: Record<string, unknown> = {};
  for (const m of ["select", "eq", "order", "maybeSingle"]) {
    obj[m] = vi.fn(() => obj);
  }
  (obj as { then: unknown }).then = (resolve: (r: ChainResult) => unknown) => resolve(result);
  return obj;
}

describe("listResources (templates-01)", () => {
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
