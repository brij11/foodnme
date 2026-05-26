import { describe, it, expect } from "vitest";
import { companyInitial, formatSalary } from "./jobs";

describe("companyInitial (story-jobs-01)", () => {
  it("takes two initials from the company name", () => {
    expect(companyInitial("Amul Foods")).toBe("AF");
    expect(companyInitial("Independent")).toBe("I");
    expect(companyInitial("  ")).toBe("FN");
  });
});

describe("formatSalary (story-jobs-01)", () => {
  it("formats a range in LPA", () => {
    expect(formatSalary(1200000, 1800000)).toBe("₹12.0–18.0 LPA");
  });
  it("handles open-ended and missing ranges", () => {
    expect(formatSalary(500000, null)).toBe("From ₹5.0 LPA");
    expect(formatSalary(null, 800000)).toBe("Up to ₹8.0 LPA");
    expect(formatSalary(null, null)).toBe("Salary not disclosed");
  });
});
