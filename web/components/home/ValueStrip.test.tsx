import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ValueStrip } from "./ValueStrip";

describe("ValueStrip (story-homepage-05 #2 + story-homepage-12)", () => {
  it("renders the overline and the positioning value line (AC#10)", () => {
    render(<ValueStrip />);
    expect(screen.getByText(/For QA · QC · Regulatory · R&D teams/)).toBeInTheDocument();
    expect(screen.getByText(/so you don't have to rebuild from scratch/)).toBeInTheDocument();
  });

  it("left-edge accent uses border-primary (green), not border-accent (amber) (story-homepage-12 AC4)", () => {
    const { container } = render(<ValueStrip />);
    const accentBorder = container.querySelector(".border-l-\\[3px\\]");
    expect(accentBorder).not.toBeNull();
    expect(accentBorder?.className).toContain("border-primary");
    expect(accentBorder?.className).not.toContain("border-accent");
  });
});
