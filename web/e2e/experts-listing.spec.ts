import { test, expect } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./utils/axe";

// Public listing — no auth. Runs against the 8 seeded active experts.
test.describe("/experts listing (story-experts-01)", () => {
  test("renders all active experts, featured first, with result count; no a11y violations", async ({
    page,
  }) => {
    await page.goto("/experts");
    await expect(page.getByRole("heading", { name: "Vetted food-technology experts" })).toBeVisible();
    await expect(page.getByTestId("expert-card")).toHaveCount(8);
    await expect(page.getByTestId("result-count")).toContainText("8 experts found");
    // Featured surface first → the first card carries the Verified badge.
    await expect(page.getByTestId("expert-card").first().getByText("Verified")).toBeVisible();
    await expectNoSeriousA11yViolations(page);
  });

  test("specialization filter narrows the list (array overlap, SSR searchParams)", async ({
    page,
  }) => {
    await page.goto("/experts?specialization=Dairy");
    await expect(page.getByTestId("expert-card")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "Priya Iyer" })).toBeVisible();
  });

  test("'Available now' filters out unavailable experts", async ({ page }) => {
    await page.goto("/experts?available=true");
    // Priya + Karthik are unavailable in the seed → 6 of 8 remain.
    await expect(page.getByTestId("expert-card")).toHaveCount(6);
  });

  test("free-text search matches specializations via FTS", async ({ page }) => {
    await page.goto("/experts?q=dairy");
    await expect(page.getByRole("heading", { name: "Priya Iyer" })).toBeVisible();
  });

  test("location filter (ILIKE) narrows by city", async ({ page }) => {
    await page.goto("/experts?location=Mumbai");
    await expect(page.getByTestId("expert-card")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "Dr. Aarti Menon" })).toBeVisible();
  });

  test("empty state with a clear-filters CTA when nothing matches", async ({ page }) => {
    await page.goto("/experts?location=Atlantis");
    await expect(page.getByText("No experts match your filters")).toBeVisible();
    await expect(page.getByRole("link", { name: "Clear filters" })).toHaveAttribute(
      "href",
      "/experts",
    );
  });

  test("cards link to the expert detail page", async ({ page }) => {
    await page.goto("/experts?location=Mumbai");
    await expect(page.getByRole("link", { name: "View profile" })).toHaveAttribute(
      "href",
      /^\/experts\/[0-9a-f-]+$/,
    );
  });

  test("availability dot is shown on each card", async ({ page }) => {
    await page.goto("/experts");
    await expect(page.getByTestId("availability").first()).toBeVisible();
  });
});
