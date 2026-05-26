import { type Page, expect } from "@playwright/test";

/**
 * Signs in through the real login UI and waits until the app navigates away from /login.
 * Establishes the @supabase/ssr session cookies so subsequent gated-route visits are authed.
 *
 * Uses a URL poll rather than waitForURL: the post-login hop is a client-side router.push (no
 * document `load` event), and the first such navigation can trigger a cold dev-server route
 * compile, so we poll the live URL with a generous budget.
 */
export async function signInViaUI(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect
    .poll(() => new URL(page.url()).pathname, {
      timeout: 30000,
      message: "sign-in did not navigate away from /login",
    })
    .not.toBe("/login");
}
