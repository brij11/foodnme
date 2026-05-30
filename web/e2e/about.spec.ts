import { test, expect } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./utils/axe";

// story-homepage-08 — the /about page (previously 404; nav/footer/auth links point here).
test.describe("/about (story-homepage-08)", () => {
  test("resolves (no 404) and renders every section with a single H1", async ({ page }) => {
    const res = await page.goto("/about");
    expect(res?.status()).toBe(200);

    // Single H1 (Fraunces hero) with the italic-emphasis word.
    const h1s = page.getByRole("heading", { level: 1 });
    await expect(h1s).toHaveCount(1);
    await expect(h1s).toContainText("run food businesses");

    // Stats row.
    await expect(page.getByText("Articles Published")).toBeVisible();
    await expect(page.getByText("Newsletter Subscribers")).toBeVisible();

    // Mission + What-we-do (4 offering cards linking to each surface).
    await expect(page.getByRole("heading", { name: "Four products, one focus" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Read the blog/ })).toHaveAttribute("href", "/blog");
    await expect(page.getByRole("link", { name: /Browse templates/ })).toHaveAttribute("href", "/templates");
    await expect(page.getByRole("link", { name: /See open roles/ })).toHaveAttribute("href", "/jobs");
    await expect(page.getByRole("link", { name: /Find an expert/ })).toHaveAttribute("href", "/experts");

    // Founder + Values.
    await expect(page.getByRole("heading", { name: "Aarti Menon" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Three things we won't compromise on" })).toBeVisible();

    // Final CTA + services link.
    await expect(page.getByRole("button", { name: "Book a consultation" })).toBeVisible();
    await expect(page.getByRole("link", { name: "See all services" })).toHaveAttribute("href", "/services");

    await expectNoSeriousA11yViolations(page);
  });

  test("'Book a consultation' opens the global consultation modal", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("button", { name: "Book a consultation" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
