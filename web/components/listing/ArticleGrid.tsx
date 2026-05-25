import { ArticleCard } from "./ArticleCard";
import type { ArticleListItem } from "@/lib/articles";

/**
 * 2-column article grid with staggered entry (UI-DESIGN-HANDOFF.md §4.10: 80ms/child,
 * reduced-motion respected). The caller passes a `key` (category+page) so a filter change
 * remounts the grid and re-runs the stagger.
 */
export function ArticleGrid({ articles }: { articles: ArticleListItem[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {articles.map((article, i) => (
        <div
          key={article.slug}
          className="motion-reduce:animate-none animate-fade-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <ArticleCard article={article} />
        </div>
      ))}
    </div>
  );
}
