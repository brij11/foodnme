import { test, expect } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./utils/axe";

async function gotoFirstJob(page: import("@playwright/test").Page) {
  await page.goto("/jobs?job_type=Contract"); // 1 deterministic result
  await page.getByRole("link", { name: "View job" }).first().click();
  await page.waitForURL(/\/jobs\/[0-9a-f-]+$/);
}

test.describe("/jobs/[id] detail (story-jobs-02)", () => {
  test("renders job fields + skills; no a11y violations", async ({ page }) => {
    await gotoFirstJob(page);
    await expect(page.getByRole("heading", { name: "Compliance Consultant (Contract)", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "About the role" })).toBeVisible();
    await expect(page.getByText("Independent", { exact: true })).toBeVisible();
    await expect(page.getByText(/FSSAI/).first()).toBeVisible();
    await expectNoSeriousA11yViolations(page);
  });

  test("anonymous visitor's Apply CTA links to login with redirect", async ({ page }) => {
    await gotoFirstJob(page);
    const cta = page.getByRole("link", { name: "Sign in to apply" });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", /^\/login\?redirect=\/jobs\/[0-9a-f-]+$/);
  });

  test("breadcrumb trails Home › Jobs › title", async ({ page }) => {
    await gotoFirstJob(page);
    await expect(
      page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Jobs" }),
    ).toBeVisible();
  });

  test("unknown id 404s", async ({ page }) => {
    const res = await page.goto("/jobs/00000000-0000-0000-0000-000000000000");
    expect(res?.status()).toBe(404);
  });
});
