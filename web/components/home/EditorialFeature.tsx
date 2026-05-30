import Image from "next/image";
import Link from "next/link";
import { Icon, Tag } from "@/components/ui";
import { articleCategory } from "@/lib/categories";
import { expertInitials } from "@/lib/experts";
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
 * §3.6 #4 — the homepage editorial feature: ONE highlighted published article rendered as a
 * full-bleed "magazine moment" (cover left, content right). The article is chosen by the shell
 * via `getFeaturedArticle()` (`is_featured` first, else most-recent) and the "Latest from the
 * blog" rail (story-homepage-04) excludes it. The title is an H2 — the page's single H1 stays
 * the hero (story-homepage-05). Renders nothing when there is no published article.
 */
export function EditorialFeature({ article }: { article: ArticleListItem | null }) {
  if (!article) return null;
  const category = articleCategory(article.category);

  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group grid overflow-hidden rounded-xl border border-border bg-card-bg shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:grid-cols-2"
    >
      <div className="relative min-h-[240px] bg-surface-light lg:min-h-full">
        {article.cover_image_url ? (
          <Image
            src={article.cover_image_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="flex flex-col justify-center p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <Tag variant="accent">Featured</Tag>
          {category ? <Tag variant={category.tag}>{category.label}</Tag> : null}
          <Tag variant="neutral">
            <Icon name="clock" size={11} stroke={2} aria-hidden="true" />
            {article.read_time_mins} min read
          </Tag>
        </div>

        <h2 className="mt-4 font-display text-[clamp(1.6rem,3vw,2.1rem)] font-semibold leading-tight text-text group-hover:text-primary">
          {article.title}
        </h2>

        <p className="mt-4 font-body text-[1.02rem] leading-relaxed text-muted">{article.excerpt}</p>

        <div className="mt-7 flex items-center gap-3">
          {article.author.avatar_url ? (
            <Image
              src={article.author.avatar_url}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tag-safe-bg font-heading text-[0.85rem] font-bold text-tag-safe-text">
              {expertInitials(article.author.full_name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-heading text-[0.95rem] font-semibold text-text">
              {article.author.full_name}
            </div>
            <div className="font-body text-[0.8rem] text-muted">
              {[formatDate(article.published_at), article.author.title].filter(Boolean).join(" · ")}
            </div>
          </div>
          <span className="ml-auto hidden shrink-0 items-center gap-1.5 font-heading text-[0.82rem] font-bold text-primary group-hover:text-primary-deep sm:inline-flex">
            Read full piece
            <Icon name="arrow" size={14} stroke={2.2} aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
