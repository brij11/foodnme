import { test, expect } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./utils/axe";

test.use({ reducedMotion: "reduce" });

const SLUG = "haccp-implementation-small-food-businesses";

test.describe("/blog/[slug] article detail (blog-02)", () => {
  test("renders breadcrumb, single Fraunces H1, tags row, and newsletter", async ({ page }) => {
    await page.goto(`/blog/${SLUG}`);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/practical HACCP rollout/i);
    // exactly one H1 (Fraunces hero rule)
    expect(await page.getByRole("heading", { level: 1 }).count()).toBe(1);

    // breadcrumb with linked category segment
    const crumb = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(crumb.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
    await expect(crumb.getByRole("link", { name: "Food Safety" })).toHaveAttribute(
      "href",
      "/blog/category/food-safety",
    );

    // keyword tags + newsletter present
    await expect(page.getByText("HACCP", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /subscribe/i }).first()).toBeVisible();
  });

  test("metadata title reflects the article (AC#10 SEO)", async ({ page }) => {
    await page.goto(`/blog/${SLUG}`);
    await expect(page).toHaveTitle(/practical HACCP rollout.*foodnme/i);
  });

  test("unknown slug returns 404 (AC#11)", async ({ page }) => {
    const res = await page.goto("/blog/this-slug-does-not-exist");
    expect(res?.status()).toBe(404);
  });

  test("article detail has no critical/serious a11y violations (§10)", async ({ page }) => {
    await page.goto(`/blog/${SLUG}`);
    await expectNoSeriousA11yViolations(page);
  });
});
