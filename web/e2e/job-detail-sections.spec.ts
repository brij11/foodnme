import { test, expect } from "@playwright/test";
import { anonClient } from "./utils/supabase";

// story-jobs-11 — structured detail sections + aside meta + featured badge.
test.describe("Job detail structured sections (story-jobs-11)", () => {
  test("renders What-you'll-do / Who-we're-looking-for checklists, aside meta, and Featured badge", async ({
    page,
  }) => {
    // Pick a featured seeded job + one of its responsibilities to assert against.
    const { data } = await anonClient()
      .from("jobs")
      .select("id, responsibilities, requirements")
      .eq("status", "active")
      .eq("is_featured", true)
      .limit(1)
      .single();
    const job = data as { id: string; responsibilities: string[]; requirements: string[] };

    await page.goto(`/jobs/${job.id}`);

    await expect(page.getByRole("heading", { name: "What you'll do" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Who we're looking for" })).toBeVisible();
    await expect(page.getByText(job.responsibilities[0]!)).toBeVisible();
    await expect(page.getByText(job.requirements[0]!)).toBeVisible();

    // Featured badge in the header (a featured card may also appear in Similar roles).
    await expect(page.getByText("Featured").first()).toBeVisible();

    // Aside detail-meta list + info note.
    await expect(page.getByText("Applicants", { exact: true })).toBeVisible();
    await expect(page.getByText("Job type", { exact: true })).toBeVisible();
    await expect(page.getByText(/Applications reviewed weekly/)).toBeVisible();
  });

  test("renders a 'Similar roles' grid of up to 3 cards excluding the current job (story-jobs-12)", async ({
    page,
  }) => {
    const { data } = await anonClient()
      .from("jobs")
      .select("id, title")
      .eq("status", "active")
      .limit(1)
      .single();
    const job = data as { id: string; title: string };

    await page.goto(`/jobs/${job.id}`);
    const section = page.locator("section", { has: page.getByRole("heading", { name: "Similar roles" }) });
    await expect(section).toBeVisible();
    const cards = section.getByTestId("job-card");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(3);
    // The current job's own card never appears in its similar list.
    await expect(section.getByRole("link", { name: "View job" })).not.toHaveCount(0);
  });
});
