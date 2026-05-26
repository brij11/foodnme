// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: vi.fn() }));
vi.mock("@/lib/email/zeptomail", () => ({ sendEmail: vi.fn().mockResolvedValue({ sent: true }) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { PATCH } from "./route";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email/zeptomail";

const ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

// Current row as stored (active). Material fields: full_name/title/bio/specializations/certifications.
const current = {
  id: ID,
  user_id: "owner",
  status: "active",
  full_name: "Asha Rao",
  title: "QA Consultant",
  bio: "Fifteen years across dairy QA and HACCP implementation for mid-size processors.",
  specializations: ["HACCP", "Quality Control"],
  certifications: ["FSSAI Auditor"],
};

const baseBody = {
  full_name: current.full_name,
  title: current.title,
  bio: current.bio,
  specializations: current.specializations,
  experience_years: 15,
  hourly_rate: 5000,
  certifications: current.certifications,
  location: "Pune, India",
  contact_email: "asha@expert.test",
};

function authClient(user: { id: string } | null) {
  return { auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) } };
}

function serviceClient({ isAdmin = false } = {}) {
  const expertMaybeSingle = vi.fn().mockResolvedValue({ data: current, error: null });
  const profileMaybeSingle = vi.fn().mockResolvedValue({ data: { is_admin: isAdmin }, error: null });
  const updateEq = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn(() => ({ eq: updateEq }));
  const from = vi.fn((table: string) => {
    if (table === "profiles") {
      return { select: () => ({ eq: () => ({ maybeSingle: profileMaybeSingle }) }) };
    }
    return {
      select: () => ({ eq: () => ({ maybeSingle: expertMaybeSingle }) }),
      update,
    };
  });
  return { client: { from }, update };
}

function req(body: unknown) {
  return new Request(`http://localhost/api/experts/${ID}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as never;
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.ADMIN_EMAIL = "founder@foodnme.test";
});

describe("PATCH /api/experts/:id (story-experts-04)", () => {
  it("material change (bio) → status reset to pending + admin notified", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "owner" }) as never);
    const svc = serviceClient();
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);

    const res = await PATCH(req({ ...baseBody, bio: "A completely rewritten professional bio with new emphasis." }), { params: { id: ID } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { status: "pending" } });
    expect(svc.update).toHaveBeenCalledWith(expect.objectContaining({ status: "pending" }));
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("non-material change (location/rate only) keeps status, no admin notify", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "owner" }) as never);
    const svc = serviceClient();
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);

    const res = await PATCH(req({ ...baseBody, location: "Mumbai, India", hourly_rate: 6000 }), { params: { id: ID } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { status: "active" } });
    expect(svc.update).toHaveBeenCalledWith(expect.not.objectContaining({ status: expect.anything() }));
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("non-owner non-admin → 403", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "intruder" }) as never);
    const svc = serviceClient({ isAdmin: false });
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);

    const res = await PATCH(req(baseBody), { params: { id: ID } });
    expect(res.status).toBe(403);
    expect(svc.update).not.toHaveBeenCalled();
  });

  it("admin may edit another's profile", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "an-admin" }) as never);
    const svc = serviceClient({ isAdmin: true });
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);

    const res = await PATCH(req(baseBody), { params: { id: ID } });
    expect(res.status).toBe(200);
    expect(svc.update).toHaveBeenCalled();
  });
});
