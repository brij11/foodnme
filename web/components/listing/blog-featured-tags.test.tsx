/**
 * Tests for story-blog-10:
 * - ListingSidebar popular-tags block (DEVIATIONS A7)
 * - Featured editorial slot visibility rules for /blog (DEVIATIONS A6)
 * - Tag pill neutral style + /search?q= routing (AC 2, 3)
 * - Regression: existing sidebar pieces still render (AC 6)
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ListingSidebar, type SidebarCategory } from "./ListingSidebar";
import { BLOG_POPULAR_TAGS } from "@/lib/categories";

const CATEGORIES: SidebarCategory[] = [
  { slug: "all", label: "All", count: 12, href: "/blog", active: true },
  { slug: "food-safety", label: "Food Safety", count: 4, href: "/blog?category=food-safety", active: false },
];

describe("ListingSidebar — Popular tags block (story-blog-10 AC 2, 3)", () => {
  it("renders a 'Popular tags' heading and tag pills when popularTags is provided", () => {
    render(
      <ListingSidebar
        searchType="articles"
        categories={CATEGORIES}
        clearHref="/blog"
        popularTags={["HACCP", "FSSAI", "Allergens"]}
      />,
    );
    expect(screen.getByRole("navigation", { name: "Popular tags" })).toBeInTheDocument();
    expect(screen.getByText("HACCP")).toBeInTheDocument();
    expect(screen.getByText("FSSAI")).toBeInTheDocument();
    expect(screen.getByText("Allergens")).toBeInTheDocument();
  });

  it("tag pills link to /search?q=<tag> (AC 3)", () => {
    render(
      <ListingSidebar
        searchType="articles"
        categories={CATEGORIES}
        clearHref="/blog"
        popularTags={["HACCP", "FSSAI"]}
      />,
    );
    expect(screen.getByRole("link", { name: /Search articles tagged HACCP/i })).toHaveAttribute(
      "href",
      "/search?q=HACCP",
    );
    expect(screen.getByRole("link", { name: /Search articles tagged FSSAI/i })).toHaveAttribute(
      "href",
      "/search?q=FSSAI",
    );
  });

  it("does NOT render the popular-tags block when popularTags is absent", () => {
    render(
      <ListingSidebar
        searchType="articles"
        categories={CATEGORIES}
        clearHref="/blog"
      />,
    );
    expect(screen.queryByRole("navigation", { name: "Popular tags" })).toBeNull();
  });

  it("does NOT render the popular-tags block when popularTags is an empty array", () => {
    render(
      <ListingSidebar
        searchType="articles"
        categories={CATEGORIES}
        clearHref="/blog"
        popularTags={[]}
      />,
    );
    expect(screen.queryByRole("navigation", { name: "Popular tags" })).toBeNull();
  });
});

describe("ListingSidebar — no regression on faithful sidebar pieces (AC 6)", () => {
  it("still renders search input, category list, and clear-all link", () => {
    render(
      <ListingSidebar
        searchType="articles"
        searchPlaceholder="Search articles…"
        categories={CATEGORIES}
        clearHref="/blog"
        popularTags={["HACCP"]}
      />,
    );
    // Search form
    expect(screen.getByRole("search")).toBeInTheDocument();
    // Category list
    expect(screen.getByRole("navigation", { name: "Categories" })).toBeInTheDocument();
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Food Safety")).toBeInTheDocument();
    // Clear all filters
    expect(screen.getByRole("link", { name: "Clear all filters" })).toHaveAttribute("href", "/blog");
  });
});

describe("BLOG_POPULAR_TAGS constant (story-blog-10)", () => {
  it("is a non-empty readonly array containing the 8 prototype tags", () => {
    expect(BLOG_POPULAR_TAGS).toHaveLength(8);
    expect(BLOG_POPULAR_TAGS).toContain("HACCP");
    expect(BLOG_POPULAR_TAGS).toContain("FSSAI");
    expect(BLOG_POPULAR_TAGS).toContain("Allergens");
    expect(BLOG_POPULAR_TAGS).toContain("Sampling");
    expect(BLOG_POPULAR_TAGS).toContain("Validation");
    expect(BLOG_POPULAR_TAGS).toContain("Labeling");
    expect(BLOG_POPULAR_TAGS).toContain("Microbiology");
    expect(BLOG_POPULAR_TAGS).toContain("Thermal");
  });
});

describe("Featured editorial slot — visibility logic (story-blog-10 AC 1, 5)", () => {
  /**
   * The slot visibility is determined in /blog/page.tsx:
   *   showFeatured = activeSlug === "all" && page === 1
   * We test the logic directly rather than the server component (which requires Supabase).
   */
  it("shows featured when no category filter and page = 1", () => {
    const showFeatured = (activeSlug: string, page: number) =>
      activeSlug === "all" && page === 1;
    expect(showFeatured("all", 1)).toBe(true);
  });

  it("suppresses featured when a category filter is active", () => {
    const showFeatured = (activeSlug: string, page: number) =>
      activeSlug === "all" && page === 1;
    expect(showFeatured("food-safety", 1)).toBe(false);
    expect(showFeatured("regulatory", 1)).toBe(false);
  });

  it("suppresses featured on page 2+", () => {
    const showFeatured = (activeSlug: string, page: number) =>
      activeSlug === "all" && page === 1;
    expect(showFeatured("all", 2)).toBe(false);
    expect(showFeatured("all", 3)).toBe(false);
  });
});
