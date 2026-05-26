import Image from "next/image";
import { Icon } from "@/components/ui/Icon";

const CERTS = [
  "FSSAI Accredited Auditor",
  "GFSI Trained — FSSC 22000",
  "BSc + MSc Food Technology",
  "Trainer at NIFTEM workshops",
];

const STATS = [
  { value: "85+", label: "Clients helped" },
  { value: "12", label: "Years experience" },
  { value: "40+", label: "FSSAI audits" },
];

/**
 * Credibility / about-the-founder block (blueprint §8 Screen 7): 2-column — founder photo +
 * name + title on the left; bio + certifications + stats (years, clients helped) on the right.
 * Stat numbers are dark olive per the §4.1 green-rebalance.
 */
export function Credibility() {
  return (
    <section className="bg-surface-light">
      <div className="mx-auto grid max-w-content items-center gap-14 px-6 py-20 lg:grid-cols-[1fr_1.4fr] lg:px-12">
        <div>
          <div className="relative aspect-square max-w-[320px] overflow-hidden rounded-lg bg-card-bg">
            <Image
              src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80&auto=format&fit=crop"
              alt="Aarti Menon, founder of foodnme"
              fill
              sizes="(max-width: 1024px) 100vw, 320px"
              className="object-cover"
            />
          </div>
          <h3 className="mt-5 font-heading text-[1.1rem] font-bold text-text">Aarti Menon</h3>
          <p className="mt-1 font-body text-[0.85rem] text-muted">Founder · FSSAI Auditor · 12 years</p>
        </div>

        <div>
          <p className="font-heading text-[0.65rem] font-bold uppercase tracking-[0.14em] text-text">
            About the founder
          </p>
          <h2 className="mt-3 font-heading text-[1.6rem] font-bold leading-tight tracking-[-0.02em] text-text">
            Twelve years auditing, implementing, and teaching food safety systems.
          </h2>
          <p className="mt-4 font-body text-[1.02rem] leading-relaxed text-muted">
            I&apos;ve helped 85+ Indian food businesses — from co-packers to category leaders — build documentation
            systems that survive third-party audits and scale with the business.
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {CERTS.map((c) => (
              <li key={c} className="flex items-start gap-2 font-body text-[0.88rem] text-muted">
                <span className="mt-0.5 text-primary">
                  <Icon name="check" size={16} stroke={2.2} />
                </span>
                {c}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-8">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="font-display text-[1.7rem] font-semibold text-text">{s.value}</div>
                <div className="font-body text-[0.78rem] text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
