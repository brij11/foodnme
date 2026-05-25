import Link from "next/link";

const primaryCta =
  "inline-flex items-center justify-center gap-2 rounded-md bg-primary px-[22px] py-3 font-heading text-[0.82rem] font-bold text-white transition hover:bg-primary-deep hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const outlineCta =
  "inline-flex items-center justify-center gap-2 rounded-md border-[1.5px] border-border bg-card-bg px-[22px] py-3 font-heading text-[0.82rem] font-bold text-primary transition hover:border-primary hover:bg-tag-safe-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * Homepage placeholder. The full narrative homepage (hero, scenarios, editorial feature,
 * testimonials, stats, featured, newsletter — UI-DESIGN-HANDOFF.md §3.6) is story-homepage-03
 * + homepage-04, currently deferred in the backlog. This minimal hero keeps `/` valid and
 * accessible (one Fraunces H1) and renders inside the public chrome.
 */
export default function HomePage() {
  return (
    <section className="mx-auto max-w-content px-6 py-20 lg:px-12">
      <p className="font-heading text-[0.65rem] font-bold uppercase tracking-[0.14em] text-primary">
        Food technology knowledge + community
      </p>
      <h1 className="mt-4 max-w-[640px] font-display text-[clamp(2.4rem,5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-text">
        Practical resources for a <span className="text-primary italic">safer</span> food ecosystem.
      </h1>
      <p className="mt-5 max-w-[560px] font-body text-lg leading-relaxed text-muted">
        Guidance on food safety, quality control, and regulatory compliance — plus templates
        and consulting for food-tech professionals across India and beyond.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/blog" className={primaryCta}>
          Browse the Knowledge Hub
        </Link>
        <Link href="/templates" className={outlineCta}>
          Download templates
        </Link>
      </div>
    </section>
  );
}
