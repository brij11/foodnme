import { test, expect } from "@playwright/test";
import { ensureUser, setAdmin, deleteUserByEmail, adminClient } from "./utils/supabase";
import { signInViaUI } from "./utils/session";

const PW = "Password123";
const ADMIN = "job-approve-admin@foodnme.test";
const COMPANY = "Job Approval Co";
const LOC = "Approvaltown";

test.describe("admin approve job (story-jobs-08)", () => {
  let jobId = "";
  test.beforeAll(async () => {
    await ensureUser(ADMIN, PW, { full_name: "Job Admin", role: "employer" });
    await setAdmin(ADMIN);
    const admin = adminClient();
    await admin.from("jobs").delete().eq("company_name", COMPANY);
    const { data } = await admin
      .from("jobs")
      .insert({
        title: "Pending Reviewer Role",
        company_name: COMPANY,
        location: LOC,
        job_type: "Full-time",
        experience_level: "Mid-level",
        description: "A pending job used to exercise the admin approval endpoint end to end.",
        skills: ["QA"],
        status: "pending",
      })
      .select("id")
      .single();
    jobId = (data as { id: string }).id;
  });
  test.afterAll(async () => {
    await adminClient().from("jobs").delete().eq("company_name", COMPANY);
    await deleteUserByEmail(ADMIN);
  });

  test("pending job is hidden until an admin approves, then appears on the board", async ({ page }) => {
    await page.goto(`/jobs?location=${LOC}`, { timeout: 60000 });
    await expect(page.getByText("No jobs match your filters")).toBeVisible();

    await signInViaUI(page, ADMIN, PW);
    const res = await page.request.post(`/api/admin/jobs/${jobId}/approve`, { data: {} });
    expect(res.status()).toBe(200);

    await page.goto(`/jobs?location=${LOC}`, { timeout: 60000 });
    await expect(page.getByRole("heading", { name: "Pending Reviewer Role" })).toBeVisible();
  });

  test("a non-admin cannot approve", async ({ request }) => {
    const res = await request.post(`/api/admin/jobs/${jobId}/approve`, { data: {} });
    expect(res.status()).not.toBe(200);
  });
});
