import { describe, it, expect } from "vitest";
import { loginSchema } from "./login";

describe("loginSchema (story-auth-01)", () => {
  it("accepts a valid email + password and normalizes the email", () => {
    const r = loginSchema.safeParse({ email: "  USER@Foodnme.IN ", password: "secret" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("user@foodnme.in");
  });

  it("rejects a malformed email", () => {
    const r = loginSchema.safeParse({ email: "nope", password: "secret" });
    expect(r.success).toBe(false);
  });

  it("requires a non-empty password (strength is enforced at registration, not login)", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
  });
});
