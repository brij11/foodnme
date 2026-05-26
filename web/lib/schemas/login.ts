import { z } from "zod";

/**
 * Login form validation (story-auth-01). Email format is enforced client-side; the
 * password is only required to be non-empty here — credential strength is Supabase's
 * concern at sign-in (min-length is enforced at registration, §5.1 / story-auth-02).
 */
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export type LoginInput = z.infer<typeof loginSchema>;
