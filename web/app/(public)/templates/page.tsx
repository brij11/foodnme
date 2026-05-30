import type { Metadata } from "next";
import { listResources, getTemplateCategoryCounts } from "@/lib/resources";
import { TEMPLATE_CATEGORIES, templateCategoryLabel } from "@/lib/categories";
import { PageHeader } from "@/components/listing/PageHeader";
import { ListingShell } from "@/components/listing/ListingShell";
import { ListingSidebar, type SidebarCategory, type SidebarFacet } from "@/components/listing/ListingSidebar";
import { TemplateGrid } from "@/components/templates/TemplateGrid";
import { EmptyState } from "@/components/listing/EmptyState";

const FILE_FORMATS = [
  { value: "pdf", label: "PDF" },
  { value: "docx", label: "DOCX" },
];

/** Build a /templates URL preserving the active category + the given format set. */
function templatesHref(category: string | undefined, formats: string[]): string {
  const p = new URLSearchParams();
  if (category && category !== "all") p.set("category", category);
  for (const f of [...formats].sort()) p.append("format", f);
  const qs = p.toString();
  return qs ? `/templates?${qs}` : "/templates";
}

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

type SearchParams = { category?: string | string[]; format?: string | string[] };

export default async function TemplatesPage({ searchParams }: { searchParams: SearchParams }) {
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const activeSlug = category ?? "all";

  // Active file formats (story-templates-04) from ?format= (repeatable), constrained to PDF/DOCX.
  const rawFormats = Array.isArray(searchParams.format)
    ? searchParams.format
    : searchParams.format
      ? [searchParams.format]
      : [];
  const formats = FILE_FORMATS.map((f) => f.value).filter((v) => rawFormats.includes(v));

  const [templates, counts] = await Promise.all([
    listResources({ category, formats }),
    getTemplateCategoryCounts(),
  ]);

  const sidebarCategories: SidebarCategory[] = [
    { slug: "all", label: "All" },
    ...TEMPLATE_CATEGORIES.map((c) => ({ slug: c.slug, label: c.label })),
  ].map((c) => ({
    slug: c.slug,
    label: c.label,
    count: counts[c.slug] ?? 0,
    // Category links preserve the active format filter.
    href: templatesHref(c.slug, formats),
    active: activeSlug === c.slug,
  }));

  // File-format facet — each option toggles itself in/out of the URL, preserving category.
  const formatFacet: SidebarFacet = {
    title: "File format",
    options: FILE_FORMATS.map((f) => {
      const active = formats.includes(f.value);
      const next = active ? formats.filter((v) => v !== f.value) : [...formats, f.value];
      return { value: f.value, label: f.label, href: templatesHref(category, next), active };
    }),
  };

  // §3.5: no mini-newsletter in the templates sidebar (that slot is blog/category only).
  const sidebar = (
    <ListingSidebar
      searchType="templates"
      searchPlaceholder="Search templates…"
      categories={sidebarCategories}
      facet={formatFacet}
      clearHref="/templates"
    />
  );

  const formatLabel =
    formats.length > 0 ? ` · ${formats.map((v) => v.toUpperCase()).join(" / ")}` : "";

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
            {formatLabel}
          </p>
        </div>

        {templates.length > 0 ? (
          <TemplateGrid key={`${activeSlug}-${formats.join(",")}`} templates={templates} />
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
