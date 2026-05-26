import { z } from "zod";

/** Application roles selected at signup (TECHNICAL-REQUIREMENTS.md §5.2). */
export const REGISTER_ROLES = ["seeker", "employer", "expert"] as const;
export type RegisterRole = (typeof REGISTER_ROLES)[number];

export const ROLE_OPTIONS: { value: RegisterRole; title: string; desc: string }[] = [
  { value: "seeker", title: "Job Seeker", desc: "Apply to roles, save jobs, get alerts." },
  { value: "employer", title: "Employer", desc: "Post jobs, manage applicants, hire." },
  { value: "expert", title: "Expert", desc: "Showcase your profile, take engagements." },
];

/**
 * Registration form validation (story-auth-02). Password min-8 per §5.1. `role` is a strict
 * enum — an empty/unknown value fails, which the form surfaces as "Pick a role to continue."
 */
export const registerSchema = z.object({
  full_name: z.string().trim().min(1, "Enter your full name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
  role: z.enum(REGISTER_ROLES),
});

export type RegisterInput = z.infer<typeof registerSchema>;
