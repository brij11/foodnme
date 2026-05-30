import { test, expect } from "@playwright/test";
import { ensureUser, deleteUserByEmail, adminClient } from "./utils/supabase";
import { signInViaUI } from "./utils/session";

const PW = "Password123";
const SEEKER = "seeker-dash@foodnme.test";
const EMPLOYER = "seeker-dash-emp@foodnme.test";

test.describe("seeker dashboard (story-jobs-07)", () => {
  let seekerId = "";
  let jobTitle = "";

  test.beforeAll(async () => {
    seekerId = await ensureUser(SEEKER, PW, { full_name: "Track Seeker", role: "seeker" });
    await ensureUser(EMPLOYER, PW, { full_name: "Emp", role: "employer" });
    const admin = adminClient();
    const { data: job } = await admin.from("jobs").select("id, title").eq("status", "active").limit(1).single();
    jobTitle = (job as { title: string }).title;
    await admin.from("applications").delete().eq("applicant_id", seekerId);
    await admin.from("applications").insert({
      job_id: (job as { id: string }).id,
      applicant_id: seekerId,
      resume_url: "http://localhost/storage/resumes/x.pdf",
      cover_note: "Keen.",
      status: "submitted",
    });
  });
  test.afterAll(async () => {
    await adminClient().from("applications").delete().eq("applicant_id", seekerId);
    await deleteUserByEmail(SEEKER);
    await deleteUserByEmail(EMPLOYER);
  });

  test("lists the seeker's application with status + filter chips", async ({ page }) => {
    await signInViaUI(page, SEEKER, PW);
    await page.goto("/dashboard/seeker", { timeout: 60000 });
    await expect(page.getByTestId("application-row")).toHaveCount(1);
    await expect(page.getByRole("link", { name: jobTitle })).toBeVisible();
    await expect(page.getByText("Submitted").first()).toBeVisible();

    // Filtering to "Rejected" hides the submitted application (empty state).
    await page.getByRole("link", { name: "Rejected" }).click();
    await page.waitForURL("**/dashboard/seeker?status=rejected");
    await expect(page.getByText("You haven't applied to any jobs yet.")).toBeVisible();
  });

  test("an employer cannot reach the seeker dashboard", async ({ page }) => {
    await signInViaUI(page, EMPLOYER, PW);
    await page.goto("/dashboard/seeker", { timeout: 60000 });
    await page.waitForURL("**/dashboard/employer");
  });

  test("renders the stats grid: Applications total (unfiltered) + '—' for untracked metrics (story-jobs-13)", async ({
    page,
  }) => {
    await signInViaUI(page, SEEKER, PW);
    await page.goto("/dashboard/seeker", { timeout: 60000 });
    const grid = page.getByTestId("seeker-stats");
    await expect(grid).toBeVisible();
    await expect(grid).toContainText("Applications");
    await expect(grid).toContainText("1 submitted"); // the seeded application
    await expect(grid).toContainText("Saved jobs");
    await expect(grid).toContainText("Profile views");
    await expect(grid).toContainText("Match score");
    // Untracked metrics are em-dashes, never fabricated.
    await expect(grid.getByText("—")).toHaveCount(2);
  });
});
