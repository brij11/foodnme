import { createPublicClient } from "@/lib/supabase/public";

/** A template/resource row as the listing + cards + in-article CTA need it. */
export type Resource = {
  title: string;
  slug: string;
  description: string;
  category: string;
  file_type: string;
  is_free: boolean;
  download_count: number;
};

const RESOURCE_COLUMNS = "title, slug, description, category, file_type, is_free, download_count";

/**
 * A single resource (template) by slug, or null if it does not exist. Used by the blog-05
 * in-article CTA box to resolve `articles.related_resource_slug` → `/templates/[slug]`,
 * and reused by the templates topic (templates-01/02/03).
 */
export async function getResourceBySlug(slug: string): Promise<Resource | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("resources")
    .select(RESOURCE_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getResourceBySlug failed: ${error.message}`);
  return (data as Resource | null) ?? null;
}
