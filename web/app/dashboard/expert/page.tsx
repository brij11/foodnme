import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ExpertDashboard, type ExpertRow } from "@/components/dashboard/ExpertDashboard";

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
      "id, full_name, title, bio, specializations, experience_years, hourly_rate, certifications, location, contact_email, status, is_available",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const fullName = profile?.full_name || user.email || "there";

  return (
    <ExpertDashboard
      fullName={fullName}
      expert={(expert as ExpertRow | null) ?? null}
      profileDefaults={{ full_name: fullName, email: profile?.email || user.email || "" }}
    />
  );
}
