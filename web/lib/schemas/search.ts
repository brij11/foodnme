import { z } from "zod";

export const SEARCH_TYPES = ["all", "articles", "templates", "experts"] as const;
export type SearchType = (typeof SEARCH_TYPES)[number];

/** GET /api/search query (TECHNICAL-REQUIREMENTS.md §6.2, story-search-01). */
export const searchQuerySchema = z.object({
  q: z.string().trim().max(120).default(""),
  type: z.enum(SEARCH_TYPES).default("all"),
});

export type SearchResult = {
  type: "article" | "template" | "expert";
  id: string;
  title: string;
  excerpt: string;
  url: string;
  rank: number;
};

/** A query shorter than this returns a clean empty result rather than hitting FTS. */
export const MIN_SEARCH_LEN = 2;
