import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ConsultationButton } from "@/components/home/ConsultationButton";

// SSG: the About page is fully static; an edit ships via deploy (on-demand revalidation, §7).
export const metadata: Metadata = {
  title: "About — foodnme",
  description:
    "foodnme is a knowledge platform for food-technology professionals across India — practical resources, a vetted expert directory, and a curated jobs board.",
  openGraph: {
    title: "About foodnme",
    description:
      "A knowledge platform for food-technology professionals across India — practical resources, a vetted expert directory, and a curated jobs board.",
    type: "website",
  },
};

const OFFERINGS: { icon: IconName; title: string; desc: string; link: string; linkLabel: string }[] = [
  {
    icon: "file",
    title: "Knowledge Hub",
    desc: "Practical, field-tested articles on food safety, QC, regulatory, and processing.",
    link: "/blog",
    linkLabel: "Read the blog",
  },
  {
    icon: "clipboard",
    title: "Templates",
    desc: "HACCP plans, audit checklists, SOPs, and compliance docs — used by 300+ facilities.",
    link: "/templates",
    linkLabel: "Browse templates",
  },
  {
    icon: "briefcase",
    title: "Jobs Board",
    desc: "Curated food-tech roles in QA, R&D, regulatory, and processing across India.",
    link: "/jobs",
    linkLabel: "See open roles",
  },
  {
    icon: "verified",
    title: "Expert Directory",
    desc: "Vetted auditors, consultants, and scientists for short consults or longer engagements.",
    link: "/experts",
    linkLabel: "Find an expert",
  },
];

const STATS = [
  { num: "120+", label: "Articles Published" },
  { num: "48", label: "Templates" },
  { num: "85+", label: "Businesses Helped" },
  { num: "4,200+", label: "Newsletter Subscribers" },
];

const VALUES = [
  {
    title: "Practical over theoretical",
    desc: "Every resource is built from the field, not the textbook. If an auditor wouldn't approve it, we don't publish it.",
  },
  {
    title: "Curated, not crowdsourced",
    desc: "We don't accept submissions. Every template, expert, and job listing is hand-picked or vetted by us before going live.",
  },
  {
    title: "Quietly opinionated",
    desc: "We don't list everything. We list what works. A short, curated catalog beats an exhaustive one.",
  },
];

