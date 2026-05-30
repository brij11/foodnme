import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { expertInitials } from "@/lib/experts";
import type { AuthorExpert } from "@/lib/articles";

// The bio card surfaces a generic site contact — never the expert's server-only `contact_email`
// (experts §4.1). Expert engagements still route through the contact modal/API (experts-03).
const SITE_CONTACT_EMAIL = "hello@foodnme.in";

/**
 * End-of-article author bio card (story-blog-07, UI-DESIGN-HANDOFF.md §3.7 `AuthorBioCard`):
 * 96px avatar, name, muted role, full bio, LinkedIn/Twitter buttons, the author's published
 * article count, and a site contact. All identity fields come from the linked expert (blog-06);
 * the card degrades cleanly when bio / socials / avatar are absent.
 */
export function AuthorBioCard({
  author,
  articleCount,
}: {
  author: AuthorExpert;
  articleCount: number;
}) {
  return (
    <div className="mx-auto mt-14 flex max-w-article flex-col gap-5 rounded-lg border border-border bg-surface-light p-7 sm:flex-row sm:gap-6">
      {author.avatar_url ? (
        <Image
          src={author.avatar_url}
          alt=""
          width={96}
          height={96}
          className="h-24 w-24 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-tag-safe-bg font-heading text-[1.5rem] font-bold text-tag-safe-text">
          {expertInitials(author.full_name)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted">
          About the author
        </p>
        <h2 className="mt-1 font-heading text-[1.25rem] font-bold text-text">{author.full_name}</h2>
        {author.title ? (
          <div className="font-body text-[0.9rem] text-muted">{author.title}</div>
        ) : null}
        {author.bio ? (
          <p className="mt-3 font-body text-[0.95rem] leading-relaxed text-text/90">{author.bio}</p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {author.linkedin_url ? (
            <a
              href={author.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${author.full_name} on LinkedIn`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary hover:text-primary"
            >
              <Icon name="linkedin" size={16} />
            </a>
          ) : null}
          {author.twitter_url ? (
            <a
              href={author.twitter_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${author.full_name} on Twitter`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary hover:text-primary"
            >
              <Icon name="twitter" size={16} />
            </a>
          ) : null}

          {author.linkedin_url || author.twitter_url ? (
            <span aria-hidden className="h-5 w-px bg-border" />
          ) : null}

          <span className="inline-flex items-center gap-1.5 font-body text-[0.82rem] text-muted">
            <Icon name="file" size={13} stroke={2} />
            {articleCount} {articleCount === 1 ? "article" : "articles"}
          </span>
          <a
            href={`mailto:${SITE_CONTACT_EMAIL}`}
            className="inline-flex items-center gap-1.5 font-body text-[0.82rem] text-muted transition-colors hover:text-primary"
          >
            <Icon name="mail" size={13} stroke={2} />
            {SITE_CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
}
