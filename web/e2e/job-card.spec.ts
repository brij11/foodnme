import { test, expect } from "@playwright/test";
import { ensureUser, deleteUserByEmail, adminClient } from "./utils/supabase";

// story-jobs-10 — enriched job card + the applicant_count trigger (story-jobs-10 migration).
const SEEKER = "jobcard-seeker@foodnme.test";
const PW = "Password123";

test.describe("Job card enrichment (story-jobs-10)", () => {
  test("listing cards show the Featured badge, posted date, applicant count, and experience level", async ({
    page,
  }) => {
    await page.goto("/jobs");
    const cards = page.getByTestId("job-card");
    await expect(cards.first()).toBeVisible();
    // A featured seed job (QA Manager / Regulatory) renders the badge.
    await expect(page.getByText("Featured").first()).toBeVisible();
    // Each card carries a posted-date · applicant-count meta line and an experience level.
    await expect(page.getByTestId("job-meta").first()).toContainText("applicant");
    await expect(page.getByText("Senior").first()).toBeVisible();
  });

  test("applicant_count is maintained by the trigger on application insert/delete (AC#1, #5)", async () => {
    const admin = adminClient();
    const uid = await ensureUser(SEEKER, PW, { full_name: "Card Seeker", role: "seeker" });

    const { data: job } = await admin
      .from("jobs")
      .select("id, applicant_count")
      .eq("status", "active")
      .limit(1)
      .single();
    const jobId = (job as { id: string }).id;
    const before = (job as { applicant_count: number }).applicant_count;

    await admin.from("applications").insert({ job_id: jobId, applicant_id: uid });
    const afterInsert = await admin.from("jobs").select("applicant_count").eq("id", jobId).single();
    expect((afterInsert.data as { applicant_count: number }).applicant_count).toBe(before + 1);

    await admin.from("applications").delete().eq("job_id", jobId).eq("applicant_id", uid);
    const afterDelete = await admin.from("jobs").select("applicant_count").eq("id", jobId).single();
    expect((afterDelete.data as { applicant_count: number }).applicant_count).toBe(before);

    await deleteUserByEmail(SEEKER);
  });
});
