import Link from "next/link";
import Image from "next/image";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { articleCategoryLabel, articleTagVariant } from "@/lib/categories";
import type { ArticleListItem } from "@/lib/articles";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

/**
 * Article card (UI-DESIGN-HANDOFF.md §3.2): category tag (color rotation §1.2) + read-time
 * tag, Inter 700 title, 2-line excerpt, author + date footer, hover lift.
 */
export function ArticleCard({ article }: { article: ArticleListItem }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card-bg transition hover:-translate-y-[2px] hover:border-[#d8d3bf] hover:shadow-card"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-light">
        {article.cover_image_url ? (
          <Image
            src={article.cover_image_url}
            alt=""
            fill
            sizes="(max-width: 920px) 100vw, 460px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Tag variant={articleTagVariant(article.category)}>{articleCategoryLabel(article.category)}</Tag>
          <Tag variant="neutral">
            <Icon name="clock" size={11} stroke={2} />
            {article.read_time_mins} min read
          </Tag>
        </div>
        <h3 className="font-heading text-[1.05rem] font-bold leading-tight tracking-[-0.01em] text-text">
          {article.title}
        </h3>
        <p className="line-clamp-2 font-body text-[0.86rem] leading-relaxed text-muted">{article.excerpt}</p>
        <div className="mt-auto flex justify-between border-t border-border pt-3.5 font-body text-[0.76rem] text-muted">
          <span>{article.author_name}</span>
          <span>{formatDate(article.published_at)}</span>
        </div>
      </div>
    </Link>
  );
}
