import { test, expect } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./utils/axe";

test.use({ reducedMotion: "reduce" });

// The HACCP article has related_resource_slug = 'haccp-team-charter' (set in seed.sql, blog-05).
const WITH_CTA = "haccp-implementation-small-food-businesses";
// An article with related_resource_slug = NULL → no structured CTA box.
const NO_CTA = "fssai-licensing-changes-2026";

test.describe("in-article template CTA + related articles (blog-05)", () => {
  test("renders the structured CTA box linking to the resolved template (AC#1, AC#2)", async ({ page }) => {
    await page.goto(`/blog/${WITH_CTA}`);

    const cta = page.getByRole("link", { name: "Get the template" });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/templates/haccp-team-charter");
    // copy = the resolved resource title
    await expect(page.getByRole("heading", { name: "HACCP Team Charter & Roles Template" })).toBeVisible();
  });

  test("omits the CTA box entirely when related_resource_slug is null (AC#1)", async ({ page }) => {
    await page.goto(`/blog/${NO_CTA}`);
    await expect(page.getByRole("link", { name: "Get the template" })).toHaveCount(0);
  });

  test("'You might also like' shows 3 related ArticleCards with lazy covers (AC#3, AC#6, AC#7)", async ({ page }) => {
    await page.goto(`/blog/${WITH_CTA}`);

    await expect(page.getByRole("heading", { name: "You might also like" })).toBeVisible();

    const section = page.locator('section[aria-labelledby="related-heading"]');
    const cards = section.locator('a[href^="/blog/"]');
    await expect(cards).toHaveCount(3);

    // AC#4: the current article never appears among the related cards
    await expect(section.locator(`a[href="/blog/${WITH_CTA}"]`)).toHaveCount(0);

    // AC#7: related cover images lazy-load below the fold (next/image, no priority)
    await expect(section.locator("img").first()).toHaveAttribute("loading", "lazy");
  });

  test("article detail with related sections has no critical/serious a11y violations (§10)", async ({ page }) => {
    await page.goto(`/blog/${WITH_CTA}`);
    await expectNoSeriousA11yViolations(page);
  });
});
