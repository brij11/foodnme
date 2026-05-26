// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

import { GET } from "./route";
import { createClient } from "@/lib/supabase/server";

function makeSupabase(exchangeError: { message: string } | null) {
  const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: exchangeError });
  return { client: { auth: { exchangeCodeForSession } }, exchangeCodeForSession };
}

function req(url: string) {
  return new Request(url);
}

beforeEach(() => vi.clearAllMocks());

describe("GET /auth/callback (story-auth-03)", () => {
  it("valid code → exchanges it and 302-redirects to /dashboard (AC#1, AC#2)", async () => {
    const sb = makeSupabase(null);
    vi.mocked(createClient).mockReturnValue(sb.client as never);

    const res = await GET(req("http://localhost:3000/auth/callback?code=good-code"));
    expect(sb.exchangeCodeForSession).toHaveBeenCalledWith("good-code");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it("exchange failure → 302-redirects to /login?error=verification_failed (AC#3)", async () => {
    const sb = makeSupabase({ message: "expired" });
    vi.mocked(createClient).mockReturnValue(sb.client as never);

    const res = await GET(req("http://localhost:3000/auth/callback?code=stale"));
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/login?error=verification_failed",
    );
  });

  it("missing code → 302-redirects to /login?error=verification_failed, no exchange", async () => {
    const sb = makeSupabase(null);
    vi.mocked(createClient).mockReturnValue(sb.client as never);

    const res = await GET(req("http://localhost:3000/auth/callback"));
    expect(sb.exchangeCodeForSession).not.toHaveBeenCalled();
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/login?error=verification_failed",
    );
  });
});
