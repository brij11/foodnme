import { z } from "zod";

/** PATCH /api/experts/:id/availability body (story-experts-06). */
export const availabilitySchema = z.object({
  is_available: z.boolean(),
});

export type AvailabilityInput = z.infer<typeof availabilitySchema>;
