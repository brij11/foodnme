import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CountUp } from "./CountUp";

function setReducedMotion(reduce: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: reduce,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    }),
  });
}

describe("CountUp (§4.10)", () => {
  beforeEach(() => setReducedMotion(true));

  it("renders the value with a suffix", () => {
    render(<CountUp value={120} suffix="+" />);
    expect(screen.getByText("120+")).toBeInTheDocument();
  });

  it("formats thousands as one-decimal k (§5.2)", () => {
    render(<CountUp value={4200} thousands />);
    expect(screen.getByText("4.2k")).toBeInTheDocument();
  });

  it("under reduced motion stays at the final value (no count from 0)", () => {
    render(<CountUp value={48} />);
    expect(screen.getByText("48")).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
