import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  SeekerDashboard,
  type ApplicationRow,
  type SeekerStats,
} from "@/components/dashboard/SeekerDashboard";

export const dynamic = "force-dynamic";

const FILTERS = new Set(["submitted", "reviewed", "rejected"]);

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

  // Service role joins jobs so a closed job's title still shows (the seeker can't read closed
  // jobs via RLS). The seeker is already authenticated above.
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

  // Stats are derived from ALL of the seeker's applications (unfiltered), not the filtered list.
  const { data: statusRows } = await svc
    .from("applications")
    .select("status")
    .eq("applicant_id", user.id);
  const stats: SeekerStats = { total: 0, submitted: 0, reviewed: 0, rejected: 0, saved: 0 };
  for (const r of (statusRows as { status: string }[] | null) ?? []) {
    stats.total += 1;
    if (r.status === "submitted") stats.submitted += 1;
    else if (r.status === "reviewed") stats.reviewed += 1;
    else if (r.status === "rejected") stats.rejected += 1;
  }
  // saved stays 0 until the saved-jobs feature (story-jobs-15) lands a saved_items table.

  return (
    <SeekerDashboard
      fullName={profile?.full_name || user.email || "there"}
      applications={applications}
      activeFilter={filter}
      stats={stats}
    />
  );
}
