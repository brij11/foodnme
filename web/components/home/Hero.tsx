import Link from "next/link";
import { Icon } from "@/components/ui";
import type { SiteStats } from "@/lib/stats";
import { ConsultationButton } from "./ConsultationButton";
import { CountUp } from "./CountUp";
import { HeroCollage } from "./HeroCollage";

const primaryCta =
  "inline-flex items-center justify-center gap-2 rounded-md bg-primary px-7 py-4 font-heading text-[0.92rem] font-bold text-white transition hover:bg-primary-deep hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

type StatProps = { value: number; label: string; suffix?: string; thousands?: boolean };

/** Stat numbers are dark olive (`text-text`), never green — §4.1/§8. */
function Stat({ value, label, suffix, thousands }: StatProps) {
  return (
    <div>
      <div className="font-display text-2xl font-bold leading-none tracking-tight text-text">
        <CountUp value={value} suffix={suffix} thousands={thousands} />
      </div>
      <div className="mt-1.5 font-heading text-[0.62rem] font-bold uppercase tracking-[0.1em] text-muted">
        {label}
      </div>
    </div>
  );
}

/**
 * §3.6 #1 — editorial hero (the shipping variant per §4.9). Pill badge + CSS pulse dot,
 * one Fraunces H1, lead, two CTAs (Browse templates → /templates; Book a consultation →
 * global modal), an inline count-up stat strip, and the decorative HeroCollage.
 */
export function Hero({ stats, covers }: { stats: SiteStats; covers: string[] }) {
  return (
    <section className="relative overflow-hidden">
      {/* §4.4 decorative atmospheric tints (not surfaces) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 -top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(127,176,105,0.18),transparent_65%)]" />
        <div className="absolute right-1/4 top-2/3 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(221,161,94,0.16),transparent_65%)]" />
      </div>

      <div className="mx-auto grid max-w-content items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_1fr] lg:px-12 lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card-bg/70 px-3.5 py-1.5 font-heading text-[0.7rem] font-bold uppercase tracking-[0.1em] text-primary">
            <span className="relative inline-flex h-[7px] w-[7px]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-secondary" />
            </span>
            India&apos;s Food-Tech Resource Hub
          </div>

          <h1 className="mt-6 max-w-[640px] font-display text-[clamp(2.4rem,5vw,3.4rem)] font-semibold leading-[1.06] tracking-[-0.025em] text-text">
            Practical resources for a <span className="italic text-primary">safer</span> food
            ecosystem.
          </h1>

          <p className="mt-5 max-w-[560px] font-body text-lg leading-relaxed text-muted">
            Field-tested HACCP plans, audit checklists, and expert writing — built for food
            safety, QC, and regulatory teams who ship product on Monday morning.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/templates" className={primaryCta}>
              <Icon name="download" size={16} stroke={2.2} />
              Browse templates
            </Link>
            <ConsultationButton variant="outline" size="lg">
              Book a consultation
            </ConsultationButton>
          </div>

          <div
            data-testid="hero-stats"
            className="mt-12 grid max-w-md grid-cols-2 gap-6 sm:grid-cols-4"
          >
            <Stat value={stats.articles} suffix="+" label="Articles" />
            <Stat value={stats.templates} label="Templates" />
            <Stat value={stats.businesses} suffix="+" label="Businesses Helped" />
            <Stat value={stats.subscribers} thousands label="Subscribers" />
          </div>
        </div>

        <HeroCollage covers={covers} />
      </div>
    </section>
  );
}
