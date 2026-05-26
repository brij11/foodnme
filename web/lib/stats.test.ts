import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase/service", () => ({ createServiceClient: vi.fn() }));

import { getSiteStats } from "./stats";
import { createServiceClient } from "@/lib/supabase/service";

type Result = { count?: number; data?: unknown };

function chain(result: Result) {
  const obj: Record<string, unknown> = {};
  for (const m of ["select", "eq"]) obj[m] = vi.fn(() => obj);
  (obj as { then: unknown }).then = (resolve: (r: Result) => unknown) => resolve(result);
  return obj;
}

/** Resolves successive `.from()` calls with the queued results, in order. */
function clientWithQueue(results: Result[]) {
  const chains = results.map(chain);
  let i = 0;
  return { from: vi.fn(() => chains[i++]) } as never;
}

describe("getSiteStats (story-homepage-05/06)", () => {
  it("maps counts and de-duplicates category/company sets", async () => {
    vi.mocked(createServiceClient).mockReturnValue(
      clientWithQueue([
        { count: 120 }, // articles published
        { count: 48 }, // resources
        { count: 4200 }, // active subscribers
        { count: 85 }, // service_inquiries
        { data: [{ category: "food-safety" }, { category: "qc" }, { category: "qc" }] }, // 2 distinct
        {
          data: [
            { company_name: "Acme" },
            { company_name: "Acme" },
            { company_name: "Beta" },
            { company_name: null },
            { company_name: "  " },
          ],
        }, // 2 distinct non-blank
      ]),
    );

    const stats = await getSiteStats();

    expect(stats).toEqual({
      articles: 120,
      templates: 48,
      subscribers: 4200,
      consultations: 85,
      categories: 2,
      businesses: 2,
    });
  });

  it("defaults missing counts to 0", async () => {
    vi.mocked(createServiceClient).mockReturnValue(
      clientWithQueue([{}, {}, {}, {}, { data: [] }, { data: [] }]),
    );
    const stats = await getSiteStats();
    expect(stats).toEqual({
      articles: 0,
      templates: 0,
      subscribers: 0,
      consultations: 0,
      categories: 0,
      businesses: 0,
    });
  });
});
