import { CTABox } from "@/components/blog/mdx/CTABox";
import type { Resource } from "@/lib/resources";

/**
 * In-article CTA box (blog-05 AC#1/#2): surface-light card that links the reader to the
 * template resolved from `articles.related_resource_slug`. Render this only when the slug
 * resolved to a real resource — the caller passes `null` otherwise and nothing renders, so
 * there is never an empty card.
 */
export function ArticleTemplateCTA({ resource }: { resource: Resource | null }) {
  if (!resource) return null;
  return (
    <div className="mx-auto max-w-article">
      <CTABox
        title={resource.title}
        body={resource.description}
        ctaText="Get the template →"
        ctaHref={`/templates/${resource.slug}`}
      />
    </div>
  );
}
