const STEPS = [
  { num: 1, title: "Submit inquiry", desc: "Tell us about your facility, products, and challenges." },
  { num: 2, title: "Discovery call", desc: "30-minute scoping conversation, free of cost." },
  { num: 3, title: "Proposal & plan", desc: "Written scope with deliverables and timeline." },
  { num: 4, title: "Implementation", desc: "On-site, remote, or hybrid execution support." },
];

/**
 * "How it works" 4-step stepper (blueprint §8 Screen 7). Number circles are primary green
 * (an actionable/progress accent — allowed by the §4.1 rebalance).
 */
export function HowItWorks() {
  return (
    <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((s) => (
        <li key={s.num} className="flex flex-col">
          <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary font-heading text-[1rem] font-bold text-white">
            {s.num}
          </span>
          <h3 className="font-heading text-[1rem] font-bold text-text">{s.title}</h3>
          <p className="mt-1.5 font-body text-[0.88rem] leading-relaxed text-muted">{s.desc}</p>
        </li>
      ))}
    </ol>
  );
}
