import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useEffect } from "react";

vi.mock("@/components/turnstile/Turnstile", () => ({
  Turnstile: ({ onVerify }: { onVerify: (t: string) => void }) => {
    useEffect(() => onVerify("t"), [onVerify]);
    return <div data-testid="turnstile" />;
  },
}));

import { Footer } from "./Footer";
import { FooterNewsletterProvider } from "./FooterNewsletterContext";
import { NewsletterBanner } from "@/components/newsletter/NewsletterBanner";

describe("Footer (homepage-02)", () => {
  it("renders the four §2.2 columns (AC#6)", () => {
    render(
      <FooterNewsletterProvider>
        <Footer />
      </FooterNewsletterProvider>,
    );
    expect(screen.getByRole("heading", { name: "Explore" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Topics" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Contact" })).toBeInTheDocument();
    expect(screen.getByText(/safer food ecosystem/i)).toBeInTheDocument();
  });

  it("shows the mini newsletter when no full banner is on the page (AC#7)", () => {
    render(
      <FooterNewsletterProvider>
        <Footer />
      </FooterNewsletterProvider>,
    );
    expect(screen.getByLabelText("Newsletter")).toBeInTheDocument();
  });

  it("hides the mini newsletter when a full NewsletterBanner registers (AC#7)", () => {
    render(
      <FooterNewsletterProvider>
        <NewsletterBanner source="homepage" />
        <Footer />
      </FooterNewsletterProvider>,
    );
    // The full banner's email field exists; the footer's mini "Newsletter" label does not.
    expect(screen.queryByLabelText("Newsletter")).not.toBeInTheDocument();
  });
});

describe("Footer (story-homepage-11 chrome parity)", () => {
  it("Contact column includes a Newsletter link (DEVIATIONS B3, AC#1)", () => {
    render(
      <FooterNewsletterProvider>
        <Footer />
      </FooterNewsletterProvider>,
    );
    const contact = screen.getByRole("heading", { name: "Contact" }).closest("div");
    expect(contact).not.toBeNull();
    const newsletterLink = Array.from(contact!.querySelectorAll("a")).find(
      (a) => a.textContent?.trim() === "Newsletter",
    );
    expect(newsletterLink, "Newsletter link missing from Contact column").toBeTruthy();
  });

  it("Explore column includes Jobs and Experts links (DEVIATIONS D1, AC#2)", () => {
    render(
      <FooterNewsletterProvider>
        <Footer />
      </FooterNewsletterProvider>,
    );
    const exploreNav = screen.getByRole("navigation", { name: "Explore" });
    expect(exploreNav.querySelector('a[href="/jobs"]')).toBeTruthy();
    expect(exploreNav.querySelector('a[href="/experts"]')).toBeTruthy();
  });
});
