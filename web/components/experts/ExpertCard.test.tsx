import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ExpertCard } from "./ExpertCard";
import type { ExpertCardData } from "@/lib/experts";

const base: ExpertCardData = {
  id: "11111111-1111-1111-1111-111111111111",
  full_name: "Dr. Aarti Menon",
  title: "FSSAI Lead Auditor",
  avatar_url: null,
  specializations: ["Food Safety", "HACCP", "Auditing", "Compliance"],
  bio: "Twelve years auditing and implementing food safety systems for Indian food businesses.",
  hourly_rate: 6000,
  location: "Mumbai · India",
  is_available: true,
  is_featured: true,
  rating: 4.9,
  review_count: 38,
  response_time: "< 24 hours",
};

describe("ExpertCard enrichment (story-experts-09)", () => {
  it("shows the rating: star + numeric rating + review count (AC#1)", () => {
    render(<ExpertCard expert={base} />);
    const rating = screen.getByTestId("rating");
    expect(within(rating).getByText("4.9")).toBeInTheDocument();
    expect(within(rating).getByText("(38 reviews)")).toBeInTheDocument();
  });

  it("renders a clamped bio snippet (AC#2)", () => {
    render(<ExpertCard expert={base} />);
    const bio = screen.getByText(/Twelve years auditing/);
    expect(bio.className).toContain("line-clamp-2");
  });

  it("shows up to 3 specialization tags, not all 4 (AC#3)", () => {
    render(<ExpertCard expert={base} />);
    expect(screen.getByText("Food Safety")).toBeInTheDocument();
    expect(screen.getByText("HACCP")).toBeInTheDocument();
    expect(screen.getByText("Auditing")).toBeInTheDocument();
    expect(screen.queryByText("Compliance")).toBeNull();
  });

  it("falls back to 'New' when the expert has no reviews (AC#4)", () => {
    render(<ExpertCard expert={{ ...base, review_count: 0, rating: null }} />);
    const rating = screen.getByTestId("rating");
    expect(within(rating).getByText("New")).toBeInTheDocument();
    expect(within(rating).queryByText(/review/)).toBeNull();
  });

  it("singularizes a one-review count", () => {
    render(<ExpertCard expert={{ ...base, review_count: 1, rating: 5.0 }} />);
    expect(screen.getByText("(1 review)")).toBeInTheDocument();
  });

  it("preserves avatar initials, availability, rate, and View profile (AC#5)", () => {
    render(<ExpertCard expert={base} />);
    expect(screen.getByText("AM")).toBeInTheDocument(); // initials, no avatar
    expect(screen.getByTestId("availability")).toHaveTextContent("Available");
    expect(screen.getByText("₹6,000/hr")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View profile" })).toHaveAttribute(
      "href",
      "/experts/11111111-1111-1111-1111-111111111111",
    );
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });
});
