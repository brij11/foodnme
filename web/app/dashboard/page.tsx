import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Role router: reads profiles.role and forwards to the matching shell (story-auth-07).
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard");

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  redirect(`/dashboard/${data?.role ?? "seeker"}`);
}
