import type { z } from "zod";

import type {
  educationSchema,
  profileInputSchema,
  profileSchema,
} from "@/lib/schemas/profile";

export type Education = z.infer<typeof educationSchema>;
export type ProfileInput = z.infer<typeof profileInputSchema>;
export type Profile = z.infer<typeof profileSchema>;
