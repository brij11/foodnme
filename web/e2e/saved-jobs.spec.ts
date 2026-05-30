import { test, expect } from "@playwright/test";
import { ensureUser, deleteUserByEmail, adminClient, anonClient } from "./utils/supabase";
import { signInViaUI } from "./utils/session";

// story-jobs-15 — saved jobs: save/unsave + persistence + seeker dashboard tab.
const SEEKER = "saved-jobs-seeker@foodnme.test";
const PW = "Password123";

let jobId = "";
let jobTitle = "";
let seekerId = "";

test.describe("Saved jobs (story-jobs-15)", () => {
  test.beforeAll(async () => {
    seekerId = await ensureUser(SEEKER, PW, { full_name: "Save Seeker", role: "seeker" });
    const { data } = await anonClient()
      .from("jobs")
      .select("id, title")
      .eq("status", "active")
      .limit(1)
      .single();
    jobId = (data as { id: string }).id;
    jobTitle = (data as { title: string }).title;
    await adminClient().from("saved_items").delete().eq("user_id", seekerId);
  });

  test.afterAll(async () => {
    await adminClient().from("saved_items").delete().eq("user_id", seekerId);
    await deleteUserByEmail(SEEKER);
  });

  test("anonymous 'Save for later' routes to login with redirect (AC#3)", async ({ page }) => {
    await page.goto(`/jobs/${jobId}`);
    await page.getByTestId("save-button").first().click();
    await expect(page).toHaveURL(new RegExp(`/login\\?redirect=%2Fjobs%2F${jobId}`));
  });

  test("seeker saves a job → shows in dashboard Saved tab + stat count; unsave removes it (AC#2,5,6,7)", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await signInViaUI(page, SEEKER, PW);
    await page.goto(`/jobs/${jobId}`);

    // Wait for the detail save control to hydrate to an interactive (unsaved) state, then save.
    const save = page.getByTestId("save-button").first();
    await expect(save).toHaveAttribute("data-state", "unsaved");
    const savedReq = page.waitForResponse(
      (r) => r.url().includes("/api/saved-items") && r.request().method() === "POST",
    );
    await save.click();
    expect((await savedReq).status()).toBe(200); // persisted before we navigate away
    await expect(save).toHaveAttribute("data-state", "saved");
    await expect(save).toContainText("Saved");

    // It persists + surfaces in the dashboard.
    await page.goto("/dashboard/seeker");
    await expect(page.getByTestId("seeker-stats")).toContainText("Saved jobs");
    await page.getByRole("button", { name: "Saved jobs" }).first().click();
    await expect(page.getByTestId("saved-job-row")).toHaveCount(1);
    await expect(page.getByRole("link", { name: jobTitle })).toBeVisible();

    // Unsave from the detail page → row disappears from the dashboard.
    await page.goto(`/jobs/${jobId}`);
    const toggle = page.getByTestId("save-button").first();
    await expect(toggle).toHaveAttribute("data-state", "saved");
    const delReq = page.waitForResponse(
      (r) => r.url().includes("/api/saved-items") && r.request().method() === "DELETE",
    );
    await toggle.click();
    expect((await delReq).status()).toBe(200);
    await expect(toggle).toHaveAttribute("data-state", "unsaved");

    await page.goto("/dashboard/seeker");
    await page.getByRole("button", { name: "Saved jobs" }).first().click();
    await expect(page.getByText("No saved jobs")).toBeVisible();
  });

  test("anon cannot read saved_items; idempotent save (AC#1, #7)", async () => {
    // Anonymous select is blocked by self-scoped RLS.
    const { data: anonRows } = await anonClient().from("saved_items").select("id");
    expect(anonRows ?? []).toHaveLength(0);

    // Saving the same job twice keeps a single row (unique upsert).
    const admin = adminClient();
    await admin.from("saved_items").delete().eq("user_id", seekerId);
    await admin.from("saved_items").insert({ user_id: seekerId, item_type: "job", item_id: jobId });
    await admin
      .from("saved_items")
      .upsert(
        { user_id: seekerId, item_type: "job", item_id: jobId },
        { onConflict: "user_id,item_type,item_id", ignoreDuplicates: true },
      );
    const { count } = await admin
      .from("saved_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", seekerId);
    expect(count).toBe(1);
  });
});
