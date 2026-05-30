import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { AuthorChip } from "./AuthorChip";
import { AuthorBioCard } from "./AuthorBioCard";
import type { AuthorExpert } from "@/lib/articles";

const fullAuthor: AuthorExpert = {
  id: "11111111-1111-1111-1111-111111111111",
  full_name: "Dr. Aarti Menon",
  title: "FSSAI Lead Auditor",
  avatar_url: null,
  bio: "Twelve years auditing food safety systems.",
  specializations: ["HACCP"],
  linkedin_url: "https://www.linkedin.com/in/aarti-menon",
  twitter_url: "https://twitter.com/aartimenon",
};

const bareAuthor: AuthorExpert = {
  id: "22222222-2222-2222-2222-222222222222",
  full_name: "Jane Doe",
  title: "",
  avatar_url: null,
  bio: "",
  specializations: [],
  linkedin_url: null,
  twitter_url: null,
};

describe("AuthorChip (story-blog-07 — header chip)", () => {
  it("renders name, role, date, and both social links (AC#1)", () => {
    render(<AuthorChip author={fullAuthor} publishedAt="2026-05-12T09:00:00Z" />);
    expect(screen.getByText("Dr. Aarti Menon")).toBeInTheDocument();
    expect(screen.getByText(/FSSAI Lead Auditor/)).toBeInTheDocument();
    expect(screen.getByText(/May 12, 2026/)).toBeInTheDocument();
    // initials when no avatar (honorific stripped → "AM").
    expect(screen.getByText("AM")).toBeInTheDocument();

    const li = screen.getByRole("link", { name: /Aarti Menon on LinkedIn/ });
    expect(li).toHaveAttribute("href", fullAuthor.linkedin_url);
    expect(li).toHaveAttribute("target", "_blank");
    expect(li).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: /Aarti Menon on Twitter/ })).toBeInTheDocument();
  });

  it("omits a social link when its handle is absent (AC#1, #7)", () => {
    render(<AuthorChip author={bareAuthor} publishedAt="2026-05-12T09:00:00Z" />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /LinkedIn/ })).toBeNull();
    expect(screen.queryByRole("link", { name: /Twitter/ })).toBeNull();
  });
});

describe("AuthorBioCard (story-blog-07 — bio card)", () => {
  it("renders name, role, bio, socials, article count, and a site contact (AC#2, #5)", () => {
    render(<AuthorBioCard author={fullAuthor} articleCount={4} />);
    expect(screen.getByText("About the author")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dr. Aarti Menon" })).toBeInTheDocument();
    expect(screen.getByText("FSSAI Lead Auditor")).toBeInTheDocument();
    expect(screen.getByText(/Twelve years auditing/)).toBeInTheDocument();
    expect(screen.getByText("4 articles")).toBeInTheDocument();

    const linkedin = screen.getByRole("link", { name: /Aarti Menon on LinkedIn/ });
    expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");
    expect(linkedin).toHaveAttribute("target", "_blank");

    // site contact is a generic mailto — never the expert's server-only contact_email.
    const mail = screen.getByRole("link", { name: /hello@foodnme\.in/ });
    expect(mail).toHaveAttribute("href", "mailto:hello@foodnme.in");
  });

  it("pluralizes the article count correctly", () => {
    render(<AuthorBioCard author={fullAuthor} articleCount={1} />);
    expect(screen.getByText("1 article")).toBeInTheDocument();
  });

  it("degrades cleanly when bio / socials / avatar are missing (AC#7)", () => {
    const { container } = render(<AuthorBioCard author={bareAuthor} articleCount={0} />);
    expect(screen.getByRole("heading", { name: "Jane Doe" })).toBeInTheDocument();
    // no role line, no bio, no social links — but the card and count still render.
    expect(within(container).queryByRole("link", { name: /LinkedIn|Twitter/ })).toBeNull();
    expect(screen.getByText("0 articles")).toBeInTheDocument();
    expect(screen.getByText("JD")).toBeInTheDocument(); // initials fallback, no avatar
  });
});
