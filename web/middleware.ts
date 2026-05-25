import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Route gating (TECHNICAL-REQUIREMENTS.md §5.4).
 *   /admin/*      → require profiles.is_admin (enforced in-route; here we require auth)
 *   /dashboard/*  → require an authenticated user
 *   everything else → public, cookies refreshed only
 *
 * Role-specific redirects (/dashboard/seeker etc.) land with their Sprint-2 surfaces.
 */
export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Listing pages are SSR'd per request but CDN-cacheable (TECHNICAL-REQUIREMENTS.md §7).
  if (
    pathname === "/blog" ||
    pathname === "/templates" ||
    pathname.startsWith("/blog/category/")
  ) {
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  }

  const isGated = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  if (isGated && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Skip Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
