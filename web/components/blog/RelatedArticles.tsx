import { ArticleCard } from "@/components/listing/ArticleCard";
import type { ArticleListItem } from "@/lib/articles";

/**
 * "You might also like" row on the article detail page (blog-05). Three `ArticleCard`s in a
 * row, staggered 80ms/child (reduced-motion respected, UI-DESIGN-HANDOFF.md §4.10). The cards
 * reuse the listing `ArticleCard`, whose `next/image` covers lazy-load below the fold
 * (`loading="lazy"`, no `priority`). Renders nothing when there are no related articles.
 */
export function RelatedArticles({ articles }: { articles: ArticleListItem[] }) {
  if (articles.length === 0) return null;
  return (
    <section className="mt-20" aria-labelledby="related-heading">
      <p className="mb-3 font-heading text-[0.65rem] font-bold uppercase tracking-[0.14em] text-primary">
        Keep reading
      </p>
      <h3 id="related-heading" className="mb-8 font-display text-[1.6rem] font-semibold tracking-[-0.02em] text-text">
        You might also like
      </h3>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
    </section>
  );
}
