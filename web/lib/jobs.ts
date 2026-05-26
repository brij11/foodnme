import { createPublicClient } from "@/lib/supabase/public";

export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Remote", "Internship"] as const;
export const EXPERIENCE_LEVELS = ["Entry-level", "Mid-level", "Senior", "Lead"] as const;
export const JOBS_PAGE_SIZE = 8;

export type JobCardData = {
  id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  experience_level: string;
  skills: string[];
};

export type JobDetail = JobCardData & {
  description: string;
  created_at: string;
  expires_at: string | null;
};

const CARD_COLUMNS =
  "id, title, company_name, location, job_type, salary_min, salary_max, experience_level, skills";
const DETAIL_COLUMNS = `${CARD_COLUMNS}, description, created_at, expires_at`;

export type JobFilters = {
  q?: string;
  jobTypes?: string[];
  experienceLevels?: string[];
  location?: string;
  salaryMin?: number;
  sort?: "recent" | "salary";
  page?: number;
};

/** Active jobs for `/jobs` (story-jobs-01), filtered + sorted + paginated. Returns rows + total. */
export async function listJobs(
  filters: JobFilters = {},
): Promise<{ jobs: JobCardData[]; total: number }> {
  const supabase = createPublicClient();
  let query = supabase
    .from("jobs")
    .select(CARD_COLUMNS, { count: "exact" })
    .eq("status", "active");

  if (filters.q && filters.q.trim()) {
    const q = filters.q.trim().replace(/[%,()]/g, " ");
    query = query.or(`title.ilike.*${q}*,company_name.ilike.*${q}*,skills.cs.{${q}}`);
  }
  if (filters.jobTypes && filters.jobTypes.length > 0) {
    query = query.in("job_type", filters.jobTypes);
  }
  if (filters.experienceLevels && filters.experienceLevels.length > 0) {
    query = query.in("experience_level", filters.experienceLevels);
  }
  if (filters.location && filters.location.trim()) {
    query = query.ilike("location", `%${filters.location.trim()}%`);
  }
  if (filters.salaryMin && filters.salaryMin > 0) {
    query = query.gte("salary_max", filters.salaryMin);
  }

  query =
    filters.sort === "salary"
      ? query.order("salary_max", { ascending: false, nullsFirst: false })
      : query.order("created_at", { ascending: false });

  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * JOBS_PAGE_SIZE;
  query = query.range(from, from + JOBS_PAGE_SIZE - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(`listJobs failed: ${error.message}`);
  return { jobs: (data as JobCardData[] | null) ?? [], total: count ?? 0 };
}

/** A single active job by id (story-jobs-02), or null if missing / not active. */
export async function getJobById(id: string): Promise<JobDetail | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(DETAIL_COLUMNS)
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();
  if (error) {
    if (error.code === "22P02") return null;
    throw new Error(`getJobById failed: ${error.message}`);
  }
  return (data as JobDetail | null) ?? null;
}

/** 2-letter company initials (rendering-only field in the prototype). */
export function companyInitial(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "FN";
}

/** Salary range as "₹12.0–18.0 LPA" / "From ₹5.0 LPA" / "Salary not disclosed". */
export function formatSalary(min: number | null, max: number | null): string {
  const l = (n: number) => (n / 100000).toFixed(1);
  if (min && max) return `₹${l(min)}–${l(max)} LPA`;
  if (min) return `From ₹${l(min)} LPA`;
  if (max) return `Up to ₹${l(max)} LPA`;
  return "Salary not disclosed";
}
