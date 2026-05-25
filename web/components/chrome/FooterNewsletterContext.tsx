"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type FooterNewsletterContextValue = {
  hasFullBanner: boolean;
  /** Called by a full NewsletterBanner on mount; returns a de-register cleanup. */
  registerFullBanner: () => () => void;
};

const FooterNewsletterContext = createContext<FooterNewsletterContextValue>({
  hasFullBanner: false,
  registerFullBanner: () => () => {},
});

export function useFooterNewsletter() {
  return useContext(FooterNewsletterContext);
}

/**
 * Tracks whether the current page renders a full `NewsletterBanner`. The Footer reads
 * `hasFullBanner` to decide whether to also show its mini newsletter input
 * (UI-DESIGN-HANDOFF.md §2.2 / story-homepage-02 AC#7) — avoiding two signups on one page.
 * Provider wraps both the route content and the Footer so registration flows to the Footer.
 */
export function FooterNewsletterProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const registerFullBanner = useCallback(() => {
    setCount((c) => c + 1);
    return () => setCount((c) => Math.max(0, c - 1));
  }, []);
  const value = useMemo(
    () => ({ hasFullBanner: count > 0, registerFullBanner }),
    [count, registerFullBanner],
  );
  return <FooterNewsletterContext.Provider value={value}>{children}</FooterNewsletterContext.Provider>;
}
