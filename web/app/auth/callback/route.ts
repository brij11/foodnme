import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Literal `auth/callback` segment (not the `(auth)` route group) → serves `/auth/callback`,
// the Supabase email-confirmation redirect target (story-auth-03). Always dynamic — it sets
// session cookies and must never be cached.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Session established → drop the user into the role-router (story-auth-07).
      return NextResponse.redirect(`${origin}/dashboard`, 302);
    }
  }

  // No code, or the exchange failed (expired/used link) → back to login with a banner.
  return NextResponse.redirect(`${origin}/login?error=verification_failed`, 302);
}
