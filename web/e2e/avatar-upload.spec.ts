import { test, expect } from "@playwright/test";
import { ensureUser, deleteUserByEmail, adminClient } from "./utils/supabase";
import { signInViaUI } from "./utils/session";

const PW = "Password123";
const EXPERT = "avatar-expert@foodnme.test";
const CONTACT = "avatar-expert-contact@expert.test";

// 1x1 transparent PNG.
const PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

test.describe("avatar upload (story-experts-05)", () => {
  test.beforeAll(async () => {
    await ensureUser(EXPERT, PW, { full_name: "Avatar Expert", role: "expert" });
    await adminClient().from("experts").delete().eq("contact_email", CONTACT);
  });
  test.afterAll(async () => {
    await adminClient().from("experts").delete().eq("contact_email", CONTACT);
    await deleteUserByEmail(EXPERT);
  });

  test("uploading a valid PNG stores it and shows the preview", async ({ page }) => {
    await signInViaUI(page, EXPERT, PW);
    await page.goto("/dashboard/expert");
    await page.getByRole("button", { name: "Create profile" }).click();

    await page.getByTestId("avatar-input").setInputFiles({
      name: "headshot.png",
      mimeType: "image/png",
      buffer: PNG_1x1,
    });

    // The uploader swaps the initials placeholder for an <img> pointing at the avatars bucket.
    const preview = page.locator('img[src*="/avatars/"]');
    await expect(preview).toBeVisible({ timeout: 15000 });
    await expect(preview).toHaveAttribute("src", /\/avatars\/[0-9a-f-]+\/[0-9a-f-]+\.png/);
  });
});
