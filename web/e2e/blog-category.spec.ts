import { test, expect } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./utils/axe";

test.use({ reducedMotion: "reduce" });

test.describe("/blog/category/[category] (blog-04)", () => {
  test("shows only the category's articles, category H1, breadcrumb, active sidebar", async ({ page }) => {
    await page.goto("/blog/category/food-safety");

    // AC#2 H1 "{Label} Articles"
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Food Safety Articles");
    // AC#1 only food-safety articles (2 seeded)
    await expect(page.getByTestId("result-count")).toContainText("2 articles");

    // AC#4 breadcrumb Home › Blog › Food Safety (current)
    const crumb = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(crumb.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
    await expect(crumb.getByText("Food Safety")).toHaveAttribute("aria-current", "page");

    // AC#3 active category in sidebar
    await expect(
      page.getByRole("navigation", { name: "Categories" }).getByRole("link", { name: /Food Safety/ }),
    ).toHaveAttribute("aria-current", "page");

    // AC#7 cards link to /blog/[slug]
    await expect(
      page.getByRole("link", { name: /A practical HACCP rollout/i }),
    ).toHaveAttribute("href", "/blog/haccp-implementation-small-food-businesses");
  });

  test("category metadata title (AC#9)", async ({ page }) => {
    await page.goto("/blog/category/regulatory");
    await expect(page).toHaveTitle(/Regulatory Articles — foodnme/);
  });

  test("unknown category 404s (SSG, dynamicParams=false) (AC#6)", async ({ page }) => {
    const res = await page.goto("/blog/category/not-a-real-category");
    expect(res?.status()).toBe(404);
  });

  test("category page has no critical/serious a11y violations (§10)", async ({ page }) => {
    await page.goto("/blog/category/food-safety");
    await expectNoSeriousA11yViolations(page);
  });
});
