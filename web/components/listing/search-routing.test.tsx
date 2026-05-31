/**
 * story-blog-11 — Blog/category search behavior (in-page filter vs /search)
 *
 * AC 3: /blog and /blog/category/* search inputs route to /search (no in-page ?q= filtering).
 * AC 4: Category page search behaves identically to the blog listing.
 *
 * Both surfaces use the same ListingSidebar component, so a single rendering test
 * covers both. We assert the form action, method, hidden type field, and placeholder copy.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ListingSidebar } from "./ListingSidebar";

const stubCategories = [
  { slug: "all", label: "All", count: 12, href: "/blog", active: true },
  {
    slug: "food-safety",
    label: "Food Safety",
    count: 4,
    href: "/blog?category=food-safety",
    active: false,
  },
];

describe("ListingSidebar search routing — delegate to /search (story-blog-11)", () => {
  it("search form routes to /search, not to the listing page (AC 3)", () => {
    render(
      <ListingSidebar
        searchType="articles"
        searchPlaceholder="Search all of foodnme…"
        categories={stubCategories}
        clearHref="/blog"
      />,
    );
    const form = screen.getByRole("search");
    expect(form).toHaveAttribute("action", "/search");
    expect(form).toHaveAttribute("method", "get");
  });

  it("carries a hidden type field so /search knows the entity scope (AC 3)", () => {
    render(
      <ListingSidebar
        searchType="articles"
        searchPlaceholder="Search all of foodnme…"
        categories={stubCategories}
        clearHref="/blog"
      />,
    );
    const form = screen.getByRole("search");
    const typeInput = form.querySelector('input[name="type"]') as HTMLInputElement | null;
    expect(typeInput).not.toBeNull();
    expect(typeInput?.value).toBe("articles");
  });

  it("placeholder conveys global-search intent, not in-page filter (AC 3)", () => {
    render(
      <ListingSidebar
        searchType="articles"
        searchPlaceholder="Search all of foodnme…"
        categories={stubCategories}
        clearHref="/blog"
      />,
    );
    const input = screen.getByRole("searchbox");
    // The placeholder "Search all of foodnme…" makes it clear this navigates to /search,
    // not filters the current listing in place.
    expect(input).toHaveAttribute("placeholder", "Search all of foodnme…");
    // Ensure it's NOT the old ambiguous "Search articles…" copy
    expect(input.getAttribute("placeholder")).not.toBe("Search articles…");
  });

  it("form action does not point to /blog — no in-page ?q= filter (AC 3)", () => {
    render(
      <ListingSidebar
        searchType="articles"
        searchPlaceholder="Search all of foodnme…"
        categories={stubCategories}
        clearHref="/blog"
      />,
    );
    const form = screen.getByRole("search");
    // Routing to /blog or /blog/category/* would imply in-page filtering — must not happen
    expect(form.getAttribute("action")).not.toMatch(/^\/blog/);
  });

  /**
   * AC 4: Category page search behaves identically to blog listing.
   * Both /blog and /blog/category/* pass searchType="articles" and the same placeholder
   * to the same ListingSidebar component, so the routing contract is identical.
   * We verify this with a second render using category-page-style props.
   */
  it("category listing search routes identically — same component contract (AC 4)", () => {
    // Simulate the /blog/category/food-safety sidebar props
    const categoryCategories = [
      { slug: "all", label: "All", count: 12, href: "/blog", active: false },
      {
        slug: "food-safety",
        label: "Food Safety",
        count: 4,
        href: "/blog/category/food-safety",
        active: true,
      },
    ];
    render(
      <ListingSidebar
        searchType="articles"
        searchPlaceholder="Search all of foodnme…"
        categories={categoryCategories}
        clearHref="/blog"
      />,
    );
    const form = screen.getByRole("search");
    expect(form).toHaveAttribute("action", "/search");
    expect(form).toHaveAttribute("method", "get");
    const typeInput = form.querySelector('input[name="type"]') as HTMLInputElement | null;
    expect(typeInput?.value).toBe("articles");
  });
});
