import type { ReactNode } from "react";

// Auth surfaces (/login, /register, /reset-password) are client forms rendered dynamically —
// never statically cached, so a signed-out shell is never served to a returning user
// (TECHNICAL-REQUIREMENTS.md §7, "no-cache"). The route group keeps them out of the public
// Navbar/Footer shell.
export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
