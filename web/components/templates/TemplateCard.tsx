import Link from "next/link";
import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { templateCategoryLabel, templateTagVariant } from "@/lib/categories";
import type { Resource } from "@/lib/resources";
import { TemplateDownloadButton } from "./TemplateDownloadButton";

/**
 * Template card (UI-DESIGN-HANDOFF.md §3.2): the whole card is a link to the detail page (a
 * "stretched link" overlay), with a round download icon-button in the top-right corner. Shows
 * the category tag (color rotation §1.2) + file-format badge, title, 2-line description, and a
 * footer of "{download_count} downloads" + a "View →" affordance whose arrow grows on hover.
 * No "Free" badge (§4.2), and no page-count (the `resources` table has no such column).
 */
export function TemplateCard({ template }: { template: Resource }) {
  return (
    <article className="group relative flex flex-col gap-3 rounded-lg border border-border bg-card-bg p-5 transition hover:-translate-y-[2px] hover:border-[#d8d3bf] hover:shadow-card">
      {/* Stretched link: the whole card navigates to the detail page. */}
      <Link
        href={`/templates/${template.slug}`}
        aria-label={`View ${template.title}`}
        className="absolute inset-0 z-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Tag variant={templateTagVariant(template.category)}>{templateCategoryLabel(template.category)}</Tag>
          <Badge>{template.file_type.toUpperCase()}</Badge>
        </div>
        <TemplateDownloadButton templateId={template.id} title={template.title} />
      </div>

      <h3 className="relative z-10 font-heading text-[1.05rem] font-bold leading-tight tracking-[-0.01em] text-text">
        {template.title}
      </h3>
      <p className="relative z-10 line-clamp-2 font-body text-[0.86rem] leading-relaxed text-muted">
        {template.description}
      </p>

      <div className="relative z-10 mt-auto flex items-center justify-between border-t border-border pt-3.5 font-body text-[0.76rem] text-muted">
        <span className="tabular-nums">{template.download_count.toLocaleString()} downloads</span>
        <span className="inline-flex items-center gap-1 font-medium text-primary">
          View
          <span className="transition-transform group-hover:translate-x-0.5">
            <Icon name="arrow" size={12} stroke={2.4} />
          </span>
        </span>
      </div>
    </article>
  );
}
