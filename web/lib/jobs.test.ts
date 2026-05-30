import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase/public", () => ({ createPublicClient: vi.fn() }));

import { companyInitial, formatSalary, formatPostedDate, getSimilarJobs } from "./jobs";
import { createPublicClient as createClient } from "@/lib/supabase/public";

type ChainResult = { data: unknown; error: null };

function chain(result: ChainResult) {
  const obj: Record<string, unknown> = {};
  for (const m of ["select", "eq", "neq", "overlaps", "order", "limit"]) {
    obj[m] = vi.fn(() => obj);
  }
  (obj as { then: unknown }).then = (resolve: (r: ChainResult) => unknown) => resolve(result);
  return obj;
}

function clientWithQueue(results: ChainResult[]) {
  const chains = results.map(chain);
  let i = 0;
  return { from: vi.fn(() => chains[i++]) } as never;
}

const J = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  title: "Role",
  company_name: "Co",
  location: "Loc",
  job_type: "Full-time",
  salary_min: null,
  salary_max: null,
  experience_level: "Senior",
  skills: ["HACCP"],
  is_featured: false,
  description: "d",
  applicant_count: 0,
  created_at: "2026-01-01T00:00:00Z",
  ...extra,
});

describe("companyInitial (story-jobs-01)", () => {
  it("takes two initials from the company name", () => {
    expect(companyInitial("Amul Foods")).toBe("AF");
    expect(companyInitial("Independent")).toBe("I");
    expect(companyInitial("  ")).toBe("FN");
  });
});

describe("formatSalary (story-jobs-01)", () => {
  it("formats a range in LPA", () => {
    expect(formatSalary(1200000, 1800000)).toBe("₹12.0–18.0 LPA");
  });
  it("handles open-ended and missing ranges", () => {
    expect(formatSalary(500000, null)).toBe("From ₹5.0 LPA");
    expect(formatSalary(null, 800000)).toBe("Up to ₹8.0 LPA");
    expect(formatSalary(null, null)).toBe("Salary not disclosed");
  });
});

describe("formatPostedDate (story-jobs-10)", () => {
  it("renders relative recency, then falls back to an absolute date", () => {
    const ago = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();
    expect(formatPostedDate(ago(0))).toBe("Today");
    expect(formatPostedDate(ago(1))).toBe("Yesterday");
    expect(formatPostedDate(ago(3))).toBe("3 days ago");
    expect(formatPostedDate(ago(14))).toBe("2 weeks ago");
    expect(formatPostedDate("2020-01-15T09:00:00Z")).toMatch(/Jan 1[45]/); // absolute (TZ-tolerant)
  });
});

describe("getSimilarJobs (story-jobs-12)", () => {
  it("returns skill-overlap matches, current job excluded, capped at limit", async () => {
    const overlap = [J("b"), J("c"), J("d")];
    vi.mocked(createClient).mockReturnValue(clientWithQueue([{ data: overlap, error: null }]));

    const res = await getSimilarJobs({ id: "a", experience_level: "Senior", skills: ["HACCP"] }, 3);
    expect(res.map((j) => j.id)).toEqual(["b", "c", "d"]);
  });

  it("tops up with same experience level when skill overlap is thin (dedup + exclude current)", async () => {
    const overlap = [J("b")]; // 1 skill match
    const sameLevel = [J("a"), J("b"), J("x"), J("y")]; // current + dup + new
    vi.mocked(createClient).mockReturnValue(
      clientWithQueue([
        { data: overlap, error: null },
        { data: sameLevel, error: null },
      ]),
    );

    const res = await getSimilarJobs({ id: "a", experience_level: "Senior", skills: ["HACCP"] }, 3);
    expect(res.map((j) => j.id)).toEqual(["b", "x", "y"]);
  });

  it("returns [] (section hidden) when nothing is similar", async () => {
    vi.mocked(createClient).mockReturnValue(
      clientWithQueue([
        { data: [], error: null },
        { data: [], error: null },
      ]),
    );
    expect(await getSimilarJobs({ id: "a", experience_level: "Senior", skills: ["HACCP"] }, 3)).toEqual([]);
  });
});
