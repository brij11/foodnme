import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { JobCard } from "./JobCard";
import type { JobCardData } from "@/lib/jobs";

const base: JobCardData = {
  id: "33333333-3333-3333-3333-333333333333",
  title: "Quality Assurance Manager",
  company_name: "Amul Foods",
  location: "Anand, Gujarat",
  job_type: "Full-time",
  salary_min: 1200000,
  salary_max: 1800000,
  experience_level: "Senior",
  skills: ["HACCP", "FSSAI", "ISO 22000", "Dairy"],
  is_featured: true,
  description: "Lead QA across two dairy lines. Own HACCP, GMP, and supplier qualification.",
  applicant_count: 24,
  // far in the past → stable absolute "Jan 15" (no relative-to-now flakiness).
  created_at: "2020-01-15T09:00:00Z",
};

describe("JobCard enrichment (story-jobs-10)", () => {
  it("shows posted date + applicant count (AC#1)", () => {
    render(<JobCard job={base} />);
    const meta = screen.getByTestId("job-meta");
    expect(meta).toHaveTextContent("Jan 15");
    expect(meta).toHaveTextContent("24 applicants");
  });

  it("shows location, job type, and experience level (AC#2)", () => {
    render(<JobCard job={base} />);
    expect(screen.getByText("Anand, Gujarat")).toBeInTheDocument();
    expect(screen.getByText("Full-time")).toBeInTheDocument();
    expect(screen.getByText("Senior")).toBeInTheDocument();
  });

  it("shows a clamped description snippet (AC#3)", () => {
    render(<JobCard job={base} />);
    const desc = screen.getByText(/Lead QA across two dairy lines/);
    expect(desc.className).toContain("line-clamp-2");
  });

  it("renders a Featured badge only for featured roles (AC#4)", () => {
    const { rerender } = render(<JobCard job={base} />);
    expect(screen.getByText("Featured")).toBeInTheDocument();
    rerender(<JobCard job={{ ...base, is_featured: false }} />);
    expect(screen.queryByText("Featured")).toBeNull();
  });

  it("singularizes a one-applicant count", () => {
    render(<JobCard job={{ ...base, applicant_count: 1 }} />);
    expect(screen.getByTestId("job-meta")).toHaveTextContent("1 applicant");
    expect(screen.getByTestId("job-meta")).not.toHaveTextContent("1 applicants");
  });

  it("preserves salary + View job link (no regression)", () => {
    render(<JobCard job={base} />);
    expect(screen.getByText("₹12.0–18.0 LPA")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View job" })).toHaveAttribute(
      "href",
      "/jobs/33333333-3333-3333-3333-333333333333",
    );
  });
});
