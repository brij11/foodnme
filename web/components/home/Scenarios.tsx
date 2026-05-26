import Link from "next/link";
import { Icon, type IconName } from "@/components/ui";

type Scenario = {
  icon: IconName;
  hook: string;
  desc: string;
  cta: string;
  to: string;
};

/** §3.6 #3 — four need-based framings, each routing to the matching product. */
const SCENARIOS: Scenario[] = [
  {
    icon: "shield",
    hook: "Audit on Monday?",
    desc: "Download an audit-ready HACCP plan or supplier checklist in under a minute.",
    cta: "Browse templates",
    to: "/templates",
  },
  {
    icon: "file",
    hook: "Wondering about the new FSSAI rules?",
    desc: "Practical explainers on regulatory changes, written by working auditors.",
    cta: "Read the blog",
    to: "/blog",
  },
  {
    icon: "briefcase",
    hook: "Hiring a QC microbiologist?",
    desc: "Post a role to a curated network of food-tech professionals across India.",
    cta: "Explore jobs",
    to: "/jobs",
  },
  {
    icon: "verified",
    hook: "Need expert eyes on a problem?",
    desc: "Book a one-hour consult with an FSSAI auditor or processing specialist.",
    cta: "Find an expert",
    to: "/experts",
  },
];

export function Scenarios() {
  return (
    <section className="mx-auto max-w-content px-6 py-16 lg:px-12">
      <div className="mb-10 text-center">
        <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-text">
          How foodnme helps
        </p>
        <h2 className="mt-3 font-display text-[1.9rem] font-semibold text-text">
          Pick the thing you came here for.
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {SCENARIOS.map((s) => (
          <Link
            key={s.to}
            href={s.to}
            className="group flex flex-col rounded-lg border border-border bg-card-bg p-6 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-tag-safe-bg text-text">
              <Icon name={s.icon} size={20} stroke={1.8} />
            </span>
            <h3 className="mt-4 font-heading text-[1.1rem] font-bold text-text">{s.hook}</h3>
            <p className="mt-2 font-body text-[0.92rem] leading-relaxed text-muted">{s.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 font-heading text-[0.8rem] font-bold text-primary group-hover:text-primary-deep">
              {s.cta}
              <Icon name="arrow" size={14} stroke={2.2} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
