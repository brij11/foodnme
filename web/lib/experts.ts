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

/** A single engagement option an expert offers (story-experts-08, stored as jsonb). */
export type EngagementType = {
  kind: "hourly" | "project" | "retainer";
  title: string;
  desc: string;
  price: string;
};

/**
 * An expert as the listing cards need it. `contact_email` is deliberately absent — it is
 * server-only and never reaches the client (anti-harvesting, story-experts-02/03).
 * `rating` / `review_count` / `response_time` are the directly-stored reputation fields (experts-08).
 */
export type ExpertCardData = {
  id: string;
  full_name: string;
  title: string;
  avatar_url: string | null;
  specializations: string[];
  bio: string;
  hourly_rate: number | null;
  location: string;
  is_available: boolean;
  is_featured: boolean;
  rating: number | null;
  review_count: number;
  response_time: string | null;
};

const CARD_COLUMNS =
  "id, full_name, title, avatar_url, specializations, bio, hourly_rate, location, is_available, is_featured, rating, review_count, response_time";

export type ExpertFilters = {
  q?: string;
  specializations?: string[];
  location?: string;
  available?: boolean;
  /** Filter to verified experts only (`is_featured = true`). story-experts-12 / DEVIATIONS A1. */
  verified?: boolean;
  /** Column to sort by: "rating" (default) or "experience" (`experience_years`). DEVIATIONS A2. */
  sortBy?: "rating" | "experience";
};

/**
 * Active experts for `/experts` (story-experts-01, story-experts-12). sortBy "rating" orders by
 * rating desc then is_featured desc; sortBy "experience" orders by experience_years desc then
 * is_featured desc. Free-text `q` runs against the FTS `search_vector`; specializations by array
 * overlap; location by ILIKE; `available` narrows to `is_available=true`; `verified` narrows to
 * `is_featured=true` (DEVIATIONS A1 — is_featured is the "Verified expert" flag, §4.2 line 144).
 * RLS already restricts the anon client to `status='active'`; we also assert it explicitly.
 */
export async function listExperts(filters: ExpertFilters = {}): Promise<ExpertCardData[]> {
  const supabase = createPublicClient();
  const sortBy = filters.sortBy ?? "rating";

  let query = supabase
    .from("experts")
    .select(CARD_COLUMNS)
    .eq("status", "active");

  if (sortBy === "experience") {
    query = query
      .order("experience_years", { ascending: false })
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    query = query
      .order("rating", { ascending: false, nullsFirst: false })
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });
  }

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
  if (filters.verified) {
    query = query.eq("is_featured", true);
  }

  const { data, error } = await query;
  if (error) throw new Error(`listExperts failed: ${error.message}`);
  return (data as ExpertCardData[] | null) ?? [];
}

/** The featured-expert card needs `experience_years` for the "title · N yrs" line. */
export type FeaturedExpert = ExpertCardData & { experience_years: number };

/**
 * The single expert for the homepage "Featured this week" block (story-homepage-07):
 * `WHERE is_featured AND status='active' ORDER BY created_at desc LIMIT 1`, falling back to the
 * most-recent active expert when none is flagged. (The admin "approve" action transitions an
 * expert pending → `active`, so the story's "approved" maps to the implemented `status='active'`;
 * RLS also restricts the anon client to active rows.) Returns null when no active expert exists,
 * so the caller renders the §5.4 stub.
 */
export async function getFeaturedExpert(): Promise<FeaturedExpert | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("experts")
    .select(`${CARD_COLUMNS}, experience_years`)
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw new Error(`getFeaturedExpert failed: ${error.message}`);
  return ((data as FeaturedExpert[] | null) ?? [])[0] ?? null;
}

/** Full expert profile for the detail page — still WITHOUT `contact_email` (anti-harvesting). */
export type ExpertDetail = ExpertCardData & {
  experience_years: number;
  certifications: string[];
  engagement_types: EngagementType[];
};

const DETAIL_COLUMNS =
  "id, full_name, title, avatar_url, specializations, bio, experience_years, hourly_rate, certifications, location, is_available, is_featured, rating, review_count, response_time, engagement_types";

/**
 * A single active expert by id for `/experts/[id]` (story-experts-02), or null if missing /
 * not active. `contact_email` is never selected — it is reached only server-side by the
 * contact relay (story-experts-03).
 */
export async function getExpertById(id: string): Promise<ExpertDetail | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("experts")
    .select(DETAIL_COLUMNS)
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();
  if (error) {
    // An invalid uuid syntax surfaces as a query error → treat as not found, don't 500.
    if (error.code === "22P02") return null;
    throw new Error(`getExpertById failed: ${error.message}`);
  }
  return (data as ExpertDetail | null) ?? null;
}

/**
 * "Similar experts" for the detail page (story-experts-10): active experts with overlapping
 * specializations, excluding the current expert, featured-first then newest, capped at `limit`.
 */
export async function getSimilarExperts(
  expert: Pick<ExpertDetail, "id" | "specializations">,
  limit = 3,
): Promise<ExpertCardData[]> {
  if (expert.specializations.length === 0) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("experts")
    .select(CARD_COLUMNS)
    .eq("status", "active")
    .neq("id", expert.id)
    .overlaps("specializations", expert.specializations)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`getSimilarExperts failed: ${error.message}`);
  return (data as ExpertCardData[] | null) ?? [];
}

/** Active experts by id (for search results — story-search-02), as directory cards. */
export async function getExpertsByIds(ids: string[]): Promise<ExpertCardData[]> {
  if (ids.length === 0) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("experts")
    .select(CARD_COLUMNS)
    .eq("status", "active")
    .in("id", ids);
  if (error) throw new Error(`getExpertsByIds failed: ${error.message}`);
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
