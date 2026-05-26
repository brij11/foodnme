import { test, expect } from "@playwright/test";
import { adminClient, anonClient, ensureUser, deleteUserByEmail } from "./utils/supabase";

// Pure-API smoke test (no browser): a signup must spawn a matching profiles row via the
// on_auth_user_created trigger within ~1s (story-auth-05 AC#8), and the public_profiles view
// must expose the safe subset to anon while the underlying table stays RLS-protected.
const EMAIL = `profile-boot-${Date.now()}@foodnme.test`;
const PASSWORD = "Password123";

test.describe("profiles bootstrap (story-auth-05)", () => {
  test.afterAll(async () => {
    await deleteUserByEmail(EMAIL);
  });

  test("signup spawns a matching profiles row within 1s with role + full_name", async () => {
    const anon = anonClient();
    const admin = adminClient();

    const t0 = Date.now();
    const { data: signUp, error: signUpErr } = await anon.auth.signUp({
      email: EMAIL,
      password: PASSWORD,
      options: { data: { full_name: "Boot Tester", role: "employer" } },
    });
    expect(signUpErr).toBeNull();
    const userId = signUp.user!.id;

    // Poll the profiles row (service role) until it appears — must be well under 1s.
    let row: { id: string; email: string; full_name: string; role: string; is_admin: boolean } | null =
      null;
    while (Date.now() - t0 < 1000 && !row) {
      const { data } = await admin
        .from("profiles")
        .select("id,email,full_name,role,is_admin")
        .eq("id", userId)
        .maybeSingle();
      row = data as typeof row;
      if (!row) await new Promise((r) => setTimeout(r, 50));
    }

    expect(row, "profiles row should exist within 1s of signup").not.toBeNull();
    expect(row!.email).toBe(EMAIL);
    expect(row!.full_name).toBe("Boot Tester");
    expect(row!.role).toBe("employer");
    expect(row!.is_admin).toBe(false);
  });

  test("public_profiles exposes id+full_name to anon; profiles table stays locked", async () => {
    const anon = anonClient();
    const admin = adminClient();
    const { data: prof } = await admin
      .from("profiles")
      .select("id")
      .eq("email", EMAIL)
      .maybeSingle();
    const id = (prof as { id: string }).id;

    // Anon can read the public view…
    const { data: pub } = await anon.from("public_profiles").select("id,full_name").eq("id", id).maybeSingle();
    expect(pub).toMatchObject({ id, full_name: "Boot Tester" });

    // …but cannot read the underlying RLS-protected table.
    const { data: locked } = await anon.from("profiles").select("id").eq("id", id);
    expect(locked).toEqual([]);
  });

  test("self can update own profile fields but cannot escalate is_admin (AC#3 RLS + guard)", async () => {
    const selfEmail = `profile-self-${Date.now()}@foodnme.test`;
    await ensureUser(selfEmail, PASSWORD, { full_name: "Self Editor", role: "expert" });
    const anon = anonClient();
    const { error: signInErr } = await anon.auth.signInWithPassword({
      email: selfEmail,
      password: PASSWORD,
    });
    expect(signInErr).toBeNull();
    const {
      data: { user },
    } = await anon.auth.getUser();
    const uid = user!.id;

    // Attempt to both escalate (is_admin) and edit a legit field in one update.
    await anon.from("profiles").update({ is_admin: true, full_name: "Renamed" }).eq("id", uid);

    const admin = adminClient();
    const { data } = await admin
      .from("profiles")
      .select("is_admin,full_name,role")
      .eq("id", uid)
      .single();
    expect((data as { is_admin: boolean }).is_admin).toBe(false); // pinned by the guard trigger
    expect((data as { full_name: string }).full_name).toBe("Renamed"); // legit field updated
    expect((data as { role: string }).role).toBe("expert"); // role pinned too

    await anon.auth.signOut();
    await deleteUserByEmail(selfEmail);
  });
});
