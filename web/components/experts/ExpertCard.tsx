import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";
import { type ExpertCardData, expertInitials, formatHourlyRate } from "@/lib/experts";

/** Directory card (story-experts-01): avatar initials, name + featured badge, title, top-2
 *  specializations, location, availability dot, rate, and a link to the detail page. */
export function ExpertCard({ expert }: { expert: ExpertCardData }) {
  return (
    <Card hover data-testid="expert-card" className="flex h-full flex-col gap-4">
      <div className="flex items-start gap-3.5">
        {expert.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={expert.avatar_url}
            alt=""
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-tag-safe-bg font-heading text-[0.92rem] font-bold text-tag-safe-text">
            {expertInitials(expert.full_name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-[1.02rem] font-bold tracking-[-0.01em] text-text">
              {expert.full_name}
            </h3>
            {expert.is_featured ? (
              <Tag variant="safe">
                <Icon name="verified" size={11} stroke={2.4} /> Verified
              </Tag>
            ) : null}
          </div>
          <p className="mt-0.5 font-body text-[0.86rem] text-muted">{expert.title}</p>
          <p className="mt-1.5 flex items-center gap-1.5 font-body text-[0.78rem] text-muted">
            <Icon name="map-pin" size={13} stroke={1.8} /> {expert.location}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {expert.specializations.slice(0, 2).map((s) => (
          <Tag key={s} variant="outline-green">
            {s}
          </Tag>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-3.5">
        <span
          data-testid="availability"
          className="flex items-center gap-1.5 font-body text-[0.78rem] text-muted"
        >
          <span
            aria-hidden
            className={cn(
              "h-2 w-2 rounded-full",
              expert.is_available ? "bg-secondary" : "bg-muted-2",
            )}
          />
          {expert.is_available ? "Available" : "Unavailable"}
        </span>
        <span className="font-heading text-[0.92rem] font-bold text-text">
          {formatHourlyRate(expert.hourly_rate)}
        </span>
      </div>

      <Link
        href={`/experts/${expert.id}`}
        className="inline-flex w-full items-center justify-center rounded-md border-[1.5px] border-border bg-card-bg px-4 py-2.5 font-heading text-[0.8rem] font-bold text-primary transition hover:border-primary hover:bg-tag-safe-bg"
      >
        View profile
      </Link>
    </Card>
  );
}
