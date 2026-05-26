import { z } from "zod";
import { SERVICE_SLUGS } from "@/lib/services";

/**
 * Services inquiry body (TECHNICAL-REQUIREMENTS.md §6.1/§6.2). Shared by the services-page
 * `InquiryForm` (services-02) and the `POST /api/inquiry` route (services-03). `service_needed`
 * is constrained to the canonical service slugs from `lib/services.ts`.
 */
export const inquirySchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().toLowerCase().email("Enter a valid business email."),
  company_name: z.string().trim().min(1, "Company name is required."),
  service_needed: z.enum(SERVICE_SLUGS, { message: "Please select a service." }),
  message: z
    .string()
    .trim()
    .min(20, "Please share at least a sentence or two (20+ characters)."),
  turnstile_token: z.string().min(1, "Verification required."),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

/** The user-editable fields (everything the form collects except the Turnstile token). */
export const INQUIRY_FIELDS = ["full_name", "email", "company_name", "service_needed", "message"] as const;