const FOUNDER_LINKS: { icon: IconName; label: string; href: string; external?: boolean }[] = [
  { icon: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/", external: true },
  { icon: "twitter", label: "Twitter", href: "https://twitter.com/", external: true },
  { icon: "mail", label: "hello@foodnme.in", href: "mailto:hello@foodnme.in" },
];

const secondaryCta =
  "inline-flex items-center justify-center gap-2 rounded-md border-[1.5px] border-border bg-card-bg px-4 py-2.5 font-heading text-[0.8rem] font-bold text-primary transition hover:border-primary hover:bg-tag-safe-bg";

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-content px-6 pb-14 pt-20 lg:px-12">
        <div className="max-w-[820px]">
          <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-primary">
            About foodnme
          </p>
          <h1 className="mt-4 font-display text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-text">
            We built this for the people who actually{" "}
            <em className="italic text-primary">run</em> food businesses.
          </h1>
          <p className="mt-6 max-w-[640px] font-body text-lg leading-relaxed text-muted">
            foodnme is a knowledge platform for food technology professionals across India. We
            publish practical resources, run a vetted expert directory, and operate a curated jobs
            board — all in one place.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-content px-6 lg:px-12">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-card-bg px-6 py-8 text-center">
              <div className="font-display text-[2rem] font-bold text-text">{s.num}</div>
              <div className="mt-1 font-body text-[0.82rem] text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-content px-6 py-16 lg:px-12">
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-start">
          <div>
            <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-primary">
              Our mission
            </p>
            <h2 className="mt-3 font-display text-[1.9rem] font-semibold text-text">
              A safer, smarter Indian food ecosystem.
            </h2>
          </div>
          <div className="font-body text-lg leading-relaxed text-muted">
            <p>
              Food safety in India is more complicated than it needs to be. SOPs that auditors
              won&apos;t accept. HACCP plans that no one on the floor reads. Compliance binders that
              gather dust between renewals.
            </p>
            <p className="mt-4">
              We started foodnme to fix that — by sharing the templates we use in our own consulting
              practice, writing the guides we wished existed, and connecting the practitioners we
              trust with the businesses that need them.
            </p>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="bg-surface-light">
        <div className="mx-auto max-w-content px-6 py-16 lg:px-12">
          <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-primary-deep">
            What we do
          </p>
          <h2 className="mt-3 font-display text-[1.9rem] font-semibold text-text">
            Four products, one focus
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {OFFERINGS.map((o) => (
              <div
                key={o.title}
                className="flex flex-col gap-3.5 rounded-lg border border-border bg-card-bg p-8"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-card-bg text-text">
                  <Icon name={o.icon} size={22} />
                </div>
                <h3 className="font-heading text-[1.15rem] font-bold text-text">{o.title}</h3>
                <p className="flex-1 font-body text-[0.92rem] leading-relaxed text-muted">{o.desc}</p>
                <Link
                  href={o.link}
                  className="self-start font-heading text-[0.82rem] font-bold text-primary underline-offset-[3px] hover:underline"
                >
                  {o.linkLabel} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="mx-auto max-w-content px-6 py-16 lg:px-12">
        <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-primary">
          Who&apos;s behind this
        </p>
        <h2 className="mt-3 font-display text-[1.9rem] font-semibold text-text">
          A small team, by design.
        </h2>
        <div className="mt-8 grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-center">
          <div className="relative aspect-square max-w-[360px] overflow-hidden rounded-lg bg-surface-light">
            <Image
              src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80&auto=format&fit=crop"
              alt="Founder portrait"
              fill
              sizes="(max-width: 768px) 100vw, 360px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-primary">
              Founder
            </p>
            <h3 className="mt-2 font-display text-[1.5rem] font-semibold text-text">Aarti Menon</h3>
            <p className="mt-1 font-body text-[0.9rem] text-muted">FSSAI Lead Auditor · 12 years</p>
            <p className="mt-5 font-body text-lg leading-relaxed text-muted">
              foodnme is a solo operation — built and maintained out of Mumbai. I&apos;ve audited and
              consulted for 85+ Indian food businesses over the past decade, from co-packers to
              category leaders.
            </p>
            <p className="mt-4 font-body text-[0.95rem] leading-relaxed text-muted">
              The platform grew from a habit: every time a client asked me for &quot;that one
              template I use&quot;, I&apos;d dig it out, redact it, and email it over. Eventually it
              made more sense to just publish them. The articles, the jobs board, and the expert
              directory followed for similar reasons — each filling a gap I kept running into.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {FOUNDER_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className={secondaryCta}
                  {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <Icon name={l.icon} size={13} /> {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-surface-light">
        <div className="mx-auto max-w-content px-6 py-16 lg:px-12">
          <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-primary-deep">
            How we work
          </p>
          <h2 className="mt-3 font-display text-[1.9rem] font-semibold text-text">
            Three things we won&apos;t compromise on
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <div key={v.title} className="rounded-lg border border-border bg-card-bg p-7">
                <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-light font-heading text-[0.78rem] font-extrabold text-text">
                  0{i + 1}
                </div>
                <h3 className="font-heading text-[1.05rem] font-bold text-text">{v.title}</h3>
                <p className="mt-2 font-body text-[0.92rem] leading-relaxed text-muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-content px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-[640px] text-center">
          <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-primary">
            Get in touch
          </p>
          <h2 className="mt-3 font-display text-[1.9rem] font-semibold text-text">
            Need help with food safety, QC, or compliance?
          </h2>
          <p className="mx-auto mt-4 font-body text-lg leading-relaxed text-muted">
            Book a free 30-minute scoping call. We&apos;ll point you to the right template, expert,
            or service — even if that means sending you elsewhere.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <ConsultationButton size="lg">Book a consultation</ConsultationButton>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 rounded-md border-[1.5px] border-border bg-card-bg px-7 py-4 font-heading text-[0.92rem] font-bold text-primary transition hover:border-primary hover:bg-tag-safe-bg"
            >
              See all services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
