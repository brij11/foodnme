import type { SiteStats } from "@/lib/stats";
import { CountUp } from "./CountUp";

/**
 * §3.6 #6 — mid-page social-proof stats row. Four live Supabase counts (computed server-side
 * at build/revalidate in `getSiteStats`): Articles Published, Templates, Industry Topics,
 * Consultations Done. Numbers are dark olive (`text-text`, §4.1/§8), never green. The `+`
 * suffix marks the approximate, always-growing counts (§5.2 — never rounded thousands).
 */
type StatCell = { value: number; label: string; suffix?: string };

export function HomeStats({ stats }: { stats: SiteStats }) {
  const cells: StatCell[] = [
    { value: stats.articles, label: "Articles Published", suffix: "+" },
    { value: stats.templates, label: "Templates" },
    { value: stats.categories, label: "Industry Topics" },
    { value: stats.consultations, label: "Consultations Done", suffix: "+" },
  ];

  return (
    <section className="mx-auto max-w-content px-6 py-16 lg:px-12">
      <div className="grid grid-cols-2 gap-8 rounded-xl border border-border bg-card-bg px-6 py-10 text-center sm:grid-cols-4">
        {cells.map((c) => (
          <div key={c.label}>
            <div className="font-display text-[2.4rem] font-bold leading-none tracking-tight text-text">
              <CountUp value={c.value} suffix={c.suffix} />
            </div>
            <div className="mt-2 font-heading text-[0.66rem] font-bold uppercase tracking-[0.1em] text-muted">
              {c.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
