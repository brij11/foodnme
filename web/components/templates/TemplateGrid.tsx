import { TemplateCard } from "./TemplateCard";
import type { Resource } from "@/lib/resources";

/**
 * 2-column template grid with staggered entry (UI-DESIGN-HANDOFF.md §4.10: 80ms/child,
 * reduced-motion respected). The caller passes a `key` (the active category) so a filter
 * change remounts the grid and re-runs the stagger — same pattern as `ArticleGrid`.
 */
export function TemplateGrid({ templates }: { templates: Resource[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {templates.map((template, i) => (
        <div
          key={template.slug}
          className="motion-reduce:animate-none animate-fade-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <TemplateCard template={template} />
        </div>
      ))}
    </div>
  );
}
