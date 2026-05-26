import { z } from "zod";

/** "Send reset link" request form (story-auth-04). */
export const resetRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});
export type ResetRequestInput = z.infer<typeof resetRequestSchema>;

/** New-password (confirm) form — min-8 per §5.1, with a matching confirmation field. */
export const resetConfirmSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters."),
    confirm: z.string().min(1, "Re-enter your password."),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match.",
    path: ["confirm"],
  });
export type ResetConfirmInput = z.infer<typeof resetConfirmSchema>;
