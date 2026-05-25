"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { useConsultationModal } from "@/components/consultation/ConsultationModalProvider";
import { cn } from "@/lib/utils/cn";

type NavItem = { label: string; href?: string; disabled?: boolean };

// IA order from UI-DESIGN-HANDOFF.md §2.1. Jobs/Experts ship disabled until their
// Sprint-2 surfaces exist (§2.1 rollout note) — the nav shape never changes.
const NAV_ITEMS: NavItem[] = [
  { label: "About Us", href: "/about" },
  { label: "Knowledge Hub", href: "/blog" },
  { label: "Templates", href: "/templates" },
  { label: "Jobs", disabled: true },
  { label: "Experts", disabled: true },
  { label: "Services", href: "/services" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 font-heading text-[1.15rem] font-extrabold tracking-[-0.025em] text-text">
      <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
      foodnme
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { open } = useConsultationModal();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openConsult = () => {
    setMobileOpen(false);
    open();
  };

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "sticky top-0 z-50 border-b bg-white transition-shadow",
        "after:absolute after:left-0 after:bottom-[-1px] after:h-0.5 after:w-[var(--reading-progress,0%)] after:bg-primary after:transition-[width] after:content-['']",
        scrolled ? "border-[#e0dcc8] shadow-[0_2px_12px_rgba(40,54,24,0.06)]" : "border-border",
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-content items-center justify-between px-6 lg:px-12">
        <Brand />

        <div className="hidden items-center gap-7 lg:flex">
          {NAV_ITEMS.map((item) =>
            item.disabled ? (
              <span
                key={item.label}
                aria-disabled="true"
                title="Coming soon"
                className="cursor-not-allowed font-body text-[0.88rem] font-medium text-muted-2 select-none"
              >
                {item.label}
              </span>
            ) : (
              <Link
                key={item.label}
                href={item.href!}
                className={cn(
                  "relative font-body text-[0.88rem] font-medium transition-colors",
                  isActive(pathname, item.href!)
                    ? "text-text after:absolute after:left-0 after:right-0 after:-bottom-[23px] after:h-0.5 after:bg-primary after:content-['']"
                    : "text-muted hover:text-text",
                )}
              >
                {item.label}
              </Link>
            ),
          )}
        </div>

        <div className="flex items-center gap-3.5">
          <Button onClick={openConsult} className="hidden rounded-[10px] px-5 py-2.5 lg:inline-flex">
            Get a Consultation
          </Button>
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-[38px] w-[38px] items-center justify-center rounded-sm border border-border text-text lg:hidden"
          >
            <Icon name={mobileOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-border bg-background px-6 py-4 lg:hidden">
          {NAV_ITEMS.map((item) =>
            item.disabled ? (
              <span
                key={item.label}
                aria-disabled="true"
                className="block cursor-not-allowed border-b border-border py-3 text-base text-muted-2"
              >
                {item.label} <span className="text-[0.7rem] uppercase tracking-wide">· soon</span>
              </span>
            ) : (
              <Link
                key={item.label}
                href={item.href!}
                onClick={() => setMobileOpen(false)}
                className="block border-b border-border py-3 text-base text-text"
              >
                {item.label}
              </Link>
            ),
          )}
          <Button onClick={openConsult} className="mt-4 w-full rounded-[10px]">
            Get a Consultation
          </Button>
        </div>
      ) : null}
    </nav>
  );
}
