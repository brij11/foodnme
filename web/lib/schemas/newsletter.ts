import { z } from "zod";

/** POST /api/newsletter body (TECHNICAL-REQUIREMENTS.md §6.2). */
export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  source: z.string().min(1).default("unknown"),
  turnstile_token: z.string().min(1, "Verification required."),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
