import { test, expect } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./utils/axe";
import { ensureUser, deleteUserByEmail } from "./utils/supabase";
import { clearMailpit, waitForActionLink } from "./utils/mailpit";

const EMAIL = `reset-e2e-${Date.now()}@foodnme.test`;
const OLD_PASSWORD = "OldPassword123";
const NEW_PASSWORD = "NewPassword456";

test.describe("/reset-password (story-auth-04)", () => {
  test.beforeAll(async () => {
    await ensureUser(EMAIL, OLD_PASSWORD, { full_name: "Reset Tester", role: "seeker" });
  });
  test.afterAll(async () => {
    await deleteUserByEmail(EMAIL);
  });

  test("request form renders, no serious a11y violations (AC#1)", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expectNoSeriousA11yViolations(page);
  });

  test("request does not reveal account existence (AC#3)", async ({ page }) => {
    await page.goto("/reset-password");
    await page.getByLabel("Email").fill("definitely-not-a-user@foodnme.test");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();
    await expect(
      page.getByText("If an account exists for that email, a reset link is on its way."),
    ).toBeVisible();
  });

  test("full reset: request → email link → set new password → login banner → sign in (AC#2,4,5,6,7)", async ({
    page,
  }) => {
    await clearMailpit();

    // 1) Request a reset for the real user (sets the PKCE verifier cookie in this context).
    await page.goto("/reset-password");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();

    // 2) Follow the emailed recovery link in the same context → confirm form.
    const link = await waitForActionLink(EMAIL);
    await page.goto(link);
    await expect(page.getByRole("heading", { name: "Set a new password" })).toBeVisible();

    // 3) Confirm-mismatch is rejected (AC#5).
    await page.getByLabel("New password", { exact: true }).fill(NEW_PASSWORD);
    await page.getByLabel("Confirm new password").fill("does-not-match");
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(page.getByText("Passwords don't match.")).toBeVisible();

    // 4) Matching new password → updateUser → /login?reset=success banner (AC#6, AC#7).
    await page.getByLabel("Confirm new password").fill(NEW_PASSWORD);
    await page.getByRole("button", { name: "Update password" }).click();
    await page.waitForURL("**/login?reset=success");
    await expect(
      page.getByText("Your password has been reset. Sign in with your new password."),
    ).toBeVisible();

    // 5) The new password actually works.
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(NEW_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/dashboard");
  });

  test("invalid/expired recovery link → 'Link expired' with a re-request path (AC#8)", async ({
    page,
  }) => {
    await page.goto("/reset-password?code=not-a-real-recovery-code");
    await expect(page.getByRole("heading", { name: "Link expired" })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole("button", { name: "Request a new reset link" }).click();
    await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
  });
});
