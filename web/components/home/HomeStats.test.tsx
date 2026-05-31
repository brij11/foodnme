import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeStats } from "./HomeStats";
import type { SiteStats } from "@/lib/stats";

const stats: SiteStats = {
  articles: 120,
  templates: 48,
  categories: 5,
  subscribers: 4200,
  businesses: 85,
  consultations: 90,
};

beforeEach(() => {
  // Reduced motion → CountUp renders the final value immediately (deterministic).
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: true,
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
});

describe("HomeStats (story-homepage-06 + story-homepage-12)", () => {
  it("renders the 4 mid-page counts with their labels (AC#5)", () => {
    render(<HomeStats stats={stats} />);
    expect(screen.getByText("Articles Published")).toBeInTheDocument();
    expect(screen.getByText("Templates")).toBeInTheDocument();
    expect(screen.getByText("Industry Topics")).toBeInTheDocument();
    expect(screen.getByText("Consultations Done")).toBeInTheDocument();
  });

  it("marks the growing counts approximate with '+' (AC#6)", () => {
    render(<HomeStats stats={stats} />);
    expect(screen.getByText("120+")).toBeInTheDocument(); // Articles
    expect(screen.getByText("90+")).toBeInTheDocument(); // Consultations
    expect(screen.getByText("48")).toBeInTheDocument(); // Templates (exact)
    expect(screen.getByText("5")).toBeInTheDocument(); // Industry Topics (exact)
  });

  it("stat numbers use font-heading (Inter), not font-display (Fraunces) (story-homepage-12 AC2)", () => {
    const { container } = render(<HomeStats stats={stats} />);
    // Each stat cell's number <div> is the first child div in each grid cell
    const numDivs = container.querySelectorAll(".grid > div > div:first-child");
    expect(numDivs.length).toBeGreaterThan(0);
    numDivs.forEach((el) => {
      expect(el.className).toContain("font-heading");
      expect(el.className).not.toContain("font-display");
    });
  });
});
