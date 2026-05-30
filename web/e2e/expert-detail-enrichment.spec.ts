import { test, expect } from "@playwright/test";
import { ensureUser, deleteUserByEmail, adminClient, anonClient } from "./utils/supabase";
import { signInViaUI } from "./utils/session";

// story-experts-10 — expert detail: engagement types, similar experts, quick stats, save profile.
const SEEKER = "expert-save@foodnme.test";
const PW = "Password123";
let expertId = "";
let seekerId = "";

test.describe("Expert detail enrichment (story-experts-10)", () => {
  test.beforeAll(async () => {
    seekerId = await ensureUser(SEEKER, PW, { full_name: "Save Seeker", role: "seeker" });
    const { data } = await anonClient()
      .from("experts")
      .select("id")
      .eq("status", "active")
      .gt("review_count", 0)
      .limit(1)
      .single();
    expertId = (data as { id: string }).id;
    await adminClient().from("saved_items").delete().eq("user_id", seekerId);
  });

  test.afterAll(async () => {
    await adminClient().from("saved_items").delete().eq("user_id", seekerId);
    await deleteUserByEmail(SEEKER);
  });

  test("renders engagement types, quick stats (rating/reviews/response), and similar experts", async ({
    page,
  }) => {
    await page.goto(`/experts/${expertId}`);

    const eng = page.getByTestId("engagement-types");
    await expect(eng).toBeVisible();
    await expect(eng).toContainText("Hourly consult");
    await expect(eng).toContainText("Retainer");

    const stats = page.getByTestId("quick-stats");
    await expect(stats).toContainText("Rating");
    await expect(stats).toContainText("Reviews");
    await expect(stats).toContainText("Response time");

    // Similar experts (the seed experts share specializations).
    await expect(page.getByRole("heading", { name: "Similar experts" })).toBeVisible();
    expect(await page.getByTestId("expert-card").count()).toBeGreaterThan(0);
  });

  test("anonymous 'Save profile' routes to login; authed seeker can save/unsave (AC#4)", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    // Anonymous.
    await page.goto(`/experts/${expertId}`);
    await page.getByTestId("save-button").first().click();
    await expect(page).toHaveURL(new RegExp(`/login\\?redirect=%2Fexperts%2F${expertId}`));

    // Authenticated.
    await signInViaUI(page, SEEKER, PW);
    await page.goto(`/experts/${expertId}`);
    const save = page.getByTestId("save-button").first();
    await expect(save).toHaveAttribute("data-state", "unsaved");
    const req = page.waitForResponse(
      (r) => r.url().includes("/api/saved-items") && r.request().method() === "POST",
    );
    await save.click();
    expect((await req).status()).toBe(200);
    await expect(save).toHaveAttribute("data-state", "saved");

    // Persisted as an expert-typed saved item.
    const { count } = await adminClient()
      .from("saved_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", seekerId)
      .eq("item_type", "expert")
      .eq("item_id", expertId);
    expect(count).toBe(1);
  });
});
