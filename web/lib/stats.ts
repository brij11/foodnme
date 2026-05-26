import { createServiceClient } from "@/lib/supabase/service";

/**
 * Site-wide aggregate counts powering the homepage hero strip (story-homepage-05)
 * and the mid-page social-proof Stats row (story-homepage-06).
 *
 * Computed server-side at build / on-demand revalidate (the homepage is SSG,
 * TECHNICAL-REQUIREMENTS.md §7). Several sources are PII tables anon RLS can't read
 * (newsletter_subscribers, service_inquiries), so this uses the service-role client —
 * safe here because it only ever runs at build/revalidate, never in the browser, and
 * returns aggregate counts only (no rows). Numbers are real-origin; the UI applies the
 * §5.2 approximate `+`/`k` presentation.
 */
export type SiteStats = {
  /** Published articles — hero + mid-page "Articles Published". */
  articles: number;
  /** Downloadable templates (resources) — hero + mid-page "Templates". */
  templates: number;
  /** Distinct categories among published articles — mid-page "Industry Topics". */
  categories: number;
  /** Active newsletter subscribers — hero "Subscribers". */
  subscribers: number;
  /** Distinct companies served via inquiries — hero "Businesses Helped". */
  businesses: number;
  /** Total consultation / service inquiries handled — mid-page "Consultations Done". */
  consultations: number;
};

export async function getSiteStats(): Promise<SiteStats> {
  const supabase = createServiceClient();

  const [articles, templates, subscribers, consultations, categoryRows, companyRows] =
    await Promise.all([
      supabase.from("articles").select("*", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("resources").select("*", { count: "exact", head: true }),
      supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      supabase.from("service_inquiries").select("*", { count: "exact", head: true }),
      supabase.from("articles").select("category").eq("is_published", true),
      supabase.from("service_inquiries").select("company_name"),
    ]);

  const categories = new Set((categoryRows.data ?? []).map((r) => r.category)).size;
  const businesses = new Set(
    (companyRows.data ?? [])
      .map((r) => r.company_name)
      .filter((c): c is string => typeof c === "string" && c.trim().length > 0),
  ).size;

  return {
    articles: articles.count ?? 0,
    templates: templates.count ?? 0,
    subscribers: subscribers.count ?? 0,
    consultations: consultations.count ?? 0,
    categories,
    businesses,
  };
}
