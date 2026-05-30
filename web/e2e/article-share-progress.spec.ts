import { test, expect } from "@playwright/test";

// story-blog-08 (share row) + story-blog-09 (reading-progress bar) on the article detail page.
const ARTICLE = "/blog/haccp-implementation-small-food-businesses";

test.describe("Article share row + reading progress (blog-08, blog-09)", () => {
  test("share row renders with correct new-tab share intents (blog-08 AC#1, #3)", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(ARTICLE);
    await expect(page.getByText("Share this article:")).toBeVisible();

    const linkedin = page.getByRole("link", { name: "Share on LinkedIn" });
    await expect(linkedin).toBeVisible();
    await expect(linkedin).toHaveAttribute(
      "href",
      /linkedin\.com\/sharing\/share-offsite\/\?url=/,
    );
    await expect(linkedin).toHaveAttribute("target", "_blank");
    await expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");

    await expect(page.getByRole("link", { name: "Share on Twitter" })).toHaveAttribute(
      "href",
      /twitter\.com\/intent\/tweet\?url=/,
    );
    await expect(page.getByRole("link", { name: "Share by email" })).toHaveAttribute(
      "href",
      /^mailto:\?subject=/,
    );
    await expect(page.getByRole("button", { name: "Copy link to this article" })).toBeVisible();
  });

  test("reading-progress variable advances as the article is scrolled (blog-09 AC#1, #2)", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.goto(ARTICLE);

    // Wait for the client island to hydrate and set the variable (it initializes to 0%).
    await page.waitForFunction(
      () =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--reading-progress")
          .trim() !== "",
    );
    const atTop = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--reading-progress").trim(),
    );
    expect(atTop).toBe("0%");

    // Scroll the window to the bottom; progress should climb above 0%.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForFunction(
      () => {
        const v = getComputedStyle(document.documentElement)
          .getPropertyValue("--reading-progress")
          .trim();
        return v.endsWith("%") && Number.parseInt(v, 10) > 0;
      },
      { timeout: 5000 },
    );
    const pct = Number.parseInt(
      await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue("--reading-progress").trim(),
      ),
      10,
    );
    expect(pct).toBeGreaterThan(0);
  });
});
