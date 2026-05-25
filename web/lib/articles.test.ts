import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/public", () => ({ createPublicClient: vi.fn() }));

import { listArticles, getCategoryCounts, clampPage, parseSort } from "./articles";
import { createPublicClient as createClient } from "@/lib/supabase/public";

type ChainResult = { data: unknown; count?: number; error: null };

function chain(result: ChainResult) {
  const obj: Record<string, unknown> = {};
  for (const m of ["select", "eq", "order", "range"]) {
    obj[m] = vi.fn(() => obj);
  }
  (obj as { then: unknown }).then = (resolve: (r: ChainResult) => unknown) => resolve(result);
  return obj;
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
