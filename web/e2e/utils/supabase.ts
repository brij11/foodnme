import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * E2E helper: a service-role Supabase client + deterministic test-user provisioning.
 *
 * E2E specs run against the live local Supabase stack (playwright.config.ts). Confirmed users
 * are created through GoTrue's admin API (`email_confirm: true`) rather than hand-seeded into
 * `auth.users` — the API creates the matching `auth.identities` row, so password sign-in works
 * across GoTrue versions. Used by every role-aware flow (auth, experts, jobs).
 */
function loadLocalEnv() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const txt = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of txt.split("\n")) {
      const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (m && m[1] && !process.env[m[1]]) process.env[m[1]] = m[2] ?? "";
    }
  } catch {
    // .env.local absent — assume the vars are already in the environment.
  }
}

export function adminClient(): SupabaseClient {
  loadLocalEnv();
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/** Anonymous (RLS-bound) client — the public/visitor surface. */
export function anonClient(): SupabaseClient {
  loadLocalEnv();
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/** Promotes an existing user's profile to admin (is_admin is DB-only, not signup metadata). */
export async function setAdmin(email: string): Promise<void> {
  const admin = adminClient();
  const { error } = await admin.from("profiles").update({ is_admin: true }).eq("email", email);
  if (error) throw error;
}

export type TestRole = "seeker" | "employer" | "expert";

/**
 * Creates (or recreates) a user with a known password. Confirmed by default; pass
 * `{ confirm: false }` to leave the email unverified (exercises the `email_not_confirmed`
 * login gate, story-auth-03). Deletes any existing user with the same email first so repeated
 * runs stay deterministic. Returns the user id.
 */
export async function ensureUser(
  email: string,
  password: string,
  meta: { full_name: string; role: TestRole },
  opts: { confirm?: boolean } = {},
): Promise<string> {
  const admin = adminClient();

  // Page through existing users and drop any match (keeps re-runs idempotent).
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = data?.users.find((u) => u.email === email);
  if (existing) await admin.auth.admin.deleteUser(existing.id);

  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: opts.confirm ?? true,
    user_metadata: meta,
  });
  if (created.error) throw created.error;
  return created.data.user!.id;
}

export async function deleteUserByEmail(email: string): Promise<void> {
  const admin = adminClient();
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = data?.users.find((u) => u.email === email);
  if (existing) await admin.auth.admin.deleteUser(existing.id);
}
