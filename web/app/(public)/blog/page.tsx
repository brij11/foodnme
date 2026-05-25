import type { Metadata } from "next";
import { listArticles, getCategoryCounts, clampPage, parseSort } from "@/lib/articles";
import { ARTICLE_CATEGORIES } from "@/lib/categories";
import { PageHeader } from "@/components/listing/PageHeader";
import { ListingShell } from "@/components/listing/ListingShell";
import { ListingSidebar, type SidebarCategory } from "@/components/listing/ListingSidebar";
import { ArticleGrid } from "@/components/listing/ArticleGrid";
import { Pagination } from "@/components/listing/Pagination";
import { SortSelect } from "@/components/listing/SortSelect";
import { EmptyState } from "@/components/listing/EmptyState";
import { NewsletterBanner } from "@/components/newsletter/NewsletterBanner";

export const metadata: Metadata = {
  title: "Food Technology Blog — foodnme",
  description:
    "Practical guidance on food safety, quality control, regulatory compliance, and processing for food-tech professionals.",
  openGraph: {
    title: "Food Technology Blog — foodnme",
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

  const [result, counts] = await Promise.all([
    listArticles({ category, page, sort }),
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
      searchPlaceholder="Search articles…"
      categories={sidebarCategories}
      clearHref="/blog"
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
        sub="Practical guidance on food safety, quality control, regulatory compliance, and processing — written by working practitioners."
      />

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
