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
 * Header author chip (blog-12 AC#2 / DEVIATIONS D4 / UI-DESIGN-HANDOFF.md §3.7 `HeaderAuthorChip`):
 * Wrapped in a bordered/rounded pill surface — background: card-bg, border: 1px border,
 * border-radius: 999px, padding: 8px 16px 8px 8px. Avatar (or initials), name, "date · role"
 * meta, and LinkedIn/Twitter icon links separated by a left-border divider.
 * Design ref: plan/design/styles.css:3081+
 */
export function AuthorChip({
  author,
  publishedAt,
}: {
  author: AuthorExpert;
  publishedAt: string | null;
}) {
  const date = formatDate(publishedAt);
  const hasSocials = !!(author.linkedin_url ?? author.twitter_url);
  return (
    <div className="mt-7 inline-flex items-center gap-3.5 rounded-full border border-border bg-card-bg px-4 py-2">
      {author.avatar_url ? (
        <Image
          src={author.avatar_url}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tag-safe-bg font-heading text-[0.78rem] font-bold text-tag-safe-text">
          {expertInitials(author.full_name)}
        </div>
      )}
      <div className="flex flex-col leading-[1.2]">
        <span className="font-heading text-[0.84rem] font-semibold text-text">{author.full_name}</span>
        <span className="font-body text-[0.72rem] text-muted">
          {[date, author.title].filter(Boolean).join(" · ")}
        </span>
      </div>
      {hasSocials ? (
        <div className="ml-1 flex items-center gap-1 border-l border-border pl-2.5">
          {author.linkedin_url ? (
            <a
              href={author.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${author.full_name} on LinkedIn`}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-light hover:text-primary"
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
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-light hover:text-primary"
            >
              <Icon name="twitter" size={14} />
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
