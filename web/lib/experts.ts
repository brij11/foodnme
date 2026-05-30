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
