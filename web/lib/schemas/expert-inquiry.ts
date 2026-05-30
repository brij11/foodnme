import { z } from "zod";

export const ENGAGEMENT_KINDS = ["hourly", "project", "retainer"] as const;

/** POST /api/expert-inquiry body (TECHNICAL-REQUIREMENTS.md §6.2, story-experts-03 / -11). */
export const expertInquirySchema = z.object({
  expert_id: z.string().uuid("Unknown expert."),
  full_name: z.string().trim().min(1, "Enter your name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  // Optional context captured for the expert's dashboard inbox (story-experts-11).
  company_name: z.string().trim().max(120).optional().or(z.literal("")),
  engagement_type: z.enum(ENGAGEMENT_KINDS).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(20, "Tell us a bit more — at least 20 characters.")
    .max(2000, "Keep your message under 2000 characters."),
  turnstile_token: z.string().min(1, "Verification required."),
});

export const EXPERT_INQUIRY_FIELDS = ["full_name", "email", "message"] as const;
export type ExpertInquiryInput = z.infer<typeof expertInquirySchema>;
