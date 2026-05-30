import { test, expect } from "@playwright/test";

// story-templates-04 — file-format (PDF/DOCX) filter on the templates listing.
const cardCount = (page: import("@playwright/test").Page) =>
  page.locator('[data-testid="template-grid"] article, article:has-text("downloads")').count();

test.describe("Templates file-format filter (story-templates-04)", () => {
  test("facet filters by format, unions multiple, round-trips via URL, and clears (AC#1-5)", async ({
    page,
  }) => {
    await page.goto("/templates");
    const facet = page.getByTestId("format-facet");
    await expect(facet).toBeVisible();
    const all = Number((await page.getByTestId("result-count").innerText()).match(/\d+/)?.[0] ?? "0");
    expect(all).toBeGreaterThan(0);

    // Select PDF → URL carries the format, count drops to PDF-only.
    await facet.getByRole("link", { name: "PDF" }).click();
    await expect(page).toHaveURL(/format=pdf/);
    const pdfOnly = Number((await page.getByTestId("result-count").innerText()).match(/\d+/)?.[0] ?? "0");
    expect(pdfOnly).toBeGreaterThan(0);
    expect(pdfOnly).toBeLessThan(all);
    await expect(page.getByTestId("result-count")).toContainText("PDF");

    // Add DOCX → union of both (URL carries both; count == all, since every template is pdf or docx).
    await page.getByTestId("format-facet").getByRole("link", { name: "DOCX" }).click();
    await expect(page).toHaveURL(/format=docx/);
    await expect(page).toHaveURL(/format=pdf/);
    const union = Number((await page.getByTestId("result-count").innerText()).match(/\d+/)?.[0] ?? "0");
    expect(union).toBe(all);

    // Refresh preserves state (server-rendered from the URL).
    await page.reload();
    await expect(page).toHaveURL(/format=pdf/);
    await expect(page).toHaveURL(/format=docx/);

    // Clear all filters → back to the full set, no format param.
    await page.getByRole("link", { name: "Clear all filters" }).click();
    await expect(page).toHaveURL(/\/templates$/);
    const cleared = Number((await page.getByTestId("result-count").innerText()).match(/\d+/)?.[0] ?? "0");
    expect(cleared).toBe(all);
  });

  test("format filter composes with the category filter (AC#3)", async ({ page }) => {
    await page.goto("/templates?category=haccp");
    await page.getByTestId("format-facet").getByRole("link", { name: "DOCX" }).click();
    // Category preserved alongside the new format param.
    await expect(page).toHaveURL(/category=haccp/);
    await expect(page).toHaveURL(/format=docx/);
  });
});
