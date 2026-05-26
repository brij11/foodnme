// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { PATCH } from "./route";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function authClient(user: { id: string } | null) {
  return { auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) } };
}
function serviceClient({ employerId = "owner", isAdmin = false } = {}) {
  const jobMaybe = vi.fn().mockResolvedValue({ data: { id: ID, employer_id: employerId }, error: null });
  const profMaybe = vi.fn().mockResolvedValue({ data: { is_admin: isAdmin }, error: null });
  const updateEq = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn(() => ({ eq: updateEq }));
  const from = vi.fn((t: string) =>
    t === "profiles"
      ? { select: () => ({ eq: () => ({ maybeSingle: profMaybe }) }) }
      : { select: () => ({ eq: () => ({ maybeSingle: jobMaybe }) }), update },
  );
  return { client: { from }, update };
}
function req(body: unknown) {
  return new Request(`http://localhost/api/jobs/${ID}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as never;
}

beforeEach(() => vi.clearAllMocks());

describe("PATCH /api/jobs/:id (story-jobs-04)", () => {
  it("owner closes the job → status closed", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "owner" }) as never);
    const svc = serviceClient({ employerId: "owner" });
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);
    const res = await PATCH(req({ status: "closed" }), { params: { id: ID } });
    expect(res.status).toBe(200);
    expect(svc.update).toHaveBeenCalledWith({ status: "closed" });
  });

  it("non-owner non-admin → 403, no update", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "intruder" }) as never);
    const svc = serviceClient({ employerId: "owner", isAdmin: false });
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);
    const res = await PATCH(req({ status: "closed" }), { params: { id: ID } });
    expect(res.status).toBe(403);
    expect(svc.update).not.toHaveBeenCalled();
  });

  it("empty body → 400", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "owner" }) as never);
    vi.mocked(createServiceClient).mockReturnValue(serviceClient().client as never);
    expect((await PATCH(req({}), { params: { id: ID } })).status).toBe(400);
  });

  it("unauthenticated → 401", async () => {
    vi.mocked(createClient).mockReturnValue(authClient(null) as never);
    vi.mocked(createServiceClient).mockReturnValue(serviceClient().client as never);
    expect((await PATCH(req({ status: "closed" }), { params: { id: ID } })).status).toBe(401);
  });
});
