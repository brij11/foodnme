import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase/public", () => ({ createPublicClient: vi.fn() }));

import { expertInitials, formatHourlyRate, getFeaturedExpert } from "./experts";
import { createPublicClient as createClient } from "@/lib/supabase/public";

type ChainResult = { data: unknown; error: null };

function chain(result: ChainResult) {
  const obj: Record<string, unknown> = {};
  for (const m of ["select", "eq", "order", "limit"]) {
    obj[m] = vi.fn(() => obj);
  }
  (obj as { then: unknown }).then = (resolve: (r: ChainResult) => unknown) => resolve(result);
  return obj;
}

describe("expertInitials (story-experts-01)", () => {
  it("takes two initials, skipping an honorific", () => {
    expect(expertInitials("Dr. Aarti Menon")).toBe("AM");
    expect(expertInitials("Vikram Shah")).toBe("VS");
    expect(expertInitials("Karthik Subramanian")).toBe("KS");
  });

  it("handles a single name and falls back to FN when empty", () => {
    expect(expertInitials("Aarti")).toBe("A");
    expect(expertInitials("   ")).toBe("FN");
  });
});

describe("formatHourlyRate (story-experts-01)", () => {
  it("formats an integer rate in Indian grouping", () => {
    expect(formatHourlyRate(6000)).toBe("₹6,000/hr");
    expect(formatHourlyRate(450000)).toBe("₹4,50,000/hr");
  });

  it("renders a fallback when the rate is unset", () => {
    expect(formatHourlyRate(null)).toBe("Rate on request");
  });
});

describe("getFeaturedExpert (story-homepage-07)", () => {
  it("queries active experts, featured-first then newest, limit 1", async () => {
    const c = chain({ data: [{ id: "x", full_name: "Dr. Aarti Menon" }], error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);

    const out = await getFeaturedExpert();
    expect(out?.id).toBe("x");
    expect(c.eq).toHaveBeenCalledWith("status", "active");
    expect(c.order).toHaveBeenCalledWith("is_featured", { ascending: false });
    expect(c.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(c.limit).toHaveBeenCalledWith(1);
  });

  it("returns null when no active expert exists (caller renders the §5.4 stub)", async () => {
    const c = chain({ data: [], error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);
    expect(await getFeaturedExpert()).toBeNull();
  });
});
