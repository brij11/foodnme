import { z } from "zod";
import { ARTICLE_CATEGORIES } from "@/lib/categories";

const CATEGORY_SLUGS = ARTICLE_CATEGORIES.map((c) => c.slug) as [string, ...string[]];

/**
 * Admin article create payload — `POST /api/admin/articles` (TECHNICAL-REQUIREMENTS.md §6, §4.2).
 * Authorship is the linked expert (OQ#9 / story-blog-06): the payload takes `expert_id` in place
 * of the dropped free-text `author_name`. The referenced expert must be an active expert row.
 *
 * NOTE: the admin article CRUD *route* is a later admin-surface story; this schema is the
 * authorship contract it will consume, and is unit-tested here so `expert_id` is locked in.
 */
export const articleSchema = z.object({
  title: z.string().trim().min(1, "Enter a title."),
  slug: z
    .string()
    .trim()
    .min(1, "Enter a slug.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated."),
  excerpt: z.string().trim().max(400).default(""),
  content_mdx: z.string().min(1, "Article body is required."),
  category: z.enum(CATEGORY_SLUGS),
  tags: z.array(z.string().trim().min(1)).max(20).default([]),
  cover_image_url: z.string().url().nullable().optional(),
  expert_id: z.string().uuid("Select an author (expert)."),
  read_time_mins: z.coerce.number().int().min(1).max(120).default(5),
  is_published: z.boolean().default(false),
  related_resource_slug: z.string().trim().min(1).nullable().optional(),
});

export type ArticleInput = z.infer<typeof articleSchema>;

/** Admin article update payload — `PATCH /api/admin/articles/:id`. All fields optional (partial). */
export const articleUpdateSchema = articleSchema.partial();

export type ArticleUpdateInput = z.infer<typeof articleUpdateSchema>;
