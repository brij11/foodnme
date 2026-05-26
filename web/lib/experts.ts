import { createPublicClient } from "@/lib/supabase/public";

/** Specialization options for the directory filter (ported from data.jsx SPECIALIZATIONS). */
export const SPECIALIZATIONS = [
  "Food Safety",
  "Quality Control",
  "Regulatory Compliance",
  "HACCP",
  "Product Development",
  "Sensory Analysis",
  "Process Engineering",
  "Auditing",
  "Nutraceuticals",
  "Labeling",
  "Dairy",
  "Bakery",
  "Beverages",
  "Snacks",
] as const;

/**
 * An expert as the listing cards need it. `contact_email` is deliberately absent — it is
 * server-only and never reaches the client (anti-harvesting, story-experts-02/03).
 */
export type ExpertCardData = {
  id: string;
  full_name: string;
  title: string;
  avatar_url: string | null;
  specializations: string[];
  hourly_rate: number | null;
  location: string;
  is_available: boolean;
  is_featured: boolean;
};

const CARD_COLUMNS =
  "id, full_name, title, avatar_url, specializations, hourly_rate, location, is_available, is_featured";

export type ExpertFilters = {
  q?: string;
  specializations?: string[];
  location?: string;
  available?: boolean;
};

/**
 * Active experts for `/experts` (story-experts-01). Featured first, then newest. Free-text `q`
 * runs against the FTS `search_vector` (full_name + title + specializations); specializations
 * filter by array overlap; location by ILIKE; `available` narrows to `is_available=true`.
 * RLS already restricts the anon client to `status='active'`; we also assert it explicitly.
 */
export async function listExperts(filters: ExpertFilters = {}): Promise<ExpertCardData[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from("experts")
    .select(CARD_COLUMNS)
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.q && filters.q.trim()) {
    query = query.textSearch("search_vector", filters.q.trim(), { type: "websearch" });
  }
  if (filters.specializations && filters.specializations.length > 0) {
    query = query.overlaps("specializations", filters.specializations);
  }
  if (filters.location && filters.location.trim()) {
    query = query.ilike("location", `%${filters.location.trim()}%`);
  }
  if (filters.available) {
    query = query.eq("is_available", true);
  }

  const { data, error } = await query;
  if (error) throw new Error(`listExperts failed: ${error.message}`);
  return (data as ExpertCardData[] | null) ?? [];
}

/** 2-letter initials fallback when an expert has no avatar (CLAUDE.md rendering rule). */
export function expertInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  // Skip an honorific like "Dr." so "Dr. Aarti Menon" → "AM".
  const meaningful = parts.filter((p) => !/^(dr|mr|ms|mrs|prof)\.?$/i.test(p));
  const source = meaningful.length > 0 ? meaningful : parts;
  return source.map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "FN";
}

/** Renders an integer hourly rate as "₹6,000/hr"; null → "Rate on request". */
export function formatHourlyRate(rate: number | null): string {
  if (rate == null) return "Rate on request";
  return `₹${rate.toLocaleString("en-IN")}/hr`;
}
