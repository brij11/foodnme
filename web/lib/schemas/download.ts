import { z } from "zod";

/**
 * POST /api/download body (TECHNICAL-REQUIREMENTS.md §6.2).
 * `template_id` is the `resources.id` UUID; `email` is optional (download is never gated).
 */
export const downloadSchema = z.object({
  template_id: z.string().uuid("A valid template id is required."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").optional(),
});

export type DownloadInput = z.infer<typeof downloadSchema>;
