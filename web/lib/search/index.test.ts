import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase/public", () => ({ createPublicClient: vi.fn() }));

import { runSearch } from "./index";
import { createPublicClient as createClient } from "@/lib/supabase/public";

describe("runSearch (story-search-01)", () => {
  it("short-circuits a too-short query to [] without hitting the DB", async () => {
    const rpc = vi.fn();
    vi.mocked(createClient).mockReturnValue({ rpc } as never);
    expect(await runSearch("a", "all")).toEqual([]);
    expect(await runSearch("   ", "all")).toEqual([]);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("calls the search_all RPC with the query + type and returns rows", async () => {
    const rows = [{ type: "article", id: "1", title: "HACCP", excerpt: "x", url: "/blog/haccp", rank: 0.4 }];
    const rpc = vi.fn().mockResolvedValue({ data: rows, error: null });
    vi.mocked(createClient).mockReturnValue({ rpc } as never);

    const res = await runSearch("haccp", "articles");
    expect(rpc).toHaveBeenCalledWith("search_all", { p_query: "haccp", p_type: "articles" });
    expect(res).toEqual(rows);
  });

  it("throws on an RPC error", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } });
    vi.mocked(createClient).mockReturnValue({ rpc } as never);
    await expect(runSearch("haccp", "all")).rejects.toThrow(/search failed/);
  });
});
