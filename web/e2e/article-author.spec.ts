import { test, expect } from "@playwright/test";
import { anonClient } from "./utils/supabase";

// story-blog-06 — article authorship via experts (OQ#9). The author chip/bio card read the
// already-public `experts (status='active')` row; verify anon can read the author display fields
// (incl. the new socials) and cannot write, and that the joined author renders on the detail page.

const AUTHOR_DISPLAY_FIELDS =
  "full_name, title, avatar_url, bio, specializations, linkedin_url, twitter_url";

test.describe("Article author (story-blog-06)", () => {
  test("anon can read author display fields incl. socials from active experts (AC#3, #8)", async () => {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from("experts")
      .select(AUTHOR_DISPLAY_FIELDS)
      .eq("status", "active")
      .limit(5);

    expect(error).toBeNull();
    expect(data && data.length).toBeGreaterThan(0);
    // Every selected field is present on the row (no column-level RLS hiding socials).
    const row = data![0] as Record<string, unknown>;
    for (const field of AUTHOR_DISPLAY_FIELDS.split(",").map((f) => f.trim())) {
      expect(row).toHaveProperty(field);
    }
    // At least one seeded author exposes a LinkedIn URL for the bio card.
    const withLinkedIn = (data as { linkedin_url: string | null }[]).some((r) => r.linkedin_url);
    expect(withLinkedIn).toBe(true);
  });

  test("anon cannot write to experts — no write policy (AC#3, #8)", async () => {
    const supabase = anonClient();
    const before = await supabase
      .from("experts")
      .select("id, bio")
      .eq("status", "active")
      .limit(1)
      .single();
    expect(before.error).toBeNull();
    const id = (before.data as { id: string }).id;

    // RLS has no write policy for anon → the update silently affects zero rows.
    const upd = await supabase
      .from("experts")
      .update({ bio: "tampered-by-anon" })
      .eq("id", id)
      .select();
    expect(upd.data ?? []).toHaveLength(0);

    // Confirm the row is unchanged.
    const after = await supabase.from("experts").select("bio").eq("id", id).single();
    expect((after.data as { bio: string }).bio).not.toBe("tampered-by-anon");
  });

  test("the article detail page renders the linked expert author (AC#5)", async ({ page }) => {
    // The MDX article route can take >30s to JIT-compile on a cold dev server.
    test.setTimeout(90_000);
    await page.goto("/blog/haccp-implementation-small-food-businesses");
    await expect(
      page.getByRole("heading", { name: /A practical HACCP rollout/i }),
    ).toBeVisible();
    // Author identity comes from the joined expert (Dr. Aarti Menon), not free-text author_name.
    await expect(page.getByText("Dr. Aarti Menon").first()).toBeVisible();
  });
});
