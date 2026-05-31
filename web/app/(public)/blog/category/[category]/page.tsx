import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listArticles, getCategoryCounts, clampPage, parseSort } from "@/lib/articles";
import { ARTICLE_CATEGORIES, BLOG_POPULAR_TAGS, articleCategory } from "@/lib/categories";
import { PageHeader } from "@/components/listing/PageHeader";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ListingShell } from "@/components/listing/ListingShell";
import { ListingSidebar, type SidebarCategory } from "@/components/listing/ListingSidebar";
import { ArticleGrid } from "@/components/listing/ArticleGrid";
import { Pagination } from "@/components/listing/Pagination";
import { SortSelect } from "@/components/listing/SortSelect";
import { EmptyState } from "@/components/listing/EmptyState";
import { NewsletterBanner } from "@/components/newsletter/NewsletterBanner";

// One SSG page per category; an unknown category 404s (revalidated on admin publish, Sprint 3).
export function generateStaticParams() {
  return ARTICLE_CATEGORIES.map((c) => ({ category: c.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const cat = articleCategory(params.category);
  if (!cat) return { title: "Category not found -- foodnme" };
  const title = `${cat.label} Articles -- foodnme`;
  const description = `Food technology articles on ${cat.label.toLowerCase()} -- practical guidance for professionals.`;
  return { title, description, openGraph: { title, description, type: "website" } };
}

type SearchParams = { page?: string | string[]; sort?: string | string[] };

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: SearchParams;
}) {
  const cat = articleCategory(params.category);
  if (!cat) notFound();

  const page = clampPage(searchParams.page);
  const sort = parseSort(searchParams.sort);

  const [result, counts] = await Promise.all([
    listArticles({ category: cat.slug, page, sort }),
    getCategoryCounts(),
  ]);

  const sidebarCategories: SidebarCategory[] = [
    { slug: "all", label: "All", href: "/blog" },
    ...ARTICLE_CATEGORIES.map((c) => ({ slug: c.slug, label: c.label, href: `/blog/category/${c.slug}` })),
  ].map((c) => ({
    slug: c.slug,
    label: c.label,
    count: counts[c.slug] ?? 0,
    href: c.href,
    active: c.slug === cat.slug,
  }));

  const sidebar = (
    <ListingSidebar
      searchType="articles"
      searchPlaceholder="Search all of foodnme..."
      categories={sidebarCategories}
      clearHref="/blog"
      popularTags={[...BLOG_POPULAR_TAGS]}
      newsletter={<NewsletterBanner mini source="blog" headline="The weekly food-tech brief" subtext="Practical guidance, once a week." />}
    />
  );

  const hrefForPage = (p: number) => {
    const qs = new URLSearchParams();
    if (sort === "oldest") qs.set("sort", sort);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return s ? `/blog/category/${cat.slug}?${s}` : `/blog/category/${cat.slug}`;
  };

  return (
    <div className="mx-auto max-w-content px-6 lg:px-12">
      <div className="pt-10">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: cat.label }]} />
      </div>
      <PageHeader
        overline={cat.label}
        title={`${cat.label} Articles`}
        sub={`${result.total} ${result.total === 1 ? "article" : "articles"} on ${cat.label.toLowerCase()} -- sorted by recency.`}
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
            <ArticleGrid key={`${cat.slug}-${page}-${sort}`} articles={result.articles} />
            <Pagination page={result.page} totalPages={result.totalPages} hrefForPage={hrefForPage} />
          </>
        ) : (
          <EmptyState
            variant="filter"
            title={`No ${cat.label} articles yet`}
            message="We haven't published in this category yet. Browse every article, or check back soon."
            action={{ label: "Browse all articles", href: "/blog" }}
          />
        )}
      </ListingShell>
    </div>
  );
}
