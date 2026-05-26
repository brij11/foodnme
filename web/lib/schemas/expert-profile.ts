import { z } from "zod";

/**
 * Expert profile create/edit (story-experts-04). `hourly_rate` is optional; arrays are bounded.
 * `experience_years`/`hourly_rate` use coercion so the dashboard's text inputs parse cleanly.
 */
export const expertProfileSchema = z.object({
  full_name: z.string().trim().min(1, "Enter your name."),
  title: z.string().trim().min(1, "Enter your professional title."),
  bio: z
    .string()
    .trim()
    .min(20, "Tell visitors about your work — at least 20 characters.")
    .max(2000, "Keep your bio under 2000 characters."),
  specializations: z
    .array(z.string().trim().min(1))
    .min(1, "Pick at least one specialization.")
    .max(12),
  experience_years: z.coerce.number().int().min(0).max(60),
  hourly_rate: z.coerce.number().int().min(0).max(100000).nullable().optional(),
  certifications: z.array(z.string().trim().min(1)).max(20),
  location: z.string().trim().min(1, "Where are you based?"),
  contact_email: z.string().trim().toLowerCase().email("Enter a valid contact email."),
});

export type ExpertProfileInput = z.infer<typeof expertProfileSchema>;

/**
 * Editing any of these re-bounces the profile to `status='pending'` for re-approval
 * (story-experts-04). Cosmetic/operational fields (location, hourly_rate, contact_email,
 * availability) do not.
 */
export const MATERIAL_FIELDS = [
  "full_name",
  "title",
  "bio",
  "specializations",
  "certifications",
] as const;

/** True if any material field differs between the current row and the incoming edit. */
export function hasMaterialChange(
  current: Record<string, unknown>,
  next: ExpertProfileInput,
): boolean {
  for (const f of MATERIAL_FIELDS) {
    const a = current[f];
    const b = (next as Record<string, unknown>)[f];
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length || a.some((v, i) => v !== b[i])) return true;
    } else if (a !== b) {
      return true;
    }
  }
  return false;
}
