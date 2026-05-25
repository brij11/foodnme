"use client";

import Link from "next/link";
import { NewsletterBanner } from "@/components/newsletter/NewsletterBanner";
import { useFooterNewsletter } from "./FooterNewsletterContext";

// Footer columns: Brand · Explore · Topics · Contact (UI-DESIGN-HANDOFF.md §2.2).
const EXPLORE = [
  { label: "Knowledge Hub", href: "/blog" },
  { label: "Templates", href: "/templates" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
];
const TOPICS = [
  { label: "Food Safety", slug: "food-safety" },
  { label: "Quality Control", slug: "quality-control" },
  { label: "Regulatory", slug: "regulatory" },
  { label: "Processing", slug: "processing" },
];

const colHeading = "font-heading text-[0.72rem] font-bold uppercase tracking-[0.1em] text-text mb-4";
const colLink = "block py-1.5 font-body text-[0.88rem] text-muted transition-colors hover:text-primary";

export function Footer() {
  const { hasFullBanner } = useFooterNewsletter();

  return (
    <footer className="mt-20 border-t border-border bg-white pb-7 pt-14">
      <div className="mx-auto max-w-content px-6 lg:px-12">
        {!hasFullBanner ? (
          <div className="mb-12 max-w-sm">
            <NewsletterBanner mini source="footer" suppressesFooterNewsletter={false} />
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2 font-heading text-[1.35rem] font-extrabold tracking-[-0.025em] text-text">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
              foodnme
            </Link>
            <p className="mt-3.5 max-w-[320px] font-body text-[0.9rem] leading-relaxed text-muted">
              Practical resources for a safer food ecosystem. Built for food technology
              professionals across India and beyond.
            </p>
          </div>

          <nav aria-label="Explore">
            <h2 className={colHeading}>Explore</h2>
            {EXPLORE.map((l) => (
              <Link key={l.href} href={l.href} className={colLink}>
                {l.label}
              </Link>
            ))}
          </nav>

          <nav aria-label="Topics">
            <h2 className={colHeading}>Topics</h2>
            {TOPICS.map((t) => (
              <Link key={t.slug} href={`/blog/category/${t.slug}`} className={colLink}>
                {t.label}
              </Link>
            ))}
          </nav>

          <div>
            <h2 className={colHeading}>Contact</h2>
            <a href="mailto:hello@foodnme.in" className={colLink}>
              hello@foodnme.in
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className={colLink}>
              LinkedIn
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 font-body text-[0.78rem] text-muted md:flex-row">
          <span>© 2026 foodnme. All rights reserved.</span>
          <span>Made for the food-tech community in India.</span>
        </div>
      </div>
    </footer>
  );
}
