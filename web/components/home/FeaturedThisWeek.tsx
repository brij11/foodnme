import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { expertInitials } from "@/lib/experts";
import type { FeaturedTemplate } from "@/lib/resources";
import type { FeaturedExpert } from "@/lib/experts";

function formatUpdated(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(iso));
}

const featureTag =
  "self-start rounded-full bg-tag-safe-bg px-3 py-1 font-heading text-[0.62rem] font-bold uppercase tracking-[0.08em] text-tag-safe-text";

const ghostLink =
  "inline-flex items-center gap-1.5 font-heading text-[0.82rem] font-bold text-primary group-hover:text-primary-deep";

/**
 * §3.6 #7 — "Featured this week": a most-downloaded template paired with a featured expert as
 * two hero cards (an accent strip across the top of each). Both halves are fetched server-side
 * by the shell. When no active expert exists the expert half degrades to a §5.4 stub
 * ("More experts coming soon" → /experts) rather than a broken card.
 */
export function FeaturedThisWeek({
  template,
  expert,
}: {
  template: FeaturedTemplate | null;
  expert: FeaturedExpert | null;
}) {
  if (!template) return null;

  return (
    <section className="mx-auto max-w-content px-6 py-16 lg:px-12">
      <div className="mb-10 text-center">
        <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-text">
          Featured this week
        </p>
        <h2 className="mt-3 font-display text-[1.9rem] font-semibold text-text">
          Two things worth your time.
        </h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Template half */}
        <Link
          href={`/templates/${template.slug}`}
          className="group flex flex-col overflow-hidden rounded-xl border border-border border-t-[3px] border-t-primary bg-card-bg p-7 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className={featureTag}>
            Most downloaded · {template.download_count.toLocaleString()}
          </span>
          <span className="mt-5 flex h-14 w-14 items-center justify-center rounded-md bg-surface-light font-heading text-[0.8rem] font-bold text-primary-deep">
            {template.file_type.toUpperCase()}
          </span>
          <h3 className="mt-4 font-heading text-[1.3rem] font-bold leading-tight text-text group-hover:text-primary">
            {template.title}
          </h3>
          <p className="mt-2 line-clamp-3 font-body text-[0.92rem] leading-relaxed text-muted">
            {template.description}
          </p>
          <div className="mt-auto flex items-center justify-between border-t border-border pt-4 font-body text-[0.78rem] text-muted">
            <span>Updated {formatUpdated(template.created_at)}</span>
            <span className={ghostLink}>
              Download template
              <Icon name="arrow" size={14} stroke={2.2} aria-hidden="true" />
            </span>
          </div>
        </Link>

        {/* Expert half — real card, or §5.4 stub when no active expert exists */}
        {expert ? (
          <Link
            href={`/experts/${expert.id}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-border border-t-[3px] border-t-accent bg-card-bg p-7 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className={featureTag}>
              Featured expert
              {expert.rating != null ? ` · ${expert.rating} ★ (${expert.review_count} reviews)` : ""}
            </span>
            {expert.avatar_url ? (
              <Image
                src={expert.avatar_url}
                alt=""
                width={64}
                height={64}
                className="mt-5 h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <span className="mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-tag-safe-bg font-heading text-[1.2rem] font-bold text-tag-safe-text">
                {expertInitials(expert.full_name)}
              </span>
            )}
            <h3 className="mt-4 font-heading text-[1.3rem] font-bold leading-tight text-text group-hover:text-primary">
              {expert.full_name}
            </h3>
            <p className="mt-1 font-body text-[0.88rem] text-muted">
              {expert.title} · {expert.experience_years} yrs
            </p>
            <p className="mt-3 line-clamp-2 font-body text-[0.92rem] leading-relaxed text-muted">
              {expert.bio}
            </p>
            <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
              <span
                className={
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-heading text-[0.7rem] font-bold " +
                  (expert.is_available
                    ? "bg-tag-green-bg text-tag-green-text"
                    : "bg-tag-neutral-bg text-tag-neutral-text")
                }
              >
                <span
                  className={
                    "h-1.5 w-1.5 rounded-full " + (expert.is_available ? "bg-primary" : "bg-muted-2")
                  }
                />
                {expert.is_available ? "Available" : "Busy"}
              </span>
              <span className={ghostLink}>
                View profile
                <Icon name="arrow" size={14} stroke={2.2} aria-hidden="true" />
              </span>
            </div>
          </Link>
        ) : (
          <Link
            href="/experts"
            className="group flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-light p-7 text-center transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-card-bg text-primary">
              <Icon name="user" size={22} stroke={1.8} aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-heading text-[1.15rem] font-bold text-text">
              More experts coming soon
            </h3>
            <p className="mt-2 font-body text-[0.9rem] leading-relaxed text-muted">
              We&apos;re onboarding verified food-tech specialists. Browse the directory as it grows.
            </p>
            <span className={`mt-4 ${ghostLink}`}>
              Explore experts
              <Icon name="arrow" size={14} stroke={2.2} aria-hidden="true" />
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
