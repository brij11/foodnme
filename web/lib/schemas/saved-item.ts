import { z } from "zod";

export const SAVED_ITEM_TYPES = ["job", "expert"] as const;

/** Body for POST/DELETE /api/saved-items (TECHNICAL-REQUIREMENTS.md §6.2, story-jobs-15/OQ#12). */
export const savedItemSchema = z.object({
  item_type: z.enum(SAVED_ITEM_TYPES),
  item_id: z.string().uuid("Invalid item id."),
});

export type SavedItemInput = z.infer<typeof savedItemSchema>;
