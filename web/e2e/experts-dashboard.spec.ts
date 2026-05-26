import { test, expect } from "@playwright/test";
import { ensureUser, deleteUserByEmail, adminClient } from "./utils/supabase";
import { signInViaUI } from "./utils/session";

const PW = "Password123";
const EXPERT = "dash-expert-04@foodnme.test";
const SEEKER = "dash-seeker-04@foodnme.test";
const CONTACT = "dash-expert-04-contact@expert.test";

test.describe("expert dashboard profile (story-experts-04)", () => {
  test.beforeAll(async () => {
    await ensureUser(EXPERT, PW, { full_name: "Dash Expert", role: "expert" });
    await ensureUser(SEEKER, PW, { full_name: "Dash Seeker", role: "seeker" });
    // Clean any leftover expert row from a previous run (user_id is set null on user delete).
    await adminClient().from("experts").delete().eq("contact_email", CONTACT);
  });
  test.afterAll(async () => {
    await adminClient().from("experts").delete().eq("contact_email", CONTACT);
    await deleteUserByEmail(EXPERT);
    await deleteUserByEmail(SEEKER);
  });

  test("first visit shows the create form; submit → pending + not yet in the directory", async ({
    page,
  }) => {
    await signInViaUI(page, EXPERT, PW);
    await page.goto("/dashboard/expert");
    await expect(page.getByText("Complete your expert profile")).toBeVisible();

    // Open the profile tab and fill the create form.
    await page.getByRole("button", { name: "Create profile" }).click();
    await page.getByLabel("Title").fill("Bakery Process Consultant");
    await page.getByLabel("Location").fill("Surat, Gujarat");
    await page.getByLabel("Years experience").fill("9");
    await page.getByLabel("Hourly rate (₹)").fill("4200");
    await page.getByLabel("Contact email").fill(CONTACT);
    await page
      .getByLabel("Bio")
      .fill("Nine years optimizing bakery lines and helping mid-size processors pass audits.");
    await page.getByRole("button", { name: "HACCP", exact: true }).click();
    await page.getByLabel("Certifications").fill("BTech Food Tech, FSSAI Trainer");
    await page.getByRole("button", { name: "Submit for approval" }).click();

    // Success + the pending banner appears after the refresh.
    await expect(
      page.getByText("Your profile is awaiting founder approval", { exact: false }),
    ).toBeVisible({ timeout: 15000 });

    // Pending profiles are not shown in the public directory.
    await page.goto("/experts?location=Surat");
    await expect(page.getByText("No experts match your filters")).toBeVisible();
  });

  test("a seeker cannot reach the expert dashboard (middleware)", async ({ page }) => {
    await signInViaUI(page, SEEKER, PW);
    await page.goto("/dashboard/expert");
    await page.waitForURL("**/dashboard/seeker");
    expect(new URL(page.url()).pathname).toBe("/dashboard/seeker");
  });
});
