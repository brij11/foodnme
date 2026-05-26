import { describe, it, expect } from "vitest";
import { inquirySchema } from "./inquiry";

const valid = {
  full_name: "Aarti Menon",
  email: "Aarti@Dairy.IN",
  company_name: "Dairy Co",
  service_needed: "haccp-development",
  message: "We need a HACCP plan for a new dairy line before our audit.",
  turnstile_token: "tok",
};

describe("inquirySchema (services-02)", () => {
  it("accepts a valid inquiry and normalizes the email", () => {
    const r = inquirySchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("aarti@dairy.in");
  });

  it("rejects a too-short name (min 2)", () => {
    const r = inquirySchema.safeParse({ ...valid, full_name: "A" });
    expect(r.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const r = inquirySchema.safeParse({ ...valid, email: "nope" });
    expect(r.success).toBe(false);
  });

  it("rejects an empty company name", () => {
    const r = inquirySchema.safeParse({ ...valid, company_name: "" });
    expect(r.success).toBe(false);
  });

  it("rejects a service_needed outside the canonical enum", () => {
    const r = inquirySchema.safeParse({ ...valid, service_needed: "not-a-service" });
    expect(r.success).toBe(false);
  });

  it("rejects a message under 20 chars", () => {
    const r = inquirySchema.safeParse({ ...valid, message: "too short" });
    expect(r.success).toBe(false);
  });

  it("requires a turnstile token", () => {
    const r = inquirySchema.safeParse({ ...valid, turnstile_token: "" });
    expect(r.success).toBe(false);
  });
});
