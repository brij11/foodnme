import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ExpertDashboard,
  type ExpertRow,
  type ExpertInquiry,
} from "@/components/dashboard/ExpertDashboard";

export const dynamic = "force-dynamic";

export default async function ExpertDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/expert");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email")
    .eq("id", user.id)
    .maybeSingle();

  // Own expert row (any status) via the RLS self-read policy; null until they create one.
  const { data: expert } = await supabase
    .from("experts")
    .select(
      "id, full_name, title, bio, specializations, experience_years, hourly_rate, certifications, location, contact_email, avatar_url, status, is_available, rating, review_count, response_time",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  // The expert's own inquiries (RLS scopes to the owning expert — never cross-expert).
  let inquiries: ExpertInquiry[] = [];
  if (expert) {
    const { data: rows } = await supabase
      .from("expert_inquiries")
      .select("id, sender_name, sender_email, company_name, engagement_type, message, is_read, created_at")
      .eq("expert_id", (expert as { id: string }).id)
      .order("created_at", { ascending: false });
    inquiries = (rows as ExpertInquiry[] | null) ?? [];
  }

  const fullName = profile?.full_name || user.email || "there";

  return (
    <ExpertDashboard
      fullName={fullName}
      expert={(expert as ExpertRow | null) ?? null}
      inquiries={inquiries}
      profileDefaults={{ full_name: fullName, email: profile?.email || user.email || "" }}
    />
  );
}
