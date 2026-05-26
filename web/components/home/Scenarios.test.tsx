import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Scenarios } from "./Scenarios";

describe("Scenarios (story-homepage-05 #3)", () => {
  it("renders 4 need-framings linking to the matching products (AC#11)", () => {
    render(<Scenarios />);
    const cases: ReadonlyArray<readonly [string, string]> = [
      ["Audit on Monday?", "/templates"],
      ["Wondering about the new FSSAI rules?", "/blog"],
      ["Hiring a QC microbiologist?", "/jobs"],
      ["Need expert eyes on a problem?", "/experts"],
    ];
    for (const [hook, href] of cases) {
      const link = screen.getByText(hook).closest("a");
      expect(link).not.toBeNull();
      expect(link).toHaveAttribute("href", href);
    }
  });
});
