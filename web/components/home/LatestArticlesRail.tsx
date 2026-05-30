import Link from "next/link";
import { Icon } from "@/components/ui";
import { articleCategoryLabel } from "@/lib/categories";
import type { ArticleListItem } from "@/lib/articles";

/**
 * §3.6 #4 — "Latest from the blog" rail (story-homepage-04). A compact list of the most-recent
 * published articles as title links, mounted *beneath* the editorial feature (story-homepage-06)
 * inside the "From the Knowledge Hub" section. It does NOT render the section header or the
 * "All articles → /blog" link — those belong to `KnowledgeHubSection` (the shell, story-homepage-05).
 *
 * The caller (the SSG page) excludes the editorial feature's slug, so no article appears twice.
 * Stagger entrance honors `prefers-reduced-motion` (§4.10). When fewer than 4 articles exist the
 * rail renders only those available (§5.4 short-list tolerance); with none, it renders nothing.
 */
export function LatestArticlesRail({ articles }: { articles: ArticleListItem[] }) {
  if (articles.length === 0) return null;

  return (
    <div className="mt-10 border-t border-border pt-8">
      <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">
        Latest from the blog
      </p>
      <ul className="mt-4 divide-y divide-border">
        {articles.map((article, i) => (
          <li
            key={article.slug}
            className="motion-reduce:animate-none animate-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <Link
              href={`/blog/${article.slug}`}
              className="group flex items-baseline justify-between gap-4 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="min-w-0">
                <span className="block truncate font-heading text-[1rem] font-semibold text-text group-hover:text-primary">
                  {article.title}
                </span>
                <span className="mt-0.5 block font-body text-[0.78rem] text-muted">
                  {articleCategoryLabel(article.category)} · {article.read_time_mins} min read
                </span>
              </span>
              <Icon
                name="arrow"
                size={15}
                stroke={2.2}
                className="mt-1 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
