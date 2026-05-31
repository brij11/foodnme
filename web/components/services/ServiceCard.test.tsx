import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ServiceCard } from "./ServiceCard";
import type { Service } from "@/lib/services";

const mockService: Service = {
  slug: "fssai-compliance",
  name: "FSSAI Compliance",
  short: "License, renewals, and category-specific compliance support.",
  icon: "shield",
  overline: "Compliance",
};

describe("ServiceCard (story-homepage-13)", () => {
  it("renders the service name, overline, and short description (AC2)", () => {
    render(<ServiceCard service={mockService} />);
    expect(screen.getByText("FSSAI Compliance")).toBeInTheDocument();
    expect(screen.getByText("Compliance")).toBeInTheDocument();
    expect(screen.getByText(/License, renewals/)).toBeInTheDocument();
  });

  it("'Learn more' is an anchor pointing to #inquiry (AC2)", () => {
    render(<ServiceCard service={mockService} />);
    const link = screen.getByRole("link", { name: /learn more/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "#inquiry");
  });

  it("'Learn more' uses ghost-button treatment — no underline class, has arrow-grow (AC2/D6)", () => {
    render(<ServiceCard service={mockService} />);
    const link = screen.getByRole("link", { name: /learn more/i });
    // Ghost button: should NOT have 'underline' as a direct class
    expect(link.className).not.toContain(" underline");
    // Ghost button: should have the after:content-['→'] arrow-grow pattern
    expect(link.className).toContain("after:content-");
    expect(link.className).toContain("hover:after:translate-x-1");
    // Ghost button: transparent background, primary text
    expect(link.className).toContain("text-primary");
  });

  it("card lifts on hover (has group + hover:-translate-y CSS)", () => {
    const { container } = render(<ServiceCard service={mockService} />);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain("group");
    expect(card.className).toContain("hover:-translate-y-[2px]");
  });
});
