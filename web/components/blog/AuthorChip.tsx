import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { expertInitials } from "@/lib/experts";
import type { AuthorExpert } from "@/lib/articles";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(
    new Date(iso),
  );
}

/**
 * Header author chip (story-blog-07, UI-DESIGN-HANDOFF.md §3.7 `HeaderAuthorChip`): avatar
 * (or initials), name, "date · role" meta, and LinkedIn/Twitter icon links. Author fields come
 * from the linked expert (blog-06); a social link is omitted when its handle is absent.
 */
export function AuthorChip({
  author,
  publishedAt,
}: {
  author: AuthorExpert;
  publishedAt: string | null;
}) {
  const date = formatDate(publishedAt);
  return (
    <div className="mt-5 flex items-center gap-3">
      {author.avatar_url ? (
        <Image
          src={author.avatar_url}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tag-safe-bg font-heading text-[0.85rem] font-bold text-tag-safe-text">
          {expertInitials(author.full_name)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="font-heading text-[0.95rem] font-semibold text-text">{author.full_name}</div>
        <div className="font-body text-[0.8rem] text-muted">
          {[date, author.title].filter(Boolean).join(" · ")}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {author.linkedin_url ? (
          <a
            href={author.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${author.full_name} on LinkedIn`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary hover:text-primary"
          >
            <Icon name="linkedin" size={14} />
          </a>
        ) : null}
        {author.twitter_url ? (
          <a
            href={author.twitter_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${author.full_name} on Twitter`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary hover:text-primary"
          >
            <Icon name="twitter" size={14} />
          </a>
        ) : null}
      </div>
    </div>
  );
}
