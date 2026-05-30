import type { Metadata } from "next";
import Link from "next/link";
import { searchQuerySchema, type SearchType } from "@/lib/schemas/search";
import { runSearch } from "@/lib/search";
import { getArticlesByIds } from "@/lib/articles";
import { getTemplatesByIds } from "@/lib/resources";
import { getExpertsByIds } from "@/lib/experts";
import { ArticleCard } from "@/components/listing/ArticleCard";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { ExpertCard } from "@/components/experts/ExpertCard";
import { EmptyState } from "@/components/listing/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";

// Results pages are not indexable (§7) — per-query and thin.
export const metadata: Metadata = { title: "Search — foodnme", robots: { index: false } };
export const dynamic = "force-dynamic";

const FACETS: { type: SearchType; label: string }[] = [
  { type: "all", label: "All" },
  { type: "articles", label: "Articles" },
  { type: "templates", label: "Templates" },
  { type: "experts", label: "Experts" },
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string };
}) {
  // Defensive parse — a hand-typed bad `type` falls back to a clean default rather than 500ing.
  const parsed = searchQuerySchema.safeParse({
    q: searchParams.q ?? "",
    type: searchParams.type ?? "all",
  });
  const { q, type } = parsed.success ? parsed.data : { q: (searchParams.q ?? "").slice(0, 120), type: "all" as const };

  const results = await runSearch(q, type);

  // Batch-fetch full rows by id (one query per entity type — no per-result N+1), then render the
  // real listing cards in the search's rank order. Articles are keyed by slug (from the result
  // url, since ArticleListItem has no id); templates/experts by id.
  const [articles, templates, experts] = await Promise.all([
    getArticlesByIds(results.filter((r) => r.type === "article").map((r) => r.id)),
    getTemplatesByIds(results.filter((r) => r.type === "template").map((r) => r.id)),
    getExpertsByIds(results.filter((r) => r.type === "expert").map((r) => r.id)),
  ]);
  const articleBySlug = new Map(articles.map((a) => [a.slug, a]));
  const templateById = new Map(templates.map((t) => [t.id, t]));
  const expertById = new Map(experts.map((e) => [e.id, e]));

  const total = results.length;
  const hasQuery = q.trim().length > 0;

  return (
    <div className="mx-auto max-w-content px-6 py-10 lg:px-12">
      <h1 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-semibold text-text">Search</h1>

      <form action="/search" method="get" role="search" className="relative mt-5 block max-w-xl">
        <input type="hidden" name="type" value={type} />
        <Icon
          name="search"
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2"
        />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search articles, templates, experts…"
          aria-label="Search"
          className="w-full rounded-md border border-border bg-card-bg py-2.5 pl-10 pr-4 font-body text-[0.9rem] text-text focus-visible:border-primary focus-visible:outline-none"
        />
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        {FACETS.map((f) => (
          <Link
            key={f.type}
            href={`/search?q=${encodeURIComponent(q)}&type=${f.type}`}
            aria-current={type === f.type ? "page" : undefined}
            className={cn(
              "rounded-full border-[1.5px] px-3.5 py-1.5 font-heading text-[0.74rem] font-bold transition",
              type === f.type
                ? "border-primary bg-tag-safe-bg text-primary-deep"
                : "border-border bg-card-bg text-muted hover:border-primary",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {hasQuery ? (
        <p className="mt-5 font-body text-[0.85rem] text-muted" data-testid="result-count">
          {total} {total === 1 ? "result" : "results"} for &ldquo;{q}&rdquo;
        </p>
      ) : null}

      {total === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={hasQuery ? `No results for “${q}”` : "Search foodnme"}
            message={
              hasQuery
                ? "Try a different term, or broaden the type filter."
                : "Type a query above to search across articles, templates, and experts."
            }
            action={{ label: "Browse the blog", href: "/blog" }}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="search-results">
          {results.map((r) => {
            if (r.type === "article") {
              const slug = r.url.replace("/blog/", "");
              const a = articleBySlug.get(slug);
              return a ? <ArticleCard key={r.id} article={a} /> : null;
            }
            if (r.type === "template") {
              const t = templateById.get(r.id);
              return t ? <TemplateCard key={r.id} template={t} /> : null;
            }
            const e = expertById.get(r.id);
            return e ? <ExpertCard key={r.id} expert={e} /> : null;
          })}
        </div>
      )}
    </div>
  );
}
