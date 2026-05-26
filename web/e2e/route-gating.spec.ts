import { test, expect } from "@playwright/test";
import { ensureUser, setAdmin, deleteUserByEmail } from "./utils/supabase";
import { signInViaUI } from "./utils/session";

const PW = "Password123";
const SEEKER = "gate-seeker@foodnme.test";
const ADMIN = "gate-admin@foodnme.test";

test.describe("middleware route gating (story-auth-06)", () => {
  test.beforeAll(async () => {
    await ensureUser(SEEKER, PW, { full_name: "Gate Seeker", role: "seeker" });
    await ensureUser(ADMIN, PW, { full_name: "Gate Admin", role: "employer" });
    await setAdmin(ADMIN);
  });
  test.afterAll(async () => {
    await deleteUserByEmail(SEEKER);
    await deleteUserByEmail(ADMIN);
  });

  test("unauthed /dashboard → /login?redirect=/dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(
      (u) => u.pathname === "/login" && u.searchParams.get("redirect") === "/dashboard",
    );
  });

  test("unauthed /admin → /login?redirect=/admin", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL(
      (u) => u.pathname === "/login" && u.searchParams.get("redirect") === "/admin",
    );
  });

  test("seeker on /dashboard/employer → redirected to own /dashboard/seeker", async ({ page }) => {
    await signInViaUI(page, SEEKER, PW);
    await page.goto("/dashboard/employer");
    await page.waitForURL("**/dashboard/seeker");
    expect(new URL(page.url()).pathname).toBe("/dashboard/seeker");
  });

  test("seeker on own /dashboard/seeker passes through (no redirect)", async ({ page }) => {
    await signInViaUI(page, SEEKER, PW);
    await page.goto("/dashboard/seeker");
    // Middleware lets it through; the page itself ships in story-auth-07.
    expect(new URL(page.url()).pathname).toBe("/dashboard/seeker");
  });

  test("non-admin seeker on /admin → bounced to own dashboard", async ({ page }) => {
    await signInViaUI(page, SEEKER, PW);
    await page.goto("/admin");
    // Middleware sends non-admins to /dashboard, which the role-router (story-auth-07) then
    // forwards to the seeker's own dashboard.
    await page.waitForURL("**/dashboard/seeker");
    expect(new URL(page.url()).pathname).toBe("/dashboard/seeker");
  });

  test("admin on /admin passes through (no redirect)", async ({ page }) => {
    await signInViaUI(page, ADMIN, PW);
    await page.goto("/admin");
    expect(new URL(page.url()).pathname).toBe("/admin");
  });
});
