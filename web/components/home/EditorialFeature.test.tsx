import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EditorialFeature } from "./EditorialFeature";
import type { ArticleListItem } from "@/lib/articles";

const article: ArticleListItem = {
  title: "A practical HACCP rollout",
  slug: "haccp-rollout",
  excerpt: "The shortest path to a defensible system.",
  category: "food-safety",
  tags: ["HACCP"],
  cover_image_url: "https://example.test/cover.jpg",
  author_name: "Dr. Aarti Menon",
  author: {
    id: "1",
    full_name: "Dr. Aarti Menon",
    title: "FSSAI Auditor",
    avatar_url: null,
    bio: "",
    specializations: [],
    linkedin_url: null,
    twitter_url: null,
  },
  read_time_mins: 9,
  published_at: "2026-05-12T09:00:00Z",
};

describe("EditorialFeature (story-homepage-06)", () => {
  it("renders the feature as an H2 link to /blog/[slug] with a Featured tag (AC#1)", () => {
    render(<EditorialFeature article={article} />);
    const heading = screen.getByRole("heading", { level: 2, name: /A practical HACCP rollout/ });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(screen.getByText(/Food Safety/)).toBeInTheDocument();
    expect(screen.getByText(/9 min read/)).toBeInTheDocument();
    expect(screen.getByText(/shortest path to a defensible system/)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/blog/haccp-rollout");
  });

  it("renders the author row (name + role)", () => {
    render(<EditorialFeature article={article} />);
    expect(screen.getByText("Dr. Aarti Menon")).toBeInTheDocument();
    expect(screen.getByText(/FSSAI Auditor/)).toBeInTheDocument();
  });

  it("never emits an H1 — the page H1 stays the hero (AC#9)", () => {
    render(<EditorialFeature article={article} />);
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });

  it("renders nothing when there is no published article", () => {
    const { container } = render(<EditorialFeature article={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
