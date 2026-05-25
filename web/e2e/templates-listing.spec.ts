import { test, expect } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./utils/axe";

test.use({ reducedMotion: "reduce" });

test.describe("/templates listing (templates-01)", () => {
  test("sidebar categories with counts + result count + cards link to detail (AC#2, AC#4, AC#6)", async ({ page }) => {
    await page.goto("/templates");

    // 9 seeded templates
    await expect(page.getByTestId("result-count")).toContainText("9 templates");

    // sidebar categories (§3.5)
    const cats = page.getByRole("navigation", { name: "Categories" });
    for (const label of ["All", "HACCP", "Audit Checklists", "SOP Templates", "QC Inspection", "Compliance Docs"]) {
      await expect(cats.getByRole("link", { name: new RegExp(label) })).toBeVisible();
    }
    // search input present
    await expect(page.getByRole("searchbox", { name: /Search templates/i })).toBeVisible();

    // whole-card link → detail
    await expect(page.getByRole("link", { name: /View HACCP Plan Template — Dairy Processing/ })).toHaveAttribute(
      "href",
      "/templates/haccp-plan-template-dairy",
    );
    // footer downloads + no "Free" badge anywhere (AC#7)
    await expect(page.getByText("1,840 downloads")).toBeVisible();
    await expect(page.getByText(/^Free$/i)).toHaveCount(0);
  });

  test("file-format badge reflects resources.file_type (AC#5)", async ({ page }) => {
    await page.goto("/templates");
    // the seed has both docx and pdf templates
    await expect(page.getByText("DOCX").first()).toBeVisible();
    await expect(page.getByText("PDF").first()).toBeVisible();
  });

  test("category filter narrows the list (AC#1 SSR searchParams)", async ({ page }) => {
    await page.goto("/templates?category=haccp");
    // HACCP has 2 seeded templates
    await expect(page.getByTestId("result-count")).toContainText("2 templates");
    await expect(page.getByTestId("result-count")).toContainText("HACCP");
  });

  test("download icon-button POSTs to /api/download with the template id (AC#8)", async ({ page }) => {
    await page.goto("/templates");

    let posted: { url: string; body: unknown } | null = null;
    await page.route("**/api/download", async (route) => {
      posted = { url: route.request().url(), body: route.request().postDataJSON() };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, data: { download_url: "about:blank" } }),
      });
    });

    await page.getByRole("button", { name: /Download HACCP Plan Template — Dairy Processing/ }).click();
    await expect.poll(() => posted).not.toBeNull();
    expect(posted!.url).toContain("/api/download");
    expect((posted!.body as { template_id?: string }).template_id).toBeTruthy();
  });

  test("empty state for a category with no matches (AC#9)", async ({ page }) => {
    await page.goto("/templates?category=does-not-exist");
    await expect(page.getByRole("heading", { name: /No templates match your filters/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Clear filters" })).toBeVisible();
  });

  test("mobile sidebar collapses into a bottom-sheet filter drawer (AC#3)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 720 });
    await page.goto("/templates");
    await page.getByRole("button", { name: "Filters" }).click();
    const drawer = page.getByRole("dialog", { name: "Filters" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("navigation", { name: "Categories" })).toBeVisible();
  });

  test("templates listing has no critical/serious a11y violations (§10)", async ({ page }) => {
    await page.goto("/templates");
    await expectNoSeriousA11yViolations(page);
  });
});
