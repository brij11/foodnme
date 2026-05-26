import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ConsultationModalProvider } from "@/components/consultation/ConsultationModalProvider";
import { Hero } from "./Hero";
import type { SiteStats } from "@/lib/stats";

const stats: SiteStats = {
  articles: 120,
  templates: 48,
  categories: 12,
  subscribers: 4200,
  businesses: 85,
  consultations: 90,
};

function renderHero(covers: string[] = []) {
  return render(
    <ConsultationModalProvider>
      <Hero stats={stats} covers={covers} />
    </ConsultationModalProvider>,
  );
}

beforeEach(() => {
  // Reduced motion → CountUp renders final values immediately (deterministic).
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

describe("Hero (story-homepage-05)", () => {
  it("renders exactly one H1 with the hero headline (AC#4)", () => {
    renderHero();
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Practical resources for a safer food ecosystem.");
  });

  it("renders the pill badge (AC#5)", () => {
    renderHero();
    expect(screen.getByText(/Food-Tech Resource Hub/)).toBeInTheDocument();
  });

  it("renders the lead copy (AC#6)", () => {
    renderHero();
    expect(screen.getByText(/who ship product on Monday morning/)).toBeInTheDocument();
  });

  it("renders both CTAs — Browse templates + Book a consultation, no 'Free' (AC#7)", () => {
    renderHero();
    const browse = screen.getByRole("link", { name: /Browse templates/ });
    expect(browse).toHaveAttribute("href", "/templates");
    expect(browse).not.toHaveTextContent(/Free/i);
    expect(screen.getByRole("button", { name: /Book a consultation/ })).toBeInTheDocument();
  });

  it("renders the 4-stat strip with the final counts (AC#8)", () => {
    renderHero();
    // Scope to the stat strip — the decorative (aria-hidden) collage also carries a
    // "4.2k Subscribers" flourish.
    const strip = within(screen.getByTestId("hero-stats"));
    expect(strip.getByText("Articles")).toBeInTheDocument();
    expect(strip.getByText("Templates")).toBeInTheDocument();
    expect(strip.getByText("Businesses Helped")).toBeInTheDocument();
    expect(strip.getByText("Subscribers")).toBeInTheDocument();
    expect(strip.getByText("120+")).toBeInTheDocument();
    expect(strip.getByText("4.2k")).toBeInTheDocument();
  });

  it("hardcodes no external image URLs — collage covers are data-driven (AC#9)", () => {
    const { container } = renderHero([]);
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });
});
