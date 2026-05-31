/**
 * §3.6 #5 — social proof. Two static blockquotes (§5.3 format: first name + last initial,
 * role + segment, never a company name) on the cream surface, with accent-color quote marks.
 * Copy is verbatim from the prototype `HomePage` (`design/screens-main.jsx`); there is no
 * testimonials table.
 */
type Testimonial = { quote: string; name: string; role: string; initials: string };

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Before foodnme, we rebuilt our HACCP plan from scratch every audit cycle. Now we iterate on one good template — and pass the first time.",
    name: "Sneha P.",
    role: "QA Manager, mid-sized dairy",
    initials: "SP",
  },
  {
    quote:
      "The blog is the only place that writes about FSSAI changes the way a working auditor actually thinks about them. Saved me hours every month.",
    name: "Rohan I.",
    role: "Regulatory Lead, snacks brand",
    initials: "RI",
  },
];

export function Testimonials() {
  return (
    <section className="bg-surface-light py-20">
      <div className="mx-auto max-w-content px-6 lg:px-12">
        <div className="mx-auto mb-11 max-w-xl text-center">
          <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-text">
            Why food-tech teams use foodnme
          </p>
          <h2 className="mt-3 font-display text-[1.9rem] font-semibold text-text">
            &ldquo;It just saves us time.&rdquo;
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="rounded-lg border border-border bg-card-bg p-7 shadow-card"
            >
              <blockquote className="relative font-display text-[1.02rem] leading-relaxed text-text">
                <span aria-hidden="true" className="mr-1 font-display text-3xl leading-none text-accent">
                  &ldquo;
                </span>
                {t.quote}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tag-safe-bg font-heading text-[0.8rem] font-bold text-tag-safe-text">
                  {t.initials}
                </div>
                <div>
                  <div className="font-heading text-[0.9rem] font-semibold text-text">{t.name}</div>
                  <div className="font-body text-[0.8rem] text-muted">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
