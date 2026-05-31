/**
 * §3.6 #2 — value strip: a one-sentence positioning line with a left-edge accent rule.
 * Overline in dark olive (`text-text`, §4.1), not green.
 */
export function ValueStrip() {
  return (
    <section className="mx-auto max-w-content px-6 py-12 lg:px-12">
      <div className="border-l-[3px] border-primary pl-6">
        <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-text">
          For QA · QC · Regulatory · R&amp;D teams
        </p>
        <p className="mt-3 max-w-3xl font-display text-[clamp(1.3rem,2.5vw,1.8rem)] leading-snug text-text">
          We share the templates, expertise, and people we use ourselves — so you don&apos;t have
          to rebuild from scratch.
        </p>
      </div>
    </section>
  );
}
