import type { IconName } from "@/components/ui/Icon";

/**
 * Canonical Sprint-1 consulting services (UI-DESIGN-HANDOFF.md §4.1, blueprint §8 Screen 7).
 * The `slug` set is the single source of truth for the `service_needed` value used by the
 * services inquiry form (services-02) and the consultation modal (services-04) — keep them
 * in sync. `overline` is the dark-olive eyebrow shown above each card's name.
 */
export type Service = {
  slug: string;
  name: string;
  short: string;
  icon: IconName;
  overline: string;
};

export const SERVICES: readonly Service[] = [
  {
    slug: "fssai-compliance",
    name: "FSSAI Compliance",
    short: "License, renewals, and category-specific compliance support.",
    icon: "shield",
    overline: "Compliance",
  },
  {
    slug: "haccp-development",
    name: "HACCP Development",
    short: "End-to-end HACCP plan development with audit-ready documentation.",
    icon: "clipboard",
    overline: "Food Safety",
  },
  {
    slug: "food-safety-docs",
    name: "Food Safety Documentation",
    short: "SOPs, work instructions, and record systems that auditors expect.",
    icon: "file",
    overline: "Documentation",
  },
  {
    slug: "product-development",
    name: "Product Development Guidance",
    short: "Formulation, shelf-life, scale-up — with regulatory checkpoints baked in.",
    icon: "flask",
    overline: "R&D",
  },
  {
    slug: "qms-setup",
    name: "QMS Setup",
    short: "Quality Management System design aligned to GFSI-recognized schemes.",
    icon: "layers",
    overline: "Quality Systems",
  },
  {
    slug: "audit-preparation",
    name: "Audit Preparation & Support",
    short: "Mock audits, gap analysis, and on-site support during certification.",
    icon: "check",
    overline: "Audits",
  },
];

/** Valid `service_needed` slugs (services-02 / services-04 inquiry validation). */
export const SERVICE_SLUGS = SERVICES.map((s) => s.slug) as [string, ...string[]];

export function serviceName(slug: string): string {
  return SERVICES.find((s) => s.slug === slug)?.name ?? slug;
}
