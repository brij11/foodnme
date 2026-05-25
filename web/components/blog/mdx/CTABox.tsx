import Link from "next/link";

/**
 * In-article CTA box (blog-03 AC#3): surface-light background, headline + sub-copy + button.
 * Props passed from MDX: title, body, ctaText, ctaHref.
 */
export function CTABox({
  title,
  body,
  ctaText,
  ctaHref,
}: {
  title: string;
  body?: string;
  ctaText: string;
  ctaHref: string;
}) {
  return (
    <div className="my-10 flex flex-col gap-4 rounded-lg border border-border bg-surface-light p-7 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="font-heading text-[1.1rem] font-bold text-text">{title}</h3>
        {body ? <p className="mt-1 font-body text-[0.9rem] text-muted">{body}</p> : null}
      </div>
      <Link
        href={ctaHref}
        className="inline-flex shrink-0 items-center justify-center rounded-md bg-primary px-5 py-3 font-heading text-[0.82rem] font-bold text-white transition hover:bg-primary-deep"
      >
        {ctaText}
      </Link>
    </div>
  );
}
