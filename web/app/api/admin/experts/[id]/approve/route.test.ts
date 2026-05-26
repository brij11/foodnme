// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: vi.fn() }));
vi.mock("@/lib/email/zeptomail", () => ({ sendEmail: vi.fn().mockResolvedValue({ sent: true }) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { POST } from "./route";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function authClient(user: { id: string } | null) {
  return { auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) } };
}

function serviceClient({ isAdmin = true, expert = { status: "pending", full_name: "E", contact_email: "e@x.test", is_featured: false } as Record<string, unknown> | null } = {}) {
  const profileMaybe = vi.fn().mockResolvedValue({ data: { is_admin: isAdmin }, error: null });
  const expertMaybe = vi.fn().mockResolvedValue({ data: expert ? { id: ID, ...expert } : null, error: null });
  const updateEq = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn(() => ({ eq: updateEq }));
  const auditInsert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn((t: string) => {
    if (t === "profiles") return { select: () => ({ eq: () => ({ maybeSingle: profileMaybe }) }) };
    if (t === "experts") return { select: () => ({ eq: () => ({ maybeSingle: expertMaybe }) }), update };
    if (t === "admin_audit_log") return { insert: auditInsert };
    return {};
  });
  return { client: { from }, update, auditInsert };
}

function req(body: unknown = {}) {
  return new Request(`http://localhost/api/admin/experts/${ID}/approve`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as never;
}

beforeEach(() => vi.clearAllMocks());

describe("POST /api/admin/experts/:id/approve (story-experts-07)", () => {
  it("admin approves a pending expert (+feature) → active, featured, audited", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "admin" }) as never);
    const svc = serviceClient();
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);

    const res = await POST(req({ feature: true }), { params: { id: ID } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { status: "active", is_featured: true } });
    expect(svc.update).toHaveBeenCalledWith({ status: "active", is_featured: true });
    expect(svc.auditInsert).toHaveBeenCalledWith(
      expect.objectContaining({ action: "approve_expert", target_table: "experts", actor_id: "admin" }),
    );
  });

  it("without feature flag, is_featured is preserved", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "admin" }) as never);
    const svc = serviceClient({ expert: { status: "pending", full_name: "E", contact_email: "e@x.test", is_featured: false } });
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);
    const res = await POST(req({}), { params: { id: ID } });
    expect(await res.json()).toEqual({ ok: true, data: { status: "active", is_featured: false } });
  });

  it("unauthenticated → 401", async () => {
    vi.mocked(createClient).mockReturnValue(authClient(null) as never);
    vi.mocked(createServiceClient).mockReturnValue(serviceClient().client as never);
    expect((await POST(req(), { params: { id: ID } })).status).toBe(401);
  });

  it("non-admin → 403", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "u1" }) as never);
    const svc = serviceClient({ isAdmin: false });
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);
    const res = await POST(req(), { params: { id: ID } });
    expect(res.status).toBe(403);
    expect(svc.update).not.toHaveBeenCalled();
  });

  it("already-active expert → 409", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "admin" }) as never);
    const svc = serviceClient({ expert: { status: "active", full_name: "E", contact_email: "e@x.test", is_featured: true } });
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);
    const res = await POST(req(), { params: { id: ID } });
    expect(res.status).toBe(409);
    expect(svc.update).not.toHaveBeenCalled();
  });
});
