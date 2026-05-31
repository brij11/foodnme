import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { signOut: vi.fn().mockResolvedValue({}) } }),
}));

import { ExpertDashboard, type ExpertRow, type ExpertInquiry } from "./ExpertDashboard";

const expert: ExpertRow = {
  id: "aaaa-bbbb-cccc-dddd",
  full_name: "Dr. Aarti Menon",
  title: "FSSAI Lead Auditor",
  bio: "Twelve years auditing food safety systems.",
  specializations: ["Food Safety", "HACCP"],
  experience_years: 12,
  hourly_rate: 6000,
  certifications: ["FSSAI Lead Auditor"],
  location: "Mumbai · India",
  contact_email: "aarti@example.com",
  avatar_url: null,
  status: "active",
  is_available: true,
  rating: 4.9,
  review_count: 38,
  response_time: "< 24 hours",
};

const inquiries: ExpertInquiry[] = [
  {
    id: "inq-1",
    sender_name: "Kiran Mehta",
    sender_email: "kiran@example.com",
    company_name: "Spice Co.",
    engagement_type: "Project engagement",
    message: "Looking for HACCP help.",
    is_read: false,
    created_at: "2026-05-29T10:00:00Z",
  },
  {
    id: "inq-2",
    sender_name: "Rohini Das",
    sender_email: "rohini@example.com",
    company_name: null,
    engagement_type: "Hourly consult",
    message: "Need regulatory advice.",
    is_read: true,
    created_at: "2026-05-28T08:00:00Z",
  },
];

function renderDash(overrides: { expert?: ExpertRow | null; inquiries?: ExpertInquiry[] } = {}) {
  return render(
    <ExpertDashboard
      fullName="Dr. Aarti Menon"
      expert={overrides.expert !== undefined ? overrides.expert : expert}
      inquiries={overrides.inquiries ?? inquiries}
      profileDefaults={{ full_name: "Dr. Aarti Menon", email: "aarti@example.com" }}
    />,
  );
}

describe("ExpertDashboard parity (story-experts-13)", () => {
  it("renders the availability toggle on the overview header (AC3 / B11)", () => {
    renderDash();
    // The availability toggle should be inside the overview panel — not just in a separate tab.
    // It renders a switch role="switch" with aria-label.
    const toggleSwitch = screen.getByRole("switch", { name: /available for work/i });
    expect(toggleSwitch).toBeInTheDocument();
    expect(toggleSwitch).toHaveAttribute("aria-checked", "true");
  });

  it("availability toggle reflects is_available=false (AC3)", () => {
    renderDash({ expert: { ...expert, is_available: false } });
    const toggleSwitch = screen.getByRole("switch", { name: /available for work/i });
    expect(toggleSwitch).toHaveAttribute("aria-checked", "false");
  });

  it("renders the 4-card stats grid with correct labels (AC2 / B10)", () => {
    renderDash();
    const grid = screen.getByTestId("expert-stats");
    expect(within(grid).getByText("Inquiries")).toBeInTheDocument();
    expect(within(grid).getByText("Avg. rating")).toBeInTheDocument();
    expect(within(grid).getByText("Response time")).toBeInTheDocument();
    expect(within(grid).getByText("Availability")).toBeInTheDocument();
  });

  it("stats grid shows inquiry count from actual data (AC2)", () => {
    renderDash();
    const grid = screen.getByTestId("expert-stats");
    // 2 inquiries provided
    expect(within(grid).getByText("2")).toBeInTheDocument();
  });

  it("stats grid shows 'Available' when expert is available (AC2)", () => {
    renderDash();
    const grid = screen.getByTestId("expert-stats");
    expect(within(grid).getByText("Available")).toBeInTheDocument();
  });

  it("shows '—' for avg rating when no reviews (AC2)", () => {
    renderDash({ expert: { ...expert, review_count: 0, rating: null } });
    const grid = screen.getByTestId("expert-stats");
    expect(within(grid).getByText("—")).toBeInTheDocument();
  });

  it("does not render the availability toggle in overview when expert profile is null (AC3)", () => {
    renderDash({ expert: null });
    // With no expert, no toggle should appear
    expect(screen.queryByRole("switch")).toBeNull();
  });
});

describe("ExpertDashboard stats tiles — unchanged (story-auth-10 AC#4)", () => {
  // AC#4: ExpertDashboard tiles match amended §3.8 — Inquiries, Avg rating, Response time, Availability
  it("renders exactly the 4 modeled tiles and nothing more (AC#4)", () => {
    renderDash();
    const grid = screen.getByTestId("expert-stats");
    expect(within(grid).getByText("Inquiries")).toBeInTheDocument();
    expect(within(grid).getByText("Avg. rating")).toBeInTheDocument();
    expect(within(grid).getByText("Response time")).toBeInTheDocument();
    expect(within(grid).getByText("Availability")).toBeInTheDocument();
  });

  // story-auth-10 AC#4: Profile views tile absent (not shown even as placeholder)
  it("does NOT render a 'Profile views' tile (AC#4)", () => {
    renderDash();
    const grid = screen.getByTestId("expert-stats");
    expect(within(grid).queryByText("Profile views")).toBeNull();
  });

  // story-auth-10 AC#4: Active engagements tile absent (not shown even as placeholder)
  it("does NOT render an 'Active engagements' tile (AC#4)", () => {
    renderDash();
    const grid = screen.getByTestId("expert-stats");
    expect(within(grid).queryByText("Active engagements")).toBeNull();
  });
});
