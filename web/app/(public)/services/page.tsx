import type { Metadata } from "next";
import { SERVICES } from "@/lib/services";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Credibility } from "@/components/services/Credibility";
import { HowItWorks } from "@/components/services/HowItWorks";
import { InquiryForm } from "@/components/services/InquiryForm";

export const metadata: Metadata = {
  title: "Food Technology Consulting — foodnme",
  description:
    "Audit-ready documentation, HACCP rollouts, and FSSAI compliance support for food manufacturers, FBOs, and growing food brands.",
  openGraph: {
    title: "Food Technology Consulting — foodnme",
    description: "HACCP, FSSAI compliance, QMS, and audit support from a working FSSAI auditor.",
    type: "website",
  },
};

// Static page — services are code-level content (no DB). On-demand revalidation arrives with
// the Sprint-3 admin surface; today the page is prerendered at build (see Notes).
function Overline({ children }: { children: React.ReactNode }) {
  // Dark olive (not green) per the §4.1 green-rebalance.
  return (
    <p className="font-heading text-[0.65rem] font-bold uppercase tracking-[0.14em] text-text">{children}</p>
  );
}

export default function ServicesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-content px-6 pb-12 pt-20 lg:px-12">
        <div className="max-w-[920px]">
          <Overline>Consulting Services</Overline>
          <h1 className="mt-4 font-display text-[clamp(2rem,4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-text">
            Food Technology Consulting.
          </h1>
          <p className="mt-5 max-w-[620px] font-body text-[1.1rem] leading-relaxed text-muted">
            Audit-ready documentation, HACCP rollouts, and FSSAI compliance support for food manufacturers, FBOs,
            and growing food brands.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#inquiry"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3.5 font-heading text-[0.9rem] font-bold text-white transition hover:bg-primary-deep"
            >
              Request a free consultation
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-md border border-border bg-white px-6 py-3.5 font-heading text-[0.9rem] font-bold text-text transition hover:border-primary hover:text-primary"
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="mx-auto max-w-content px-6 py-12 lg:px-12">
        <Overline>Services</Overline>
        <h2 className="mb-8 mt-3 font-display text-[1.8rem] font-semibold tracking-[-0.02em] text-text">
          What we help with
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <div
              key={service.slug}
              className="motion-reduce:animate-none animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
      </section>

      <Credibility />

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-content px-6 py-20 lg:px-12">
        <Overline>Process</Overline>
        <h2 className="mb-10 mt-3 font-display text-[1.8rem] font-semibold tracking-[-0.02em] text-text">
          How it works
        </h2>
        <HowItWorks />
      </section>

      {/* Inquiry form (services-02) — the hero CTA's scroll target. */}
      <section id="inquiry" className="mx-auto max-w-content px-6 pb-24 lg:px-12">
        <div className="mx-auto max-w-[820px] rounded-xl border border-border bg-white p-8 sm:p-12">
          <Overline>Start a conversation</Overline>
          <h2 className="mt-3 font-display text-[1.8rem] font-semibold tracking-[-0.02em] text-text">
            Tell us about your food business.
          </h2>
          <p className="mb-8 mt-3 font-body text-[1.02rem] leading-relaxed text-muted">
            We respond within 24 hours. The first scoping call is on us — no commitment, no pitch.
          </p>
          <InquiryForm />
        </div>
      </section>
    </div>
  );
}
