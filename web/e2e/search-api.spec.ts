import { test, expect } from "@playwright/test";

// story-search-01 — GET /api/search integration against the live FTS RPC.
type Result = { type: string; id: string; title: string; excerpt: string; url: string; rank: number };

async function search(page: import("@playwright/test").APIRequestContext, qs: string) {
  const res = await page.get(`/api/search${qs}`);
  expect(res.status()).toBe(200);
  const json = (await res.json()) as { ok: boolean; data: { results: Result[] } };
  expect(json.ok).toBe(true);
  return json.data.results;
}

test.describe("GET /api/search (story-search-01)", () => {
  test("type=all returns ranked mixed results with correct canonical urls (AC#1,3,5)", async ({
    request,
  }) => {
    const results = await search(request, "?q=haccp&type=all");
    expect(results.length).toBeGreaterThan(1);
    // Spans more than one entity type.
    expect(new Set(results.map((r) => r.type)).size).toBeGreaterThan(1);
    // Ranked descending.
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1]!.rank).toBeGreaterThanOrEqual(results[i]!.rank);
    }
    // Canonical urls per type.
    for (const r of results) {
      if (r.type === "article") expect(r.url).toMatch(/^\/blog\//);
      if (r.type === "template") expect(r.url).toMatch(/^\/templates\//);
      if (r.type === "expert") expect(r.url).toMatch(/^\/experts\//);
    }
  });

  test("type filter narrows to a single entity (AC#1,4)", async ({ request }) => {
    const experts = await search(request, "?q=auditor&type=experts");
    expect(experts.length).toBeGreaterThan(0);
    expect(experts.every((r) => r.type === "expert")).toBe(true);

    const templates = await search(request, "?q=haccp&type=templates");
    expect(templates.every((r) => r.type === "template")).toBe(true);
  });

  test("empty / too-short query returns a clean empty result, not an error (AC#2)", async ({
    request,
  }) => {
    expect(await search(request, "?q=")).toEqual([]);
    expect(await search(request, "?q=a")).toEqual([]);
  });
});
