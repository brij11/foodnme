import { test, expect } from "@playwright/test";
import { anonClient, adminClient } from "./utils/supabase";

// story-experts-08 — ratings / reviews / engagement-types stored directly on `experts`.
// Verifies the new fields are publicly readable, RLS still blocks writes, and the
// engagement_types CHECK rejects malformed shapes.

test.describe("Expert ratings & engagement schema (story-experts-08)", () => {
  test("anon reads rating / review_count / response_time / engagement_types on active experts (AC#5, #6)", async () => {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from("experts")
      .select("rating, review_count, response_time, engagement_types")
      .eq("status", "active")
      .gt("review_count", 0)
      .limit(3);

    expect(error).toBeNull();
    expect(data && data.length).toBeGreaterThan(0);

    const row = data![0] as {
      rating: number;
      review_count: number;
      response_time: string | null;
      engagement_types: { kind: string; title: string; desc: string; price: string }[];
    };
    // rating is one-decimal 0–5, stored directly.
    expect(row.rating).toBeGreaterThanOrEqual(0);
    expect(row.rating).toBeLessThanOrEqual(5);
    expect(row.review_count).toBeGreaterThan(0);
    // engagement_types is a jsonb array of the {kind,title,desc,price} shape.
    expect(Array.isArray(row.engagement_types)).toBe(true);
    const kinds = row.engagement_types.map((e) => e.kind);
    expect(kinds).toEqual(expect.arrayContaining(["hourly", "project", "retainer"]));
    for (const e of row.engagement_types) {
      expect(["hourly", "project", "retainer"]).toContain(e.kind);
      expect(typeof e.price).toBe("string");
      expect(typeof e.title).toBe("string");
    }
  });

  test("anon cannot write the rating — RLS unchanged (AC#1, #6)", async () => {
    const supabase = anonClient();
    const before = await supabase
      .from("experts")
      .select("id, rating")
      .eq("status", "active")
      .limit(1)
      .single();
    expect(before.error).toBeNull();
    const id = (before.data as { id: string }).id;

    const upd = await supabase.from("experts").update({ rating: 1.0 }).eq("id", id).select();
    expect(upd.data ?? []).toHaveLength(0);
  });

  test("engagement_types CHECK rejects a malformed shape (AC#3)", async () => {
    const admin = adminClient();
    const email = "experts08-check@expert.foodnme.test";
    // clean any leftover from a previous run
    await admin.from("experts").delete().eq("contact_email", email);

    const bad = await admin.from("experts").insert({
      full_name: "Bad Engagement Expert",
      contact_email: email,
      status: "active",
      // 'kind' not in the allowed set → must be rejected by experts_engagement_types_valid.
      engagement_types: [{ kind: "bogus", title: "x", desc: "y", price: "z" }],
    });
    expect(bad.error).not.toBeNull();

    // A well-formed shape inserts fine, then clean up.
    const good = await admin.from("experts").insert({
      full_name: "Good Engagement Expert",
      contact_email: email,
      status: "active",
      engagement_types: [
        { kind: "hourly", title: "Hourly consult", desc: "calls", price: "₹5,000/hr" },
      ],
    });
    expect(good.error).toBeNull();
    await admin.from("experts").delete().eq("contact_email", email);
  });

  test("expert cards on /experts surface the rating + bio (story-experts-09)", async ({ page }) => {
    await page.goto("/experts");
    const card = page.getByTestId("expert-card").first();
    await expect(card).toBeVisible();
    // rating chip renders a numeric rating (e.g. 4.9) and a review count.
    const rating = card.getByTestId("rating");
    await expect(rating).toBeVisible();
    await expect(rating).toContainText(/\d\.\d|New/);
  });
});
