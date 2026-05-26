import { z } from "zod";

/** POST /api/applications body (TECHNICAL-REQUIREMENTS.md §6.2, story-jobs-06). */
export const applicationSchema = z.object({
  job_id: z.string().uuid("Unknown job."),
  resume_url: z.string().url("A resume upload is required."),
  cover_note: z.string().max(2000, "Keep your cover note under 2000 characters."),
  turnstile_token: z.string().min(1, "Verification required."),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
