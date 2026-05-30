import Link from "next/link";
import { Icon } from "@/components/ui";

/**
 * §3.6 #9 — "Good to know" informational interlude. Asymmetric two-column: a sticky intro on
 * the left, a numbered Q&A list on the right. Five static Q&As, verbatim from the prototype
 * `HomePage` (`design/screens-main.jsx`) — there is no FAQ table. Closes with a link to the
 * full About page.
 */
type QA = { q: string; a: string };

const QAS: QA[] = [
  {
    q: "How do you decide which templates to publish?",
    a: "We only ship templates we've used in real engagements ourselves. New additions go through a final audit by an FSSAI-certified reviewer before release.",
  },
  {
    q: "Who writes the articles?",
    a: "Working auditors, QC managers, and process engineers. No general-purpose bloggers and no AI-generated content.",
  },
  {
    q: "How do you vet the experts?",
    a: "We verify certifications, check references, and review at least three completed engagements before any expert goes live.",
  },
  {
    q: "Where are you based?",
    a: "Mumbai. We're built for Indian food businesses first, but most of the resources work globally.",
  },
  {
    q: "Can I trust the jobs board?",
    a: "Every posting goes through an admin review for legitimacy, scope, and compensation transparency before it goes live.",
  },
];

export function GoodToKnow() {
  return (
    <section className="mx-auto max-w-content px-6 py-16 lg:px-12">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-text">
            Good to know
          </p>
          <h2 className="mt-3 font-display text-[1.9rem] font-semibold leading-tight text-text">
            A few things about how foodnme works.
          </h2>
          <p className="mt-4 font-body text-lg leading-relaxed text-muted">
            A quick read before you go any deeper — most common questions answered here.
          </p>
          <Link
            href="/about"
            className="mt-5 inline-flex items-center gap-1.5 font-heading text-[0.82rem] font-bold text-primary underline-offset-4 hover:text-primary-deep hover:underline"
          >
            Read the full About page
            <Icon name="arrow" size={14} stroke={2.2} aria-hidden="true" />
          </Link>
        </div>

        <ul className="divide-y divide-border">
          {QAS.map((item, i) => (
            <li key={item.q} className="flex gap-5 py-6 first:pt-0">
              <span className="font-display text-[1.1rem] font-bold tabular-nums text-[#8c5a23]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-heading text-[1.05rem] font-bold text-text">{item.q}</h3>
                <p className="mt-2 font-body text-[0.95rem] leading-relaxed text-muted">{item.a}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
