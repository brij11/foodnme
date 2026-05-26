// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { PATCH } from "./route";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";

const ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function authClient(user: { id: string } | null) {
  return { auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) } };
}
function serviceClient(current: { user_id: string; is_available: boolean } | null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: current ? { id: ID, ...current } : null, error: null });
  const updateEq = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn(() => ({ eq: updateEq }));
  const from = vi.fn(() => ({ select: () => ({ eq: () => ({ maybeSingle }) }), update }));
  return { client: { from }, update };
}
function req(body: unknown) {
  return new Request(`http://localhost/api/experts/${ID}/availability`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as never;
}

beforeEach(() => vi.clearAllMocks());

describe("PATCH /api/experts/:id/availability (story-experts-06)", () => {
  it("owner flips is_available → updates + revalidates", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "owner" }) as never);
    const svc = serviceClient({ user_id: "owner", is_available: true });
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);

    const res = await PATCH(req({ is_available: false }), { params: { id: ID } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { is_available: false } });
    expect(svc.update).toHaveBeenCalledWith({ is_available: false });
    expect(revalidatePath).toHaveBeenCalledWith("/experts");
  });

  it("no-op when the value is unchanged → no write, no revalidate", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "owner" }) as never);
    const svc = serviceClient({ user_id: "owner", is_available: true });
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);

    const res = await PATCH(req({ is_available: true }), { params: { id: ID } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { is_available: true } });
    expect(svc.update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("non-owner → 403, no write", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "intruder" }) as never);
    const svc = serviceClient({ user_id: "owner", is_available: true });
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);

    const res = await PATCH(req({ is_available: false }), { params: { id: ID } });
    expect(res.status).toBe(403);
    expect(svc.update).not.toHaveBeenCalled();
  });

  it("invalid body → 400", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "owner" }) as never);
    vi.mocked(createServiceClient).mockReturnValue(serviceClient({ user_id: "owner", is_available: true }).client as never);
    const res = await PATCH(req({ is_available: "yes" }), { params: { id: ID } });
    expect(res.status).toBe(400);
  });
});
