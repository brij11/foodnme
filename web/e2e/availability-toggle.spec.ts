import { test, expect } from "@playwright/test";
import { ensureUser, deleteUserByEmail, adminClient } from "./utils/supabase";
import { signInViaUI } from "./utils/session";

const PW = "Password123";
const EXPERT = "avail-expert@foodnme.test";
const CONTACT = "avail-expert-contact@expert.test";

test.describe("availability toggle (story-experts-06)", () => {
  let userId = "";

  test.beforeAll(async () => {
    userId = await ensureUser(EXPERT, PW, { full_name: "Avail Expert", role: "expert" });
    const admin = adminClient();
    await admin.from("experts").delete().eq("contact_email", CONTACT);
    await admin.from("experts").insert({
      user_id: userId,
      full_name: "Avail Expert",
      title: "Process Consultant",
      bio: "Active expert used to exercise the availability toggle end to end.",
      specializations: ["HACCP"],
      experience_years: 6,
      hourly_rate: 4000,
      certifications: [],
      location: "Pune, India",
      contact_email: CONTACT,
      status: "active",
      is_available: true,
    });
  });
  test.afterAll(async () => {
    await adminClient().from("experts").delete().eq("contact_email", CONTACT);
    await deleteUserByEmail(EXPERT);
  });

  test("expert toggles availability off; the change persists", async ({ page }) => {
    await signInViaUI(page, EXPERT, PW);
    await page.goto("/dashboard/expert");
    await page.getByRole("button", { name: "Availability" }).click();

    const sw = page.getByRole("switch", { name: "Available for work" });
    await expect(sw).toHaveAttribute("aria-checked", "true");
    await sw.click();
    await expect(sw).toHaveAttribute("aria-checked", "false");

    // Persisted in the DB.
    const { data } = await adminClient()
      .from("experts")
      .select("is_available")
      .eq("contact_email", CONTACT)
      .single();
    expect((data as { is_available: boolean }).is_available).toBe(false);
  });
});
