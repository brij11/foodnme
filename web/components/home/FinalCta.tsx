import Link from "next/link";
import { ConsultationButton } from "./ConsultationButton";

const outlineCta =
  "inline-flex items-center justify-center gap-2 rounded-md border-[1.5px] border-border bg-card-bg px-7 py-4 font-heading text-[0.92rem] font-bold text-primary transition hover:border-primary hover:bg-tag-safe-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * §3.6 #8 — final CTA (consultation). Sits between "Featured this week" (#7, story-07)
 * and the "Good to know" Q&A (#9, story-06), NOT at the page foot.
 */
export function FinalCta() {
  return (
    <section className="mx-auto max-w-content px-6 py-16 lg:px-12">
      <div className="rounded-xl bg-surface-light px-6 py-14 text-center">
        <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-primary-deep">
          Need someone to look at it?
        </p>
        <h2 className="mt-3 font-display text-[1.9rem] font-semibold text-text">
          Free 30-minute scoping call. No pitch, no commitment.
        </h2>
        <p className="mx-auto mt-4 max-w-[540px] font-body text-lg leading-relaxed text-muted">
          Tell us your situation. We&apos;ll point you to the right template, expert, or service —
          even if that&apos;s somewhere else.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ConsultationButton size="lg">Book a consultation</ConsultationButton>
          <Link href="/services" className={outlineCta}>
            See all services
          </Link>
        </div>
      </div>
    </section>
  );
}
