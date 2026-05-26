import { test, expect } from "@playwright/test";
import { ensureUser, deleteUserByEmail } from "./utils/supabase";

const UNVERIFIED = "unverified-e2e@foodnme.test";
const PASSWORD = "Password123";

test.describe("email verification (story-auth-03)", () => {
  test.beforeAll(async () => {
    // A user whose email is NOT confirmed → sign-in hits the email_not_confirmed gate.
    await ensureUser(UNVERIFIED, PASSWORD, { full_name: "Unverified User", role: "seeker" }, {
      confirm: false,
    });
  });
  test.afterAll(async () => {
    await deleteUserByEmail(UNVERIFIED);
  });

  test("callback without a code → /login?error=verification_failed with banner (AC#3)", async ({
    page,
  }) => {
    await page.goto("/auth/callback");
    await page.waitForURL("**/login?error=verification_failed");
    await expect(
      page.getByText("That verification link is invalid or has expired."),
    ).toBeVisible();
  });

  test("login with an unverified email → verify prompt + resend, then 30s cooldown (AC#4, AC#5)", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(UNVERIFIED);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText(/Please verify your email/)).toBeVisible();
    const resend = page.getByRole("button", { name: "resend the link" });
    await expect(resend).toBeVisible();

    await resend.click();
    // Button switches to a disabled countdown (AC#5 — 30s disable).
    await expect(page.getByRole("button", { name: /resend in \d+s/ })).toBeDisabled();
  });
});
