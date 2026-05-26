import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

export type AuthContext = "login" | "register" | "reset";

// Side-panel copy per surface — ported from `design/screens-auth.jsx` (AuthSidePanel).
const PANELS: Record<AuthContext, { heading: string; blurb: string; features: string[] }> = {
  login: {
    heading: "Welcome back to foodnme.",
    blurb: "Sign in to manage applications, post jobs, or update your expert profile.",
    features: [
      "100+ active job listings across India",
      "Vetted experts available for short engagements",
      "Templates, articles, and weekly newsletter",
      "Trusted by 4,200+ food-tech professionals",
    ],
  },
  register: {
    heading: "Join the food-tech community.",
    blurb:
      "Create a free account to post jobs, build an expert profile, or apply with one click.",
    features: [
      "Build a profile recruiters actually find",
      "Apply with one click using your saved resume",
      "Track applications and saved jobs in one place",
      "Get curated job alerts every week",
    ],
  },
  reset: {
    heading: "Forgot your password?",
    blurb:
      "Enter the email address you registered with and we'll send you a secure reset link.",
    features: [
      "We'll email you a secure reset link",
      "Links expire in 30 minutes",
      "Never reused — every request issues a fresh link",
    ],
  },
};

function Brand() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 font-heading text-[1.3rem] font-extrabold tracking-[-0.025em] text-white"
    >
      <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden />
      foodnme
    </Link>
  );
}

/**
 * Two-column auth surface (story-auth-01). Left: brand + value-prop panel (hidden below `lg`).
 * Right: the page's form, vertically centered. The panel content is driven by `context` so
 * login / register / reset share one layout. No public Navbar/Footer — auth is its own surface.
 */
export function AuthShell({
  context,
  children,
}: {
  context: AuthContext;
  children: ReactNode;
}) {
  const panel = PANELS[context];
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-center overflow-hidden bg-primary-deep px-12 py-16 text-white lg:flex">
        <div className="relative z-10 max-w-md">
          <Brand />
          <h2 className="mt-10 font-heading text-[2rem] font-bold leading-tight text-white">
            {panel.heading}
          </h2>
          <p className="mt-4 font-body text-[1rem] leading-relaxed text-white/80">{panel.blurb}</p>
          <ul className="mt-9 flex flex-col gap-4">
            {panel.features.map((f) => (
              <li key={f} className="flex items-start gap-3 font-body text-[0.95rem] text-white/90">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Icon name="check" size={13} stroke={2.6} />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex items-center justify-center bg-background px-6 py-12 sm:px-12">
        <div className="w-full max-w-[420px]">{children}</div>
      </main>
    </div>
  );
}
