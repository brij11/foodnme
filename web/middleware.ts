import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { safeRedirect } from "@/lib/utils/redirect";

const ROLES = ["seeker", "employer", "expert"] as const;
type Role = (typeof ROLES)[number];

/**
 * Route gating (TECHNICAL-REQUIREMENTS.md §5.4, story-auth-06).
 *   /dashboard/*          → require an authenticated user, else 302 /login?redirect=<path>
 *   /dashboard/<role>/*   → require profiles.role === <role>, else 302 to the user's dashboard
 *   /admin/*              → require profiles.is_admin, else 302 /dashboard
 *
 * The matcher is scoped to the gated trees only, so public routes never pay a Supabase
 * round-trip (the token refresh in `updateSession` therefore runs on gated visits, satisfying
 * the refresh-rotation requirement). Listing-page CDN cache headers live in `next.config.mjs`.
 */
export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Unauthenticated → login, preserving an internal redirect-back target.
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("redirect", safeRedirect(pathname, "/dashboard"));
    return NextResponse.redirect(url);
  }

  // Role from the JWT projection (cheap); fall back to a profiles query only if absent.
  let role = (user.user_metadata?.role as string | undefined) ?? undefined;

  // /admin/* → must be an admin (is_admin is DB-only, never in the JWT).
  if (pathname.startsWith("/admin")) {
    const { data } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    if (!data?.is_admin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return response;
  }

  // /dashboard/<role>/* → must match the user's own role.
  const target = ROLES.find((r) => pathname.startsWith(`/dashboard/${r}`));
  if (target) {
    if (!role) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      role = (data?.role as Role | undefined) ?? undefined;
    }
    if (role !== target) {
      return NextResponse.redirect(
        new URL(role ? `/dashboard/${role}` : "/dashboard", request.url),
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
