import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ValueStrip } from "./ValueStrip";

describe("ValueStrip (story-homepage-05 #2)", () => {
  it("renders the overline and the positioning value line (AC#10)", () => {
    render(<ValueStrip />);
    expect(screen.getByText(/For QA · QC · Regulatory · R&D teams/)).toBeInTheDocument();
    expect(screen.getByText(/so you don't have to rebuild from scratch/)).toBeInTheDocument();
  });
});
