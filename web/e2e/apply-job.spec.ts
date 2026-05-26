import { test, expect } from "@playwright/test";
import { ensureUser, deleteUserByEmail, adminClient } from "./utils/supabase";
import { signInViaUI } from "./utils/session";

const PW = "Password123";
const SEEKER = "apply-seeker@foodnme.test";
const PDF = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\n%%EOF\n");

test.describe("apply to a job (story-jobs-05 + jobs-06)", () => {
  let seekerId = "";
  let jobId = "";

  test.beforeAll(async () => {
    seekerId = await ensureUser(SEEKER, PW, { full_name: "Apply Seeker", role: "seeker" });
    const { data } = await adminClient()
      .from("jobs")
      .select("id")
      .eq("status", "active")
      .limit(1)
      .single();
    jobId = (data as { id: string }).id;
  });
  test.afterAll(async () => {
    await adminClient().from("applications").delete().eq("applicant_id", seekerId);
    await deleteUserByEmail(SEEKER);
  });

  test("the apply modal opens with resume + cover-note fields", async ({ page }) => {
    await signInViaUI(page, SEEKER, PW);
    await page.goto(`/jobs/${jobId}`, { timeout: 60000 });
    await page.getByRole("button", { name: "Apply now" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByTestId("resume-input")).toBeVisible();
    await expect(dialog.getByLabel("Cover note")).toBeVisible();
  });

  test("upload resume + submit → recorded; re-apply blocked (UI + 409)", async ({ page }) => {
    await signInViaUI(page, SEEKER, PW);

    // Step 1: upload the resume (seeker session cookies; local Turnstile not needed for upload).
    const up = await page.request.post("/api/upload", {
      multipart: { kind: "resume", file: { name: "resume.pdf", mimeType: "application/pdf", buffer: PDF } },
    });
    expect(up.status()).toBe(200);
    const resumeUrl = (await up.json()).data.url as string;

    // Step 2: record the application (local Turnstile test-secret passes any token).
    const apply = await page.request.post("/api/applications", {
      data: { job_id: jobId, resume_url: resumeUrl, cover_note: "Keen.", turnstile_token: "dummy-passes" },
      headers: { "idempotency-key": crypto.randomUUID() },
    });
    expect(apply.status()).toBe(200);

    // Duplicate-apply guard on the detail page.
    await page.goto(`/jobs/${jobId}`, { timeout: 60000 });
    await expect(page.getByText("You've applied to this role")).toBeVisible({ timeout: 15000 });

    // And the API rejects a duplicate.
    const dup = await page.request.post("/api/applications", {
      data: { job_id: jobId, resume_url: resumeUrl, cover_note: "again", turnstile_token: "dummy-passes" },
    });
    expect(dup.status()).toBe(409);
  });
});
