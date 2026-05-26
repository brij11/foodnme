import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

/**
 * Cookie-sync only (TECHNICAL-REQUIREMENTS.md §5.3). Refreshes the Supabase session and
 * returns both the response (with synced cookies) and the resolved user so `middleware.ts`
 * can make routing decisions. No business logic lives here.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Returns the cookie-synced client too so `middleware.ts` can run its (gating-only) role/admin
  // lookups against the same session — keeping business logic out of this factory (§5.3).
  return { response, user, supabase };
}
