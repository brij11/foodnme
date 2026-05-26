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
function serviceClient({ isAdmin = true, jobStatus = "pending" as string | null } = {}) {
  const profMaybe = vi.fn().mockResolvedValue({ data: { is_admin: isAdmin }, error: null });
  const jobMaybe = vi.fn().mockResolvedValue({ data: jobStatus ? { id: ID, status: jobStatus, title: "QA", employer_id: null } : null, error: null });
  const updateEq = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn(() => ({ eq: updateEq }));
  const auditInsert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn((t: string) =>
    t === "profiles" ? { select: () => ({ eq: () => ({ maybeSingle: profMaybe }) }) }
      : t === "admin_audit_log" ? { insert: auditInsert }
      : { select: () => ({ eq: () => ({ maybeSingle: jobMaybe }) }), update },
  );
  return { client: { from }, update, auditInsert };
}
function req() {
  return new Request(`http://localhost/api/admin/jobs/${ID}/approve`, { method: "POST" }) as never;
}

beforeEach(() => vi.clearAllMocks());

describe("POST /api/admin/jobs/:id/approve (story-jobs-08)", () => {
  it("admin approves a pending job → active + audited", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "admin" }) as never);
    const svc = serviceClient();
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);
    const res = await POST(req(), { params: { id: ID } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { status: "active" } });
    expect(svc.update).toHaveBeenCalledWith({ status: "active" });
    expect(svc.auditInsert).toHaveBeenCalledWith(expect.objectContaining({ action: "approve_job", target_table: "jobs" }));
  });

  it("unauthenticated → 401", async () => {
    vi.mocked(createClient).mockReturnValue(authClient(null) as never);
    vi.mocked(createServiceClient).mockReturnValue(serviceClient().client as never);
    expect((await POST(req(), { params: { id: ID } })).status).toBe(401);
  });

  it("non-admin → 403", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "u" }) as never);
    const svc = serviceClient({ isAdmin: false });
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);
    const res = await POST(req(), { params: { id: ID } });
    expect(res.status).toBe(403);
    expect(svc.update).not.toHaveBeenCalled();
  });

  it("already-active job → 409", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "admin" }) as never);
    const svc = serviceClient({ jobStatus: "active" });
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);
    expect((await POST(req(), { params: { id: ID } })).status).toBe(409);
    expect(svc.update).not.toHaveBeenCalled();
  });
});
