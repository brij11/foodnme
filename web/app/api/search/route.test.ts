// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/search", () => ({ runSearch: vi.fn() }));

import { GET } from "./route";
import { runSearch } from "@/lib/search";

function req(qs: string) {
  return { nextUrl: new URL(`http://localhost/api/search${qs}`) } as never;
}

beforeEach(() => vi.clearAllMocks());

describe("GET /api/search (story-search-01)", () => {
  it("returns { ok, data: { results } } for a valid query (AC#1, #6)", async () => {
    const results = [
      { type: "article", id: "1", title: "HACCP", excerpt: "x", url: "/blog/haccp", rank: 0.5 },
    ];
    vi.mocked(runSearch).mockResolvedValue(results as never);

    const res = await GET(req("?q=haccp&type=articles"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { results } });
    expect(runSearch).toHaveBeenCalledWith("haccp", "articles");
  });

  it("defaults type to 'all' and returns a clean empty result for an empty query (AC#2)", async () => {
    vi.mocked(runSearch).mockResolvedValue([] as never);
    const res = await GET(req("?q="));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { results: [] } });
    expect(runSearch).toHaveBeenCalledWith("", "all");
  });

  it("rejects an unknown type with 400 (AC#2)", async () => {
    const res = await GET(req("?q=haccp&type=gadgets"));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("invalid_query");
    expect(runSearch).not.toHaveBeenCalled();
  });
});
