import { test, expect } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./utils/axe";

test.describe("public layout + homepage (homepage-02)", () => {
  test("renders the chrome, disabled Jobs/Experts, and footer (AC#1-3,6,9,10)", async ({ page }) => {
    await page.goto("/");

    // One Fraunces H1
    await expect(page.getByRole("heading", { level: 1 })).toContainText("safer food ecosystem");

    // Enabled nav link vs disabled "coming soon" items (scoped to the primary nav)
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: "Knowledge Hub", exact: true })).toBeVisible();
    const jobs = nav.locator('span[aria-disabled="true"]', { hasText: "Jobs" }).first();
    await expect(jobs).toBeVisible();
    await expect(nav.getByRole("link", { name: "Jobs" })).toHaveCount(0);

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
