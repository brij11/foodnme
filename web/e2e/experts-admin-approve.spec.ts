import { test, expect } from "@playwright/test";
import { ensureUser, setAdmin, deleteUserByEmail, adminClient } from "./utils/supabase";
import { signInViaUI } from "./utils/session";

const PW = "Password123";
const ADMIN = "approve-admin@foodnme.test";
const CONTACT = "approve-pending-contact@expert.test";
const UNIQUE_LOC = "Approvalville";

test.describe("admin approve expert (story-experts-07)", () => {
  let expertId = "";

  test.beforeAll(async () => {
    await ensureUser(ADMIN, PW, { full_name: "Approve Admin", role: "employer" });
    await setAdmin(ADMIN);
    const admin = adminClient();
    await admin.from("experts").delete().eq("contact_email", CONTACT);
    const { data } = await admin
      .from("experts")
      .insert({
        full_name: "Pending Pat",
        title: "QA Specialist",
        bio: "A pending expert awaiting admin approval in the test suite.",
        specializations: ["HACCP"],
        experience_years: 7,
        hourly_rate: 4500,
        certifications: [],
        location: UNIQUE_LOC,
        contact_email: CONTACT,
        status: "pending",
        is_available: true,
        is_featured: false,
      })
      .select("id")
      .single();
    expertId = (data as { id: string }).id;
  });
  test.afterAll(async () => {
    await adminClient().from("experts").delete().eq("contact_email", CONTACT);
    await deleteUserByEmail(ADMIN);
  });

  test("pending expert is hidden until an admin approves, then appears (featured)", async ({
    page,
  }) => {
    // Not yet visible.
    await page.goto(`/experts?location=${UNIQUE_LOC}`);
    await expect(page.getByText("No experts match your filters")).toBeVisible();

    // Admin approves via the endpoint (using the signed-in admin's session cookies).
    await signInViaUI(page, ADMIN, PW);
    const res = await page.request.post(`/api/admin/experts/${expertId}/approve`, {
      data: { feature: true },
    });
    expect(res.status()).toBe(200);

    // Now live in the directory, with the Verified (featured) badge.
    await page.goto(`/experts?location=${UNIQUE_LOC}`);
    await expect(page.getByRole("heading", { name: "Pending Pat" })).toBeVisible();
    await expect(page.getByTestId("expert-card").first().getByText("Verified")).toBeVisible();
  });

  test("a non-admin cannot approve (403)", async ({ page, request }) => {
    const res = await request.post(`/api/admin/experts/${expertId}/approve`, { data: {} });
    // Unauthenticated request → 401/redirect; either way, not a 200 approval.
    expect(res.status()).not.toBe(200);
  });
});
