import { test, expect } from "@playwright/test";
import { ensureUser, deleteUserByEmail, adminClient } from "./utils/supabase";
import { signInViaUI } from "./utils/session";

// story-jobs-14 — employer dashboard stats + applicant review + signed resume URLs + RLS scoping.
const PW = "Password123";
const EMP1 = "emp1-applicants@foodnme.test";
const EMP2 = "emp2-applicants@foodnme.test";
const SEEKER1 = "seeker1-applicants@foodnme.test";
const SEEKER2 = "seeker2-applicants@foodnme.test";

// Minimal valid PDF bytes.
const PDF = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");

let job1 = "";
let job2 = "";
let seeker1Id = "";
let seeker2Id = "";
let resumePath = "";

test.describe("Employer dashboard applicants (story-jobs-14)", () => {
  test.beforeAll(async () => {
    const admin = adminClient();
    const emp1 = await ensureUser(EMP1, PW, { full_name: "Employer One", role: "employer" });
    const emp2 = await ensureUser(EMP2, PW, { full_name: "Employer Two", role: "employer" });
    seeker1Id = await ensureUser(SEEKER1, PW, { full_name: "Seeker One", role: "seeker" });
    seeker2Id = await ensureUser(SEEKER2, PW, { full_name: "Seeker Two", role: "seeker" });

    await admin.from("jobs").delete().in("company_name", ["Emp1 Co", "Emp2 Co"]);
    const j1 = await admin
      .from("jobs")
      .insert({ title: "QA Lead (Emp1)", company_name: "Emp1 Co", location: "Pune", job_type: "Full-time", experience_level: "Senior", description: "x".repeat(60), skills: ["HACCP"], status: "active", employer_id: emp1, expires_at: new Date(Date.now() + 60 * 86400000).toISOString() })
      .select("id")
      .single();
    job1 = (j1.data as { id: string }).id;
    const j2 = await admin
      .from("jobs")
      .insert({ title: "QC Analyst (Emp2)", company_name: "Emp2 Co", location: "Delhi", job_type: "Full-time", experience_level: "Mid-level", description: "y".repeat(60), skills: ["QC"], status: "active", employer_id: emp2, expires_at: new Date(Date.now() + 60 * 86400000).toISOString() })
      .select("id")
      .single();
    job2 = (j2.data as { id: string }).id;

    // Upload a real resume object for seeker1 so the signed URL resolves.
    resumePath = `${seeker1Id}/resume.pdf`;
    await admin.storage.from("resumes").upload(resumePath, PDF, { contentType: "application/pdf", upsert: true });

    await admin.from("applications").insert([
      { job_id: job1, applicant_id: seeker1Id, resume_url: resumePath, status: "submitted" },
      { job_id: job2, applicant_id: seeker2Id, resume_url: null, status: "submitted" },
    ]);
  });

  test.afterAll(async () => {
    const admin = adminClient();
    await admin.from("jobs").delete().in("company_name", ["Emp1 Co", "Emp2 Co"]);
    await admin.storage.from("resumes").remove([resumePath]);
    for (const e of [EMP1, EMP2, SEEKER1, SEEKER2]) await deleteUserByEmail(e);
  });

  test("stats grid reflects the employer's own listings/applicants; time-to-hire is '—' (AC#1, #7)", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await signInViaUI(page, EMP1, PW);
    await page.goto("/dashboard/employer");
    const grid = page.getByTestId("employer-stats");
    await expect(grid).toBeVisible();
    await expect(grid).toContainText("Active listings");
    await expect(grid).toContainText("Total applicants");
    await expect(grid).toContainText("Avg. time to hire");
    await expect(grid.getByText("—")).toHaveCount(1);
  });

  test("Applicants tab shows own applicant + signed resume; never another employer's (AC#2-5)", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await signInViaUI(page, EMP1, PW);
    await page.goto("/dashboard/employer");
    await page.getByRole("button", { name: "Applicants" }).first().click();

    const rows = page.getByTestId("applicant-row");
    await expect(rows).toHaveCount(1); // only Emp1's applicant
    await expect(page.getByText("Seeker One")).toBeVisible();
    await expect(page.getByText("Seeker Two")).toHaveCount(0); // never cross-employer
    await expect(page.getByText(/QA Lead \(Emp1\) · Applied/)).toBeVisible();

    // Resume opens via a short-lived signed Storage URL (token-bearing, not a public path).
    const resume = page.getByRole("link", { name: "View resume" });
    await expect(resume).toBeVisible();
    const href = await resume.getAttribute("href");
    expect(href).toMatch(/token=/);
  });
});
