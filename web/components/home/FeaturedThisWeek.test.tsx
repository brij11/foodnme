import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeaturedThisWeek } from "./FeaturedThisWeek";
import type { FeaturedTemplate } from "@/lib/resources";
import type { FeaturedExpert } from "@/lib/experts";

const template: FeaturedTemplate = {
  id: "t1",
  title: "HACCP Plan Template — Dairy",
  slug: "haccp-plan-template-dairy",
  description: "An audit-ready HACCP plan you can adapt in an afternoon.",
  category: "haccp",
  file_type: "docx",
  is_free: true,
  download_count: 1840,
  created_at: "2026-05-01T00:00:00Z",
};

const expert: FeaturedExpert = {
  id: "e1",
  full_name: "Dr. Aarti Menon",
  title: "FSSAI Auditor",
  avatar_url: null,
  specializations: ["HACCP"],
  bio: "Two decades auditing dairy and processing lines.",
  hourly_rate: 6000,
  location: "Mumbai",
  is_available: true,
  is_featured: true,
  rating: 4.9,
  review_count: 12,
  response_time: "1 day",
  experience_years: 20,
};

describe("FeaturedThisWeek (story-homepage-07)", () => {
  it("renders the most-downloaded template card linking to /templates/[slug] (AC#2)", () => {
    render(<FeaturedThisWeek template={template} expert={expert} />);
    expect(screen.getByText(/Most downloaded · 1,840/)).toBeInTheDocument();
    expect(screen.getByText("DOCX")).toBeInTheDocument();
    expect(screen.getByText(/HACCP Plan Template/)).toBeInTheDocument();
    expect(screen.getByText(/Updated/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /HACCP Plan Template/ })).toHaveAttribute(
      "href",
      "/templates/haccp-plan-template-dairy",
    );
  });

  it("renders the featured expert card with title · years + availability (AC#3)", () => {
    render(<FeaturedThisWeek template={template} expert={expert} />);
    expect(screen.getByText("Dr. Aarti Menon")).toBeInTheDocument();
    expect(screen.getByText(/FSSAI Auditor · 20 yrs/)).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Dr. Aarti Menon/ })).toHaveAttribute(
      "href",
      "/experts/e1",
    );
  });

  it("renders a §5.4 stub when no expert is available — never a broken card (AC#4)", () => {
    render(<FeaturedThisWeek template={template} expert={null} />);
    expect(screen.getByText("More experts coming soon")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Explore experts/ })).toHaveAttribute("href", "/experts");
    // No expert profile link rendered.
    expect(screen.queryByText("Available")).toBeNull();
  });

  it("renders nothing when there is no featured template", () => {
    const { container } = render(<FeaturedThisWeek template={null} expert={expert} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("uses an H2 section heading — page H1 stays the hero", () => {
    render(<FeaturedThisWeek template={template} expert={expert} />);
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: /Two things worth your time/ })).toBeInTheDocument();
  });

  it("renders the DOCX expert file-type/availability text in the busy state too", () => {
    render(<FeaturedThisWeek template={template} expert={{ ...expert, is_available: false }} />);
    expect(screen.getByText("Busy")).toBeInTheDocument();
  });
});
