// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: vi.fn() }));
vi.mock("@/lib/email/zeptomail", () => ({ sendEmail: vi.fn().mockResolvedValue({ sent: true }) }));

import { POST } from "./route";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email/zeptomail";

function authClient(user: { id: string } | null) {
  return { auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) } };
}

function serviceClient({ existing = null as { id: string } | null, insertError = null as { message: string } | null } = {}) {
  const existingMaybeSingle = vi.fn().mockResolvedValue({ data: existing, error: null });
  const insertSingle = vi.fn().mockResolvedValue({ data: { id: "new-id" }, error: insertError });
  const insert = vi.fn(() => ({ select: () => ({ single: insertSingle }) }));
  const from = vi.fn(() => ({
    select: () => ({ eq: () => ({ maybeSingle: existingMaybeSingle }) }),
    insert,
  }));
  return { client: { from }, insert };
}

function req(body: unknown) {
  return new Request("http://localhost/api/experts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as never;
}

const valid = {
  full_name: "Asha Rao",
  title: "QA Consultant",
  bio: "Fifteen years across dairy QA and HACCP implementation for mid-size processors.",
  specializations: ["HACCP", "Quality Control"],
  experience_years: 15,
  hourly_rate: 5000,
  certifications: ["FSSAI Auditor"],
  location: "Pune, India",
  contact_email: "asha@expert.test",
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.ADMIN_EMAIL = "founder@foodnme.test";
});

describe("POST /api/experts (story-experts-04)", () => {
  it("self-create inserts status=pending + notifies admin", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "u1" }) as never);
    const svc = serviceClient();
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);

    const res = await POST(req(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { id: "new-id", status: "pending" } });
    expect(svc.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "u1", status: "pending", full_name: "Asha Rao" }),
    );
    expect(sendEmail).toHaveBeenCalledTimes(1); // admin notification
  });

  it("invalid body → 400", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "u1" }) as never);
    vi.mocked(createServiceClient).mockReturnValue(serviceClient().client as never);
    const res = await POST(req({ ...valid, bio: "too short" }));
    expect(res.status).toBe(400);
  });

  it("unauthenticated → 401", async () => {
    vi.mocked(createClient).mockReturnValue(authClient(null) as never);
    vi.mocked(createServiceClient).mockReturnValue(serviceClient().client as never);
    const res = await POST(req(valid));
    expect(res.status).toBe(401);
  });

  it("already has a profile → 409", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "u1" }) as never);
    const svc = serviceClient({ existing: { id: "existing" } });
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);
    const res = await POST(req(valid));
    expect(res.status).toBe(409);
    expect(svc.insert).not.toHaveBeenCalled();
  });
});
