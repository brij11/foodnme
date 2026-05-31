import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase/public", () => ({ createPublicClient: vi.fn() }));

import { expertInitials, formatHourlyRate, getFeaturedExpert, listExperts } from "./experts";
import { createPublicClient as createClient } from "@/lib/supabase/public";

type ChainResult = { data: unknown; error: null };

function chain(result: ChainResult) {
  const obj: Record<string, unknown> = {};
  for (const m of [
    "select", "eq", "neq", "order", "limit", "overlaps", "textSearch", "ilike", "in",
  ]) {
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

describe("listExperts (story-experts-12 — verified filter + sort)", () => {
  it("AC#1/DEVIATIONS A1 — applies is_featured filter when verified=true", async () => {
    const c = chain({ data: [{ id: "v1", full_name: "Expert A" }], error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);

    await listExperts({ verified: true });
    expect(c.eq).toHaveBeenCalledWith("is_featured", true);
  });

  it("AC#1 — does not call is_featured filter when verified is omitted", async () => {
    const c = chain({ data: [], error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);

    await listExperts({});
    // eq should only be called with "status"
    const calls = (c.eq as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.every((args: unknown[]) => args[0] !== "is_featured")).toBe(true);
  });

  it("AC#2/DEVIATIONS A2 — sortBy=rating orders by rating desc then is_featured desc", async () => {
    const c = chain({ data: [], error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);

    await listExperts({ sortBy: "rating" });
    expect(c.order).toHaveBeenCalledWith("rating", { ascending: false, nullsFirst: false });
    expect(c.order).toHaveBeenCalledWith("is_featured", { ascending: false });
  });

  it("AC#2 — sortBy=experience orders by experience_years desc then is_featured desc", async () => {
    const c = chain({ data: [], error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);

    await listExperts({ sortBy: "experience" });
    expect(c.order).toHaveBeenCalledWith("experience_years", { ascending: false });
    expect(c.order).toHaveBeenCalledWith("is_featured", { ascending: false });
  });

  it("defaults to rating sort when sortBy is not provided", async () => {
    const c = chain({ data: [], error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);

    await listExperts({});
    expect(c.order).toHaveBeenCalledWith("rating", { ascending: false, nullsFirst: false });
  });

  it("returns the data array on success", async () => {
    const data = [{ id: "x", full_name: "Test Expert" }];
    const c = chain({ data, error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);

    const result = await listExperts({});
    expect(result).toEqual(data);
  });

  it("returns empty array when no experts match", async () => {
    const c = chain({ data: null, error: null });
    vi.mocked(createClient).mockReturnValue({ from: () => c } as never);

    const result = await listExperts({});
    expect(result).toEqual([]);
  });
});
