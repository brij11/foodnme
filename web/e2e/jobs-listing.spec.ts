import { test, expect } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./utils/axe";

// Public listing — 7 seeded active jobs.
test.describe("/jobs listing (story-jobs-01)", () => {
  test("renders seeded jobs with a result count; no a11y violations", async ({ page }) => {
    await page.goto("/jobs");
    await expect(page.getByRole("heading", { name: "Food-tech jobs across India" })).toBeVisible();
    await expect(page.getByTestId("result-count")).toContainText("7 jobs found");
    await expectNoSeriousA11yViolations(page);
  });

  test("job_type filter narrows the list (SSR searchParams)", async ({ page }) => {
    await page.goto("/jobs?job_type=Contract");
    await expect(page.getByTestId("result-count")).toContainText("1 job found");
    await expect(page.getByRole("heading", { name: "Compliance Consultant (Contract)" })).toBeVisible();
  });

  test("experience filter + location ILIKE", async ({ page }) => {
    await page.goto("/jobs?experience_level=Entry-level");
    await expect(page.getByRole("heading", { name: "QC Microbiologist" })).toBeVisible();
    await page.goto("/jobs?location=Bengaluru");
    await expect(page.getByRole("heading", { name: "R&D Food Technologist" })).toBeVisible();
  });

  test("free-text search matches title", async ({ page }) => {
    await page.goto("/jobs?q=Auditor");
    await expect(page.getByRole("heading", { name: "Food Safety Auditor (Third-party)" })).toBeVisible();
  });

  test("cards link to the job detail page", async ({ page }) => {
    await page.goto("/jobs?job_type=Contract");
    await expect(page.getByRole("link", { name: "View job" })).toHaveAttribute("href", /^\/jobs\/[0-9a-f-]+$/);
  });

  test("empty state with a clear CTA when nothing matches", async ({ page }) => {
    await page.goto("/jobs?location=Atlantis");
    await expect(page.getByText("No jobs match your filters")).toBeVisible();
    await expect(page.getByRole("link", { name: "Clear filters" })).toHaveAttribute("href", "/jobs");
  });
});
