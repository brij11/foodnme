import type { Metadata } from "next";
import { listArticles, getFeaturedArticle, getCategoryCounts, clampPage, parseSort } from "@/lib/articles";
import { ARTICLE_CATEGORIES, BLOG_POPULAR_TAGS } from "@/lib/categories";
import { PageHeader } from "@/components/listing/PageHeader";
import { ListingShell } from "@/components/listing/ListingShell";
import { ListingSidebar, type SidebarCategory } from "@/components/listing/ListingSidebar";
import { ArticleGrid } from "@/components/listing/ArticleGrid";
import { Pagination } from "@/components/listing/Pagination";
import { SortSelect } from "@/components/listing/SortSelect";
import { EmptyState } from "@/components/listing/EmptyState";
import { NewsletterBanner } from "@/components/newsletter/NewsletterBanner";
import { EditorialFeature } from "@/components/home/EditorialFeature";

export const metadata: Metadata = {
  title: "Food Technology Blog -- foodnme",
  description:
    "Practical guidance on food safety, quality control, regulatory compliance, and processing for food-tech professionals.",
  openGraph: {
    title: "Food Technology Blog -- foodnme",
    description:
      "Practical guidance on food safety, quality control, regulatory compliance, and processing.",
    type: "website",
  },
};

type SearchParams = { category?: string | string[]; page?: string | string[]; sort?: string | string[] };

function blogHref(category: string, sort: string) {
  const params = new URLSearchParams();
  if (category !== "all") params.set("category", category);
  if (sort === "oldest") params.set("sort", sort);
  const qs = params.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const page = clampPage(searchParams.page);
  const sort = parseSort(searchParams.sort);
  const activeSlug = category ?? "all";

  // Featured editorial slot: visible only on page 1 with no category filter (AC 1, 5).
  const showFeatured = activeSlug === "all" && page === 1;
  const featured = showFeatured ? await getFeaturedArticle() : null;

  const [result, counts] = await Promise.all([
    listArticles({
      category,
      page,
      sort,
      // Exclude the featured article from the grid so it doesn't appear twice (AC 1).
      excludeSlug: featured?.slug,
    }),
    getCategoryCounts(),
  ]);

  const sidebarCategories: SidebarCategory[] = [
    { slug: "all", label: "All" },
    ...ARTICLE_CATEGORIES.map((c) => ({ slug: c.slug, label: c.label })),
  ].map((c) => ({
    slug: c.slug,
    label: c.label,
    count: counts[c.slug] ?? 0,
    href: blogHref(c.slug, sort),
    active: activeSlug === c.slug,
  }));

  const sidebar = (
    <ListingSidebar
      searchType="articles"
      searchPlaceholder="Search all of foodnme..."
      categories={sidebarCategories}
      clearHref="/blog"
      popularTags={[...BLOG_POPULAR_TAGS]}
      newsletter={
        <NewsletterBanner
          mini
          source="blog"
          headline="The weekly food-tech brief"
          subtext="Practical guidance, once a week."
        />
      }
    />
  );

  const hrefForPage = (p: number) => {
    const params = new URLSearchParams();
    if (activeSlug !== "all") params.set("category", activeSlug);
    if (sort === "oldest") params.set("sort", sort);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  return (
    <div className="mx-auto max-w-content px-6 lg:px-12">
      <PageHeader
        overline="Knowledge Hub"
        title="Food Technology Blog"
        sub="Practical guidance on food safety, quality control, regulatory compliance, and processing -- written by working practitioners."
      />

      {showFeatured && featured ? (
        <div data-testid="blog-featured-slot" className="mb-12">
          <EditorialFeature article={featured} />
        </div>
      ) : null}

      <ListingShell sidebar={sidebar}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <p data-testid="result-count" className="font-body text-[0.85rem] text-muted">
            <strong className="font-semibold text-text">{result.total}</strong>{" "}
            {result.total === 1 ? "article" : "articles"}
          </p>
          <SortSelect />
        </div>

        {result.articles.length > 0 ? (
          <>
            <ArticleGrid key={`${activeSlug}-${page}-${sort}`} articles={result.articles} />
            <Pagination page={result.page} totalPages={result.totalPages} hrefForPage={hrefForPage} />
          </>
        ) : (
          <EmptyState
            variant="filter"
            title="No articles in this category yet"
            message="We haven't published anything here yet. Browse every article, or check back soon."
            action={{ label: "Browse all articles", href: "/blog" }}
          />
        )}
      </ListingShell>
    </div>
  );
}
