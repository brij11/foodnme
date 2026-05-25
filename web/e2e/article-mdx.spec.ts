import { test, expect } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./utils/axe";

test.use({ reducedMotion: "reduce" });

// The seeded HACCP article exercises every custom MDX component + a code block (blog-03 AC#7).
const SLUG = "haccp-implementation-small-food-businesses";

test.describe("MDX rendering (blog-03)", () => {
  test("renders PullQuote, CTABox, inline Tag, and shiki-highlighted code", async ({ page }) => {
    await page.goto(`/blog/${SLUG}`);

    // PullQuote (AC#2)
    await expect(page.getByText(/A defensible HACCP plan is short/i)).toBeVisible();

    // CTABox (AC#3) → links to the template
    await expect(page.getByRole("link", { name: "Download template" })).toHaveAttribute(
      "href",
      "/templates/haccp-plan-template-dairy",
    );

    // inline Tag (AC#4)
    await expect(page.getByText("CCP", { exact: true })).toBeVisible();

    // shiki build-time highlighting (AC#5): a <pre class="shiki"> with colored spans
    const pre = page.locator("pre.shiki");
    await expect(pre).toBeVisible();
    await expect(pre).toContainText("function f0");
    // shiki applies inline color styles (zero runtime JS)
    expect(await pre.getAttribute("style")).toBeTruthy();
  });

  test("MDX article page has no critical/serious a11y violations (§10)", async ({ page }) => {
    await page.goto(`/blog/${SLUG}`);
    await expectNoSeriousA11yViolations(page);
  });
});
