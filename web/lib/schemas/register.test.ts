import { describe, it, expect } from "vitest";
import { registerSchema } from "./register";

const base = {
  full_name: "Asha Rao",
  email: "asha@foodnme.in",
  password: "supersecret",
  role: "seeker" as const,
};

describe("registerSchema (story-auth-02)", () => {
  it("accepts a complete, valid registration", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a password shorter than 8 characters (§5.1)", () => {
    expect(registerSchema.safeParse({ ...base, password: "short7!" }).success).toBe(false);
  });

  it("rejects a malformed email", () => {
    expect(registerSchema.safeParse({ ...base, email: "nope" }).success).toBe(false);
  });

  it("requires a full name", () => {
    expect(registerSchema.safeParse({ ...base, full_name: "  " }).success).toBe(false);
  });

  it("rejects a missing or invalid role", () => {
    expect(registerSchema.safeParse({ ...base, role: "" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, role: "admin" }).success).toBe(false);
    const { role, ...noRole } = base;
    void role;
    expect(registerSchema.safeParse(noRole).success).toBe(false);
  });

  it("normalizes the email to lowercase + trimmed", () => {
    const r = registerSchema.safeParse({ ...base, email: "  Asha@Foodnme.IN " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("asha@foodnme.in");
  });
});
