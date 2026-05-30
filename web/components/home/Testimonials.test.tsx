import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Testimonials } from "./Testimonials";

describe("Testimonials (story-homepage-06)", () => {
  it("renders the two §5.3 testimonials verbatim (AC#4)", () => {
    render(<Testimonials />);
    expect(screen.getByText("Sneha P.")).toBeInTheDocument();
    expect(screen.getByText("QA Manager, mid-sized dairy")).toBeInTheDocument();
    expect(screen.getByText(/pass the first time/)).toBeInTheDocument();

    expect(screen.getByText("Rohan I.")).toBeInTheDocument();
    expect(screen.getByText("Regulatory Lead, snacks brand")).toBeInTheDocument();
    expect(screen.getByText(/the way a working auditor actually thinks about them/)).toBeInTheDocument();
  });

  it("renders exactly two blockquotes", () => {
    const { container } = render(<Testimonials />);
    expect(container.querySelectorAll("blockquote")).toHaveLength(2);
  });
});
