import type { TagVariant } from "@/components/ui/Tag";

/**
 * Category taxonomy + tag-color rotation (UI-DESIGN-HANDOFF.md §1.2). Shared by the blog
 * listing, category pages, cards, and footer so the rotation never drifts between surfaces.
 */
export type Category = { slug: string; label: string; tag: TagVariant };

export const ARTICLE_CATEGORIES: readonly Category[] = [
  { slug: "food-safety", label: "Food Safety", tag: "green" },
  { slug: "quality-control", label: "Quality Control", tag: "safe" },
  { slug: "regulatory", label: "Regulatory", tag: "orange" },
  { slug: "processing", label: "Processing", tag: "neutral" },
  { slug: "industry-insights", label: "Industry Insights", tag: "accent" },
];

export const TEMPLATE_CATEGORIES: readonly Category[] = [
  { slug: "haccp", label: "HACCP", tag: "green" },
  { slug: "audit-checklists", label: "Audit Checklists", tag: "safe" },
  { slug: "sop-templates", label: "SOP Templates", tag: "neutral" },
  { slug: "qc-inspection", label: "QC Inspection", tag: "orange" },
  { slug: "compliance-docs", label: "Compliance Docs", tag: "accent" },
];

function lookup(list: readonly Category[], slug: string): Category | undefined {
  return list.find((c) => c.slug === slug);
}

export function articleCategory(slug: string): Category | undefined {
  return lookup(ARTICLE_CATEGORIES, slug);
}
export function templateCategory(slug: string): Category | undefined {
  return lookup(TEMPLATE_CATEGORIES, slug);
}
export function articleCategoryLabel(slug: string): string {
  return articleCategory(slug)?.label ?? slug;
}
export function templateCategoryLabel(slug: string): string {
  return templateCategory(slug)?.label ?? slug;
}
export function articleTagVariant(slug: string): TagVariant {
  return articleCategory(slug)?.tag ?? "green";
}
export function templateTagVariant(slug: string): TagVariant {
  return templateCategory(slug)?.tag ?? "green";
}
