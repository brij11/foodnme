import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  SeekerDashboard,
  type ApplicationRow,
  type SeekerStats,
  type SavedJob,
} from "@/components/dashboard/SeekerDashboard";

export const dynamic = "force-dynamic";

// story-jobs-16: `interview` added as fourth status (DEVIATIONS C6).
const FILTERS = new Set(["submitted", "reviewed", "interview", "rejected"]);

export default async function SeekerDashboardPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/seeker");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email")
    .eq("id", user.id)
    .maybeSingle();

  const filter = searchParams.status && FILTERS.has(searchParams.status) ? searchParams.status : "all";

  const svc = createServiceClient();
  let query = svc
    .from("applications")
    .select("id, status, applied_at, job:jobs(id, title, company_name, location)")
    .eq("applicant_id", user.id)
    .order("applied_at", { ascending: false });
  if (filter !== "all") query = query.eq("status", filter);
  const { data } = await query;

  const applications = ((data as unknown as ApplicationRow[] | null) ?? []).map((a) => ({
    ...a,
    job: Array.isArray(a.job) ? (a.job[0] ?? null) : a.job,
  }));

  const { data: statusRows } = await svc
    .from("applications")
    .select("status")
    .eq("applicant_id", user.id);
  // story-jobs-16: `interview` added as fourth status (DEVIATIONS C6).
  const stats: SeekerStats = { total: 0, submitted: 0, reviewed: 0, interview: 0, rejected: 0, saved: 0 };
  for (const r of (statusRows as { status: string }[] | null) ?? []) {
    stats.total += 1;
    if (r.status === "submitted") stats.submitted += 1;
    else if (r.status === "reviewed") stats.reviewed += 1;
    else if (r.status === "interview") stats.interview += 1;
    else if (r.status === "rejected") stats.rejected += 1;
  }

  const { data: savedRows } = await supabase
    .from("saved_items")
    .select("item_id, saved_at")
    .eq("item_type", "job")
    .order("saved_at", { ascending: false });
  const savedIds = ((savedRows as { item_id: string }[] | null) ?? []).map((r) => r.item_id);
  stats.saved = savedIds.length;

  let savedJobs: SavedJob[] = [];
  if (savedIds.length > 0) {
    // story-jobs-16 D7: include salary columns so the saved-job row can show the salary line.
    const { data: sj } = await svc
      .from("jobs")
      .select("id, title, company_name, location, salary_min, salary_max")
      .in("id", savedIds);
    const byId = new Map((sj as SavedJob[] | null)?.map((j) => [j.id, j]) ?? []);
    savedJobs = savedIds.map((id) => byId.get(id)).filter((j): j is SavedJob => Boolean(j));
  }

  return (
    <SeekerDashboard
      fullName={profile?.full_name || user.email || "there"}
      applications={applications}
      activeFilter={filter}
      stats={stats}
      savedJobs={savedJobs}
    />
  );
}
