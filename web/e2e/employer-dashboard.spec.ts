import { test, expect } from "@playwright/test";
import { ensureUser, deleteUserByEmail, adminClient } from "./utils/supabase";
import { signInViaUI } from "./utils/session";

const PW = "Password123";
const EMPLOYER = "emp-dash@foodnme.test";
const SEEKER = "emp-dash-seeker@foodnme.test";
const COMPANY = "Dashboard Test Foods";

test.describe("employer dashboard (story-jobs-04)", () => {
  test.beforeAll(async () => {
    await ensureUser(EMPLOYER, PW, { full_name: "Dash Employer", role: "employer" });
    await ensureUser(SEEKER, PW, { full_name: "Dash Seeker", role: "seeker" });
    await adminClient().from("jobs").delete().eq("company_name", COMPANY);
  });
  test.afterAll(async () => {
    await adminClient().from("jobs").delete().eq("company_name", COMPANY);
    await deleteUserByEmail(EMPLOYER);
    await deleteUserByEmail(SEEKER);
  });

  test("the Post-a-job modal opens with the schema fields", async ({ page }) => {
    await signInViaUI(page, EMPLOYER, PW);
    await page.goto("/dashboard/employer", { timeout: 60000 });
    await page.getByRole("button", { name: "Post a job" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel("Job title")).toBeVisible();
    await expect(dialog.getByLabel("Company name")).toBeVisible();
    await expect(dialog.getByLabel("Expires on")).toBeVisible();
  });

  test("create (via API) → appears Pending in the list → close it", async ({ page }) => {
    await signInViaUI(page, EMPLOYER, PW);

    // Drive POST /api/jobs with the signed-in session (local Turnstile test-secret passes any
    // token — same approach as the Sprint-1 inquiry-api E2E). Deterministic vs the live widget.
    const create = await page.request.post("/api/jobs", {
      data: {
        title: "Pilot Plant Lead",
        company_name: COMPANY,
        location: "Indore, MP",
        job_type: "Full-time",
        experience_level: "Senior",
        salary_min: 900000,
        salary_max: 1400000,
        description: "Own the pilot plant: scale-up trials, GMP, and tech-transfer for new SKUs.",
        skills: ["GMP", "Scale-up"],
        expires_at: "2027-01-01T00:00:00.000Z",
        turnstile_token: "dummy-passes-with-test-secret",
      },
      headers: { "idempotency-key": crypto.randomUUID() },
    });
    expect(create.status()).toBe(200);

    await page.goto("/dashboard/employer", { timeout: 60000 });
    await expect(page.getByText("Pilot Plant Lead")).toBeVisible({ timeout: 15000 });
    // The job's status Tag (last occurrence — the stats grid also has a "Pending review" card label,
    // story-jobs-14).
    await expect(page.getByText("Pending review").last()).toBeVisible();

    await page.getByRole("button", { name: "Close" }).first().click();
    // Assert the close took effect at the source of truth (the PATCH route's client re-render is
    // unit-tested separately; this avoids a soft-refresh timing flake).
    await expect
      .poll(
        async () => {
          const { data } = await adminClient()
            .from("jobs")
            .select("status")
            .eq("company_name", COMPANY)
            .maybeSingle();
          return (data as { status: string } | null)?.status;
        },
        { timeout: 15000 },
      )
      .toBe("closed");
  });

  test("a seeker cannot reach the employer dashboard", async ({ page }) => {
    await signInViaUI(page, SEEKER, PW);
    await page.goto("/dashboard/employer", { timeout: 60000 });
    await page.waitForURL("**/dashboard/seeker");
  });
});
