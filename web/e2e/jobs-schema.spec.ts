import { test, expect } from "@playwright/test";
import { anonClient } from "./utils/supabase";

// story-jobs-09 — structured job fields are publicly readable on active jobs; RLS unchanged.
test.describe("Job structured fields (story-jobs-09)", () => {
  test("anon reads responsibilities / requirements / is_featured on active jobs (AC#1, #4)", async () => {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("title, responsibilities, requirements, is_featured")
      .eq("status", "active");

    expect(error).toBeNull();
    expect(data && data.length).toBeGreaterThan(0);
    const rows = data as {
      responsibilities: string[];
      requirements: string[];
      is_featured: boolean;
    }[];
    // Structured arrays are populated.
    expect(rows.every((r) => Array.isArray(r.responsibilities))).toBe(true);
    expect(rows.some((r) => r.responsibilities.length > 0)).toBe(true);
    expect(rows.some((r) => r.requirements.length > 0)).toBe(true);
    // At least one featured job exists for the card badge (jobs-10).
    expect(rows.some((r) => r.is_featured)).toBe(true);
  });

  test("anon cannot write a job — RLS unchanged (AC#1)", async () => {
    const supabase = anonClient();
    const before = await supabase.from("jobs").select("id").eq("status", "active").limit(1).single();
    const id = (before.data as { id: string }).id;
    const upd = await supabase.from("jobs").update({ is_featured: true }).eq("id", id).select();
    expect(upd.data ?? []).toHaveLength(0);
  });
});
