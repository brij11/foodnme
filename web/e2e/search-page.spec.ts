import { test, expect } from "@playwright/test";

// story-search-02 — the /search results page.
test.describe("/search results page (story-search-02)", () => {
  test("renders ranked results reusing listing cards + result count (AC#1,2,4)", async ({ page }) => {
    await page.goto("/search?q=haccp&type=all");
    await expect(page.getByRole("heading", { name: "Search", level: 1 })).toBeVisible();
    await expect(page.getByTestId("result-count")).toContainText("results for");
    const grid = page.getByTestId("search-results");
    await expect(grid).toBeVisible();
    // Cards (article/template/expert) are reused — at least one card with a link renders.
    expect(await grid.getByRole("link").count()).toBeGreaterThan(0);
    // Query echoed in the search box.
    await expect(page.getByRole("searchbox")).toHaveValue("haccp");
  });

  test("type facet updates results and is reflected in the URL (AC#3)", async ({ page }) => {
    await page.goto("/search?q=haccp&type=all");
    // Target the facet (not the navbar "Templates" link) by its href.
    await page.locator('a[href="/search?q=haccp&type=templates"]').click();
    await expect(page).toHaveURL(/\/search\?q=haccp&type=templates/);
    await expect(page.getByTestId("search-results")).toBeVisible();
  });

  test("empty query shows the three-part empty state, not a 404 (AC#1,4)", async ({ page }) => {
    const res = await page.goto("/search?q=");
    expect(res?.status()).toBe(200);
    await expect(page.getByText("Search foodnme")).toBeVisible();
    // A no-match query also empties cleanly.
    await page.goto("/search?q=zzzznotathing&type=all");
    await expect(page.getByText(/No results for/)).toBeVisible();
  });

  test("blog + templates sidebars submit to /search with the right type prefilled (AC#5)", async ({
    page,
  }) => {
    await page.goto("/blog");
    await page.getByRole("searchbox").first().fill("haccp");
    await page.getByRole("searchbox").first().press("Enter");
    await expect(page).toHaveURL(/\/search\?type=articles&q=haccp/);

    await page.goto("/templates");
    await page.getByRole("searchbox").first().fill("audit");
    await page.getByRole("searchbox").first().press("Enter");
    await expect(page).toHaveURL(/\/search\?type=templates&q=audit/);
  });
});
