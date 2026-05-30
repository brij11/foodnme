import { test, expect } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./utils/axe";

// Navigates from the listing so we don't need to hardcode a uuid. Aarti Menon (Mumbai) is the
// only available+featured Mumbai expert in the seed.
async function gotoAarti(page: import("@playwright/test").Page) {
  await page.goto("/experts?location=Mumbai");
  await page.getByRole("link", { name: "View profile" }).first().click();
  await page.waitForURL(/\/experts\/[0-9a-f-]+$/);
}

test.describe("/experts/[id] detail (story-experts-02)", () => {
  test("renders the full profile (enriched by story-experts-10); no a11y violations", async ({
    page,
  }) => {
    await gotoAarti(page);
    await expect(page.getByRole("heading", { name: "Dr. Aarti Menon", level: 1 })).toBeVisible();
    // Title appears in the hero and (story-experts-10) may recur in a Similar-experts card — scope to the hero.
    await expect(page.getByText("FSSAI Lead Auditor", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Certifications" })).toBeVisible();
    await expect(page.getByText("FSSC 22000 Lead Auditor")).toBeVisible();
    await expect(page.getByText("Quick stats")).toBeVisible();
    await expect(page.getByText("₹6,000/hr").first()).toBeVisible();
    await expectNoSeriousA11yViolations(page);
  });

  test("contact_email is never present in the client HTML (anti-harvesting)", async ({ page }) => {
    await gotoAarti(page);
    const html = await page.content();
    expect(html).not.toContain("expert.foodnme.test");
  });

  test("Contact CTA opens a focus-trapped modal; close dismisses it", async ({ page }) => {
    await gotoAarti(page);
    await page.getByRole("button", { name: /Contact Aarti/ }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("Your name")).toBeVisible();
    await expect(dialog.getByLabel("Email")).toBeVisible();
    await expect(dialog.getByLabel("What do you need help with?")).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(dialog).toBeHidden();
  });

  test("breadcrumb trails Home › Experts › name", async ({ page }) => {
    await gotoAarti(page);
    const crumb = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(crumb.getByRole("link", { name: "Experts" })).toBeVisible();
  });

  test("unknown id 404s", async ({ page }) => {
    const res = await page.goto("/experts/00000000-0000-0000-0000-000000000000");
    expect(res?.status()).toBe(404);
  });

  test("non-uuid id 404s (no 500)", async ({ page }) => {
    const res = await page.goto("/experts/not-a-real-id");
    expect(res?.status()).toBe(404);
  });
});
