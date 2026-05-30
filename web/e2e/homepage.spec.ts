import { test, expect } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./utils/axe";

test.describe("public layout + homepage (homepage-02)", () => {
  test("renders the chrome, full nav (Jobs/Experts now live), and footer (AC#1-3,6,9,10)", async ({ page }) => {
    await page.goto("/");

    // One Fraunces H1
    await expect(page.getByRole("heading", { level: 1 })).toContainText("safer food ecosystem");

    // Primary nav links — Jobs/Experts shipped in later sprints, so they are now live
    // links (no longer the homepage-02-era disabled "coming soon" spans).
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: "Knowledge Hub", exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Jobs", exact: true })).toHaveAttribute("href", "/jobs");
    await expect(nav.getByRole("link", { name: "Experts", exact: true })).toHaveAttribute("href", "/experts");

    // Footer columns
    await expect(page.getByRole("heading", { name: "Explore" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Topics" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();
  });

  test("skip-to-content link reveals on focus (AC#10)", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  });

  test("Get a Consultation opens the modal; Esc closes it (AC#5)", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Get a Consultation" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Tell us about your food business");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("homepage has no critical/serious a11y violations (§10)", async ({ page }) => {
    await page.goto("/");
    await expectNoSeriousA11yViolations(page);
  });
});
