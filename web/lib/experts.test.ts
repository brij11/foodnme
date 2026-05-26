import { describe, it, expect } from "vitest";
import { expertInitials, formatHourlyRate } from "./experts";

describe("expertInitials (story-experts-01)", () => {
  it("takes two initials, skipping an honorific", () => {
    expect(expertInitials("Dr. Aarti Menon")).toBe("AM");
    expect(expertInitials("Vikram Shah")).toBe("VS");
    expect(expertInitials("Karthik Subramanian")).toBe("KS");
  });

  it("handles a single name and falls back to FN when empty", () => {
    expect(expertInitials("Aarti")).toBe("A");
    expect(expertInitials("   ")).toBe("FN");
  });
});

describe("formatHourlyRate (story-experts-01)", () => {
  it("formats an integer rate in Indian grouping", () => {
    expect(formatHourlyRate(6000)).toBe("₹6,000/hr");
    expect(formatHourlyRate(450000)).toBe("₹4,50,000/hr");
  });

  it("renders a fallback when the rate is unset", () => {
    expect(formatHourlyRate(null)).toBe("Rate on request");
  });
});
