import type { Metadata } from "next";
import { getSiteStats } from "@/lib/stats";
import { getLatestArticles } from "@/lib/articles";
import { Hero } from "@/components/home/Hero";
import { ValueStrip } from "@/components/home/ValueStrip";
import { Scenarios } from "@/components/home/Scenarios";
import { KnowledgeHubSection } from "@/components/home/KnowledgeHubSection";
import { FinalCta } from "@/components/home/FinalCta";

/**
 * Homepage — the narrative arc of UI-DESIGN-HANDOFF.md §3.6, built across stories
 * homepage-04/05/06/07. SSG with on-demand revalidation (TECHNICAL-REQUIREMENTS.md §7):
 * data is read at build / revalidate via cookie-free clients, so `/` stays static.
 *
 * This shell (story-homepage-05) establishes all ten §3.6 sections in order and owns
 * #1 Hero, #2 Value strip, #3 Scenarios, #4 the Knowledge-Hub container, and #8 Final CTA.
 * The remaining slots are mount points filled by:
 *   #4 editorial feature → story-homepage-06   #4 latest rail → story-homepage-04
 *   #5 testimonials, #6 stats row, #9 Good-to-know → story-homepage-06
 *   #7 Featured this week, #10 Newsletter → story-homepage-07
 */
export const metadata: Metadata = {
  title: "foodnme — Practical resources for a safer food ecosystem",
  description:
    "Field-tested HACCP plans, audit checklists, and expert writing for food safety, QC, and regulatory teams across India.",
  openGraph: {
    title: "foodnme — Practical resources for a safer food ecosystem",
    description:
      "Field-tested HACCP plans, audit checklists, and expert writing for food safety, QC, and regulatory teams across India.",
    type: "website",
  },
};

export default async function HomePage() {
  const [stats, recentCovers] = await Promise.all([
    getSiteStats(),
    getLatestArticles({ limit: 2 }),
  ]);
  const covers = recentCovers
    .map((a) => a.cover_image_url)
    .filter((u): u is string => typeof u === "string" && u.length > 0);

  return (
    <>
      {/* §3.6 #1 */}
      <Hero stats={stats} covers={covers} />

      {/* §3.6 #2 */}
      <ValueStrip />

      {/* §3.6 #3 */}
      <Scenarios />

      {/* §3.6 #4 — editorial feature (homepage-06) + latest rail (homepage-04) mount here */}
      <KnowledgeHubSection />

      {/* §3.6 #5 Testimonials, #6 Stats row — homepage-06 */}

      {/* §3.6 #7 Featured this week — homepage-07 */}

      {/* §3.6 #8 */}
      <FinalCta />

      {/* §3.6 #9 Good to know (Q&A) — homepage-06 */}

      {/* §3.6 #10 Newsletter — homepage-07 */}
    </>
  );
}
