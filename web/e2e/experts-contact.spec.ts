import { test, expect } from "@playwright/test";

// Drives the full contact flow against the live stack: Turnstile auto-passes with the local
// test key; ZeptoMail no-ops locally (no key) so the relay is treated as delivered → success.
test.describe("contact expert relay (story-experts-03)", () => {
  test("submitting the contact modal relays the message and shows success", async ({ page }) => {
    await page.goto("/experts?location=Mumbai");
    await page.getByRole("link", { name: "View profile" }).first().click();
    await page.waitForURL(/\/experts\/[0-9a-f-]+$/);

    await page.getByRole("button", { name: /Contact Aarti/ }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Your name").fill("Test Visitor");
    await dialog.getByLabel("Email").fill("visitor@example.com");
    await dialog
      .getByLabel("What do you need help with?")
      .fill("We need a HACCP audit for our new dairy line before our certification audit.");

    const submit = dialog.getByRole("button", { name: "Send message" });
    await expect(submit).toBeEnabled({ timeout: 15000 }); // waits for Turnstile to verify
    await submit.click();

    await expect(page.getByText("Message delivered")).toBeVisible();
  });

  test("a short message is rejected client-side (Zod min length)", async ({ page }) => {
    await page.goto("/experts?location=Mumbai");
    await page.getByRole("link", { name: "View profile" }).first().click();
    await page.waitForURL(/\/experts\/[0-9a-f-]+$/);

    await page.getByRole("button", { name: /Contact Aarti/ }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Your name").fill("Test Visitor");
    await dialog.getByLabel("Email").fill("visitor@example.com");
    await dialog.getByLabel("What do you need help with?").fill("hi");
    const submit = dialog.getByRole("button", { name: "Send message" });
    await expect(submit).toBeEnabled({ timeout: 15000 });
    await submit.click();
    await expect(page.getByText(/at least 20 characters/)).toBeVisible();
  });
});
