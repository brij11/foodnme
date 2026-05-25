import { test, expect } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./utils/axe";

// Reduced motion → the §4.10 card stagger is disabled (motion-reduce:animate-none), so cards
// render at full opacity immediately. This makes assertions (and the axe contrast check)
// deterministic instead of racing the fade-up animation.
test.use({ reducedMotion: "reduce" });

test.describe("/blog listing (blog-01)", () => {
  test("renders the header, sidebar categories, and all published articles", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Food Technology Blog");
    // 9 seeded published articles (scoped to the result-count line)
    await expect(page.getByTestId("result-count")).toContainText("9 articles");
    await expect(page.getByRole("link", { name: /A practical HACCP rollout/i })).toBeVisible();
  });

  // NOTE: the s-maxage=60/stale-while-revalidate=300 CDN directive (§7) is configured in
  // next.config.mjs `headers()`. It is NOT asserted here because Next 14 forces
  // `Cache-Control: no-store` on `searchParams`-dynamic pages in `next start`/`next dev`;
  // the directive is honored at the Vercel CDN layer. Tracked as a manual/infra check.

  test("category filter via ?category= narrows results and marks the sidebar active (AC#1,4)", async ({ page }) => {
    await page.goto("/blog?category=food-safety");
    // 2 food-safety articles seeded
    await expect(page.getByTestId("result-count")).toContainText("2 articles");
    const activeLink = page
      .getByRole("navigation", { name: "Categories" })
      .getByRole("link", { name: /Food Safety/ });
    await expect(activeLink).toHaveAttribute("aria-current", "page");
  });

  test("empty category shows the three-part EmptyState, not a bare message (AC#9)", async ({ page }) => {
    await page.goto("/blog?category=does-not-exist");
    await expect(page.getByRole("heading", { name: /No articles in this category yet/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse all articles" })).toBeVisible();
  });

  test("metadata title is set (AC#11)", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveTitle(/Food Technology Blog — foodnme/);
  });

  test("mobile sidebar collapses into a bottom-sheet filter drawer (AC#3)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 720 });
    await page.goto("/blog");
    await page.getByRole("button", { name: "Filters" }).click();
    const drawer = page.getByRole("dialog", { name: "Filters" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("navigation", { name: "Categories" })).toBeVisible();
  });

  test("blog listing has no critical/serious a11y violations (§10)", async ({ page }) => {
    await page.goto("/blog");
    await expectNoSeriousA11yViolations(page);
  });
});
