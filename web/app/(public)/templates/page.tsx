import type { Metadata } from "next";
import { listResources, getTemplateCategoryCounts } from "@/lib/resources";
import { TEMPLATE_CATEGORIES, templateCategoryLabel } from "@/lib/categories";
import { PageHeader } from "@/components/listing/PageHeader";
import { ListingShell } from "@/components/listing/ListingShell";
import { ListingSidebar, type SidebarCategory } from "@/components/listing/ListingSidebar";
import { TemplateGrid } from "@/components/templates/TemplateGrid";
import { EmptyState } from "@/components/listing/EmptyState";

export const metadata: Metadata = {
  title: "Templates & Checklists — foodnme",
  description:
    "Download ready-to-use HACCP plans, audit checklists, SOPs, and compliance documents — built by practitioners, audited in the field.",
  openGraph: {
    title: "Templates & Checklists — foodnme",
    description: "Audit-ready HACCP plans, checklists, SOPs, and compliance templates for food-tech teams.",
    type: "website",
  },
};

type SearchParams = { category?: string | string[] };

export default async function TemplatesPage({ searchParams }: { searchParams: SearchParams }) {
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const activeSlug = category ?? "all";

  const [templates, counts] = await Promise.all([
    listResources({ category }),
    getTemplateCategoryCounts(),
  ]);

  const sidebarCategories: SidebarCategory[] = [
    { slug: "all", label: "All" },
    ...TEMPLATE_CATEGORIES.map((c) => ({ slug: c.slug, label: c.label })),
  ].map((c) => ({
    slug: c.slug,
    label: c.label,
    count: counts[c.slug] ?? 0,
    href: c.slug === "all" ? "/templates" : `/templates?category=${c.slug}`,
    active: activeSlug === c.slug,
  }));

  // §3.5: no mini-newsletter in the templates sidebar (that slot is blog/category only).
  const sidebar = (
    <ListingSidebar
      searchType="templates"
      searchPlaceholder="Search templates…"
      categories={sidebarCategories}
      clearHref="/templates"
    />
  );

  return (
    <div className="mx-auto max-w-content px-6 lg:px-12">
      <PageHeader
        overline="Templates & Resources"
        title="Templates & Checklists"
        sub="Download ready-to-use HACCP plans, audit checklists, SOPs, and compliance documents — built by practitioners, audited in the field."
      />

      <ListingShell sidebar={sidebar}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <p data-testid="result-count" className="font-body text-[0.85rem] text-muted">
            <strong className="font-semibold text-text">{templates.length}</strong>{" "}
            {templates.length === 1 ? "template" : "templates"}
            {activeSlug !== "all" ? ` in ${templateCategoryLabel(activeSlug)}` : ""}
          </p>
        </div>

        {templates.length > 0 ? (
          <TemplateGrid key={activeSlug} templates={templates} />
        ) : (
          <EmptyState
            variant="filter"
            title="No templates match your filters"
            message="Try clearing a filter or broadening your search — we add new templates every month."
            action={{ label: "Clear filters", href: "/templates" }}
          />
        )}
      </ListingShell>
    </div>
  );
}
