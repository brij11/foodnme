import { z } from "zod";
import { JOB_TYPES, EXPERIENCE_LEVELS } from "@/lib/jobs";

/** POST /api/jobs body (TECHNICAL-REQUIREMENTS.md §6.2, story-jobs-03). */
export const jobSchema = z
  .object({
    title: z.string().trim().min(1, "Enter a job title."),
    company_name: z.string().trim().min(1, "Enter the company name."),
    location: z.string().trim().min(1, "Enter a location."),
    job_type: z.enum(JOB_TYPES),
    salary_min: z.coerce.number().int().min(0).max(100000000).nullable().optional(),
    salary_max: z.coerce.number().int().min(0).max(100000000).nullable().optional(),
    experience_level: z.enum(EXPERIENCE_LEVELS),
    description: z.string().trim().min(50, "Describe the role — at least 50 characters."),
    // Structured fields (story-jobs-09) — optional + back-compatible with description-only posts.
    responsibilities: z.array(z.string().trim().min(1)).max(20).optional().default([]),
    requirements: z.array(z.string().trim().min(1)).max(20).optional().default([]),
    is_featured: z.boolean().optional().default(false),
    skills: z.array(z.string().trim().min(1)).max(20),
    expires_at: z.coerce.date(),
    turnstile_token: z.string().min(1, "Verification required."),
  })
  .refine((d) => d.salary_min == null || d.salary_max == null || d.salary_max >= d.salary_min, {
    message: "Maximum salary must be at least the minimum.",
    path: ["salary_max"],
  })
  .refine((d) => d.expires_at.getTime() > Date.now(), {
    message: "Expiry must be in the future.",
    path: ["expires_at"],
  });

export type JobInput = z.infer<typeof jobSchema>;
