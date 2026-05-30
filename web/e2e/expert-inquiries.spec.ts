import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { ensureUser, deleteUserByEmail, adminClient, anonClient } from "./utils/supabase";
import { signInViaUI } from "./utils/session";

// story-experts-11 — expert dashboard stats + inquiries inbox, persisted in expert_inquiries.
const PW = "Password123";
const E1 = "inq-expert-1@foodnme.test";
const E2 = "inq-expert-2@foodnme.test";
const C1 = "inq-expert-1-contact@expert.test";
const C2 = "inq-expert-2-contact@expert.test";

let expert1Id = "";
let expert2Id = "";

async function makeExpert(userId: string, contact: string, name: string) {
  const admin = adminClient();
  await admin.from("experts").delete().eq("contact_email", contact);
  const { data, error } = await admin
    .from("experts")
    .insert({
      user_id: userId,
      full_name: name,
      title: "Consultant",
      contact_email: contact,
      status: "active",
      rating: 4.8,
      review_count: 20,
      response_time: "< 24 hours",
      is_available: true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

test.describe("Expert dashboard inquiries (story-experts-11)", () => {
  test.beforeAll(async () => {
    const u1 = await ensureUser(E1, PW, { full_name: "Inq Expert One", role: "expert" });
    const u2 = await ensureUser(E2, PW, { full_name: "Inq Expert Two", role: "expert" });
    expert1Id = await makeExpert(u1, C1, "Inq Expert One");
    expert2Id = await makeExpert(u2, C2, "Inq Expert Two");

    const admin = adminClient();
    await admin.from("expert_inquiries").insert([
      {
        expert_id: expert1Id,
        sender_name: "Acme Foods",
        sender_email: "buyer@acme.test",
        company_name: "Acme Foods Pvt Ltd",
        engagement_type: "project",
        message: "We need an audit-readiness review for our new dairy line this quarter.",
        is_read: false,
      },
      {
        expert_id: expert1Id,
        sender_name: "Bharat Snacks",
        sender_email: "qa@bharat.test",
        message: "Looking for help with extrusion troubleshooting on our cereal line.",
        is_read: true,
      },
      {
        expert_id: expert2Id,
        sender_name: "Other Co",
        sender_email: "x@other.test",
        message: "This inquiry belongs to expert two and must never appear for expert one.",
        is_read: false,
      },
    ]);
  });

  test.afterAll(async () => {
    const admin = adminClient();
    await admin.from("experts").delete().eq("contact_email", C1);
    await admin.from("experts").delete().eq("contact_email", C2);
    await deleteUserByEmail(E1);
    await deleteUserByEmail(E2);
  });

  test("overview shows the 4-card stats grid with real values (AC#3, #7)", async ({ page }) => {
    test.setTimeout(60_000);
    await signInViaUI(page, E1, PW);
    await page.goto("/dashboard/expert");

    const stats = page.getByTestId("expert-stats");
    await expect(stats).toBeVisible();
    await expect(stats).toContainText("Inquiries");
    await expect(stats).toContainText("2"); // two inquiries for expert one
    await expect(stats).toContainText("Avg rating");
    await expect(stats).toContainText("4.8");
    await expect(stats).toContainText("Response time");
    await expect(stats).toContainText("< 24 hours");
    await expect(stats).toContainText("Availability");
    await expect(stats).toContainText("Available");
    // No fabricated metrics.
    await expect(stats).not.toContainText("Profile views");
    await expect(stats).not.toContainText("Active engagements");
  });

  test("inquiries tab lists own inquiries with unread marker + mark-read (AC#4, #6)", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await signInViaUI(page, E1, PW);
    await page.goto("/dashboard/expert");
    await page.getByRole("button", { name: "Inquiries" }).first().click();

    const rows = page.getByTestId("inquiry-row");
    await expect(rows).toHaveCount(2);
    // The designed fields render: sender, company, engagement chip, message.
    await expect(page.getByText("Acme Foods", { exact: true })).toBeVisible();
    await expect(page.getByText("Acme Foods Pvt Ltd")).toBeVisible();
    await expect(page.getByText("Project engagement")).toBeVisible();

    // One row is unread; marking it read clears the marker.
    const unread = page.locator('[data-testid="inquiry-row"][data-unread="true"]');
    await expect(unread).toHaveCount(1);
    await unread.getByRole("button", { name: "Mark as read" }).click();
    await expect(page.locator('[data-testid="inquiry-row"][data-unread="true"]')).toHaveCount(0);
  });

  test("RLS scopes inquiries to the owning expert; anon sees none (AC#1, #5)", async () => {
    // A signed-in expert two sees only their own inquiry (never expert one's).
    const e2Client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    );
    const signin = await e2Client.auth.signInWithPassword({ email: E2, password: PW });
    expect(signin.error).toBeNull();
    const { data: e2Rows } = await e2Client.from("expert_inquiries").select("expert_id");
    expect(e2Rows && e2Rows.length).toBe(1);
    expect((e2Rows as { expert_id: string }[]).every((r) => r.expert_id === expert2Id)).toBe(true);

    // Anonymous visitors cannot read any inquiries.
    const { data: anonRows } = await anonClient().from("expert_inquiries").select("id");
    expect(anonRows ?? []).toHaveLength(0);
  });
});
